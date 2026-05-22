import { Router } from 'express';
import authRoutes       from './auth.routes';
import lotRoutes        from './lot.routes';
import patternRoutes    from './pattern.routes';
import coverageRoutes   from './coverage.routes';
import scanChainRoutes  from './scanChain.routes';
import scanChainRunRoutes from './scanChainRun.routes';
import mbistRoutes      from './mbist.routes';
import lbistRoutes      from './lbist.routes';
import overviewRoutes   from './overview.routes';
import redundancyRoutes from './redundancy.routes';
import correlationRoutes from './correlation.routes';
import aiRoutes         from './ai.routes';

const router = Router();

// Auth routes (global)
router.use('/auth', authRoutes);

// Lot routes (global)
router.use('/lots', lotRoutes);

// Nested lot-specific routes
router.use('/lots/:lotId/patterns',   patternRoutes);
router.use('/lots/:lotId/coverage',   coverageRoutes);
router.use('/lots/:lotId/scanchains', scanChainRoutes);
router.use('/lots/:lotId/scanchains', scanChainRunRoutes);   // /runs, /runs/summary, /runs/by-chain, /runs/trend
router.use('/lots/:lotId/mbist',      mbistRoutes);          // /runs, /runs/summary, /runs/by-instance, etc.
router.use('/lots/:lotId/lbist',      lbistRoutes);          // /runs, /runs/summary, /runs/signature-status, etc.
router.use('/lots/:lotId/overview',   overviewRoutes);       // /bist-summary
router.use('/lots/:lotId/redundancy', redundancyRoutes);
router.use('/lots/:lotId/correlation', correlationRoutes);
router.use('/lots/:lotId/ai',         aiRoutes);

export default router;
