/**
 * 🔐 Auth Middleware
 *
 * Middleware d'authentification et d'autorisation
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import ApiKey from '../models/ApiKey.model.js';
import { AppError } from '../utils/AppError.js';
import { MockUser, MockCompany } from '../utils/mockDatabase.js';

// Découvert en lançant réellement les tests de charge k6 (T-383) : en Mode
// Mock (MongoDB non connecté — cf. CLAUDE.md, comportement de dev prévu),
// `auth.controller.js` (register/login) bascule déjà sur MockUser/MockCompany
// via ce même garde `useMockDB()`, mais ce middleware `protect` — traversé
// par TOUTE route authentifiée — appelait toujours `User.findById()` (vrai
// Mongoose). Sans connexion, Mongoose met la requête en buffer puis échoue
// après 10s (`bufferTimeoutMS`) : chaque appel API authentifié en mode Mock
// bloquait 10s puis retournait 500, alors que login/register répondaient
// instantanément — contrairement à ce que documente CLAUDE.md ("les routes
// /api/missions, /api/candidates... fonctionnent toutes" en Mode Mock).
const useMockDB = () => mongoose.connection.readyState !== 1;

/**
 * T-338 : vérifie un JWT et applique EXACTEMENT les mêmes contrôles que le
 * middleware `protect` (utilisateur existant, compte actif, company non
 * suspendue, email vérifié, trial non expiré) — extrait de `protect` pour que
 * `sse.routes.js` (qui ne peut pas passer par le header Authorization, voir
 * plus bas) applique les mêmes garanties au lieu de se contenter d'un simple
 * `jwt.verify`. Lève une `AppError` en cas d'échec, retourne l'objet
 * `req.user` attendu en cas de succès.
 */
export async function resolveUserFromJWT(token, req) {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') throw new AppError('Token invalide', 401);
    if (error.name === 'TokenExpiredError') throw new AppError('Token expiré. Veuillez vous reconnecter', 401);
    throw new AppError('Erreur d\'authentification', 401);
  }

  let user;
  if (useMockDB()) {
    const mockUser = await MockUser.findById(decoded.id);
    if (mockUser) {
      const mockCompany = mockUser.companyId ? await MockCompany.findById(mockUser.companyId) : null;
      const { password, ...userWithoutPassword } = mockUser;
      user = {
        ...userWithoutPassword,
        companyId: mockCompany ? {
          _id: mockCompany._id,
          name: mockCompany.name,
          plan: mockCompany.plan,
          status: mockCompany.status,
          trialEndsAt: mockCompany.trialEndsAt,
        } : null,
      };
    }
  } else {
    user = await User.findById(decoded.id)
      .populate('companyId', 'name plan status trialEndsAt')
      .select('-password');
  }

  if (!user) {
    throw new AppError('L\'utilisateur associé à ce token n\'existe plus', 401);
  }

  if (!user.isActive) {
    throw new AppError('Votre compte a été désactivé. Contactez un administrateur', 403);
  }

  if (user.companyId && user.companyId.status === 'suspended') {
    throw new AppError('Votre entreprise est suspendue. Contactez le support', 403);
  }

  const isAuthRoute = req.originalUrl.startsWith('/api/auth');
  const isTestEnv = process.env.NODE_ENV === 'test';
  if (!isAuthRoute && !isTestEnv && user.role !== 'superadmin' && user.emailVerified === false) {
    const err = new AppError('Veuillez vérifier votre adresse email pour accéder à cette ressource.', 403);
    err.code = 'EMAIL_NOT_VERIFIED';
    err.email = user.email;
    throw err;
  }

  const isSuperAdmin = user.role === 'superadmin';
  const isBillingRoute = req.path.startsWith('/billing');
  if (
    !isSuperAdmin &&
    !isBillingRoute &&
    user.companyId?.status === 'trial' &&
    user.companyId?.trialEndsAt &&
    new Date() > new Date(user.companyId.trialEndsAt)
  ) {
    const err = new AppError('Votre période d\'essai a expiré. Choisissez un plan pour continuer.', 402);
    err.code = 'TRIAL_EXPIRED';
    err.trialEndsAt = user.companyId.trialEndsAt;
    throw err;
  }

  return {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    companyId: user.companyId._id,
    companyName: user.companyId.name,
    companyPlan: user.companyId.plan,
    companyStatus: user.companyId.status,
  };
}

