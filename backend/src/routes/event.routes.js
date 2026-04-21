/**
 * 📅 Event Routes
 *
 * Routes pour la gestion des événements (calendrier)
 */

import express from 'express';
import * as eventController from '../controllers/event.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateEvent, validateMongoId } from '../middleware/validation.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent authentication
router.use(protect);

// ===== ROUTES PRINCIPALES =====

/**
 * GET /api/events
 * Liste tous les événements avec filtres et pagination
 */
router.get('/', eventController.getAllEvents);

/**
 * GET /api/events/stats
 * Statistiques événements
 */
router.get('/stats', eventController.getEventStats);

/**
 * GET /api/events/upcoming
 * Récupérer les prochains événements
 */
router.get('/upcoming', eventController.getUpcomingEvents);

/**
 * GET /api/events/calendar/day
 * Récupérer les événements d'un jour
 */
router.get('/calendar/day', eventController.getDayEvents);

/**
 * GET /api/events/calendar/week
 * Récupérer les événements d'une semaine
 */
router.get('/calendar/week', eventController.getWeekEvents);

/**
 * GET /api/events/calendar/month
 * Récupérer les événements d'un mois
 */
router.get('/calendar/month', eventController.getMonthEvents);

/**
 * GET /api/events/:id
 * Récupérer un événement par ID
 */
router.get('/:id', validateMongoId, eventController.getEventById);

/**
 * POST /api/events
 * Créer un nouvel événement
 */
router.post('/', validateEvent, eventController.createEvent);

/**
 * PUT /api/events/:id
 * Mettre à jour un événement
 */
router.put('/:id', validateMongoId, validateEvent, eventController.updateEvent);

/**
 * DELETE /api/events/:id
 * Supprimer un événement
 */
router.delete('/:id', validateMongoId, eventController.deleteEvent);

// ===== ACTIONS =====

/**
 * POST /api/events/:id/cancel
 * Annuler un événement
 */
router.post('/:id/cancel', validateMongoId, eventController.cancelEvent);

/**
 * POST /api/events/:id/complete
 * Marquer un événement comme terminé
 */
router.post('/:id/complete', validateMongoId, eventController.completeEvent);

/**
 * POST /api/events/:id/reschedule
 * Reprogrammer un événement
 */
router.post('/:id/reschedule', validateMongoId, eventController.rescheduleEvent);

// ===== PARTICIPANTS =====

/**
 * POST /api/events/:id/participant
 * Ajouter un participant à un événement
 */
router.post('/:id/participant', validateMongoId, eventController.addParticipant);

/**
 * PUT /api/events/:id/participant/:participantId
 * Mettre à jour le statut d'un participant
 */
router.put('/:id/participant/:participantId', validateMongoId, eventController.updateParticipantStatus);

/**
 * DELETE /api/events/:id/participant/:participantId
 * Retirer un participant d'un événement
 */
router.delete('/:id/participant/:participantId', validateMongoId, eventController.removeParticipant);

export default router;
