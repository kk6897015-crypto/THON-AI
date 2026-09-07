import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendTelegramMessage, triggerDailyDigestForTeams } from '../services/telegramBotService.js';

const router = express.Router();

// Get team Telegram link status
router.get('/status/:teamId', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const link = await db.get('SELECT * FROM telegram_links WHERE team_id = ?', [req.params.teamId]);

    res.json({
      linked: Boolean(link && link.verified),
      chat_id: link ? link.chat_id : null
    });
  } catch (err) {
    console.error('Telegram status error:', err);
    res.status(500).json({ error: 'Failed to fetch Telegram link status' });
  }
});

// Save or verify Telegram chat_id for a team
router.post('/link', authenticateToken, async (req, res) => {
  try {
    const { team_id, chat_id, bot_token } = req.body;

    if (!team_id || !chat_id) {
      return res.status(400).json({ error: 'team_id and chat_id are required' });
    }

    const db = await getDb();
    const existing = await db.get('SELECT * FROM telegram_links WHERE team_id = ?', [team_id]);

    const linkId = existing ? existing.id : 'tg_' + Math.random().toString(36).substring(2, 9);

    if (existing) {
      await db.run(
        `UPDATE telegram_links SET chat_id = ?, bot_token = ?, verified = 1 WHERE team_id = ?`,
        [chat_id.trim(), bot_token || '', team_id]
      );
    } else {
      await db.run(
        `INSERT INTO telegram_links (id, team_id, chat_id, bot_token, verified)
         VALUES (?, ?, ?, ?, 1)`,
        [linkId, team_id, chat_id.trim(), bot_token || '']
      );
    }

    // Send confirmation test message to Telegram chat
    const sent = await sendTelegramMessage(
      chat_id.trim(),
      `≡ƒÄë *TeamLaunch Telegram Bot Linked!*\n\nYour team will now receive daily digest updates and deadline countdowns right here.`,
      bot_token
    );

    res.json({
      message: 'Telegram chat linked successfully!',
      verified: true,
      test_message_sent: sent
    });
  } catch (err) {
    console.error('Telegram link error:', err);
    res.status(500).json({ error: 'Failed to link Telegram chat' });
  }
});

// Trigger immediate test digest
router.post('/trigger-digest', authenticateToken, async (req, res) => {
  try {
    await triggerDailyDigestForTeams();
    res.json({ message: 'Daily digest push triggered successfully for all linked Telegram teams.' });
  } catch (err) {
    console.error('Trigger digest error:', err);
    res.status(500).json({ error: 'Failed to trigger digest' });
  }
});

export default router;
