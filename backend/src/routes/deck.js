import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { generatePitchDeckOutline, exportDeckToPptxBuffer } from '../services/deckService.js';

const router = express.Router();

// Generate AI Pitch Deck Outline & Speaker Notes
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { team_id, competition_id, title, problem, solution, tech_stack, market_ask } = req.body;

    if (!team_id || !title || !problem || !solution) {
      return res.status(400).json({ error: 'Team ID, Title, Problem, and Solution are required' });
    }

    const slides = await generatePitchDeckOutline({ title, problem, solution, tech_stack, market_ask });

    const db = await getDb();
    const deckId = 'deck_' + Math.random().toString(36).substring(2, 9);

    await db.run(
      `INSERT INTO decks (id, team_id, competition_id, title, draft_sections, per_slide_checklists)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        deckId,
        team_id,
        competition_id || null,
        title,
        JSON.stringify(slides),
        JSON.stringify(slides.map(s => ({ slide_number: s.slide_number, checklist: s.rewrite_checklist })))
      ]
    );

    res.json({
      deck_id: deckId,
      title,
      slides,
      disclaimer: 'AI-Generated FIRST DRAFT ΓÇö Team must rewrite in their own words before submitting.'
    });
  } catch (err) {
    console.error('Deck generation error:', err);
    res.status(500).json({ error: 'Failed to generate pitch deck outline' });
  }
});

// Export Deck to downloadable PPTX file
router.post('/export-pptx', authenticateToken, async (req, res) => {
  try {
    const { title, slides } = req.body;

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return res.status(400).json({ error: 'Valid slides array required for PPTX export' });
    }

    const buffer = await exportDeckToPptxBuffer({ title: title || 'TeamLaunch Pitch Deck', slides });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${(title || 'Pitch_Deck').replace(/[^a-zA-Z0-9]/g, '_')}.pptx"`);

    res.send(buffer);
  } catch (err) {
    console.error('PPTX export error:', err);
    res.status(500).json({ error: 'Failed to export PPTX file' });
  }
});

// Generate Prep Guide
router.post('/prep-guide', authenticateToken, async (req, res) => {
  try {
    const { competition_title, level, problem, solution } = req.body;

    const judgesCriteria = [
      { category: 'Problem Relevance & Impact (25%)', detail: 'Judges evaluate if the problem is well-defined, urgent, and addresses a substantial target audience.' },
      { category: 'Technical Execution & Architecture (25%)', detail: 'Feasibility of the tech stack, working demo, cleanliness of system architecture.' },
      { category: 'Novelty & Competitive Edge (25%)', detail: 'Unique differentiation compared to existing solutions; clear secret sauce.' },
      { category: 'Pitch Clarity & Presentation (25%)', detail: 'Slide design visual hierarchy, concise bullet points, ability to answer tough judge Q&A.' }
    ];

    const likelyQuestions = [
      'What is your primary moat or IP protection against incumbents in this domain?',
      'How does your system handle offline or edge network failures during live user flow?',
      'What are the unit economics or cost drivers when scaling from 100 to 10,000 active users?',
      'Did you conduct user testing with real target users, and what surprised you during feedback?',
      'If given 6 months and funding, what is the single biggest technical risk you would solve first?'
    ];

    const countdownTimeline = [
      { phase: 'T-7 Days', task: 'Finalize Idea Brief & Novelty Lookups on TeamLaunch' },
      { phase: 'T-5 Days', task: 'Generate First Draft Pitch Deck & Complete PPT Structural Analysis' },
      { phase: 'T-3 Days', task: 'Run Team Peer Pitch Dry-Run & Address Per-Slide Rewrite Checklists' },
      { phase: 'T-1 Day', task: 'Execute Eligibility & Completeness Checker Pass; Export Final PPTX' },
      { phase: 'Submission Day', task: 'Open Official Competition Portal via Link, Submit, and Mark Applied' }
    ];

    res.json({
      competition_title: competition_title || 'Target Hackathon',
      level: level || 'national',
      judges_criteria: judgesCriteria,
      suggested_deck_structure: [
        'Slide 1: Title & Tagline',
        'Slide 2: Problem & Pain Point',
        'Slide 3: Solution & System Architecture',
        'Slide 4: Novelty & Competitive Differentiator',
        'Slide 5: Traction & Execution Roadmap',
        'Slide 6: Team & The Ask'
      ],
      likely_qa: likelyQuestions,
      countdown_timeline: countdownTimeline
    });
  } catch (err) {
    console.error('Prep guide error:', err);
    res.status(500).json({ error: 'Failed to generate prep guide' });
  }
});

export default router;
