import React, { useState } from 'react';
import { DoubleBezelCard } from '../components/DoubleBezelCard.jsx';
import { TactileButton } from '../components/TactileButton.jsx';
import { ShimmerLoader } from '../components/ShimmerLoader.jsx';
import { pptApi } from '../services/api.js';

export const PPTCheckerPage = () => {
  const [file, setFile] = useState(null);
  const [eventType, setEventType] = useState('smart_india_hackathon');
  const [rulesText, setRulesText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('pptx', file);
      formData.append('event_type', eventType);
      formData.append('eligibility_raw_text', rulesText);

      const res = await pptApi.analyzeFile(formData);
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to analyze PPTX file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h2 className="font-heading text-2xl md:text-3xl font-normal sm:font-medium tracking-tight text-white">
          PPT Structural & Eligibility Engine
        </h2>
        <p className="text-sm text-[#D8C3BB]">
          Audits slide counts, density readability, and required sections deterministically, and provides qualitative rubric alignment diagnostics.
        </p>
      </div>

      <DoubleBezelCard>
        <form onSubmit={handleAnalyze} className="space-y-5 p-2">
          {/* File dropzone */}
          <div className="border-2 border-dashed border-[#F5E8E2]/15 hover:border-[#DE3C25]/60 rounded-2xl p-8 text-center bg-[#140E0D] transition-all cursor-pointer">
            <input
              type="file"
              accept=".pptx"
              onChange={handleFileChange}
              className="hidden"
              id="pptx-file-input"
            />
            <label htmlFor="pptx-file-input" className="cursor-pointer space-y-2 block">
              <div className="w-12 h-12 rounded-full bg-[#DE3C25]/15 border border-[#DE3C25]/30 flex items-center justify-center mx-auto text-xl text-[#F87059]">
                📄
              </div>
              <div className="font-heading font-bold text-base text-white">
                {file ? file.name : 'Select or drag & drop PPTX presentation file'}
              </div>
              <p className="text-xs text-[#A89892]">
                {file ? `${(file.size / 1024).toFixed(1)} KB ready for analysis` : 'Supports standard PowerPoint (.pptx) up to 25MB'}
              </p>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Event Rubric Select */}
            <div>
              <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">
                Target Hackathon / Event Rubric
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE3C25]"
              >
                <option value="smart_india_hackathon">Smart India Hackathon (SIH) Standard</option>
                <option value="mlh_hackathon">Major League Hacking (MLH) Standard</option>
                <option value="social_impact">Social Impact & Sustainability Hackathon</option>
                <option value="corporate_innovation">Corporate / Fintech Hackathon (Flipkart/Tata)</option>
              </select>
            </div>

            {/* Optional Rules text */}
            <div>
              <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">
                Optional Rule / Slide Limit Text
              </label>
              <input
                type="text"
                value={rulesText}
                onChange={(e) => setRulesText(e.target.value)}
                placeholder="e.g. Max 6 slides; Must include architecture diagram"
                className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-xs text-white placeholder-[#A89892] focus:outline-none focus:border-[#DE3C25]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <TactileButton type="submit" variant="primary" disabled={!file || loading} icon="⚡">
              {loading ? 'Parsing PPTX & Running Checks...' : 'Audit Presentation Structure'}
            </TactileButton>
          </div>
        </form>
      </DoubleBezelCard>

      {loading && <ShimmerLoader rows={3} height="h-24" />}

      {/* ANALYSIS REPORT DISPLAY */}
      {result && result.report && (
        <div className="space-y-6 animate-float">
          {/* Metadata Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DoubleBezelCard>
              <div className="p-2 space-y-1">
                <span className="text-xs font-mono-tabular text-[#A89892]">FILE ANALYZED</span>
                <div className="text-sm font-bold text-white truncate">
                  {result.filename}
                </div>
              </div>
            </DoubleBezelCard>
            <DoubleBezelCard>
              <div className="p-2 space-y-1">
                <span className="text-xs font-mono-tabular text-[#A89892]">TOTAL SLIDES</span>
                <div className="text-xl font-heading font-bold text-white">
                  {result.report.slide_count} Slides
                </div>
              </div>
            </DoubleBezelCard>
          </div>

          {/* TIER 1: DETERMINISTIC CHECKLIST */}
          <DoubleBezelCard>
            <div className="space-y-4 p-2">
              <div className="flex items-center justify-between border-b border-[#F5E8E2]/10 pb-2">
                <div>
                  <h3 className="font-heading font-bold text-lg text-white">
                    Tier 1: Deterministic Rule-Based Checklist
                  </h3>
                  <p className="text-xs text-[#A89892]">
                    Reliable, objective structural pass/fail verification against stated limits.
                  </p>
                </div>
                <span className="text-[10px] font-mono-tabular px-2.5 py-0.5 rounded-full bg-[#F5E8E2]/15 text-[#F5E8E2] border border-[#F5E8E2]/30">
                  RELIABLE / OBJECTIVE
                </span>
              </div>

              <div className="space-y-3">
                {result.report.checklist?.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#140E0D] border border-[#F5E8E2]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{item.name}</span>
                        <span className="text-[10px] font-mono-tabular text-[#A89892]">({item.rule_text})</span>
                      </div>
                      <p className="text-xs text-[#D8C3BB]">{item.notes}</p>
                    </div>

                    <span className={`text-[10px] font-mono-tabular font-bold px-3 py-1 rounded-full shrink-0 ${
                      item.passed
                        ? 'bg-[#F5E8E2]/15 border border-[#F5E8E2]/30 text-[#F5E8E2]'
                        : 'bg-[#DE3C25]/20 border border-[#DE3C25]/40 text-[#F87059]'
                    }`}>
                      {item.passed ? '✓ PASS' : '✕ FAIL / WARNING'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </DoubleBezelCard>

          {/* TIER 2: DIAGNOSTIC RUBRIC ALIGNMENT (NO NUMERIC SCORES) */}
          <DoubleBezelCard>
            <div className="space-y-4 p-2">
              <div className="flex items-center justify-between border-b border-[#F5E8E2]/10 pb-2">
                <div>
                  <h3 className="font-heading font-bold text-lg text-white">
                    Tier 2: Qualitative Rubric Alignment Advisor
                  </h3>
                  <p className="text-xs text-[#A89892]">
                    Guidance based on commonly published judging criteria for <strong>{result.report.rubric_name}</strong>.
                  </p>
                </div>
                <span className="text-[10px] font-mono-tabular px-2.5 py-0.5 rounded-full bg-[#DE3C25]/20 text-[#F87059] border border-[#DE3C25]/40">
                  QUALITATIVE GUIDANCE
                </span>
              </div>

              {/* Non-authoritative Disclaimer */}
              <div className="p-3.5 rounded-xl bg-[#2D1815] border border-[#DE3C25]/30 text-xs text-[#F87059]">
                ℹ️ <strong>Notice:</strong> {result.report.disclaimer}
              </div>

              {/* Qualitative Category Reviews */}
              <div className="space-y-3">
                {Object.entries(result.report.diagnostic_feedback || {}).map(([category, advice], idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#140E0D] border border-[#F5E8E2]/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#F87059] font-mono-tabular uppercase">
                        {category}
                      </h4>
                      {result.report.rubric_weights?.[category] && (
                        <span className="text-[10px] text-[#A89892] font-mono-tabular">
                          Judging Weight: {result.report.rubric_weights[category]}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#D8C3BB] leading-relaxed">
                      {advice}
                    </p>
                  </div>
                ))}
              </div>

              {/* Typical Judge Q&A */}
              {result.report.suggested_judge_questions?.length > 0 && (
                <div className="pt-2 space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase font-mono-tabular">
                    Typical Judge Q&A to Prepare For:
                  </h4>
                  <ul className="space-y-1.5">
                    {result.report.suggested_judge_questions.map((q, qIdx) => (
                      <li key={qIdx} className="p-2.5 rounded-lg bg-[#1E1412] border border-[#F5E8E2]/5 text-xs text-[#D8C3BB] flex items-start gap-2">
                        <span className="text-[#DE3C25] font-bold">Q:</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DoubleBezelCard>
        </div>
      )}
    </div>
  );
};
