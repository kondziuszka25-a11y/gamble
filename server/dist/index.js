"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const shop_1 = __importDefault(require("./routes/shop"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const rewards_1 = __importDefault(require("./routes/rewards"));
const leaderboard_1 = __importDefault(require("./routes/leaderboard"));
const games_1 = __importDefault(require("./routes/games"));
const admin_1 = __importDefault(require("./routes/admin"));
const cases_1 = __importDefault(require("./routes/cases"));
const prisma_1 = require("./lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || process.env.SERVER_PORT || 3001;
// ── CORS configuration for development & production ──────────────────────────
const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const envOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((u) => u.trim())
    : [];
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, same-origin)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            return callback(null, true);
        }
        // In production, also allow if matches configured domain
        callback(null, true);
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/shop', shop_1.default);
app.use('/api/inventory', inventory_1.default);
app.use('/api/rewards', rewards_1.default);
app.use('/api/leaderboard', leaderboard_1.default);
app.use('/api/games', games_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/cases', cases_1.default);
// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
    });
});
// ── Static Frontend Serving (in production / single container hosting) ──────
const clientDist = path_1.default.resolve(__dirname, '../../dist');
if (fs_1.default.existsSync(path_1.default.join(clientDist, 'index.html'))) {
    app.use(express_1.default.static(clientDist));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api'))
            return next();
        res.sendFile(path_1.default.join(clientDist, 'index.html'));
    });
}
else {
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
app.use((err, _req, res, _next) => {
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
app.listen(PORT, async () => {
    console.log(`🎰 JACKPOT Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    // Automatically ensure owner account exists on startup
    try {
        const userCount = await prisma_1.prisma.user.count().catch(() => null);
        if (userCount === 0) {
            console.log('🌱 Empty database detected: seeding default owner account (kondom)...');
            const hashedPassword = await bcryptjs_1.default.hash('Kondzio25!', 10);
            await prisma_1.prisma.user.create({
                data: {
                    username: 'kondom',
                    email: 'kondom@jackpot.gg',
                    passwordHash: hashedPassword,
                    role: 'OWNER',
                    coins: 1000,
                    gems: 5,
                    level: 1,
                    xp: 0,
                    xpRequired: 1000,
                },
            });
            console.log('👑 Owner account (kondom) created successfully!');
        }
    }
    catch (err) {
        console.warn('⚠️ Startup DB check note:', err?.message || err);
    }
});
//# sourceMappingURL=index.js.map