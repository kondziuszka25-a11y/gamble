"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: auth_1.REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
};
// POST /api/auth/register
router.post('/register', async (req, res) => {
    const schema = zod_1.z.object({
        username: zod_1.z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Tylko litery, cyfry i _'),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
    }
    const { username, email, password } = parsed.data;
    const existing = await prisma_1.prisma.user.findFirst({
        where: { OR: [{ username }, { email }] },
    });
    if (existing) {
        res.status(409).json({
            error: existing.username === username ? 'Nazwa użytkownika zajęta' : 'Email już zarejestrowany',
        });
        return;
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 12);
    const user = await prisma_1.prisma.user.create({
        data: { username, email, passwordHash, role: 'USER', coins: 1000, gems: 5 },
    });
    const payload = { userId: user.id, username: user.username, role: user.role };
    const accessToken = (0, auth_1.signAccessToken)(payload);
    const refreshToken = (0, auth_1.signRefreshToken)(payload);
    const tokenHash = crypto_1.default.createHash('sha256').update(refreshToken).digest('hex');
    await prisma_1.prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash,
            expiresAt: new Date(Date.now() + auth_1.REFRESH_EXPIRES_IN_DAYS * 86400 * 1000),
        },
    });
    await prisma_1.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), online: true } });
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.status(201).json({ accessToken, user: safeUser(user) });
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
    const schema = zod_1.z.object({
        username: zod_1.z.string(),
        password: zod_1.z.string(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Nieprawidłowe dane' });
        return;
    }
    const { username, password } = parsed.data;
    const user = await prisma_1.prisma.user.findFirst({
        where: { OR: [{ username }, { email: username }] },
    });
    if (!user || !(await bcryptjs_1.default.compare(password, user.passwordHash))) {
        res.status(401).json({ error: 'Nieprawidłowa nazwa użytkownika lub hasło' });
        return;
    }
    if (user.status === 'BANNED') {
        res.status(403).json({ error: 'Konto zostało zablokowane. Skontaktuj się z administracją.' });
        return;
    }
    const payload = { userId: user.id, username: user.username, role: user.role };
    const accessToken = (0, auth_1.signAccessToken)(payload);
    const refreshToken = (0, auth_1.signRefreshToken)(payload);
    const tokenHash = crypto_1.default.createHash('sha256').update(refreshToken).digest('hex');
    await prisma_1.prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash,
            expiresAt: new Date(Date.now() + auth_1.REFRESH_EXPIRES_IN_DAYS * 86400 * 1000),
        },
    });
    await prisma_1.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), online: true } });
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.json({ accessToken, user: safeUser(user) });
});
// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) {
        res.status(401).json({ error: 'Brak refresh tokenu' });
        return;
    }
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, auth_1.JWT_REFRESH_SECRET);
    }
    catch {
        res.status(401).json({ error: 'Refresh token wygasł lub jest nieprawidłowy' });
        return;
    }
    const tokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
    const stored = await prisma_1.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!stored || stored.expiresAt < new Date()) {
        res.status(401).json({ error: 'Refresh token unieważniony' });
        return;
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
        res.status(401).json({ error: 'Użytkownik nie istnieje' });
        return;
    }
    // Rotate: delete old (safely), create new
    try {
        await prisma_1.prisma.refreshToken.deleteMany({ where: { tokenHash } });
    }
    catch {
        // Already deleted (race condition) — still proceed
    }
    const newRefreshToken = (0, auth_1.signRefreshToken)({ userId: user.id, username: user.username, role: user.role });
    const newTokenHash = crypto_1.default.createHash('sha256').update(newRefreshToken).digest('hex');
    await prisma_1.prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: newTokenHash,
            expiresAt: new Date(Date.now() + auth_1.REFRESH_EXPIRES_IN_DAYS * 86400 * 1000),
        },
    });
    const accessToken = (0, auth_1.signAccessToken)({ userId: user.id, username: user.username, role: user.role });
    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
    res.json({ accessToken, user: safeUser(user) });
});
// POST /api/auth/logout
router.post('/logout', async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (token) {
        const tokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        await prisma_1.prisma.refreshToken.deleteMany({ where: { tokenHash } });
    }
    res.clearCookie('refreshToken', { path: '/' });
    res.json({ message: 'Wylogowano pomyślnie' });
});
// GET /api/auth/me
router.get('/me', auth_1.requireAuth, async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
            ownedBoosts: true,
            inventory: { orderBy: { obtainedAt: 'desc' } },
        },
    });
    if (!user) {
        res.status(404).json({ error: 'Użytkownik nie znaleziony' });
        return;
    }
    res.json(safeUser(user));
});
function safeUser(user) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safe } = user;
    return safe;
}
exports.default = router;
//# sourceMappingURL=auth.js.map