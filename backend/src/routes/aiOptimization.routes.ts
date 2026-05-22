import { Router } from 'express';
import {
  getPatterns,
  optimizeFlow,
  predictYield,
  optimizeSchedule,
  optimizeCompression,
  simulateAction,
  getSavingsSummary,
  applyOptimization
} from '../controllers/aiOptimizationController';

const router = Router();

// Prompt 1: Raw pattern feed
router.get('/patterns', getPatterns);

// Prompt 2: Flow Optimizer
router.post('/flow', optimizeFlow);

// Prompt 3: Yield Predictor
router.post('/yield', predictYield);

// Prompt 4: Schedule Optimizer
router.post('/schedule', optimizeSchedule);

// Prompt 5: Compression Tuner
router.post('/compression', optimizeCompression);

// Prompt 7: Simulation Engine (Shadow Mode)
router.post('/simulate', simulateAction);

// Prompt 8: Savings Summary
router.get('/savings', getSavingsSummary);

// Prompt 9: Apply Action
router.post('/apply', applyOptimization);

export default router;
