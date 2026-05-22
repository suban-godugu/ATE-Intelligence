import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const signAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES as any });

export const signRefreshToken = (payload: TokenPayload): string =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES as any });

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, ACCESS_SECRET) as TokenPayload;

export const verifyRefreshToken = (token: string): TokenPayload =>
  jwt.verify(token, REFRESH_SECRET) as TokenPayload;
