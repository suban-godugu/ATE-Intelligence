import { Router } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess, ApiError } from '../utils/response';


const router = Router({ mergeParams: true });



router.get('/', async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const chains = await prisma.scanChain.findMany({
      where: { lotId },
      orderBy: { chainId: 'asc' }
    });
    return sendSuccess(res, chains);
  } catch (error) {
    next(error);
  }
});

router.get('/kpis', async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const chains = await prisma.scanChain.findMany({ where: { lotId } });

    if (chains.length === 0) return sendSuccess(res, { totalCells: 0, chainCount: 0, compression: 0, imbalance: 0, brokenCount: 0 });

    const totalCells = chains.reduce((acc: number, c: any) => acc + c.length, 0);
    const avgBalance = chains.reduce((acc: number, c: any) => acc + c.balancePercent, 0) / chains.length;
    const brokenCount = chains.filter((c: any) => c.status === 'BROKEN').length;

    return sendSuccess(res, {
      totalCells,
      chainCount: chains.length,
      compression: 0,
      imbalance: parseFloat((100 - avgBalance).toFixed(2)),
      brokenCount
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: any, res, next) => {
  try {
    const chain = await prisma.scanChain.findUnique({
      where: { id: req.params.id }
    });
    if (!chain) throw new ApiError(404, 'Scan chain not found');
    return sendSuccess(res, chain);
  } catch (error) {
    next(error);
  }
});

router.post('/rebalance', async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const chains = await prisma.scanChain.findMany({ where: { lotId } });
    
    if (chains.length === 0) {
      return sendSuccess(res, {
        recommendations: [],
        projectedImbalanceReduction: '0%'
      });
    }

    const avgCells = chains.reduce((acc: number, c: any) => acc + c.length, 0) / chains.length;
    const recommendations = chains.map((c: any) => ({
      chainId: c.chainId,
      currentCells: c.length,
      recommendedCells: Math.round(avgCells),
      delta: Math.round(avgCells - c.length)
    }));

    return sendSuccess(res, {
      recommendations,
      projectedImbalanceReduction: '0%'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
