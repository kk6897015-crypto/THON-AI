import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { searchIdeaNovelty } from '../services/noveltyService.js';

const router = express.Router();

router.post('/search', authenticateToken, async (req, res) => {
  try {
    const { team_id, problem, solution, tech_stack, novelty_notes } = req.body;

    if (!problem || !solution) {
      return res.status(400).json({ error: 'Problem and Solution descriptions are required' });
    }

    const result = await searchIdeaNovelty({ problem, solution, tech_stack });

    // Save to idea_briefs if team_id provided
    if (team_id) {
      const db = await getDb();
      const briefId = 'brief_' + Math.random().toString(36).substring(2, 9);
      await db.run(
        `INSERT INTO idea_briefs (id, team_id, problem, solution, tech_stack, novelty_notes, related_works)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          briefId,
          team_id,
          problem,
          solution,
          tech_stack || '',
          result.differentiation_analysis,
          JSON.stringify(result.top_3_related_works)
        ]
      );
      result.brief_id = briefId;
    }

    res.json(result);
  } catch (err) {
    console.error('Novelty search error:', err);
    res.status(500).json({ error: 'Failed to complete novelty search' });
  }
});

// Get team's saved idea briefs
router.get('/team/:teamId', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(
      'SELECT * FROM idea_briefs WHERE team_id = ? ORDER BY created_at DESC',
      [req.params.teamId]
    );

    const briefs = rows.map(b => {
      let related_works = [];
      try { related_works = JSON.parse(b.related_works || '[]'); } catch (e) {}
      return { ...b, related_works };
    });

    res.json({ briefs });
  } catch (err) {
    console.error('Fetch briefs error:', err);
    res.status(500).json({ error: 'Failed to fetch idea briefs' });
  }
});

export default router;
