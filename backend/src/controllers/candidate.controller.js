/**
 * 📄 Candidate Controller
 *
 * Gère les candidats (CVthèque) : CRUD, status, rating, applications
 */

import Candidate from '../models/Candidate.model.js';
import Application from '../models/Application.model.js';
import Company from '../models/Company.model.js';
import { broadcast } from '../utils/sseManager.js';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';
import { successResponse, createdResponse, paginationMeta } from '../utils/response.js';
import { escapeRegExp } from '../utils/regexHelpers.js';
import { triggerWebhookEvent } from '../services/webhook.service.js';
import logger from '../utils/logger.js';

// ===== CONTROLLERS =====

/**
 * GET /api/candidates
 * Liste tous les candidats (avec pagination, filtres, recherche)
 */
export const getAllCandidates = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const {
      status,
      experienceLevel,
      skills,
      position,
      location,
      availability,
      rating,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 50,
      skip = 0
    } = req.query;
    const safeLimit = Math.min(parseInt(limit) || 20, 100);
    const safeSkip = parseInt(skip) || 0;

    const filter = { companyId };

    if (status) filter.status = status;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      filter.skills = { $in: skillsArray };
    }
    // T-366 : échapper les métacaractères regex avant new RegExp() — un pattern
    // à backtracking catastrophique dans un paramètre de requête pouvait sinon
    // bloquer un thread MongoDB de façon disproportionnée (ReDoS).
    if (position) filter.position = new RegExp(escapeRegExp(position), 'i');
    if (location) filter.location = new RegExp(escapeRegExp(location), 'i');
    if (availability) filter.availability = availability;
    if (rating) filter.rating = { $gte: parseInt(rating) };
    if (search) filter.$text = { $search: search };

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [candidates, total] = await Promise.all([
      Candidate.find(filter)
        .sort(sort)
        .limit(safeLimit)
        .skip(safeSkip)
        .populate('createdBy', 'firstName lastName email')
        .lean(),
      Candidate.countDocuments(filter)
    ]);

    successResponse(res, candidates, '', paginationMeta(total, Math.floor(safeSkip / safeLimit) + 1, safeLimit));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/candidates/:id
 * Récupérer un candidat par ID
 */
