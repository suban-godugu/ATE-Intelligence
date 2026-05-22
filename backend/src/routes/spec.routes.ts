import { Router } from 'express';
import {
  getPatterns,
  getPatternsKpis,
  getPatternAnalysis,
  getCoverage,
  getMbist,
  getLbist,
  getScanChains,
  getRedundancy,
  removeRedundancy,
  uploadStilFile,
  getAiSavingsEstimate,
  getOptimizationKpis,
  getPipelineStatus,
  getRecentActions,
  getAiRecommendations,
  getFlowOptimizer,
  applyFlowOptimizer,
  simulateFlowOptimizer,
  getPatternPruning,
  simulatePatternPruning,
  removePatternPruning,
  getCompressionTuner,
  getCompressionPreview,
  applyCompression,
  simulateCompression,
  getYieldPredictor,
  predictYield,
  getSavingsDashboard,
  exportSavingsDashboard,
  getFabs,
  getLots,
  getAuthToken
} from '../controllers/specController';

const router = Router();

// 5.1 Pattern Analysis — Endpoints
router.get('/patterns', getPatterns);
router.get('/patterns/kpis', getPatternsKpis);
router.get('/patterns/:id/analysis', getPatternAnalysis);
router.get('/coverage', getCoverage);
router.get('/mbist', getMbist);
router.get('/lbist', getLbist);
router.get('/scan-chains', getScanChains);
router.get('/redundancy', getRedundancy);
router.post('/redundancy/remove', removeRedundancy);
router.post('/patterns/upload-stil', uploadStilFile);
router.get('/ai/savings-estimate', getAiSavingsEstimate);

// 5.2 Test Optimization — Endpoints
router.get('/optimization/kpis', getOptimizationKpis);
router.get('/optimization/pipeline-status', getPipelineStatus);
router.get('/optimization/recent-actions', getRecentActions);
router.get('/optimization/ai-recommendations', getAiRecommendations);

router.get('/flow-optimizer', getFlowOptimizer);
router.post('/flow-optimizer/apply', applyFlowOptimizer);
router.post('/flow-optimizer/simulate', simulateFlowOptimizer);

router.get('/pattern-pruning', getPatternPruning);
router.post('/pattern-pruning/simulate', simulatePatternPruning);
router.post('/pattern-pruning/remove', removePatternPruning);

router.get('/compression-tuner', getCompressionTuner);
router.get('/compression-tuner/preview/:ratio', getCompressionPreview);
router.post('/compression-tuner/apply', applyCompression);
router.post('/compression-tuner/simulate', simulateCompression);

router.get('/yield-predictor', getYieldPredictor);
router.post('/yield-predictor/predict', predictYield);

router.get('/savings-dashboard', getSavingsDashboard);
router.post('/savings-dashboard/export', exportSavingsDashboard);

// 5.3 Shared / Auth
router.get('/fabs', getFabs);
router.get('/lots', getLots);
router.post('/auth/token', getAuthToken);

export default router;
