/**
 * 👤 User Controller
 *
 * Gère les utilisateurs : CRUD (admin only), roles, activation, stats
 */

import User from '../models/User.model.js';
import TeamMember from '../models/Team.model.js';
import { validationResult } from 'express-validator';

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
 * GET /api/users
 * Liste tous les utilisateurs de la company (admin only)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { companyId, role } = req.user;

    // Vérifier permissions
    if (role !== 'admin' && role !== 'superadmin') {
      throw new AppError('Permissions insuffisantes', 403);
    }

    const {
      isActive,
      userRole,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 50,
      skip = 0
    } = req.query;

    // Construire le filtre
    const filter = { companyId };

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (userRole) {
      filter.role = userRole;
    }

    // Construire le tri
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Exécuter la requête
    const users = await User.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('companyId', 'name plan status')
      .populate('teamMemberId', 'role department stats')
      .select('-password') // Ne jamais retourner les mots de passe
      .lean();

    // Compter le total
    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + parseInt(limit) < total
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 * Récupérer un utilisateur par ID (admin only)
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId, role } = req.user;

    // Vérifier permissions
    if (role !== 'admin' && role !== 'superadmin') {
      throw new AppError('Permissions insuffisantes', 403);
    }

    const user = await User.findOne({ _id: id, companyId })
      .populate('companyId', 'name plan status health')
      .populate('teamMemberId')
      .select('-password')
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
 * POST /api/users
 * Créer un nouvel utilisateur (admin only)
 * Note: Normalement, on passe par /api/team qui crée user + team member
 */
export const createUser = async (req, res, next) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { companyId, role: userRole } = req.user;

    // Vérifier permissions
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      throw new AppError('Permissions insuffisantes', 403);
    }

    const { email, password, firstName, lastName, role, phone } = req.body;

    // Vérifier si email existe
    const existingUser = await User.findOne({ email, companyId });
    if (existingUser) {
      throw new AppError('Un utilisateur avec cet email existe déjà', 400);
    }

    // Vérifier limites du plan (à implémenter avec Company.canAddUser())
    // const company = await Company.findById(companyId);
    // if (!company.canAddUser()) {
    //   throw new AppError('Limite d\'utilisateurs atteinte pour votre plan', 403);
    // }

    const userData = {
      email,
      password,
      firstName,
      lastName,
      phone,
      companyId,
      role: role || 'user'
    };

    const user = await User.create(userData);

    // Retourner sans le mot de passe
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      data: userResponse,
      message: 'Utilisateur créé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id
 * Mettre à jour un utilisateur (admin only)
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId, role: userRole } = req.user;

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Vérifier permissions
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      throw new AppError('Permissions insuffisantes', 403);
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ _id: id, companyId });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Champs autorisés à la modification (admin)
    const allowedFields = [
      'firstName',
      'lastName',
      'phone',
      'avatar',
      'role',
      'isActive'
    ];

    // Mettre à jour uniquement les champs autorisés
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    // Retourner sans le mot de passe
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id
 * Supprimer un utilisateur (admin only)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId, role: userRole, id: currentUserId } = req.user;

    // Vérifier permissions
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      throw new AppError('Permissions insuffisantes', 403);
    }

    // Ne pas se supprimer soi-même
    if (id === currentUserId) {
      throw new AppError('Vous ne pouvez pas supprimer votre propre compte', 400);
    }

    const user = await User.findOne({ _id: id, companyId });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Désactiver le team member associé
    if (user.teamMemberId) {
      await TeamMember.findByIdAndUpdate(user.teamMemberId, { active: false });
    }

    // Soft delete : désactiver plutôt que supprimer
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Utilisateur désactivé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id/activate
 * Activer un utilisateur (admin only)
 */
