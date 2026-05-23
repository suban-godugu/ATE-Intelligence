import { prisma } from '../prisma/client';
import { sendSuccess } from '../utils/response';

// ─── Synthetic demo data (used when no real data exists) ────────────────────
const DEMO_KPI_SEED = {
  totalTestCost:  { value: 2_840_320,  delta: -4.2,  trend: [2970000, 2910000, 2870000, 2840320] },
  costPerWafer:   { value: 1247.80,    delta: -2.1,  trend: [1310, 1290, 1268, 1247.8] },
  costPerDie:     { value: 0.3842,     delta: -1.8,  trend: [0.401, 0.397, 0.391, 0.3842] },
  avgTestTimeMs:  { value: 87.4,       delta: -3.5,  trend: [93.1, 91.2, 89.0, 87.4] },
  yieldOverall:   { value: 91.73,      delta: 1.2,   trend: [89.8, 90.4, 91.1, 91.73] },
  roiImprovement: { value: 342_180,    delta: 12.4,  trend: [198000, 248000, 298000, 342180] },
};

const DEMO_PATTERNS = [
  { patternId: 'PAT-SCAN-001', testTimeMs: 34.7, costUSD: 0.1205, failRate: 2.1,  detectPower: 'HIGH',   roiScore: 91, recommendation: 'Keep' },
  { patternId: 'PAT-BIST-002', testTimeMs: 21.6, costUSD: 0.0752, failRate: 0.4,  detectPower: 'MEDIUM', roiScore: 58, recommendation: 'Review' },
  { patternId: 'PAT-ATPG-003', testTimeMs: 19.0, costUSD: 0.0660, failRate: 3.8,  detectPower: 'HIGH',   roiScore: 88, recommendation: 'Keep' },
  { patternId: 'PAT-FUNC-004', testTimeMs: 12.4, costUSD: 0.0430, failRate: 0.1,  detectPower: 'LOW',    roiScore: 28, recommendation: 'Remove' },
  { patternId: 'PAT-IDDQ-005', testTimeMs:  7.5, costUSD: 0.0261, failRate: 1.6,  detectPower: 'MEDIUM', roiScore: 73, recommendation: 'Keep' },
  { patternId: 'PAT-MBST-006', testTimeMs:  6.8, costUSD: 0.0236, failRate: 0.9,  detectPower: 'MEDIUM', roiScore: 62, recommendation: 'Review' },
  { patternId: 'PAT-BSCA-007', testTimeMs:  4.7, costUSD: 0.0163, failRate: 0.05, detectPower: 'LOW',    roiScore: 21, recommendation: 'Remove' },
];

function generateDemoWafer(): { dies: any[]; min: number; max: number; waferRadius: number } {
  const gridSize = 25;
  const radius = gridSize / 2;
  const center = radius;
  const dies: any[] = [];
  let id = 0;

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const dx = x - center + 0.5;
      const dy = y - center + 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) continue;

      // Simulate spatial cost pattern: higher near edges, lower in center
      const edgeFactor = dist / radius;
      const base = 40 + Math.random() * 20;
      const value = base + edgeFactor * 40 + (Math.random() < 0.08 ? 35 : 0);
      const passed = value < 95;

      dies.push({ x, y, value: parseFloat(value.toFixed(1)), dieId: `d${id++}`, passed });
    }
  }

  const values = dies.map(d => d.value);
  return { dies, min: Math.min(...values), max: Math.max(...values), waferRadius: radius };
}

function generateDemoCostTrend(granularity: string): any[] {
  const count = granularity === 'monthly' ? 12 : granularity === 'weekly' ? 12 : 30;
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now);
    if (granularity === 'monthly')  d.setMonth(d.getMonth() - (count - 1 - i));
    else if (granularity === 'weekly') d.setDate(d.getDate() - (count - 1 - i) * 7);
    else d.setDate(d.getDate() - (count - 1 - i));

    const base = 2_800_000 + Math.sin(i / 5) * 120_000 + (i / count) * 80_000;
    return {
      date: granularity === 'monthly'
        ? d.toLocaleString('en', { month: 'short', year: '2-digit' })
        : d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      totalCostUSD:    Math.round(base + Math.random() * 40_000),
      costPerWaferUSD: parseFloat((1200 + Math.random() * 80).toFixed(2)),
    };
  });
}

