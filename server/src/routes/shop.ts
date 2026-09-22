import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Static shop items catalogue (same as frontend)
const SHOP_ITEMS = [
  { id: 'coin_boost_10', name: 'Złoty Dotyk I', cost: 15, type: 'permanent', category: 'coins' },
  { id: 'coin_boost_25', name: 'Złoty Dotyk II', cost: 40, type: 'permanent', category: 'coins' },
  { id: 'coin_boost_50', name: 'Złoty Dotyk III', cost: 90, type: 'permanent', category: 'coins' },
  { id: 'xp_boost_20', name: 'Akcelerator XP', cost: 20, type: 'permanent', category: 'xp' },
  { id: 'xp_boost_50', name: 'Turbodoładowanie XP', cost: 55, type: 'permanent', category: 'xp' },
  { id: 'lucky_charm', name: 'Talizman Szczęścia', cost: 30, type: 'permanent', category: 'luck' },
  { id: 'daily_doubler', name: 'Podwójne Nagrody', cost: 25, type: 'permanent', category: 'daily' },
  { id: 'loss_shield', name: 'Tarcza przed Stratą', cost: 35, type: 'permanent', category: 'luck' },
  { id: 'gem_finder', name: 'Wyczucie Klejnotów', cost: 20, type: 'permanent', category: 'coins' },
  { id: 'coin_rush_24h', name: 'Gorączka Monet 24H', cost: 50, type: 'timed', category: 'coins', durationHours: 24 },
  { id: 'xp_rush_24h', name: 'Szał XP 24H', cost: 30, type: 'timed', category: 'xp', durationHours: 24 },
  { id: 'vip_badge', name: 'Odznaka VIP', cost: 100, type: 'permanent', category: 'cosmetic' },
];

// GET /api/shop/items
router.get('/items', (_req: Request, res: Response): void => {
  res.json(SHOP_ITEMS);
});

// GET /api/shop/owned
router.get('/owned', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const boosts = await prisma.ownedBoost.findMany({
    where: { userId: req.user!.userId },
  });
  res.json(boosts);
});

// POST /api/shop/purchase
router.post('/purchase', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({ shopItemId: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'Nieprawidłowe dane' }); return; }

  const { shopItemId } = parsed.data;
  const shopItem = SHOP_ITEMS.find((i) => i.id === shopItemId);
  if (!shopItem) { res.status(404).json({ error: 'Przedmiot nie istnieje' }); return; }

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) { res.status(404).json({ error: 'Użytkownik nie znaleziony' }); return; }
  if (user.gems < shopItem.cost) { res.status(400).json({ error: 'Niewystarczające saldo gemów' }); return; }

  // Check if permanent boost already owned
  if (shopItem.type === 'permanent') {
    const existing = await prisma.ownedBoost.findUnique({
      where: { userId_shopItemId: { userId: user.id, shopItemId } },
    });
    if (existing?.isActive) { res.status(409).json({ error: 'Już posiadasz ten bonus' }); return; }
  }

  const expiresAt =
    shopItem.type === 'timed' && 'durationHours' in shopItem
      ? new Date(Date.now() + (shopItem.durationHours as number) * 3600 * 1000)
      : undefined;

  const [boost, updatedUser] = await prisma.$transaction([
    prisma.ownedBoost.upsert({
      where: { userId_shopItemId: { userId: user.id, shopItemId } },
      create: { userId: user.id, shopItemId, expiresAt, isActive: true },
      update: { expiresAt, isActive: true, purchasedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { gems: user.gems - shopItem.cost },
    }),
  ]);

  res.json({ boost, gems: updatedUser.gems });
});

export default router;
