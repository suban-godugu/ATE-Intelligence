/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║           HEADLESS AI API GATEWAY  —  /api/v1/                     ║
 * ║  API-First · UI-Agnostic · Real-time · AI-Powered · Enterprise     ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * This router exposes all AI capabilities under a versioned, headless
 * endpoint that any client can consume:
 *   • React/Vue Web Dashboards
 *   • Mobile Apps
 *   • MES / ERP Systems
 *   • AI Agents (LangChain, AutoGPT, etc.)
 *   • Chatbots (Teams, Slack)
 *   • Reporting / BI Tools
 *   • External API Clients
 *
 * Authentication:
 *   All /api/v1/ routes require the x-api-key header:
 *   x-api-key: ate-headless-sk-2024-intelligence-platform
 *
 * Full Route Map:
 *   GET    /api/v1/health                              → API health check
 *   GET    /api/v1/info                                → Version & capabilities
 *
 *   ─── Ingest ───────────────────────────────────────────────────────
 *   POST   /api/v1/ingest/upload                       → Upload ATE files (STIL/LOG/ATPG)
 *   GET    /api/v1/ingest/files                        → List uploaded files
 *
 *   ─── Data ─────────────────────────────────────────────────────────
 *   GET    /api/v1/data/lots                           → All production lots
 *   GET    /api/v1/data/lots/:lotId/patterns           → Patterns for a lot
 *   GET    /api/v1/data/lots/:lotId/kpis               → KPI metrics
 *   GET    /api/v1/data/lots/:lotId/scan-chains        → Scan chain data
 *   GET    /api/v1/data/lots/:lotId/mbist              → MBIST run data
 *   GET    /api/v1/data/lots/:lotId/lbist              → LBIST run data
 *
 *   ─── AI / Analytics ───────────────────────────────────────────────
 *   GET    /api/v1/ai/recommendations/:lotId           → AI recommendations
 *   GET    /api/v1/ai/savings-estimate/:lotId          → Cost savings estimate
 *   POST   /api/v1/ai/analyze-patterns                 → Full pattern analysis
 *   POST   /api/v1/ai/detect-anomalies/:lotId          → Anomaly detection
 *   POST   /api/v1/ai/classify-defects/:lotId          → Defect classification
 *
 *   ─── Optimization ─────────────────────────────────────────────────
 *   GET    /api/v1/optimize/test-order/:lotId          → Optimized pattern order
 *   POST   /api/v1/optimize/run/:lotId                 → Run optimization
 *   GET    /api/v1/optimize/redundancy/:lotId          → Redundancy analysis
 *
 *   ─── Knowledge / RAG Q&A ──────────────────────────────────────────
 *   POST   /api/v1/knowledge/ask                       → Ask AI any question
 *   GET    /api/v1/knowledge/summary/:lotId            → AI lot summary
 *   POST   /api/v1/knowledge/explain/:patternId        → Explain pattern failure
 */

import { Router, Request, Response } from 'express';
import { apiKeyAuth } from '../middleware/apiKey';
import { sendSuccess } from '../utils/response';
import { prisma } from '../prisma/client';
import { optimizationEngine } from '../services/optimizationEngine';
import { detectAnomalies } from '../../../ai-models/analysis/anomalyDetector.model';
import { classifyDefects } from '../../../ai-models/analysis/defectClassifier.model';
import knowledgeRoutes from './knowledge.routes';

const router = Router();

// ─── Apply API Key Auth to ALL /api/v1/ routes ────────────────────────────
router.use(apiKeyAuth);

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH & INFO
// ═══════════════════════════════════════════════════════════════════════════

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ATE Intelligence Headless AI API',
    version: 'v1',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

