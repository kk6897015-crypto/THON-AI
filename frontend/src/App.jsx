import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { useLenis } from './hooks/useLenis.js';
import { SidebarNav } from './components/SidebarNav.jsx';
import { FloatingNav } from './components/FloatingNav.jsx';
import { KanbanBoard } from './components/KanbanBoard.jsx';
import { DoubleBezelCard } from './components/DoubleBezelCard.jsx';
import { TactileButton } from './components/TactileButton.jsx';
import { SubscriptionModal } from './components/SubscriptionModal.jsx';
import { TelegramLinkModal } from './components/TelegramLinkModal.jsx';
import { WhatsAppModal } from './components/WhatsAppModal.jsx';
import { AiCompanion } from './components/AiCompanion.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { AuthPage } from './pages/AuthPage.jsx';
import { TeamHub } from './pages/TeamHub.jsx';
import { EligibilityPage } from './pages/EligibilityPage.jsx';
import { NoveltyPage } from './pages/NoveltyPage.jsx';
import { DeckStudioPage } from './pages/DeckStudioPage.jsx';
import { PPTCheckerPage } from './pages/PPTCheckerPage.jsx';
import { DiscoverPage } from './pages/DiscoverPage.jsx';
import { BatmanIntro } from './components/BatmanIntro.jsx';
import { competitionApi } from './services/api.js';

