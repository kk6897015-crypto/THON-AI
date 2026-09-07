import pptxgen from 'pptxgenjs';
import axios from 'axios';
import { config } from '../config.js';

export async function generatePitchDeckOutline({ title, problem, solution, tech_stack, market_ask }) {
  let slides = [];

  if (config.anthropicApiKey) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1500,
          messages: [
            {
              role: 'user',
              content: `Create a 6-slide competition pitch deck outline for:
Title: ${title}
Problem: ${problem}
Solution: ${solution}
Tech Stack: ${tech_stack}
Market/Ask: ${market_ask}

Return JSON array:
[
  {
    "slide_number": 1,
    "title": "Title Slide",
    "bullets": ["..."],
    "speaker_notes": "...",
    "rewrite_checklist": ["Confirm team names", "Add high-res logo"]
  }
]`
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

      const text = response.data.content?.[0]?.text;
      const jsonMatch = text && text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        slides = JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.warn('AI pitch deck outline fallback:', err.message);
    }
  }

  // Fallback structured template slides if AI key not provided
  if (!slides || slides.length === 0) {
    slides = [
      {
        slide_number: 1,
        title: title || 'Project Pitch Deck',
        subtitle: 'AI-Generated First Draft ΓÇö Please rewrite before submission',
        bullets: [
          `Problem Domain: ${problem.substring(0, 80)}...`,
          `Tech Stack: ${tech_stack || 'React + Node.js'}`,
          'Team: Student Developer Collective'
        ],
        speaker_notes: 'Introduce your team briefly, state the project name clearly, and establish why this problem matters now.',
        rewrite_checklist: [
          'Replace boilerplate title with team custom tagline',
          'Add team member names, colleges, and GitHub links'
        ]
      },
      {
        slide_number: 2,
        title: 'The Core Problem',
        subtitle: 'Validation & Industry Impact',
        bullets: [
          `Current Pain Point: ${problem}`,
          'Existing workarounds are slow, disjointed, and manual',
          'High friction for users attempting to track deadlines & compliance'
        ],
        speaker_notes: 'Quantify the pain point if possible (e.g. 70% of student teams miss submission criteria due to complex PDF rules).',
        rewrite_checklist: [
          'Add 1 specific user quote or real-world survey data point',
          'Avoid generic bullet points; customize to target domain'
        ]
      },
      {
        slide_number: 3,
        title: 'The Solution & Architecture',
        subtitle: 'Product Demonstration & Technical Innovation',
        bullets: [
          `Proposed Solution: ${solution}`,
          `Tech Stack: ${tech_stack}`,
          'Automated validation engine with instant diagnostic response'
        ],
        speaker_notes: 'Highlight your unique technical secret sauce and demonstrate key user workflow step-by-step.',
        rewrite_checklist: [
          'Embed screenshot or system architecture diagram',
          'Explain why this tech stack choice beats legacy alternatives'
        ]
      },
      {
        slide_number: 4,
        title: 'Novelty & Competitive Edge',
        subtitle: 'Why Our Solution Stands Out',
        bullets: [
          'Automated rule parsing vs manual multi-page PDF reading',
          'Integrated pitch deck drafting + PPT structural linting',
          'Zero manual form-submission bot risk; compliant manual tracking'
        ],
        speaker_notes: 'Be precise about how your approach is different from existing academic or commercial tools.',
        rewrite_checklist: [
          'Verify novelty claims against Semantic Scholar search results',
          'Detail proprietary workflow advantages'
        ]
      },
      {
        slide_number: 5,
        title: 'Traction & Development Roadmap',
        subtitle: 'Milestones & Future Execution',
        bullets: [
          'Phase 1: Core MVP & Team Roster Module (Completed)',
          'Phase 2: Automated Eligibility & Novelty Search Engine (Current)',
          'Phase 3: Telegram Daily Push & Scaling Integration'
        ],
        speaker_notes: 'Show judges that your team has a clear execution timeline beyond the hackathon weekend.',
        rewrite_checklist: [
          'Update dates with real competition deadline countdowns',
          'List upcoming pilot test partners or student beta testers'
        ]
      },
      {
        slide_number: 6,
        title: 'Team & The Ask',
        subtitle: 'Why We Will Deliver',
        bullets: [
          `The Ask: ${market_ask || 'Mentorship, Pilot Partnering & Competition Advancement'}`,
          'Complementary Skills: Full-Stack Engineering, UI/UX Design, Product Strategy',
          'Contact: Team Leader Point-of-Contact'
        ],
        speaker_notes: 'End strong. Reiterate your commitment to building this project into a full production platform.',
        rewrite_checklist: [
          'Insert team member photos or GitHub handle badges',
          'Include explicit official contact phone/email'
        ]
      }
    ];
  }

  return slides;
}

// Generate PPTX file buffer using pptxgenjs
export async function exportDeckToPptxBuffer({ title, slides }) {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';

  // Define Ethereal Dark Theme Palette
  const BG_COLOR = '0A0A0A';
  const CARD_BG = '141414';
  const TEXT_MAIN = 'FFFFFF';
  const TEXT_MUTED = '9CA3AF';
  const ACCENT_CYAN = '00F0FF';
  const BORDER_COLOR = '262626';

  slides.forEach((slideData, idx) => {
    const slide = pptx.addSlide();

    // Dark background
    slide.background = { color: BG_COLOR };

    // Header Title
    slide.addText(slideData.title, {
      x: 0.8,
      y: 0.5,
      w: 8.4,
      h: 0.8,
      fontSize: 26,
      bold: true,
      color: TEXT_MAIN,
      fontFace: 'Arial'
    });

    // Subtitle
    if (slideData.subtitle) {
      slide.addText(slideData.subtitle, {
        x: 0.8,
        y: 1.2,
        w: 8.4,
        h: 0.4,
        fontSize: 14,
        color: ACCENT_CYAN,
        fontFace: 'Arial'
      });
    }

    // Double-Bezel Card Container for Bullets
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.8,
      w: 8.4,
      h: 4.2,
      fill: { color: CARD_BG },
      line: { color: BORDER_COLOR, width: 1 }
    });

    // Bullets
    const bulletTexts = (slideData.bullets || []).map(b => ({
      text: b,
      options: { fontSize: 14, color: TEXT_MAIN, bullet: true, breakLine: true, fontFace: 'Arial' }
    }));

    if (bulletTexts.length > 0) {
      slide.addText(bulletTexts, {
        x: 1.1,
        y: 2.0,
        w: 7.8,
        h: 3.8,
        valign: 'top',
        paraSpaceAfter: 12
      });
    }

    // Speaker notes footer
    if (slideData.speaker_notes) {
      slide.addNotes(slideData.speaker_notes);
    }
  });

  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return buffer;
}
