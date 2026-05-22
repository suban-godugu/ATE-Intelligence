import { Router } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess } from '../utils/response';


const router = Router({ mergeParams: true });



// Coverage by fault model
router.get('/', async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const coverages = await prisma.faultCoverage.findMany({
      where: { pattern: { lotId } },
      orderBy: { coverage: 'desc' }
    });

    // Group by model
    const grouped = coverages.reduce((acc: any, curr: any) => {
      if (!acc[curr.model]) {
        acc[curr.model] = { model: curr.model, totalDetected: 0, totalUndetected: 0, avgCoverage: 0, count: 0 };
      }
      acc[curr.model].totalDetected += curr.detected;
      acc[curr.model].totalUndetected += curr.undetected;
      acc[curr.model].avgCoverage += curr.coverage;
      acc[curr.model].count += 1;
      return acc;
    }, {});

    const result = Object.values(grouped).map((g: any) => ({
      ...g,
      avgCoverage: parseFloat((g.avgCoverage / g.count).toFixed(2))
    }));

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// Coverage % per silicon domain
router.get('/by-domain', async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const patterns = await prisma.pattern.findMany({
      where: { lotId },
      select: { domain: true, faultCoverage: true }
    });

    const domains: any = {};
    patterns.forEach((p: any) => {
      if (!domains[p.domain]) domains[p.domain] = { domain: p.domain, sum: 0, count: 0 };
      domains[p.domain].sum += p.faultCoverage;
      domains[p.domain].count += 1;
    });

    const result = Object.values(domains).map((d: any) => ({
      domain: d.domain,
      coverage: parseFloat((d.sum / d.count).toFixed(2))
    }));

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// Cumulative coverage curve
router.get('/incremental', async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const patterns = await prisma.pattern.findMany({
      where: { lotId },
      orderBy: { createdAt: 'asc' }
    });

    let cumulative = 0;
    const dataPoints = patterns.map((p: any, index: number) => {
      cumulative = ((cumulative * index) + p.faultCoverage) / (index + 1);
      return {
        step: index + 1,
        patternId: p.patternId,
        coverage: parseFloat(cumulative.toFixed(2))
      };
    });

    return sendSuccess(res, dataPoints);
  } catch (error) {
    next(error);
  }
});

// Radar: per-pattern-type × fault-model matrix
router.get('/radar', async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const coverages = await prisma.faultCoverage.findMany({
      where: { pattern: { lotId } },
      include: { pattern: { select: { type: true } } }
    });

    const matrix: any = {};
    coverages.forEach((c: any) => {
      const type = c.pattern.type;
      const model = c.model;
      if (!matrix[type]) matrix[type] = { type };
      if (!matrix[type][model]) {
        matrix[type][model] = { sum: 0, count: 0 };
      }
      matrix[type][model].sum += c.coverage;
      matrix[type][model].count += 1;
    });

    const result = Object.values(matrix).map((row: any) => {
      const newRow: any = { type: row.type };
      Object.keys(row).forEach(key => {
        if (key !== 'type') {
          newRow[key] = parseFloat((row[key].sum / row[key].count).toFixed(2));
        }
      });
      return newRow;
    });

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

export default router;
