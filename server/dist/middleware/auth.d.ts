import { Request, Response, NextFunction } from 'express';
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
export declare const JWT_SECRET: string;
export declare const JWT_REFRESH_SECRET: string;
export declare const JWT_EXPIRES_IN = "15m";
export declare const REFRESH_EXPIRES_IN_DAYS = 7;
export declare function signAccessToken(payload: JwtPayload): string;
export declare function signRefreshToken(payload: JwtPayload): string;
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
