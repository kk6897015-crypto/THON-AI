import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
import { config } from '../config.js';
import { RUBRIC_KNOWLEDGE_BASE } from './rubricKnowledgeBase.js';

export async function parseAndCheckPptx(fileBuffer, { event_type = 'mlh_hackathon', eligibility_raw_text = '' } = {}) {
  let slideCount = 0;
  const slideTextArray = [];
  const rawText = eligibility_raw_text || '';

  try {
    const zip = new AdmZip(fileBuffer);
    const zipEntries = zip.getEntries();
    const parser = new XMLParser({ ignoreAttributes: false });

    // Filter slide XML entries e.g., ppt/slides/slide1.xml
    const slideEntries = zipEntries.filter(entry =>
      entry.entryName.startsWith('ppt/slides/slide') && entry.entryName.endsWith('.xml')
    );

    slideCount = slideEntries.length;

    slideEntries.sort((a, b) => {
      const numA = parseInt(a.entryName.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
      const numB = parseInt(b.entryName.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
      return numA - numB;
    });

    slideEntries.forEach((entry, idx) => {
      const xmlContent = entry.getData().toString('utf8');
      const jsonObj = parser.parse(xmlContent);

      // Extract all text nodes in slide XML
      const textMatches = xmlContent.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [];
      const extractedText = textMatches
        .map(t => t.replace(/<[^>]+>/g, '').trim())
        .filter(t => t.length > 0)
        .join(' ');

      const wordCount = extractedText.split(/\s+/).filter(Boolean).length;

      slideTextArray.push({
        slide_number: idx + 1,
        text: extractedText,
        word_count: wordCount
      });
    });
  } catch (err) {
    console.warn('PPTX zip parsing error:', err.message);
  }

  const fullDeckText = slideTextArray.map(s => s.text.toLowerCase()).join(' ');

  // TIER 1: DETERMINISTIC CHECKS
  const checklist = [];

  // Rule 1: Slide Count Limit Check
  let slideLimit = 12; // default fallback limit
  const limitMatch = rawText.match(/limit\s*(?:of)?\s*(\d+)\s*slides/i) || 
                     rawText.match(/max(?:imum)?\s*(\d+)\s*slides/i) ||
                     rawText.match(/(\d+)\s*slide\s*(?:deck|presentation|limit)/i);
  if (limitMatch) {
    slideLimit = parseInt(limitMatch[1], 10);
  }

  const slideCountPassed = slideCount > 0 && slideCount <= slideLimit;
  checklist.push({
    name: "Slide Count limit compliance",
    rule_text: limitMatch ? limitMatch[0] : `Recommended max ${slideLimit} slides`,
    passed: slideCountPassed,
    notes: slideCountPassed 
      ? `Success: Presentation has ${slideCount} slides (Limit: ${slideLimit}).`
      : `Warning: Presentation has ${slideCount} slides (Exceeds Limit: ${slideLimit}). Reduce slide count.`
  });

  // Rule 2: Word/text density check
  const denseSlides = slideTextArray.filter(s => s.word_count > 100).map(s => s.slide_number);
  const densityPassed = denseSlides.length === 0;
  checklist.push({
    name: "Slide text density readability",
    rule_text: "Slide word count should be under 100 words for optimal readability",
    passed: densityPassed,
    notes: densityPassed
      ? "Success: All slides are clean and readable."
      : `Warning: Slide(s) ${denseSlides.join(', ')} exceed 100 words. Format with short bullet points instead of full paragraphs.`
  });

  // Rule 3: Required Section Headers
  const sections = [
    { name: 'Problem Statement', keywords: ['problem', 'challenge', 'pain point', 'issue'] },
    { name: 'Solution Overview', keywords: ['solution', 'product', 'how it works', 'platform'] },
    { name: 'Tech Stack & Architecture', keywords: ['tech', 'technology', 'stack', 'ai', 'architecture', 'algorithm', 'system'] },
    { name: 'Market / Ask / Traction', keywords: ['market', 'impact', 'ask', 'roadmap', 'traction', 'future'] },
    { name: 'Team Profile', keywords: ['team', 'members', 'founders', 'who we are'] }
  ];

  sections.forEach(sec => {
    const present = sec.keywords.some(kw => fullDeckText.includes(kw));
    checklist.push({
      name: `Required Section: ${sec.name}`,
      rule_text: `Presentation should cover the ${sec.name} topic`,
      passed: present,
      notes: present
        ? `Success: Section keyword match found for "${sec.name}".`
        : `Warning: Missing "${sec.name}". Ensure you have a slide covering this topic.`
    });
  });

  // Rule 4: Mandatory Disclosures
  const hasCollege = /college|university|institute|school|ktr|srm|psg|vit|iit|nit/i.test(fullDeckText);
  checklist.push({
    name: "Mandatory college/institution disclosures",
    rule_text: "Presentation should mention team affiliation or college institution details",
    passed: hasCollege,
    notes: hasCollege
      ? "Success: Found mention of college/institution details."
      : "Warning: No college/institution name found. Add team member college name on intro/outro slide."
  });

  // TIER 2: DIAGNOSTIC (AI-assisted, explicitly non-authoritative)
  const rubric = RUBRIC_KNOWLEDGE_BASE[event_type] || RUBRIC_KNOWLEDGE_BASE.mlh_hackathon;
  let diagnosticFeedback = {};
  let aiEnhanced = false;

  if (config.anthropicApiKey && slideTextArray.length > 0) {
    try {
      const prompt = `Given these documented judging weights for event type "${rubric.name}":
${JSON.stringify(rubric.weights, null, 2)}

And the extracted slide texts from the presentation deck:
${JSON.stringify(slideTextArray, null, 2)}

Which sections of this deck look thin relative to what's weighted heavily?
Analyze slide count, text density, and section presence based on this rubric.
Provide qualitative evaluation comments for each rubric category. Do NOT return any overall score, percentage, or grade.

Return a JSON object matching this structure:
{
  "qualitative_feedback": {
    "Category Name Here": "Detailed critique and suggestions..."
  }
}`;

      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1200,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'x-api-key': config.anthropicApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          }
        }
      );

      const responseText = response.data.content?.[0]?.text;
      const jsonMatch = responseText && responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.qualitative_feedback) {
          diagnosticFeedback = parsed.qualitative_feedback;
          aiEnhanced = true;
        }
      }
    } catch (err) {
      console.warn('Claude AI diagnostic evaluation failed:', err.message);
    }
  }

  // Fallback to static heuristic advice if AI fails or key is missing
  if (!aiEnhanced) {
    Object.keys(rubric.weights).forEach(category => {
      let advice = "";
      if (category.includes("Technical") || category.includes("Execution")) {
        advice = "Ensure your system architecture diagram is clear and your complete tech stack (frontend, backend, database) is listed explicitly.";
      } else if (category.includes("Problem") || category.includes("Relevance")) {
        advice = "Verify you have detailed a specific pain point with quantitative validation (e.g. statistics or survey data).";
      } else if (category.includes("Innovation") || category.includes("Novelty") || category.includes("Creativity")) {
        advice = "Include a clear competitive matrix or matrix comparing your solution to existing academic/commercial works.";
      } else if (category.includes("Design") || category.includes("UX") || category.includes("Presentation")) {
        advice = "Break down paragraphs into clean visual points. Stagger text density to keep slides under 100 words.";
      } else {
        advice = "Ensure this category has dedicated slide space and addresses the judging criteria published by organizers.";
      }
      diagnosticFeedback[category] = advice;
    });
  }

  return {
    slide_count: slideCount,
    checklist,
    rubric_name: rubric.name,
    rubric_weights: rubric.weights,
    diagnostic_feedback: diagnosticFeedback,
    suggested_judge_questions: rubric.typical_judge_questions,
    ai_enhanced: aiEnhanced,
    disclaimer: "AI-generated structural suggestions ΓÇö not a score, not a prediction of outcome. Verify against the actual competition rules."
  };
}
