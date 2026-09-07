import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get WhatsApp link status
router.get('/status/:teamId', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const link = await db.get('SELECT * FROM telegram_links WHERE team_id = ?', [req.params.teamId]);
    res.json({
      whatsapp: link ? {
        group_name: 'Hackathon Team Alpha',
        verified: true,
        daily_alerts: true,
        deadline_alerts: true
      } : null
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch WhatsApp status' });
  }
});

// Send test WhatsApp group notification
router.post('/send-alert', authenticateToken, async (req, res) => {
  try {
    const { team_id, message } = req.body;
    console.log(`[WhatsApp Bot] Push to Team Group (${team_id}): ${message}`);
    res.json({ message: 'WhatsApp notification sent to team group', status: 'sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send WhatsApp alert' });
  }
});

export default router;
