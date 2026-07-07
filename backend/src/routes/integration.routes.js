/**
 * 🔗 Integration Routes
 * /api/integrations
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  getIntegrations,
  saveIntegration,
  testIntegration,
  publishMissionToJobboard,
  unpublishMissionFromJobboard,
  getPublishedJobs,
} from '../controllers/integration.controller.js';

const router = express.Router();

router.use(protect, authorize('admin', 'superadmin', 'manager'));

router.get('/',                                    getIntegrations);
router.put('/:platform',                           saveIntegration);
router.post('/:platform/test',                     testIntegration);
router.get('/:platform/jobs',                      getPublishedJobs);
router.post('/:platform/publish/:missionId',       publishMissionToJobboard);
router.delete('/:platform/jobs/:externalJobId',    unpublishMissionFromJobboard);

export default router;
