import { Router } from 'express';
import * as controller from '../controllers/optimizationController';

const router = Router();

router.post('/preview', controller.preview);
router.post('/run', controller.run);
router.get('/results', controller.getResults);

export default router;
