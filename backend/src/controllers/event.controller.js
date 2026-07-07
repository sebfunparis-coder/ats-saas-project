/**
 * 📅 Event Controller
 *
 * Gère les événements (calendrier) : CRUD, participants, reminders, interviews
 */

import mongoose from 'mongoose';
import crypto from 'crypto';
import Event from '../models/Event.model.js';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';
import { successResponse, createdResponse, paginationMeta } from '../utils/response.js';

const useMockDB = () => mongoose.connection.readyState !== 1;

// In-memory mock store for development without MongoDB
const _mockEvents = [];

const mockEventOps = {
  getAll: (companyId) => _mockEvents.filter(e => e.companyId === companyId),
  getById: (id, companyId) => _mockEvents.find(e => e._id === id && e.companyId === companyId),
  create: (data) => {
    const event = { ...data, _id: crypto.randomBytes(12).toString('hex'), createdAt: new Date(), updatedAt: new Date() };
    _mockEvents.push(event);
    return event;
  },
  update: (id, companyId, updates) => {
    const idx = _mockEvents.findIndex(e => e._id === id && e.companyId === companyId);
    if (idx === -1) return null;
    _mockEvents[idx] = { ..._mockEvents[idx], ...updates, updatedAt: new Date() };
    return _mockEvents[idx];
  },
  delete: (id, companyId) => {
    const idx = _mockEvents.findIndex(e => e._id === id && e.companyId === companyId);
    if (idx === -1) return false;
    _mockEvents.splice(idx, 1);
    return true;
  },
};

// ===== CONTROLLERS =====

/**
 * GET /api/events
 * Liste tous les événements (avec pagination, filtres)
 */
export const getAllEvents = async (req, res, next) => {
  try {
    const { companyId } = req.user;

    if (useMockDB()) {
      const events = mockEventOps.getAll(String(companyId));
      return successResponse(res, events, '', paginationMeta(events.length, 1, 200));
    }

    const {
      type,
      status,
      startDate,
      endDate,
      missionId,
      candidateId,
      sortBy = 'startDate',
      sortOrder = 'asc',
      limit = 100,
      skip = 0
    } = req.query;
    const safeLimit = Math.min(parseInt(limit) || 50, 200);
    const safeSkip = parseInt(skip) || 0;

    const filter = { companyId };

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (missionId) filter.missionId = missionId;
    if (candidateId) filter.candidateId = candidateId;
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort(sort)
        .limit(safeLimit)
        .skip(safeSkip)
        .populate('organizer', 'firstName lastName email avatar')
        .populate('participants.user', 'firstName lastName email')
        .populate('missionId', 'title')
        .populate('candidateId', 'firstName lastName email')
        .populate('applicationId', 'status')
        .lean(),
      Event.countDocuments(filter)
    ]);

    successResponse(res, events, '', paginationMeta(total, Math.floor(safeSkip / safeLimit) + 1, safeLimit));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events/:id
 * Récupérer un événement par ID
 */
