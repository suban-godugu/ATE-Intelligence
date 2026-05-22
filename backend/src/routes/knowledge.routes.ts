import { Router } from 'express';
import { askQuestion, getLotSummary, explainPattern } from '../controllers/knowledgeController';

const router = Router();

/**
 * Knowledge & Context Routes — RAG-powered Q&A layer
 * ---------------------------------------------------
 * POST /api/v1/knowledge/ask             → Ask any ATE-related question
 * GET  /api/v1/knowledge/summary/:lotId  → AI executive summary for a lot
 * POST /api/v1/knowledge/explain/:patternId → Explain why a pattern is failing
 */

// Ask the AI a question about any lot or pattern
router.post('/ask', askQuestion);

// Get AI-generated executive summary for a specific lot
router.get('/summary/:lotId', getLotSummary);

// Explain why a specific pattern is failing (optionally scoped to a lotId in body)
router.post('/explain/:patternId', explainPattern);

export default router;
