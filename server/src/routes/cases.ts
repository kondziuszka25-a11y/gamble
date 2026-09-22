import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

export interface CaseDropItem {
  name: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  value: number;
  iconType: string;
  description: string;
  weight: number; // Higher = more common
}

export interface CaseDefinition {
  id: string;
  name: string;
  description: string;
  priceCoins: number;
  priceGems: number;
  badge?: string;
  color: string;
  glowColor: string;
  items: CaseDropItem[];
}

export const CASES_CATALOGUE: CaseDefinition[] = [
  {
    id: 'starter_crate',
    name: 'Cybernetyczny Pakiet',
    description: 'Tania skrzynka na start dla każdego gracza.',
    priceCoins: 500,
    priceGems: 0,
    badge: 'START',
    color: 'from-blue-600/30 via-slate-800 to-transparent',
    glowColor: 'hover:border-blue-500/50 hover:shadow-blue-500/25',
    items: [
      { name: 'Krzemowy Chip Danych', category: 'Moduł', rarity: 'common', value: 180, iconType: 'Cube', description: 'Podstawowy układ scalony pamięci.', weight: 45 },
      { name: 'Miedziany Rezonator', category: 'Komponent', rarity: 'common', value: 320, iconType: 'Coin', description: 'Rezonator częstotliwości kwantowych.', weight: 35 },
      { name: 'Szafirowa Płytka Sieci', category: 'Kolekcja', rarity: 'rare', value: 850, iconType: 'Crystal', description: 'Światłowodowa płytka logiczna o podwyższonej przepustowości.', weight: 15 },
      { name: 'Szmaragdowe Kości Przeznaczenia', category: 'Kolekcja', rarity: 'rare', value: 1400, iconType: 'Dice', description: 'Zestaw cybernetycznych kości do gier losowych.', weight: 5 },
    ],
  },
  {
    id: 'neon_vault_crate',
    name: 'Neonowy Skarbiec',
    description: 'Najpopularniejsza skrzynka z solidnymi rzadkimi reliktami.',
    priceCoins: 2500,
    priceGems: 0,
    badge: 'POPULARNE',
    color: 'from-purple-600/30 via-slate-800 to-transparent',
    glowColor: 'hover:border-purple-500/50 hover:shadow-purple-500/25',
    items: [
      { name: 'Szafirowa Płytka Sieci', category: 'Kolekcja', rarity: 'rare', value: 950, iconType: 'Crystal', description: 'Światłowodowa płytka logiczna.', weight: 40 },
      { name: 'Szmaragdowe Kości Przeznaczenia', category: 'Kolekcja', rarity: 'rare', value: 1600, iconType: 'Dice', description: 'Cybernetyczne kości losowe.', weight: 30 },
      { name: 'Fioletowy Pulsator Czasu', category: 'Relikt', rarity: 'epic', value: 3800, iconType: 'Orb', description: 'Emituje ciągłe fale zakrzywiające percepcję czasu.', weight: 20 },
      { name: 'Cyber Smocza Kula', category: 'Relikt', rarity: 'epic', value: 6500, iconType: 'Dragon', description: 'Pozłacana kula energetyczna pulsująca neonowym blaskiem.', weight: 8 },
      { name: 'Kwantowy Kryształ Mocy', category: 'Relikt', rarity: 'legendary', value: 15000, iconType: 'Crystal', description: 'Krystaliczny nośnik czystej energii.', weight: 2 },
    ],
  },
  {
    id: 'quantum_capsule',
    name: 'Kwantowa Kapsuła',
    description: 'Epicka kapsuła z wysoką szansą na legendarne znaleziska.',
    priceCoins: 8000,
    priceGems: 0,
    badge: 'HOT',
    color: 'from-pink-600/30 via-slate-800 to-transparent',
    glowColor: 'hover:border-pink-500/50 hover:shadow-pink-500/25',
    items: [
      { name: 'Fioletowy Pulsator Czasu', category: 'Relikt', rarity: 'epic', value: 3800, iconType: 'Orb', description: 'Fale zakrzywiające percepcję czasu.', weight: 40 },
      { name: 'Cyber Smocza Kula', category: 'Relikt', rarity: 'epic', value: 7200, iconType: 'Dragon', description: 'Pozłacana kula pulsująca neonowym blaskiem.', weight: 35 },
      { name: 'Kwantowy Kryształ Mocy', category: 'Relikt', rarity: 'legendary', value: 19500, iconType: 'Crystal', description: 'Krystaliczny nośnik czystej energii.', weight: 20 },
      { name: 'Korona Władcy Cyberprzestrzeni', category: 'Artefakt', rarity: 'mythic', value: 55000, iconType: 'Crown', description: 'Mityczna korona elitarnych władców platformy.', weight: 5 },
    ],
  },
  {
    id: 'overlord_chest',
    name: 'Skarbiec Władcy',
    description: 'Ekskluzywna skrzynia dla VIP-ów z gwarancją epickiego lub lepszego dropu.',
    priceCoins: 25000,
    priceGems: 0,
    badge: 'VIP',
    color: 'from-amber-600/30 via-yellow-900/20 to-transparent',
    glowColor: 'hover:border-amber-400/60 hover:shadow-amber-400/30',
    items: [
      { name: 'Cyber Smocza Kula', category: 'Relikt', rarity: 'epic', value: 8500, iconType: 'Dragon', description: 'Pozłacana kula energetyczna.', weight: 40 },
      { name: 'Kwantowy Kryształ Mocy', category: 'Relikt', rarity: 'legendary', value: 24000, iconType: 'Crystal', description: 'Krystaliczny nośnik czystej energii.', weight: 40 },
      { name: 'Korona Władcy Cyberprzestrzeni', category: 'Artefakt', rarity: 'mythic', value: 85000, iconType: 'Crown', description: 'Mityczna korona elitarnych władców platformy.', weight: 20 },
    ],
  },
  {
    id: 'gem_crate',
    name: 'Kryształowa Skrzynia',
    description: 'Otwierana wyłącznie za gemy. Najwyższy współczynnik mitycznych artefaktów.',
    priceCoins: 0,
    priceGems: 20,
    badge: 'GEMY',
    color: 'from-cyan-600/30 via-blue-900/20 to-transparent',
    glowColor: 'hover:border-cyan-400/60 hover:shadow-cyan-400/30',
    items: [
      { name: 'Szmaragdowe Kości Przeznaczenia', category: 'Kolekcja', rarity: 'rare', value: 2500, iconType: 'Dice', description: 'Cybernetyczne kości losowe.', weight: 30 },
      { name: 'Cyber Smocza Kula', category: 'Relikt', rarity: 'epic', value: 9000, iconType: 'Dragon', description: 'Pozłacana kula energetyczna.', weight: 40 },
      { name: 'Kwantowy Kryształ Mocy', category: 'Relikt', rarity: 'legendary', value: 28000, iconType: 'Crystal', description: 'Krystaliczny nośnik czystej energii.', weight: 20 },
      { name: 'Korona Władcy Cyberprzestrzeni', category: 'Artefakt', rarity: 'mythic', value: 99000, iconType: 'Crown', description: 'Mityczna korona elitarnych władców.', weight: 10 },
    ],
  },
];

