/**
 * 💼 Mission Controller
 *
 * Gère les missions (offres d'emploi) : CRUD, publish, close, applications
 */

import Mission from '../models/Mission.model.js';
import Candidate from '../models/Candidate.model.js';
import User from '../models/User.model.js';
import Company from '../models/Company.model.js';
import { broadcast } from '../utils/sseManager.js';
import Application from '../models/Application.model.js';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';
import { successResponse, createdResponse, paginationMeta } from '../utils/response.js';
import { sendEmail } from '../services/email.service.js';
import { triggerWebhookEvent } from '../services/webhook.service.js';
import logger from '../utils/logger.js';

const APPROVERS_ROLES = ['admin', 'superadmin', 'manager'];

// ===== CONTROLLERS =====

/**
 * GET /api/missions
 * Liste toutes les missions (avec pagination, filtres, recherche)
 */
export const getAllMissions = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const {
      status,
      contract,
      remote,
      department,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 50,
      skip = 0
    } = req.query;
    const safeLimit = Math.min(parseInt(limit) || 20, 100);
    const safeSkip = parseInt(skip) || 0;

    // Construire le filtre
    const filter = { companyId };

    if (status) {
      filter.status = status;
    }

    if (contract) {
      filter.contract = contract;
    }

    if (remote) {
      filter.remote = remote;
    }

    if (department) {
      filter.department = department;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [missions, total] = await Promise.all([
      Mission.find(filter)
        .sort(sort)
        .limit(safeLimit)
        .skip(safeSkip)
        .populate('createdBy', 'firstName lastName email')
        .lean(),
      Mission.countDocuments(filter)
    ]);

    successResponse(res, missions, '', paginationMeta(total, Math.floor(safeSkip / safeLimit) + 1, safeLimit));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/missions/:id
 * Récupérer une mission par ID
 */
export const getMissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const mission = await Mission.findOne({ _id: id, companyId })
      .populate('createdBy', 'firstName lastName email avatar')
      .populate({
        path: 'candidateIds',
        select: 'firstName lastName email position status rating',
        options: { limit: 20 }
      })
      .lean();

    if (!mission) {
      throw new AppError('Mission non trouvée', 404);
    }

    res.json({
      success: true,
      data: mission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/missions
 * Créer une nouvelle mission
 */
export const createMission = async (req, res, next) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { companyId, id: userId } = req.user;

    // T-335 : Company.canAddMission() existait déjà sur le modèle mais
    // n'était jamais appelé.
    const company = await Company.findById(companyId);
    if (company && !(await company.canAddMission())) {
      throw new AppError('Limite de missions atteinte pour votre plan', 403);
    }

    const role = req.user.role;
    // Recruiters must go through approval; admins/managers/superadmins can set status freely
    const defaultStatus = APPROVERS_ROLES.includes(role) ? (req.body.status || 'draft') : 'pending_approval';

    const missionData = {
      ...req.body,
      companyId,
      createdBy: userId,
      status: defaultStatus,
    };

    // Log initial submission in history if recruiter
    if (!APPROVERS_ROLES.includes(role)) {
      const creator = await User.findById(userId).select('firstName lastName').lean();
      missionData.approvalHistory = [{
        action: 'submitted',
        by: userId,
        byName: creator ? `${creator.firstName} ${creator.lastName}` : 'Recruteur',
        at: new Date(),
      }];
    }

    const mission = await Mission.create(missionData);

    triggerWebhookEvent(companyId, 'mission.created', {
      missionId: mission._id,
      title: mission.title,
      status: mission.status,
    }).catch(err => logger.warn('Webhook mission.created failed', { error: err.message }));

    // Notify approvers asynchronously (non-blocking)
    if (mission.status === 'pending_approval') {
      User.find({ companyId, role: { $in: APPROVERS_ROLES } }).select('email firstName').lean()
        .then(approvers => {
          const approverEmails = approvers.map(a => a.email).filter(Boolean);
          if (approverEmails.length) {
            const subject = `[ATS] Nouvelle offre à valider : ${mission.title}`;
            const html = `<p>Bonjour,</p><p>Le recruteur a soumis une nouvelle offre <strong>${mission.title}</strong> en attente de votre validation.</p><p>Connectez-vous à l'ATS pour approuver ou rejeter cette offre.</p>`;
            approverEmails.forEach(email => sendEmail(email, subject, html).catch(() => {}));
          }
        })
        .catch(() => {});
    }

    res.status(201).json({
      success: true,
      data: mission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/missions/:id
 * Mettre à jour une mission
 */
export const updateMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Trouver la mission
    const mission = await Mission.findOne({ _id: id, companyId });

    if (!mission) {
      throw new AppError('Mission non trouvée', 404);
    }

    // Champs autorisés à la modification
    const allowedFields = [
      'title',
      'description',
      'department',
      'location',
      'contract',
      'remote',
      'salary',
      'skills',
      'requirements',
      'benefits',
      'status'
    ];

    // Mettre à jour uniquement les champs autorisés
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        mission[field] = req.body[field];
      }
    });

    await mission.save();

    broadcast(companyId, 'mission:updated', { mission });

    res.json({
      success: true,
      data: mission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/missions/:id
 * Supprimer une mission
 */
export const deleteMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const mission = await Mission.findOne({ _id: id, companyId });

    if (!mission) {
      throw new AppError('Mission non trouvée', 404);
    }

    // Vérifier si des candidatures existent
    const applicationCount = await Application.countDocuments({ missionId: id });

    if (applicationCount > 0) {
      throw new AppError(
        `Impossible de supprimer cette mission car ${applicationCount} candidature(s) y sont associées`,
        400
      );
    }

    mission.isDeleted = true;
    mission.deletedAt = new Date();
    await mission.save();

    res.json({
      success: true,
      message: 'Mission supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/missions/:id/publish
 * Publier une mission (passer de draft à active)
 */
export const publishMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const mission = await Mission.findOne({ _id: id, companyId });

    if (!mission) {
      throw new AppError('Mission non trouvée', 404);
    }

    if (!['draft', 'pending_approval'].includes(mission.status)) {
      throw new AppError('Seules les missions en brouillon ou en attente de validation peuvent être publiées', 400);
    }

    // Utiliser la méthode du model
    await mission.publish();

    triggerWebhookEvent(companyId, 'mission.published', {
      missionId: mission._id,
      title: mission.title,
    }).catch(err => logger.warn('Webhook mission.published failed', { error: err.message }));

    res.json({
      success: true,
      data: mission,
      message: 'Mission publiée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/missions/:id/close
 * Fermer une mission
 */
export const closeMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const mission = await Mission.findOne({ _id: id, companyId });

    if (!mission) {
      throw new AppError('Mission non trouvée', 404);
    }

    if (mission.status === 'closed') {
      throw new AppError('Cette mission est déjà fermée', 400);
    }

    // Utiliser la méthode du model
    await mission.close();

    triggerWebhookEvent(companyId, 'mission.closed', {
      missionId: mission._id,
      title: mission.title,
    }).catch(err => logger.warn('Webhook mission.closed failed', { error: err.message }));

    res.json({
      success: true,
      data: mission,
      message: 'Mission fermée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/missions/:id/pause
 * Mettre en pause une mission
 */
export const pauseMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const mission = await Mission.findOne({ _id: id, companyId });

    if (!mission) {
      throw new AppError('Mission non trouvée', 404);
    }

    if (mission.status !== 'active') {
      throw new AppError('Seules les missions actives peuvent être mises en pause', 400);
    }

    mission.status = 'paused';
    await mission.save();

    res.json({
      success: true,
      data: mission,
      message: 'Mission mise en pause'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/missions/:id/resume
 * Reprendre une mission en pause
 */
export const resumeMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const mission = await Mission.findOne({ _id: id, companyId });

    if (!mission) {
      throw new AppError('Mission non trouvée', 404);
    }

    if (mission.status !== 'paused') {
      throw new AppError('Seules les missions en pause peuvent être reprises', 400);
    }

    mission.status = 'active';
    await mission.save();

    res.json({
      success: true,
      data: mission,
      message: 'Mission reprise'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/missions/:id/applications
 * Récupérer toutes les candidatures d'une mission
 */
export const getMissionApplications = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    const { status, limit = 50, skip = 0 } = req.query;
    const safeLimit = Math.min(parseInt(limit) || 20, 100);
    const safeSkip = parseInt(skip) || 0;

    const mission = await Mission.findOne({ _id: id, companyId }).lean();

    if (!mission) {
      throw new AppError('Mission non trouvée', 404);
    }

    const filter = { missionId: id, companyId };

    if (status) {
      filter.status = status;
    }

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort({ appliedAt: -1 })
        .limit(safeLimit)
        .skip(safeSkip)
        .populate('candidateId', 'firstName lastName email position status rating')
        .populate('createdBy', 'firstName lastName')
        .lean(),
      Application.countDocuments(filter)
    ]);

    successResponse(res, applications, '', paginationMeta(total, Math.floor(safeSkip / safeLimit) + 1, safeLimit));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/missions/stats
 * Statistiques missions pour dashboard
 */
export const getMissionStats = async (req, res, next) => {
  try {
    const { companyId } = req.user;

    const stats = await Mission.aggregate([
      { $match: { companyId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Mission.countDocuments({ companyId });
    const active = await Mission.countDocuments({ companyId, status: 'active' });
    const draft = await Mission.countDocuments({ companyId, status: 'draft' });
    const closed = await Mission.countDocuments({ companyId, status: 'closed' });

    // Missions créées ce mois
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const thisMonth = await Mission.countDocuments({
      companyId,
      createdAt: { $gte: startOfMonth }
    });

    res.json({
      success: true,
      data: {
        total,
        active,
        draft,
        closed,
        thisMonth,
        byStatus: stats
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/missions/:id/restore
 * Restaurer une mission soft-deleted (admin uniquement)
 */
export const restoreMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const result = await Mission.updateOne(
      { _id: id, companyId, isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null } }
    );

    if (result.matchedCount === 0) {
      throw new AppError('Mission supprimée non trouvée', 404);
    }

    res.json({ success: true, message: 'Mission restaurée avec succès' });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/missions/:id/purge
 * Suppression définitive (conformité RGPD)
 */
export const purgeMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const result = await Mission.deleteOne({ _id: id, companyId, isDeleted: true });

    if (result.deletedCount === 0) {
      throw new AppError('Mission supprimée non trouvée', 404);
    }

    res.json({ success: true, message: 'Mission supprimée définitivement' });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/missions/bulk
 * Soft-delete plusieurs missions en une requête
 */
export const bulkDeleteMissions = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('ids doit être un tableau non vide', 400);
    }

    const result = await Mission.updateMany(
      { _id: { $in: ids }, companyId },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    res.json({ success: true, deleted: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/missions/bulk/status
 * Met à jour le statut de plusieurs missions en une requête
 */
export const bulkUpdateMissionsStatus = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('ids doit être un tableau non vide', 400);
    }
    if (!status) {
      throw new AppError('status est requis', 400);
    }

    // T-374 : runValidators absent laissait passer n'importe quelle valeur de
    // `status`, y compris hors de l'enum Mongoose (draft|pending_approval|
    // active|paused|closed) — la route est aussi restreinte aux rôles
    // admin/manager/superadmin désormais (mission.routes.js).
    const result = await Mission.updateMany(
      { _id: { $in: ids }, companyId },
      { $set: { status } },
      { runValidators: true }
    );

    res.json({ success: true, updated: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/missions/:id/request-approval
 * Recruiter soumet une mission draft pour validation
 */
export const requestApproval = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId, id: userId, role } = req.user;

    const mission = await Mission.findOne({ _id: id, companyId });
    if (!mission) throw new AppError('Mission non trouvée', 404);

    if (mission.status !== 'draft') {
      throw new AppError('Seules les missions en brouillon peuvent être soumises à validation', 400);
    }

    const actor = await User.findById(userId).select('firstName lastName email').lean();
    const byName = actor ? `${actor.firstName} ${actor.lastName}` : 'Recruteur';

    mission.status = 'pending_approval';
    mission.approvalHistory.push({ action: 'submitted', by: userId, byName, at: new Date() });
    await mission.save();

    broadcast(companyId, 'mission:approval_requested', { missionId: mission._id, title: mission.title });

    // Notifier les approbateurs
    User.find({ companyId, role: { $in: APPROVERS_ROLES } }).select('email').lean()
      .then(approvers => {
        const subject = `[ATS] Offre à valider : ${mission.title}`;
        const html = `<p><strong>${byName}</strong> a soumis l'offre <strong>${mission.title}</strong> pour validation. Connectez-vous à l'ATS pour approuver ou rejeter.</p>`;
        approvers.forEach(a => sendEmail(a.email, subject, html).catch(() => {}));
      })
      .catch(() => {});

    res.json({ success: true, data: mission, message: 'Mission soumise pour validation' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/missions/:id/approve
 * Manager/admin approuve une mission en attente
 */
export const approveMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId, id: userId, role } = req.user;

    if (!APPROVERS_ROLES.includes(role)) {
      throw new AppError('Droits insuffisants pour approuver une mission', 403);
    }

    const mission = await Mission.findOne({ _id: id, companyId });
    if (!mission) throw new AppError('Mission non trouvée', 404);

    if (mission.status !== 'pending_approval') {
      throw new AppError('Seules les missions en attente de validation peuvent être approuvées', 400);
    }

    const actor = await User.findById(userId).select('firstName lastName email').lean();
    const byName = actor ? `${actor.firstName} ${actor.lastName}` : 'Approbateur';

    mission.status = 'active';
    if (!mission.publishedAt) mission.publishedAt = new Date();
    mission.approvalHistory.push({ action: 'approved', by: userId, byName, at: new Date(), comment: req.body.comment || '' });
    await mission.save();

    broadcast(companyId, 'mission:approved', { missionId: mission._id, title: mission.title });
    triggerWebhookEvent(companyId, 'mission.approved', {
      missionId: mission._id,
      title: mission.title,
      approvedBy: byName,
    }).catch(err => logger.warn('Webhook mission.approved failed', { error: err.message }));

    // Notifier le créateur
    if (mission.createdBy) {
      User.findById(mission.createdBy).select('email').lean()
        .then(creator => {
          if (creator?.email) {
            const subject = `[ATS] Votre offre "${mission.title}" a été approuvée`;
            const html = `<p>Bonne nouvelle ! Votre offre <strong>${mission.title}</strong> a été approuvée par <strong>${byName}</strong> et est maintenant active.</p>`;
            sendEmail(creator.email, subject, html).catch(() => {});
          }
        })
        .catch(() => {});
    }

    res.json({ success: true, data: mission, message: 'Mission approuvée et publiée' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/missions/:id/reject
 * Manager/admin rejette une mission en attente avec commentaire
 */
export const rejectMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId, id: userId, role } = req.user;

    if (!APPROVERS_ROLES.includes(role)) {
      throw new AppError('Droits insuffisants pour rejeter une mission', 403);
    }

    const { comment } = req.body;
    if (!comment?.trim()) throw new AppError('Un commentaire est requis pour le rejet', 400);

    const mission = await Mission.findOne({ _id: id, companyId });
    if (!mission) throw new AppError('Mission non trouvée', 404);

    if (mission.status !== 'pending_approval') {
      throw new AppError('Seules les missions en attente de validation peuvent être rejetées', 400);
    }

    const actor = await User.findById(userId).select('firstName lastName email').lean();
    const byName = actor ? `${actor.firstName} ${actor.lastName}` : 'Approbateur';

    mission.status = 'draft';
    mission.approvalHistory.push({ action: 'rejected', by: userId, byName, at: new Date(), comment: comment.trim() });
    await mission.save();

    broadcast(companyId, 'mission:rejected', { missionId: mission._id, title: mission.title });

    // Notifier le créateur
    if (mission.createdBy) {
      User.findById(mission.createdBy).select('email').lean()
        .then(creator => {
          if (creator?.email) {
            const subject = `[ATS] Votre offre "${mission.title}" nécessite des modifications`;
            const html = `<p>Votre offre <strong>${mission.title}</strong> a été retournée par <strong>${byName}</strong>.</p><p><strong>Commentaire :</strong> ${comment}</p><p>Veuillez corriger et soumettre à nouveau.</p>`;
            sendEmail(creator.email, subject, html).catch(() => {});
          }
        })
        .catch(() => {});
    }

    res.json({ success: true, data: mission, message: 'Mission retournée pour correction' });
  } catch (error) {
    next(error);
  }
};

// Export default pour compatibilité
export default {
  getAllMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission,
  restoreMission,
  purgeMission,
  publishMission,
  closeMission,
  pauseMission,
  resumeMission,
  getMissionApplications,
  getMissionStats,
  bulkDeleteMissions,
  bulkUpdateMissionsStatus,
  requestApproval,
  approveMission,
  rejectMission,
};