router.get('/info', (_req: Request, res: Response) => {
  res.json({
    name: 'ATE Intelligence Headless AI API',
    version: 'v1.1.0',
    description: 'API-First, UI-Agnostic semiconductor test analysis platform.',
    capabilities: [
      'Pattern Analysis & Optimization',
      'Anomaly Detection (Statistical + AI)',
      'Defect Classification (Rule-based + LLM)',
      'Cost & Yield Intelligence',
      'RAG Knowledge Q&A',
      'Lot Executive Summaries',
      'Real-time File Ingestion (STIL/ATE LOG/ATPG/MBIST/LBIST)',
    ],
    aiProvider: 'Groq (Llama 3.3 70B)',
    auth: 'x-api-key header',
    docsHint: 'Append ?help=true to any endpoint for usage info.',
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// DATA ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

router.get('/data/lots', async (_req, res, next) => {
  try {
    const lots = await prisma.lot.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { id: true, lotNumber: true, device: true, fab: true, tester: true, createdAt: true },
    });
    return sendSuccess(res, lots);
  } catch (e) { next(e); }
});

router.get('/data/lots/:lotId/patterns', async (req, res, next) => {
  try {
    const { lotId } = req.params;
    const patterns = await prisma.pattern.findMany({
      where: { lotId },
      orderBy: { sequenceIndex: 'asc' },
    });
    return sendSuccess(res, patterns);
  } catch (e) { next(e); }
});

router.get('/data/lots/:lotId/kpis', async (req, res, next) => {
  try {
    const { lotId } = req.params;
    const [patternCount, dieStats] = await Promise.all([
      prisma.pattern.count({ where: { lotId } }),
      prisma.dieResult.aggregate({
        where: { waferRun: { lotId } },
        _count: { id: true },
        _avg: { testTimeMs: true },
      }),
    ]);
    const passCount = await prisma.dieResult.count({ where: { waferRun: { lotId }, passed: true } });
    const yieldPct = dieStats._count.id > 0 ? (passCount / dieStats._count.id) * 100 : 0;
    return sendSuccess(res, {
      lotId,
      totalPatterns: patternCount,
      totalDie: dieStats._count.id,
      yieldPercent: parseFloat(yieldPct.toFixed(2)),
      avgTestTimeMs: parseFloat((dieStats._avg.testTimeMs || 0).toFixed(2)),
    });
  } catch (e) { next(e); }
});

// ═══════════════════════════════════════════════════════════════════════════
// AI / ANALYTICS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

router.get('/ai/recommendations/:lotId', async (req, res, next) => {
  try {
    const { lotId } = req.params;
    const recommendations = await optimizationEngine.detectCoverageGaps(lotId);
    return sendSuccess(res, recommendations);
  } catch (e) { next(e); }
});

router.get('/ai/savings-estimate/:lotId', async (req, res, next) => {
  try {
    const { lotId } = req.params;
    const result = await optimizationEngine.detectRedundancy(lotId);
    return sendSuccess(res, {
      costReduction: `${(result.costSavedPerDie * 100).toFixed(2)}%`,
      timeSavings: `${result.timeSavedMs.toFixed(1)}ms`,
      yieldImprovement: `${result.projectedYield.toFixed(2)}%`,
      patternsReduced: result.removableCount,
      totalSavings: `$${(result.costSavedPerDie * 1000).toFixed(0)}/lot`,
    });
  } catch (e) { next(e); }
});

router.post('/ai/detect-anomalies/:lotId', async (req, res, next) => {
  try {
    const { lotId } = req.params;
    const patterns = await prisma.pattern.findMany({
      where: { lotId },
      select: { patternId: true, failRate: true, testTimeMs: true, faultCoverage: true },
    });
    if (!patterns.length) {
      return sendSuccess(res, { anomalies: [], overallHealthScore: 100, summary: 'No patterns found for this lot.', detectedAt: new Date().toISOString() });
    }
    const result = await detectAnomalies({
      lotId,
      patterns: patterns.map(p => ({
        patternId: p.patternId,
        failRate: p.failRate || 0,
        testTimeMs: p.testTimeMs || 0,
        faultCoverage: p.faultCoverage || 0,
      })),
    });
    return sendSuccess(res, result);
  } catch (e) { next(e); }
});

router.post('/ai/classify-defects/:lotId', async (req, res, next) => {
  try {
    const { lotId } = req.params;
    const patterns = await prisma.pattern.findMany({
      where: { lotId, failRate: { gt: 1 } },
      take: 20,
      orderBy: { failRate: 'desc' },
    });
    const results = await classifyDefects(
      patterns.map(p => ({
        patternId: p.patternId,
        patternType: p.type,
        failRate: p.failRate || 0,
        faultCoverage: p.faultCoverage || 0,
        killRatio: p.killRatio || 0,
        testTimeMs: p.testTimeMs || 0,
        domain: p.domain || undefined,
      }))
    );
    return sendSuccess(res, results);
  } catch (e) { next(e); }
});

// ═══════════════════════════════════════════════════════════════════════════
// OPTIMIZATION ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

router.get('/optimize/test-order/:lotId', async (req, res, next) => {
  try {
    const { lotId } = req.params;
    const result = await optimizationEngine.optimizeOrdering(lotId);
    return sendSuccess(res, result);
  } catch (e) { next(e); }
});

router.get('/optimize/redundancy/:lotId', async (req, res, next) => {
  try {
    const { lotId } = req.params;
    const result = await optimizationEngine.detectRedundancy(lotId);
    return sendSuccess(res, result);
  } catch (e) { next(e); }
});

// ═══════════════════════════════════════════════════════════════════════════
// KNOWLEDGE / RAG Q&A
// ═══════════════════════════════════════════════════════════════════════════

router.use('/knowledge', knowledgeRoutes);

export default router;
