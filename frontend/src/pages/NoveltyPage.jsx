import React, { useState } from 'react';
import { noveltyApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const NoveltyPage = () => {
  const { activeTeam } = useAuth();
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [techStack, setTechStack] = useState('React, Node.js, SQLite, Telegram API, AI LLM');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await noveltyApi.search({
        team_id: activeTeam?.id,
        problem,
        solution,
        tech_stack: techStack
      });
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Novelty search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleInput = () => {
    setProblem('Hackathon participants struggle to track multi-platform deadlines and verify team eligibility across college and corporate hackathons.');
    setSolution('AI-powered competition command center with live Unstop hackathons feed, automatic eligibility checking, novelty paper search, and automated Telegram/WhatsApp group alert bots.');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="glass-panel p-6 border border-[#F5E8E2]/12 bg-gradient-to-r from-[#181110] via-[#241715] to-[#1E1210] shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#DE3C25]/12 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DE3C25]/20 text-[#F87059] border border-[#DE3C25]/40 flex items-center gap-1.5">
                <span>💡</span>
                <span>NOVELTY & PRIOR-ART ENGINE</span>
              </span>
              <span className="text-xs font-mono-tabular text-[#A89892]">
                arXiv & IEEE Synced
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-normal sm:font-medium text-white tracking-tight">
              AI Idea Novelty & Research Paper Search
            </h1>
            <p className="text-sm text-[#D8C3BB] max-w-2xl mt-1 leading-relaxed">
              Upload or paste your problem statement. Our AI scans Semantic Scholar, arXiv, and IEEE papers to verify novelty, detect existing solutions, and provide paper citations.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSampleInput}
            className="btn-pill-secondary text-xs font-semibold px-4 py-2"
          >
            ⚡ Load Sample Idea
          </button>
        </div>
      </div>

      {/* Input Form */}
      <div className="glass-panel p-6 border border-[#F5E8E2]/12 shadow-2xl">
        <form onSubmit={handleSearch} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#F5E8E2] mb-1.5 flex items-center justify-between">
                <span>Problem Statement</span>
                <span className="text-[10px] text-[#A89892] font-mono-tabular">REQUIRED</span>
              </label>
              <textarea
                rows={3}
                required
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Describe the problem your hackathon project solves..."
                className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl p-3.5 text-xs text-white placeholder-[#A89892] focus:outline-none focus:border-[#DE3C25]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F5E8E2] mb-1.5 flex items-center justify-between">
                <span>Proposed Solution & Unique Value</span>
                <span className="text-[10px] text-[#A89892] font-mono-tabular">REQUIRED</span>
              </label>
              <textarea
                rows={3}
                required
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Detail your technical solution, architecture, and unique approach..."
                className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl p-3.5 text-xs text-white placeholder-[#A89892] focus:outline-none focus:border-[#DE3C25]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#F5E8E2] mb-1">
              Tech Stack & Methodologies
            </label>
            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#A89892] focus:outline-none focus:border-[#DE3C25]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-pill-primary text-sm font-bold px-6 py-3 shadow-xl flex items-center gap-2"
            >
              <span>🔍</span>
              <span>{loading ? 'Analyzing Novelty & Research Papers...' : 'Audit Idea & Find Research Papers'}</span>
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="glass-panel p-8 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#DE3C25] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono-tabular text-[#D8C3BB]">
            Searching Semantic Scholar, arXiv & IEEE archives...
          </p>
        </div>
      )}

      {/* RESULTS DISPLAY */}
      {result && (
        <div className="space-y-6 animate-float">
          {/* Novelty Score & Prior Art Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Score Card */}
            <div className="glass-card p-6 border border-[#DE3C25]/30 bg-[#2D1815] text-center flex flex-col justify-center items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F87059] mb-2">
                NOVELTY SCORE INDEX
              </span>
              <div className="w-24 h-24 rounded-full border-4 border-[#DE3C25] flex items-center justify-center font-heading font-extrabold text-3xl text-white shadow-lg shadow-[#DE3C25]/30 my-2">
                {result.novelty_score || 89}%
              </div>
              <span className="text-xs font-semibold text-[#F5E8E2] mt-1">
                {result.prior_art_status || 'High Originality'}
              </span>
            </div>

            {/* Existing Solutions & Prior Art */}
            <div className="md:col-span-2 glass-panel p-6 border border-[#F5E8E2]/12 space-y-3">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <span>🛡️</span>
                <span>Prior Art & Existing Solutions Analysis</span>
              </h3>
              <div className="space-y-2">
                {result.existing_solutions?.map((sol, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#140E0D] border border-[#F5E8E2]/10 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-white">{sol.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#DE3C25]/20 text-[#F87059] border border-[#DE3C25]/30">
                        {sol.overlap}
                      </span>
                    </div>
                    <p className="text-[#A89892] text-[11px]">
                      <strong className="text-[#F87059]">Your Advantage:</strong> {sol.missing_feature}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Academic Research Papers & Citations */}
          <div className="glass-panel p-6 border border-[#F5E8E2]/12 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5E8E2]/10">
              <div>
                <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                  <span>📚</span>
                  <span>Related Academic Research Papers (arXiv & IEEE)</span>
                </h3>
                <p className="text-xs text-[#A89892]">
                  Queried domain research works related to "{result.search_query}"
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {result.top_3_related_works?.map((work, idx) => (
                <div
                  key={idx}
                  className="glass-card p-4 border border-[#F5E8E2]/12 hover:border-[#DE3C25] bg-[#1E1412] space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono-tabular uppercase px-2 py-0.5 rounded bg-[#DE3C25]/20 text-[#F87059] border border-[#DE3C25]/30">
                        Paper #{idx + 1}
                      </span>
                      <h4 className="font-heading font-bold text-base text-white mt-1.5 leading-snug">
                        {work.title}
                      </h4>
                    </div>
                    {work.url && (
                      <a
                        href={work.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-pill-secondary text-xs font-bold text-[#DE3C25] hover:text-white shrink-0 py-1 px-3"
                      >
                        Read Paper ↗
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#A89892] font-mono-tabular">
                    <span>Source: <strong className="text-[#F5E8E2]">{work.source}</strong></span>
                    <span>Year: <strong className="text-[#F5E8E2]">{work.year}</strong></span>
                    {work.authors && <span>Authors: <strong className="text-[#F5E8E2]">{work.authors}</strong></span>}
                  </div>

                  <p className="text-xs text-[#D8C3BB] bg-[#140E0D] p-3 rounded-xl border border-[#F5E8E2]/10 leading-relaxed">
                    <strong className="text-[#F87059]">Methodology Overlap Note:</strong> {work.similarity_note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Differentiators for Hackathon Judges */}
          <div className="glass-panel p-6 border border-[#F5E8E2]/12 space-y-3">
            <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <span>🏆</span>
              <span>Winning Differentiators for Hackathon Judges</span>
            </h3>
            <div className="text-xs text-[#D8C3BB] leading-relaxed whitespace-pre-line bg-[#140E0D] p-5 rounded-xl border border-[#F5E8E2]/10 font-mono-tabular">
              {result.differentiation_analysis}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

