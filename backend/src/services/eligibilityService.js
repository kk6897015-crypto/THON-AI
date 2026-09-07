import axios from 'axios';
import { config } from '../config.js';

export async function runEligibilityAndCompletenessCheck({
  eligibility_raw_text,
  team,
  idea_brief,
  deck
}) {
  const memberCount = team?.members?.length || 1;
  const colleges = Array.from(new Set(team?.members?.map(m => m.college).filter(Boolean)));
  const years = Array.from(new Set(team?.members?.map(m => m.year_of_study).filter(Boolean)));

  const text = eligibility_raw_text || '';

  // Default diagnostic rule evaluation logic
  const eligibilityChecklist = [];

  // 1. Team Size Rule Parsing
  const maxMatch = text.match(/max(?:imum)?\s*(\d+)\s*members?/i) || text.match(/up\s*to\s*(\d+)\s*members?/i);
  const minMatch = text.match(/min(?:imum)?\s*(\d+)\s*members?/i) || text.match(/at\s*least\s*(\d+)\s*members?/i);
  
  const maxAllowed = maxMatch ? parseInt(maxMatch[1], 10) : 5;
  const minAllowed = minMatch ? parseInt(minMatch[1], 10) : 1;

  if (memberCount >= minAllowed && memberCount <= maxAllowed) {
    eligibilityChecklist.push({
      rule_text: maxMatch ? maxMatch[0] : (minMatch ? minMatch[0] : 'Team size requirements'),
      status: 'met',
      notes: `Current team size is ${memberCount} members (Allowed: ${minAllowed}-${maxAllowed}).`
    });
  } else {
    eligibilityChecklist.push({
      rule_text: maxMatch ? maxMatch[0] : (minMatch ? minMatch[0] : 'Team size requirements'),
      status: 'missing',
      notes: `Current team size of ${memberCount} is outside allowed range (${minAllowed}-${maxAllowed}).`
    });
  }

  // 2. Student Status / Education Check
  const studentReq = /undergrad|postgrad|student|enrolled/i.test(text);
  if (studentReq) {
    const allHaveCollege = team?.members?.every(m => m.college && m.college.trim().length > 0);
    eligibilityChecklist.push({
      rule_text: 'Enrolled student status requirement',
      status: allHaveCollege ? 'met' : 'borderline',
      notes: allHaveCollege
        ? 'All team members have verified college profiles.'
        : 'Some team members have missing college credentials in profile.'
    });
  } else {
    eligibilityChecklist.push({
      rule_text: 'Student status requirement',
      status: 'met',
      notes: 'No strict student status restriction specified.'
    });
  }

  // 3. Region / College Restriction
  const regionReq = /inter-college|same college|national|state/i.test(text);
  if (regionReq) {
    const isSingleCollege = colleges.length <= 1;
    eligibilityChecklist.push({
      rule_text: 'College affiliation / Inter-college policy',
      status: isSingleCollege ? 'met' : 'borderline',
      notes: isSingleCollege
        ? `All members from ${colleges[0] || 'same institution'}.`
        : `Multi-institutional team (${colleges.join(', ')}). Check specific event rules.`
    });
  }

  // 4. Domain & Theme Match Check
  const hasIdea = Boolean(idea_brief && idea_brief.problem && idea_brief.solution);
  eligibilityChecklist.push({
    rule_text: 'Domain / Theme Submission Alignment',
    status: hasIdea ? 'met' : 'missing',
    notes: hasIdea
      ? `Idea brief submitted: ${idea_brief.problem.substring(0, 60)}...`
      : 'No idea brief provided for theme alignment check.'
  });

  // SUBMISSION COMPLETENESS CHECK
  const requiredSections = [
    { name: 'Problem Statement', key: 'problem' },
    { name: 'Proposed Solution', key: 'solution' },
    { name: 'Tech Stack & Architecture', key: 'tech_stack' },
    { name: 'Novelty & Market Differentiator', key: 'novelty_notes' },
    { name: 'Pitch Deck Draft', key: 'deck' }
  ];

  const completeness = requiredSections.map(sec => {
    let exists = false;
    let detail = '';

    if (sec.key === 'deck') {
      exists = Boolean(deck && deck.draft_sections && deck.draft_sections.length > 0);
      detail = exists ? `${deck.draft_sections.length} slides drafted` : 'No deck generated yet';
    } else {
      exists = Boolean(idea_brief && idea_brief[sec.key] && idea_brief[sec.key].trim().length > 10);
      detail = exists ? 'Section text provided' : 'Missing required text brief';
    }

    return {
      section_name: sec.name,
      status: exists ? 'met' : 'missing',
      notes: detail
    };
  });

  // AI-enhanced rules parser if Anthropic key is present
  if (config.anthropicApiKey && text.length > 30) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `Parse the following hackathon/competition eligibility text and output a JSON array of specific rules with status (met, missing, borderline) and notes based on Team Info:
Members Count: ${memberCount}, Colleges: ${colleges.join(', ')}, Years: ${years.join(', ')}.

Rules Text: "${text.substring(0, 1500)}"

Return ONLY valid JSON format: [{"rule_text": "...", "status": "met|missing|borderline", "notes": "..."}]`
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

      const aiText = response.data.content?.[0]?.text;
      if (aiText) {
        const jsonMatch = aiText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const aiParsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(aiParsed) && aiParsed.length > 0) {
            return {
              checklist: aiParsed,
              completeness,
              ai_enhanced: true
            };
          }
        }
      }
    } catch (err) {
      console.warn('AI eligibility parse fallback to heuristic:', err.message);
    }
  }

  return {
    checklist: eligibilityChecklist,
    completeness,
    ai_enhanced: false
  };
}
