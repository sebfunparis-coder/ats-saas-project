/**
 * 📋 Application Controller
 *
 * Gère les candidatures : CRUD, pipeline kanban, interviews, hiring
 */

import Application from '../models/Application.model.js';
import Mission from '../models/Mission.model.js';
import Candidate from '../models/Candidate.model.js';
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
 * GET /api/applications
 * Liste toutes les candidatures (avec pagination, filtres)
 */
export const getAllApplications = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const {
      status,
      missionId,
      candidateId,
      sortBy = 'appliedAt',
      sortOrder = 'desc',
      limit = 50,
      skip = 0
    } = req.query;

    // Construire le filtre
    const filter = { companyId };

    if (status) {
      filter.status = status;
    }

    if (missionId) {
      filter.missionId = missionId;
    }

    if (candidateId) {
      filter.candidateId = candidateId;
    }

    // Construire le tri
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Exécuter la requête
    const applications = await Application.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('missionId', 'title company status contract location')
      .populate('candidateId', 'firstName lastName email position status rating cvUrl')
      .populate('createdBy', 'firstName lastName email')
      .lean();

    // Compter le total
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
 * GET /api/applications/:id
 * Récupérer une candidature par ID
 */
export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const application = await Application.findOne({ _id: id, companyId })
      .populate('missionId', 'title company department location contract salary')
      .populate('candidateId', 'firstName lastName email phone position experience skills languages cvUrl linkedinUrl')
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('updatedBy', 'firstName lastName email')
      .populate('interviews.interviewer', 'firstName lastName email')
      .lean();

    if (!application) {
      throw new AppError('Candidature non trouvée', 404);
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/applications
 * Créer une nouvelle candidature
 */
export const createApplication = async (req, res, next) => {
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
    const { missionId, candidateId, coverLetter, salaryExpectation, availableFrom } = req.body;

    // Vérifier que mission existe
    const mission = await Mission.findOne({ _id: missionId, companyId });
    if (!mission) {
      throw new AppError('Mission non trouvée', 404);
    }

    // Vérifier que candidat existe
    const candidate = await Candidate.findOne({ _id: candidateId, companyId });
    if (!candidate) {
      throw new AppError('Candidat non trouvé', 404);
    }

    // Vérifier que candidature n'existe pas déjà
    const existingApplication = await Application.findOne({ missionId, candidateId });
    if (existingApplication) {
      throw new AppError('Ce candidat a déjà postulé à cette mission', 400);
    }

    // Créer la candidature
    const applicationData = {
      missionId,
      candidateId,
      missionTitle: mission.title,
      candidateName: candidate.fullName,
      candidateEmail: candidate.email,
      coverLetter,
      salaryExpectation,
      availableFrom,
      companyId,
      createdBy: userId,
      status: 'applied'
    };

    const application = await Application.create(applicationData);

    // Ajouter la candidature aux relations
    await mission.addApplication(candidateId);
    await candidate.addApplication(application._id);

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/applications/:id
 * Mettre à jour une candidature
 */
export const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Trouver la candidature
    const application = await Application.findOne({ _id: id, companyId });

    if (!application) {
      throw new AppError('Candidature non trouvée', 404);
    }

    // Champs autorisés à la modification
    const allowedFields = [
      'coverLetter',
      'salaryExpectation',
      'availableFrom',
      'feedback',
      'notes'
    ];

    // Mettre à jour uniquement les champs autorisés
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        application[field] = req.body[field];
      }
    });

    application.updatedBy = userId;
    await application.save();

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/applications/:id
 * Supprimer une candidature
 */
