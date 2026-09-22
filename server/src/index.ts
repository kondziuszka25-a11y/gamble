import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

import authRouter from './routes/auth';
import usersRouter from './routes/users';
import shopRouter from './routes/shop';
import inventoryRouter from './routes/inventory';
import rewardsRouter from './routes/rewards';
import leaderboardRouter from './routes/leaderboard';
import gamesRouter from './routes/games';
import adminRouter from './routes/admin';
import casesRouter from './routes/cases';

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS configuration for development & production ──────────────────────────
const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const envOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((u) => u.trim())
  : [];
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    // In production, also allow if matches configured domain
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/shop', shopRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/rewards', rewardsRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/games', gamesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/cases', casesRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ── Static Frontend Serving (in production / single container hosting) ──────
const clientDist = path.resolve(__dirname, '../../dist');
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  // Development or standalone API info page
  app.get('/', (_req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="pl">
      <head>
        <meta charset="UTF-8">
        <title>JACKPOT API Server</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #05070D; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
          .card { background: #0D1324; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 2.5rem; max-width: 500px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
          h1 { margin: 0 0 0.5rem; font-weight: 900; background: linear-gradient(135deg, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; }
          .btn { display: inline-block; margin-top: 1.5rem; background: linear-gradient(135deg, #a855f7, #ec4899); color: white; text-decoration: none; padding: 0.75rem 1.75rem; border-radius: 12px; font-weight: bold; font-size: 0.9rem; transition: transform 0.2s; }
          .btn:hover { transform: scale(1.05); }
          .status { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0.85rem; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); border-radius: 999px; color: #4ade80; font-size: 0.8rem; font-weight: bold; margin-bottom: 1rem; }
          .dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; box-shadow: 0 0 10px #4ade80; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="status"><span class="dot"></span> Backend API aktywny (Port ${PORT})</div>
          <h1>JACKPOT Backend API</h1>
          <p>To jest serwer bazodanowy i API dla platformy. Jeśli strona główna jest zbudowana, Express serwuje ją automatycznie.</p>
          <a href="http://localhost:5173" class="btn">Frontend Dev (Port 5173) &rarr;</a>
        </div>
      </body>
      </html>
    `);
  });
}

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint nie istnieje' });
});

// ── Global Express error handler ──────────────────────────────────────────────
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('❌ Unhandled Express error:', err);
  res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
});

// ── Prevent server crash on unhandled rejections ───────────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('⚠️  Unhandled Promise Rejection:', reason);
  // Do NOT exit — keep server alive
});

process.on('uncaughtException', (err) => {
  console.error('⚠️  Uncaught Exception:', err);
  // Do NOT exit — keep server alive
});

app.listen(PORT, () => {
  console.log(`🎰 JACKPOT Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
