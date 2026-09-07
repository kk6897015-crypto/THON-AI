import React, { useState, useEffect } from 'react';

export const AiCompanion = ({ currentTab, activeTeam }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentTip, setCurrentTip] = useState('🔥 Unstop Opportunity Sync: Flipkart GRID 6.0 registration closes in 2 days. Check team roster now!');

  useEffect(() => {
    const tipsByTab = {
      kanban: [
        `🔥 Live Unstop Sync: Flipkart GRID 6.0 & Amazon ML Challenge deadlines are approaching.`,
        `💡 Strategic Tip: Move tracked hackathons to 'Applied' stage to trigger instant WhatsApp group alerts.`,
        `⚡ Rule Engine: Ensure your team includes at least 1 female developer for Smart India Hackathon compliance.`
      ],
      teams: [
        `👥 Team Hub: Make sure all member portfolio/resume links are attached for tier-1 eligibility checks.`,
        `💬 WhatsApp Integration: Connect team group to get automated 24h deadline push notifications.`
      ],
      eligibility: [
        `⚡ Eligibility: Hackathon algorithms verify graduation year & branch alignment before shortlisting.`
      ],
      novelty: [
        `📄 arXiv Search: Submit problem statements to generate Novelty Score % & academic paper citations.`
      ],
      deck: [
        `📊 Pitch Studio: Structure your hackathon deck into 6 key slides: Problem, Solution, Architecture, Novelty, Demo, Team.`
      ],
      ppt: [
        `🔍 Structural Linting: Upload .pptx presentations to audit missing slide headers & font contrast errors.`
      ]
    };

    const currentTips = tipsByTab[currentTab] || tipsByTab.kanban;
    const randomTip = currentTips[Math.floor(Math.random() * currentTips.length)];

    setCurrentTip(randomTip);
    setMessages(prev => [
      ...prev.slice(-4),
      { id: Date.now(), text: randomTip, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
  }, [currentTab, activeTeam]);

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto z-40">
      {/* Floating Player-Style Control Bar */}
      <div className="p-3 rounded-full bg-[#140E0D]/95 backdrop-blur-3xl border border-[#F5E8E2]/15 shadow-2xl shadow-black/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Left: AI Equalizer Visualizer & Active Status */}
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
          <div className="flex items-center gap-1 h-6 px-2.5 rounded-full bg-[#DE3C25]/20 border border-[#DE3C25]/40 shrink-0">
            <span className="w-1 h-3 bg-[#DE3C25] rounded-full animate-pulse" />
            <span className="w-1 h-4 bg-[#F87059] rounded-full animate-bounce" />
            <span className="w-1 h-2 bg-[#F5E8E2] rounded-full animate-pulse" />
            <span className="w-1 h-5 bg-[#DE3C25] rounded-full animate-bounce" />
          </div>

          <div className="flex items-center gap-2 truncate">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DE3C25] text-white shrink-0">
              AI CO-PILOT
            </span>
            <p className="text-xs font-semibold text-[#F5E8E2] truncate">
              {currentTip}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Chips & Expand Drawer Button */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all flex items-center gap-1.5"
          >
            <span>{isOpen ? 'Close ✕' : 'Co-Pilot Log 💬'}</span>
          </button>
        </div>
      </div>

      {/* Expanded Advice Stream Drawer */}
      {isOpen && (
        <div className="mt-2 p-4 rounded-3xl bg-[#140E0D]/98 backdrop-blur-3xl border border-[#F5E8E2]/15 shadow-2xl space-y-3 animate-float">
          <div className="flex items-center justify-between pb-2 border-b border-[#F5E8E2]/10">
            <span className="text-xs font-bold text-[#F87059] flex items-center gap-2">
              <span>🤖</span>
              <span>AI Co-Pilot Contextual Advice Feed</span>
            </span>
            <span className="text-[10px] font-mono-tabular text-[#A89892]">
              {activeTeam ? `Team: ${activeTeam.name}` : 'Live Assistant'}
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="p-3 rounded-2xl bg-[#1E1412] border border-[#F5E8E2]/10 text-xs text-[#D8C3BB] space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] text-[#A89892] font-mono-tabular">
                  <span className="text-[#DE3C25] font-bold">TIP UPDATE</span>
                  <span>{msg.time}</span>
                </div>
                <p>{msg.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

