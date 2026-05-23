import { Router } from 'express';
import {
  getSummary,
  getTrend,
  getBreakdown,
  getHeatmap,
  getPatterns,
  simulateRoi
} from '../controllers/costIntelligenceController';

const router = Router();

router.get('/summary', getSummary);
router.get('/trend', getTrend);
router.get('/breakdown', getBreakdown);
router.get('/heatmap', getHeatmap);
router.get('/patterns', getPatterns);
router.post('/simulate', simulateRoi);

export default router;
