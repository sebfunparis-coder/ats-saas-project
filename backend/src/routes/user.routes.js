/**
 * 👤 User Routes
 *
 * Routes pour la gestion des utilisateurs (admin only)
 */

import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  validateUser,
  validateUserRole,
  validateResetPassword,
  validateMongoId
} from '../middleware/validation.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent authentication + role admin/superadmin
router.use(protect);
router.use(authorize('admin', 'superadmin'));

// ===== ROUTES PRINCIPALES =====

/**
 * GET /api/users
 * Liste tous les utilisateurs de la company
 */
router.get('/', userController.getAllUsers);

/**
 * GET /api/users/stats
 * Statistiques utilisateurs
 */
router.get('/stats', userController.getUserStats);

/**
 * GET /api/users/:id
 * Récupérer un utilisateur par ID
 */
router.get('/:id', validateMongoId, userController.getUserById);

/**
 * POST /api/users
 * Créer un nouvel utilisateur
 */
router.post('/', validateUser, userController.createUser);

/**
 * PUT /api/users/:id
 * Mettre à jour un utilisateur
 */
router.put('/:id', validateMongoId, userController.updateUser);

/**
 * DELETE /api/users/:id
 * Supprimer un utilisateur (soft delete)
 */
router.delete('/:id', validateMongoId, userController.deleteUser);

// ===== ACTIONS =====

/**
 * PUT /api/users/:id/activate
 * Activer un utilisateur
 */
router.put('/:id/activate', validateMongoId, userController.activateUser);

/**
 * PUT /api/users/:id/deactivate
 * Désactiver un utilisateur
 */
router.put('/:id/deactivate', validateMongoId, userController.deactivateUser);

/**
 * PUT /api/users/:id/role
 * Changer le rôle d'un utilisateur
 */
router.put('/:id/role', validateMongoId, validateUserRole, userController.updateUserRole);

/**
 * PUT /api/users/:id/reset-password
 * Réinitialiser le mot de passe d'un utilisateur
 */
router.put(
  '/:id/reset-password',
  validateMongoId,
  validateResetPassword,
  userController.resetUserPassword
);

export default router;