function MainApp() {
  const { user, activeTeam, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('kanban');
  const [showBatmanIntro, setShowBatmanIntro] = useState(true);

  // Initialize Lenis Smooth Scrolling across app
  useLenis();

  // Competitions state
  const [competitions, setCompetitions] = useState([]);
  const [compLoading, setCompLoading] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  // Add Competition Form State
  const [addForm, setAddForm] = useState({
    title: '',
    source_url: '',
    platform: 'Devfolio',
    level: 'national',
    tags: 'AI, Web3, Hackathon',
    deadline: '',
    eligibility_raw_text: ''
  });

  const loadCompetitions = async () => {
    if (!activeTeam) return;
    setCompLoading(true);
    try {
      const res = await competitionApi.getByTeam(activeTeam.id);
      setCompetitions(res.data.competitions || []);
    } catch (err) {
      console.error('Failed to load team competitions:', err);
    } finally {
      setCompLoading(false);
    }
  };

  useEffect(() => {
    if (activeTeam) {
      loadCompetitions();
    }
  }, [activeTeam]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!activeTeam) return alert('Select or create a team first');
    try {
      await competitionApi.add({
        team_id: activeTeam.id,
        ...addForm
      });
      setShowAddModal(false);
      setAddForm({
        title: '',
        source_url: '',
        platform: 'Devfolio',
        level: 'national',
        tags: 'AI, Web3, Hackathon',
        deadline: '',
        eligibility_raw_text: ''
      });
      loadCompetitions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add competition');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0E0A09] text-[#F5E8E2]">
        <div className="space-y-3 text-center">
          <div className="w-12 h-12 rounded-full bg-[#DE3C25] animate-pulse-subtle mx-auto flex items-center justify-center font-bold text-white shadow-xl shadow-[#DE3C25]/40">
            TL
          </div>
          <p className="text-xs font-mono-tabular text-[#A89892]">Loading Team Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0E0A09] text-[#F5E8E2] flex p-3 md:p-4 gap-6 pb-24">
      {/* Left Floating Glass Sidebar for Desktop */}
      <SidebarNav currentTab={currentTab} setTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto">
        {/* Top Header Navigation with Bat-Signal trigger */}
        <FloatingNav
          currentTab={currentTab}
          setTab={setCurrentTab}
          onTriggerBatman={() => setShowBatmanIntro(true)}
        />

        {/* Batman Opening Cinematic Intro Overlay */}
        {showBatmanIntro && (
          <BatmanIntro onComplete={() => setShowBatmanIntro(false)} />
        )}

        <main className="flex-1">
          {(!user && (currentTab === 'kanban' || !currentTab)) ? (
            <LandingPage
              onGetStarted={() => setCurrentTab('auth')}
              onExploreTab={(tab) => setCurrentTab(tab)}
            />
          ) : currentTab === 'auth' ? (
            <AuthPage onComplete={() => setCurrentTab('kanban')} />
          ) : currentTab === 'discover' ? (
            <DiscoverPage onRefresh={loadCompetitions} />
          ) : currentTab === 'teams' ? (
            user ? (
              <TeamHub
                onOpenTelegramModal={() => setShowTelegramModal(true)}
                onOpenWhatsAppModal={() => setShowWhatsAppModal(true)}
                onOpenSubModal={() => setShowSubModal(true)}
              />
            ) : (
              <AuthPage onComplete={() => setCurrentTab('teams')} />
            )
          ) : currentTab === 'eligibility' ? (
            <EligibilityPage />
          ) : currentTab === 'novelty' ? (
            <NoveltyPage />
          ) : currentTab === 'deck' ? (
            <DeckStudioPage />
          ) : currentTab === 'ppt' ? (
            <PPTCheckerPage />
          ) : (
            <KanbanBoard
              competitions={competitions}
              onRefresh={loadCompetitions}
              onOpenAddModal={() => setShowAddModal(true)}
              onRequireSubscription={() => setShowSubModal(true)}
            />
          )}
        </main>
      </div>

      {/* ADD COMPETITION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-float">
          <div className="w-full max-w-lg">
            <DoubleBezelCard>
              <form onSubmit={handleAddSubmit} className="space-y-4 p-2">
                <div className="flex items-center justify-between border-b border-[#F5E8E2]/10 pb-3">
                  <h3 className="font-heading font-bold text-xl text-white">
                    Add Manual Competition Entry
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-[#A89892] hover:text-white p-1"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">
                    Competition Title
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.title}
                    onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                    placeholder="e.g. Innovation Challenge 2026"
                    className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#DE3C25]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">
                      Official Source Link
                    </label>
                    <input
                      type="url"
                      value={addForm.source_url}
                      onChange={(e) => setAddForm({ ...addForm, source_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE3C25]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">
                      Platform
                    </label>
                    <input
                      type="text"
                      value={addForm.platform}
                      onChange={(e) => setAddForm({ ...addForm, platform: e.target.value })}
                      placeholder="Devfolio, Unstop, College"
                      className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE3C25]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">
                      Event Level
                    </label>
                    <select
                      value={addForm.level}
                      onChange={(e) => setAddForm({ ...addForm, level: e.target.value })}
                      className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE3C25]"
                    >
                      <option value="college">College Level</option>
                      <option value="state">State Level</option>
                      <option value="national">National Level</option>
                      <option value="global">Global Level</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">
                      Submission Deadline
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={addForm.deadline}
                      onChange={(e) => setAddForm({ ...addForm, deadline: e.target.value })}
                      className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE3C25]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">
                    Eligibility Raw Text (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={addForm.eligibility_raw_text}
                    onChange={(e) => setAddForm({ ...addForm, eligibility_raw_text: e.target.value })}
                    placeholder="Paste eligibility rules text for automated checking..."
                    className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#DE3C25]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-pill-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <TactileButton type="submit" variant="primary" icon="+">
                    Add to Hackathon Tracker
                  </TactileButton>
                </div>
              </form>
            </DoubleBezelCard>
          </div>
        </div>
      )}

      {/* SUBSCRIPTION, TELEGRAM & WHATSAPP MODALS */}
      <SubscriptionModal
        teamId={activeTeam?.id}
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        onSuccess={() => {
          setShowSubModal(false);
          setShowTelegramModal(true);
          loadCompetitions();
        }}
      />

      <TelegramLinkModal
        teamId={activeTeam?.id}
        isOpen={showTelegramModal}
        onClose={() => setShowTelegramModal(false)}
        onSuccess={() => {
          setShowTelegramModal(false);
        }}
      />

      <WhatsAppModal
        teamId={activeTeam?.id}
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
      />

      {/* Floating AI Co-Pilot Companion */}
      <AiCompanion currentTab={currentTab} activeTeam={activeTeam} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
