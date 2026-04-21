/**
 * 🚨 Error Handler Middleware
 * Gestion centralisée des erreurs
 */

/**
 * Custom Application Error class
 * Usage: throw new AppError('Message', statusCode)
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Log l'erreur
  console.error('❌ Error:', err);

  // Erreur Mongoose - Validation
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors
    });
  }

  // Erreur Mongoose - Cast (ID invalide)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID invalide',
      error: err.message
    });
  }

  // Erreur Mongoose - Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} existe déjà`,
      error: `Ce ${field} est déjà utilisé`
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expiré'
    });
  }

  // Erreur par défaut
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur serveur interne';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
