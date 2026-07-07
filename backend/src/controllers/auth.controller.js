/**
 * 🔐 Auth Controller
 *
 * Gère l'authentification : register, login, logout, password reset
 */

import User from '../models/User.model.js';
import Company from '../models/Company.model.js';
import TeamMember from '../models/Team.model.js';
import { MockUser, MockCompany, MockTeamMember } from '../utils/mockDatabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';
import logger from '../utils/logger.js';
import { sendResetPasswordEmail, sendVerificationEmail } from '../services/email.service.js';
import { getPlanLimits } from '../config/plans.js';
import { successResponse, createdResponse } from '../utils/response.js';

// Détecter si MongoDB est connecté
const useMockDB = () => mongoose.connection.readyState !== 1;

// ===== HELPERS =====

const generateToken = (userId, companyId, role) => {
  return jwt.sign(
    { id: userId, companyId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ===== CONTROLLERS =====

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur + création company + team member
 */
export const register = async (req, res, next) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      company: companyName,
      plan = 'Starter'
    } = req.body;

    // Choisir entre MongoDB et Mock DB
    const UserModel = useMockDB() ? MockUser : User;
    const CompanyModel = useMockDB() ? MockCompany : Company;
    const TeamMemberModel = useMockDB() ? MockTeamMember : TeamMember;

    if (useMockDB()) {
      console.log('⚠️ [AUTH] Using Mock Database (MongoDB not connected)');
    }

    // Vérifier si l'email existe déjà
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new AppError('Cet email est déjà utilisé', 400);
    }

    // 1. Créer la company
    const company = await CompanyModel.create({
      name: companyName,
      email,
      plan,
      status: 'trial',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours
      planLimits: getPlanLimits(plan),
      userIds: [],
      candidateIds: [],
      missionIds: []
    });

    // 2. Créer l'utilisateur
    const user = await UserModel.create({
      email,
      password,
      firstName,
      lastName,
      companyId: company._id,
      company: companyName,
      role: 'admin' // Premier utilisateur = admin
    });

    // 3. Créer le team member
    const teamMember = await TeamMemberModel.create({
      firstName,
      lastName,
      email,
      role: 'Admin',
      userId: user._id,
      companyId: company._id,
      active: true,
      permissions: ['all']
    });

    // 4. Mettre à jour company avec admin user (uniquement pour Mongoose)
    if (!useMockDB()) {
      company.adminUserId = user._id;
      company.userIds.push(user._id);
      await company.save();

      // 5. Mettre à jour user avec team member
      user.teamMemberId = teamMember._id;
      await user.save();
    } else {
      // Pour Mock DB, mise à jour manuelle
      company.adminUserId = user._id;
      company.userIds.push(user._id);
      user.teamMemberId = teamMember._id;
    }

    // 6. Générer token de vérification email (uniquement pour Mongoose)
    let emailVerifyRawToken;
    if (!useMockDB()) {
      emailVerifyRawToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = crypto.createHash('sha256').update(emailVerifyRawToken).digest('hex');
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      await user.save({ validateBeforeSave: false });
    }

    // 7. Générer JWT
    const token = generateToken(user._id, company._id, user.role);

    // T-420 : `console.log` direct contournait le pipeline winston (rotation
    // de fichiers, format structuré, redactSensitive) — `logger.info` aligne
    // ce log sur le même mécanisme que le reste de ce fichier (ex. le
    // `logger.warn('Account lockout triggered', ...)` ci-dessous, qui logge
    // déjà `email` en meta sans le rédiger — cohérent avec T-220 : l'email
    // n'est pas classé comme donnée sensible dans `SENSITIVE_KEYS`, seuls les
    // identifiants de type secret/token/mot de passe le sont).
    logger.info('User registered successfully', { event: 'auth.register', email, userId: user._id });

    const responseData = {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: company._id,
        companyName: company.name,
        companyPlan: company.plan,
        companyStatus: company.status,
        emailVerified: user.emailVerified || false
      },
      token
    };

    if (process.env.NODE_ENV !== 'production' && emailVerifyRawToken) {
      responseData.devEmailToken = emailVerifyRawToken;
      responseData.devVerifyUrl = `/verify-email/${emailVerifyRawToken}`;
    }

    // Send verification email (non-blocking — failure doesn't abort registration)
    if (emailVerifyRawToken) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      sendVerificationEmail(email, `${frontendUrl}/verify-email/${emailVerifyRawToken}`);
    }

    res.status(201).json({ success: true, data: responseData });
  } catch (error) {
    logger.error('Registration error', { event: 'auth.register_error', message: error.message, stack: error.stack });
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Connexion utilisateur
 */
export const login = async (req, res, next) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // ── MODE MOCK (sans MongoDB) ────────────────────────────────────────────
    if (useMockDB()) {
      const mockUser = await MockUser.findOne({ email });
      if (!mockUser) throw new AppError('Email ou mot de passe incorrect', 401);

      const isMatch = await bcrypt.compare(password, mockUser.password);
      if (!isMatch) throw new AppError('Email ou mot de passe incorrect', 401);

      if (!mockUser.isActive) throw new AppError('Compte désactivé', 403);

      const mockCompany = await MockCompany.findById(mockUser.companyId);
      const token = generateToken(mockUser._id, mockUser.companyId, mockUser.role);

      return res.json({
        success: true,
        data: {
          user: {
            id: mockUser._id,
            email: mockUser.email,
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            fullName: `${mockUser.firstName} ${mockUser.lastName}`,
            role: mockUser.role,
            companyId: mockUser.companyId,
            companyName: mockCompany?.name || 'Demo ATS',
            companyPlan: mockCompany?.plan || 'Pro',
            companyStatus: 'active',
          },
          token,
        },
      });
    }
    // ── MODE MONGODB ────────────────────────────────────────────────────────

    // Trouver l'utilisateur (+ password car select: false par défaut)
    const user = await User.findOne({ email })
      .select('+password +loginAttempts +lockUntil')
      .populate('companyId', 'name plan status');

    if (!user) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    // Vérifier si compte verrouillé
    if (user.isLocked()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      logger.warn('Account lockout triggered', {
        event: 'security.account_lockout',
        email: user.email,
        ip: req.ip,
        minutesLeft,
      });
      throw new AppError(
        `Compte verrouillé suite à trop de tentatives. Réessayez dans ${minutesLeft} minutes`,
        423
      );
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Incrémenter les tentatives échouées
      await user.incLoginAttempts();
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    // Vérifier que le compte est actif
    if (!user.isActive) {
      throw new AppError('Compte désactivé', 403);
    }

    // Bloquer l'accès tant que l'email n'est pas vérifié
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Veuillez vérifier votre adresse email avant de vous connecter. Vérifiez votre boîte mail ou demandez un nouveau lien.',
        email: user.email
      });
    }

    // Réinitialiser les tentatives de connexion
    await user.resetLoginAttempts();

    // Mettre à jour lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Mettre à jour company lastLoginAt
    if (user.companyId) {
      await Company.findByIdAndUpdate(user.companyId._id, {
        lastLoginAt: new Date()
      });
    }

    // Si 2FA activé → retourner un token temporaire (challenge)
    if (user.twoFactorEnabled) {
      const tempToken = jwt.sign(
        { pending2FA: true, userId: String(user._id), companyId: String(user.companyId._id), role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );
      return res.json({ success: true, data: { requiresTwoFactor: true, tempToken } });
    }

    // Générer token complet
    const token = generateToken(user._id, user.companyId._id, user.role);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          companyId: user.companyId._id,
          companyName: user.companyId.name,
          companyPlan: user.companyId.plan,
          companyStatus: user.companyId.status,
          avatar: user.avatar,
          preferences: user.preferences,
          emailVerified: user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
          // T-376 : signale qu'un mot de passe temporaire généré par un admin
          // (team.controller.js → createTeamMember) doit être changé avant
          // de continuer — même convention que `requiresTwoFactor` ci-dessus.
          mustChangePassword: !!user.mustChangePassword
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Récupérer l'utilisateur actuel (nécessite auth)
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('companyId', 'name plan status health engagement')
      .populate('teamMemberId')
      .lean();

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Déconnexion (invalide token côté client)
 */
export const logout = async (req, res) => {
  // Pour l'instant, juste retourner success
  // Le client supprimera le token de localStorage
  // Plus tard : implémenter blacklist de tokens avec Redis

  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
};

/**
 * PUT /api/auth/update-profile
 * Mettre à jour le profil utilisateur
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, avatar, preferences } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Mettre à jour les champs autorisés
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      success: true,
      data: user.toAuthJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/change-password
 * Changer le mot de passe
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Mot de passe actuel et nouveau requis', 400);
    }

    if (newPassword.length < 8) {
      throw new AppError('Le nouveau mot de passe doit contenir au moins 8 caractères', 400);
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Vérifier le mot de passe actuel
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Mot de passe actuel incorrect', 401);
    }

    // Mettre à jour le mot de passe (sera hashé automatiquement)
    user.password = newPassword;
    // T-376 : un changement de mot de passe réussi lève l'obligation posée
    // par un mot de passe temporaire généré par un admin.
    user.mustChangePassword = false;
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/verify-email/:token
 * Active le compte email via le token reçu
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      throw new AppError('Lien de vérification invalide ou expiré', 400);
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Email vérifié avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/resend-verification
 * Renvoie l'email de vérification — route publique, identifiée par email.
 * Réponse générique dans tous les cas pour éviter l'énumération de comptes.
 */
export const resendVerificationEmail = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;
    const response = {
      success: true,
      message: 'Si un compte non vérifié existe pour cet email, un lien de vérification a été envoyé.'
    };

    if (useMockDB()) {
      // Mode mock : pas de persistance de token réelle, on répond simplement de façon générique
      return res.json(response);
    }

    const user = await User.findOne({ email });

    if (user && !user.emailVerified) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save({ validateBeforeSave: false });

      // Send verification email (non-blocking)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      sendVerificationEmail(user.email, `${frontendUrl}/verify-email/${rawToken}`);

      if (process.env.NODE_ENV !== 'production') {
        response.devToken = rawToken;
        response.devVerifyUrl = `/verify-email/${rawToken}`;
      }
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/forgot-password
 * Génère un token de reset, l'enregistre en base, et envoie l'email de réinitialisation
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ email, isActive: true, isDeleted: false });

    // Répondre toujours avec succès pour ne pas divulguer si l'email existe
    if (!user) {
      return res.json({
        success: true,
        message: 'Si cet email est enregistré, un lien de réinitialisation a été envoyé'
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure
    await user.save({ validateBeforeSave: false });

    // Send reset email (non-blocking)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    sendResetPasswordEmail(email, `${frontendUrl}/reset-password/${rawToken}`);

    const response = {
      success: true,
      message: 'Si cet email est enregistré, un lien de réinitialisation a été envoyé'
    };

    if (process.env.NODE_ENV !== 'production') {
      response.devToken = rawToken;
      response.devResetUrl = `/reset-password/${rawToken}`;
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password/:token
 * Valide le token et met à jour le mot de passe
 */
export const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { token } = req.params;
    const { newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
      isActive: true,
      isDeleted: false
    }).select('+password');

    if (!user) {
      throw new AppError('Token invalide ou expiré', 400);
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// ===== 2FA CONTROLLERS =====

/**
 * POST /api/auth/2fa/setup
 * Génère un secret TOTP + QR code (ne l'active pas encore)
 */
export const setup2FA = async (req, res, next) => {
  try {
    if (useMockDB()) throw new AppError('La 2FA nécessite MongoDB', 503);

    const user = await User.findById(req.user.id);
    if (!user) throw new AppError('Utilisateur non trouvé', 404);

    const secret = speakeasy.generateSecret({
      name: `ATS Ultimate (${user.email})`,
      length: 20,
    });

    // Stocker le secret en attente (non activé)
    user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = false;
    await user.save({ validateBeforeSave: false });

    const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({ success: true, data: { qrCode: qrDataUrl, secret: secret.base32 } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/2fa/enable
 * Confirme le secret TOTP avec un code, génère les backup codes
 */
export const enable2FA = async (req, res, next) => {
  try {
    if (useMockDB()) throw new AppError('La 2FA nécessite MongoDB', 503);

    const { token } = req.body;
    if (!token) throw new AppError('Code TOTP requis', 400);

    const user = await User.findById(req.user.id).select('+twoFactorSecret');
    if (!user?.twoFactorSecret) throw new AppError('Configurez d\'abord le 2FA via /2fa/setup', 400);

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!isValid) throw new AppError('Code TOTP invalide', 401);

    // Générer 8 codes de récupération
    const plainCodes = Array.from({ length: 8 }, () => crypto.randomBytes(4).toString('hex'));
    const hashedCodes = await Promise.all(plainCodes.map(c => bcrypt.hash(c, 8)));

    user.twoFactorEnabled = true;
    user.twoFactorBackupCodes = hashedCodes;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, data: { backupCodes: plainCodes } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/2fa/disable
 * Désactive le 2FA après confirmation du mot de passe
 */
export const disable2FA = async (req, res, next) => {
  try {
    if (useMockDB()) throw new AppError('La 2FA nécessite MongoDB', 503);

    const { password } = req.body;
    if (!password) throw new AppError('Mot de passe requis', 400);

    const user = await User.findById(req.user.id).select('+password');
    if (!user) throw new AppError('Utilisateur non trouvé', 404);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new AppError('Mot de passe incorrect', 401);

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = [];
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Authentification à deux facteurs désactivée' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/2fa/verify-login
 * Vérifie le code TOTP (ou backup code) lors du login et retourne le JWT complet
 */
export const verifyLogin2FA = async (req, res, next) => {
  try {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) throw new AppError('tempToken et code requis', 400);

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch {
      throw new AppError('Session expirée. Veuillez vous reconnecter.', 401);
    }

    if (!decoded.pending2FA) throw new AppError('Token invalide', 401);

    const user = await User.findById(decoded.userId)
      .select('+twoFactorSecret +twoFactorBackupCodes')
      .populate('companyId', 'name plan status');

    if (!user) throw new AppError('Utilisateur non trouvé', 404);

    // Essayer TOTP d'abord
    const totpValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!totpValid) {
      // Essayer les codes de récupération
      let usedIdx = -1;
      for (let i = 0; i < user.twoFactorBackupCodes.length; i++) {
        if (await bcrypt.compare(code, user.twoFactorBackupCodes[i])) {
          usedIdx = i;
          break;
        }
      }
      if (usedIdx === -1) throw new AppError('Code invalide', 401);

      // Consommer le code de récupération
      user.twoFactorBackupCodes.splice(usedIdx, 1);
      await user.save({ validateBeforeSave: false });
    }

    const token = generateToken(user._id, user.companyId._id, user.role);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          companyId: user.companyId._id,
          companyName: user.companyId.name,
          companyPlan: user.companyId.plan,
          companyStatus: user.companyId.status,
          avatar: user.avatar,
          preferences: user.preferences,
          emailVerified: user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Export default pour compatibilité
export default {
  register,
  login,
  getCurrentUser,
  logout,
  updateProfile,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  setup2FA,
  enable2FA,
  disable2FA,
  verifyLogin2FA,
};
