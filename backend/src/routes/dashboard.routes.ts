import { Router } from 'express';
import * as controller from '../controllers/dashboardController';

const router = Router();

router.get('/kpis', controller.getKPIs);
router.get('/kpis/trend', controller.getKPITrend);
router.get('/wafer-heatmap', controller.getWaferHeatmap);
router.get('/pattern-cost-analysis', controller.getPatternCostAnalysis);
router.get('/cost-trend', controller.getCostTrend);

export default router;
