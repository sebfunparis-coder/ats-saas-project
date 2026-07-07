import { AppError } from '../utils/AppError.js';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Origin/Referer validation for stateless JWT APIs.
 * csurf targets cookie-session auth — for Bearer token APIs, checking
 * the origin header is the correct CSRF mitigation.
 * Requests with no origin (Postman, mobile, server-to-server) pass through.
 */
export const csrfProtection = (allowedOrigins) => (req, res, next) => {
  if (!MUTATION_METHODS.has(req.method)) return next();

  const origin = req.headers.origin;
  const referer = req.headers.referer;

  if (!origin && !referer) return next();

  if (origin) {
    if (!allowedOrigins.includes(origin)) {
      return next(new AppError('Requête refusée : origine non autorisée', 403));
    }
    return next();
  }

  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (!allowedOrigins.includes(refererOrigin)) {
        return next(new AppError('Requête refusée : origine non autorisée', 403));
      }
    } catch {
      return next(new AppError('Requête refusée : en-tête Referer invalide', 403));
    }
  }

  next();
};
