import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  KanbanIcon,
  CompassIcon,
  UsersIcon,
  ShieldCheckIcon,
  SparklesIcon,
  PresentationIcon,
  FileAuditIcon,
  LogoutIcon
} from './Icons.jsx';

export const SidebarNav = ({ currentTab, setTab }) => {
  const { user, activeTeam, logout } = useAuth();

  const navItems = [
    { id: 'kanban', label: 'Hackathons', icon: <KanbanIcon className="w-4 h-4" />, badge: '6 Live' },
    { id: 'discover', label: 'Discover', icon: <CompassIcon className="w-4 h-4" />, badge: 'Tamil Nadu' },
    { id: 'teams', label: 'Team Hub', icon: <UsersIcon className="w-4 h-4" />, badge: activeTeam ? activeTeam.name : 'No Team' },
    { id: 'eligibility', label: 'Eligibility', icon: <ShieldCheckIcon className="w-4 h-4" />, badge: 'Auto' },
    { id: 'novelty', label: 'Novelty AI', icon: <SparklesIcon className="w-4 h-4" />, badge: 'arXiv' },
    { id: 'deck', label: 'Deck Studio', icon: <PresentationIcon className="w-4 h-4" />, badge: 'PPTX' },
    { id: 'ppt', label: 'PPT Audit', icon: <FileAuditIcon className="w-4 h-4" />, badge: 'Lint' }
  ];

  return (
    <aside className="hidden xl:flex flex-col justify-between w-64 h-[calc(100vh-2rem)] sticky top-4 z-40 p-4 rounded-3xl bg-[#140E0D]/90 backdrop-blur-3xl border border-[#F5E8E2]/10 shadow-2xl shadow-black/80">
      {/* Top Logo & App Header */}
      <div className="space-y-6">
        <div
          onClick={() => setTab('kanban')}
          className="flex items-center gap-3 px-3 py-2 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#DE3C25] to-[#F58A7A] flex items-center justify-center font-heading font-extrabold text-white text-lg shadow-lg shadow-[#DE3C25]/40 group-hover:scale-105 transition-transform">
              TL
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#DE3C25] animate-ping absolute -top-1 -right-1" />
          </div>

          <div className="flex flex-col">
            <span className="font-heading font-bold text-lg tracking-tight text-white group-hover:text-[#F87059] transition-colors">
              TeamLaunch
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#DE3C25] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DE3C25]" />
              COMMAND CENTER
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          <span className="px-3 text-[10px] font-mono-tabular uppercase tracking-wider text-[#A89892] font-semibold block mb-2">
            Main Menu
          </span>
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group relative ${
                  active
                    ? 'bg-gradient-to-r from-[#DE3C25] to-[#EA580C] text-white shadow-xl shadow-[#DE3C25]/30 scale-[1.02]'
                    : 'text-[#D8C3BB] hover:text-white hover:bg-[#221715]'
                }`}
              >
                {active && (
                  <span className="w-1.5 h-6 rounded-r-full bg-[#F5E8E2] absolute -left-4 top-2" />
                )}
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                    active
                      ? 'bg-white/20 text-white shadow-inner'
                      : 'bg-[#1E1412] text-[#A89892] group-hover:text-white group-hover:bg-[#2D1815]'
                  }`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                <span
                  className={`text-[10px] font-mono-tabular px-2 py-0.5 rounded-full ${
                    active
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-[#221715] text-[#A89892] group-hover:text-[#F5E8E2]'
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Logout Rail */}
      <div className="pt-4 border-t border-[#F5E8E2]/10 space-y-3">
        {user ? (
          <div className="p-3 rounded-2xl bg-[#1E1412] border border-[#F5E8E2]/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#DE3C25] to-[#F58A7A] flex items-center justify-center font-bold text-white text-xs uppercase shrink-0">
                {user.name?.[0] || 'U'}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-white truncate">
                  {user.name}
                </span>
                <span className="text-[10px] text-[#A89892] truncate">
                  {user.email}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-[#A89892] hover:text-[#DE3C25] p-2 rounded-lg hover:bg-[#2D1815] transition-colors shrink-0 flex items-center justify-center"
              title="Sign Out"
            >
              <LogoutIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setTab('auth')}
            className="w-full btn-pill-primary text-xs font-bold justify-center py-2.5"
          >
            Sign In / Join
          </button>
        )}
      </div>
    </aside>
  );
};