export const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const application = await Application.findOne({ _id: id, companyId });

    if (!application) {
      throw new AppError('Candidature non trouvée', 404);
    }

    // Retirer des relations
    const mission = await Mission.findById(application.missionId);
    if (mission) {
      await mission.removeApplication(application.candidateId);
    }

    const candidate = await Candidate.findById(application.candidateId);
    if (candidate) {
      await candidate.removeApplication(id);
    }

    await application.deleteOne();

    res.json({
      success: true,
      message: 'Candidature supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/applications/:id/status
 * Mettre à jour le statut d'une candidature (PIPELINE KANBAN)
 */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { companyId, id: userId } = req.user;

    if (!status) {
      throw new AppError('Le statut est requis', 400);
    }

    const validStatuses = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Statut invalide', 400);
    }

    const application = await Application.findOne({ _id: id, companyId });

    if (!application) {
      throw new AppError('Candidature non trouvée', 404);
    }

    // Utiliser la méthode du model
    await application.updateStatus(status, userId);

    res.json({
      success: true,
      data: application,
      message: 'Statut mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/applications/:id/interview
 * Ajouter un entretien à une candidature
 */
export const addInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    const { type, scheduledAt, interviewer, notes } = req.body;

    // Validation
    if (!type || !scheduledAt) {
      throw new AppError('Type et date de l\'entretien sont requis', 400);
    }

    const validTypes = ['phone', 'video', 'onsite', 'technical'];
    if (!validTypes.includes(type)) {
      throw new AppError('Type d\'entretien invalide', 400);
    }

    const application = await Application.findOne({ _id: id, companyId });

    if (!application) {
      throw new AppError('Candidature non trouvée', 404);
    }

    const interviewData = {
      type,
      scheduledAt: new Date(scheduledAt),
      interviewer,
      notes,
      outcome: 'pending'
    };

    // Utiliser la méthode du model
    await application.addInterview(interviewData);

    res.status(201).json({
      success: true,
      data: application,
      message: 'Entretien ajouté avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/applications/:id/interview/:interviewId
 * Mettre à jour un entretien (compléter, noter)
 */
export const updateInterview = async (req, res, next) => {
  try {
    const { id, interviewId } = req.params;
    const { companyId } = req.user;
    const { completedAt, notes, rating, outcome } = req.body;

    const application = await Application.findOne({ _id: id, companyId });

    if (!application) {
      throw new AppError('Candidature non trouvée', 404);
    }

    const interview = application.interviews.id(interviewId);

    if (!interview) {
      throw new AppError('Entretien non trouvé', 404);
    }

    if (completedAt) interview.completedAt = new Date(completedAt);
    if (notes) interview.notes = notes;
    if (rating !== undefined) interview.rating = rating;
    if (outcome) interview.outcome = outcome;

    await application.save();

    res.json({
      success: true,
      data: application,
      message: 'Entretien mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/applications/:id/reject
 * Rejeter une candidature
 */
export const rejectApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const { companyId, id: userId } = req.user;

    const application = await Application.findOne({ _id: id, companyId });

    if (!application) {
      throw new AppError('Candidature non trouvée', 404);
    }

    if (application.status === 'rejected') {
      throw new AppError('Cette candidature est déjà rejetée', 400);
    }

    // Utiliser la méthode du model
    await application.reject(reason, userId);

    res.json({
      success: true,
      data: application,
      message: 'Candidature rejetée'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/applications/:id/hire
 * Embaucher un candidat
 */
export const hireCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;

    const application = await Application.findOne({ _id: id, companyId })
      .populate('candidateId');

    if (!application) {
      throw new AppError('Candidature non trouvée', 404);
    }

    if (application.status === 'hired') {
      throw new AppError('Ce candidat est déjà embauché', 400);
    }

    // Utiliser la méthode du model
    await application.hire(userId);

    // Mettre à jour le statut du candidat
    const candidate = await Candidate.findById(application.candidateId);
    if (candidate) {
      await candidate.updateStatus('hired');
    }

    res.json({
      success: true,
      data: application,
      message: 'Candidat embauché avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/applications/:id/offer
 * Faire une offre à un candidat
 */
export const makeOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;

    const application = await Application.findOne({ _id: id, companyId });

    if (!application) {
      throw new AppError('Candidature non trouvée', 404);
    }

    if (application.status === 'offer') {
      throw new AppError('Une offre a déjà été faite', 400);
    }

    // Utiliser la méthode du model
    await application.makeOffer(userId);

    // Mettre à jour le statut du candidat
    const candidate = await Candidate.findById(application.candidateId);
    if (candidate) {
      await candidate.updateStatus('offer');
    }

    res.json({
      success: true,
      data: application,
      message: 'Offre faite avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/applications/pipeline
 * Récupérer les candidatures groupées par statut (pour Kanban)
 */
export const getPipeline = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { missionId } = req.query;

    const filter = { companyId };

    if (missionId) {
      filter.missionId = missionId;
    }

    // Récupérer toutes les candidatures
    const applications = await Application.find(filter)
      .populate('candidateId', 'firstName lastName email position rating cvUrl')
      .populate('missionId', 'title company')
      .sort({ appliedAt: -1 })
      .lean();

    // Grouper par statut
    const pipeline = {
      applied: applications.filter(app => app.status === 'applied'),
      screening: applications.filter(app => app.status === 'screening'),
      interview: applications.filter(app => app.status === 'interview'),
      offer: applications.filter(app => app.status === 'offer'),
      hired: applications.filter(app => app.status === 'hired'),
      rejected: applications.filter(app => app.status === 'rejected')
    };

    // Statistiques
    const stats = {
      total: applications.length,
      applied: pipeline.applied.length,
      screening: pipeline.screening.length,
      interview: pipeline.interview.length,
      offer: pipeline.offer.length,
      hired: pipeline.hired.length,
      rejected: pipeline.rejected.length
    };

    res.json({
      success: true,
      data: {
        pipeline,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/applications/stats
 * Statistiques candidatures pour dashboard
 */
export const getApplicationStats = async (req, res, next) => {
  try {
    const { companyId } = req.user;

    const stats = await Application.aggregate([
      { $match: { companyId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Application.countDocuments({ companyId });
    const active = await Application.countDocuments({
      companyId,
      status: { $in: ['screening', 'interview', 'offer'] }
    });
    const hired = await Application.countDocuments({ companyId, status: 'hired' });
    const rejected = await Application.countDocuments({ companyId, status: 'rejected' });

    // Candidatures ce mois
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const thisMonth = await Application.countDocuments({
      companyId,
      appliedAt: { $gte: startOfMonth }
    });

    // Taux de conversion
    const conversionRate = total > 0 ? ((hired / total) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        total,
        active,
        hired,
        rejected,
        thisMonth,
        conversionRate,
        byStatus: stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Export default pour compatibilité
export default {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  updateApplicationStatus,
  addInterview,
  updateInterview,
  rejectApplication,
  hireCandidate,
  makeOffer,
  getPipeline,
  getApplicationStats
};
