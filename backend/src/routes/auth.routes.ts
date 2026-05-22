import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { validateBody } from '../middleware/validate';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { ApiError, sendSuccess } from '../utils/response';
import { authenticate } from '../middleware/auth';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

router.post('/login', validateBody(loginSchema), async (req: any, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return sendSuccess(res, {
      accessToken: token,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', validateBody(refreshSchema), async (req: any, res, next) => {
  try {
    const { refreshToken } = req.body;
    const payload = verifyRefreshToken(refreshToken);
    
    // In a real app, you'd check if the refresh token is in a whitelist/DB
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    const newToken = signAccessToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });

    return sendSuccess(res, { accessToken: newToken });
  } catch (error) {
    next(new ApiError(401, 'Invalid refresh token'));
  }
});

router.get('/me', authenticate, async (req: any, res, next) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true, role: true }
    });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
});

export default router;
