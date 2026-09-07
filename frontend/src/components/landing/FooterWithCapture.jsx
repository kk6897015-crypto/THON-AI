import React, { useState } from 'react';
import { siteConfig } from '../../config/siteConfig.js';

export const FooterWithCapture = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="pt-16 pb-8 border-t border-[#F5E8E2]/10 space-y-12">
      {/* Email Capture Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#181110] via-[#241715] to-[#1E1210] border border-[#DE3C25]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-[#DE3C25]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <span className="text-[10px] font-mono-tabular uppercase tracking-widest text-[#DE3C25] font-bold">
              Weekly Competition Digest
            </span>
            <h3 className="font-heading font-bold text-2xl sm:text-3xl text-white">
              Never Miss a National Hackathon Deadline
            </h3>
            <p className="text-xs text-[#D8C3BB] max-w-md leading-relaxed">
              Curated opportunities across Tamil Nadu, SIH problem statements, Devfolio registrations, and IEEE calls sent straight to your inbox.
            </p>
          </div>

          <div>
            {subscribed ? (
              <div className="p-4 rounded-2xl bg-[#DE3C25]/20 border border-[#DE3C25]/50 text-center animate-fadeIn">
                <span className="text-sm font-bold text-white block">
                  🎉 You are now subscribed to the digest!
                </span>
                <span className="text-xs text-[#F87059]">
                  Keep building and checking deadlines.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your college or personal email..."
                  className="flex-1 bg-[#140E0D] border border-[#F5E8E2]/15 rounded-2xl px-4 py-3 text-xs text-white placeholder-[#A89892] focus:outline-none focus:border-[#DE3C25]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#DE3C25] to-[#EA580C] hover:scale-105 transition-transform shadow-lg shadow-[#DE3C25]/30 whitespace-nowrap"
                >
                  Subscribe →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Links & Attribution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-xs text-[#D8C3BB]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#DE3C25] to-[#F58A7A] flex items-center justify-center font-bold text-white">
              TL
            </div>
            <span className="font-heading font-bold text-lg text-white">
              TeamLaunch
            </span>
          </div>
          <p className="text-[11px] text-[#A89892] leading-relaxed">
            {siteConfig.description}
          </p>
          <div className="flex items-center gap-2 text-[11px] font-mono-tabular text-[#DE3C25]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DE3C25] animate-ping" />
            <span>Operational & Synced 2026</span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono-tabular uppercase tracking-wider text-white font-bold block">
            Command Center Tools
          </span>
          <ul className="space-y-1.5">
            <li>Discover Hackathons (Tamil Nadu)</li>
            <li>Eligibility & Completeness Engine</li>
            <li>Semantic Scholar Prior-Art Search</li>
            <li>Pitch Deck Studio (.pptx Export)</li>
            <li>PPT Structural Linter</li>
          </ul>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono-tabular uppercase tracking-wider text-white font-bold block">
            Integrations
          </span>
          <ul className="space-y-1.5">
            <li>Telegram Digest Bot</li>
            <li>WhatsApp Deadline Alerts</li>
            <li>Unstop Hackathon Feeds</li>
            <li>Devfolio Opportunities</li>
            <li>SIH Nodal Centers</li>
          </ul>
        </div>

        <div className="space-y-3">
          <span className="text-[10px] font-mono-tabular uppercase tracking-wider text-white font-bold block">
            Built by {siteConfig.creator}
          </span>
          <p className="text-[11px] text-[#A89892]">
            Engineered by <span className="text-white font-bold">HARISH M</span> for developer hackathon champions.
          </p>
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1C1312] hover:bg-[#2D1815] border border-[#F5E8E2]/15 text-white text-xs font-bold transition-all"
          >
            <span>GitHub Repository ↗</span>
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="pt-6 border-t border-[#F5E8E2]/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono-tabular text-[#A89892]">
        <span>© 2026 TeamLaunch Inc. Built for builders. All rights reserved.</span>
        <span>Lead Architect: HARISH M (@kk6897015)</span>
      </div>
    </footer>
  );
};

export default FooterWithCapture;
