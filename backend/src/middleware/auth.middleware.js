/**
 * 🔐 Auth Middleware
 *
 * Middleware d'authentification et d'autorisation
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

/**
 * Custom error class
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

/**
 * Middleware : Protège les routes (vérifie JWT token)
 *
 * Utilisation :
 * router.get('/protected', protect, controller);
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Récupérer le token depuis le header Authorization
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Vérifier que le token existe
    if (!token) {
      return next(
        new AppError('Vous devez être connecté pour accéder à cette ressource', 401)
      );
    }

    // 2. Vérifier le token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return next(new AppError('Token invalide', 401));
      }
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('Token expiré. Veuillez vous reconnecter', 401));
      }
      return next(new AppError('Erreur d\'authentification', 401));
    }

    // 3. Vérifier que l'utilisateur existe toujours
    const user = await User.findById(decoded.id)
      .populate('companyId', 'name plan status')
      .select('-password');

    if (!user) {
      return next(
        new AppError('L\'utilisateur associé à ce token n\'existe plus', 401)
      );
    }

    // 4. Vérifier que l'utilisateur est actif
    if (!user.isActive) {
      return next(
        new AppError('Votre compte a été désactivé. Contactez un administrateur', 403)
      );
    }

    // 5. Vérifier que la company est active
    if (user.companyId && user.companyId.status === 'suspended') {
      return next(
        new AppError('Votre entreprise est suspendue. Contactez le support', 403)
      );
    }

    // 6. Ajouter l'utilisateur à la requête
    req.user = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companyId: user.companyId._id,
      companyName: user.companyId.name,
      companyPlan: user.companyId.plan,
      companyStatus: user.companyId.status
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware : Autorise seulement certains rôles
 *
 * Utilisation :
 * router.delete('/admin-only', protect, authorize('admin', 'superadmin'), controller);
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError('Vous devez être authentifié pour accéder à cette ressource', 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Votre rôle (${req.user.role}) n'a pas les permissions pour accéder à cette ressource`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Middleware : Vérifie que l'utilisateur peut accéder à la ressource de sa company
 * (déjà géré par les controllers via companyId, mais peut être utilisé comme double vérification)
 */
export const checkCompanyAccess = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const resourceCompanyId = req.body.companyId || req.params.companyId || req.query.companyId;

    // Si une companyId est fournie dans la requête, vérifier qu'elle correspond
    if (resourceCompanyId && resourceCompanyId.toString() !== companyId.toString()) {
      // Exception pour superadmin
      if (req.user.role === 'superadmin') {
        return next();
      }

      return next(
        new AppError('Vous n\'avez pas accès aux ressources de cette entreprise', 403)
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware optionnel : Authentification optionnelle
 * (permet d'accéder à la route sans token, mais attache req.user si token valide)
 *
 * Utilisation :
 * router.get('/public-or-private', optionalAuth, controller);
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Si pas de token, continuer sans authentification
    if (!token) {
      return next();
    }

    // Vérifier le token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id)
        .populate('companyId', 'name plan status')
        .select('-password');

      if (user && user.isActive) {
        req.user = {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          companyId: user.companyId._id,
          companyName: user.companyId.name,
          companyPlan: user.companyId.plan,
          companyStatus: user.companyId.status
        };
      }
    } catch (error) {
      // Token invalide, mais on continue quand même (optionalAuth)
      // Ne pas throw d'erreur
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware : Vérifie les limites du plan
 * (à implémenter plus tard avec les vraies limites)
 */
export const checkPlanLimits = (resource) => {
  return async (req, res, next) => {
    try {
      // TODO: Implémenter avec Company.canAdd...()
      // Exemple:
      // const company = await Company.findById(req.user.companyId);
      // if (!company.canAddMission()) {
      //   return next(new AppError('Limite du plan atteinte', 403));
      // }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Export par défaut pour compatibilité
export default {
  protect,
  authorize,
  checkCompanyAccess,
  optionalAuth,
  checkPlanLimits
};
