import React, { useState, useMemo } from 'react';
import { CountDownBadge } from './CountDownBadge.jsx';
import { TactileButton } from './TactileButton.jsx';
import { competitionApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const KanbanBoard = ({
  competitions,
  onRefresh,
  onOpenAddModal,
  onRequireSubscription
}) => {
  const { activeTeam } = useAuth();
  const [movingId, setMovingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [liveFeed, setLiveFeed] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);

  const fetchLiveFeed = async () => {
    setShowLiveModal(true);
    setLiveLoading(true);
    try {
      const res = await competitionApi.getLiveFeed();
      setLiveFeed(res.data.hackathons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLiveLoading(false);
    }
  };

  const handleTrackLiveHackathon = async (hackathon) => {
    const teamId = activeTeam?.id || (competitions && competitions.length > 0 ? competitions[0].team_id : null);
    if (!teamId) {
      alert('Please select or create a team first in Team Hub before tracking hackathons.');
      return;
    }

    try {
      const tagsString = Array.isArray(hackathon.tags) ? hackathon.tags.join(', ') : hackathon.tags || 'AI, Hackathon';
      await competitionApi.add({
        team_id: teamId,
        title: hackathon.title,
        source_url: hackathon.source_url || 'https://unstop.com',
        platform: hackathon.platform || 'Unstop',
        level: hackathon.level || 'national',
        tags: tagsString,
        deadline: hackathon.deadline || '2026-04-15',
        eligibility_raw_text: hackathon.eligibility_raw_text || ''
      });
      onRefresh();
      alert(`🚀 Successfully added "${hackathon.title}" to your Hackathon Tracker!`);
      setShowLiveModal(false);
    } catch (err) {
      console.error('Failed to track hackathon:', err);
      alert(err.response?.data?.error || 'Failed to add hackathon to board.');
    }
  };

  const columns = [
    { id: 'saved', title: 'Saved & Tracked', color: 'from-[#DE3C25]/20 to-[#DE3C25]/5', borderColor: 'border-[#DE3C25]/30' },
    { id: 'in_progress', title: 'In Progress', color: 'from-[#F58A7A]/20 to-[#F58A7A]/5', borderColor: 'border-[#F58A7A]/30' },
    { id: 'applied', title: 'Applied', color: 'from-[#F5E8E2]/15 to-[#F5E8E2]/5', borderColor: 'border-[#F5E8E2]/30' },
    { id: 'result', title: 'Results & Wins', color: 'from-[#DE3C25]/25 to-[#2D1815]', borderColor: 'border-[#DE3C25]/40' }
  ];

  // Filtered competitions
  const filteredCompetitions = useMemo(() => {
    return competitions.filter((comp) => {
      const matchesSearch = comp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(comp.tags) ? comp.tags.join(' ') : comp.tags || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPlatform = platformFilter === 'all' || 
        (comp.platform || '').toLowerCase().includes(platformFilter.toLowerCase());

      const matchesLevel = levelFilter === 'all' || comp.level === levelFilter;

      return matchesSearch && matchesPlatform && matchesLevel;
    });
  }, [competitions, searchQuery, platformFilter, levelFilter]);

  const stats = useMemo(() => {
    return {
      total: competitions.length,
      saved: competitions.filter(c => c.status === 'saved').length,
      inProgress: competitions.filter(c => c.status === 'in_progress').length,
      applied: competitions.filter(c => c.status === 'applied').length,
      results: competitions.filter(c => c.status === 'result').length,
    };
  }, [competitions]);

  const handleStatusMove = async (compId, newStatus) => {
    setMovingId(compId);
    try {
      await competitionApi.updateStatus(compId, { status: newStatus });
      onRefresh();
    } catch (err) {
      if (err.response?.status === 402 || err.response?.data?.requiresSubscription) {
        onRequireSubscription();
      } else {
        alert(err.response?.data?.error || 'Failed to update competition status');
      }
    } finally {
      setMovingId(null);
    }
  };

  const handleDelete = async (compId) => {
    if (!confirm('Are you sure you want to remove this competition?')) return;
    try {
      await competitionApi.delete(compId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="unstop-card p-6 border border-[#F5E8E2]/12 bg-gradient-to-r from-[#181110] via-[#241715] to-[#1E1210] shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#DE3C25]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DE3C25]/20 text-[#F87059] border border-[#DE3C25]/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#DE3C25] animate-ping" />
                OPPORTUNITY FEED
              </span>
              <span className="text-xs font-mono-tabular text-[#A89892]">
                Global Hackathons Synced
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-normal sm:font-medium text-white tracking-tight">
              Hackathon Progress Board
            </h1>
            <p className="text-sm text-[#D8C3BB] max-w-2xl leading-relaxed">
              Explore live hackathons from Unstop, Devfolio & global platforms. Track deadlines, manage eligibility, and submit winning pitches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchLiveFeed}
              className="px-4 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#DE3C25] to-[#EA580C] text-white shadow-lg hover:brightness-110 flex items-center gap-2 transition-all"
            >
              <span>🔥</span>
              <span>Live Hackathons Feed</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="btn-pill-secondary text-xs font-bold shadow-xl flex items-center gap-2 px-4 py-2.5"
            >
              <span className="text-base font-bold">+</span>
              <span>Add Custom Event</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#F5E8E2]/10">
          <div className="bg-[#140E0D]/70 p-3 rounded-xl border border-[#F5E8E2]/10">
            <p className="text-xs font-semibold text-[#A89892]">Total Tracked</p>
            <p className="text-2xl font-bold font-heading text-white">{stats.total}</p>
          </div>
          <div className="bg-[#140E0D]/70 p-3 rounded-xl border border-[#F5E8E2]/10">
            <p className="text-xs font-semibold text-[#F58A7A]">In Progress</p>
            <p className="text-2xl font-bold font-heading text-[#F87059]">{stats.inProgress}</p>
          </div>
          <div className="bg-[#140E0D]/70 p-3 rounded-xl border border-[#F5E8E2]/10">
            <p className="text-xs font-semibold text-[#F5E8E2]">Applied</p>
            <p className="text-2xl font-bold font-heading text-[#F5E8E2]">{stats.applied}</p>
          </div>
          <div className="bg-[#140E0D]/70 p-3 rounded-xl border border-[#F5E8E2]/10">
            <p className="text-xs font-semibold text-[#DE3C25]">Wins & Results</p>
            <p className="text-2xl font-bold font-heading text-[#F87059]">{stats.results}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="unstop-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-[#F5E8E2]/10 bg-[#181110]">
        <div className="relative w-full md:w-80">
          <svg className="w-4 h-4 absolute left-3.5 top-3 text-[#A89892]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search opportunities or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-[#F5E8E2] placeholder-[#A89892] focus:outline-none focus:border-[#DE3C25]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#A89892]">Platform:</span>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-[#140E0D] border border-[#F5E8E2]/15 text-xs font-semibold text-[#F5E8E2] rounded-xl px-3 py-2 focus:outline-none focus:border-[#DE3C25]"
            >
              <option value="all">All Platforms</option>
              <option value="unstop">Unstop</option>
              <option value="devfolio">Devfolio</option>
              <option value="college">College / University</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#A89892]">Level:</span>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-[#140E0D] border border-[#F5E8E2]/15 text-xs font-semibold text-[#F5E8E2] rounded-xl px-3 py-2 focus:outline-none focus:border-[#DE3C25]"
            >
              <option value="all">All Levels</option>
              <option value="state">State Level</option>
              <option value="national">National Level</option>
              <option value="global">Global Level</option>
              <option value="college">College Level</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {columns.map((col) => {
          const colItems = filteredCompetitions.filter((c) => c.status === col.id);

          return (
            <div key={col.id} className="flex flex-col min-h-[520px] bg-[#140E0D]/60 border border-[#F5E8E2]/10 rounded-2xl p-3 shadow-inner">
              {/* Column Header */}
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r ${col.color} border ${col.borderColor} mb-3`}>
                <span className="font-heading font-bold text-sm tracking-wide text-white">
                  {col.title}
                </span>
                <span className="font-mono-tabular text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#1E1412] text-[#F5E8E2] border border-[#F5E8E2]/10">
                  {colItems.length}
                </span>
              </div>

              {/* Column Cards or Empty State */}
              <div className="flex-1 space-y-3">
                {colItems.length === 0 ? (
                  <div className="h-44 flex flex-col items-center justify-center p-4 text-center border border-dashed border-[#F5E8E2]/10 rounded-xl bg-[#181110]/40">
                    <p className="text-xs text-[#A89892] mb-2">
                      No competitions in {col.title}
                    </p>
                    {col.id === 'saved' && (
                      <button
                        onClick={onOpenAddModal}
                        className="text-xs font-bold text-[#DE3C25] hover:underline"
                      >
                        + Add Opportunity
                      </button>
                    )}
                  </div>
                ) : (
                  colItems.map((comp) => (
                    <div
                      key={comp.id}
                      className="glass-card p-4 space-y-3 relative group border border-[#F5E8E2]/12 hover:border-[#DE3C25] bg-[#1E1412] transition-all shadow-xl rounded-3xl overflow-hidden"
                    >
                      {/* Thumbnail Accent Header */}
                      <div className="h-1.5 w-full bg-gradient-to-r from-[#DE3C25] to-[#F58A7A] absolute top-0 left-0" />

                      {/* Top platform & level badges */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#DE3C25]/15 text-[#F87059] border border-[#DE3C25]/30 uppercase tracking-wider">
                            {comp.platform || 'Unstop'}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#140E0D] text-[#D8C3BB] border border-[#F5E8E2]/10">
                            {comp.level || 'NATIONAL'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(comp.id)}
                          className="text-[#A89892] hover:text-[#DE3C25] p-1 text-xs transition-colors"
                          title="Delete opportunity"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Title */}
                      <h4 className="font-heading font-bold text-base text-white leading-snug line-clamp-2 hover:text-[#F87059] transition-colors">
                        {comp.title}
                      </h4>

                      {/* Live Countdown & Deadline */}
                      <div className="pt-1">
                        <CountDownBadge deadline={comp.deadline} />
                      </div>

                      {/* Tags */}
                      {comp.tags && comp.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {(Array.isArray(comp.tags) ? comp.tags : comp.tags.split(',')).map((tag, idx) => (
                            <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#140E0D] text-[#D8C3BB] border border-[#F5E8E2]/10">
                              #{typeof tag === 'string' ? tag.trim() : tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions & Official Link */}
                      <div className="pt-3 border-t border-[#F5E8E2]/10 flex items-center justify-between gap-2">
                        {comp.source_url ? (
                          <a
                            href={comp.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-[#DE3C25] hover:text-[#F5E8E2] inline-flex items-center gap-1 transition-colors"
                          >
                            <span>Apply / Details</span>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <span className="text-xs text-[#A89892] font-medium">Manual Entry</span>
                        )}

                        {/* Status Move Selector */}
                        <select
                          value={comp.status}
                          disabled={movingId === comp.id}
                          onChange={(e) => handleStatusMove(comp.id, e.target.value)}
                          className="text-xs font-semibold bg-[#140E0D] text-[#F5E8E2] border border-[#F5E8E2]/15 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#DE3C25]"
                        >
                          <option value="saved">Saved</option>
                          <option value="in_progress">In Progress</option>
                          <option value="applied">Applied</option>
                          <option value="result">Result</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* LIVE HACKATHONS MODAL */}
      {showLiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-3xl unstop-card p-6 bg-[#181110] border border-[#F5E8E2]/15 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5E8E2]/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#DE3C25] flex items-center justify-center font-extrabold text-white text-sm">
                  🔥
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-white">
                    Live Opportunities Feed
                  </h3>
                  <p className="text-xs text-[#A89892]">
                    Official hackathons & case challenges
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLiveModal(false)}
                className="text-[#A89892] hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {liveLoading ? (
              <div className="p-8 text-center text-[#A89892] space-y-2">
                <div className="w-8 h-8 border-2 border-[#DE3C25] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono-tabular">Fetching Live Feed...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveFeed.map((hackathon) => (
                  <div
                    key={hackathon.id}
                    className="p-4 rounded-xl bg-[#1E1412] border border-[#F5E8E2]/10 hover:border-[#DE3C25] space-y-3 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="badge-unstop">{hackathon.platform}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#140E0D] text-[#D8C3BB]">
                          {hackathon.level}
                        </span>
                      </div>
                      <h4 className="font-heading font-bold text-base text-white leading-snug">
                        {hackathon.title}
                      </h4>
                      <p className="text-xs text-[#D8C3BB] line-clamp-2">
                        {hackathon.eligibility_raw_text}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {hackathon.tags.map((t, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-[#140E0D] text-[#A89892] border border-[#F5E8E2]/10">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#F5E8E2]/10 flex items-center justify-between gap-2">
                      <a
                        href={hackathon.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-[#DE3C25] hover:underline inline-flex items-center gap-1"
                      >
                        Official Page ↗
                      </a>
                      <button
                        onClick={() => handleTrackLiveHackathon(hackathon)}
                        className="btn-pill-primary text-xs font-bold !py-1.5 !px-3"
                      >
                        + Track in My Board
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

