/**
 * 📊 Analytics Routes
 * /api/analytics
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { getAnalytics } from '../controllers/analytics.controller.js';

const router = express.Router();

// Accès réservé aux rôles ayant besoin de reporting
router.use(protect, authorize('admin', 'superadmin', 'manager'));

router.get('/', getAnalytics);

export default router;
