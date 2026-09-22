import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

// GET /api/admin/logs
router.get('/logs', requireAuth, requireRole('MODERATOR'), async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;

  const logs = await prisma.adminLog.findMany({
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      admin: { select: { username: true } },
      targetUser: { select: { username: true } },
    },
  });

  const total = await prisma.adminLog.count();

  res.json({
    logs: logs.map((l) => ({
      id: l.id,
      timestamp: l.createdAt.toLocaleString('pl-PL'),
      adminName: l.admin.username,
      targetUser: l.targetUser?.username ?? '—',
      action: l.action,
      value: l.value,
      reason: l.reason,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

// GET /api/admin/stats
router.get('/stats', requireAuth, requireRole('ADMIN'), async (_req: Request, res: Response): Promise<void> => {
  const [totalUsers, activeUsers, bannedUsers, totalGames, totalWins] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { status: 'BANNED' } }),
    prisma.gameHistory.count(),
    prisma.gameHistory.count({ where: { result: 'WIN' } }),
  ]);

  const coinsSum = await prisma.user.aggregate({ _sum: { coins: true } });
  const gemsSum = await prisma.user.aggregate({ _sum: { gems: true } });

  res.json({
    totalUsers,
    activeUsers,
    bannedUsers,
    totalGames,
    totalWins,
    winRate: totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : '0',
    totalCoinsInCirculation: coinsSum._sum.coins ?? 0,
    totalGemsInCirculation: gemsSum._sum.gems ?? 0,
  });
});

export default router;
