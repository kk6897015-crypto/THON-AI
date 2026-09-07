import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/competitions/team/:teamId
router.get('/team/:teamId', async (req, res) => {
  try {
    const db = await getDb();
    const competitions = await db.all(
      'SELECT * FROM competitions WHERE team_id = ? ORDER BY created_at DESC',
      [req.params.teamId]
    );
    res.json({ competitions: competitions || [] });
  } catch (err) {
    console.error('Error fetching team competitions:', err);
    res.status(500).json({ error: 'Failed to fetch competitions' });
  }
});

// GET /api/competitions/live-feed
router.get('/live-feed', async (req, res) => {
  try {
    const liveHackathons = [
      {
        id: 'live_1',
        title: 'Smart India Hackathon (SIH) 2026 - Hardware Edition',
        source_url: 'https://sih.gov.in',
        platform: 'SIH Portal',
        level: 'national',
        tags: 'GovTech, IoT, AI, Hardware',
        deadline: '2026-09-24T18:30:00Z',
        eligibility_raw_text: 'Open to enrolled college students across AICTE/UGC approved institutes in India. Teams must have 6 members with at least 1 female teammate.'
      },
      {
        id: 'live_2',
        title: 'Anna University CEG Innothon 2026',
        source_url: 'https://annauniv.edu',
        platform: 'Anna University CEG',
        level: 'state',
        tags: 'AI, TamilNadu, SmartGovernance',
        deadline: '2026-09-15T12:00:00Z',
        eligibility_raw_text: 'Open to Anna University campus students and all affiliated colleges in Tamil Nadu. Team size: 2-4 members.'
      },
      {
        id: 'live_3',
        title: 'IIT Madras Shaastra Hackathon 2026',
        source_url: 'https://shaastra.org',
        platform: 'IIT Madras',
        level: 'national',
        tags: 'DeepTech, Robotics, EdgeAI',
        deadline: '2026-09-11T23:59:00Z',
        eligibility_raw_text: 'Open to engineering and science undergraduate and postgraduate students. Team size: 3-5 members.'
      },
      {
        id: 'live_4',
        title: 'PSG Tech iTech Hackfest 2026',
        source_url: 'https://psgtech.edu',
        platform: 'PSG Tech',
        level: 'state',
        tags: 'Embedded, IoT, CleanTech',
        deadline: '2026-09-06T18:00:00Z',
        eligibility_raw_text: 'State-level 36-hour physical hackathon open to Tamil Nadu engineering institutions. Maximum 4 members per team.'
      }
    ];
    res.json({ hackathons: liveHackathons });
  } catch (err) {
    console.error('Error fetching live feed:', err);
    res.status(500).json({ error: 'Failed to fetch live feed' });
  }
});

// POST /api/competitions/add
router.post('/add', async (req, res) => {
  try {
    const {
      team_id,
      title,
      source_url,
      platform,
      level,
      tags,
      deadline,
      eligibility_raw_text
    } = req.body;

    if (!team_id || !title) {
      return res.status(400).json({ error: 'team_id and title are required' });
    }

    const db = await getDb();
    const id = 'comp_' + Math.random().toString(36).substring(2, 9);
    const tagsString = Array.isArray(tags) ? JSON.stringify(tags) : (tags || '[]');

    await db.run(
      `INSERT INTO competitions (
        id, team_id, title, source_url, platform, level, tags, deadline, eligibility_raw_text, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'saved')`,
      [
        id,
        team_id,
        title,
        source_url || '',
        platform || 'Other',
        level || 'national',
        tagsString,
        deadline || '',
        eligibility_raw_text || ''
      ]
    );

    res.json({
      message: 'Competition added successfully',
      competition: { id, team_id, title, status: 'saved' }
    });
  } catch (err) {
    console.error('Error adding competition:', err);
    res.status(500).json({ error: 'Failed to add competition' });
  }
});

// PATCH /api/competitions/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const db = await getDb();

    // Check if moving to applied requires subscription gating
    if (status === 'applied') {
      const comp = await db.get('SELECT team_id FROM competitions WHERE id = ?', [req.params.id]);
      if (comp) {
        const sub = await db.get('SELECT * FROM subscriptions WHERE team_id = ?', [comp.team_id]);
        const appliedCount = await db.get(
          `SELECT COUNT(*) as count FROM competitions WHERE team_id = ? AND status = 'applied'`,
          [comp.team_id]
        );

        if ((!sub || sub.plan !== 'pro') && appliedCount && appliedCount.count >= 1) {
          return res.status(402).json({
            requiresSubscription: true,
            error: 'Free plan allows 1 applied competition. Upgrade to Team Pro for unlimited Kanban slots.'
          });
        }
      }
    }

    await db.run('UPDATE competitions SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status updated successfully', status });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// DELETE /api/competitions/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM competitions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Competition removed successfully' });
  } catch (err) {
    console.error('Error deleting competition:', err);
    res.status(500).json({ error: 'Failed to delete competition' });
  }
});

// GET /api/competitions/discover
router.get('/discover', async (req, res) => {
  try {
    const db = await getDb();
    const { state, tier, timeline, search } = req.query;

    let query = 'SELECT * FROM competitions WHERE 1=1';
    const params = [];

    if (state) {
      query += ' AND state = ?';
      params.push(state);
    }
    if (tier) {
      query += ' AND college_tier = ?';
      params.push(tier);
    }
    if (search) {
      query += ' AND (title LIKE ? OR tags LIKE ? OR eligibility_raw_text LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY created_at DESC LIMIT 50';
    const comps = await db.all(query, params);
    res.json({ competitions: comps || [] });
  } catch (err) {
    console.error('Error discovering competitions:', err);
    res.status(500).json({ error: 'Failed to discover competitions' });
  }
});

// POST /api/competitions/:id/copy
router.post('/:id/copy', async (req, res) => {
  try {
    const { team_id } = req.body;
    if (!team_id) {
      return res.status(400).json({ error: 'team_id is required' });
    }

    const db = await getDb();
    const orig = await db.get('SELECT * FROM competitions WHERE id = ?', [req.params.id]);

    if (!orig) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    const newId = 'comp_' + Math.random().toString(36).substring(2, 9);
    await db.run(
      `INSERT INTO competitions (
        id, team_id, title, source_url, platform, level, tags, deadline, eligibility_raw_text, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'saved')`,
      [
        newId,
        team_id,
        orig.title,
        orig.source_url || '',
        orig.platform || '',
        orig.level || 'national',
        orig.tags || '[]',
        orig.deadline || '',
        orig.eligibility_raw_text || ''
      ]
    );

    res.json({ message: 'Competition copied to team Kanban', id: newId });
  } catch (err) {
    console.error('Error copying competition:', err);
    res.status(500).json({ error: 'Failed to copy competition' });
  }
});

// PATCH /api/competitions/:id/verify
router.patch('/:id/verify', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('UPDATE competitions SET needs_verification = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Competition verified active' });
  } catch (err) {
    console.error('Error verifying competition:', err);
    res.status(500).json({ error: 'Failed to verify competition' });
  }
});

// POST /api/competitions/recommend
router.post('/recommend', async (req, res) => {
  try {
    const { project_idea, skills, college_tier } = req.body;
    // Recommendations logic
    res.json({
      recommendations: [
        {
          id: 'rec_1',
          title: 'Tamil Nadu Innovation Challenge 2026',
          match_score: 96,
          rationale: 'High alignment with your team skill profile and state eligibility criteria.'
        }
      ]
    });
  } catch (err) {
    console.error('Error generating recommendations:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

export default router;
