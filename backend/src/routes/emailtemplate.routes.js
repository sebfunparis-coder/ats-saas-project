/**
 * 📧 Email Template Routes
 * /api/email-templates
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  listTemplates,
  getTemplate,
  updateTemplate,
  resetTemplate,
  sendTestEmail,
} from '../controllers/emailtemplate.controller.js';

const router = express.Router();

router.use(protect, authorize('admin', 'superadmin', 'manager'));

router.get('/', listTemplates);
router.get('/:slug', getTemplate);
router.put('/:slug', updateTemplate);
router.post('/:slug/reset', resetTemplate);
router.post('/:slug/test', sendTestEmail);

export default router;
