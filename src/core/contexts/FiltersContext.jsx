/**
 * 🔍 Filters Context
 *
 * Gère les états de filtrage et recherche de l'application
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { STORAGE_KEYS } from '@/config/constants';

const FiltersContext = createContext(null);

export const useFilters = () => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error('useFilters must be used within FiltersProvider');
  }
  return context;
};

export const FiltersProvider = ({ children }) => {
  // ===== MISSIONS FILTERS =====
  const [missionFilters, setMissionFilters] = useState({
    search: '',
    status: '',
    contract: '',
    remote: '',
    department: '',
    sector: '',
    minSalary: '',
    maxSalary: '',
    dateFrom: '',
    dateTo: ''
  });

  const updateMissionFilters = useCallback((newFilters) => {
    setMissionFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetMissionFilters = useCallback(() => {
    setMissionFilters({
      search: '',
      status: '',
      contract: '',
      remote: '',
      department: '',
      sector: '',
      minSalary: '',
      maxSalary: '',
      dateFrom: '',
      dateTo: ''
    });
  }, []);

  // ===== CANDIDATES FILTERS =====
  const [candidateFilters, setCandidateFilters] = useState({
    search: '',
    status: '',
    sector: '',
    department: '',
    experience: '',
    skills: [],
    minRating: '',
    available: undefined,
    dateFrom: '',
    dateTo: ''
  });

  const updateCandidateFilters = useCallback((newFilters) => {
    setCandidateFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetCandidateFilters = useCallback(() => {
    setCandidateFilters({
      search: '',
      status: '',
      sector: '',
      department: '',
      experience: '',
      skills: [],
      minRating: '',
      available: undefined,
      dateFrom: '',
      dateTo: ''
    });
  }, []);

  // ===== APPLICATIONS FILTERS =====
  const [applicationFilters, setApplicationFilters] = useState({
    search: '',
    status: '',
    missionId: '',
    candidateId: '',
    dateFrom: '',
    dateTo: ''
  });

  const updateApplicationFilters = useCallback((newFilters) => {
    setApplicationFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetApplicationFilters = useCallback(() => {
    setApplicationFilters({
      search: '',
      status: '',
      missionId: '',
      candidateId: '',
      dateFrom: '',
      dateTo: ''
    });
  }, []);

  // ===== CLIENTS FILTERS =====
  const [clientFilters, setClientFilters] = useState({
    search: '',
    sector: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  const updateClientFilters = useCallback((newFilters) => {
    setClientFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetClientFilters = useCallback(() => {
    setClientFilters({
      search: '',
      sector: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
  }, []);

  // ===== SORTING =====
  const [sortConfig, setSortConfig] = useState({
    missions: { field: 'createdAt', order: 'desc' },
    candidates: { field: 'createdAt', order: 'desc' },
    applications: { field: 'appliedAt', order: 'desc' },
    clients: { field: 'createdAt', order: 'desc' }
  });

  /**
   * Update sort config for a resource type
   */
  const updateSort = useCallback((type, field, order = 'asc') => {
    setSortConfig(prev => ({
      ...prev,
      [type]: { field, order }
    }));
  }, []);

  /**
   * Toggle sort order
   */
  const toggleSortOrder = useCallback((type, field) => {
    setSortConfig(prev => {
      const current = prev[type];
      const newOrder = current.field === field && current.order === 'asc' ? 'desc' : 'asc';
      return {
        ...prev,
        [type]: { field, order: newOrder }
      };
    });
  }, []);

  // ===== VIEW PREFERENCES =====
  const [viewPreferences, setViewPreferences] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.VIEW_PREFERENCES);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {
          missionsView: 'grid', // 'grid' | 'list'
          candidatesView: 'grid',
          applicationsView: 'kanban', // 'kanban' | 'list'
          calendarView: 'month' // 'day' | 'week' | 'month'
        };
      }
    }
    return {
      missionsView: 'grid',
      candidatesView: 'grid',
      applicationsView: 'kanban',
      calendarView: 'month'
    };
  });

  /**
   * Update view preference
   */
  const updateViewPreference = useCallback((key, value) => {
    setViewPreferences(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEYS.VIEW_PREFERENCES, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ===== PAGINATION =====
  const [paginationConfig, setPaginationConfig] = useState({
    missions: { page: 1, pageSize: 20 },
    candidates: { page: 1, pageSize: 20 },
    applications: { page: 1, pageSize: 20 },
    clients: { page: 1, pageSize: 20 }
  });

  /**
   * Update pagination
   */
  const updatePagination = useCallback((type, page, pageSize) => {
    setPaginationConfig(prev => ({
      ...prev,
      [type]: { page, pageSize }
    }));
  }, []);

  /**
   * Reset pagination for a type
   */
  const resetPagination = useCallback((type) => {
    setPaginationConfig(prev => ({
      ...prev,
      [type]: { page: 1, pageSize: 20 }
    }));
  }, []);

  // ===== RESET ALL =====
  const resetAllFilters = useCallback(() => {
    resetMissionFilters();
    resetCandidateFilters();
    resetApplicationFilters();
    resetClientFilters();
  }, [resetMissionFilters, resetCandidateFilters, resetApplicationFilters, resetClientFilters]);

  const value = {
    // Mission Filters
    missionFilters,
    updateMissionFilters,
    resetMissionFilters,

    // Candidate Filters
    candidateFilters,
    updateCandidateFilters,
    resetCandidateFilters,

    // Application Filters
    applicationFilters,
    updateApplicationFilters,
    resetApplicationFilters,

    // Client Filters
    clientFilters,
    updateClientFilters,
    resetClientFilters,

    // Sorting
    sortConfig,
    updateSort,
    toggleSortOrder,

    // View Preferences
    viewPreferences,
    updateViewPreference,

    // Pagination
    paginationConfig,
    updatePagination,
    resetPagination,

    // Reset All
    resetAllFilters
  };

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
};
