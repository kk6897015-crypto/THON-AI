import React, { useState, useEffect } from 'react';
import { DoubleBezelCard } from '../components/DoubleBezelCard.jsx';
import { TactileButton } from '../components/TactileButton.jsx';
import { teamApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const TeamHub = ({ onOpenTelegramModal, onOpenWhatsAppModal, onOpenSubModal }) => {
  const { user, activeTeam, selectTeam, fetchUser } = useAuth();
  const [teamDetails, setTeamDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // Creation & Join form state
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [pocPhone, setPocPhone] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');

  const loadTeamDetails = async () => {
    if (!activeTeam) return;
    setLoading(true);
    try {
      const res = await teamApi.getDetails(activeTeam.id);
      setTeamDetails(res.data.team);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamDetails();
  }, [activeTeam]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const res = await teamApi.create({
        name: newTeamName,
        point_of_contact_phone: pocPhone
      });
      await fetchUser();
      selectTeam(res.data.team);
      setShowCreate(false);
      setNewTeamName('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create team');
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    try {
      const res = await teamApi.join({ invite_code: inviteCodeInput });
      await fetchUser();
      selectTeam(res.data.team);
      setShowJoin(false);
      setInviteCodeInput('');
    } catch (err) {
      alert(err.response?.data?.error || 'Invalid invite code');
    }
  };

  const handleReassignLeader = async (newLeaderId) => {
    if (!confirm('Reassign team leadership to this member?')) return;
    try {
      await teamApi.reassignLeader(activeTeam.id, { new_leader_id: newLeaderId });
      loadTeamDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reassign leader');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header bar & Team Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-normal sm:font-medium tracking-tight text-white">
            Team Roster & Hub
          </h2>
          <p className="text-sm text-[#D8C3BB]">
            Invite members via code, assign team leaders, and configure daily push digests.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <TactileButton variant="secondary" onClick={() => setShowJoin(true)}>
            Join via Code
          </TactileButton>
          <TactileButton variant="primary" onClick={() => setShowCreate(true)} icon="+">
            Create Team
          </TactileButton>
        </div>
      </div>

      {/* CREATE TEAM MODAL */}
      {showCreate && (
        <DoubleBezelCard className="max-w-md mx-auto">
          <form onSubmit={handleCreateTeam} className="space-y-4 p-2">
            <h3 className="font-heading font-bold text-lg text-white">Create New Team</h3>
            <div>
              <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">Team Name</label>
              <input
                type="text"
                required
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g. QuantumHackers"
                className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#DE3C25]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">Point of Contact Phone (Reminders Only)</label>
              <input
                type="tel"
                value={pocPhone}
                onChange={(e) => setPocPhone(e.target.value)}
                placeholder="+1 555-0192"
                className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#DE3C25]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-pill-secondary text-xs">Cancel</button>
              <TactileButton type="submit" variant="primary" icon="✓">Create</TactileButton>
            </div>
          </form>
        </DoubleBezelCard>
      )}

      {/* JOIN TEAM MODAL */}
      {showJoin && (
        <DoubleBezelCard className="max-w-md mx-auto">
          <form onSubmit={handleJoinTeam} className="space-y-4 p-2">
            <h3 className="font-heading font-bold text-lg text-white">Join Team via Invite Code</h3>
            <div>
              <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">Invite Code</label>
              <input
                type="text"
                required
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. X7K9A2"
                className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-sm text-white font-mono-tabular uppercase focus:outline-none focus:border-[#DE3C25]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowJoin(false)} className="btn-pill-secondary text-xs">Cancel</button>
              <TactileButton type="submit" variant="primary" icon="→">Join Team</TactileButton>
            </div>
          </form>
        </DoubleBezelCard>
      )}

      {/* ACTIVE TEAM DETAILS */}
      {teamDetails ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Team Summary Card */}
          <div className="lg:col-span-1 space-y-4">
            <DoubleBezelCard>
              <div className="space-y-4 p-2">
                <div>
                  <span className="text-xs uppercase font-mono-tabular text-[#A89892]">ACTIVE TEAM</span>
                  <h3 className="font-heading font-bold text-2xl text-white">{teamDetails.name}</h3>
                </div>

                <div className="bg-[#140E0D] p-3 rounded-xl border border-[#F5E8E2]/10 space-y-2">
                  <div className="text-xs font-mono-tabular text-[#A89892]">INVITE CODE</div>
                  <div className="text-xl font-mono-tabular font-bold tracking-widest text-[#F87059]">
                    {teamDetails.invite_code}
                  </div>
                  <p className="text-[10px] text-[#A89892]">Share this code with teammates to join.</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#F5E8E2]/5">
                    <span className="text-[#A89892]">Subscription Plan:</span>
                    <span className="font-bold text-white uppercase font-mono-tabular">{teamDetails.subscription?.plan}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F5E8E2]/5">
                    <span className="text-[#A89892]">Telegram Push:</span>
                    <span className={`font-bold font-mono-tabular ${teamDetails.telegram?.verified ? 'text-[#F87059]' : 'text-amber-400'}`}>
                      {teamDetails.telegram?.verified ? 'LINKED' : 'NOT LINKED'}
                    </span>
                  </div>
                  {teamDetails.point_of_contact_phone && (
                    <div className="flex justify-between py-1 border-b border-[#F5E8E2]/5">
                      <span className="text-[#A89892]">Leader Phone POC:</span>
                      <span className="font-mono-tabular text-[#F5E8E2]">{teamDetails.point_of_contact_phone}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 space-y-2">
                  <TactileButton variant="primary" onClick={onOpenTelegramModal} className="w-full justify-center text-xs">
                    Telegram Bot Settings
                  </TactileButton>
                  <button
                    onClick={onOpenWhatsAppModal}
                    className="w-full btn-pill-secondary text-xs font-bold justify-center py-2 text-white"
                  >
                    💬 WhatsApp Team Group Bot
                  </button>
                  {teamDetails.subscription?.plan === 'free' && (
                    <TactileButton variant="secondary" onClick={onOpenSubModal} className="w-full justify-center text-xs">
                      Upgrade to Pro
                    </TactileButton>
                  )}
                </div>
              </div>
            </DoubleBezelCard>
          </div>

          {/* Right Column: Member Roster Table */}
          <div className="lg:col-span-2 space-y-4">
            <DoubleBezelCard>
              <div className="space-y-4 p-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-xl text-white">
                    Team Members ({teamDetails.members?.length || 0})
                  </h3>
                  <span className="text-xs font-mono-tabular text-[#A89892]">
                    Leader: {teamDetails.leader?.name}
                  </span>
                </div>

                <div className="space-y-3">
                  {teamDetails.members?.map((m) => {
                    const isLeader = m.id === teamDetails.leader_id;
                    const isSelfLeader = user?.id === teamDetails.leader_id;

                    return (
                      <div key={m.id} className="p-4 rounded-xl bg-[#140E0D] border border-[#F5E8E2]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{m.name}</span>
                            {isLeader && (
                              <span className="text-[10px] uppercase font-mono-tabular px-2 py-0.5 rounded-full bg-[#DE3C25]/20 border border-[#DE3C25]/40 text-[#F87059]">
                                Team Leader
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#A89892]">
                            {m.college} • {m.department} ({m.year_of_study})
                          </p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {m.skills?.map((sk, i) => (
                              <span key={i} className="text-[10px] font-mono-tabular px-2 py-0.5 rounded bg-[#1E1412] text-[#D8C3BB] border border-[#F5E8E2]/5">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Leader Actions */}
                        {isSelfLeader && !isLeader && (
                          <button
                            onClick={() => handleReassignLeader(m.id)}
                            className="text-xs text-[#F87059] hover:underline border border-[#DE3C25]/30 px-3 py-1 rounded-full bg-[#2D1815]"
                          >
                            Make Leader
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </DoubleBezelCard>
          </div>
        </div>
      ) : (
        <DoubleBezelCard>
          <div className="text-center py-12 space-y-4">
            <p className="text-[#A89892]">No active team selected.</p>
            <TactileButton variant="primary" onClick={() => setShowCreate(true)} icon="+">
              Create a Team Now
            </TactileButton>
          </div>
        </DoubleBezelCard>
      )}
    </div>
  );
};