export const activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId, role: userRole } = req.user;

    // Vérifier permissions
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      throw new AppError('Permissions insuffisantes', 403);
    }

    const user = await User.findOne({ _id: id, companyId });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    user.isActive = true;
    await user.save();

    // Activer le team member associé
    if (user.teamMemberId) {
      await TeamMember.findByIdAndUpdate(user.teamMemberId, { active: true });
    }

    res.json({
      success: true,
      data: user,
      message: 'Utilisateur activé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id/deactivate
 * Désactiver un utilisateur (admin only)
 */
export const deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId, role: userRole, id: currentUserId } = req.user;

    // Vérifier permissions
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      throw new AppError('Permissions insuffisantes', 403);
    }

    // Ne pas se désactiver soi-même
    if (id === currentUserId) {
      throw new AppError('Vous ne pouvez pas désactiver votre propre compte', 400);
    }

    const user = await User.findOne({ _id: id, companyId });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    user.isActive = false;
    await user.save();

    // Désactiver le team member associé
    if (user.teamMemberId) {
      await TeamMember.findByIdAndUpdate(user.teamMemberId, { active: false });
    }

    res.json({
      success: true,
      data: user,
      message: 'Utilisateur désactivé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id/role
 * Changer le rôle d'un utilisateur (admin only)
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role: newRole } = req.body;
    const { companyId, role: userRole, id: currentUserId } = req.user;

    // Vérifier permissions
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      throw new AppError('Permissions insuffisantes', 403);
    }

    if (!newRole) {
      throw new AppError('Le rôle est requis', 400);
    }

    const validRoles = ['user', 'admin'];
    if (userRole !== 'superadmin' && newRole === 'superadmin') {
      throw new AppError('Seul un superadmin peut créer d\'autres superadmins', 403);
    }

    if (!validRoles.includes(newRole) && newRole !== 'superadmin') {
      throw new AppError('Rôle invalide', 400);
    }

    // Ne pas se rétrograder soi-même
    if (id === currentUserId && newRole !== 'admin' && newRole !== 'superadmin') {
      throw new AppError('Vous ne pouvez pas vous rétrograder vous-même', 400);
    }

    const user = await User.findOne({ _id: id, companyId });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    user.role = newRole;
    await user.save();

    res.json({
      success: true,
      data: user,
      message: 'Rôle mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id/reset-password
 * Réinitialiser le mot de passe d'un utilisateur (admin only)
 */
export const resetUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const { companyId, role: userRole } = req.user;

    // Vérifier permissions
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      throw new AppError('Permissions insuffisantes', 403);
    }

    if (!newPassword || newPassword.length < 8) {
      throw new AppError('Le mot de passe doit contenir au moins 8 caractères', 400);
    }

    const user = await User.findOne({ _id: id, companyId });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Le mot de passe sera hashé automatiquement par le model
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/stats
 * Statistiques utilisateurs pour dashboard (admin only)
 */
export const getUserStats = async (req, res, next) => {
  try {
    const { companyId, role } = req.user;

    // Vérifier permissions
    if (role !== 'admin' && role !== 'superadmin') {
      throw new AppError('Permissions insuffisantes', 403);
    }

    const total = await User.countDocuments({ companyId });
    const active = await User.countDocuments({ companyId, isActive: true });
    const inactive = await User.countDocuments({ companyId, isActive: false });
    const admins = await User.countDocuments({ companyId, role: 'admin', isActive: true });

    // Utilisateurs créés ce mois
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const thisMonth = await User.countDocuments({
      companyId,
      createdAt: { $gte: startOfMonth }
    });

    // Dernières connexions
    const recentLogins = await User.find({ companyId, lastLogin: { $exists: true } })
      .sort({ lastLogin: -1 })
      .limit(5)
      .select('firstName lastName email lastLogin avatar')
      .lean();

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive,
        admins,
        thisMonth,
        recentLogins
      }
    });
  } catch (error) {
    next(error);
  }
};

// Export default pour compatibilité
export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  updateUserRole,
  resetUserPassword,
  getUserStats
};
