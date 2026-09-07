import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi, teamApi } from '../services/api.js';
import { DoubleBezelCard } from '../components/DoubleBezelCard.jsx';
import { TactileButton } from '../components/TactileButton.jsx';

const DEMO_EMAIL = 'demo@teamlaunch.io';
const DEMO_PASSWORD = 'password123';

export const AuthPage = ({ onComplete }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Register form
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    department: '',
    year_of_study: '1',
    skills: '',
    phone: '',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(loginForm);
      login(res.data.token, res.data.user);
      onComplete?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.register(regForm);
      login(res.data.token, res.data.user);
      onComplete?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
      login(res.data.token, res.data.user);
      onComplete?.();
    } catch (err) {
      setError('Demo account unavailable right now. Please register.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0E0A09]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#DE3C25] flex items-center justify-center font-heading font-bold text-white text-xl mx-auto mb-4 shadow-xl shadow-[#DE3C25]/30">
            TL
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">
            {mode === 'login' ? 'Welcome back' : 'Join THON-AI'}
          </h1>
          <p className="text-sm text-[#A89892] mt-1">
            {mode === 'login'
              ? 'Sign in to your team command center'
              : 'Create your account and start building'}
          </p>
        </div>

        <DoubleBezelCard>
          <div className="p-2 space-y-5">
            {/* Mode Tabs */}
            <div className="flex gap-1 bg-[#140E0D] p-1 rounded-xl">
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  id={`auth-tab-${m}`}
                  onClick={() => { setMode(m); setError(''); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mode === m
                      ? 'bg-[#DE3C25] text-white shadow-lg'
                      : 'text-[#A89892] hover:text-white'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-[#2D1815] border border-[#DE3C25]/40 text-[#F87059] text-xs">
                {error}
              </div>
            )}

            {/* Login Form */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#DE3C25]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#DE3C25]"
                  />
                </div>
                <TactileButton type="submit" variant="primary" disabled={loading} className="w-full justify-center">
                  {loading ? 'Signing in...' : 'Sign In'}
                </TactileButton>
              </form>
            )}

            {/* Register Form */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">Full Name</label>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      placeholder="Alex Kumar"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE3C25]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">Phone</label>
                    <input
                      id="reg-phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE3C25]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">Email</label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="you@college.edu"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE3C25]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">Password</label>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE3C25]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">College</label>
                    <input
                      id="reg-college"
                      type="text"
                      placeholder="IITM, VIT, Anna Univ..."
                      value={regForm.college}
                      onChange={(e) => setRegForm({ ...regForm, college: e.target.value })}
                      className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE3C25]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">Department</label>
                    <input
                      id="reg-dept"
                      type="text"
                      placeholder="CSE, ECE, ME..."
                      value={regForm.department}
                      onChange={(e) => setRegForm({ ...regForm, department: e.target.value })}
                      className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE3C25]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">Year of Study</label>
                    <select
                      id="reg-year"
                      value={regForm.year_of_study}
                      onChange={(e) => setRegForm({ ...regForm, year_of_study: e.target.value })}
                      className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE3C25]"
                    >
                      {['1', '2', '3', '4', '5'].map((y) => (
                        <option key={y} value={y}>Year {y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono-tabular text-[#A89892] mb-1">Skills (comma-sep)</label>
                    <input
                      id="reg-skills"
                      type="text"
                      placeholder="React, Python, ML..."
                      value={regForm.skills}
                      onChange={(e) => setRegForm({ ...regForm, skills: e.target.value })}
                      className="w-full bg-[#140E0D] border border-[#F5E8E2]/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE3C25]"
                    />
                  </div>
                </div>
                <TactileButton type="submit" variant="primary" disabled={loading} className="w-full justify-center">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </TactileButton>
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#F5E8E2]/10" />
              <span className="text-[10px] font-mono-tabular text-[#A89892]">OR</span>
              <div className="flex-1 h-px bg-[#F5E8E2]/10" />
            </div>

            {/* 1-Click Demo */}
            <button
              id="demo-login-btn"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-xl border border-[#F5E8E2]/15 text-xs font-semibold text-[#D8C3BB] hover:border-[#DE3C25]/50 hover:text-white transition-all bg-[#140E0D] hover:bg-[#1E1412]"
            >
              ⚡ 1-click Demo Login (demo@teamlaunch.io)
            </button>
          </div>
        </DoubleBezelCard>
      </div>
    </div>
  );
};
