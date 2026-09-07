import React, { useState, useEffect } from 'react';
import { DoubleBezelCard } from '../components/DoubleBezelCard.jsx';
import { TactileButton } from '../components/TactileButton.jsx';
import { CountDownBadge } from '../components/CountDownBadge.jsx';
import { ShimmerLoader } from '../components/ShimmerLoader.jsx';
import { competitionApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CompetitionRecommender } from '../components/CompetitionRecommender.jsx';
import { BookmarkPlusIcon, CheckIcon } from '../components/Icons.jsx';

const FALLBACK_DISCOVER_COMPETITIONS = [
  {
    id: 'disc_1',
    title: 'Anna University CEG Innothon 2026',
    platform: 'Anna University CEG',
    level: 'state',
    tags: ['AI', 'GovTech', 'TamilNadu'],
    deadline: new Date(Date.now() + 15 * 86400000).toISOString(),
    eligibility_raw_text: 'Open to Anna University campus students and all affiliated colleges in Tamil Nadu. Team size: 2-4 members.',
    state: 'Tamil Nadu',
    college_tier: 'state_tier1'
  },
  {
    id: 'disc_2',
    title: 'StartupTN Smart Tamil Nadu Hackathon 2026',
    platform: 'Unstop',
    level: 'state',
    tags: ['TamilNadu', 'GovTech', 'StartupTN', 'AI'],
    deadline: new Date(Date.now() + 10 * 86400000).toISOString(),
    eligibility_raw_text: 'Organized by TNSIM (Govt of Tamil Nadu). Open to all engineering & tech students in Tamil Nadu. Team size: 2 to 5.',
    state: 'Tamil Nadu',
    college_tier: 'state_tier1'
  },
  {
    id: 'disc_3',
    title: 'IIT Madras Shaastra Hackathon 2026',
    platform: 'Unstop',
    level: 'state',
    tags: ['IITMadras', 'DeepTech', 'AI', 'TamilNadu'],
    deadline: new Date(Date.now() + 8 * 86400000).toISOString(),
    eligibility_raw_text: 'Hosted by IIT Madras Pravartak & Shaastra. Open to undergraduate & postgraduate tech students in Tamil Nadu & India.',
    state: 'Tamil Nadu',
    college_tier: 'iit_nit_iiit'
  },
  {
    id: 'disc_4',
    title: 'PSG Tech Hackathon 2026 - Coimbatore',
    platform: 'Unstop',
    level: 'state',
    tags: ['PSGTech', 'Coimbatore', 'Embedded', 'AI', 'TamilNadu'],
    deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    eligibility_raw_text: 'Hosted by PSG College of Technology, Coimbatore. Open to all B.E/B.Tech students in Tamil Nadu institutions.',
    state: 'Tamil Nadu',
    college_tier: 'state_tier1'
  },
  {
    id: 'disc_5',
    title: 'SSN Hackovate 2026 - Chennai',
    platform: 'Unstop',
    level: 'state',
    tags: ['SSN', 'Chennai', 'OpenSource', 'CyberSecurity', 'TamilNadu'],
    deadline: new Date(Date.now() + 6 * 86400000).toISOString(),
    eligibility_raw_text: 'Hosted by SSN College of Engineering, Chennai. Open to college students across Tamil Nadu.',
    state: 'Tamil Nadu',
    college_tier: 'state_tier1'
  },
  {
    id: 'disc_6',
    title: 'VIT Vellore Hackathon 2026 - Riviera Track',
    platform: 'Unstop',
    level: 'state',
    tags: ['VIT', 'FullStack', 'Web3', 'Vellore', 'TamilNadu'],
    deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
    eligibility_raw_text: 'Hosted by VIT Vellore. Open to B.Tech, M.Tech, and MCA students across Tamil Nadu colleges.',
    state: 'Tamil Nadu',
    college_tier: 'state_tier1'
  },
  {
    id: 'disc_7',
    title: 'Smart India Hackathon (SIH) 2026',
    platform: 'Unstop',
    level: 'national',
    tags: ['GovTech', 'FullStack', 'IoT', 'National'],
    deadline: new Date(Date.now() + 20 * 86400000).toISOString(),
    eligibility_raw_text: '6-member team mandatory with at least 1 female member. Open to engineering & tech students.',
    state: 'National',
    college_tier: 'other'
  },
  {
    id: 'disc_8',
    title: 'Flipkart GRID 6.0 - Software Development Track',
    platform: 'Unstop',
    level: 'national',
    tags: ['Software Engineering', 'Web3', 'AI', 'Coding'],
    deadline: new Date(Date.now() + 12 * 86400000).toISOString(),
    eligibility_raw_text: 'Engineering students from batches 2025, 2026, 2027, and 2028. Team size: 1 to 3 members.',
    state: 'National',
    college_tier: 'other'
  }
];

