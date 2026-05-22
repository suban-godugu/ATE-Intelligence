import { Request, Response, NextFunction } from 'express';

/**
 * API Key Middleware — Headless AI Access
 * ------------------------------------------
 * Allows external systems (MES, ERP, AI Agents, Chatbots, Mobile Apps)
 * to authenticate via x-api-key header instead of JWT tokens.
 *
 * Usage:
 *   curl -H "x-api-key: ate-headless-sk-2024-intelligence-platform" \
 *        http://localhost:4000/api/v1/ai/recommendations/LOT001
 *
 * The middleware checks for:
 *   1. x-api-key header (preferred for headless/M2M clients)
 *   2. ?apiKey=... query param (for easy browser/webhook testing)
 */
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction): void => {
  const headerKey = req.headers['x-api-key'] as string | undefined;
  const queryKey  = req.query['apiKey'] as string | undefined;
  const provided  = headerKey || queryKey;

  const validKey = process.env.HEADLESS_API_KEY;

  if (!validKey) {
    console.warn('[apiKeyAuth] HEADLESS_API_KEY is not set in .env');
    res.status(500).json({ success: false, error: 'API key not configured on server.' });
    return;
  }

  if (!provided || provided !== validKey) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized. Provide a valid API key via "x-api-key" header or "?apiKey=" query param.',
      hint:   'Contact your administrator for an API key.',
    });
    return;
  }

  next();
};
