/**
 * 📋 Application Routes
 *
 * Routes pour la gestion des candidatures (Pipeline Kanban)
 */

import express from 'express';
import * as applicationController from '../controllers/application.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  validateApplication,
  validateApplicationStatus,
  validateInterview,
  validateMongoId
} from '../middleware/validation.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent authentication
router.use(protect);

// ===== ROUTES PRINCIPALES =====

/**
 * GET /api/applications
 * Liste toutes les candidatures avec filtres et pagination
 */
router.get('/', applicationController.getAllApplications);

/**
 * GET /api/applications/stats
 * Statistiques candidatures
 */
router.get('/stats', applicationController.getApplicationStats);

/**
 * GET /api/applications/pipeline
 * Récupérer données Pipeline Kanban (groupées par statut)
 */
router.get('/pipeline', applicationController.getPipeline);

/**
 * GET /api/applications/:id
 * Récupérer une candidature par ID
 */
router.get('/:id', validateMongoId, applicationController.getApplicationById);

/**
 * POST /api/applications
 * Créer une nouvelle candidature
 */
router.post('/', validateApplication, applicationController.createApplication);

/**
 * PUT /api/applications/:id
 * Mettre à jour une candidature
 */
router.put('/:id', validateMongoId, applicationController.updateApplication);

/**
 * DELETE /api/applications/:id
 * Supprimer une candidature
 */
router.delete('/:id', validateMongoId, applicationController.deleteApplication);

// ===== ACTIONS PIPELINE =====

/**
 * PUT /api/applications/:id/status
 * Mettre à jour le statut d'une candidature (Kanban drag & drop)
 */
router.put(
  '/:id/status',
  validateMongoId,
  validateApplicationStatus,
  applicationController.updateApplicationStatus
);

/**
 * POST /api/applications/:id/reject
 * Rejeter une candidature
 */
router.post('/:id/reject', validateMongoId, applicationController.rejectApplication);

/**
 * POST /api/applications/:id/hire
 * Embaucher un candidat
 */
router.post('/:id/hire', validateMongoId, applicationController.hireCandidate);

/**
 * POST /api/applications/:id/offer
 * Faire une offre à un candidat
 */
router.post('/:id/offer', validateMongoId, applicationController.makeOffer);

// ===== INTERVIEWS =====

/**
 * POST /api/applications/:id/interview
 * Ajouter un entretien à une candidature
 */
router.post(
  '/:id/interview',
  validateMongoId,
  validateInterview,
  applicationController.addInterview
);

/**
 * PUT /api/applications/:id/interview/:interviewId
 * Mettre à jour un entretien (compléter, noter)
 */
router.put(
  '/:id/interview/:interviewId',
  validateMongoId,
  applicationController.updateInterview
);

export default router;
