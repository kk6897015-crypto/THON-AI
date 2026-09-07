import React, { useState } from 'react';
import { DoubleBezelCard } from './DoubleBezelCard.jsx';
import { TactileButton } from './TactileButton.jsx';
import { telegramApi } from '../services/api.js';
import { CheckIcon } from './Icons.jsx';

export const TelegramLinkModal = ({ teamId, isOpen, onClose, onSuccess }) => {
  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const handleLink = async (e) => {
    e.preventDefault();
    if (!chatId.trim()) return;

    setLoading(true);
    try {
      const res = await telegramApi.link({
        team_id: teamId,
        chat_id: chatId.trim()
      });
      setTestSent(res.data.test_message_sent);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to link Telegram chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-float">
      <div className="w-full max-w-md">
        <DoubleBezelCard>
          <div className="space-y-4 p-2">
            <div className="flex items-center justify-between border-b border-[#F5E8E2]/10 pb-3">
              <h3 className="font-heading text-xl font-bold text-white">
                Link Telegram Daily Digest Bot
              </h3>
              <button onClick={onClose} className="text-[#A89892] hover:text-white p-1">
                ✕
              </button>
            </div>

            <p className="text-xs text-[#D8C3BB]">
              Receive daily push digests matching your team's tags & escalating deadline countdowns direct to Telegram.
            </p>

            <div className="bg-[#140E0D] p-3 rounded-xl border border-[#F5E8E2]/10 space-y-2 text-xs text-[#D8C3BB]">
              <div className="font-bold text-[#F87059]">How to connect:</div>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open Telegram & search for your team bot or official bot.</li>
                <li>Add bot to your team group and send <code className="bg-[#1E1412] px-1 py-0.5 rounded text-[#F5E8E2]">/start</code>.</li>
                <li>Copy your Chat ID (or group ID) and paste it below.</li>
              </ol>
            </div>

            <form onSubmit={handleLink} className="space-y-4">
              <div>
                <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">
                  Telegram Chat ID / Group ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. -100123456789 or 987654321"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#DE3C25]"
                />
              </div>

              {testSent && (
                <div className="p-3 rounded-xl bg-[#2D1815] border border-[#DE3C25]/40 text-[#F87059] text-xs font-mono-tabular">
                  ✓ Telegram bot linked successfully! Test message dispatched.
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-pill-secondary text-xs"
                >
                  Skip for Now
                </button>
                <TactileButton
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  icon={<CheckIcon className="w-3.5 h-3.5" />}
                >
                  {loading ? 'Verifying Chat...' : 'Save Telegram Link'}
                </TactileButton>
              </div>
            </form>
          </div>
        </DoubleBezelCard>
      </div>
    </div>
  );
};