export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const event = await Event.findOne({ _id: id, companyId })
      .populate('organizer', 'firstName lastName email avatar phone')
      .populate('participants.user', 'firstName lastName email avatar')
      .populate('missionId', 'title company status')
      .populate('candidateId', 'firstName lastName email phone position')
      .populate('applicationId', 'status missionTitle')
      .lean();

    if (!event) {
      throw new AppError('Événement non trouvé', 404);
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/events
 * Créer un nouvel événement
 */
export const createEvent = async (req, res, next) => {
  try {
    const { companyId, id: userId } = req.user;

    if (useMockDB()) {
      const eventData = {
        ...req.body,
        companyId: String(companyId),
        organizer: String(userId),
        status: 'scheduled',
      };
      if (!eventData.endDate && eventData.startDate) {
        const start = new Date(eventData.startDate);
        eventData.endDate = new Date(start.getTime() + 60 * 60 * 1000).toISOString();
      }
      const event = mockEventOps.create(eventData);
      return res.status(201).json({ success: true, data: event });
    }

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const eventData = {
      ...req.body,
      companyId,
      organizer: userId,
      status: 'scheduled'
    };

    if (!eventData.endDate && eventData.startDate) {
      const start = new Date(eventData.startDate);
      eventData.endDate = new Date(start.getTime() + 60 * 60 * 1000);
    }

    const event = await Event.create(eventData);

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/events/:id
 * Mettre à jour un événement
 */
export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    if (useMockDB()) {
      const updated = mockEventOps.update(id, String(companyId), req.body);
      if (!updated) return next(new AppError('Événement non trouvé', 404));
      return res.json({ success: true, data: updated });
    }

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Trouver l'événement
    const event = await Event.findOne({ _id: id, companyId });

    if (!event) {
      throw new AppError('Événement non trouvé', 404);
    }

    // Champs autorisés à la modification
    const allowedFields = [
      'title',
      'description',
      'type',
      'startDate',
      'endDate',
      'location',
      'meetingLink',
      'notes'
    ];

    // Mettre à jour uniquement les champs autorisés
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    await event.save();

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/events/:id
 * Supprimer un événement
 */
export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    if (useMockDB()) {
      const deleted = mockEventOps.delete(id, String(companyId));
      if (!deleted) return next(new AppError('Événement non trouvé', 404));
      return res.json({ success: true, message: 'Événement supprimé avec succès' });
    }

    const event = await Event.findOne({ _id: id, companyId });

    if (!event) {
      throw new AppError('Événement non trouvé', 404);
    }

    await event.deleteOne();

    res.json({
      success: true,
      message: 'Événement supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/events/:id/cancel
 * Annuler un événement
 */
export const cancelEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const event = await Event.findOne({ _id: id, companyId });

    if (!event) {
      throw new AppError('Événement non trouvé', 404);
    }

    if (event.status === 'cancelled') {
      throw new AppError('Cet événement est déjà annulé', 400);
    }

    // Utiliser la méthode du model
    await event.cancel();

    res.json({
      success: true,
      data: event,
      message: 'Événement annulé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/events/:id/complete
 * Marquer un événement comme terminé
 */
export const completeEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { outcome, notes } = req.body;
    const { companyId } = req.user;

    const event = await Event.findOne({ _id: id, companyId });

    if (!event) {
      throw new AppError('Événement non trouvé', 404);
    }

    if (event.status === 'completed') {
      throw new AppError('Cet événement est déjà terminé', 400);
    }

    // Utiliser la méthode du model
    await event.complete(outcome, notes);

    res.json({
      success: true,
      data: event,
      message: 'Événement marqué comme terminé'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/events/:id/reschedule
 * Reprogrammer un événement
 */
export const rescheduleEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newStartDate, newEndDate } = req.body;
    const { companyId } = req.user;

    if (!newStartDate) {
      throw new AppError('La nouvelle date est requise', 400);
    }

    const event = await Event.findOne({ _id: id, companyId });

    if (!event) {
      throw new AppError('Événement non trouvé', 404);
    }

    // Utiliser la méthode du model
    const endDate = newEndDate ? new Date(newEndDate) : null;
    await event.reschedule(new Date(newStartDate), endDate);

    res.json({
      success: true,
      data: event,
      message: 'Événement reprogrammé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/events/:id/participant
 * Ajouter un participant à un événement
 */
export const addParticipant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, status } = req.body;
    const { companyId } = req.user;

    if (!userId) {
      throw new AppError('L\'ID du participant est requis', 400);
    }

    const event = await Event.findOne({ _id: id, companyId });

    if (!event) {
      throw new AppError('Événement non trouvé', 404);
    }

    const participantData = {
      user: userId,
      status: status || 'pending'
    };

    // Utiliser la méthode du model
    await event.addParticipant(participantData);

    res.status(201).json({
      success: true,
      data: event,
      message: 'Participant ajouté avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/events/:id/participant/:participantId
 * Retirer un participant d'un événement
 */
export const removeParticipant = async (req, res, next) => {
  try {
    const { id, participantId } = req.params;
    const { companyId } = req.user;

    const event = await Event.findOne({ _id: id, companyId });

    if (!event) {
      throw new AppError('Événement non trouvé', 404);
    }

    // Utiliser la méthode du model
    await event.removeParticipant(participantId);

    res.json({
      success: true,
      data: event,
      message: 'Participant retiré avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/events/:id/participant/:participantId
 * Mettre à jour le statut d'un participant (accepter/décliner)
 */
export const updateParticipantStatus = async (req, res, next) => {
  try {
    const { id, participantId } = req.params;
    const { status } = req.body;
    const { companyId } = req.user;

    if (!status) {
      throw new AppError('Le statut est requis', 400);
    }

    const validStatuses = ['pending', 'accepted', 'declined'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Statut invalide', 400);
    }

    const event = await Event.findOne({ _id: id, companyId });

    if (!event) {
      throw new AppError('Événement non trouvé', 404);
    }

    // Utiliser la méthode du model
    await event.updateParticipantStatus(participantId, status);

    res.json({
      success: true,
      data: event,
      message: 'Statut du participant mis à jour'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events/calendar/day
 * Récupérer les événements d'un jour
 */
export const getDayEvents = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { date } = req.query;

    if (!date) {
      throw new AppError('La date est requise', 400);
    }

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const events = await Event.find({
      companyId,
      startDate: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: 'cancelled' }
    })
      .sort({ startDate: 1 })
      .populate('organizer', 'firstName lastName')
      .populate('participants.user', 'firstName lastName')
      .populate('candidateId', 'firstName lastName')
      .lean();

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events/calendar/week
 * Récupérer les événements d'une semaine
 */
export const getWeekEvents = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { date } = req.query;

    if (!date) {
      throw new AppError('La date est requise', 400);
    }

    const currentDate = new Date(date);
    const dayOfWeek = currentDate.getDay();
    const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Lundi

    const weekStart = new Date(currentDate.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const events = await Event.find({
      companyId,
      startDate: { $gte: weekStart, $lte: weekEnd },
      status: { $ne: 'cancelled' }
    })
      .sort({ startDate: 1 })
      .populate('organizer', 'firstName lastName')
      .populate('participants.user', 'firstName lastName')
      .populate('candidateId', 'firstName lastName')
      .lean();

    res.json({
      success: true,
      data: events,
      meta: {
        weekStart,
        weekEnd
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events/calendar/month
 * Récupérer les événements d'un mois
 */
export const getMonthEvents = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { year, month } = req.query;

    if (!year || !month) {
      throw new AppError('L\'année et le mois sont requis', 400);
    }

    const monthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthEnd = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

    const events = await Event.find({
      companyId,
      startDate: { $gte: monthStart, $lte: monthEnd },
      status: { $ne: 'cancelled' }
    })
      .sort({ startDate: 1 })
      .populate('organizer', 'firstName lastName')
      .populate('participants.user', 'firstName lastName')
      .populate('candidateId', 'firstName lastName')
      .lean();

    res.json({
      success: true,
      data: events,
      meta: {
        monthStart,
        monthEnd
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events/upcoming
 * Récupérer les prochains événements
 */
export const getUpcomingEvents = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { limit = 10 } = req.query;
    const safeLimit = Math.min(parseInt(limit) || 10, 50);

    const now = new Date();

    const events = await Event.find({
      companyId,
      startDate: { $gte: now },
      status: { $in: ['scheduled', 'rescheduled'] }
    })
      .sort({ startDate: 1 })
      .limit(safeLimit)
      .populate('organizer', 'firstName lastName')
      .populate('candidateId', 'firstName lastName position')
      .populate('missionId', 'title')
      .lean();

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events/stats
 * Statistiques événements pour dashboard
 */
export const getEventStats = async (req, res, next) => {
  try {
    const { companyId } = req.user;

    const stats = await Event.aggregate([
      { $match: { companyId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Event.countDocuments({ companyId });
    const scheduled = await Event.countDocuments({ companyId, status: 'scheduled' });
    const completed = await Event.countDocuments({ companyId, status: 'completed' });

    // Événements aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayEvents = await Event.countDocuments({
      companyId,
      startDate: { $gte: today, $lt: tomorrow },
      status: { $ne: 'cancelled' }
    });

    // Événements cette semaine
    const weekStart = new Date(today);
    const dayOfWeek = weekStart.getDay();
    const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    weekStart.setDate(diff);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const thisWeek = await Event.countDocuments({
      companyId,
      startDate: { $gte: weekStart, $lt: weekEnd },
      status: { $ne: 'cancelled' }
    });

    res.json({
      success: true,
      data: {
        total,
        scheduled,
        completed,
        todayEvents,
        thisWeek,
        byType: stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Export default pour compatibilité
export default {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  cancelEvent,
  completeEvent,
  rescheduleEvent,
  addParticipant,
  removeParticipant,
  updateParticipantStatus,
  getDayEvents,
  getWeekEvents,
  getMonthEvents,
  getUpcomingEvents,
  getEventStats
};
