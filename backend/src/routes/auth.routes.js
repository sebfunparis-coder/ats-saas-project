/**
 * 🔐 Auth Routes
 *
 * Routes d'authentification
 */

import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  validateRegister,
  validateLogin,
  validateChangePassword
} from '../middleware/validation.middleware.js';

const router = express.Router();

// ===== ROUTES PUBLIQUES =====

/**
 * POST /api/auth/register
 * Inscription (crée Company + User + TeamMember)
 */
router.post('/register', validateRegister, authController.register);

/**
 * POST /api/auth/login
 * Connexion
 */
router.post('/login', validateLogin, authController.login);

// ===== ROUTES PROTÉGÉES =====

/**
 * GET /api/auth/me
 * Récupérer l'utilisateur actuel
 */
router.get('/me', protect, authController.getCurrentUser);

/**
 * POST /api/auth/logout
 * Déconnexion
 */
router.post('/logout', protect, authController.logout);

/**
 * PUT /api/auth/profile
 * Mettre à jour le profil
 */
router.put('/profile', protect, authController.updateProfile);

/**
 * PUT /api/auth/password
 * Changer le mot de passe
 */
router.put('/password', protect, validateChangePassword, authController.changePassword);

export default router;
