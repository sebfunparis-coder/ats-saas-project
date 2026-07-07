/**
 * 👑 SuperAdmin Routes
 *
 * Routes globales multi-tenant (superadmin only)
 */

import express from 'express';
import * as superadminController from '../controllers/superadmin.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent authentication + role superadmin
router.use(protect);
router.use(authorize('superadmin'));

/**
 * GET /api/superadmin/stats
 * Statistiques globales de la plateforme
 */
router.get('/stats', superadminController.getGlobalStats);

/**
 * GET /api/superadmin/companies
 * Liste toutes les entreprises
 */
router.get('/companies', superadminController.getAllCompanies);

/**
 * GET /api/superadmin/users
 * Liste tous les utilisateurs de la plateforme
 */
router.get('/users', superadminController.getAllUsersGlobal);

export default router;
