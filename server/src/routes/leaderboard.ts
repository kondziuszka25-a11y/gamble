import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/leaderboard?by=coins|level|wins
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const by = (req.query.by as string) || 'coins';

  let orderBy: Record<string, string> = { coins: 'desc' };
  if (by === 'level') orderBy = { level: 'desc' };
  else if (by === 'xp') orderBy = { xp: 'desc' };

  const users = await prisma.user.findMany({
    where: { status: 'ACTIVE' },
    orderBy,
    take: 50,
    select: {
      id: true, username: true, avatar: true, level: true,
      xp: true, coins: true, gems: true, role: true,
    },
  });

  // For wins leaderboard we need to count from gameHistory
  if (by === 'wins') {
    const wins = await prisma.gameHistory.groupBy({
      by: ['userId'],
      where: { result: 'WIN' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 50,
    });

    const winMap = new Map(wins.map((w) => [w.userId, w._count.id]));
    const allUsers = await prisma.user.findMany({
      where: { id: { in: wins.map((w) => w.userId) } },
      select: { id: true, username: true, avatar: true, level: true, xp: true, coins: true, gems: true, role: true },
    });

    const sorted = allUsers
      .map((u) => ({ ...u, winCount: winMap.get(u.id) ?? 0 }))
      .sort((a, b) => b.winCount - a.winCount);

    res.json(sorted);
    return;
  }

  res.json(users);
});

export default router;
