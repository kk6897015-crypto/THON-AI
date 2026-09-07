import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { runEligibilityAndCompletenessCheck } from '../services/eligibilityService.js';

const router = express.Router();

router.post('/check', authenticateToken, async (req, res) => {
  try {
    const { team_id, competition_id, eligibility_raw_text, idea_brief_id, deck_id } = req.body;

    if (!team_id) {
      return res.status(400).json({ error: 'team_id is required' });
    }

    const db = await getDb();

    // Fetch team with members
    const team = await db.get('SELECT * FROM teams WHERE id = ?', [team_id]);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const members = await db.all(
      `SELECT u.* FROM users u
       JOIN team_members tm ON u.id = tm.user_id
       WHERE tm.team_id = ?`,
      [team_id]
    );

    team.members = members;

    // Fetch idea brief if provided
    let idea_brief = null;
    if (idea_brief_id) {
      idea_brief = await db.get('SELECT * FROM idea_briefs WHERE id = ?', [idea_brief_id]);
    } else {
      // try fetching latest idea brief for team
      idea_brief = await db.get('SELECT * FROM idea_briefs WHERE team_id = ? ORDER BY created_at DESC LIMIT 1', [team_id]);
    }

    // Fetch deck if provided
    let deck = null;
    if (deck_id) {
      const deckRow = await db.get('SELECT * FROM decks WHERE id = ?', [deck_id]);
      if (deckRow) {
        let draft_sections = [];
        try { draft_sections = JSON.parse(deckRow.draft_sections || '[]'); } catch (e) {}
        deck = { ...deckRow, draft_sections };
      }
    } else {
      const deckRow = await db.get('SELECT * FROM decks WHERE team_id = ? ORDER BY updated_at DESC LIMIT 1', [team_id]);
      if (deckRow) {
        let draft_sections = [];
        try { draft_sections = JSON.parse(deckRow.draft_sections || '[]'); } catch (e) {}
        deck = { ...deckRow, draft_sections };
      }
    }

    // Fetch comp raw text if comp_id provided and raw text not passed
    let rawText = eligibility_raw_text || '';
    if (!rawText && competition_id) {
      const comp = await db.get('SELECT * FROM competitions WHERE id = ?', [competition_id]);
      if (comp) rawText = comp.eligibility_raw_text || '';
    }

    const result = await runEligibilityAndCompletenessCheck({
      eligibility_raw_text: rawText,
      team,
      idea_brief,
      deck
    });

    // Store evaluation record
    const checkId = 'chk_' + Math.random().toString(36).substring(2, 9);
    await db.run(
      `INSERT INTO eligibility_checks (id, team_id, competition_id, checklist, completeness)
       VALUES (?, ?, ?, ?, ?)`,
      [
        checkId,
        team_id,
        competition_id || 'manual',
        JSON.stringify(result.checklist),
        JSON.stringify(result.completeness)
      ]
    );

    res.json({
      id: checkId,
      checklist: result.checklist,
      completeness: result.completeness,
      ai_enhanced: result.ai_enhanced
    });
  } catch (err) {
    console.error('Eligibility check error:', err);
    res.status(500).json({ error: 'Failed to run eligibility check' });
  }
});

export default router;
