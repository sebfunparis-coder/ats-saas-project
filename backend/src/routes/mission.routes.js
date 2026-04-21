/**
 * 💼 Mission Routes
 *
 * Routes pour la gestion des missions (offres d'emploi)
 */

import express from 'express';
import * as missionController from '../controllers/mission.controller.js';
import { protect } from '../middleware/auth.middleware.js';
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
 * Supprimer une mission
 */
router.delete('/:id', validateMongoId, missionController.deleteMission);

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
 * GET /api/missions/:id/applications
 * Récupérer toutes les candidatures d'une mission
 */
router.get('/:id/applications', validateMongoId, missionController.getMissionApplications);

export default router;
