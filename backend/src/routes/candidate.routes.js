/**
 * 📄 Candidate Routes
 *
 * Routes pour la gestion des candidats (CVthèque)
 */

import express from 'express';
import * as candidateController from '../controllers/candidate.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validateCandidate, validateMongoId } from '../middleware/validation.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent authentication
router.use(protect);

// ===== ROUTES PRINCIPALES =====

/**
 * GET /api/candidates
 * Liste tous les candidats avec filtres et pagination
 */
router.get('/', candidateController.getAllCandidates);

/**
 * GET /api/candidates/stats
 * Statistiques candidats
 */
router.get('/stats', candidateController.getCandidateStats);

/**
 * POST /api/candidates/import
 * Importer plusieurs candidats (CSV/JSON)
 */
router.post('/import', candidateController.importCandidates);

/**
 * DELETE /api/candidates/bulk
 * Soft-delete plusieurs candidats en une requête
 */
router.delete('/bulk', authorize('admin', 'manager', 'superadmin'), candidateController.bulkDeleteCandidates);

/**
 * PUT /api/candidates/bulk/status
 * Changement de statut bulk
 * T-374 : même correctif que missions bulk/status — restriction de rôle
 * manquante, alignée sur DELETE /bulk (ligne 41).
 */
router.put('/bulk/status', authorize('admin', 'manager', 'superadmin'), candidateController.bulkUpdateCandidatesStatus);

/**
 * GET /api/candidates/:id
 * Récupérer un candidat par ID
 */
router.get('/:id', validateMongoId, candidateController.getCandidateById);

/**
 * POST /api/candidates
 * Créer un nouveau candidat
 */
router.post('/', validateCandidate, candidateController.createCandidate);

/**
 * PUT /api/candidates/:id
 * Mettre à jour un candidat
 */
router.put('/:id', validateMongoId, validateCandidate, candidateController.updateCandidate);

/**
 * DELETE /api/candidates/:id
 * Soft-delete un candidat
 * T-341 : alignée sur la même restriction de rôle que /bulk (ligne 41) — sans
 * cela, un rôle non élevé contournait la restriction du bulk en supprimant un
 * par un.
 */
router.delete('/:id', authorize('admin', 'manager', 'superadmin'), validateMongoId, candidateController.deleteCandidate);

/**
 * PATCH /api/candidates/:id/restore
 * Restaurer un candidat soft-deleted
 */
router.patch('/:id/restore', validateMongoId, candidateController.restoreCandidate);

/**
 * DELETE /api/candidates/:id/purge
 * Suppression définitive (RGPD)
 */
router.delete('/:id/purge', authorize('admin', 'superadmin'), validateMongoId, candidateController.purgeCandidate);

// ===== ACTIONS =====

/**
 * PUT /api/candidates/:id/status
 * Mettre à jour le statut d'un candidat
 */
router.put('/:id/status', validateMongoId, candidateController.updateCandidateStatus);

/**
 * PUT /api/candidates/:id/rating
 * Noter un candidat (0-5 étoiles)
 */
router.put('/:id/rating', validateMongoId, candidateController.rateCandidate);

// ===== RELATIONS =====

/**
 * GET /api/candidates/:id/applications
 * Récupérer toutes les candidatures d'un candidat
 */
router.get('/:id/applications', validateMongoId, candidateController.getCandidateApplications);

export default router;
