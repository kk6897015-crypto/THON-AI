import React, { useState } from 'react';
import { DoubleBezelCard } from '../components/DoubleBezelCard.jsx';
import { TactileButton } from '../components/TactileButton.jsx';
import { ShimmerLoader } from '../components/ShimmerLoader.jsx';
import { deckApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { DownloadIcon, SparklesIcon } from '../components/Icons.jsx';

export const DeckStudioPage = () => {
  const { activeTeam } = useAuth();
  const [activeTab, setActiveTab] = useState('drafter'); // 'drafter' | 'prep'

  // Drafter State
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [techStack, setTechStack] = useState('React, Express, SQLite, Telegram API');
  const [marketAsk, setMarketAsk] = useState('Mentorship & Hackathon Advancement');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [slides, setSlides] = useState(null);

  // Prep Guide State
  const [prepLoading, setPrepLoading] = useState(false);
  const [prepData, setPrepData] = useState(null);

  const handleGenerateDeck = async (e) => {
    e.preventDefault();
    if (!activeTeam) {
      alert('Please select or create a team in Team Hub first.');
      return;
    }

    setLoading(true);
    setSlides(null);

    try {
      const res = await deckApi.generate({
        team_id: activeTeam.id,
        title,
        problem,
        solution,
        tech_stack: techStack,
        market_ask: marketAsk
      });
      setSlides(res.data.slides);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate deck outline');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPptx = async () => {
    if (!slides || slides.length === 0) return;
    setExporting(true);

    try {
      const res = await deckApi.exportPptx({
        title: title || 'Pitch_Deck',
        slides
      });

      // Download binary file
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${(title || 'Pitch_Deck').replace(/[^a-zA-Z0-9]/g, '_')}.pptx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export PPTX file');
    } finally {
      setExporting(false);
    }
  };

  const handleGeneratePrepGuide = async () => {
    setPrepLoading(true);
    try {
      const res = await deckApi.prepGuide({
        competition_title: 'Target Competition',
        problem,
        solution
      });
      setPrepData(res.data);
    } catch (err) {
      alert('Failed to generate prep guide');
    } finally {
      setPrepLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header & Mode Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-normal sm:font-medium tracking-tight text-white">
            AI Pitch Deck Studio & Prep Guide
          </h2>
          <p className="text-sm text-[#D8C3BB]">
            Generate slide outlines, per-slide rewrite checklists, speaker notes, and export native PPTX files.
          </p>
        </div>

        <div className="flex bg-[#140E0D] p-1 rounded-full border border-[#F5E8E2]/10">
          <button
            onClick={() => setActiveTab('drafter')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'drafter' ? 'bg-[#DE3C25] text-white' : 'text-[#A89892] hover:text-white'
            }`}
          >
            Deck Drafter & PPTX Export
          </button>
          <button
            onClick={() => { setActiveTab('prep'); if (!prepData) handleGeneratePrepGuide(); }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'prep' ? 'bg-[#DE3C25] text-white' : 'text-[#A89892] hover:text-white'
            }`}
          >
            Judge Prep Guide
          </button>
        </div>
      </div>

      {activeTab === 'drafter' ? (
        <div className="space-y-6">
          <DoubleBezelCard>
            <form onSubmit={handleGenerateDeck} className="space-y-4 p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Innovation Workspace"
                    className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#DE3C25]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">Tech Stack</label>
                  <input
                    type="text"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE3C25]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">Problem Statement</label>
                <textarea
                  rows={2}
                  required
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Describe problem pain point..."
                  className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#DE3C25]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">Solution Overview</label>
                <textarea
                  rows={2}
                  required
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="Describe technical solution..."
                  className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#DE3C25]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#F87059] font-mono-tabular">
                  ⚠️ Draft outputs are labeled as AI-generated FIRST DRAFT.
                </span>
                <TactileButton type="submit" variant="primary" disabled={loading} icon={<SparklesIcon className="w-3.5 h-3.5" />}>
                  {loading ? 'Drafting Slides...' : 'Generate Deck Outline'}
                </TactileButton>
              </div>
            </form>
          </DoubleBezelCard>

          {loading && <ShimmerLoader rows={3} height="h-28" />}

          {slides && (
            <div className="space-y-6 animate-float">
              {/* Disclaimer Alert */}
              <div className="p-4 rounded-xl bg-[#2D1815] border border-[#DE3C25]/40 text-[#F87059] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <strong>AI-GENERATED FIRST DRAFT:</strong> This outline is a starting template. Please rewrite bullet points in your team's own words before submitting.
                </div>
                <TactileButton variant="primary" onClick={handleExportPptx} disabled={exporting} icon={<DownloadIcon className="w-3.5 h-3.5" />}>
                  {exporting ? 'Generating PPTX...' : 'Export PPTX File'}
                </TactileButton>
              </div>

              {/* Slides Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slides.map((s, idx) => (
                  <DoubleBezelCard key={idx}>
                    <div className="space-y-3 p-2">
                      <div className="flex items-center justify-between border-b border-[#F5E8E2]/10 pb-2">
                        <span className="text-xs font-mono-tabular font-bold text-[#F87059]">
                          SLIDE {s.slide_number}
                        </span>
                        <span className="text-xs text-[#F5E8E2] font-bold">{s.title}</span>
                      </div>

                      <ul className="text-xs space-y-1.5 text-[#D8C3BB]">
                        {s.bullets?.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-1.5">
                            <span className="text-[#DE3C25]">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>

                      {s.speaker_notes && (
                        <div className="bg-[#140E0D] p-2.5 rounded-lg border border-[#F5E8E2]/5 space-y-1">
                          <span className="text-[10px] uppercase font-mono-tabular text-[#A89892]">SPEAKER NOTES:</span>
                          <p className="text-xs text-[#D8C3BB] italic">{s.speaker_notes}</p>
                        </div>
                      )}

                      {s.rewrite_checklist && s.rewrite_checklist.length > 0 && (
                        <div className="bg-[#2D1815] p-2.5 rounded-lg border border-[#DE3C25]/20 space-y-1">
                          <span className="text-[10px] uppercase font-mono-tabular text-[#F87059]">REWRITE CHECKLIST:</span>
                          <ul className="text-[11px] text-[#D8C3BB] space-y-0.5">
                            {s.rewrite_checklist.map((item, cIdx) => (
                              <li key={cIdx}>[ ] {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </DoubleBezelCard>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* PREP GUIDE TAB */
        <div className="space-y-6">
          {prepLoading && <ShimmerLoader rows={3} height="h-24" />}
          {prepData && (
            <div className="space-y-6 animate-float">
              {/* Judges Criteria */}
              <DoubleBezelCard>
                <div className="space-y-4 p-2">
                  <h3 className="font-heading font-bold text-xl text-white">Judges Evaluation Weightings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {prepData.judges_criteria?.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#140E0D] border border-[#F5E8E2]/10 space-y-1">
                        <div className="font-bold text-xs text-[#F87059]">{item.category}</div>
                        <p className="text-xs text-[#D8C3BB]">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </DoubleBezelCard>

              {/* Likely QA */}
              <DoubleBezelCard>
                <div className="space-y-4 p-2">
                  <h3 className="font-heading font-bold text-xl text-white">Likely Judge Q&A Questions</h3>
                  <ul className="space-y-2 text-xs text-[#D8C3BB] font-mono-tabular">
                    {prepData.likely_qa?.map((q, idx) => (
                      <li key={idx} className="p-3 rounded-xl bg-[#140E0D] border border-[#F5E8E2]/10">
                        <strong className="text-[#DE3C25]">Q{idx + 1}:</strong> {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </DoubleBezelCard>

              {/* Countdown Timeline */}
              <DoubleBezelCard>
                <div className="space-y-4 p-2">
                  <h3 className="font-heading font-bold text-xl text-white">Countdown Execution Timeline</h3>
                  <div className="space-y-2">
                    {prepData.countdown_timeline?.map((step, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#140E0D] border border-[#F5E8E2]/10 text-xs">
                        <span className="font-mono-tabular font-bold text-[#F87059]">{step.phase}</span>
                        <span className="text-[#D8C3BB]">{step.task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </DoubleBezelCard>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
