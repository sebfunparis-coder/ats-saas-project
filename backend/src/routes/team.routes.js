/**
 * 👥 Team Routes
 *
 * Routes pour la gestion des membres de l'équipe
 */

import express from 'express';
import * as teamController from '../controllers/team.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validateTeamMember, validateMongoId } from '../middleware/validation.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent authentication
router.use(protect);

// ===== ROUTES PRINCIPALES =====

/**
 * GET /api/team
 * Liste tous les membres de l'équipe avec filtres et pagination
 */
router.get('/', teamController.getAllTeamMembers);

/**
 * GET /api/team/stats
 * Statistiques équipe (admin only)
 */
router.get('/stats', authorize('admin', 'superadmin'), teamController.getTeamStats);

/**
 * GET /api/team/:id
 * Récupérer un membre de l'équipe par ID
 */
router.get('/:id', validateMongoId, teamController.getTeamMemberById);

/**
 * POST /api/team
 * Créer un nouveau membre de l'équipe (admin only)
 */
router.post(
  '/',
  authorize('admin', 'superadmin'),
  validateTeamMember,
  teamController.createTeamMember
);

/**
 * PUT /api/team/:id
 * Mettre à jour un membre de l'équipe (admin only)
 */
router.put(
  '/:id',
  authorize('admin', 'superadmin'),
  validateMongoId,
  teamController.updateTeamMember
);

/**
 * DELETE /api/team/:id
 * Supprimer un membre de l'équipe (admin only)
 */
router.delete(
  '/:id',
  authorize('admin', 'superadmin'),
  validateMongoId,
  teamController.deleteTeamMember
);

// ===== ACTIONS =====

/**
 * PUT /api/team/:id/permissions
 * Mettre à jour les permissions d'un membre (admin only)
 */
router.put(
  '/:id/permissions',
  authorize('admin', 'superadmin'),
  validateMongoId,
  teamController.updatePermissions
);

/**
 * POST /api/team/:id/activity
 * Enregistrer une activité
 */
router.post('/:id/activity', validateMongoId, teamController.recordActivity);

/**
 * PUT /api/team/:id/stats
 * Incrémenter une statistique
 */
router.put('/:id/stats', validateMongoId, teamController.incrementStat);

/**
 * GET /api/team/:id/performance
 * Récupérer les performances d'un membre
 */
router.get('/:id/performance', validateMongoId, teamController.getPerformance);

/**
 * POST /api/team/:id/reset-monthly
 * Réinitialiser les performances mensuelles (admin only)
 */
router.post(
  '/:id/reset-monthly',
  authorize('admin', 'superadmin'),
  validateMongoId,
  teamController.resetMonthlyPerformance
);

export default router;
