/**
 * ⚠️ Error Middleware
 *
 * Gestion centralisée des erreurs
 */

export { AppError } from '../utils/AppError.js';
import * as Sentry from '@sentry/node';
import logger from '../utils/logger.js';

/**
 * Gestion des erreurs Mongoose CastError (ID invalide)
 */
const handleCastErrorDB = (err) => {
  const message = `Ressource non trouvée. ID invalide : ${err.value}`;
  return {
    message,
    statusCode: 400,
    isOperational: true
  };
};

/**
 * Gestion des erreurs Mongoose Duplicate Key (email déjà existant, etc.)
 */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Cette valeur existe déjà : ${field} = "${value}". Veuillez utiliser une autre valeur.`;

  return {
    message,
    statusCode: 400,
    isOperational: true
  };
};

/**
 * Gestion des erreurs Mongoose Validation
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Données invalides. ${errors.join('. ')}`;

  return {
    message,
    statusCode: 400,
    isOperational: true,
    errors
  };
};

/**
 * Gestion des erreurs JWT
 */
const handleJWTError = () => {
  return {
    message: 'Token invalide. Veuillez vous reconnecter.',
    statusCode: 401,
    isOperational: true
  };
};

/**
 * Gestion des erreurs JWT Expired
 */
const handleJWTExpiredError = () => {
  return {
    message: 'Votre session a expiré. Veuillez vous reconnecter.',
    statusCode: 401,
    isOperational: true
  };
};

/**
 * Envoyer erreur en développement (détails complets)
 */
const sendErrorDev = (err, req, res) => {
  if ((err.statusCode || 500) >= 500) {
    logger.error(err.message, {
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      statusCode: err.statusCode || 500,
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      message: err.message,
      statusCode: err.statusCode,
      status: err.status,
      stack: err.stack,
      error: err
    }
  });
};

/**
 * Envoyer erreur en production (seulement si opérationnelle)
 */
const sendErrorProd = (err, req, res) => {
  // Erreur opérationnelle, de confiance : envoyer message au client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors })
    });
  }
  // Erreur de programmation ou autre erreur inconnue : ne pas leak détails
  else {
    logger.error(err.message, {
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      statusCode: 500,
    });

    if (process.env.SENTRY_DSN) {
      Sentry.withScope((scope) => {
        if (req.user) {
          scope.setUser({ id: String(req.user.id), email: req.user.email, companyId: String(req.user.companyId) });
        }
        scope.setContext('request', { url: req.originalUrl, method: req.method });
        Sentry.captureException(err);
      });
    }

    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue sur le serveur'
    });
  }
};

/**
 * Middleware global de gestion des erreurs
 *
 * Doit être placé en dernier dans server.js :
 * app.use(errorHandler);
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    // Mongoose CastError (ID invalide)
    if (err.name === 'CastError') {
      const castError = handleCastErrorDB(err);
      error = { ...error, ...castError };
    }

    // Mongoose Duplicate Key
    if (err.code === 11000) {
      const duplicateError = handleDuplicateFieldsDB(err);
      error = { ...error, ...duplicateError };
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
      const validationError = handleValidationErrorDB(err);
      error = { ...error, ...validationError };
    }

    // JWT Error
    if (err.name === 'JsonWebTokenError') {
      const jwtError = handleJWTError();
      error = { ...error, ...jwtError };
    }

    // JWT Expired Error
    if (err.name === 'TokenExpiredError') {
      const jwtExpiredError = handleJWTExpiredError();
      error = { ...error, ...jwtExpiredError };
    }

    sendErrorProd(error, req, res);
  }
};

/**
 * Middleware : Gère les routes non trouvées (404)
 *
 * Placer avant errorHandler dans server.js :
 * app.use(notFound);
 * app.use(errorHandler);
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  error.statusCode = 404;
  error.isOperational = true;
  next(error);
};

/**
 * Middleware : Async handler (évite try/catch répétitifs)
 *
 * Utilisation alternative aux try/catch dans les controllers :
 * export const getUsers = asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json({ success: true, data: users });
 * });
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Export par défaut
export default {
  errorHandler,
  notFound,
  asyncHandler
};
