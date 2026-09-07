import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { getDb } from './db.js';
import { initTelegramDigestScheduler } from './services/telegramBotService.js';

import authRoutes from './routes/auth.js';
import teamRoutes from './routes/teams.js';
import competitionRoutes from './routes/competitions.js';
import eligibilityRoutes from './routes/eligibility.js';
import noveltyRoutes from './routes/novelty.js';
import deckRoutes from './routes/deck.js';
import pptRoutes from './routes/ppt.js';
import subscriptionRoutes from './routes/subscription.js';
import billingRoutes from './routes/billing.js';
import telegramRoutes from './routes/telegram.js';
import whatsappRoutes from './routes/whatsapp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(
  express.json({
    limit: '25mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);

// Determine static build path (checks backend/public then frontend/dist)
const publicDir = path.resolve(__dirname, '../public');
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
const staticDir = fs.existsSync(publicDir) ? publicDir : (fs.existsSync(frontendDist) ? frontendDist : null);

if (staticDir) {
  app.use(express.static(staticDir));
}

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/novelty', noveltyRoutes);
app.use('/api/deck', deckRoutes);
app.use('/api/ppt', pptRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// SPA fallback: any non-API route serves the frontend app
if (staticDir) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(staticDir, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      name: 'TeamLaunch / THON-AI API',
      status: 'online',
      health: '/api/health',
      time: new Date().toISOString()
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const PORT = config.port;

async function startServer() {
  try {
    await getDb();
    console.log('Database initialized successfully.');

    initTelegramDigestScheduler();
    console.log('Telegram daily digest scheduler running.');

    app.listen(PORT, () => {
      console.log(`🚀 TeamLaunch JS Backend API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
