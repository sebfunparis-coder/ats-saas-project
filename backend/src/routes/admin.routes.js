/**
 * ⚙️ Admin Routes
 *
 * Routes d'administration (admin + superadmin)
 */

import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'superadmin'));

/**
 * GET /api/admin/stats
 * Statistiques agrégées de la company (missions, candidats, candidatures, taux conversion)
 */
router.get('/stats', adminController.getAdminStats);

/**
 * GET /api/admin/audit-logs
 * Journal d'audit avec filtres (date, user, entity)
 */
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
