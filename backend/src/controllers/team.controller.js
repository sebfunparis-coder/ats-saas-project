/**
 * 👥 Team Controller
 *
 * Gère les membres de l'équipe : CRUD, permissions, stats, performance
 */

import crypto from 'crypto';
import TeamMember from '../models/Team.model.js';
import User from '../models/User.model.js';
import Company from '../models/Company.model.js';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';
import { successResponse, createdResponse, paginationMeta } from '../utils/response.js';
import { triggerWebhookEvent } from '../services/webhook.service.js';
import logger from '../utils/logger.js';

// T-376 : génère un mot de passe temporaire aléatoire (au lieu du littéral
// 'TempPassword123!' identique pour tous les comptes sur toutes les
// companies) — 16 caractères hex, largement au-dessus des exigences de
// complexité habituelles.
function generateTempPassword() {
  return crypto.randomBytes(12).toString('hex');
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
    const safeLimit = Math.min(parseInt(limit) || 20, 100);
    const safeSkip = parseInt(skip) || 0;

    const filter = { companyId };

    if (role) filter.role = role;
    if (active !== undefined) filter.active = active === 'true';

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [teamMembers, total] = await Promise.all([
      TeamMember.find(filter)
        .sort(sort)
        .limit(safeLimit)
        .skip(safeSkip)
        .populate('userId', 'email avatar isActive lastLogin')
        .lean(),
      TeamMember.countDocuments(filter)
    ]);

    successResponse(res, teamMembers, '', paginationMeta(total, Math.floor(safeSkip / safeLimit) + 1, safeLimit));
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

    // T-335 : Company.canAddUser() existait déjà sur le modèle mais n'était
    // jamais appelé.
    const company = await Company.findById(companyId);
    if (company && !company.canAddUser()) {
      throw new AppError('Limite d\'utilisateurs atteinte pour votre plan', 403);
    }

    // T-376 : mot de passe temporaire aléatoire (au lieu d'un littéral
    // identique pour tous les comptes) + mustChangePassword pour forcer son
    // remplacement à la première connexion.
    const temporaryPassword = generateTempPassword();
    const user = await User.create({
      email,
      password: temporaryPassword,
      firstName,
      lastName,
      companyId,
      role: role === 'Admin' ? 'admin' : 'user',
      mustChangePassword: true,
    });

    // canAddUser() compte sur company.userIds — le tenir à jour ici (comme le
    // fait déjà auth.controller.js pour l'inscription).
    if (company) {
      company.userIds.push(user._id);
      await company.save();
    }

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

    triggerWebhookEvent(companyId, 'team.member_added', {
      teamMemberId: teamMember._id,
      firstName,
      lastName,
      email,
      role,
    }).catch(err => logger.warn('Webhook team.member_added failed', { error: err.message }));

    // T-376 : plus aucun email n'est réellement envoyé depuis ce backend
    // (hors de portée de cet environnement) — le message ne doit donc plus
    // le prétendre. Le mot de passe temporaire généré est renvoyé une seule
    // fois dans cette réponse, à communiquer manuellement au nouveau membre.
    res.status(201).json({
      success: true,
      data: { ...teamMember.toObject(), temporaryPassword },
      message: 'Membre de l\'équipe créé avec succès. Communiquez-lui ce mot de passe temporaire — il devra le changer à sa première connexion.'
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

    triggerWebhookEvent(companyId, 'team.member_removed', {
      teamMemberId: teamMember._id,
      email: teamMember.email,
    }).catch(err => logger.warn('Webhook team.member_removed failed', { error: err.message }));

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
    const { companyId, id: userId, role } = req.user;

    const teamMember = await TeamMember.findOne({ _id: id, companyId });

    if (!teamMember) {
      throw new AppError('Membre de l\'équipe non trouvé', 404);
    }

    // T-399 : aucune restriction n'existait — n'importe quel utilisateur
    // authentifié de la company pouvait modifier l'activité/les stats de
    // n'importe quel collègue. Autorisé pour admin/manager (pilotage
    // d'équipe) ou pour l'intéressé lui-même (cas d'usage réel documenté :
    // "appelé automatiquement lors d'actions", donc par l'utilisateur qui
    // vient d'agir sur son propre compte).
    const isSelf = teamMember.userId && String(teamMember.userId) === String(userId);
    if (!isSelf && !['admin', 'manager', 'superadmin'].includes(role)) {
      throw new AppError('Droits insuffisants pour modifier l\'activité de ce membre', 403);
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
    const { companyId, id: userId, role } = req.user;

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

    // T-399 : mêmes droits que recordActivity — sans ce garde, n'importe quel
    // utilisateur authentifié de la company pouvait gonfler/dégonfler les
    // statistiques (placements, revenue...) de n'importe quel collègue,
    // des chiffres qui alimentent potentiellement des évaluations de perf.
    const isSelf = teamMember.userId && String(teamMember.userId) === String(userId);
    if (!isSelf && !['admin', 'manager', 'superadmin'].includes(role)) {
      throw new AppError('Droits insuffisants pour modifier les statistiques de ce membre', 403);
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
