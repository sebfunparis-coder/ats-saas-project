/**
 * 🛡️ Rate Limiting Middleware
 *
 * Protection contre les abus et attaques brute force.
 * Toutes les limites sont configurables via .env — voir .env.example.
 * En NODE_ENV=test, toutes les limites sont désactivées (max=100000).
 */

import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

const isTest = process.env.NODE_ENV === 'test';

// Returns env var as int, or the production default. In test mode returns 100000.
const limit = (envKey, prodDefault) =>
  isTest ? 100000 : parseInt(process.env[envKey] || prodDefault, 10);

/**
 * Global API Rate Limiter
 * Défaut : 100 req / 15 min / IP — configurable via RATE_LIMIT_GLOBAL_MAX
 */
export const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, 10),
  max: limit('RATE_LIMIT_GLOBAL_MAX', 100),
  message: {
    success: false,
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  handler: (req, res, next, options) => {
    logger.warn('Global rate limit hit', {
      event: 'security.rate_limit',
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
    });
    res.status(options.statusCode).json(options.message);
  },
});

/**
 * Auth Rate Limiter (Stricter)
 * Défaut : 5 req / 15 min — configurable via RATE_LIMIT_AUTH_MAX
 */
export const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, 10),
  max: limit('RATE_LIMIT_AUTH_MAX', 5),
  message: {
    success: false,
    error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  handler: (req, res, next, options) => {
    logger.warn('Rate limit hit on auth endpoint', {
      event: 'security.rate_limit',
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
    });
    res.status(options.statusCode).json(options.message);
  },
});

/**
 * API Rate Limiter per User
 * Défaut : 60 req / min / user — configurable via RATE_LIMIT_API_MAX
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: limit('RATE_LIMIT_API_MAX', 60),
  message: {
    success: false,
    error: 'Limite de requêtes atteinte. Veuillez réessayer dans 1 minute.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.user?._id || req.ip,
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
});

/**
 * Registration Rate Limiter
 * Défaut : 3 req / heure / IP — configurable via RATE_LIMIT_REGISTER_MAX
 */
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: limit('RATE_LIMIT_REGISTER_MAX', 3),
  message: {
    success: false,
    error: 'Trop d\'inscriptions depuis cette IP. Veuillez réessayer dans 1 heure.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

/**
 * Password Reset Rate Limiter
 * Défaut : 3 req / heure — configurable via RATE_LIMIT_RESET_MAX
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: limit('RATE_LIMIT_RESET_MAX', 3),
  message: {
    success: false,
    error: 'Trop de demandes de réinitialisation de mot de passe. Réessayez dans 1 heure.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * File Upload Rate Limiter
 * Défaut : 10 req / 15 min — configurable via RATE_LIMIT_UPLOAD_MAX
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: limit('RATE_LIMIT_UPLOAD_MAX', 10),
  message: {
    success: false,
    error: 'Trop d\'uploads. Veuillez réessayer dans 15 minutes.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.user?._id || req.ip,
});

/**
 * Sensitive Operations Rate Limiter
 * Défaut : 5 req / heure — configurable via RATE_LIMIT_SENSITIVE_MAX
 */
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: limit('RATE_LIMIT_SENSITIVE_MAX', 5),
  message: {
    success: false,
    error: 'Trop d\'opérations sensibles. Veuillez réessayer dans 1 heure.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.user?._id || req.ip,
});

/**
 * Create custom rate limiter
 */
export const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max: isTest ? 100000 : max,
    message: {
      success: false,
      error: message,
      retryAfter: Math.floor(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};
