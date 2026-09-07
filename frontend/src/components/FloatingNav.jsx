import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import GooeyNav from './GooeyNav.jsx';
import {
  KanbanIcon,
  CompassIcon,
  UsersIcon,
  ShieldCheckIcon,
  SparklesIcon,
  PresentationIcon,
  FileAuditIcon,
  SunIcon,
  MoonIcon
} from './Icons.jsx';

export const FloatingNav = ({ currentTab, setTab, onTriggerBatman }) => {
  const { user, activeTeam, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'kanban', label: 'Hackathons', icon: <KanbanIcon className="w-4 h-4" /> },
    { id: 'discover', label: 'Discover', icon: <CompassIcon className="w-4 h-4" /> },
    { id: 'teams', label: 'Team Hub', icon: <UsersIcon className="w-4 h-4" /> },
    { id: 'eligibility', label: 'Eligibility', icon: <ShieldCheckIcon className="w-4 h-4" /> },
    { id: 'novelty', label: 'Novelty AI', icon: <SparklesIcon className="w-4 h-4" /> },
    { id: 'deck', label: 'Deck Studio', icon: <PresentationIcon className="w-4 h-4" /> },
    { id: 'ppt', label: 'PPT Audit', icon: <FileAuditIcon className="w-4 h-4" /> }
  ];

  const gooeyItems = [
    { label: 'Hackathons', id: 'kanban' },
    { label: 'Discover', id: 'discover' },
    { label: 'Eligibility', id: 'eligibility' },
    { label: 'Novelty', id: 'novelty' },
    { label: 'Deck', id: 'deck' },
    { label: 'PPT', id: 'ppt' }
  ];

  const currentActiveIndex = gooeyItems.findIndex(i => i.id === currentTab);

  return (
    <header className="sticky top-4 z-30 mb-6">
      <div className="glass-pill-nav px-5 py-3 flex items-center justify-between shadow-2xl border border-[#F5E8E2]/12">
        {/* Brand Logo / Mobile Trigger */}
        <div
          onClick={() => setTab('kanban')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#DE3C25] to-[#F58A7A] flex items-center justify-center font-heading font-extrabold text-white text-base shadow-md shadow-[#DE3C25]/30 group-hover:scale-105 transition-transform">
            TL
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-base tracking-tight text-white group-hover:text-[#F87059] transition-colors">
              TeamLaunch <span className="text-[10px] font-mono-tabular font-bold px-1.5 py-0.5 rounded bg-[#DE3C25]/20 text-[#F87059] border border-[#DE3C25]/30">PRO</span>
            </span>
            {activeTeam && (
              <span className="text-[11px] font-medium text-[#D8C3BB] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DE3C25] animate-pulse" />
                {activeTeam.name}
              </span>
            )}
          </div>
        </div>

        {/* Medium-screen Interactive Gooey Navigation */}
        <div className="hidden md:flex xl:hidden">
          <GooeyNav
            items={gooeyItems}
            initialActiveIndex={currentActiveIndex >= 0 ? currentActiveIndex : 0}
            onItemSelect={(item) => setTab(item.id)}
            particleCount={12}
            animationTime={500}
            colors={[1, 2, 3, 4]}
          />
        </div>

        {/* Right side user status & actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Mode Switcher */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1C1312] hover:bg-[#2D1815] border border-[#F5E8E2]/10 text-xs text-[#F5E8E2] transition-all hover:scale-110 shadow-md"
          >
            {theme === 'dark' ? <SunIcon className="w-4 h-4 text-amber-300" /> : <MoonIcon className="w-4 h-4 text-cyan-300" />}
          </button>

          {/* Bat-Signal Launch Button */}
          {onTriggerBatman && (
            <button
              onClick={onTriggerBatman}
              title="Activate Batman Protocol"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C1312] hover:bg-[#DE3C25]/20 border border-[#F5E8E2]/10 hover:border-[#DE3C25]/40 text-xs font-semibold text-[#D8C3BB] hover:text-white transition-all shadow-md group"
            >
              <span className="group-hover:scale-125 transition-transform">🦇</span>
              <span className="hidden lg:inline text-[11px] font-mono-tabular">Bat-Signal</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1C1312] border border-[#F5E8E2]/10 text-xs font-semibold text-[#D8C3BB]">
            <span className="w-2 h-2 rounded-full bg-[#DE3C25] animate-ping" />
            <span>Feed Live</span>
          </div>

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-[#F5E8E2]/10">
              <div className="flex items-center gap-2 bg-[#2D1815] px-3 py-1.5 rounded-full border border-[#F5E8E2]/12">
                <div className="w-6 h-6 rounded-xl bg-[#DE3C25] flex items-center justify-center text-xs font-bold text-white uppercase">
                  {user.name?.[0] || 'U'}
                </div>
                <span className="text-xs font-bold text-[#F5E8E2] truncate max-w-[100px]">
                  {user.name}
                </span>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-[#A89892] hover:text-[#DE3C25] hover:bg-[#2D1815] border border-[#F5E8E2]/10 transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setTab('auth')}
              className="btn-pill-primary text-xs font-bold px-5 py-2"
            >
              Sign In / Join
            </button>
          )}
        </div>

        {/* Mobile Hamburger toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="xl:hidden p-2 rounded-xl bg-[#2D1815] border border-[#F5E8E2]/12 text-[#F5E8E2] hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="xl:hidden mt-2 p-3 glass-panel space-y-1.5 border border-[#F5E8E2]/12 shadow-2xl animate-float">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id);
                setMobileOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2.5 ${
                currentTab === item.id
                  ? 'bg-gradient-to-r from-[#DE3C25] to-[#EA580C] text-white font-bold'
                  : 'text-[#D8C3BB] hover:bg-[#2D1815]'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          <div className="pt-2 border-t border-[#F5E8E2]/10">
            {user ? (
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-[#DE3C25] hover:bg-[#2D1815]"
              >
                Sign Out ({user.name})
              </button>
            ) : (
              <button
                onClick={() => {
                  setTab('auth');
                  setMobileOpen(false);
                }}
                className="w-full btn-pill-primary text-center justify-center text-sm font-bold py-2.5"
              >
                Sign In / Join
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};


