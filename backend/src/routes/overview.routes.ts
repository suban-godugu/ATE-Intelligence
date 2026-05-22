import { Router } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess } from '../utils/response';
import { validate, lotParamSchema } from '../utils/schemas';

const router = Router({ mergeParams: true });

// GET /lots/:lotId/overview/bist-summary
router.get('/bist-summary', validate('params', lotParamSchema), async (req: any, res, next) => {
  try {
    const { lotId } = req.params;

    // ─── 1. Scan Chain Data ────────────────────────────────────────────────
    const scanChainRuns: any[] = await (prisma as any).scanChainRun.findMany({
      where: { lotId },
    });

    // ─── Scan Chain Summary ───────────────────────────────────────
    const scTotalTimeMs = scanChainRuns.reduce((acc, r) => acc + r.totalTimeMs, 0);
    const scFaultsCaught = scanChainRuns.reduce((acc, r) => acc + r.faultsCaught, 0);
    const scPass = scanChainRuns.reduce((acc, r) => acc + r.passCount, 0);
    const scFail = scanChainRuns.reduce((acc, r) => acc + r.failCount, 0);
    const scTotalDies = scPass + scFail;
    const brokenCount = scanChainRuns.filter(r => r.brokenDetected).length;
    const uniqueChainIds = [...new Set(scanChainRuns.map(r => r.chainId))];

    // Per-chain aggregation
    const scByChainMap: Record<string, any> = {};
    scanChainRuns.forEach(r => {
      if (!scByChainMap[r.chainId]) {
        scByChainMap[r.chainId] = { chainId: r.chainId, timeMs: 0, faults: 0, pass: 0, fail: 0 };
      }
      scByChainMap[r.chainId].timeMs += r.totalTimeMs;
      scByChainMap[r.chainId].faults += r.faultsCaught;
      scByChainMap[r.chainId].pass += r.passCount;
      scByChainMap[r.chainId].fail += r.failCount;
    });
    const scByChain = Object.values(scByChainMap).map((c: any) => ({
      chainId:      c.chainId,
      totalTimeMs:  parseFloat(c.timeMs.toFixed(2)),
      faultsCaught: c.faults,
      passCount:    c.pass,
      failCount:    c.fail,
    }));

    // ─── 2. MBIST Data ─────────────────────────────────────────────────────
    const mbistRuns: any[] = await (prisma as any).mBISTRun.findMany({
      where: { lotId },
    });
    const mbTotalTimeMs = mbistRuns.reduce((acc, r) => acc + r.testTimeMs, 0);
    const mbFaultsCaught = mbistRuns.reduce((acc, r) => acc + r.faultsCaught, 0);
    const mbAvgCoverage = mbistRuns.length > 0
      ? mbistRuns.reduce((acc, r) => acc + r.coveragePercent, 0) / mbistRuns.length
      : 0;
    const mbRepairAttempts = mbistRuns.reduce((acc, r) => acc + r.repairAttempts, 0);
    const mbRepairSuccess = mbistRuns.reduce((acc, r) => acc + r.repairSuccess, 0);
    const mbByInstance = mbistRuns.map(r => ({
      instanceName:    r.instanceName,
      memoryType:      r.memoryType,
      domain:          r.domain,
      sizeKb:          r.sizeKb,
      algorithmUsed:   r.algorithmUsed,
      testTimeMs:      r.testTimeMs,
      faultsCaught:    r.faultsCaught,
      repairAttempts:  r.repairAttempts,
      repairSuccess:   r.repairSuccess,
      coveragePercent: r.coveragePercent,
    }));

    // ─── 3. LBIST Data ─────────────────────────────────────────────────────
    const lbistRuns: any[] = await (prisma as any).lBISTRun.findMany({
      where: { lotId },
    });
    const lbTotalTimeMs = lbistRuns.reduce((acc, r) => acc + r.testTimeMs, 0);
    const lbFaultsCaught = lbistRuns.reduce((acc, r) => acc + r.faultsCaught, 0);
    const lbAvgCoverage = lbistRuns.length > 0
      ? lbistRuns.reduce((acc, r) => acc + r.coveragePercent, 0) / lbistRuns.length
      : 0;
    const lbMismatchCount = lbistRuns.filter(r => !r.signatureMatch).length;
    const lbByInstance = lbistRuns.map(r => ({
      instanceName:    r.instanceName,
      domain:          r.domain,
      testTimeMs:      r.testTimeMs,
      coveragePercent: r.coveragePercent,
      toggleCoverage:  r.toggleCoverage,
      faultsCaught:    r.faultsCaught,
      signatureMatch:  r.signatureMatch,
    }));

    return sendSuccess(res, {
      scanChain: {
        totalTimeMs:  parseFloat(scTotalTimeMs.toFixed(2)),
        faultsCaught: scFaultsCaught,
        chainCount:   uniqueChainIds.length,
        brokenCount,
        passRate:     scTotalDies > 0 ? parseFloat(((scPass / scTotalDies) * 100).toFixed(2)) : 0,
        byChain:      scByChain,
      },
      mbist: {
        totalTimeMs:   parseFloat(mbTotalTimeMs.toFixed(2)),
        faultsCaught:  mbFaultsCaught,
        instanceCount: mbistRuns.length,
        avgCoverage:   parseFloat(mbAvgCoverage.toFixed(2)),
        repairRate:    mbRepairAttempts > 0
          ? parseFloat(((mbRepairSuccess / mbRepairAttempts) * 100).toFixed(2))
          : 0,
        byInstance:    mbByInstance,
      },
      lbist: {
        totalTimeMs:   parseFloat(lbTotalTimeMs.toFixed(2)),
        faultsCaught:  lbFaultsCaught,
        instanceCount: lbistRuns.length,
        avgCoverage:   parseFloat(lbAvgCoverage.toFixed(2)),
        mismatchCount: lbMismatchCount,
        byInstance:    lbByInstance,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
