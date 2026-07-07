/**
 * 👑 SuperAdmin Controller
 *
 * Statistiques et gestion globales multi-tenant (superadmin only)
 */

import Company from '../models/Company.model.js';
import User from '../models/User.model.js';
import Mission from '../models/Mission.model.js';
import Candidate from '../models/Candidate.model.js';
import { successResponse, paginationMeta } from '../utils/response.js';

/**
 * GET /api/superadmin/stats
 * Statistiques globales de la plateforme
 */
export const getGlobalStats = async (req, res, next) => {
  try {
    const [companies, users, missions, candidates] = await Promise.all([
      Company.countDocuments(),
      User.countDocuments(),
      Mission.countDocuments(),
      Candidate.countDocuments()
    ]);

    res.json({
      success: true,
      data: { companies, users, missions, candidates }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/superadmin/companies
 * Liste toutes les entreprises avec leur nombre d'utilisateurs
 */
export const getAllCompanies = async (req, res, next) => {
  try {
    const {
      status,
      plan,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 50,
      skip = 0
    } = req.query;
    const safeLimit = Math.min(parseInt(limit) || 20, 100);
    const safeSkip = parseInt(skip) || 0;

    const filter = {};
    if (status) filter.status = status;
    if (plan) filter.plan = plan;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [companies, total, userCounts] = await Promise.all([
      Company.find(filter)
        .sort(sort)
        .limit(safeLimit)
        .skip(safeSkip)
        .select('name email plan status sector createdAt')
        .lean(),
      Company.countDocuments(filter),
      User.aggregate([{ $group: { _id: '$companyId', count: { $sum: 1 } } }])
    ]);

    const countMap = {};
    userCounts.forEach(({ _id, count }) => {
      if (_id) countMap[_id.toString()] = count;
    });

    const data = companies.map(company => ({
      ...company,
      users: countMap[company._id.toString()] || 0
    }));

    successResponse(res, data, '', paginationMeta(total, Math.floor(safeSkip / safeLimit) + 1, safeLimit));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/superadmin/users
 * Liste tous les utilisateurs de la plateforme (toutes entreprises)
 */
export const getAllUsersGlobal = async (req, res, next) => {
  try {
    const {
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 50,
      skip = 0
    } = req.query;
    const safeLimit = Math.min(parseInt(limit) || 20, 100);
    const safeSkip = parseInt(skip) || 0;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort(sort)
        .limit(safeLimit)
        .skip(safeSkip)
        .populate('companyId', 'name plan status')
        .select('-password')
        .lean(),
      User.countDocuments(filter)
    ]);

    successResponse(res, users, '', paginationMeta(total, Math.floor(safeSkip / safeLimit) + 1, safeLimit));
  } catch (error) {
    next(error);
  }
};

export default {
  getGlobalStats,
  getAllCompanies,
  getAllUsersGlobal
};
