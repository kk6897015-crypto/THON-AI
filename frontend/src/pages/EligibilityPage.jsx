import React, { useState } from 'react';
import { DoubleBezelCard } from '../components/DoubleBezelCard.jsx';
import { TactileButton } from '../components/TactileButton.jsx';
import { ShimmerLoader } from '../components/ShimmerLoader.jsx';
import { eligibilityApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const EligibilityPage = () => {
  const { activeTeam } = useAuth();
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const handleRunCheck = async (e) => {
    e.preventDefault();
    if (!activeTeam) {
      alert('Please select or create a team first in Team Hub.');
      return;
    }

    setLoading(true);
    setReport(null);

    try {
      const res = await eligibilityApi.check({
        team_id: activeTeam.id,
        eligibility_raw_text: rawText
      });
      setReport(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Eligibility check failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'met') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono-tabular font-bold bg-[#F5E8E2]/15 border border-[#F5E8E2]/30 text-[#F5E8E2]">
          ✓ MET
        </span>
      );
    }
    if (status === 'borderline') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono-tabular font-bold bg-[#F58A7A]/20 border border-[#F58A7A]/40 text-[#F87059]">
          ⚠️ BORDERLINE
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono-tabular font-bold bg-[#DE3C25]/20 border border-[#DE3C25]/40 text-[#F87059]">
        ✕ MISSING
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="font-heading text-2xl md:text-3xl font-normal sm:font-medium tracking-tight text-white">
          Eligibility & Completeness Checker
        </h2>
        <p className="text-sm text-[#D8C3BB]">
          Audits team size, student status, college policies, and required deck sections against raw event rules.
        </p>
      </div>

      <DoubleBezelCard>
        <form onSubmit={handleRunCheck} className="space-y-4 p-2">
          <div>
            <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">
              Paste Competition Eligibility / Rules Text
            </label>
            <textarea
              rows={4}
              required
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="e.g. Teams must consist of 2 to 4 undergraduate students from accredited universities. Submissions must include a 6-slide deck covering Problem, Solution, Architecture, and Ask..."
              className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#DE3C25]"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A89892]">
              Active Team: <strong className="text-[#F5E8E2]">{activeTeam?.name || 'None'}</strong>
            </span>
            <TactileButton type="submit" variant="primary" disabled={loading} icon="→">
              {loading ? 'Evaluating Rules...' : 'Run Audit Check'}
            </TactileButton>
          </div>
        </form>
      </DoubleBezelCard>

      {loading && <ShimmerLoader rows={4} height="h-20" />}

      {/* REPORT DISPLAY */}
      {report && (
        <div className="space-y-6 animate-float">
          {/* Diagnostic Disclaimer Alert */}
          <div className="p-4 rounded-xl bg-[#2D1815] border border-[#DE3C25]/30 text-xs text-[#F87059]">
            ℹ️ <strong>Diagnostic Disclaimer:</strong> Evaluates criteria met vs missing. Does NOT predict judge scores or win probabilities.
          </div>

          {/* 1. Rule Checklist */}
          <DoubleBezelCard>
            <div className="space-y-4 p-2">
              <h3 className="font-heading font-bold text-xl text-white">
                Eligibility Rules Checklist ({report.checklist?.length || 0})
              </h3>
              <div className="space-y-3">
                {report.checklist?.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#140E0D] border border-[#F5E8E2]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-[#F5E8E2]">
                        Rule Text: "{item.rule_text}"
                      </div>
                      <p className="text-xs text-[#A89892]">{item.notes}</p>
                    </div>
                    <div>{getStatusBadge(item.status)}</div>
                  </div>
                ))}
              </div>
            </div>
          </DoubleBezelCard>

          {/* 2. Submission Completeness */}
          <DoubleBezelCard>
            <div className="space-y-4 p-2">
              <h3 className="font-heading font-bold text-xl text-white">
                Submission Completeness Pass
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.completeness?.map((comp, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#140E0D] border border-[#F5E8E2]/10 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-white">{comp.section_name}</div>
                      <div className="text-[10px] text-[#A89892]">{comp.notes}</div>
                    </div>
                    <div>{getStatusBadge(comp.status)}</div>
                  </div>
                ))}
              </div>
            </div>
          </DoubleBezelCard>
        </div>
      )}
    </div>
  );
};
