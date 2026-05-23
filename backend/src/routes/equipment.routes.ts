import { Router } from 'express';
import {
  getFleet,
  getTesterById,
  getUtilisation,
  getMaintenance,
  createMaintenance,
  updateMaintenance,
  getAlerts,
  acknowledgeAlert,
  getMtbfMttr,
  updateAlertRules
} from '../controllers/equipmentController';

const router = Router();

router.get('/fleet', getFleet);
router.get('/tester/:id', getTesterById);
router.get('/utilisation', getUtilisation);
router.get('/maintenance', getMaintenance);
router.post('/maintenance', createMaintenance);
router.patch('/maintenance/:id', updateMaintenance);
router.get('/alerts', getAlerts);
router.patch('/alerts/:id/acknowledge', acknowledgeAlert);
router.get('/metrics/mtbf-mttr', getMtbfMttr);
router.post('/alerts/rules', updateAlertRules);

export default router;
