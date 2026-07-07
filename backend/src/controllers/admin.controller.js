/**
 * ⚙️ Admin Controller
 *
 * Endpoints d'administration : audit logs, statistiques company.
 */

import AuditLog from '../models/AuditLog.model.js';
import Mission from '../models/Mission.model.js';
import Candidate from '../models/Candidate.model.js';
import Application from '../models/Application.model.js';
import Event from '../models/Event.model.js';
import { AppError } from '../utils/AppError.js';
import { successResponse, createdResponse, paginationMeta } from '../utils/response.js';
import { MISSION_STATUS, APPLICATION_STATUS, EVENT_TYPES } from '../config/constants.js';
import { escapeRegExp } from '../utils/regexHelpers.js';

/**
 * GET /api/admin/audit-logs
 * Journal d'audit — filtrable par date, user, entity
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const { companyId, role } = req.user;
    const {
      startDate,
      endDate,
      userId,
      userEmail,
      entity,
      action,
      limit = 50,
      skip = 0
    } = req.query;

    const parsedLimit = Math.min(parseInt(limit, 10) || 50, 200);
    const parsedSkip = parseInt(skip, 10) || 0;

    // Superadmin can query across companies; admin is scoped to own company
    const filter = role === 'superadmin' ? {} : { companyId };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (userId) filter.userId = userId;
    // T-400 : même faille ReDoS que T-366 — userEmail passait tel quel dans
    // new RegExp() (implicite via $regex), un pattern à backtracking
    // catastrophique pouvait bloquer un thread MongoDB de façon disproportionnée.
    if (userEmail) filter.userEmail = { $regex: escapeRegExp(userEmail), $options: 'i' };
    if (entity) filter.entity = entity;
    if (action) filter.action = action.toUpperCase();

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(parsedSkip)
        .limit(parsedLimit)
        .lean(),
      AuditLog.countDocuments(filter)
    ]);

    successResponse(res, logs, '', paginationMeta(total, Math.floor(parsedSkip / parsedLimit) + 1, parsedLimit));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/stats
 * Statistiques agrégées de la company courante (ou globales pour superadmin)
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const { companyId, role } = req.user;
    const scope = role === 'superadmin' ? {} : { companyId };

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const [
      totalMissions,
      activeMissions,
      totalCandidates,
      newCandidates,
      totalApplications,
      activeApplications,
      hiredApplications,
      upcomingInterviews
    ] = await Promise.all([
      Mission.countDocuments(scope),
      Mission.countDocuments({ ...scope, status: MISSION_STATUS.ACTIVE }),
      Candidate.countDocuments(scope),
      Candidate.countDocuments({ ...scope, createdAt: { $gte: thirtyDaysAgo } }),
      Application.countDocuments(scope),
      Application.countDocuments({ ...scope, status: { $nin: [APPLICATION_STATUS.HIRED, APPLICATION_STATUS.REJECTED] } }),
      Application.countDocuments({ ...scope, status: APPLICATION_STATUS.HIRED }),
      Event.countDocuments({ ...scope, type: EVENT_TYPES.INTERVIEW, startDate: { $gte: now } })
    ]);

    const conversionRate = totalApplications > 0
      ? Math.round((hiredApplications / totalApplications) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        missions: { total: totalMissions, active: activeMissions },
        candidates: { total: totalCandidates, new: newCandidates },
        applications: {
          total: totalApplications,
          active: activeApplications,
          hired: hiredApplications
        },
        conversionRate,
        upcomingInterviews
      }
    });
  } catch (error) {
    next(error);
  }
};

export default { getAuditLogs, getAdminStats };
