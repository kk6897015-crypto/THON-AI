import axios from 'axios';
import cron from 'node-cron';
import { getDb } from '../db.js';
import { config } from '../config.js';

export async function sendTelegramMessage(chatId, text, botTokenOverride = null) {
  const token = botTokenOverride || config.telegramBotToken;
  if (!token || !chatId) {
    console.warn('Telegram bot send skipped: token or chat_id missing');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await axios.post(url, {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    });
    return true;
  } catch (err) {
    console.error('Telegram bot send error:', err.response?.data || err.message);
    return false;
  }
}

// Daily Digest Cron Task (Runs every day at 09:00 AM)
export function initTelegramDigestScheduler() {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily Telegram digest task...');
    await triggerDailyDigestForTeams();
  });

  // Hourly Freshness Job: Flip expired shared competitions to "closed"
  cron.schedule('0 * * * *', async () => {
    console.log('Running hourly freshness check...');
    try {
      const db = await getDb();
      const now = new Date().toISOString();
      const res = await db.run(
        "UPDATE competitions SET status = 'closed' WHERE visibility = 'shared' AND deadline < ? AND status != 'closed'",
        [now]
      );
      if (res.changes > 0) {
        console.log(`Flipped ${res.changes} expired shared competitions to closed.`);
      }
    } catch (err) {
      console.error('Hourly freshness check failed:', err);
    }
  });

  // Daily Freshness Job: Flag shared competitions older than 14 days for re-verification
  cron.schedule('30 9 * * *', async () => {
    console.log('Running daily verification check...');
    try {
      const db = await getDb();
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const res = await db.run(
        `UPDATE competitions 
         SET needs_verification = 1 
         WHERE visibility = 'shared' 
         AND status != 'closed'
         AND (
           (verified_at IS NOT NULL AND verified_at < ?) 
           OR 
           (verified_at IS NULL AND created_at < ?)
         )`,
        [fourteenDaysAgo, fourteenDaysAgo]
      );
      if (res.changes > 0) {
        console.log(`Flagged ${res.changes} shared competitions as needing re-verification.`);
      }
    } catch (err) {
      console.error('Daily verification check failed:', err);
    }
  });
}

export async function triggerDailyDigestForTeams() {
  try {
    const db = await getDb();
    const telegramLinks = await db.all('SELECT * FROM telegram_links WHERE verified = 1');

    for (const link of telegramLinks) {
      const team = await db.get('SELECT * FROM teams WHERE id = ?', [link.team_id]);
      if (!team) continue;

      const comps = await db.all(
        'SELECT * FROM competitions WHERE team_id = ? AND status != "result" ORDER BY deadline ASC',
        [link.team_id]
      );

      if (comps.length === 0) {
        await sendTelegramMessage(
          link.chat_id,
          `≡ƒÜÇ *TeamLaunch Daily Digest for ${team.name}*\n\nNo active competition deadlines tracked yet. Add competitions to your Kanban board to enable escalating reminders!`
        );
        continue;
      }

      let message = `≡ƒÜÇ *TeamLaunch Daily Digest for ${team.name}*\n\n`;
      message += `≡ƒôï *Tracked Competitions (${comps.length}):*\n`;

      const now = new Date();

      comps.forEach(c => {
        let deadlineInfo = 'No deadline set';
        if (c.deadline) {
          const dDate = new Date(c.deadline);
          const diffDays = Math.ceil((dDate - now) / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) {
            deadlineInfo = '≡ƒö┤ EXPIRED';
          } else if (diffDays === 0) {
            deadlineInfo = '≡ƒöÑ DUE TODAY!';
          } else if (diffDays === 1) {
            deadlineInfo = 'ΓÜá∩╕Å DUE TOMORROW (1 day)';
          } else if (diffDays <= 3) {
            deadlineInfo = `ΓÅ│ ${diffDays} days remaining`;
          } else if (diffDays <= 7) {
            deadlineInfo = `≡ƒôà ${diffDays} days left`;
          } else {
            deadlineInfo = `${diffDays} days away`;
          }
        }

        const statusTag = c.status.toUpperCase();
        message += `ΓÇó *${c.title}* [${statusTag}]\n  Status: ${deadlineInfo}\n\n`;
      });

      message += `≡ƒæë Manage your Kanban board & eligibility checks on TeamLaunch dashboard!`;

      await sendTelegramMessage(link.chat_id, message, link.bot_token);
    }
  } catch (err) {
    console.error('Trigger daily digest error:', err);
  }
}
