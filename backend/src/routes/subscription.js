import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get subscription status for team
router.get('/status/:teamId', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    let sub = await db.get('SELECT * FROM subscriptions WHERE team_id = ?', [req.params.teamId]);

    if (!sub) {
      const subId = 'sub_' + Math.random().toString(36).substring(2, 9);
      await db.run(
        `INSERT INTO subscriptions (id, team_id, plan, applications_count) VALUES (?, ?, 'free', 0)`,
        [subId, req.params.teamId]
      );
      sub = { id: subId, team_id: req.params.teamId, plan: 'free', status: 'active', applications_count: 0 };
    }

    const appliedComps = await db.get(
      `SELECT COUNT(*) as count FROM competitions WHERE team_id = ? AND status = 'applied'`,
      [req.params.teamId]
    );

    const applicationsCount = appliedComps ? appliedComps.count : 0;
    const canApplyFree = applicationsCount < 1 || sub.plan === 'pro';

    res.json({
      subscription: sub,
      applications_used: applicationsCount,
      can_apply_free: canApplyFree,
      requires_upgrade: !canApplyFree
    });
  } catch (err) {
    console.error('Subscription status error:', err);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

// Upgrade subscription (Stripe / Razorpay mock checkout)
router.post('/upgrade', authenticateToken, async (req, res) => {
  try {
    const { team_id, payment_provider, payment_id } = req.body;

    if (!team_id) {
      return res.status(400).json({ error: 'team_id is required' });
    }

    const db = await getDb();
    const txnId = payment_id || `${payment_provider || 'stripe'}_pay_${Date.now()}`;

    await db.run(
      `UPDATE subscriptions SET plan = 'pro', stripe_or_razorpay_id = ?, status = 'active' WHERE team_id = ?`,
      [txnId, team_id]
    );

    res.json({
      message: 'Subscription upgraded to Pro successfully!',
      plan: 'pro',
      payment_id: txnId,
      prompt_telegram_link: true
    });
  } catch (err) {
    console.error('Subscription upgrade error:', err);
    res.status(500).json({ error: 'Failed to upgrade subscription' });
  }
});

export default router;
