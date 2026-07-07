/**
 * 🤝 Client Routes
 *
 * Routes pour la gestion des clients (entreprises clientes)
 */

import express from 'express';
import * as clientController from '../controllers/client.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  validateClient,
  validateContact,
  validateMongoId
} from '../middleware/validation.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent authentication
router.use(protect);

// ===== ROUTES PRINCIPALES =====

/**
 * GET /api/clients
 * Liste tous les clients avec filtres et pagination
 */
router.get('/', clientController.getAllClients);

/**
 * GET /api/clients/stats
 * Statistiques clients
 */
router.get('/stats', clientController.getClientStats);

/**
 * GET /api/clients/:id
 * Récupérer un client par ID
 */
router.get('/:id', validateMongoId, clientController.getClientById);

/**
 * POST /api/clients
 * Créer un nouveau client
 */
router.post('/', validateClient, clientController.createClient);

/**
 * PUT /api/clients/:id
 * Mettre à jour un client
 */
router.put('/:id', validateMongoId, validateClient, clientController.updateClient);

/**
 * DELETE /api/clients/:id
 * Supprimer un client
 * T-342 : aucune restriction de rôle (contrairement à candidates/missions
 * purge, qui exigent admin/superadmin) — n'importe quel utilisateur
 * authentifié de la company pouvait supprimer un client CRM.
 */
router.delete('/:id', authorize('admin', 'manager', 'superadmin'), validateMongoId, clientController.deleteClient);

router.patch('/:id/restore', validateMongoId, clientController.restoreClient);

/**
 * DELETE /api/clients/:id/purge
 * Suppression définitive — même restriction que purgeCandidate/purgeMission.
 */
router.delete('/:id/purge', authorize('admin', 'superadmin'), validateMongoId, clientController.purgeClient);

// ===== ACTIONS =====

/**
 * PUT /api/clients/:id/status
 * Mettre à jour le statut d'un client
 */
router.put('/:id/status', validateMongoId, clientController.updateClientStatus);

// ===== CONTACTS =====

/**
 * POST /api/clients/:id/contact
 * Ajouter un contact à un client
 */
router.post('/:id/contact', validateMongoId, validateContact, clientController.addContact);

/**
 * PUT /api/clients/:id/contact/:contactId
 * Mettre à jour un contact
 */
router.put('/:id/contact/:contactId', validateMongoId, validateContact, clientController.updateContact);

/**
 * DELETE /api/clients/:id/contact/:contactId
 * Retirer un contact d'un client
 */
router.delete('/:id/contact/:contactId', validateMongoId, clientController.removeContact);

// ===== MISSIONS =====

/**
 * GET /api/clients/:id/missions
 * Récupérer toutes les missions d'un client
 */
router.get('/:id/missions', validateMongoId, clientController.getClientMissions);

/**
 * POST /api/clients/:id/mission/:missionId
 * Associer une mission à un client
 */
router.post('/:id/mission/:missionId', validateMongoId, clientController.linkMission);

/**
 * DELETE /api/clients/:id/mission/:missionId
 * Dissocier une mission d'un client
 */
router.delete('/:id/mission/:missionId', validateMongoId, clientController.unlinkMission);

export default router;
