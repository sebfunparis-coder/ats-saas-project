/**
 * 🔍 Filters Utilities
 *
 * Fonctions de filtrage avancé pour les données
 */

/**
 * Filter missions by criteria
 * @param {array} missions - Array of missions
 * @param {object} filters - Filter criteria
 * @returns {array} - Filtered missions
 */
export const filterMissions = (missions, filters = {}) => {
  if (!Array.isArray(missions)) return [];

  return missions.filter(mission => {
    // Search in title, company, description
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        mission.title?.toLowerCase().includes(searchLower) ||
        mission.company?.toLowerCase().includes(searchLower) ||
        mission.description?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Filter by status
    if (filters.status && mission.status !== filters.status) {
      return false;
    }

    // Filter by contract type
    if (filters.contract && mission.contract !== filters.contract) {
      return false;
    }

    // Filter by remote option
    if (filters.remote && mission.remote !== filters.remote) {
      return false;
    }

    // Filter by department
    if (filters.department && mission.department !== filters.department) {
      return false;
    }

    // Filter by sector
    if (filters.sector && mission.sector !== filters.sector) {
      return false;
    }

    // Filter by salary range
    if (filters.minSalary && mission.maxSalary && mission.maxSalary < Number(filters.minSalary)) {
      return false;
    }

    if (filters.maxSalary && mission.minSalary && mission.minSalary > Number(filters.maxSalary)) {
      return false;
    }

    // Filter by date range
    if (filters.dateFrom) {
      const missionDate = new Date(mission.createdAt);
      const filterDate = new Date(filters.dateFrom);
      if (missionDate < filterDate) return false;
    }

    if (filters.dateTo) {
      const missionDate = new Date(mission.createdAt);
      const filterDate = new Date(filters.dateTo);
      if (missionDate > filterDate) return false;
    }

    return true;
  });
};

/**
 * Filter candidates by criteria
 * @param {array} candidates - Array of candidates
 * @param {object} filters - Filter criteria
 * @returns {array} - Filtered candidates
 */
export const filterCandidates = (candidates, filters = {}) => {
  if (!Array.isArray(candidates)) return [];

  return candidates.filter(candidate => {
    // Search in name, email, position, skills
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        candidate.firstName?.toLowerCase().includes(searchLower) ||
        candidate.lastName?.toLowerCase().includes(searchLower) ||
        candidate.email?.toLowerCase().includes(searchLower) ||
        candidate.position?.toLowerCase().includes(searchLower) ||
        candidate.skills?.some(skill => skill.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;
    }

    // Filter by status
    if (filters.status && candidate.status !== filters.status) {
      return false;
    }

    // Filter by sector
    if (filters.sector && candidate.sector !== filters.sector) {
      return false;
    }

    // Filter by department (location)
    if (filters.department && candidate.location !== filters.department) {
      return false;
    }

    // Filter by rating
    if (filters.minRating && candidate.rating < Number(filters.minRating)) {
      return false;
    }

    // Filter by experience
    if (filters.experience && candidate.experience !== filters.experience) {
      return false;
    }

    // Filter by skills (must have all selected skills)
    if (filters.skills && Array.isArray(filters.skills) && filters.skills.length > 0) {
      const candidateSkills = candidate.skills?.map(s => s.toLowerCase()) || [];
      const hasAllSkills = filters.skills.every(skill =>
        candidateSkills.includes(skill.toLowerCase())
      );
      if (!hasAllSkills) return false;
    }

    // Filter by availability
    if (filters.available !== undefined) {
      if (filters.available && !candidate.available) return false;
      if (!filters.available && candidate.available) return false;
    }

    // Filter by date range
    if (filters.dateFrom) {
      const candidateDate = new Date(candidate.createdAt);
      const filterDate = new Date(filters.dateFrom);
      if (candidateDate < filterDate) return false;
    }

    if (filters.dateTo) {
      const candidateDate = new Date(candidate.createdAt);
      const filterDate = new Date(filters.dateTo);
      if (candidateDate > filterDate) return false;
    }

    return true;
  });
};

/**
 * Filter applications by criteria
 * @param {array} applications - Array of applications
 * @param {object} filters - Filter criteria
 * @returns {array} - Filtered applications
 */
