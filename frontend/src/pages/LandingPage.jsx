import React from 'react';
import { siteConfig } from '../config/siteConfig.js';
import { DoubleBezelCard } from '../components/DoubleBezelCard.jsx';
import { TactileButton } from '../components/TactileButton.jsx';
import TextLoop from '../components/TextLoop.jsx';
import ProfileCard from '../components/ProfileCard.jsx';
import GooeyNav from '../components/GooeyNav.jsx';

// Modular Landing Sections
import LogoMarquee from '../components/landing/LogoMarquee.jsx';
import BentoGridFeatures from '../components/landing/BentoGridFeatures.jsx';
import StickyHowItWorks from '../components/landing/StickyHowItWorks.jsx';
import TestimonialsSection from '../components/landing/TestimonialsSection.jsx';
import PricingSection from '../components/landing/PricingSection.jsx';
import AccordionFAQ from '../components/landing/AccordionFAQ.jsx';
import FooterWithCapture from '../components/landing/FooterWithCapture.jsx';

export const LandingPage = ({ onGetStarted, onExploreTab }) => {
  const handleTab = (tab) => {
    if (onExploreTab) {
      onExploreTab(tab);
    } else if (onGetStarted) {
      onGetStarted();
    }
  };

  const toolPills = [
    { label: '🧭 Discover TN', id: 'discover' },
    { label: '⚡ Eligibility', id: 'eligibility' },
    { label: '💡 Novelty AI', id: 'novelty' },
    { label: '📊 Deck Studio', id: 'deck' },
    { label: '🔍 PPT Audit', id: 'ppt' }
  ];

  return (
    <div className="space-y-16 py-8 px-4 max-w-7xl mx-auto">
      {/* 1. Parallax Hero Section with CTA */}
      <section className="text-center space-y-8 pt-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-[#DE3C25]/12 rounded-full blur-[110px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2D1815]/90 border border-[#DE3C25]/40 text-xs font-mono-tabular text-[#F5E8E2] shadow-xl backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#DE3C25] animate-pulse" />
          <span>{siteConfig.tagline.toUpperCase()}</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#DE3C25]/20 text-[#F87059] border border-[#DE3C25]/30">
            2026 EDITION
          </span>
        </div>

        <h1 className="font-heading font-normal sm:font-medium text-4xl sm:text-6xl md:text-7xl tracking-tight leading-[1.08] text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] via-[#FAF6F4] to-[#D8C3BB] max-w-4xl mx-auto">
          Team Formation, Idea Validation & Competition Tracker
        </h1>

        <p className="text-base sm:text-lg text-[#D8C3BB] max-w-2xl mx-auto leading-relaxed">
          {siteConfig.description}
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 relative z-10">
          <TactileButton variant="primary" onClick={onGetStarted} icon="→">
            Launch Team Workspace
          </TactileButton>
          <button
            onClick={() => handleTab('discover')}
            className="px-6 py-3.5 rounded-full text-xs font-bold text-white bg-[#1C1312] hover:bg-[#2D1815] border border-[#F5E8E2]/15 transition-all shadow-lg hover:scale-105 flex items-center gap-2"
          >
            <span>🧭</span>
            <span>Browse Tamil Nadu Hackathons</span>
          </button>
        </div>

        {/* Interactive GooeyNav Quick Switcher */}
        <div className="pt-4 flex flex-col items-center gap-2 relative z-10">
          <span className="text-[10px] font-mono-tabular uppercase tracking-widest text-[#A89892]">
            Explore Interactive Live Tools
          </span>
          <GooeyNav
            items={toolPills}
            initialActiveIndex={0}
            onItemSelect={(item) => handleTab(item.id)}
            particleCount={14}
            animationTime={500}
            colors={[1, 2, 3, 4]}
          />
        </div>

        {/* Live Metrics Counter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-[#F5E8E2]/10">
          <div className="p-3 rounded-2xl bg-[#140E0D]/60 border border-[#F5E8E2]/5">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-white block">
              150+
            </span>
            <span className="text-[11px] font-mono-tabular text-[#A89892]">
              Competitions Synced
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[#140E0D]/60 border border-[#F5E8E2]/5">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-white block">
              ₹25L+
            </span>
            <span className="text-[11px] font-mono-tabular text-[#A89892]">
              Prize Pools Tracked
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[#140E0D]/60 border border-[#F5E8E2]/5">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-white block">
              200M+
            </span>
            <span className="text-[11px] font-mono-tabular text-[#A89892]">
              arXiv & IEEE Papers
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[#140E0D]/60 border border-[#F5E8E2]/5">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-white block">
              100%
            </span>
            <span className="text-[11px] font-mono-tabular text-[#A89892]">
              Deterministic Compliance
            </span>
          </div>
        </div>
      </section>

      {/* 2. Synced Platform Logo Marquee */}
      <LogoMarquee />

      {/* 3. Dynamic Animated TextLoop Ribbon from React Bits */}
      <section className="relative overflow-hidden rounded-3xl border border-[#DE3C25]/25 bg-gradient-to-r from-[#140E0D] via-[#1F1311] to-[#140E0D] shadow-2xl backdrop-blur-2xl px-2 py-3">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#DE3C25]/15 via-transparent to-transparent blur-3xl" />
        <div className="flex items-center justify-between px-4 pb-2 border-b border-[#F5E8E2]/5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#DE3C25] animate-ping" />
            <span className="text-[11px] font-mono-tabular uppercase tracking-widest text-[#A89892] font-semibold">
              Live Interactive Wave Ribbon
            </span>
          </div>
          <span className="text-[10px] font-mono-tabular text-[#DE3C25] px-2 py-0.5 rounded bg-[#DE3C25]/10 border border-[#DE3C25]/30">
            Hover to Pause
          </span>
        </div>
        <TextLoop
          text="TeamLaunch ✦ Hackathon Command Center ✦ Idea Novelty Engine ✦ AI Pitch Deck Studio ✦ Automated Eligibility ✦ Tamil Nadu Hackathons"
          shape="wave"
          speed={85}
          direction="forward"
          separator="✦"
          curviness={65}
          fontSize={34}
          fontWeight={800}
          letterSpacing={2}
          uppercase
          color="#F5E8E2"
          ribbon={true}
          ribbonColor="rgba(222, 60, 37, 0.22)"
          ribbonWidth={68}
          pauseOnHover={true}
          className="py-1"
        />
      </section>

      {/* 4. Bento Grid Features Architecture */}
      <BentoGridFeatures onSelectTab={handleTab} />

      {/* 5. Sticky How-It-Works Timeline */}
      <StickyHowItWorks />

      {/* 6. Animated Campus Winners Testimonials */}
      <TestimonialsSection />

      {/* 7. 3-Tier Transparent Pricing Cards */}
      <PricingSection onSelectPlan={() => onGetStarted && onGetStarted()} />

      {/* 8. Accordion FAQ */}
      <AccordionFAQ />

      {/* 9. Developer Showcase Section featuring HARISH M with ProfileCard */}
      <section className="pt-12 border-t border-[#F5E8E2]/10 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DE3C25]/15 border border-[#DE3C25]/35 text-xs font-mono-tabular text-[#F87059]">
            <span>👨‍💻</span>
            <span>SYSTEM ARCHITECT & LEAD DEVELOPER</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-normal sm:font-medium tracking-tight text-white">
            Built for Hackathon Champions
          </h2>
          <p className="text-sm text-[#D8C3BB] leading-relaxed">
            Engineered with high-concurrency local database synchronization, automated prior-art novelty verification, and precision PPTX structural auditing.
          </p>
        </div>

        <div className="flex justify-center py-4">
          <ProfileCard
            name="HARISH M"
            title="Full-Stack AI Systems Architect"
            handle="kk6897015"
            status="Active & Building 🚀"
            slogan="Built for builders"
            contactText="GitHub Profile ↗"
            behindGlowEnabled={true}
            behindGlowColor="rgba(222, 60, 37, 0.7)"
            enableTilt={true}
            onContactClick={() => window.open(siteConfig.github, '_blank')}
          />
        </div>
      </section>

      {/* 10. Footer with Newsletter Capture */}
      <FooterWithCapture />
    </div>
  );
};

export default LandingPage;
