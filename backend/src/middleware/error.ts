import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/response';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  void next;
  // Never leak stack traces in production
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    console.error(`[Error] ${req.method} ${req.path}:`, err);
  }

  // Zod Validation Errors -> 422
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Prisma Errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'Unique constraint failed',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Resource not found',
    });
  }

  // Custom API Errors
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      error: err.message,
    });
  }

  // Fallback -> 500
  return res.status(500).json({
    success: false,
    error: isProduction ? 'Internal server error' : err.message,
  });
};
