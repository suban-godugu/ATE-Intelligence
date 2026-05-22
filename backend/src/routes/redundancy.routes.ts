import { Router } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess } from '../utils/response';

const router = Router({ mergeParams: true });

const parsePatterns = (patterns: string | string[]) =>
  typeof patterns === 'string' ? JSON.parse(patterns) : patterns;

router.get('/', async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const groups = await prisma.redundancyGroup.findMany({ where: { lotId } });

    const parsedGroups = groups.map((g: any) => ({
      ...g,
      patterns: parsePatterns(g.patterns)
    }));

    return sendSuccess(res, parsedGroups);
  } catch (error) {
    next(error);
  }
});

router.get('/heatmap', async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const groups = await prisma.redundancyGroup.findMany({ where: { lotId } });

    if (groups.length === 0) {
      return sendSuccess(res, { labels: [], matrix: [] });
    }

    const patternIds = Array.from(new Set(groups.flatMap((g: any) => parsePatterns(g.patterns)))).slice(0, 10) as string[];

    const matrix = patternIds.map((patternId) => ({
      patternId,
      overlaps: patternIds.map((otherPatternId) => {
        if (patternId === otherPatternId) return 100;
        const group = groups.find((g: any) => {
          const patterns = parsePatterns(g.patterns);
          return patterns.includes(patternId) && patterns.includes(otherPatternId);
        });
        return group ? group.overlap : 0;
      })
    }));

    return sendSuccess(res, {
      labels: patternIds,
      matrix
    });
  } catch (error) {
    next(error);
  }
});

router.post('/remove', async (req: any, res, next) => {
  try {
    const { lotId } = req.params;
    const groups = await prisma.redundancyGroup.findMany({ where: { lotId } });

    const patternsToRemove: string[] = [];
    groups.forEach((g: any) => {
      parsePatterns(g.patterns).forEach((pId: string) => {
        if (pId !== g.keepId) patternsToRemove.push(pId);
      });
    });

    await prisma.pattern.updateMany({
      where: {
        lotId,
        patternId: { in: patternsToRemove }
      },
      data: { action: 'REMOVE' }
    });

    return sendSuccess(res, {
      removedCount: patternsToRemove.length,
      patterns: patternsToRemove
    });
  } catch (error) {
    next(error);
  }
});

export default router;
