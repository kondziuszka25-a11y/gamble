import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const JWT_SECRET = process.env.JWT_SECRET || 'jackpot-super-secret-jwt-key-change-in-prod';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'jackpot-refresh-secret-key-change-in-prod';
export const JWT_EXPIRES_IN = '15m';
export const REFRESH_EXPIRES_IN_DAYS = 7;

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: `${REFRESH_EXPIRES_IN_DAYS}d` });
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Brak tokenu autoryzacyjnego' });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token nieprawidłowy lub wygasł' });
  }
}
