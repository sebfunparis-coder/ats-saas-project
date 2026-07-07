/**
 * 📋 Application Controller
 *
 * Gère les candidatures : CRUD, pipeline kanban, interviews, hiring
 */

import Application from '../models/Application.model.js';
import Mission from '../models/Mission.model.js';
import { broadcast } from '../utils/sseManager.js';
import Candidate from '../models/Candidate.model.js';
import Company from '../models/Company.model.js';
import Event from '../models/Event.model.js';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';
import { successResponse, createdResponse, paginationMeta } from '../utils/response.js';
import { scoreApplication as aiScoreApplication } from '../services/ai.service.js';
import { triggerWebhookEvent } from '../services/webhook.service.js';
import logger from '../utils/logger.js';

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
    const safeLimit = Math.min(parseInt(limit) || 20, 100);
    const safeSkip = parseInt(skip) || 0;

    const filter = { companyId };

    if (status) filter.status = status;
    if (missionId) filter.missionId = missionId;
    if (candidateId) filter.candidateId = candidateId;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort(sort)
        .limit(safeLimit)
        .skip(safeSkip)
        .populate('missionId', 'title company status contract location')
        .populate('candidateId', 'firstName lastName email position status rating cvUrl')
        .populate('createdBy', 'firstName lastName email')
        .lean(),
      Application.countDocuments(filter)
    ]);

    successResponse(res, applications, '', paginationMeta(total, Math.floor(safeSkip / safeLimit) + 1, safeLimit));
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

    // T-378 : le catalogue de 15 événements (webhook.service.js) n'était
    // déclenché par AUCUN controller — seul le "ping" manuel de test
    // fonctionnait. Un client configurant un webhook ne recevait donc jamais
    // aucun événement réel. Appel non bloquant (fire-and-forget) : une
    // panne de livraison webhook ne doit jamais faire échouer la requête.
    triggerWebhookEvent(companyId, 'application.created', {
      applicationId: application._id,
      missionId,
      candidateId,
      missionTitle: mission.title,
      candidateName: candidate.fullName,
    }).catch(err => logger.warn('Webhook application.created failed', { error: err.message }));

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

    application.isDeleted = true;
    application.deletedAt = new Date();
    await application.save();

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

    const validStatuses = ['received', 'applied', 'screening', 'interview_1', 'interview_2', 'interview', 'offer', 'final', 'hired', 'rejected', 'archived'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Statut invalide', 400);
    }

    const application = await Application.findOne({ _id: id, companyId });

    if (!application) {
      throw new AppError('Candidature non trouvée', 404);
    }

    // Utiliser la méthode du model
    await application.updateStatus(status, userId);

    // Notifier tous les clients SSE connectés pour cette company
    broadcast(companyId, 'application:status', {
      applicationId: String(application._id),
      status,
    });

    // T-378 : webhooks — status_changed systématique, + événement dédié pour
    // hired/rejected (catalogue WEBHOOK_EVENTS).
    triggerWebhookEvent(companyId, 'application.status_changed', {
      applicationId: application._id, status,
    }).catch(err => logger.warn('Webhook application.status_changed failed', { error: err.message }));
    if (status === 'hired') {
      triggerWebhookEvent(companyId, 'application.hired', { applicationId: application._id })
        .catch(err => logger.warn('Webhook application.hired failed', { error: err.message }));
    } else if (status === 'rejected') {
      triggerWebhookEvent(companyId, 'application.rejected', { applicationId: application._id })
        .catch(err => logger.warn('Webhook application.rejected failed', { error: err.message }));
    }

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
    const { companyId, id: userId } = req.user;
    const { type, scheduledAt, interviewer, notes, location, meetingLink } = req.body;

    // Validation
    if (!type || !scheduledAt) {
      throw new AppError('Type et date de l\'entretien sont requis', 400);
    }

    const validTypes = ['interview', 'call', 'meeting', 'other'];
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

    await application.addInterview(interviewData);

    // T-378 : création automatique du lien visio (Zoom/Teams) et synchronisation
    // calendrier (Google/Outlook) si la company a connecté ces intégrations —
    // entièrement best-effort : une intégration non configurée (cas par défaut,
    // `videoProvider: 'none'` / `integrationTokens: {}`) ne doit jamais faire
    // échouer la planification de l'entretien elle-même.
    const company = await Company.findById(companyId).select('integrationTokens videoProvider').lean();
    const interviewForIntegrations = {
      date: scheduledAt,
      duration: 60,
      location,
      videoLink: meetingLink,
      notes,
    };
    const candidateForIntegrations = { name: application.candidateName, email: application.candidateEmail };
    const missionForIntegrations = { title: application.missionTitle };

    let resolvedMeetingLink = meetingLink || null;
    if (company?.videoProvider && company.videoProvider !== 'none') {
      try {
        const { createVideoMeeting } = await import('../services/videocall.service.js');
        const tokens = company.videoProvider === 'teams' ? company.integrationTokens?.microsoftCalendar : null;
        const meeting = await createVideoMeeting(company.videoProvider, tokens, interviewForIntegrations, candidateForIntegrations, missionForIntegrations);
        if (meeting?.joinUrl) {
          resolvedMeetingLink = meeting.joinUrl;
          interviewForIntegrations.videoLink = meeting.joinUrl;
        }
      } catch (err) {
        logger.warn('Création réunion vidéo échouée (entretien planifié quand même)', { provider: company.videoProvider, error: err.message });
      }
    }

    // Create a linked Calendar Event so the interview appears in the calendar
    const startDate = new Date(scheduledAt);
    await Event.create({
      title: `Entretien — ${application.candidateName}`,
      description: `Mission : ${application.missionTitle}${notes ? '\n' + notes : ''}`,
      type: 'interview',
      startDate,
      endDate: new Date(startDate.getTime() + 60 * 60 * 1000), // +1h default
      location: location || null,
      meetingLink: resolvedMeetingLink,
      applicationId: application._id,
      candidateId: application.candidateId,
      missionId: application.missionId,
      organizer: userId,
      companyId,
      status: 'scheduled'
    });

    if (company?.integrationTokens?.googleCalendar?.accessToken) {
      try {
        const { createGoogleCalendarEvent } = await import('../services/calendar.service.js');
        await createGoogleCalendarEvent(company.integrationTokens.googleCalendar, interviewForIntegrations, candidateForIntegrations, missionForIntegrations);
      } catch (err) {
        logger.warn('Synchronisation Google Calendar échouée (entretien planifié quand même)', { error: err.message });
      }
    }
    if (company?.integrationTokens?.microsoftCalendar?.accessToken) {
      try {
        const { createOutlookEvent } = await import('../services/calendar.service.js');
        await createOutlookEvent(company.integrationTokens.microsoftCalendar, interviewForIntegrations, candidateForIntegrations, missionForIntegrations);
      } catch (err) {
        logger.warn('Synchronisation Outlook échouée (entretien planifié quand même)', { error: err.message });
      }
    }

    triggerWebhookEvent(companyId, 'interview.scheduled', {
      applicationId: application._id,
      candidateName: application.candidateName,
      missionTitle: application.missionTitle,
      scheduledAt,
      meetingLink: resolvedMeetingLink,
    }).catch(err => logger.warn('Webhook interview.scheduled failed', { error: err.message }));

    res.status(201).json({
      success: true,
      data: application,
      message: 'Entretien planifié avec succès'
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

/**
 * PATCH /api/applications/:id/restore
 */
export const restoreApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    // Fetch deleted application first to get missionId/candidateId for counter sync
    const application = await Application.findOne(
      { _id: id, companyId, isDeleted: true },
      null,
      { includeDeleted: true }
    );
    if (!application) {
      throw new AppError('Candidature supprimée non trouvée', 404);
    }

    // Restore the record
    await Application.updateOne(
      { _id: id, companyId, isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null } }
    );

    // Re-sync Mission counter + candidateIds
    await Mission.findByIdAndUpdate(
      application.missionId,
      { $inc: { applicationCount: 1 }, $addToSet: { candidateIds: application.candidateId } }
    );

    // Re-sync Candidate applicationIds
    await Candidate.findByIdAndUpdate(
      application.candidateId,
      { $addToSet: { applicationIds: application._id } }
    );

    res.json({ success: true, message: 'Candidature restaurée avec succès' });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/applications/:id/purge
 */
export const purgeApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const result = await Application.deleteOne({ _id: id, companyId, isDeleted: true });

    if (result.deletedCount === 0) {
      throw new AppError('Candidature supprimée non trouvée', 404);
    }

    res.json({ success: true, message: 'Candidature supprimée définitivement' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/applications/:id/score
 * Lance le scoring IA de façon asynchrone.
 * Retourne 202 immédiatement ; le résultat arrive via SSE (application:score).
 */
export const scoreApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const application = await Application.findOne({ _id: id, companyId })
      .populate('missionId', 'title department location contract salary skills requirements')
      .populate('candidateId', 'firstName lastName position experience skills languages location');

    if (!application) throw new AppError('Candidature non trouvée', 404);

    if (application.aiScoreStatus === 'pending') {
      return res.json({ success: true, message: 'Calcul déjà en cours', aiScoreStatus: 'pending' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new AppError('ANTHROPIC_API_KEY non configurée — scoring IA indisponible', 503);
    }

    // Marquer comme en cours et répondre immédiatement
    await Application.updateOne({ _id: id }, { aiScoreStatus: 'pending' });
    broadcast(companyId, 'application:score', { applicationId: String(id), aiScoreStatus: 'pending' });

    res.json({ success: true, message: 'Calcul en cours…', aiScoreStatus: 'pending' });

    // Traitement asynchrone (hors cycle requête)
    setImmediate(async () => {
      try {
        const result = await aiScoreApplication({
          application: application.toObject(),
          mission: application.missionId,
          candidate: application.candidateId,
        });

        await Application.updateOne({ _id: id }, {
          aiScore: result.score,
          aiScoreStatus: 'done',
          aiScoreAt: new Date(),
          aiScoreDetails: {
            skillsMatch: result.skillsMatch,
            experienceMatch: result.experienceMatch,
            locationMatch: result.locationMatch,
            salaryMatch: result.salaryMatch,
            justification: result.justification,
            strengths: result.strengths,
            concerns: result.concerns,
          },
        });

        broadcast(companyId, 'application:score', {
          applicationId: String(id),
          aiScore: result.score,
          aiScoreStatus: 'done',
          aiScoreAt: new Date().toISOString(),
          aiScoreDetails: result,
        });
      } catch (err) {
        logger.error('scoreApplication: erreur IA', { error: err.message, applicationId: id });
        await Application.updateOne({ _id: id }, { aiScoreStatus: 'error' });
        broadcast(companyId, 'application:score', { applicationId: String(id), aiScoreStatus: 'error' });
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
  restoreApplication,
  purgeApplication,
  updateApplicationStatus,
  addInterview,
  updateInterview,
  rejectApplication,
  hireCandidate,
  makeOffer,
  getPipeline,
  getApplicationStats,
  scoreApplication,
};
