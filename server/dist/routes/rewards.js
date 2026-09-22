"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Day rewards configuration
const DAILY_REWARDS = [
    { day: 1, coins: 200, gems: 0 },
    { day: 2, coins: 350, gems: 0 },
    { day: 3, coins: 500, gems: 0 },
    { day: 4, coins: 750, gems: 5 },
    { day: 5, coins: 1000, gems: 0 },
    { day: 6, coins: 1500, gems: 0 },
    { day: 7, coins: 3000, gems: 25, special: true },
];
// GET /api/rewards
router.get('/', auth_1.requireAuth, async (req, res) => {
    const userId = req.user.userId;
    const claims = await prisma_1.prisma.dailyRewardClaim.findMany({
        where: { userId },
        orderBy: { claimedAt: 'desc' },
        take: 7,
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const claimedToday = claims.some((c) => {
        const d = new Date(c.claimedAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
    });
    // Determine current streak day (1-7, rolling)
    const claimedDays = claims.map((c) => c.day);
    const currentStreak = claimedDays.length % 7;
    const nextDay = currentStreak === 0 ? 1 : currentStreak + 1;
    const rewards = DAILY_REWARDS.map((r) => ({
        ...r,
        claimed: claimedDays.includes(r.day),
        isToday: !claimedToday && r.day === (nextDay > 7 ? 1 : nextDay),
    }));
    res.json({ rewards, claimedToday });
});
// POST /api/rewards/claim
router.post('/claim', auth_1.requireAuth, async (req, res) => {
    const userId = req.user.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayClaim = await prisma_1.prisma.dailyRewardClaim.findFirst({
        where: {
            userId,
            claimedAt: { gte: today },
        },
    });
    if (todayClaim) {
        res.status(409).json({ error: 'Dzienna nagroda już odebrana' });
        return;
    }
    const claims = await prisma_1.prisma.dailyRewardClaim.findMany({
        where: { userId },
        orderBy: { claimedAt: 'desc' },
        take: 7,
    });
    const claimedDays = claims.map((c) => c.day);
    const currentStreak = claimedDays.length % 7;
    const nextDay = currentStreak === 0 ? 1 : currentStreak + 1;
    const dayNum = nextDay > 7 ? 1 : nextDay;
    const reward = DAILY_REWARDS[dayNum - 1];
    await prisma_1.prisma.dailyRewardClaim.create({ data: { userId, day: dayNum } });
    const updated = await prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            coins: { increment: reward.coins },
            gems: { increment: reward.gems },
        },
    });
    res.json({ day: dayNum, reward, coins: updated.coins, gems: updated.gems });
});
exports.default = router;
//# sourceMappingURL=rewards.js.map