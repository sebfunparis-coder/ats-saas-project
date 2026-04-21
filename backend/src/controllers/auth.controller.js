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
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Détecter si MongoDB est connecté
const useMockDB = () => mongoose.connection.readyState !== 1;

// ===== HELPERS =====

/**
 * Génère un JWT token
 */
const generateToken = (userId, companyId, role) => {
  return jwt.sign(
    { id: userId, companyId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

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
      planLimits: {
        maxUsers: plan === 'Starter' ? 3 : plan === 'Pro' ? 10 : 999,
        maxMissions: plan === 'Starter' ? 10 : plan === 'Pro' ? 50 : 999,
        maxCandidates: plan === 'Starter' ? 100 : plan === 'Pro' ? 500 : 9999
      },
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

    // 6. Générer token
    const token = generateToken(user._id, company._id, user.role);

    console.log('✅ [AUTH] User registered successfully:', email);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          companyId: company._id,
          companyName: company.name,
          companyPlan: company.plan,
          companyStatus: company.status
        },
        token
      }
    });
  } catch (error) {
    console.error('❌ [AUTH] Registration error:', error);
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

    // Générer token
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
          preferences: user.preferences
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
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
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
  changePassword
};
