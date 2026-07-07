/**
 * 💼 Mission Routes
 *
 * Routes pour la gestion des missions (offres d'emploi)
 */

import express from 'express';
import * as missionController from '../controllers/mission.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validateMission, validateMongoId } from '../middleware/validation.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent authentication
router.use(protect);

// ===== ROUTES PRINCIPALES =====

/**
 * GET /api/missions
 * Liste toutes les missions avec filtres et pagination
 */
router.get('/', missionController.getAllMissions);

/**
 * GET /api/missions/stats
 * Statistiques missions
 */
router.get('/stats', missionController.getMissionStats);

/**
 * DELETE /api/missions/bulk
 * Soft-delete plusieurs missions en une requête
 */
router.delete('/bulk', authorize('admin', 'manager', 'superadmin'), missionController.bulkDeleteMissions);

/**
 * PUT /api/missions/bulk/status
 * Changement de statut bulk
 * T-374 : contrairement à DELETE /bulk (ligne 35), cette route n'avait
 * aucune restriction de rôle — n'importe quel utilisateur authentifié de la
 * company pouvait forcer le statut de n'importe quelles missions, y compris
 * publier une mission (status:'active') en contournant le workflow
 * d'approbation réservé à ces rôles.
 */
router.put('/bulk/status', authorize('admin', 'manager', 'superadmin'), missionController.bulkUpdateMissionsStatus);

/**
 * GET /api/missions/:id
 * Récupérer une mission par ID
 */
router.get('/:id', validateMongoId, missionController.getMissionById);

/**
 * POST /api/missions
 * Créer une nouvelle mission
 */
router.post('/', validateMission, missionController.createMission);

/**
 * PUT /api/missions/:id
 * Mettre à jour une mission
 */
router.put('/:id', validateMongoId, validateMission, missionController.updateMission);

/**
 * DELETE /api/missions/:id
 * Soft-delete une mission
 * T-341 : alignée sur la même restriction de rôle que /bulk (ligne 35) — sans
 * cela, un rôle non élevé contournait la restriction du bulk en supprimant une
 * par une.
 */
router.delete('/:id', authorize('admin', 'manager', 'superadmin'), validateMongoId, missionController.deleteMission);

/**
 * PATCH /api/missions/:id/restore
 * Restaurer une mission soft-deleted
 * T-375 : le contrôleur documente "(admin uniquement)" mais la route n'avait
 * aucune restriction de rôle — alignée sur purge (ligne 85), même niveau
 * d'accès attendu pour ces deux opérations de récupération/suppression.
 */
router.patch('/:id/restore', authorize('admin', 'superadmin'), validateMongoId, missionController.restoreMission);

/**
 * DELETE /api/missions/:id/purge
 * Suppression définitive (RGPD)
 */
router.delete('/:id/purge', authorize('admin', 'superadmin'), validateMongoId, missionController.purgeMission);

// ===== ACTIONS =====

/**
 * POST /api/missions/:id/publish
 * Publier une mission (draft → active)
 */
router.post('/:id/publish', validateMongoId, missionController.publishMission);

/**
 * POST /api/missions/:id/close
 * Fermer une mission
 */
router.post('/:id/close', validateMongoId, missionController.closeMission);

/**
 * POST /api/missions/:id/pause
 * Mettre en pause une mission
 */
router.post('/:id/pause', validateMongoId, missionController.pauseMission);

/**
 * POST /api/missions/:id/resume
 * Reprendre une mission en pause
 */
router.post('/:id/resume', validateMongoId, missionController.resumeMission);

// ===== RELATIONS =====

/**
 * POST /api/missions/:id/request-approval
 * Soumettre une mission draft pour validation (recruteurs)
 */
router.post('/:id/request-approval', validateMongoId, missionController.requestApproval);

/**
 * POST /api/missions/:id/approve
 * Approuver une mission en attente (admin/manager/superadmin)
 */
router.post('/:id/approve', authorize('admin', 'manager', 'superadmin'), validateMongoId, missionController.approveMission);

/**
 * POST /api/missions/:id/reject
 * Rejeter une mission en attente avec commentaire (admin/manager/superadmin)
 */
router.post('/:id/reject', authorize('admin', 'manager', 'superadmin'), validateMongoId, missionController.rejectMission);

/**
 * GET /api/missions/:id/applications
 * Récupérer toutes les candidatures d'une mission
 */
router.get('/:id/applications', validateMongoId, missionController.getMissionApplications);

export default router;
