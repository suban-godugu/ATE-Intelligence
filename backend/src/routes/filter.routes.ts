import { Router } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess } from '../utils/response';

const router = Router();

router.get('/options', async (req, res, next) => {
  try {
    // Dynamic fetching of filter options from DB
    const fabs = await prisma.lot.findMany({ select: { fab: true }, distinct: ['fab'] });
    const testers = await prisma.lot.findMany({ select: { tester: true }, distinct: ['tester'] });
    const products = await prisma.lot.findMany({ select: { product: true }, distinct: ['product'] });
    const lots = await prisma.lot.findMany({ select: { lotNumber: true }, distinct: ['lotNumber'] });

    return sendSuccess(res, {
      fabs: fabs.map(f => f.fab),
      testers: testers.map(t => t.tester),
      products: products.map(p => p.product),
      lots: lots.map(l => l.lotNumber)
    });
  } catch (error) {
    next(error);
  }
});

router.post('/reset', async (req, res) => {
  // Clear any server-side session filter state
  return sendSuccess(res, { message: 'Filter state reset successful' });
});

export default router;
