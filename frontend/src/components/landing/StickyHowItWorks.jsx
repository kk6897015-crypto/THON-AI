import React from 'react';
import { siteConfig } from '../../config/siteConfig.js';
import { DoubleBezelCard } from '../DoubleBezelCard.jsx';

export const StickyHowItWorks = () => {
  return (
    <section className="py-12 border-t border-[#F5E8E2]/10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sticky Header */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DE3C25]/15 border border-[#DE3C25]/35 text-xs font-mono-tabular text-[#F87059]">
            <span>🧭</span>
            <span>END-TO-END PIPELINE</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-normal sm:font-medium tracking-tight text-white leading-tight">
            How Hackathon Winners Operate
          </h2>
          <p className="text-sm text-[#D8C3BB] leading-relaxed">
            From initial team formation and automated Unstop synchronization to prior-art defense and final presentation audit.
          </p>
          <div className="p-4 rounded-2xl bg-[#140E0D] border border-[#F5E8E2]/10 space-y-2">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#DE3C25] animate-ping" />
              Continuous Telegram & WhatsApp Bot Alerts
            </span>
            <p className="text-[11px] text-[#A89892]">
              Push updates keep your entire roster synchronized 48 hours before critical milestone deadlines.
            </p>
          </div>
        </div>

        {/* Right Stepper Cards */}
        <div className="lg:col-span-7 space-y-6">
          {siteConfig.howItWorks.map((item, index) => (
            <DoubleBezelCard key={item.step}>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#DE3C25] to-[#F58A7A] flex items-center justify-center font-heading font-extrabold text-white text-lg shadow-lg shadow-[#DE3C25]/30 shrink-0">
                    {item.step}
                  </div>
                  <h3 className="font-heading font-bold text-xl text-white">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#D8C3BB] leading-relaxed pl-16">
                  {item.desc}
                </p>
              </div>
            </DoubleBezelCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StickyHowItWorks;
