import React, { useState } from 'react';
import { siteConfig } from '../../config/siteConfig.js';
import { DoubleBezelCard } from '../DoubleBezelCard.jsx';

export const AccordionFAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="py-12 border-t border-[#F5E8E2]/10 space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DE3C25]/15 border border-[#DE3C25]/35 text-xs font-mono-tabular text-[#F87059]">
          <span>❓</span>
          <span>FREQUENTLY ASKED QUESTIONS</span>
        </div>
        <h2 className="font-heading text-3xl sm:text-5xl font-normal sm:font-medium tracking-tight text-white">
          Everything You Need to Know
        </h2>
      </div>

      <div className="space-y-4">
        {siteConfig.faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <DoubleBezelCard key={index}>
              <div className="p-2">
                <button
                  onClick={() => toggle(index)}
                  className="w-full text-left py-3 px-4 flex items-center justify-between gap-4 group"
                  aria-expanded={isOpen}
                >
                  <span className="font-heading font-bold text-base sm:text-lg text-white group-hover:text-[#F87059] transition-colors">
                    {faq.q}
                  </span>
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center bg-[#1E1412] text-sm text-[#DE3C25] font-bold shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-[#DE3C25] text-white' : ''}`}>
                    ▼
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-[#D8C3BB] leading-relaxed border-t border-[#F5E8E2]/5 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            </DoubleBezelCard>
          );
        })}
      </div>
    </section>
  );
};

export default AccordionFAQ;