// GET /api/cases — list all available cases
router.get('/', (_req: Request, res: Response): void => {
  res.json(CASES_CATALOGUE);
});

// POST /api/cases/open — open a case
router.post('/open', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({ caseId: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Nieprawidłowe ID skrzynki' });
    return;
  }

  const { caseId } = parsed.data;
  const caseDef = CASES_CATALOGUE.find((c) => c.id === caseId);
  if (!caseDef) {
    res.status(404).json({ error: 'Skrzynia nie istnieje' });
    return;
  }

  const userId = req.user!.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    return;
  }

  // Check currency
  if (caseDef.priceCoins > 0 && user.coins < caseDef.priceCoins) {
    res.status(400).json({ error: 'Za mało monet na otwarcie skrzynki' });
    return;
  }
  if (caseDef.priceGems > 0 && user.gems < caseDef.priceGems) {
    res.status(400).json({ error: 'Za mało gemów na otwarcie skrzynki' });
    return;
  }

  // Weighted random pick
  const totalWeight = caseDef.items.reduce((sum, item) => sum + item.weight, 0);
  let randomVal = Math.random() * totalWeight;
  let wonDrop: CaseDropItem = caseDef.items[0];

  for (const item of caseDef.items) {
    if (randomVal < item.weight) {
      wonDrop = item;
      break;
    }
    randomVal -= item.weight;
  }

  // Deduct cost and save item to CollectibleItem in SQLite
  const [createdItem, updatedUser] = await prisma.$transaction([
    prisma.collectibleItem.create({
      data: {
        userId: user.id,
        name: wonDrop.name,
        category: wonDrop.category,
        rarity: wonDrop.rarity,
        value: wonDrop.value,
        iconType: wonDrop.iconType,
        description: wonDrop.description,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        coins: { decrement: caseDef.priceCoins },
        gems: { decrement: caseDef.priceGems },
        xp: { increment: Math.floor(caseDef.priceCoins / 50) + (caseDef.priceGems * 5) + 15 },
      },
    }),
  ]);

  res.json({
    wonItem: {
      id: createdItem.id,
      name: createdItem.name,
      category: createdItem.category,
      rarity: createdItem.rarity,
      value: createdItem.value,
      iconType: createdItem.iconType,
      description: createdItem.description,
      obtainedAt: createdItem.obtainedAt.toLocaleDateString('pl-PL'),
    },
    coins: updatedUser.coins,
    gems: updatedUser.gems,
    xp: updatedUser.xp,
  });
});

export default router;
