"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
exports.requireOwner = requireOwner;
const ROLE_LEVELS = {
    USER: 1,
    MODERATOR: 2,
    ADMIN: 3,
    OWNER: 4,
};
function requireRole(...roles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            res.status(401).json({ error: 'Niezalogowany' });
            return;
        }
        const userLevel = ROLE_LEVELS[user.role] ?? 0;
        const requiredLevel = Math.min(...roles.map((r) => ROLE_LEVELS[r] ?? 99));
        if (userLevel < requiredLevel) {
            res.status(403).json({ error: 'Brak uprawnień' });
            return;
        }
        next();
    };
}
function requireOwner(req, res, next) {
    if (req.user?.role !== 'OWNER') {
        res.status(403).json({ error: 'Tylko właściciel platformy ma dostęp' });
        return;
    }
    next();
}
//# sourceMappingURL=roles.js.map