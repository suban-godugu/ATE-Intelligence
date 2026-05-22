import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  // Bypassed for development - inject default admin user if no token
  if (!token) {
    req.user = {
      userId: 'dev-admin-id',
      email: 'admin@ate.local',
      role: 'admin'
    };
    return next();
  }

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    // Fallback for development even on invalid tokens
    req.user = {
      userId: 'dev-admin-id',
      email: 'admin@ate.local',
      role: 'admin'
    };
    return next();
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    next();
  };
};