export const DiscoverPage = ({ onRefresh }) => {
  const { user, activeTeam } = useAuth();
  const [competitions, setCompetitions] = useState(FALLBACK_DISCOVER_COMPETITIONS);
  const [loading, setLoading] = useState(false);

  // Filters
  const [stateFilter, setStateFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');

  const [copySuccessId, setCopySuccessId] = useState(null);

  const loadDiscoverCompetitions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (stateFilter) params.state = stateFilter;
      if (tierFilter) params.tier = tierFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await competitionApi.discover(params);
      if (res.data && res.data.competitions && res.data.competitions.length > 0) {
        setCompetitions(res.data.competitions);
      } else {
        setCompetitions(FALLBACK_DISCOVER_COMPETITIONS);
      }
    } catch (err) {
      console.warn('Failed to load shared competitions from API, using fallback feed:', err);
      setCompetitions(FALLBACK_DISCOVER_COMPETITIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscoverCompetitions();
  }, [stateFilter, tierFilter, statusFilter]);

  const handleCopy = async (compId) => {
    if (!activeTeam) {
      alert('Please create or join a team first in the Team Hub.');
      return;
    }

    try {
      await competitionApi.copy(compId, { team_id: activeTeam.id });
      setCopySuccessId(compId);
      if (onRefresh) onRefresh();
      setTimeout(() => setCopySuccessId(null), 2500);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to copy competition');
    }
  };

  const handleVerify = async (compId) => {
    try {
      await competitionApi.verify(compId);
      loadDiscoverCompetitions();
    } catch (err) {
      alert('Failed to verify competition details.');
    }
  };

  // Filter list locally for state, tier, and search query
  const filteredComps = (competitions && competitions.length > 0 ? competitions : FALLBACK_DISCOVER_COMPETITIONS).filter(c => {
    if (stateFilter && stateFilter.toLowerCase().includes('tamil')) {
      const isTN = (c.state && c.state.toLowerCase().includes('tamil')) ||
                   (c.level && c.level === 'state') ||
                   (Array.isArray(c.tags) && c.tags.some(t => t.toLowerCase().includes('tamilnadu'))) ||
                   ['state_tier1', 'state_tier2'].includes(c.college_tier);
      if (!isTN) return false;
    }
    if (tierFilter && c.college_tier !== tierFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (c.title || '').toLowerCase().includes(q);
      const matchPlatform = (c.platform || '').toLowerCase().includes(q);
      const matchTags = Array.isArray(c.tags)
        ? c.tags.some(t => t.toLowerCase().includes(q))
        : (c.tags || '').toLowerCase().includes(q);
      if (!matchTitle && !matchPlatform && !matchTags) return false;
    }
    return true;
  });

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'iit_nit_iiit':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono-tabular font-bold bg-[#DE3C25]/20 border border-[#DE3C25]/40 text-[#F87059]">IIT / NIT / IIIT</span>;
      case 'state_tier1':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono-tabular font-bold bg-[#F5E8E2]/15 border border-[#F5E8E2]/30 text-[#F5E8E2]">State Tier 1</span>;
      case 'state_tier2':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono-tabular font-bold bg-[#1E1412] border border-[#F5E8E2]/10 text-[#D8C3BB]">State Tier 2</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono-tabular font-bold bg-white/5 border border-white/10 text-[#A89892]">Other</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <h2 className="font-heading text-2xl md:text-3xl font-normal sm:font-medium tracking-tight text-white">
          Live Competition Discovery Feed
        </h2>
        <p className="text-sm text-[#D8C3BB]">
          Discover shared student hackathons, local college events, and state-level engineering challenges in Tamil Nadu.
        </p>
      </div>

      {/* AI Competition Recommendation Engine */}
      <CompetitionRecommender onAddCompetition={handleCopy} />

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 border border-[#F5E8E2]/12 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* State filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-[#A89892] mb-1 font-mono-tabular">State Filter</label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#DE3C25]"
            >
              <option value="Tamil Nadu">Tamil Nadu Only</option>
              <option value="">All Regions</option>
            </select>
          </div>

          {/* Tier filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-[#A89892] mb-1 font-mono-tabular">College Tier</label>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#DE3C25]"
            >
              <option value="">All Tiers</option>
              <option value="iit_nit_iiit">IIT / NIT / IIIT</option>
              <option value="state_tier1">State Tier 1 (CEG, PSG, SSN, VIT...)</option>
              <option value="state_tier2">State Tier 2 (KCT, CIT, GCT...)</option>
              <option value="other">Other / Unknown</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-[#A89892] mb-1 font-mono-tabular">Timeline Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#DE3C25]"
            >
              <option value="open">Active & Open</option>
              <option value="">All Events</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="w-full md:w-64">
          <label className="block text-[10px] uppercase font-bold text-[#A89892] mb-1 font-mono-tabular">Search keywords</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. CEG, AI, Robotics..."
            className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-[#A89892] focus:outline-none focus:border-[#DE3C25]"
          />
        </div>
      </div>

      {loading ? (
        <ShimmerLoader rows={3} height="h-32" />
      ) : filteredComps.length === 0 ? (
        <DoubleBezelCard>
          <div className="text-center py-16 space-y-3">
            <span className="text-3xl">🧭</span>
            <p className="text-sm text-[#A89892]">No shared competitions matching your filters were found.</p>
            <p className="text-xs text-[#D8C3BB]/60">Organizers and teams can add custom competitions in their Kanban and opt-in to share them publicly!</p>
          </div>
        </DoubleBezelCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredComps.map((comp) => {
            const isCopySuccess = copySuccessId === comp.id;
            let tags = [];
            try {
              tags = typeof comp.tags === 'string' ? JSON.parse(comp.tags) : comp.tags;
            } catch (e) {
              tags = [];
            }

            return (
              <DoubleBezelCard key={comp.id} className="relative overflow-hidden flex flex-col justify-between">
                {/* Needs verification warning */}
                {comp.needs_verification === 1 && (
                  <div className="absolute inset-x-0 top-0 bg-[#2D1815] border-b border-[#DE3C25]/30 px-4 py-2 flex items-center justify-between z-10">
                    <span className="text-[10px] text-[#F87059] font-bold">
                      ⚠️ Needs Re-Verification (Active &gt; 14 days)
                    </span>
                    <button
                      onClick={() => handleVerify(comp.id)}
                      className="text-[9px] uppercase font-mono-tabular bg-[#DE3C25]/20 text-[#F87059] border border-[#DE3C25]/40 hover:bg-[#DE3C25]/45 px-2 py-0.5 rounded"
                    >
                      Confirm Active ✓
                    </button>
                  </div>
                )}

                <div className={`p-2 space-y-4 ${comp.needs_verification === 1 ? 'pt-10' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-[#140E0D] border border-[#F5E8E2]/15 text-[#A89892]">
                          {comp.platform}
                        </span>
                        {getTierBadge(comp.college_tier)}
                        {comp.state && (
                          <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-[#DE3C25]/15 border border-[#DE3C25]/30 text-[#F87059]">
                            📍 {comp.state}
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading font-bold text-lg text-white leading-snug">
                        {comp.title}
                      </h3>
                    </div>

                    <div className="shrink-0">
                      <CountDownBadge deadline={comp.deadline} />
                    </div>
                  </div>

                  <p className="text-xs text-[#D8C3BB] line-clamp-3">
                    {comp.eligibility_raw_text || 'No description provided.'}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-mono-tabular px-2.5 py-0.5 rounded bg-[#1E1412] text-[#D8C3BB] border border-[#F5E8E2]/5">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#F5E8E2]/10 flex items-center justify-between gap-4">
                    <span className="text-[10px] text-[#A89892] font-mono-tabular">
                      Shared by Community
                    </span>

                    <button
                      onClick={() => handleCopy(comp.id)}
                      disabled={isCopySuccess}
                      className={`text-xs font-bold px-4 py-2 rounded-full border transition-all flex items-center gap-1.5 shadow-md ${
                        isCopySuccess
                          ? 'bg-[#2D1815] text-[#F87059] border-[#DE3C25]/30 cursor-default'
                          : 'bg-[#DE3C25] hover:bg-[#DE3C25]/85 text-white border-[#DE3C25]/30 hover:scale-[1.02]'
                      }`}
                    >
                      {isCopySuccess ? (
                        <>
                          <CheckIcon className="w-3.5 h-3.5" />
                          <span>Saved to Board</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlusIcon className="w-3.5 h-3.5" />
                          <span>Copy to Kanban</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </DoubleBezelCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
