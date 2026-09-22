"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/leaderboard?by=coins|level|wins
router.get('/', auth_1.requireAuth, async (req, res) => {
    const by = req.query.by || 'coins';
    let orderBy = { coins: 'desc' };
    if (by === 'level')
        orderBy = { level: 'desc' };
    else if (by === 'xp')
        orderBy = { xp: 'desc' };
    const users = await prisma_1.prisma.user.findMany({
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
        const wins = await prisma_1.prisma.gameHistory.groupBy({
            by: ['userId'],
            where: { result: 'WIN' },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 50,
        });
        const winMap = new Map(wins.map((w) => [w.userId, w._count.id]));
        const allUsers = await prisma_1.prisma.user.findMany({
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
exports.default = router;
//# sourceMappingURL=leaderboard.js.map