export const filterApplications = (applications, filters = {}) => {
  if (!Array.isArray(applications)) return [];

  return applications.filter(app => {
    // Filter by status
    if (filters.status && app.status !== filters.status) {
      return false;
    }

    // Filter by mission
    if (filters.missionId && app.missionId !== filters.missionId) {
      return false;
    }

    // Filter by candidate
    if (filters.candidateId && app.candidateId !== filters.candidateId) {
      return false;
    }

    // Filter by date range
    if (filters.dateFrom) {
      const appDate = new Date(app.appliedAt || app.createdAt);
      const filterDate = new Date(filters.dateFrom);
      if (appDate < filterDate) return false;
    }

    if (filters.dateTo) {
      const appDate = new Date(app.appliedAt || app.createdAt);
      const filterDate = new Date(filters.dateTo);
      if (appDate > filterDate) return false;
    }

    return true;
  });
};

/**
 * Sort array by field and order
 * @param {array} items - Array to sort
 * @param {string} field - Field to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {array} - Sorted array
 */
export const sortBy = (items, field, order = 'asc') => {
  if (!Array.isArray(items)) return [];

  return [...items].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    // Handle nested fields (e.g., 'candidate.firstName')
    if (field.includes('.')) {
      const fields = field.split('.');
      aVal = fields.reduce((obj, key) => obj?.[key], a);
      bVal = fields.reduce((obj, key) => obj?.[key], b);
    }

    // Handle null/undefined
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    // Handle dates
    if (aVal instanceof Date && bVal instanceof Date) {
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // Handle strings with dates
    if (field.includes('date') || field.includes('At')) {
      const dateA = new Date(aVal);
      const dateB = new Date(bVal);
      if (!isNaN(dateA) && !isNaN(dateB)) {
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      }
    }

    // Handle numbers
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // Handle strings (case insensitive)
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();

    if (order === 'asc') {
      return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
    } else {
      return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
    }
  });
};

/**
 * Group array by field
 * @param {array} items - Array to group
 * @param {string} field - Field to group by
 * @returns {object} - Grouped object {key: [items]}
 */
export const groupBy = (items, field) => {
  if (!Array.isArray(items)) return {};

  return items.reduce((groups, item) => {
    const key = item[field] || 'other';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

/**
 * Paginate array
 * @param {array} items - Array to paginate
 * @param {number} page - Current page (1-indexed)
 * @param {number} pageSize - Items per page
 * @returns {object} - {items, pagination: {total, page, pageSize, totalPages}}
 */
export const paginate = (items, page = 1, pageSize = 20) => {
  if (!Array.isArray(items)) {
    return {
      items: [],
      pagination: { total: 0, page: 1, pageSize, totalPages: 0 }
    };
  }

  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: items.slice(start, end),
    pagination: {
      total,
      page: currentPage,
      pageSize,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    }
  };
};

/**
 * Get unique values from array field
 * @param {array} items - Array of items
 * @param {string} field - Field to extract
 * @returns {array} - Unique values
 */
export const getUniqueValues = (items, field) => {
  if (!Array.isArray(items)) return [];

  const values = items.map(item => item[field]).filter(Boolean);
  return [...new Set(values)].sort();
};

/**
 * Count items by field value
 * @param {array} items - Array of items
 * @param {string} field - Field to count
 * @returns {object} - {value: count}
 */
export const countBy = (items, field) => {
  if (!Array.isArray(items)) return {};

  return items.reduce((counts, item) => {
    const key = item[field] || 'other';
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
};

/**
 * Search in multiple fields
 * @param {array} items - Array to search
 * @param {string} query - Search query
 * @param {array} fields - Fields to search in
 * @returns {array} - Matching items
 */
export const searchInFields = (items, query, fields = []) => {
  if (!Array.isArray(items) || !query) return items;

  const queryLower = query.toLowerCase();

  return items.filter(item => {
    return fields.some(field => {
      const value = item[field];

      if (Array.isArray(value)) {
        return value.some(v => String(v).toLowerCase().includes(queryLower));
      }

      return value && String(value).toLowerCase().includes(queryLower);
    });
  });
};
