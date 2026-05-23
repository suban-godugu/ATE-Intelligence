import dotenv from 'dotenv';
dotenv.config();
// Restart triggered to reload .env

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/error';
import { authenticate } from './middleware/auth';
import authRoutes from './routes/auth.routes';
import lotRoutes from './routes/lot.routes';
import patternRoutes from './routes/pattern.routes';
import coverageRoutes from './routes/coverage.routes';
import scanChainRunRoutes from './routes/scanChainRun.routes';
import mbistRoutes from './routes/mbist.routes';
import lbistRoutes from './routes/lbist.routes';
import overviewRoutes from './routes/overview.routes';
import redundancyRoutes from './routes/redundancy.routes';
import correlationRoutes from './routes/correlation.routes';
import aiRoutes from './routes/ai.routes';
import dashboardRoutes from './routes/dashboard.routes';
import optimizationRoutes from './routes/optimization.routes';
import uploadRoutes from './routes/upload.routes';
import exportRoutes from './routes/export.routes';
import filterRoutes from './routes/filter.routes';
import costIntelligenceRoutes from './routes/costIntelligence.routes';
import headlessRoutes from './routes/headless.routes';   // ← Headless AI API v1
import equipmentRoutes from './routes/equipment.routes';

const app = express();
const PORT = process.env.PORT || 4000;

// 1. Request Logger
app.use(requestLogger);

// 2. CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://ate-intelligence-ui.vercel.app",
    "https://ate-intelligence-dqig9663o-ate-intelligence-s-projects.vercel.app"
  ],
  credentials: true
}));

// 3. Helmet
app.use(helmet());

// 4. Rate Limiter (Safely increased for dashboard stability)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000, 
  message: { success: false, error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

app.use(express.json());

// 5. Routes

import aiOptimizationRoutes from './routes/aiOptimization.routes';
import specRoutes from './routes/spec.routes';

// Auth routes (NOT authenticated)
app.use('/api/auth', authRoutes);

// Spec routes (NOT authenticated for development bypass)
app.use('/api', specRoutes);

// Apply authenticate to all other /api/* routes
app.use('/api', authenticate);

// Protected routes
app.use('/api/lots', lotRoutes);
app.use('/api/lots/:lotId/patterns', patternRoutes);
app.use('/api/lots/:lotId/coverage', coverageRoutes);
app.use('/api/lots/:lotId/scanchains', scanChainRunRoutes);
app.use('/api/lots/:lotId/mbist', mbistRoutes);
app.use('/api/lots/:lotId/lbist', lbistRoutes);
app.use('/api/lots/:lotId/overview', overviewRoutes);
app.use('/api/lots/:lotId/redundancy', redundancyRoutes);
app.use('/api/lots/:lotId/correlation', correlationRoutes);
app.use('/api/lots/:lotId/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/optimization', optimizationRoutes);
app.use('/api/ai-optimize', aiOptimizationRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/lots/:lotId/export', exportRoutes);
app.use('/api/cost', costIntelligenceRoutes);
app.use('/api/equipment', equipmentRoutes);

// --- Fallback aliases for frontend calling without /api prefix ---
// These match the existing routes but are mounted at the root level.
app.use('/', specRoutes);
app.use('/lots', lotRoutes);
app.use('/lots/:lotId/patterns', patternRoutes);
app.use('/lots/:lotId/coverage', coverageRoutes);
app.use('/lots/:lotId/scanchains', scanChainRunRoutes);
app.use('/lots/:lotId/mbist', mbistRoutes);
app.use('/lots/:lotId/lbist', lbistRoutes);
app.use('/lots/:lotId/overview', overviewRoutes);
app.use('/lots/:lotId/redundancy', redundancyRoutes);
app.use('/lots/:lotId/correlation', correlationRoutes);
app.use('/lots/:lotId/ai', aiRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/optimization', optimizationRoutes);
app.use('/ai-optimize', aiOptimizationRoutes);
app.use('/filters', filterRoutes);
app.use('/upload', uploadRoutes);
app.use('/lots/:lotId/export', exportRoutes);
app.use('/cost', costIntelligenceRoutes);
app.use('/equipment', equipmentRoutes);

// ─── Headless AI API Gateway (/api/v1/) ────────────────────────────────────
// API-First endpoints for external systems, AI agents, MES/ERP, chatbots.
// Protected by x-api-key header authentication.
app.use('/api/v1', headlessRoutes);

// Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 ATE Intelligence API running at http://localhost:${PORT}`);
  console.log(`🤖 Headless AI API (v1) at  http://localhost:${PORT}/api/v1/health`);
  console.log(`🔑 API Key: ${process.env.HEADLESS_API_KEY || '(not set)'}`);
});

export default app