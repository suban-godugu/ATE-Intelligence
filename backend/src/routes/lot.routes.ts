import { Router } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess } from '../utils/response';


const router = Router();

// Global or per-lot KPIs
router.get('/kpis', async (req: any, res, next) => {
  try {
    const { lotId } = req.query;
    const where = lotId ? { lotId } : {};
    
    const [patternCount, lotCount, failureCount, lotData, patterns] = await Promise.all([
      prisma.pattern.count({ where }),
      prisma.lot.count(),
      prisma.dieResult.count({ where: { ...where, passed: false } }),
      prisma.lot.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { patterns: true }
          }
        }
      }),
      prisma.pattern.findMany({ where, select: { faultCoverage: true } })
    ]);

    const avgCoverage = patterns.length > 0 
      ? patterns.reduce((acc, p) => acc + p.faultCoverage, 0) / patterns.length 
      : 0;

    return sendSuccess(res, {
      totalRuns: lotCount,
      totalPatterns: patternCount,
      coveragePct: avgCoverage,
      totalFailures: failureCount,
      failuresByType: [
        { type: 'STUCK_AT', count: 0 },
        { type: 'TRANSITION', count: 0 },
        { type: 'BRIDGING', count: 0 },
        { type: 'CELL_AWARE', count: 0 },
      ],
      recentRuns: lotData.map(l => ({
        id: l.id,
        name: `Lot ${l.lotNumber}`,
        deviceId: l.product,
        createdAt: l.startDate,
        status: 'COMPLETED',
        coverageReport: { coveragePct: 0 },
        _count: { failures: 0, patterns: l._count.patterns }
      }))
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: any, res, next) => {
  try {
    const lots = await prisma.lot.findMany({
      include: {
        _count: {
          select: {
            patterns: true,
            waferRuns: true,
            scanChains: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const lotsWithKpis = lots.map(lot => ({
      ...lot,
      kpis: {
        avgFaultCoverage: 0,
        passRate: 0,
        totalDies: 0,
      }
    }));

    return sendSuccess(res, lotsWithKpis);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: any, res, next) => {
  try {
    const lot = await prisma.lot.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: {
            patterns: true,
            waferRuns: true,
            scanChains: true,
          }
        }
      }
    });

    if (!lot) {
      return res.status(404).json({ success: false, message: 'Lot not found' });
    }

    return sendSuccess(res, lot);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: any, res, next) => {
  try {
    const { id } = req.params;
    await prisma.lot.delete({ where: { id } });
    return sendSuccess(res, { message: 'Lot deleted successfully' });
  } catch (error) {
    next(error);
  }
});

router.delete('/', async (req: any, res, next) => {
  try {
    await prisma.lot.deleteMany({});
    return sendSuccess(res, { message: 'All lots deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
