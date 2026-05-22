import { Router } from 'express';
import { sendSuccess } from '../utils/response';
import { optimizationEngine } from '../services/optimizationEngine';

const router = Router({ mergeParams: true });

router.get('/recommendations', async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const recommendations = await optimizationEngine.detectCoverageGaps(lotId);
    return sendSuccess(res, recommendations);
  } catch (error) {
    next(error);
  }
});

router.post('/optimize', async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const result = await optimizationEngine.optimizeOrdering(lotId);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

router.get('/savings-estimate', async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const result = await optimizationEngine.detectRedundancy(lotId);
    return sendSuccess(res, {
      costReduction: `${(result.costSavedPerDie * 100).toFixed(2)}%`,
      timeSavings: `${result.timeSavedMs.toFixed(1)}ms`,
      yieldImprovement: `${result.projectedYield.toFixed(2)}%`,
      patternsReduced: result.removableCount,
      totalSavings: `$${(result.costSavedPerDie * 1000).toFixed(0)}/lot`
    });
  } catch (error) {
    next(error);
  }
});

export default router;
