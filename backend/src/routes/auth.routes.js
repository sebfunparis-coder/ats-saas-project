/**
 * 🔐 Auth Routes
 *
 * Routes d'authentification
 */

import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { passwordResetLimiter, registrationLimiter } from '../middleware/rateLimiter.js';
import {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateResendVerification
} from '../middleware/validation.middleware.js';

const router = express.Router();

// ===== ROUTES PUBLIQUES =====

/**
 * POST /api/auth/register
 * Inscription (crée Company + User + TeamMember)
 */
router.post('/register', registrationLimiter, validateRegister, authController.register);

/**
 * POST /api/auth/login
 * Connexion
 */
router.post('/login', validateLogin, authController.login);

/**
 * GET /api/auth/verify-email/:token
 * Vérification de l'email via token
 */
router.get('/verify-email/:token', authController.verifyEmail);

/**
 * POST /api/auth/resend-verification
 * Renvoyer l'email de vérification — route publique (par email, pas besoin d'être connecté
 * puisque le compte non vérifié ne peut pas se connecter). Rate-limitée pour éviter l'abus.
 */
router.post(
  '/resend-verification',
  passwordResetLimiter,
  validateResendVerification,
  authController.resendVerificationEmail
);

/**
 * POST /api/auth/forgot-password
 * Demande de réinitialisation de mot de passe
 */
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, authController.forgotPassword);

/**
 * POST /api/auth/reset-password/:token
 * Réinitialisation du mot de passe via token
 */
router.post('/reset-password/:token', passwordResetLimiter, validateResetPassword, authController.resetPassword);

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

// ===== ROUTES 2FA =====

/**
 * POST /api/auth/2fa/setup
 * Génère un secret TOTP + QR code (utilisateur connecté)
 */
router.post('/2fa/setup', protect, authController.setup2FA);

/**
 * POST /api/auth/2fa/enable
 * Active le 2FA après confirmation du code TOTP
 */
router.post('/2fa/enable', protect, authController.enable2FA);

/**
 * POST /api/auth/2fa/disable
 * Désactive le 2FA (nécessite le mot de passe)
 */
router.post('/2fa/disable', protect, authController.disable2FA);

/**
 * POST /api/auth/2fa/verify-login
 * Vérifie le code TOTP lors du login (route publique — utilise tempToken)
 */
router.post('/2fa/verify-login', authController.verifyLogin2FA);

export default router;
