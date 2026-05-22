import { Router } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess } from '../utils/response';
import { validate, lotParamSchema } from '../utils/schemas';

const router = Router({ mergeParams: true });

// GET /lots/:lotId/mbist/runs
router.get('/runs', validate('params', lotParamSchema), async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const runs: any[] = await (prisma as any).mBISTRun.findMany({
      where: { lotId },
      orderBy: { instanceName: 'asc' },
    });
    return sendSuccess(res, runs);
  } catch (error) {
    next(error);
  }
});

// GET /lots/:lotId/mbist/runs/summary
router.get('/runs/summary', validate('params', lotParamSchema), async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const runs: any[] = await (prisma as any).mBISTRun.findMany({ where: { lotId } });

    if (runs.length === 0) {
      return sendSuccess(res, {
        totalInstances: 0,
        avgCoverage: 0,
        totalFaultsCaught: 0,
        totalRepairAttempts: 0,
        repairSuccessRate: 0,
        totalTimeMs: 0,
        passRate: 0,
        failRate: 0,
      });
    }

    const totalFaultsCaught = runs.reduce((acc: number, r) => acc + r.faultsCaught, 0);
    const totalRepairAttempts = runs.reduce((acc: number, r) => acc + r.repairAttempts, 0);
    const totalRepairSuccess = runs.reduce((acc: number, r) => acc + r.repairSuccess, 0);
    const avgCoverage = runs.reduce((acc: number, r) => acc + r.coveragePercent, 0) / runs.length;
    const totalTimeMs = runs.reduce((acc: number, r) => acc + r.testTimeMs, 0);
    const totalPass = runs.reduce((acc: number, r) => acc + r.passCount, 0);
    const totalFail = runs.reduce((acc: number, r) => acc + r.failCount, 0);
    const totalDies = totalPass + totalFail;

    return sendSuccess(res, {
      totalInstances: runs.length,
      avgCoverage: parseFloat(avgCoverage.toFixed(2)),
      totalFaultsCaught,
      totalRepairAttempts,
      repairSuccessRate: totalRepairAttempts > 0
        ? parseFloat(((totalRepairSuccess / totalRepairAttempts) * 100).toFixed(2))
        : 0,
      totalTimeMs: parseFloat(totalTimeMs.toFixed(2)),
      passRate: totalDies > 0 ? parseFloat(((totalPass / totalDies) * 100).toFixed(2)) : 0,
      failRate: totalDies > 0 ? parseFloat(((totalFail / totalDies) * 100).toFixed(2)) : 0,
    });
  } catch (error) {
    next(error);
  }
});

// GET /lots/:lotId/mbist/runs/by-instance
router.get('/runs/by-instance', validate('params', lotParamSchema), async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const runs: any[] = await (prisma as any).mBISTRun.findMany({
      where: { lotId },
      orderBy: { instanceName: 'asc' },
    });

    const result = runs.map(r => ({
      instanceName: r.instanceName,
      memoryType: r.memoryType,
      domain: r.domain,
      sizeKb: r.sizeKb,
      testTimeMs: r.testTimeMs,
      coveragePercent: r.coveragePercent,
      faultsCaught: r.faultsCaught,
      repairSuccess: r.repairSuccess,
      repairAttempts: r.repairAttempts,
      passCount: r.passCount,
      failCount: r.failCount,
    }));

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// GET /lots/:lotId/mbist/runs/by-algorithm
router.get('/runs/by-algorithm', validate('params', lotParamSchema), async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const runs: any[] = await (prisma as any).mBISTRun.findMany({ where: { lotId } });

    const byAlgo: Record<string, { count: number; totalCoverage: number; totalFaults: number }> = {};
    runs.forEach(r => {
      if (!byAlgo[r.algorithmUsed]) {
        byAlgo[r.algorithmUsed] = { count: 0, totalCoverage: 0, totalFaults: 0 };
      }
      byAlgo[r.algorithmUsed].count += 1;
      byAlgo[r.algorithmUsed].totalCoverage += r.coveragePercent;
      byAlgo[r.algorithmUsed].totalFaults += r.faultsCaught;
    });

    const result = Object.entries(byAlgo).map(([algorithm, stats]) => ({
      algorithm,
      instanceCount: stats.count,
      avgCoverage: parseFloat((stats.totalCoverage / stats.count).toFixed(2)),
      totalFaultsCaught: stats.totalFaults,
    }));

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// GET /lots/:lotId/mbist/runs/coverage-breakdown
router.get('/runs/coverage-breakdown', validate('params', lotParamSchema), async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const runs: any[] = await (prisma as any).mBISTRun.findMany({ where: { lotId } });

    if (runs.length === 0) {
      return sendSuccess(res, { stuckAt: 0, transition: 0, coupling: 0 });
    }

    const avgStuckAt = runs.reduce((acc: number, r) => acc + r.stuckAtCoverage, 0) / runs.length;
    const avgTransition = runs.reduce((acc: number, r) => acc + r.transitionCoverage, 0) / runs.length;
    const avgCoupling = runs.reduce((acc: number, r) => acc + r.couplingCoverage, 0) / runs.length;

    return sendSuccess(res, {
      stuckAt: parseFloat(avgStuckAt.toFixed(2)),
      transition: parseFloat(avgTransition.toFixed(2)),
      coupling: parseFloat(avgCoupling.toFixed(2)),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
