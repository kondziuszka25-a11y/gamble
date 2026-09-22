"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const GAMES_LIST = [
    { id: 'crash', name: 'Crash', description: 'Odbierz wygraną zanim rakieta odleci. Im dłużej czekasz, tym więcej zarabiasz — ale ryzykujesz wszystko!', iconName: 'Rocket', badge: 'POPULARNE', maxMultiplier: '100x+', activePlayers: 421, gradient: 'from-purple-600/30 via-indigo-900/20 to-transparent', glowColor: 'hover:border-purple-500/50 hover:shadow-purple-500/25' },
    { id: 'hilo', name: 'Hi-Lo', description: 'Zgadnij czy następna karta będzie wyższa czy niższa. Kumuluj mnożnik i wypłać w idealnym momencie!', iconName: 'Layers', badge: 'NOWE', maxMultiplier: '500x+', activePlayers: 312, gradient: 'from-blue-600/30 via-indigo-900/20 to-transparent', glowColor: 'hover:border-blue-500/50 hover:shadow-blue-500/25' },
    { id: 'mines', name: 'Miny', description: 'Odkrywaj bezpieczne pola na siatce 5×5 i zwiększaj mnożnik. Jedno złe pole kończy rundę — wypłać w porę!', iconName: 'Bomb', badge: 'HOT', maxMultiplier: '50x+', activePlayers: 289, gradient: 'from-pink-600/30 via-rose-900/20 to-transparent', glowColor: 'hover:border-pink-500/50 hover:shadow-pink-500/25' },
    { id: 'coinflip', name: 'Coinflip', description: 'Obstawiasz orzeł lub reszka. Prosto i szybko — 50/50 szans na podwojenie stawki.', iconName: 'Coins', badge: 'KLASYK', maxMultiplier: '2.0x', activePlayers: 195, gradient: 'from-amber-600/30 via-yellow-900/20 to-transparent', glowColor: 'hover:border-amber-500/50 hover:shadow-amber-500/25' },
    { id: 'wheel', name: 'Koło Fortuny', description: 'Zakręć kołem z 8 sektorami i traf mnożnik od 0x do 20x. Każdy obrót to nowa szansa!', iconName: 'Disc', badge: 'NOWE', maxMultiplier: '20x', activePlayers: 174, gradient: 'from-emerald-600/30 via-teal-900/20 to-transparent', glowColor: 'hover:border-emerald-500/50 hover:shadow-emerald-500/25' },
    { id: 'scratch', name: 'Cyber Zdrapki', description: 'Zdrapuj holograficzne pola 3×3. Traf 3 identyczne symbole i zgarnij natychmiastową wygraną!', iconName: 'Ticket', badge: 'HOT', maxMultiplier: '50x', activePlayers: 265, gradient: 'from-fuchsia-600/30 via-pink-900/20 to-transparent', glowColor: 'hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/25' },
    { id: 'puzzle', name: 'Puzzle Rush', description: 'Szybka gra logiczna na czas. Zero losowości — liczy się refleks, pamięć i myślenie!', iconName: 'Brain', badge: 'SKILL', maxMultiplier: '5.0x', activePlayers: 182, gradient: 'from-violet-600/30 via-purple-900/20 to-transparent', glowColor: 'hover:border-violet-500/50 hover:shadow-violet-500/25' },
    { id: 'blackjack', name: 'Blackjack 21', description: 'Klasyczny stół kasynowy przeciwko krupierowi. Dobieraj, pasuj, podwajaj stawkę i poluj na 21!', iconName: 'Spade', badge: 'NOWE', maxMultiplier: '2.4x', activePlayers: 340, gradient: 'from-emerald-700/30 via-teal-950/20 to-transparent', glowColor: 'hover:border-emerald-500/50 hover:shadow-emerald-500/25' },
    { id: 'train', name: 'Neon Train', description: 'Pociąg Cyber-Maglev mknie przez kolejne stacje metropolii. Wysiądź z zyskiem na stacji lub ryzykuj podróż po mnożnik 16x!', iconName: 'TrainFront', badge: 'HOT', maxMultiplier: '16x', activePlayers: 295, gradient: 'from-cyan-600/30 via-blue-950/20 to-transparent', glowColor: 'hover:border-cyan-500/50 hover:shadow-cyan-500/25' },
];
function timeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 10)
        return 'Przed chwilą';
    if (seconds < 60)
        return `${seconds}s temu`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)
        return `${minutes} min temu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)
        return `${hours}h temu`;
    return `${Math.floor(hours / 24)}d temu`;
}
// GET /api/games
router.get('/', (_req, res) => {
    res.json(GAMES_LIST);
});
// GET /api/games/live-wins — real wins from all players
router.get('/live-wins', async (_req, res) => {
    const wins = await prisma_1.prisma.gameHistory.findMany({
        where: { result: 'WIN', payout: { gt: 0 } },
        orderBy: { playedAt: 'desc' },
        take: 20,
        include: {
            user: {
                select: {
                    username: true,
                    avatar: true,
                },
            },
        },
    });
    const formatted = wins.map((w) => ({
        id: w.id,
        user: {
            username: w.user.username,
            avatar: w.user.avatar,
        },
        game: w.game,
        multiplier: w.multiplier,
        winAmount: w.payout,
        timestamp: timeAgo(w.playedAt),
    }));
    res.json(formatted);
});
// GET /api/games/history
router.get('/history', auth_1.requireAuth, async (req, res) => {
    const history = await prisma_1.prisma.gameHistory.findMany({
        where: { userId: req.user.userId },
        orderBy: { playedAt: 'desc' },
        take: 50,
    });
    const formatted = history.map((h) => ({
        ...h,
        timestamp: timeAgo(h.playedAt),
    }));
    res.json(formatted);
});
// POST /api/games/play — record a game result
router.post('/play', auth_1.requireAuth, async (req, res) => {
    const schema = zod_1.z.object({
        game: zod_1.z.string(),
        betAmount: zod_1.z.number().int().positive(),
        multiplier: zod_1.z.number().min(0),
        payout: zod_1.z.number().int().min(0),
        result: zod_1.z.enum(['WIN', 'LOSS']),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
    }
    const userId = req.user.userId;
    const { game, betAmount, multiplier, payout, result } = parsed.data;
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        res.status(404).json({ error: 'Użytkownik nie znaleziony' });
        return;
    }
    if (user.coins < betAmount) {
        res.status(400).json({ error: 'Niewystarczające saldo monet' });
        return;
    }
    const coinChange = result === 'WIN' ? payout - betAmount : -betAmount;
    const xpGain = Math.floor(betAmount / 100) + (result === 'WIN' ? 10 : 2);
    const [entry, updatedUser] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.gameHistory.create({
            data: { userId, game, betAmount, multiplier, payout, result },
        }),
        prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                coins: Math.max(0, user.coins + coinChange),
                xp: { increment: xpGain },
            },
        }),
    ]);
    res.json({ entry, coins: updatedUser.coins, xp: updatedUser.xp });
});
exports.default = router;
//# sourceMappingURL=games.js.map