export const getCandidateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const candidate = await Candidate.findOne({ _id: id, companyId })
      .populate('createdBy', 'firstName lastName email avatar')
      .populate({
        path: 'applicationIds',
        select: 'missionId missionTitle status appliedAt',
        populate: {
          path: 'missionId',
          select: 'title company status'
        }
      })
      .lean();

    if (!candidate) {
      throw new AppError('Candidat non trouvé', 404);
    }

    res.json({
      success: true,
      data: candidate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/candidates
 * Créer un nouveau candidat
 */
export const createCandidate = async (req, res, next) => {
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

    // Vérifier si email existe déjà pour cette company
    const existingCandidate = await Candidate.findOne({
      companyId,
      email: req.body.email
    });

    if (existingCandidate) {
      throw new AppError('Un candidat avec cet email existe déjà', 400);
    }

    // T-335 : Company.canAddCandidate() existait déjà sur le modèle mais
    // n'était jamais appelé — une company pouvait dépasser sa limite
    // contractuelle de candidats sans aucun blocage serveur.
    const company = await Company.findById(companyId);
    if (company && !(await company.canAddCandidate())) {
      throw new AppError('Limite de candidats atteinte pour votre plan', 403);
    }

    const candidateData = {
      ...req.body,
      companyId,
      createdBy: userId
    };

    const candidate = await Candidate.create(candidateData);

    broadcast(companyId, 'candidate:created', { candidate });
    triggerWebhookEvent(companyId, 'candidate.created', {
      candidateId: candidate._id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
    }).catch(err => logger.warn('Webhook candidate.created failed', { error: err.message }));

    res.status(201).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/candidates/:id
 * Mettre à jour un candidat
 */
export const updateCandidate = async (req, res, next) => {
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

    // Trouver le candidat
    const candidate = await Candidate.findOne({ _id: id, companyId });

    if (!candidate) {
      throw new AppError('Candidat non trouvé', 404);
    }

    // Si email modifié, vérifier unicité
    if (req.body.email && req.body.email !== candidate.email) {
      const existingCandidate = await Candidate.findOne({
        companyId,
        email: req.body.email,
        _id: { $ne: id }
      });

      if (existingCandidate) {
        throw new AppError('Un candidat avec cet email existe déjà', 400);
      }
    }

    // Champs autorisés à la modification
    const allowedFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'location',
      'country',
      'position',
      'experience',
      'experienceLevel',
      'salary',
      'skills',
      'languages',
      'cvUrl',
      'cvFilename',
      'linkedinUrl',
      'portfolioUrl',
      'status',
      'availability',
      'preferences',
      'tags',
      'notes',
      'rating',
      'source'
    ];

    // Mettre à jour uniquement les champs autorisés
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        candidate[field] = req.body[field];
      }
    });

    await candidate.save();

    triggerWebhookEvent(companyId, 'candidate.updated', {
      candidateId: candidate._id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      status: candidate.status,
    }).catch(err => logger.warn('Webhook candidate.updated failed', { error: err.message }));

    res.json({
      success: true,
      data: candidate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/candidates/:id
 * Supprimer un candidat
 */
export const deleteCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const candidate = await Candidate.findOne({ _id: id, companyId });

    if (!candidate) {
      throw new AppError('Candidat non trouvé', 404);
    }

    // Vérifier si des candidatures existent
    const applicationCount = await Application.countDocuments({ candidateId: id });

    if (applicationCount > 0) {
      throw new AppError(
        `Impossible de supprimer ce candidat car ${applicationCount} candidature(s) y sont associées`,
        400
      );
    }

    candidate.isDeleted = true;
    candidate.deletedAt = new Date();
    await candidate.save();

    triggerWebhookEvent(companyId, 'candidate.deleted', {
      candidateId: candidate._id,
      email: candidate.email,
    }).catch(err => logger.warn('Webhook candidate.deleted failed', { error: err.message }));

    res.json({
      success: true,
      message: 'Candidat supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/candidates/:id/status
 * Mettre à jour le statut d'un candidat
 */
export const updateCandidateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { companyId } = req.user;

    if (!status) {
      throw new AppError('Le statut est requis', 400);
    }

    const validStatuses = ['new', 'contacted', 'qualified', 'interview', 'offer', 'hired', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Statut invalide', 400);
    }

    const candidate = await Candidate.findOne({ _id: id, companyId });

    if (!candidate) {
      throw new AppError('Candidat non trouvé', 404);
    }

    // Utiliser la méthode du model
    await candidate.updateStatus(status);

    res.json({
      success: true,
      data: candidate,
      message: 'Statut mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/candidates/:id/rating
 * Noter un candidat (0-5 étoiles)
 */
export const rateCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const { companyId } = req.user;

    if (rating === undefined || rating === null) {
      throw new AppError('La note est requise', 400);
    }

    if (rating < 0 || rating > 5) {
      throw new AppError('La note doit être entre 0 et 5', 400);
    }

    const candidate = await Candidate.findOne({ _id: id, companyId });

    if (!candidate) {
      throw new AppError('Candidat non trouvé', 404);
    }

    // Utiliser la méthode du model
    await candidate.rate(rating);

    res.json({
      success: true,
      data: candidate,
      message: 'Note mise à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/candidates/:id/applications
 * Récupérer toutes les candidatures d'un candidat
 */
export const getCandidateApplications = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    const { status, limit = 50, skip = 0 } = req.query;
    const safeLimit = Math.min(parseInt(limit) || 20, 100);
    const safeSkip = parseInt(skip) || 0;

    const candidate = await Candidate.findOne({ _id: id, companyId }).lean();

    if (!candidate) {
      throw new AppError('Candidat non trouvé', 404);
    }

    const filter = { candidateId: id, companyId };
    if (status) filter.status = status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort({ appliedAt: -1 })
        .limit(safeLimit)
        .skip(safeSkip)
        .populate('missionId', 'title company status contract location')
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
 * GET /api/candidates/stats
 * Statistiques candidats pour dashboard
 */
export const getCandidateStats = async (req, res, next) => {
  try {
    const { companyId } = req.user;

    const stats = await Candidate.aggregate([
      { $match: { companyId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Candidate.countDocuments({ companyId });
    const newCandidates = await Candidate.countDocuments({ companyId, status: 'new' });
    const qualified = await Candidate.countDocuments({ companyId, status: 'qualified' });
    const hired = await Candidate.countDocuments({ companyId, status: 'hired' });

    // Candidats ajoutés ce mois
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const thisMonth = await Candidate.countDocuments({
      companyId,
      createdAt: { $gte: startOfMonth }
    });

    // Top skills
    const topSkills = await Candidate.aggregate([
      { $match: { companyId } },
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        total,
        new: newCandidates,
        qualified,
        hired,
        thisMonth,
        byStatus: stats,
        topSkills
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/candidates/import
 * Importer plusieurs candidats (CSV/JSON)
 */
export const importCandidates = async (req, res, next) => {
  try {
    const { candidates } = req.body;
    const { companyId, id: userId } = req.user;

    if (!Array.isArray(candidates) || candidates.length === 0) {
      throw new AppError('Le tableau de candidats est requis', 400);
    }

    const created = [];
    const errors = [];

    for (const candidateData of candidates) {
      try {
        // Vérifier si email existe
        const existingCandidate = await Candidate.findOne({
          companyId,
          email: candidateData.email
        });

        if (existingCandidate) {
          errors.push({
            email: candidateData.email,
            error: 'Email déjà existant'
          });
          continue;
        }

        const candidate = await Candidate.create({
          ...candidateData,
          companyId,
          createdBy: userId
        });

        created.push(candidate);
      } catch (error) {
        errors.push({
          email: candidateData.email,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      data: {
        created: created.length,
        errors: errors.length,
        candidates: created,
        errorDetails: errors
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/candidates/:id/restore
 */
export const restoreCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const result = await Candidate.updateOne(
      { _id: id, companyId, isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null } }
    );

    if (result.matchedCount === 0) {
      throw new AppError('Candidat supprimé non trouvé', 404);
    }

    res.json({ success: true, message: 'Candidat restauré avec succès' });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/candidates/:id/purge
 */
export const purgeCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const result = await Candidate.deleteOne({ _id: id, companyId, isDeleted: true });

    if (result.deletedCount === 0) {
      throw new AppError('Candidat supprimé non trouvé', 404);
    }

    res.json({ success: true, message: 'Candidat supprimé définitivement' });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/candidates/bulk
 * Soft-delete plusieurs candidats en une requête
 */
export const bulkDeleteCandidates = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('ids doit être un tableau non vide', 400);
    }

    const result = await Candidate.updateMany(
      { _id: { $in: ids }, companyId },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    res.json({ success: true, deleted: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/candidates/bulk/status
 * Met à jour le statut de plusieurs candidats en une requête
 */
export const bulkUpdateCandidatesStatus = async (req, res, next) => {
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
    // `status`, hors de l'enum Mongoose — route désormais aussi restreinte
    // aux rôles admin/manager/superadmin (candidate.routes.js).
    const result = await Candidate.updateMany(
      { _id: { $in: ids }, companyId },
      { $set: { status } },
      { runValidators: true }
    );

    res.json({ success: true, updated: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};

// Export default pour compatibilité
export default {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  restoreCandidate,
  purgeCandidate,
  updateCandidateStatus,
  rateCandidate,
  getCandidateApplications,
  getCandidateStats,
  importCandidates,
  bulkDeleteCandidates,
  bulkUpdateCandidatesStatus
};
