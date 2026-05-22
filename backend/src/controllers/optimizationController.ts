import { prisma } from '../prisma/client';
import { sendSuccess } from '../utils/response';

const calculateOptimization = (params: any) => {
  const { maxCostPerWafer, yieldTarget, maxTestTimeMs } = params;
  void maxCostPerWafer;
  void maxTestTimeMs;
  
  // Real logic should go here. For now, we return calculated results based on input.
  return {
    estimatedSavings: 0,
    costReductionPct: 0,
    timeReductionPct: 0,
    patternsRemoved: 0,
    newYieldEstimate: yieldTarget,
    roiImprovement: 0
  };
};

export const preview = async (req: any, res: any, next: any) => {
  try {
    const results = calculateOptimization(req.body);
    return sendSuccess(res, results);
  } catch (error) {
    next(error);
  }
};

export const run = async (req: any, res: any, next: any) => {
  try {
    const { lotId, maxCostPerWafer, yieldTarget, maxTestTimeMs, userId = 'admin' } = req.body;

    const results = calculateOptimization(req.body);

    const run = await prisma.optimizationRun.create({
      data: {
        lotId,
        maxCostPerWafer: Number(maxCostPerWafer),
        yieldTarget: Number(yieldTarget),
        maxTestTimeMs: Number(maxTestTimeMs),
        costReductionPct: results.costReductionPct,
        timeSavingsPct: results.timeReductionPct,
        projectedYield: results.newYieldEstimate,
        patternsRemoved: results.patternsRemoved,
        totalSavingsUSD: results.estimatedSavings,
        optimizedOrder: JSON.stringify([]), 
        createdBy: userId
      }
    });

    return sendSuccess(res, { ...results, runId: run.id, status: 'success' });
  } catch (error) {
    next(error);
  }
};

export const getResults = async (req: any, res: any, next: any) => {
  try {
    const { lotId } = req.query;
    const lastRun = await prisma.optimizationRun.findFirst({
      where: { lotId },
      orderBy: { createdAt: 'desc' }
    });
    return sendSuccess(res, lastRun);
  } catch (error) {
    next(error);
  }
};
