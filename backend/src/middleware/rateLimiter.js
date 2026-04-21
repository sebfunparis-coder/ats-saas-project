/**
 * 🛡️ Rate Limiting Middleware
 *
 * Protection contre les abus et attaques brute force
 */

import rateLimit from 'express-rate-limit';

/**
 * Global API Rate Limiter
 * 100 requêtes par 15 minutes par IP
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite de 100 requêtes
  message: {
    success: false,
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer dans 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip successful requests
  skipSuccessfulRequests: false,
  // Skip failed requests
  skipFailedRequests: false
});

/**
 * Auth Rate Limiter (Stricter)
 * 5 tentatives de login par 15 minutes
 * Protection contre brute force sur authentification
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Seulement 5 tentatives
  message: {
    success: false,
    error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
    retryAfter: 15 * 60 // En secondes
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Compter même les succès
  skipFailedRequests: false
});

/**
 * API Rate Limiter per User
 * 60 requêtes par minute par utilisateur
 * Utilise l'ID utilisateur si authentifié, sinon l'IP
 */
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requêtes par minute
  message: {
    success: false,
    error: 'Limite de requêtes atteinte. Veuillez réessayer dans 1 minute.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID if authenticated, otherwise IP
  keyGenerator: (req) => {
    return req.user?.id || req.user?._id || req.ip;
  },
  // Don't count successful requests (only failures)
  skipSuccessfulRequests: true,
  skipFailedRequests: false
});

/**
 * Registration Rate Limiter (Very Strict)
 * 3 inscriptions par heure par IP
 * Prévient la création massive de comptes
 */
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // Maximum 3 inscriptions
  message: {
    success: false,
    error: 'Trop d\'inscriptions depuis cette IP. Veuillez réessayer dans 1 heure.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

/**
 * Password Reset Rate Limiter
 * 3 demandes de reset par heure
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3,
  message: {
    success: false,
    error: 'Trop de demandes de réinitialisation de mot de passe. Réessayez dans 1 heure.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * File Upload Rate Limiter
 * 10 uploads par 15 minutes
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    error: 'Trop d\'uploads. Veuillez réessayer dans 15 minutes.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.user?._id || req.ip
});

/**
 * Sensitive Operations Rate Limiter
 * Pour opérations sensibles : suppression, changement de rôle, etc.
 * 5 opérations par heure
 */
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5,
  message: {
    success: false,
    error: 'Trop d\'opérations sensibles. Veuillez réessayer dans 1 heure.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.user?._id || req.ip
});

/**
 * Create custom rate limiter
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} max - Max requests per window
 * @param {string} message - Error message
 */
export const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message,
      retryAfter: Math.floor(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};
