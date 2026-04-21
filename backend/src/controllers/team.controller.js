/**
 * 👥 Team Controller
 *
 * Gère les membres de l'équipe : CRUD, permissions, stats, performance
 */

import TeamMember from '../models/Team.model.js';
import User from '../models/User.model.js';
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
 * GET /api/team
 * Liste tous les membres de l'équipe (avec pagination, filtres)
 */
export const getAllTeamMembers = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const {
      role,
      active,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 50,
      skip = 0
    } = req.query;

    // Construire le filtre
    const filter = { companyId };

    if (role) {
      filter.role = role;
    }

    if (active !== undefined) {
      filter.active = active === 'true';
    }

    // Construire le tri
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Exécuter la requête
    const teamMembers = await TeamMember.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('userId', 'email avatar isActive lastLogin')
      .lean();

    // Compter le total
    const total = await TeamMember.countDocuments(filter);

    res.json({
      success: true,
      data: teamMembers,
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
 * GET /api/team/:id
 * Récupérer un membre de l'équipe par ID
 */
export const getTeamMemberById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const teamMember = await TeamMember.findOne({ _id: id, companyId })
      .populate('userId', 'email avatar isActive lastLogin preferences')
      .lean();

    if (!teamMember) {
      throw new AppError('Membre de l\'équipe non trouvé', 404);
    }

    res.json({
      success: true,
      data: teamMember
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/team
 * Créer un nouveau membre de l'équipe
 */
export const createTeamMember = async (req, res, next) => {
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

    // Vérifier que l'utilisateur a les droits (admin ou recruteur)
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      throw new AppError('Permissions insuffisantes pour créer un membre d\'équipe', 403);
    }

    const { email, firstName, lastName, role, permissions } = req.body;

    // Vérifier si email existe déjà
    const existingUser = await User.findOne({ email, companyId });
    if (existingUser) {
      throw new AppError('Un utilisateur avec cet email existe déjà', 400);
    }

    // Vérifier limites du plan (à implémenter avec Company.canAddUser())
    // const company = await Company.findById(companyId);
    // if (!company.canAddUser()) {
    //   throw new AppError('Limite d\'utilisateurs atteinte pour votre plan', 403);
    // }

    // Créer l'utilisateur d'abord
    const user = await User.create({
      email,
      password: 'TempPassword123!', // Mot de passe temporaire (à changer au premier login)
      firstName,
      lastName,
      companyId,
      role: role === 'Admin' ? 'admin' : 'user'
    });

    // Créer le team member
    const teamMemberData = {
      firstName,
      lastName,
      email,
      role,
      userId: user._id,
      companyId,
      permissions: permissions || [],
      active: true
    };

    const teamMember = await TeamMember.create(teamMemberData);

    // Mettre à jour user avec teamMemberId
    user.teamMemberId = teamMember._id;
    await user.save();

    res.status(201).json({
      success: true,
      data: teamMember,
      message: 'Membre de l\'équipe créé avec succès. Un email avec les identifiants a été envoyé.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/team/:id
 * Mettre à jour un membre de l'équipe
 */
export const updateTeamMember = async (req, res, next) => {
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
      throw new AppError('Permissions insuffisantes pour modifier un membre d\'équipe', 403);
    }

    // Trouver le membre
    const teamMember = await TeamMember.findOne({ _id: id, companyId });

    if (!teamMember) {
      throw new AppError('Membre de l\'équipe non trouvé', 404);
    }

    // Champs autorisés à la modification
    const allowedFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'role',
      'permissions',
      'department',
      'active',
      'performance'
    ];

    // Mettre à jour uniquement les champs autorisés
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        teamMember[field] = req.body[field];
      }
    });

    await teamMember.save();

    res.json({
      success: true,
      data: teamMember
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/team/:id
 * Supprimer un membre de l'équipe
 */
export const deleteTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId, role: userRole } = req.user;

    // Vérifier permissions
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      throw new AppError('Permissions insuffisantes pour supprimer un membre d\'équipe', 403);
    }

    const teamMember = await TeamMember.findOne({ _id: id, companyId });

    if (!teamMember) {
      throw new AppError('Membre de l\'équipe non trouvé', 404);
    }

    // Désactiver l'utilisateur associé
    if (teamMember.userId) {
      await User.findByIdAndUpdate(teamMember.userId, { isActive: false });
    }

    // Soft delete : marquer comme inactif plutôt que supprimer
    teamMember.active = false;
    await teamMember.save();

    res.json({
      success: true,
      message: 'Membre de l\'équipe désactivé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/team/:id/permissions
 * Mettre à jour les permissions d'un membre
 */
export const updatePermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    const { companyId, role: userRole } = req.user;

    // Vérifier permissions
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      throw new AppError('Permissions insuffisantes', 403);
    }

    if (!Array.isArray(permissions)) {
      throw new AppError('Les permissions doivent être un tableau', 400);
    }

    const teamMember = await TeamMember.findOne({ _id: id, companyId });

    if (!teamMember) {
      throw new AppError('Membre de l\'équipe non trouvé', 404);
    }

    teamMember.permissions = permissions;
    await teamMember.save();

    res.json({
      success: true,
      data: teamMember,
      message: 'Permissions mises à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/team/:id/activity
 * Enregistrer une activité (appelé automatiquement lors d'actions)
 */
export const recordActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const teamMember = await TeamMember.findOne({ _id: id, companyId });

    if (!teamMember) {
      throw new AppError('Membre de l\'équipe non trouvé', 404);
    }

    // Utiliser la méthode du model
    await teamMember.updateActivity();

    res.json({
      success: true,
      data: teamMember
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/team/:id/stats
 * Incrémenter une statistique
 */
export const incrementStat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stat, value = 1 } = req.body;
    const { companyId } = req.user;

    if (!stat) {
      throw new AppError('Le nom de la statistique est requis', 400);
    }

    const validStats = [
      'candidatesAdded',
      'missionsCreated',
      'placements',
      'revenue',
      'callsMade',
      'emailsSent'
    ];

    if (!validStats.includes(stat)) {
      throw new AppError('Statistique invalide', 400);
    }

    const teamMember = await TeamMember.findOne({ _id: id, companyId });

    if (!teamMember) {
      throw new AppError('Membre de l\'équipe non trouvé', 404);
    }

    // Utiliser la méthode du model
    await teamMember.incrementStat(stat, value);

    res.json({
      success: true,
      data: teamMember,
      message: 'Statistique mise à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/team/:id/performance
 * Récupérer les performances d'un membre
 */
export const getPerformance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const teamMember = await TeamMember.findOne({ _id: id, companyId })
      .select('firstName lastName role stats performance')
      .lean();

    if (!teamMember) {
      throw new AppError('Membre de l\'équipe non trouvé', 404);
    }

    // Calculer taux de réussite
    const successRate = teamMember.stats?.placements && teamMember.stats?.missionsCreated
      ? ((teamMember.stats.placements / teamMember.stats.missionsCreated) * 100).toFixed(2)
      : 0;

    // Calculer progression mensuelle
    const monthlyProgress = teamMember.performance?.monthlyGoal > 0
      ? ((teamMember.performance.monthlyAchieved / teamMember.performance.monthlyGoal) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        ...teamMember,
        successRate: parseFloat(successRate),
        monthlyProgress: parseFloat(monthlyProgress)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/team/:id/reset-monthly
 * Réinitialiser les performances mensuelles
 */
export const resetMonthlyPerformance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const teamMember = await TeamMember.findOne({ _id: id, companyId });

    if (!teamMember) {
      throw new AppError('Membre de l\'équipe non trouvé', 404);
    }

    // Utiliser la méthode du model
    await teamMember.calculateMonthlyPerformance();

    res.json({
      success: true,
      data: teamMember,
      message: 'Performances mensuelles réinitialisées'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/team/stats
 * Statistiques équipe pour dashboard
 */
export const getTeamStats = async (req, res, next) => {
  try {
    const { companyId } = req.user;

    const stats = await TeamMember.aggregate([
      { $match: { companyId, active: true } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await TeamMember.countDocuments({ companyId, active: true });
    const admins = await TeamMember.countDocuments({ companyId, active: true, role: 'Admin' });
    const recruiters = await TeamMember.countDocuments({ companyId, active: true, role: 'Recruteur' });

    // Performance globale
    const teamPerformance = await TeamMember.aggregate([
      { $match: { companyId, active: true } },
      {
        $group: {
          _id: null,
          totalPlacements: { $sum: '$stats.placements' },
          totalRevenue: { $sum: '$stats.revenue' },
          totalCandidates: { $sum: '$stats.candidatesAdded' },
          totalMissions: { $sum: '$stats.missionsCreated' }
        }
      }
    ]);

    // Top performers
    const topPerformers = await TeamMember.find({ companyId, active: true })
      .sort({ 'stats.placements': -1 })
      .limit(5)
      .select('firstName lastName role stats.placements stats.revenue')
      .lean();

    res.json({
      success: true,
      data: {
        total,
        admins,
        recruiters,
        byRole: stats,
        performance: teamPerformance[0] || {
          totalPlacements: 0,
          totalRevenue: 0,
          totalCandidates: 0,
          totalMissions: 0
        },
        topPerformers
      }
    });
  } catch (error) {
    next(error);
  }
};

// Export default pour compatibilité
export default {
  getAllTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  updatePermissions,
  recordActivity,
  incrementStat,
  getPerformance,
  resetMonthlyPerformance,
  getTeamStats
};
