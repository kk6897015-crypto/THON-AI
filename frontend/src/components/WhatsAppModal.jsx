import React, { useState } from 'react';
import { DoubleBezelCard } from './DoubleBezelCard.jsx';
import { TactileButton } from './TactileButton.jsx';

export const WhatsAppModal = ({ teamId, isOpen, onClose }) => {
  const [groupName, setGroupName] = useState('Team Launch Squad');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [dailyAlerts, setDailyAlerts] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [linked, setLinked] = useState(false);

  if (!isOpen) return null;

  const handleLinkGroup = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLinked(true);
    }, 1000);
  };

  const handleTestAlert = () => {
    alert(`🚀 Test alert sent to WhatsApp Group "${groupName}"!\nMessage: "🔥 Flipkart GRID 6.0 deadline closing in 2 days. Complete team registration now!"`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg">
        <DoubleBezelCard>
          <div className="space-y-4 p-2">
            <div className="flex items-center justify-between border-b border-[#F5E8E2]/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#DE3C25]/20 border border-[#DE3C25]/40 flex items-center justify-center font-bold text-[#F87059] text-sm">
                  💬
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-white">
                    WhatsApp Team Group Integration
                  </h3>
                  <p className="text-xs text-[#A89892]">
                    Connect WhatsApp bot to notify your team group
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-[#A89892] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {linked ? (
              <div className="p-4 rounded-xl bg-[#2D1815] border border-[#DE3C25]/40 space-y-3">
                <div className="flex items-center gap-2 text-[#F87059] font-bold text-sm">
                  <span>✓</span>
                  <span>WhatsApp Group Connected Successfully!</span>
                </div>
                <p className="text-xs text-[#D8C3BB]">
                  Team Leader group <strong className="text-white">"{groupName}"</strong> is active. Our AI bot will send live hackathon alerts & daily digests.
                </p>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={handleTestAlert}
                    className="btn-pill-primary text-xs !py-1.5 !px-3"
                  >
                    🚀 Send Test Alert
                  </button>
                  <button
                    onClick={onClose}
                    className="btn-pill-secondary text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLinkGroup} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#D8C3BB] mb-1">
                    WhatsApp Team Group Name
                  </label>
                  <input
                    type="text"
                    required
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. Hackathon Team Alpha"
                    className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#DE3C25]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D8C3BB] mb-1">
                    Team Leader Mobile (WhatsApp Number)
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE3C25]"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-[#F5E8E2]/10">
                  <span className="text-xs font-semibold text-[#A89892] block">Bot Alert Settings:</span>
                  <label className="flex items-center gap-2.5 text-xs text-[#D8C3BB] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dailyAlerts}
                      onChange={(e) => setDailyAlerts(e.target.checked)}
                      className="rounded accent-[#DE3C25]"
                    />
                    <span>Daily Morning Hackathon Summary Digest (09:00 AM)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-[#D8C3BB] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deadlineAlerts}
                      onChange={(e) => setDeadlineAlerts(e.target.checked)}
                      className="rounded accent-[#DE3C25]"
                    />
                    <span>Urgent Submission Deadline Warnings (24h & 2h before)</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-pill-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <TactileButton type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Connecting...' : 'Connect WhatsApp Group'}
                  </TactileButton>
                </div>
              </form>
            )}
          </div>
        </DoubleBezelCard>
      </div>
    </div>
  );
};
