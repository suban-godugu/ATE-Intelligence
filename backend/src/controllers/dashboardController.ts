import { prisma } from '../prisma/client';
import { sendSuccess } from '../utils/response';

export const getKPIs = async (req: any, res: any, next: any) => {
  try {
    const { lotId } = req.query;
    const lotWhere = lotId ? { id: lotId } : {};
    const itemWhere = lotId ? { lotId } : {};

    const [lotCount, dieResults] = await Promise.all([
      prisma.lot.count({ where: lotWhere }),
      prisma.dieResult.findMany({ where: itemWhere, select: { testTimeMs: true, passed: true } })
    ]);

    const totalDies = dieResults.length;
    const passedDies = dieResults.filter(d => d.passed).length;
    const totalTestTime = dieResults.reduce((acc, curr) => acc + curr.testTimeMs, 0);

    const kpis = {
      totalTestCost: {
        value: totalTestTime * 0.05, // Assuming $0.05 per ms for illustration
        delta: 0,
        trend: []
      },
      costPerWafer: {
        value: lotCount > 0 ? (totalTestTime * 0.05) / lotCount : 0,
        delta: 0,
        trend: []
      },
      costPerDie: {
        value: totalDies > 0 ? (totalTestTime * 0.05) / totalDies : 0,
        delta: 0,
        trend: []
      },
      avgTestTimeMs: {
        value: totalDies > 0 ? totalTestTime / totalDies : 0,
        delta: 0,
        trend: []
      },
      yieldOverall: {
        value: totalDies > 0 ? (passedDies / totalDies) * 100 : 0,
        delta: 0,
        trend: []
      },
      roiImprovement: {
        value: 0,
        delta: 0,
        trend: []
      }
    };

    return sendSuccess(res, kpis);
  } catch (error) {
    next(error);
  }
};

export const getKPITrend = async (req: any, res: any, next: any) => {
  try {
    const { metric } = req.query;

    // Get last 5 lots
    const recentLots = await prisma.lot.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { patterns: true } },
        waferRuns: {
          include: { dieResults: { select: { passed: true, testTimeMs: true } } }
        }
      }
    });

    const points = recentLots.reverse().map(lot => {
      const allDies = lot.waferRuns.flatMap(w => w.dieResults);
      const passed = allDies.filter(d => d.passed).length;
      const totalTime = allDies.reduce((acc, d) => acc + d.testTimeMs, 0);

      let value = 0;
      if (metric === 'yieldOverall') {
        value = allDies.length > 0 ? (passed / allDies.length) * 100 : 0;
      } else if (metric === 'totalTestCost') {
        value = totalTime * 0.05;
      } else if (metric === 'avgTestTimeMs') {
        value = allDies.length > 0 ? totalTime / allDies.length : 0;
      }

      return {
        label: `Lot ${lot.lotNumber.substring(0, 5)}`,
        value: parseFloat(value.toFixed(2)),
        timestamp: lot.createdAt
      };
    });

    return sendSuccess(res, { points });
  } catch (error) {
    next(error);
  }
};

export const getWaferHeatmap = async (req: any, res: any, next: any) => {
  try {
    const { lotId } = req.query;
    const where = lotId ? { lotId } : {};

    const results = await prisma.dieResult.findMany({
      where,
      select: { dieX: true, dieY: true, testTimeMs: true, passed: true, id: true }
    });

    const gridSize = 25;
    const radius = gridSize / 2;

    const dies = results.map(r => ({
      x: r.dieX,
      y: r.dieY,
      value: r.testTimeMs,
      dieId: r.id,
      passed: r.passed
    }));

    return sendSuccess(res, {
      dies,
      min: Math.min(...dies.map(d => d.value), 0),
      max: Math.max(...dies.map(d => d.value), 100),
      waferRadius: radius
    });
  } catch (error) {
    next(error);
  }
};

export const getPatternCostAnalysis = async (req: any, res: any, next: any) => {
  try {
    const { lotId, limit = 7 } = req.query;
    const where = lotId ? { lotId } : {};

    const patterns = await prisma.pattern.findMany({
      where,
      take: Number(limit),
      orderBy: { testTimeMs: 'desc' }
    });

    const results = patterns.map(p => ({
      patternId: p.patternId,
      testTimeMs: p.testTimeMs,
      costUSD: p.costPerDie,
      failRate: p.failRate,
      detectPower: p.detectPower,
      roiScore: 0, // Calculated value
      recommendation: p.action
    }));
    return sendSuccess(res, { patterns: results });
  } catch (error) {
    next(error);
  }
};

export const getCostTrend = async (req: any, res: any, next: any) => {
  try {
    // Historical cost tracking requires persisted trend snapshots.
    return sendSuccess(res, { points: [] });
  } catch (error) {
    next(error);
  }
};
