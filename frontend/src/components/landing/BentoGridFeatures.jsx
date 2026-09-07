import React from 'react';
import { siteConfig } from '../../config/siteConfig.js';
import { DoubleBezelCard } from '../DoubleBezelCard.jsx';

export const BentoGridFeatures = ({ onSelectTab }) => {
  return (
    <section className="space-y-8 py-10">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DE3C25]/15 border border-[#DE3C25]/35 text-xs font-mono-tabular text-[#F87059]">
          <span>⚡</span>
          <span>BENTO GRID SYSTEM ARCHITECTURE</span>
        </div>
        <h2 className="font-heading text-3xl sm:text-5xl font-normal sm:font-medium tracking-tight text-white">
          Engineered for Victory
        </h2>
        <p className="text-sm text-[#D8C3BB] leading-relaxed">
          Four purpose-built pillars replacing chaotic spreadsheets, disjointed Google Slides, and last-minute eligibility panics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {siteConfig.bentoFeatures.map((feat) => (
          <div key={feat.id} className={feat.colSpan}>
            <DoubleBezelCard>
              <div className="p-2 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono-tabular font-bold uppercase px-2.5 py-1 rounded-full bg-[#DE3C25]/20 text-[#F87059] border border-[#DE3C25]/40">
                      {feat.badge}
                    </span>
                    <span className="text-xs font-mono-tabular text-[#A89892]">
                      {feat.stats}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
                    {feat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#D8C3BB] leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onSelectTab && onSelectTab(feat.tab)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#1C1312] to-[#2D1815] hover:from-[#DE3C25] hover:to-[#EA580C] border border-[#F5E8E2]/15 hover:border-transparent transition-all shadow-md flex items-center justify-between group"
                  >
                    <span>{feat.actionLabel}</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            </DoubleBezelCard>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BentoGridFeatures;
