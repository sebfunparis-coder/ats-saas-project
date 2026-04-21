/**
 * 💼 Mission Controller
 *
 * Gère les missions (offres d'emploi) : CRUD, publish, close, applications
 */

import Mission from '../models/Mission.model.js';
import Candidate from '../models/Candidate.model.js';
import Application from '../models/Application.model.js';
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

    // Recherche texte (full-text search)
    if (search) {
      filter.$text = { $search: search };
    }

    // Construire le tri
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Exécuter la requête
    const missions = await Mission.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('createdBy', 'firstName lastName email')
      .lean();

    // Compter le total
    const total = await Mission.countDocuments(filter);

    res.json({
      success: true,
      data: missions,
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

    // Vérifier limites du plan (à implémenter avec Company.canAddMission())
    // const company = await Company.findById(companyId);
    // if (!company.canAddMission()) {
    //   throw new AppError('Limite de missions atteinte pour votre plan', 403);
    // }

    const missionData = {
      ...req.body,
      companyId,
      createdBy: userId,
      status: req.body.status || 'draft'
    };

    const mission = await Mission.create(missionData);

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

    await mission.deleteOne();

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

    if (mission.status !== 'draft') {
      throw new AppError('Seules les missions en brouillon peuvent être publiées', 400);
    }

    // Utiliser la méthode du model
    await mission.publish();

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

    // Vérifier que la mission existe et appartient à la company
    const mission = await Mission.findOne({ _id: id, companyId });

    if (!mission) {
      throw new AppError('Mission non trouvée', 404);
    }

    const filter = { missionId: id, companyId };

    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .sort({ appliedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('candidateId', 'firstName lastName email position status rating')
      .populate('createdBy', 'firstName lastName')
      .lean();

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      data: applications,
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

// Export default pour compatibilité
export default {
  getAllMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission,
  publishMission,
  closeMission,
  pauseMission,
  resumeMission,
  getMissionApplications,
  getMissionStats
};
