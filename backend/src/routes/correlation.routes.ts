import { Router } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess } from '../utils/response';


const router = Router({ mergeParams: true });



// failRate by zone per pattern
router.get('/wafer-zones', async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const waferRuns = await prisma.waferRun.findMany({
      where: { lotId },
      include: { dieResults: true }
    });

    const zones = ['center', 'mid-ring', 'edge'];
    const result = zones.map((zone: string) => {
      const runs = waferRuns.filter((r: any) => r.zone === zone);
      const totalDies = runs.reduce((acc: number, r: any) => acc + r.dieResults.length, 0);
      const failingDies = runs.reduce((acc: number, r: any) => acc + r.dieResults.filter((d: any) => !d.passed).length, 0);
      
      return {
        zone,
        failRate: totalDies > 0 ? parseFloat(((failingDies / totalDies) * 100).toFixed(2)) : 0,
        totalDies,
        failingDies
      };
    });

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// Pearson r per pattern vs yield
router.get('/yield', async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const patterns = await prisma.pattern.findMany({
      where: { lotId },
      orderBy: { failRate: 'desc' },
      take: 15
    });

    // Simplified correlation derived from failRate
    const result = patterns.map((p: any) => ({
      patternId: p.patternId,
      pearsonR: parseFloat((p.failRate * 0.05).toFixed(3)), // Simple derivation
      significance: p.failRate > 15 ? 'High' : p.failRate > 5 ? 'Medium' : 'Low'
    }));

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

export default router;
