import { Router } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess } from '../utils/response';
import { validate, lotParamSchema } from '../utils/schemas';

const router = Router({ mergeParams: true });

// GET /lots/:lotId/lbist/runs
router.get('/runs', validate('params', lotParamSchema), async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const runs: any[] = await (prisma as any).lBISTRun.findMany({
      where: { lotId },
      orderBy: { instanceName: 'asc' },
    });
    return sendSuccess(res, runs);
  } catch (error) {
    next(error);
  }
});

// GET /lots/:lotId/lbist/runs/summary
router.get('/runs/summary', validate('params', lotParamSchema), async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const runs: any[] = await (prisma as any).lBISTRun.findMany({ where: { lotId } });

    if (runs.length === 0) {
      return sendSuccess(res, {
        totalInstances: 0,
        avgCoverage: 0,
        signatureMismatchCount: 0,
        totalFaultsCaught: 0,
        avgToggleCoverage: 0,
        totalTimeMs: 0,
        passRate: 0,
        failRate: 0,
      });
    }

    const totalFaultsCaught = runs.reduce((acc: number, r) => acc + r.faultsCaught, 0);
    const avgCoverage = runs.reduce((acc: number, r) => acc + r.coveragePercent, 0) / runs.length;
    const avgToggleCoverage = runs.reduce((acc: number, r) => acc + r.toggleCoverage, 0) / runs.length;
    const signatureMismatchCount = runs.filter(r => !r.signatureMatch).length;
    const totalTimeMs = runs.reduce((acc: number, r) => acc + r.testTimeMs, 0);
    const totalPass = runs.reduce((acc: number, r) => acc + r.passCount, 0);
    const totalFail = runs.reduce((acc: number, r) => acc + r.failCount, 0);
    const totalDies = totalPass + totalFail;

    return sendSuccess(res, {
      totalInstances: runs.length,
      avgCoverage: parseFloat(avgCoverage.toFixed(2)),
      signatureMismatchCount,
      totalFaultsCaught,
      avgToggleCoverage: parseFloat(avgToggleCoverage.toFixed(2)),
      totalTimeMs: parseFloat(totalTimeMs.toFixed(2)),
      passRate: totalDies > 0 ? parseFloat(((totalPass / totalDies) * 100).toFixed(2)) : 0,
      failRate: totalDies > 0 ? parseFloat(((totalFail / totalDies) * 100).toFixed(2)) : 0,
    });
  } catch (error) {
    next(error);
  }
});

// GET /lots/:lotId/lbist/runs/by-instance
router.get('/runs/by-instance', validate('params', lotParamSchema), async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const runs: any[] = await (prisma as any).lBISTRun.findMany({
      where: { lotId },
      orderBy: { instanceName: 'asc' },
    });

    const result = runs.map(r => ({
      instanceName: r.instanceName,
      domain: r.domain,
      testTimeMs: r.testTimeMs,
      coveragePercent: r.coveragePercent,
      toggleCoverage: r.toggleCoverage,
      faultsCaught: r.faultsCaught,
      signatureMatch: r.signatureMatch,
      patternCount: r.patternCount,
      seedValue: r.seedValue,
      passCount: r.passCount,
      failCount: r.failCount,
    }));

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// GET /lots/:lotId/lbist/runs/signature-status
router.get('/runs/signature-status', validate('params', lotParamSchema), async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const runs: any[] = await (prisma as any).lBISTRun.findMany({
      where: { lotId },
      orderBy: { signatureMatch: 'asc' }, // mismatches first
      select: {
        instanceName: true,
        signatureMatch: true,
        domain: true,
        coveragePercent: true,
        toggleCoverage: true,
      },
    });
    return sendSuccess(res, runs);
  } catch (error) {
    next(error);
  }
});

export default router;
