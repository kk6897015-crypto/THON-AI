import React from 'react';
import { siteConfig } from '../../config/siteConfig.js';
import { DoubleBezelCard } from '../DoubleBezelCard.jsx';
import { TactileButton } from '../TactileButton.jsx';

export const PricingSection = ({ onSelectPlan }) => {
  return (
    <section className="py-12 border-t border-[#F5E8E2]/10 space-y-10">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DE3C25]/15 border border-[#DE3C25]/35 text-xs font-mono-tabular text-[#F87059]">
          <span>💎</span>
          <span>TRANSPARENT VALUE</span>
        </div>
        <h2 className="font-heading text-3xl sm:text-5xl font-normal sm:font-medium tracking-tight text-white">
          Simple, Fair Pricing
        </h2>
        <p className="text-sm text-[#D8C3BB] leading-relaxed">
          1st competition application tracking is always free. Upgrade when your team wants deep arXiv novelty search and automated PPTX exports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {siteConfig.pricing.map((tier) => (
          <div key={tier.name} className={`relative flex flex-col ${tier.popular ? 'md:-translate-y-2' : ''}`}>
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono-tabular font-bold bg-[#DE3C25] text-white uppercase tracking-wider shadow-lg shadow-[#DE3C25]/50 border border-white/20">
                  Most Popular
                </span>
              </div>
            )}
            <DoubleBezelCard>
              <div className={`p-4 space-y-6 flex flex-col justify-between h-full ${tier.popular ? 'border-[#DE3C25]/40' : ''}`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-xl text-white">
                      {tier.name}
                    </h3>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold font-heading text-white">
                      {tier.price}
                    </span>
                    <span className="text-xs font-mono-tabular text-[#A89892]">
                      / {tier.cadence}
                    </span>
                  </div>

                  <p className="text-xs text-[#D8C3BB] leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="pt-2 border-t border-[#F5E8E2]/10 space-y-2.5">
                    <span className="text-[10px] font-mono-tabular uppercase tracking-wider text-[#A89892] font-semibold block">
                      What's Included
                    </span>
                    <ul className="space-y-2 text-xs text-[#D8C3BB]">
                      {tier.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#DE3C25] font-bold">✓</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => onSelectPlan && onSelectPlan(tier)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-lg ${
                      tier.popular
                        ? 'bg-gradient-to-r from-[#DE3C25] to-[#EA580C] text-white hover:scale-[1.02] shadow-[#DE3C25]/30'
                        : 'bg-[#1C1312] hover:bg-[#2D1815] text-[#F5E8E2] border border-[#F5E8E2]/15'
                    }`}
                  >
                    {tier.cta} →
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

export default PricingSection;