/**
 * Middleware : Protège les routes (vérifie JWT token)
 *
 * Utilisation :
 * router.get('/protected', protect, controller);
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    // ── Authentification via API Key (Authorization: ApiKey sk_live_...) ──
    if (authHeader.startsWith('ApiKey ')) {
      const rawKey = authHeader.slice(7);

      if (!rawKey.startsWith('sk_live_')) {
        return next(new AppError('Format de clé API invalide', 401));
      }

      const keyPrefix = rawKey.slice(0, 15);

      // Trouver les candidats par préfixe (évite full-table scan)
      const candidates = await ApiKey.find({ keyPrefix, isActive: true })
        .select('+keyHash')
        .populate({ path: 'companyId', select: 'name plan status' });

      let matchedKey = null;
      for (const candidate of candidates) {
        if (await bcrypt.compare(rawKey, candidate.keyHash)) {
          matchedKey = candidate;
          break;
        }
      }

      if (!matchedKey) {
        return next(new AppError('Clé API invalide ou révoquée', 401));
      }

      // Vérifier expiration
      if (matchedKey.expiresAt && matchedKey.expiresAt < new Date()) {
        return next(new AppError('Clé API expirée', 401));
      }

      // Vérifier company active
      if (matchedKey.companyId?.status === 'suspended') {
        return next(new AppError('Votre entreprise est suspendue', 403));
      }

      // Mettre à jour lastUsedAt de façon non bloquante
      ApiKey.updateOne({ _id: matchedKey._id }, { lastUsedAt: new Date() }).catch(() => {});

      req.user = {
        id: matchedKey.createdBy,
        role: 'api',
        companyId: matchedKey.companyId._id,
        companyName: matchedKey.companyId.name,
        companyPlan: matchedKey.companyId.plan,
        companyStatus: matchedKey.companyId.status,
        apiKeyId: matchedKey._id,
        apiKeyScopes: matchedKey.scopes,
      };

      return next();
    }

    // ── Authentification via JWT (Authorization: Bearer <token>) ──
    let token;

    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    // Vérifier que le token existe
    if (!token) {
      return next(
        new AppError('Vous devez être connecté pour accéder à cette ressource', 401)
      );
    }

    // T-338 : logique extraite dans resolveUserFromJWT() pour être réutilisée
    // telle quelle par sse.routes.js (qui ne peut pas passer par ce header).
    req.user = await resolveUserFromJWT(token, req);
    next();
  } catch (error) {
    // Préserve le format de réponse historique de ces deux cas particuliers
    // (consommé par le frontend legacy / les tests d'intégration) plutôt que
    // de les laisser passer par le format générique du error.middleware.
    if (error.code === 'EMAIL_NOT_VERIFIED') {
      return res.status(403).json({ success: false, code: error.code, message: error.message, email: error.email });
    }
    if (error.code === 'TRIAL_EXPIRED') {
      return res.status(402).json({ success: false, code: error.code, message: error.message, trialEndsAt: error.trialEndsAt });
    }
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

      let user;
      if (useMockDB()) {
        const mockUser = await MockUser.findById(decoded.id);
        if (mockUser) {
          const mockCompany = mockUser.companyId ? await MockCompany.findById(mockUser.companyId) : null;
          user = {
            ...mockUser,
            companyId: mockCompany ? { _id: mockCompany._id, name: mockCompany.name, plan: mockCompany.plan, status: mockCompany.status } : null,
          };
        }
      } else {
        user = await User.findById(decoded.id)
          .populate('companyId', 'name plan status')
          .select('-password');
      }

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
 * Middleware : Vérifie qu'une API Key possède le scope requis.
 * Les requêtes authentifiées via JWT ignorent la vérification (accès complet).
 *
 * Utilisation :
 * router.get('/missions', protect, requireScope('missions:read'), controller);
 */
export const requireScope = (scope) => {
  return (req, res, next) => {
    // JWT = accès complet
    if (req.user?.role !== 'api') return next();

    const scopes = req.user.apiKeyScopes || [];
    if (!scopes.includes(scope)) {
      return next(
        new AppError(`La clé API ne dispose pas du scope requis : ${scope}`, 403)
      );
    }

    next();
  };
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
  optionalAuth,
  checkPlanLimits,
  requireScope,
};
