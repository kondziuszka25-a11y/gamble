"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/inventory
router.get('/', auth_1.requireAuth, async (req, res) => {
    const items = await prisma_1.prisma.collectibleItem.findMany({
        where: { userId: req.user.userId },
        orderBy: { obtainedAt: 'desc' },
    });
    res.json(items);
});
// DELETE /api/inventory/:id  (sell item)
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await prisma_1.prisma.collectibleItem.findUnique({ where: { id: paramId } });
    if (!item) {
        res.status(404).json({ error: 'Przedmiot nie znaleziony' });
        return;
    }
    if (item.userId !== req.user.userId) {
        res.status(403).json({ error: 'To nie jest Twój przedmiot' });
        return;
    }
    const [, updatedUser] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.collectibleItem.delete({ where: { id: item.id } }),
        prisma_1.prisma.user.update({
            where: { id: req.user.userId },
            data: { coins: { increment: item.value } },
        }),
    ]);
    res.json({ coinsGained: item.value, coins: updatedUser.coins });
});
exports.default = router;
//# sourceMappingURL=inventory.js.map