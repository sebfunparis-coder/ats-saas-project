/**
 * 📊 Analytics Controller
 *
 * Agrège les données de recrutement pour les rapports :
 *  - Vue d'ensemble KPIs
 *  - Entonnoir de conversion par statut
 *  - Sources de candidats avec taux de conversion
 *  - Activité par recruteur
 *  - Top missions par volume de candidatures
 *  - Temps moyen de recrutement (time-to-hire)
 *
 * Paramètre query `period` : 7 | 30 | 90 | all (défaut 30)
 */

import mongoose from 'mongoose';
import Application from '../models/Application.model.js';
import { AppError } from '../middleware/error.middleware.js';

const getPeriodStart = (period) => {
  if (!period || period === 'all') return null;
  const days = parseInt(period, 10);
  if (isNaN(days) || days <= 0) return null;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

// Ordre et libellés du pipeline
const STATUS_ORDER = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

/**
 * GET /api/analytics
 * Retourne toutes les métriques analytics en un seul appel.
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const companyId = new mongoose.Types.ObjectId(req.user.companyId.toString());
    const startDate = getPeriodStart(period);

    const baseMatch = {
      companyId,
      ...(startDate ? { appliedAt: { $gte: startDate } } : {}),
    };

    // 5 agrégations en parallèle
    const [funnelRaw, sourcesRaw, recruitersRaw, topMissionsRaw, timeToHireRaw] = await Promise.all([

      // 1. Entonnoir — count par statut
      Application.aggregate([
        { $match: baseMatch },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // 2. Sources — total + hired par source
      Application.aggregate([
        { $match: baseMatch },
        { $group: {
          _id: { $ifNull: ['$source', 'Non renseigné'] },
          total: { $sum: 1 },
          hired: { $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] } },
        }},
        { $sort: { total: -1 } },
      ]),

      // 3. Activité recruteur — lookup User
      Application.aggregate([
        { $match: baseMatch },
        { $group: {
          _id: '$createdBy',
          total: { $sum: 1 },
          hired: { $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] } },
        }},
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $project: {
          name: {
            $cond: [
              { $and: ['$user.firstName', '$user.lastName'] },
              { $concat: ['$user.firstName', ' ', '$user.lastName'] },
              { $ifNull: ['$user.email', 'Inconnu'] },
            ]
          },
          email: { $ifNull: ['$user.email', ''] },
          total: 1,
          hired: 1,
        }},
        { $sort: { total: -1 } },
        { $limit: 10 },
      ]),

      // 4. Top 5 missions par volume
      Application.aggregate([
        { $match: baseMatch },
        { $group: {
          _id: '$missionId',
          title: { $first: '$missionTitle' },
          total: { $sum: 1 },
          hired: { $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] } },
        }},
        { $sort: { total: -1 } },
        { $limit: 5 },
      ]),

      // 5. Time-to-hire (avg / min / max en jours)
      Application.aggregate([
        { $match: {
          ...baseMatch,
          status: 'hired',
          hiredAt: { $exists: true, $ne: null },
          appliedAt: { $exists: true, $ne: null },
        }},
        { $project: {
          daysToHire: {
            $divide: [{ $subtract: ['$hiredAt', '$appliedAt'] }, 86400000],
          },
        }},
        { $match: { daysToHire: { $gte: 0 } } },
        { $group: {
          _id: null,
          avg: { $avg: '$daysToHire' },
          min: { $min: '$daysToHire' },
          max: { $max: '$daysToHire' },
          count: { $sum: 1 },
        }},
      ]),
    ]);

    // ── Compute derived values ────────────────────────────────────────────────

    const totalApplications = funnelRaw.reduce((s, f) => s + f.count, 0);
    const hiredCount = funnelRaw.find(f => f._id === 'hired')?.count || 0;
    const rejectedCount = funnelRaw.find(f => f._id === 'rejected')?.count || 0;

    const funnel = STATUS_ORDER.map(status => {
      const count = funnelRaw.find(f => f._id === status)?.count || 0;
      return {
        status,
        count,
        percentage: totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0,
      };
    });

    const sources = sourcesRaw.map(s => ({
      source: s._id,
      total: s.total,
      hired: s.hired,
      conversionRate: s.total > 0 ? Math.round((s.hired / s.total) * 100) : 0,
    }));

    const recruiters = recruitersRaw.map(r => ({
      name: r.name,
      email: r.email,
      total: r.total,
      hired: r.hired,
      conversionRate: r.total > 0 ? Math.round((r.hired / r.total) * 100) : 0,
    }));

    const topMissions = topMissionsRaw.map(m => ({
      title: m.title || 'Mission inconnue',
      total: m.total,
      hired: m.hired,
      conversionRate: m.total > 0 ? Math.round((m.hired / m.total) * 100) : 0,
    }));

    const tth = timeToHireRaw[0];
    const timeToHire = tth ? {
      avg: Math.round(tth.avg),
      min: Math.round(tth.min),
      max: Math.round(tth.max),
      sampleSize: tth.count,
    } : null;

    res.json({
      success: true,
      data: {
        period,
        overview: {
          totalApplications,
          hired: hiredCount,
          rejected: rejectedCount,
          conversionRate: totalApplications > 0 ? Math.round((hiredCount / totalApplications) * 100) : 0,
          timeToHire,
        },
        funnel,
        sources,
        recruiters,
        topMissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default { getAnalytics };