// ─── Controllers ─────────────────────────────────────────────────────────────
export const getKPIs = async (req: any, res: any, next: any) => {
  try {
    const { lotId } = req.query;
    const lotWhere  = lotId ? { id: lotId }  : {};
    const itemWhere = lotId ? { lotId }       : {};

    const [lotCount, dieResults] = await Promise.all([
      prisma.lot.count({ where: lotWhere }),
      prisma.dieResult.findMany({ where: itemWhere, select: { testTimeMs: true, passed: true } }),
    ]);

    // Return demo data when the database is empty
    if (dieResults.length === 0 && lotCount === 0) {
      return sendSuccess(res, { ...DEMO_KPI_SEED, _demo: true });
    }

    const totalDies    = dieResults.length;
    const passedDies   = dieResults.filter(d => d.passed).length;
    const totalTestTime = dieResults.reduce((acc, curr) => acc + curr.testTimeMs, 0);

    const kpis = {
      totalTestCost:  { value: totalTestTime * 0.05, delta: 0, trend: [] },
      costPerWafer:   { value: lotCount  > 0 ? (totalTestTime * 0.05) / lotCount  : 0, delta: 0, trend: [] },
      costPerDie:     { value: totalDies > 0 ? (totalTestTime * 0.05) / totalDies : 0, delta: 0, trend: [] },
      avgTestTimeMs:  { value: totalDies > 0 ? totalTestTime / totalDies : 0, delta: 0, trend: [] },
      yieldOverall:   { value: totalDies > 0 ? (passedDies / totalDies) * 100 : 0, delta: 0, trend: [] },
      roiImprovement: { value: 0, delta: 0, trend: [] },
    };

    return sendSuccess(res, kpis);
  } catch (error) {
    next(error);
  }
};

export const getKPITrend = async (req: any, res: any, next: any) => {
  try {
    const { metric } = req.query;

    const recentLots = await prisma.lot.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { patterns: true } },
        waferRuns: {
          include: { dieResults: { select: { passed: true, testTimeMs: true } } },
        },
      },
    });

    if (recentLots.length === 0) {
      return sendSuccess(res, { points: [] });
    }

    const points = recentLots.reverse().map(lot => {
      const allDies  = lot.waferRuns.flatMap(w => w.dieResults);
      const passed   = allDies.filter(d => d.passed).length;
      const totalTime = allDies.reduce((acc, d) => acc + d.testTimeMs, 0);

      let value = 0;
      if      (metric === 'yieldOverall')  value = allDies.length > 0 ? (passed / allDies.length) * 100 : 0;
      else if (metric === 'totalTestCost') value = totalTime * 0.05;
      else if (metric === 'avgTestTimeMs') value = allDies.length > 0 ? totalTime / allDies.length : 0;

      return {
        label:     `Lot ${lot.lotNumber.substring(0, 5)}`,
        value:     parseFloat(value.toFixed(2)),
        timestamp: lot.createdAt,
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
      select: { dieX: true, dieY: true, testTimeMs: true, passed: true, id: true },
    });

    // Return rich demo wafer when no data
    if (results.length === 0) {
      return sendSuccess(res, generateDemoWafer());
    }

    const gridSize = 25;
    const radius   = gridSize / 2;

    const dies = results.map(r => ({
      x:      r.dieX,
      y:      r.dieY,
      value:  r.testTimeMs,
      dieId:  r.id,
      passed: r.passed,
    }));

    return sendSuccess(res, {
      dies,
      min:        Math.min(...dies.map(d => d.value), 0),
      max:        Math.max(...dies.map(d => d.value), 100),
      waferRadius: radius,
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
      orderBy: { testTimeMs: 'desc' },
    });

    // Return demo patterns when no data
    if (patterns.length === 0) {
      return sendSuccess(res, { patterns: DEMO_PATTERNS.slice(0, Number(limit)), _demo: true });
    }

    const results = patterns.map(p => ({
      patternId:      p.patternId,
      testTimeMs:     p.testTimeMs,
      costUSD:        p.costPerDie,
      failRate:       p.failRate,
      detectPower:    p.detectPower,
      roiScore:       0,
      recommendation: p.action,
    }));

    return sendSuccess(res, { patterns: results });
  } catch (error) {
    next(error);
  }
};

export const getCostTrend = async (req: any, res: any, next: any) => {
  try {
    const { granularity = 'daily' } = req.query;

    // Check if we have any real lot data first
    const lotCount = await prisma.lot.count();

    if (lotCount === 0) {
      // Return synthetic demo trend so the chart is never blank
      return sendSuccess(res, {
        points: generateDemoCostTrend(granularity as string),
        _demo:  true,
      });
    }

    // Historical cost tracking requires persisted trend snapshots.
    // TODO: build a time-series snapshot table for production accuracy.
    return sendSuccess(res, { points: [] });
  } catch (error) {
    next(error);
  }
};
