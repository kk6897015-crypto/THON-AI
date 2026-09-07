import React, { useState } from 'react';
import { DoubleBezelCard } from './DoubleBezelCard.jsx';
import { TactileButton } from './TactileButton.jsx';
import { billingApi } from '../services/api.js';

const PLAN_FEATURES = [
  '✦ Unlimited Kanban competition tracking',
  '✦ Daily Telegram AI digest alerts',
  '✦ WhatsApp deadline countdown alerts',
  '✦ AI eligibility engine (unlimited checks)',
  '✦ Novelty & prior-art paper search',
  '✦ AI Deck Studio — full pitch deck generation',
  '✦ PPT structural lint checker',
  '✦ Team roster & invite code management',
];

export const SubscriptionModal = ({ teamId, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await billingApi.subscribe({ team_id: teamId });
      const { subscription_id, key_id, amount, currency } = res.data;

      // If real Razorpay keys present, open checkout
      if (key_id && !key_id.includes('mock')) {
        const options = {
          key: key_id,
          amount,
          currency: currency || 'INR',
          name: 'THON-AI',
          description: 'Team Pro — Monthly',
          subscription_id,
          handler: async (response) => {
            try {
              await billingApi.verify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id || subscription_id,
                razorpay_signature: response.razorpay_signature,
                team_id: teamId,
              });
              onSuccess?.();
            } catch (err) {
              setError('Payment verified but activation failed. Please contact support.');
            }
          },
          modal: { ondismiss: () => setLoading(false) },
          theme: { color: '#DE3C25' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
      } else {
        // Mock / demo mode — auto-activate
        await billingApi.verify({
          razorpay_payment_id: `pay_demo_${Date.now()}`,
          razorpay_subscription_id: subscription_id,
          razorpay_signature: '',
          team_id: teamId,
        });
        setLoading(false);
        onSuccess?.();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start subscription. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-float">
      <div className="w-full max-w-md">
        <DoubleBezelCard>
          <div className="space-y-5 p-2">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F5E8E2]/10 pb-3">
              <div>
                <h3 className="font-heading text-xl font-bold text-white">
                  Unlock Team Pro
                </h3>
                <p className="text-xs font-mono-tabular text-[#A89892] mt-0.5">
                  Everything your team needs to win
                </p>
              </div>
              <button onClick={onClose} className="text-[#A89892] hover:text-white p-1">
                ✕
              </button>
            </div>

            {/* Pricing Badge */}
            <div className="flex items-end gap-2">
              <span className="text-4xl font-heading font-bold text-white">₹149</span>
              <span className="text-sm text-[#A89892] mb-1.5">/month · per team</span>
            </div>

            {/* Feature List */}
            <ul className="space-y-1.5">
              {PLAN_FEATURES.map((f) => (
                <li
                  key={f}
                  className="text-xs text-[#D8C3BB] flex items-center gap-2"
                >
                  <span className="text-[#DE3C25] text-xs leading-none">✦</span>
                  {f.replace('✦ ', '')}
                </li>
              ))}
            </ul>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-[#2D1815] border border-[#DE3C25]/40 text-[#F87059] text-xs font-mono-tabular">
                {error}
              </div>
            )}

            {/* CTA */}
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={onClose}
                className="btn-pill-secondary text-xs"
              >
                Maybe Later
              </button>
              <TactileButton
                variant="primary"
                disabled={loading}
                onClick={handleSubscribe}
                icon="✦"
              >
                {loading ? 'Processing...' : 'Subscribe — ₹149/mo'}
              </TactileButton>
            </div>

            <p className="text-center text-[10px] text-[#A89892] opacity-70">
              Powered by Razorpay · Cancel anytime · 100% secure
            </p>
          </div>
        </DoubleBezelCard>
      </div>
    </div>
  );
};
