import React, { createContext, useContext, useState } from 'react';

/**
 * Context des filtres
 * Gère tous les états de filtrage pour la CVthèque et autres pages
 */

const FiltersContext = createContext(null);

/**
 * Provider du contexte des filtres
 */
export function FiltersProvider({ children }) {
  // Recherche textuelle
  const [searchQuery, setSearchQuery] = useState('');

  // Filtres CVthèque
  const [cvthequeFilter, setCvthequeFilter] = useState('all'); // 'all', 'department', 'metier'
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedMetier, setSelectedMetier] = useState('all');
  const [filterSector, setFilterSector] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [filterDateAdded, setFilterDateAdded] = useState('all');
  const [filterTags, setFilterTags] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Filtres Missions
  const [missionStatusFilter, setMissionStatusFilter] = useState('all');
  const [missionUrgencyFilter, setMissionUrgencyFilter] = useState('all');
  const [missionClientFilter, setMissionClientFilter] = useState('all');

  // Filtres Candidats
  const [candidateStatusFilter, setCandidateStatusFilter] = useState('all');
  const [candidateExperienceFilter, setCandidateExperienceFilter] = useState('all');

  // Filtres Clients
  const [clientStatusFilter, setClientStatusFilter] = useState('all');
  const [clientIndustryFilter, setClientIndustryFilter] = useState('all');

  /**
   * Réinitialiser tous les filtres CVthèque
   */
  const resetCVThequeFilters = () => {
    setSearchQuery('');
    setCvthequeFilter('all');
    setSelectedDepartment('all');
    setSelectedMetier('all');
    setFilterSector('all');
    setFilterCity('all');
    setFilterDateAdded('all');
    setFilterTags([]);
    setShowFavoritesOnly(false);
  };

  /**
   * Réinitialiser les filtres Missions
   */
  const resetMissionFilters = () => {
    setSearchQuery('');
    setMissionStatusFilter('all');
    setMissionUrgencyFilter('all');
    setMissionClientFilter('all');
  };

  /**
   * Réinitialiser les filtres Candidats
   */
  const resetCandidateFilters = () => {
    setSearchQuery('');
    setCandidateStatusFilter('all');
    setCandidateExperienceFilter('all');
  };

  /**
   * Réinitialiser les filtres Clients
   */
  const resetClientFilters = () => {
    setSearchQuery('');
    setClientStatusFilter('all');
    setClientIndustryFilter('all');
  };

  /**
   * Réinitialiser TOUS les filtres
   */
  const resetAllFilters = () => {
    resetCVThequeFilters();
    resetMissionFilters();
    resetCandidateFilters();
    resetClientFilters();
  };

  /**
   * Ajouter/retirer un tag des filtres
   */
  const toggleTagFilter = (tagId) => {
    if (filterTags.includes(tagId)) {
      setFilterTags(filterTags.filter(id => id !== tagId));
    } else {
      setFilterTags([...filterTags, tagId]);
    }
  };

  /**
   * Vérifier si des filtres sont actifs (CVthèque)
   */
  const hasCVThequeFilters = () => {
    return (
      searchQuery !== '' ||
      selectedMetier !== 'all' ||
      filterSector !== 'all' ||
      filterCity !== 'all' ||
      selectedDepartment !== 'all' ||
      filterDateAdded !== 'all' ||
      filterTags.length > 0 ||
      showFavoritesOnly
    );
  };

  /**
   * Vérifier si des filtres sont actifs (Missions)
   */
  const hasMissionFilters = () => {
    return (
      searchQuery !== '' ||
      missionStatusFilter !== 'all' ||
      missionUrgencyFilter !== 'all' ||
      missionClientFilter !== 'all'
    );
  };

  /**
   * Vérifier si des filtres sont actifs (Candidats)
   */
  const hasCandidateFilters = () => {
    return (
      searchQuery !== '' ||
      candidateStatusFilter !== 'all' ||
      candidateExperienceFilter !== 'all'
    );
  };

  const value = {
    // Recherche
    searchQuery,
    setSearchQuery,

    // Filtres CVthèque
    cvthequeFilter,
    setCvthequeFilter,
    selectedDepartment,
    setSelectedDepartment,
    selectedMetier,
    setSelectedMetier,
    filterSector,
    setFilterSector,
    filterCity,
    setFilterCity,
    filterDateAdded,
    setFilterDateAdded,
    filterTags,
    setFilterTags,
    toggleTagFilter,
    showFavoritesOnly,
    setShowFavoritesOnly,

    // Filtres Missions
    missionStatusFilter,
    setMissionStatusFilter,
    missionUrgencyFilter,
    setMissionUrgencyFilter,
    missionClientFilter,
    setMissionClientFilter,

    // Filtres Candidats
    candidateStatusFilter,
    setCandidateStatusFilter,
    candidateExperienceFilter,
    setCandidateExperienceFilter,

    // Filtres Clients
    clientStatusFilter,
    setClientStatusFilter,
    clientIndustryFilter,
    setClientIndustryFilter,

    // Fonctions de reset
    resetCVThequeFilters,
    resetMissionFilters,
    resetCandidateFilters,
    resetClientFilters,
    resetAllFilters,

    // Vérifications
    hasCVThequeFilters,
    hasMissionFilters,
    hasCandidateFilters,
    hasActiveFilters: hasCVThequeFilters() || hasMissionFilters() || hasCandidateFilters(),
  };

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

/**
 * Hook pour utiliser le contexte des filtres
 */
export function useFilters() {
  const context = useContext(FiltersContext);

  if (!context) {
    throw new Error('useFilters doit être utilisé dans un FiltersProvider');
  }

  return context;
}

export default FiltersContext;
