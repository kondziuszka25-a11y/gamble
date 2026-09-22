"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const router = (0, express_1.Router)();
// GET /api/admin/logs
router.get('/logs', auth_1.requireAuth, (0, roles_1.requireRole)('MODERATOR'), async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const logs = await prisma_1.prisma.adminLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
            admin: { select: { username: true } },
            targetUser: { select: { username: true } },
        },
    });
    const total = await prisma_1.prisma.adminLog.count();
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
router.get('/stats', auth_1.requireAuth, (0, roles_1.requireRole)('ADMIN'), async (_req, res) => {
    const [totalUsers, activeUsers, bannedUsers, totalGames, totalWins] = await Promise.all([
        prisma_1.prisma.user.count(),
        prisma_1.prisma.user.count({ where: { status: 'ACTIVE' } }),
        prisma_1.prisma.user.count({ where: { status: 'BANNED' } }),
        prisma_1.prisma.gameHistory.count(),
        prisma_1.prisma.gameHistory.count({ where: { result: 'WIN' } }),
    ]);
    const coinsSum = await prisma_1.prisma.user.aggregate({ _sum: { coins: true } });
    const gemsSum = await prisma_1.prisma.user.aggregate({ _sum: { gems: true } });
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
exports.default = router;
//# sourceMappingURL=admin.js.map