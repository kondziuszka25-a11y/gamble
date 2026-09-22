"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const router = (0, express_1.Router)();
const parseId = (param) => parseInt(Array.isArray(param) ? param[0] : (param || '0'), 10);
// GET /api/users — list all (MODERATOR+)
router.get('/', auth_1.requireAuth, (0, roles_1.requireRole)('MODERATOR'), async (_req, res) => {
    const users = await prisma_1.prisma.user.findMany({
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
router.get('/:id', auth_1.requireAuth, async (req, res) => {
    const id = parseId(req.params.id);
    const user = await prisma_1.prisma.user.findUnique({
        where: { id },
        select: {
            id: true, username: true, email: true, role: true, status: true,
            level: true, xp: true, xpRequired: true, coins: true, gems: true,
            avatar: true, online: true, createdAt: true, lastLoginAt: true,
            ownedBoosts: true,
            inventory: { orderBy: { obtainedAt: 'desc' } },
        },
    });
    if (!user) {
        res.status(404).json({ error: 'Nie znaleziono użytkownika' });
        return;
    }
    res.json(user);
});
// PATCH /api/users/:id/balance — ADMIN+
router.patch('/:id/balance', auth_1.requireAuth, (0, roles_1.requireRole)('ADMIN'), async (req, res) => {
    const schema = zod_1.z.object({ coinDiff: zod_1.z.number().int(), gemDiff: zod_1.z.number().int(), reason: zod_1.z.string() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
    }
    const id = parseId(req.params.id);
    const { coinDiff, gemDiff, reason } = parsed.data;
    const user = await prisma_1.prisma.user.findUnique({ where: { id } });
    if (!user) {
        res.status(404).json({ error: 'Użytkownik nie znaleziony' });
        return;
    }
    const updated = await prisma_1.prisma.user.update({
        where: { id },
        data: {
            coins: Math.max(0, user.coins + coinDiff),
            gems: Math.max(0, user.gems + gemDiff),
        },
    });
    const descParts = [];
    if (coinDiff !== 0)
        descParts.push(`${coinDiff > 0 ? '+' : ''}${coinDiff} monet`);
    if (gemDiff !== 0)
        descParts.push(`${gemDiff > 0 ? '+' : ''}${gemDiff} gemów`);
    await prisma_1.prisma.adminLog.create({
        data: {
            adminId: req.user.userId,
            targetUserId: id,
            action: 'Korekta salda',
            value: descParts.join(', '),
            reason,
        },
    });
    res.json(updated);
});
// PATCH /api/users/:id/xp — ADMIN+
router.patch('/:id/xp', auth_1.requireAuth, (0, roles_1.requireRole)('ADMIN'), async (req, res) => {
    const schema = zod_1.z.object({
        xpDiff: zod_1.z.number().int().optional(),
        targetLevel: zod_1.z.number().int().min(1).optional(),
        reason: zod_1.z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
    }
    const id = parseId(req.params.id);
    const { xpDiff = 0, targetLevel, reason = 'Korekta XP' } = parsed.data;
    const user = await prisma_1.prisma.user.findUnique({ where: { id } });
    if (!user) {
        res.status(404).json({ error: 'Użytkownik nie znaleziony' });
        return;
    }
    const updated = await prisma_1.prisma.user.update({
        where: { id },
        data: {
            xp: Math.max(0, user.xp + xpDiff),
            ...(targetLevel !== undefined ? { level: targetLevel } : {}),
        },
    });
    await prisma_1.prisma.adminLog.create({
        data: {
            adminId: req.user.userId,
            targetUserId: id,
            action: 'Modyfikacja XP/Poziomu',
            value: targetLevel ? `Ustawiono Level ${targetLevel}` : `${xpDiff > 0 ? '+' : ''}${xpDiff} XP`,
            reason,
        },
    });
    res.json(updated);
});
// PATCH /api/users/:id/role — OWNER only
router.patch('/:id/role', auth_1.requireAuth, roles_1.requireOwner, async (req, res) => {
    const schema = zod_1.z.object({ role: zod_1.z.enum(['USER', 'MODERATOR', 'ADMIN', 'OWNER']), reason: zod_1.z.string() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
    }
    const id = parseId(req.params.id);
    const { role, reason } = parsed.data;
    const updated = await prisma_1.prisma.user.update({ where: { id }, data: { role } });
    await prisma_1.prisma.adminLog.create({
        data: { adminId: req.user.userId, targetUserId: id, action: 'Zmiana roli', value: `Nowa rola: ${role}`, reason },
    });
    res.json(updated);
});
// PATCH /api/users/:id/status — MODERATOR+
router.patch('/:id/status', auth_1.requireAuth, (0, roles_1.requireRole)('MODERATOR'), async (req, res) => {
    const id = parseId(req.params.id);
    const schema = zod_1.z.object({ reason: zod_1.z.string() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Reason required' });
        return;
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { id } });
    if (!user) {
        res.status(404).json({ error: 'Użytkownik nie znaleziony' });
        return;
    }
    const newStatus = user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    const updated = await prisma_1.prisma.user.update({ where: { id }, data: { status: newStatus } });
    await prisma_1.prisma.adminLog.create({
        data: {
            adminId: req.user.userId,
            targetUserId: id,
            action: newStatus === 'BANNED' ? 'Zablokowano konto' : 'Odblokowano konto',
            value: `STATUS: ${newStatus}`,
            reason: parsed.data.reason,
        },
    });
    res.json(updated);
});
// POST /api/users/:id/reset-password — ADMIN+
router.post('/:id/reset-password', auth_1.requireAuth, (0, roles_1.requireRole)('ADMIN'), async (req, res) => {
    const id = parseId(req.params.id);
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789#$!';
    let tempPass = 'JP-';
    for (let i = 0; i < 8; i++)
        tempPass += chars.charAt(Math.floor(Math.random() * chars.length));
    const passwordHash = await bcryptjs_1.default.hash(tempPass, 12);
    await prisma_1.prisma.user.update({ where: { id }, data: { passwordHash } });
    await prisma_1.prisma.adminLog.create({
        data: {
            adminId: req.user.userId,
            targetUserId: id,
            action: 'Reset hasła',
            value: 'Wygenerowano hasło tymczasowe',
            reason: 'Procedura bezpieczeństwa',
        },
    });
    res.json({ tempPassword: tempPass });
});
exports.default = router;
//# sourceMappingURL=users.js.map