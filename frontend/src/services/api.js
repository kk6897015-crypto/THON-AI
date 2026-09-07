import axios from 'axios';

// Resolve base URL: use VITE_API_URL in prod, or relative /api in dev (proxied by vite)
const BASE_URL =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}`
    : '';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('teamlaunch_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
};

// Teams API
export const teamApi = {
  create: (data) => api.post('/api/teams/create', data),
  join: (data) => api.post('/api/teams/join', data),
  getMyTeams: () => api.get('/api/teams/mine'),
  getMembers: (teamId) => api.get(`/api/teams/${teamId}/members`),
  removeMember: (teamId, userId) => api.delete(`/api/teams/${teamId}/members/${userId}`),
  getTeamInfo: (teamId) => api.get(`/api/teams/${teamId}`),
  linkTelegram: (data) => api.post('/api/telegram/link', data),
};

// Competitions API
export const competitionApi = {
  getAll: (params) => api.get('/api/competitions', { params }),
  getByTeam: (teamId) => api.get(`/api/competitions/team/${teamId}`),
  add: (data) => api.post('/api/competitions', data),
  updateStatus: (id, data) => api.patch(`/api/competitions/${id}/status`, data),
  delete: (id) => api.delete(`/api/competitions/${id}`),
  scrape: (data) => api.post('/api/competitions/scrape', data),
  share: (id) => api.post(`/api/competitions/${id}/share`),
};

// Eligibility API
export const eligibilityApi = {
  check: (data) => api.post('/api/eligibility/check', data),
};

// Novelty API
export const noveltyApi = {
  search: (data) => api.post('/api/novelty/search', data),
};

// Deck API
export const deckApi = {
  generate: (data) => api.post('/api/deck/generate', data),
  getSaved: (teamId) => api.get(`/api/deck/team/${teamId}`),
};

// PPT API
export const pptApi = {
  check: (formData) =>
    api.post('/api/ppt/check', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Subscription / Billing API
export const billingApi = {
  getStatus: () => api.get('/api/billing/status'),
  subscribe: (data) => api.post('/api/billing/subscribe', data),
  verify: (data) => api.post('/api/billing/subscribe/verify', data),
  upgrade: (data) => api.post('/api/billing/upgrade', data),
};

// Telegram API
export const telegramApi = {
  link: (data) => api.post('/api/telegram/link', data),
  status: (teamId) => api.get(`/api/telegram/status/${teamId}`),
};

// WhatsApp API
export const whatsappApi = {
  send: (data) => api.post('/api/whatsapp/send', data),
};

export default api;
