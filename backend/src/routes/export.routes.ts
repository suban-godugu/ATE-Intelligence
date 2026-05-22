import { Router } from 'express';
import { prisma } from '../prisma/client';

const router = Router({ mergeParams: true });

router.get('/csv', async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const patterns = await prisma.pattern.findMany({ where: { lotId } });
    
    let csv = 'PatternId,Type,Domain,TestTimeMs,FaultCoverage,FailRate,Action\n';
    patterns.forEach((p: any) => {
      csv += `${p.patternId},${p.type},${p.domain},${p.testTimeMs},${p.faultCoverage},${p.failRate},${p.action}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.attachment(`lot_${lotId}_patterns.csv`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
});

router.get('/stil', async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const patterns = await prisma.pattern.findMany({ 
      where: { lotId, NOT: { action: 'REMOVE' } },
      orderBy: { sequenceIndex: 'asc' }
    });

    let stil = 'STIL 1.0;\n\n';
    stil += `// Optimized STIL for Lot ${lotId}\n`;
    stil += '// Redundant patterns removed and sequence optimized for early exit\n\n';
    
    stil += 'PatternBurst "OptimizedFlow" {\n';
    stil += '  PatList {\n';
    patterns.forEach((p: any) => {
      stil += `    ${p.patternId};\n`;
    });
    stil += '  }\n';
    stil += '}\n';

    res.setHeader('Content-Type', 'text/plain');
    res.attachment(`optimized_${lotId}.stil`);
    return res.send(stil);
  } catch (error) {
    next(error);
  }
});

export default router;
