import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/inventory
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const items = await prisma.collectibleItem.findMany({
    where: { userId: req.user!.userId },
    orderBy: { obtainedAt: 'desc' },
  });
  res.json(items);
});

// DELETE /api/inventory/:id  (sell item)
router.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const item = await prisma.collectibleItem.findUnique({ where: { id: paramId } });
  if (!item) { res.status(404).json({ error: 'Przedmiot nie znaleziony' }); return; }
  if (item.userId !== req.user!.userId) { res.status(403).json({ error: 'To nie jest Twój przedmiot' }); return; }

  const [, updatedUser] = await prisma.$transaction([
    prisma.collectibleItem.delete({ where: { id: item.id } }),
    prisma.user.update({
      where: { id: req.user!.userId },
      data: { coins: { increment: item.value } },
    }),
  ]);

  res.json({ coinsGained: item.value, coins: updatedUser.coins });
});

export default router;
