import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { config } from '../config.js';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

let razorpayClient = null;
if (config.razorpayKeyId && config.razorpayKeySecret && !config.razorpayKeyId.includes('mock')) {
  try {
    razorpayClient = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret
    });
  } catch (err) {
    console.warn('Failed to initialize Razorpay SDK client:', err.message);
  }
}

// GET /api/billing/status
router.get('/status', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let user = null;

    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        user = jwt.default.verify(token, config.jwtSecret);
      } catch (e) {
        // Continue unauthenticated if token invalid
      }
    }

    res.json({
      active: true,
      provider: config.razorpayKeyId ? 'razorpay' : 'mock',
      plan: 'team_pro',
      price: 149,
      currency: 'INR'
    });
  } catch (err) {
    console.error('Billing status error:', err);
    res.status(500).json({ error: 'Failed to retrieve billing status' });
  }
});

// POST /api/billing/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { team_id, plan_id } = req.body;

    // If real Razorpay keys are configured and a plan exists, create subscription
    if (razorpayClient && config.razorpayPlanId) {
      try {
        const sub = await razorpayClient.subscriptions.create({
          plan_id: plan_id || config.razorpayPlanId,
          total_count: 12,
          quantity: 1,
          customer_notify: 1,
          notes: {
            team_id: team_id || 'unassigned'
          }
        });

        return res.json({
          subscription_id: sub.id,
          key_id: config.razorpayKeyId,
          currency: 'INR',
          amount: 14900
        });
      } catch (rzpErr) {
        console.error('Razorpay subscription creation failed, falling back to order/mock:', rzpErr);
      }
    }

    // If Razorpay keys exist but order-based or test mode:
    if (razorpayClient) {
      try {
        const order = await razorpayClient.orders.create({
          amount: 14900, // 149 INR in paise
          currency: 'INR',
          receipt: `rcpt_${Date.now().toString().slice(-8)}`,
          notes: {
            team_id: team_id || 'team'
          }
        });

        return res.json({
          subscription_id: order.id,
          key_id: config.razorpayKeyId,
          currency: 'INR',
          amount: 14900
        });
      } catch (orderErr) {
        console.error('Razorpay order creation error:', orderErr);
      }
    }

    // Test / Demo / Mock mode fallback
    const mockId = `sub_mock_${Date.now()}`;
    return res.json({
      subscription_id: mockId,
      key_id: config.razorpayKeyId || 'rzp_test_mock_teamlaunch',
      currency: 'INR',
      amount: 14900
    });
  } catch (err) {
    console.error('Subscribe endpoint error:', err);
    res.status(500).json({ error: 'Failed to initialize subscription checkout' });
  }
});

// POST /api/billing/subscribe/verify
router.post('/subscribe/verify', async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      team_id
    } = req.body;

    const db = await getDb();

    // Verify signature if real Razorpay secret is present
    if (config.razorpayKeySecret && !config.razorpayKeySecret.includes('mock') && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', config.razorpayKeySecret)
        .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        console.warn('Razorpay signature mismatch.');
        return res.status(400).json({ error: 'Invalid payment signature' });
      }
    }

    // Update team subscription in DB
    const txnId = razorpay_payment_id || `pay_${Date.now()}`;

    if (team_id) {
      const existingSub = await db.get('SELECT * FROM subscriptions WHERE team_id = ?', [team_id]);
      if (existingSub) {
        await db.run(
          `UPDATE subscriptions SET plan = 'pro', stripe_or_razorpay_id = ?, status = 'active' WHERE team_id = ?`,
          [txnId, team_id]
        );
      } else {
        const subId = 'sub_' + Math.random().toString(36).substring(2, 9);
        await db.run(
          `INSERT INTO subscriptions (id, team_id, plan, stripe_or_razorpay_id, status) VALUES (?, ?, 'pro', ?, 'active')`,
          [subId, team_id, txnId]
        );
      }
    }

    res.json({
      success: true,
      message: 'Subscription successfully activated!',
      plan: 'pro',
      payment_id: txnId
    });
  } catch (err) {
    console.error('Verify subscription error:', err);
    res.status(500).json({ error: 'Failed to verify subscription' });
  }
});

// POST /api/billing/upgrade (convenience alias for direct upgrades)
router.post('/upgrade', async (req, res) => {
  try {
    const { team_id, payment_provider, payment_id } = req.body;
    if (!team_id) {
      return res.status(400).json({ error: 'team_id is required' });
    }

    const db = await getDb();
    const txnId = payment_id || `${payment_provider || 'stripe'}_pay_${Date.now()}`;

    const existingSub = await db.get('SELECT * FROM subscriptions WHERE team_id = ?', [team_id]);
    if (existingSub) {
      await db.run(
        `UPDATE subscriptions SET plan = 'pro', stripe_or_razorpay_id = ?, status = 'active' WHERE team_id = ?`,
        [txnId, team_id]
      );
    } else {
      const subId = 'sub_' + Math.random().toString(36).substring(2, 9);
      await db.run(
        `INSERT INTO subscriptions (id, team_id, plan, stripe_or_razorpay_id, status) VALUES (?, ?, 'pro', ?, 'active')`,
        [subId, team_id, txnId]
      );
    }

    res.json({
      success: true,
      message: 'Upgraded to Team Pro successfully!',
      plan: 'pro',
      payment_id: txnId
    });
  } catch (err) {
    console.error('Billing upgrade error:', err);
    res.status(500).json({ error: 'Failed to process upgrade' });
  }
});

export default router;
