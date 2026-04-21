/**
 * 📄 Candidate Routes
 *
 * Routes pour la gestion des candidats (CVthèque)
 */

import express from 'express';
import * as candidateController from '../controllers/candidate.controller.js';
import { protect } from '../middleware/auth.middleware.js';
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
 * Supprimer un candidat
 */
router.delete('/:id', validateMongoId, candidateController.deleteCandidate);

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
