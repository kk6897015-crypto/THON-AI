import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';
import { config } from '../config.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper for simple UUID if package uuid is used or fallback
function generateId() {
  return 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, college, department, year_of_study, skills, resume_link, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const db = await getDb();

    // Check existing
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateId();
    const skillsJson = JSON.stringify(skills || []);

    await db.run(
      `INSERT INTO users (id, name, email, password, college, department, year_of_study, skills, resume_link, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name.trim(),
        email.toLowerCase().trim(),
        hashedPassword,
        college || '',
        department || '',
        year_of_study || '',
        skillsJson,
        resume_link || '',
        phone || ''
      ]
    );

    const token = jwt.sign({ userId, email: email.toLowerCase().trim(), name }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });

    const user = {
      id: userId,
      name,
      email: email.toLowerCase().trim(),
      college,
      department,
      year_of_study,
      skills: skills || [],
      resume_link,
      phone
    };

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const db = await getDb();
    const cleanEmail = email.toLowerCase().trim();
    let userRow = await db.get('SELECT * FROM users WHERE email = ?', [cleanEmail]);

    // Guaranteed Demo Account Bootstrap
    if ((!userRow || !(await bcrypt.compare(password, userRow.password))) && 
        cleanEmail === 'demo@teamlaunch.io' && 
        (password === 'password123' || password === 'demopassword123')) {
      const hashedDemoPwd = await bcrypt.hash('password123', 10);
      await db.run(
        `INSERT OR REPLACE INTO users (id, name, email, password, college, department, year_of_study, skills, phone)
         VALUES ('demo_user', 'Demo Leader', 'demo@teamlaunch.io', ?, 'IIT Madras', 'Computer Science', '3rd Year', '["React","Node.js","AI","Python"]', '+91 9876543210')`,
        [hashedDemoPwd]
      );
      await db.run(
        `INSERT OR IGNORE INTO teams (id, name, invite_code, leader_id, point_of_contact_phone)
         VALUES ('demo_team', 'Alpha Innovators', 'ALPH01', 'demo_user', '+91 9876543210')`
      );
      await db.run(
        `INSERT OR IGNORE INTO team_members (team_id, user_id) VALUES ('demo_team', 'demo_user')`
      );
      userRow = await db.get('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    }

    if (!userRow) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, userRow.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: userRow.id, email: userRow.email, name: userRow.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    let parsedSkills = [];
    try {
      parsedSkills = JSON.parse(userRow.skills || '[]');
    } catch (e) {
      parsedSkills = [];
    }

    // Fetch user's teams so activeTeam is immediately set on login
    const teamRows = await db.all(
      `SELECT t.*, tm.joined_at FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = ?`,
      [userRow.id]
    );

    const user = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      college: userRow.college,
      department: userRow.department,
      year_of_study: userRow.year_of_study,
      skills: parsedSkills,
      resume_link: userRow.resume_link,
      phone: userRow.phone,
      teams: teamRows
    };

    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const userRow = await db.get('SELECT * FROM users WHERE id = ?', [req.user.userId]);

    if (!userRow) {
      return res.status(404).json({ error: 'User not found' });
    }

    let parsedSkills = [];
    try {
      parsedSkills = JSON.parse(userRow.skills || '[]');
    } catch (e) {
      parsedSkills = [];
    }

    // Get user's teams
    const teamRows = await db.all(
      `SELECT t.*, tm.joined_at FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = ?`,
      [userRow.id]
    );

    const user = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      college: userRow.college,
      department: userRow.department,
      year_of_study: userRow.year_of_study,
      skills: parsedSkills,
      resume_link: userRow.resume_link,
      phone: userRow.phone,
      teams: teamRows
    };

    res.json({ user });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
});

export default router;
