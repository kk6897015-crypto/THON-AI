import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function generateTeamId() {
  return 'team_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a new team
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { name, point_of_contact_phone } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const db = await getDb();
    const teamId = generateTeamId();
    const inviteCode = generateInviteCode();

    // Insert team
    await db.run(
      `INSERT INTO teams (id, name, invite_code, leader_id, point_of_contact_phone)
       VALUES (?, ?, ?, ?, ?)`,
      [teamId, name.trim(), inviteCode, req.user.userId, point_of_contact_phone || '']
    );

    // Insert leader into team_members
    await db.run(
      `INSERT INTO team_members (team_id, user_id) VALUES (?, ?)`,
      [teamId, req.user.userId]
    );

    // Initialize free subscription
    const subId = 'sub_' + Math.random().toString(36).substring(2, 9);
    await db.run(
      `INSERT INTO subscriptions (id, team_id, plan, applications_count) VALUES (?, ?, 'free', 0)`,
      [subId, teamId]
    );

    const team = {
      id: teamId,
      name: name.trim(),
      invite_code: inviteCode,
      leader_id: req.user.userId,
      point_of_contact_phone: point_of_contact_phone || ''
    };

    res.status(201).json({ team });
  } catch (err) {
    console.error('Create team error:', err);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Join team via invite code
router.post('/join', authenticateToken, async (req, res) => {
  try {
    const { invite_code } = req.body;
    if (!invite_code) {
      return res.status(400).json({ error: 'Invite code is required' });
    }

    const db = await getDb();
    const team = await db.get(
      'SELECT * FROM teams WHERE invite_code = ?',
      [invite_code.trim().toUpperCase()]
    );

    if (!team) {
      return res.status(404).json({ error: 'Invalid team invite code' });
    }

    // Check if already member
    const existing = await db.get(
      'SELECT * FROM team_members WHERE team_id = ? AND user_id = ?',
      [team.id, req.user.userId]
    );

    if (!existing) {
      await db.run(
        'INSERT INTO team_members (team_id, user_id) VALUES (?, ?)',
        [team.id, req.user.userId]
      );
    }

    res.json({ message: 'Successfully joined team', team });
  } catch (err) {
    console.error('Join team error:', err);
    res.status(500).json({ error: 'Failed to join team' });
  }
});

// Get team details with member roster & point of contact
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const team = await db.get('SELECT * FROM teams WHERE id = ?', [req.params.id]);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Get members
    const members = await db.all(
      `SELECT u.id, u.name, u.email, u.college, u.department, u.year_of_study, u.skills, u.resume_link, u.phone, tm.joined_at
       FROM users u
       JOIN team_members tm ON u.id = tm.user_id
       WHERE tm.team_id = ?`,
      [req.params.id]
    );

    const parsedMembers = members.map(m => {
      let skills = [];
      try { skills = JSON.parse(m.skills || '[]'); } catch (e) { skills = []; }
      return { ...m, skills };
    });

    // Get leader details
    const leader = parsedMembers.find(m => m.id === team.leader_id);

    // Get subscription status
    const subscription = await db.get('SELECT * FROM subscriptions WHERE team_id = ?', [team.id]);

    // Get Telegram link status
    const telegram = await db.get('SELECT * FROM telegram_links WHERE team_id = ?', [team.id]);

    res.json({
      team: {
        ...team,
        leader: leader || null,
        members: parsedMembers,
        subscription: subscription || { plan: 'free', applications_count: 0 },
        telegram: telegram ? { chat_id: telegram.chat_id, verified: Boolean(telegram.verified) } : null
      }
    });
  } catch (err) {
    console.error('Get team error:', err);
    res.status(500).json({ error: 'Failed to fetch team details' });
  }
});

// Reassign leader
router.post('/:id/reassign-leader', authenticateToken, async (req, res) => {
  try {
    const { new_leader_id } = req.body;
    const teamId = req.params.id;

    const db = await getDb();
    const team = await db.get('SELECT * FROM teams WHERE id = ?', [teamId]);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Ensure requester is current leader
    if (team.leader_id !== req.user.userId) {
      return res.status(403).json({ error: 'Only the current team leader can reassign leadership' });
    }

    // Check if new leader is in team
    const member = await db.get(
      'SELECT * FROM team_members WHERE team_id = ? AND user_id = ?',
      [teamId, new_leader_id]
    );

    if (!member) {
      return res.status(400).json({ error: 'New leader must be a member of the team' });
    }

    await db.run('UPDATE teams SET leader_id = ? WHERE id = ?', [new_leader_id, teamId]);

    res.json({ message: 'Team leader reassigned successfully', new_leader_id });
  } catch (err) {
    console.error('Reassign leader error:', err);
    res.status(500).json({ error: 'Failed to reassign leader' });
  }
});

export default router;
