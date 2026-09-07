import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'super-secret-teamlaunch-jwt-key-2026',
  jwtExpiresIn: '7d',
  dbPath: process.env.DB_PATH || './teamlaunch.db',
  postgresUrl: process.env.DATABASE_URL || null,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  semanticScholarUrl: 'https://api.semanticscholar.org/graph/v1/paper/search',
  openAlexUrl: 'https://api.openalex.org/works',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  razorpayPlanId: process.env.RAZORPAY_PLAN_ID || '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || ''
};
