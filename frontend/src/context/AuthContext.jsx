import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeTeam, setActiveTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('teamlaunch_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      const userData = res.data.user;
      setUser(userData);

      if (userData.teams && userData.teams.length > 0) {
        const savedTeamId = localStorage.getItem('teamlaunch_active_team');
        const found = userData.teams.find(t => t.id === savedTeamId);
        setActiveTeam(found || userData.teams[0]);
      }
    } catch (err) {
      console.warn('Auth check failed:', err);
      localStorage.removeItem('teamlaunch_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('teamlaunch_token', token);
    setUser(userData);
    if (userData.teams && userData.teams.length > 0) {
      setActiveTeam(userData.teams[0]);
      localStorage.setItem('teamlaunch_active_team', userData.teams[0].id);
    }
  };

  const logout = () => {
    localStorage.removeItem('teamlaunch_token');
    localStorage.removeItem('teamlaunch_active_team');
    setUser(null);
    setActiveTeam(null);
  };

  const selectTeam = (team) => {
    setActiveTeam(team);
    if (team) {
      localStorage.setItem('teamlaunch_active_team', team.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, activeTeam, loading, login, logout, selectTeam, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
