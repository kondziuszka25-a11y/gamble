import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireRole, requireOwner } from '../middleware/roles';

const router = Router();

const parseId = (param: string | string[] | undefined): number =>
  parseInt(Array.isArray(param) ? param[0] : (param || '0'), 10);

// GET /api/users — list all (MODERATOR+)
router.get('/', requireAuth, requireRole('MODERATOR'), async (_req: Request, res: Response): Promise<void> => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, username: true, email: true, role: true, status: true,
      level: true, xp: true, xpRequired: true, coins: true, gems: true,
      avatar: true, online: true, createdAt: true, lastLoginAt: true,
      ownedBoosts: true,
    },
  });
  res.json(users);
});

// GET /api/users/:id
router.get('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.id);
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, username: true, email: true, role: true, status: true,
      level: true, xp: true, xpRequired: true, coins: true, gems: true,
      avatar: true, online: true, createdAt: true, lastLoginAt: true,
      ownedBoosts: true,
      inventory: { orderBy: { obtainedAt: 'desc' } },
    },
  });
  if (!user) { res.status(404).json({ error: 'Nie znaleziono użytkownika' }); return; }
  res.json(user);
});

// PATCH /api/users/:id/balance — ADMIN+
router.patch('/:id/balance', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({ coinDiff: z.number().int(), gemDiff: z.number().int(), reason: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }

  const id = parseId(req.params.id);
  const { coinDiff, gemDiff, reason } = parsed.data;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) { res.status(404).json({ error: 'Użytkownik nie znaleziony' }); return; }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      coins: Math.max(0, user.coins + coinDiff),
      gems: Math.max(0, user.gems + gemDiff),
    },
  });

  const descParts: string[] = [];
  if (coinDiff !== 0) descParts.push(`${coinDiff > 0 ? '+' : ''}${coinDiff} monet`);
  if (gemDiff !== 0) descParts.push(`${gemDiff > 0 ? '+' : ''}${gemDiff} gemów`);

  await prisma.adminLog.create({
    data: {
      adminId: req.user!.userId,
      targetUserId: id,
      action: 'Korekta salda',
      value: descParts.join(', '),
      reason,
    },
  });

  res.json(updated);
});

// PATCH /api/users/:id/xp — ADMIN+
router.patch('/:id/xp', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({
    xpDiff: z.number().int().optional(),
    targetLevel: z.number().int().min(1).optional(),
    reason: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }

  const id = parseId(req.params.id);
  const { xpDiff = 0, targetLevel, reason = 'Korekta XP' } = parsed.data;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) { res.status(404).json({ error: 'Użytkownik nie znaleziony' }); return; }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      xp: Math.max(0, user.xp + xpDiff),
      ...(targetLevel !== undefined ? { level: targetLevel } : {}),
    },
  });

  await prisma.adminLog.create({
    data: {
      adminId: req.user!.userId,
      targetUserId: id,
      action: 'Modyfikacja XP/Poziomu',
      value: targetLevel ? `Ustawiono Level ${targetLevel}` : `${xpDiff > 0 ? '+' : ''}${xpDiff} XP`,
      reason,
    },
  });

  res.json(updated);
});

// PATCH /api/users/:id/role — OWNER only
router.patch('/:id/role', requireAuth, requireOwner, async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({ role: z.enum(['USER', 'MODERATOR', 'ADMIN', 'OWNER']), reason: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }

  const id = parseId(req.params.id);
  const { role, reason } = parsed.data;
  const updated = await prisma.user.update({ where: { id }, data: { role } });

  await prisma.adminLog.create({
    data: { adminId: req.user!.userId, targetUserId: id, action: 'Zmiana roli', value: `Nowa rola: ${role}`, reason },
  });

  res.json(updated);
});

// PATCH /api/users/:id/status — MODERATOR+
router.patch('/:id/status', requireAuth, requireRole('MODERATOR'), async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.id);
  const schema = z.object({ reason: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'Reason required' }); return; }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) { res.status(404).json({ error: 'Użytkownik nie znaleziony' }); return; }

  const newStatus = user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
  const updated = await prisma.user.update({ where: { id }, data: { status: newStatus } });

  await prisma.adminLog.create({
    data: {
      adminId: req.user!.userId,
      targetUserId: id,
      action: newStatus === 'BANNED' ? 'Zablokowano konto' : 'Odblokowano konto',
      value: `STATUS: ${newStatus}`,
      reason: parsed.data.reason,
    },
  });

  res.json(updated);
});

// POST /api/users/:id/reset-password — ADMIN+
router.post('/:id/reset-password', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.id);
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789#$!';
  let tempPass = 'JP-';
  for (let i = 0; i < 8; i++) tempPass += chars.charAt(Math.floor(Math.random() * chars.length));

  const passwordHash = await bcrypt.hash(tempPass, 12);
  await prisma.user.update({ where: { id }, data: { passwordHash } });

  await prisma.adminLog.create({
    data: {
      adminId: req.user!.userId,
      targetUserId: id,
      action: 'Reset hasła',
      value: 'Wygenerowano hasło tymczasowe',
      reason: 'Procedura bezpieczeństwa',
    },
  });

  res.json({ tempPassword: tempPass });
});

export default router;
