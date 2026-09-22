import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import {
  signAccessToken,
  signRefreshToken,
  JWT_REFRESH_SECRET,
  REFRESH_EXPIRES_IN_DAYS,
  requireAuth,
} from '../middleware/auth';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../middleware/auth';

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
  path: '/',
};

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({
    username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Tylko litery, cyfry i _'),
    email: z.string().email(),
    password: z.string().min(6),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { username, email, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existing) {
    res.status(409).json({
      error: existing.username === username ? 'Nazwa użytkownika zajęta' : 'Email już zarejestrowany',
    });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { username, email, passwordHash, role: 'USER', coins: 1000, gems: 5 },
  });

  const payload: JwtPayload = { userId: user.id, username: user.username, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRES_IN_DAYS * 86400 * 1000),
    },
  });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), online: true } });

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  res.status(201).json({ accessToken, user: safeUser(user) });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({
    username: z.string(),
    password: z.string(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Nieprawidłowe dane' });
    return;
  }

  const { username, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: { OR: [{ username }, { email: username }] },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: 'Nieprawidłowa nazwa użytkownika lub hasło' });
    return;
  }

  if (user.status === 'BANNED') {
    res.status(403).json({ error: 'Konto zostało zablokowane. Skontaktuj się z administracją.' });
    return;
  }

  const payload: JwtPayload = { userId: user.id, username: user.username, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRES_IN_DAYS * 86400 * 1000),
    },
  });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), online: true } });

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  res.json({ accessToken, user: safeUser(user) });
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401).json({ error: 'Brak refresh tokenu' });
    return;
  }

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    res.status(401).json({ error: 'Refresh token wygasł lub jest nieprawidłowy' });
    return;
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!stored || stored.expiresAt < new Date()) {
    res.status(401).json({ error: 'Refresh token unieważniony' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    res.status(401).json({ error: 'Użytkownik nie istnieje' });
    return;
  }

  // Rotate: delete old (safely), create new
  try {
    await prisma.refreshToken.deleteMany({ where: { tokenHash } });
  } catch {
    // Already deleted (race condition) — still proceed
  }

  const newRefreshToken = signRefreshToken({ userId: user.id, username: user.username, role: user.role });
  const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: newTokenHash,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRES_IN_DAYS * 86400 * 1000),
    },
  });

  const accessToken = signAccessToken({ userId: user.id, username: user.username, role: user.role });
  res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
  res.json({ accessToken, user: safeUser(user) });
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken;
  if (token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }
  res.clearCookie('refreshToken', { path: '/' });
  res.json({ message: 'Wylogowano pomyślnie' });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
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

function safeUser(user: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = user as { passwordHash: string } & Record<string, unknown>;
  return safe;
}

export default router;
