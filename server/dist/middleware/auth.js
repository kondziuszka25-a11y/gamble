"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_EXPIRES_IN_DAYS = exports.JWT_EXPIRES_IN = exports.JWT_REFRESH_SECRET = exports.JWT_SECRET = void 0;
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.JWT_SECRET = process.env.JWT_SECRET || 'jackpot-super-secret-jwt-key-change-in-prod';
exports.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'jackpot-refresh-secret-key-change-in-prod';
exports.JWT_EXPIRES_IN = '15m';
exports.REFRESH_EXPIRES_IN_DAYS = 7;
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, exports.JWT_SECRET, { expiresIn: exports.JWT_EXPIRES_IN });
}
function signRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, exports.JWT_REFRESH_SECRET, { expiresIn: `${exports.REFRESH_EXPIRES_IN_DAYS}d` });
}
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Brak tokenu autoryzacyjnego' });
        return;
    }
    const token = authHeader.slice(7);
    try {
        const payload = jsonwebtoken_1.default.verify(token, exports.JWT_SECRET);
        req.user = payload;
        next();
    }
    catch {
        res.status(401).json({ error: 'Token nieprawidłowy lub wygasł' });
    }
}
//# sourceMappingURL=auth.js.map