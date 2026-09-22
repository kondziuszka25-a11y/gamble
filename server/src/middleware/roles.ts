import { Request, Response, NextFunction } from 'express';

const ROLE_LEVELS: Record<string, number> = {
  USER: 1,
  MODERATOR: 2,
  ADMIN: 3,
  OWNER: 4,
};

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
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

export function requireOwner(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'OWNER') {
    res.status(403).json({ error: 'Tylko właściciel platformy ma dostęp' });
    return;
  }
  next();
}
