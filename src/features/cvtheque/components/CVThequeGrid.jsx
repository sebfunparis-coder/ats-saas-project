/**
 * 📊 CVTheque Grid Component
 *
 * Grille d'affichage des candidats pour la CVthèque
 */

import React, { useMemo } from 'react';
import { CandidateCard } from '@/features/candidates/components/CandidateCard';
import { Pagination } from '@/shared/components';
import { filterCandidates as applyFilters, sortBy, paginate } from '@/core/utils/filters';

export const CVThequeGrid = ({
  candidates = [],
  filters = {},
  sortConfig = { field: 'createdAt', order: 'desc' },
  onView,
  onEdit,
  onDelete,
  loading = false,
  currentPage = 1,
  pageSize = 20,
  onPageChange,
  onPageSizeChange
}) => {
  // Apply advanced filters
  const filteredCandidates = useMemo(() => {
    let result = [...candidates];

    // Basic search (already in filters util)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(c => {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        const email = c.email?.toLowerCase() || '';
        const position = c.position?.toLowerCase() || '';
        const skills = c.skills?.join(' ').toLowerCase() || '';

        return (
          fullName.includes(searchLower) ||
          email.includes(searchLower) ||
          position.includes(searchLower) ||
          skills.includes(searchLower)
        );
      });
    }

    // Status filter
    if (filters.status) {
      result = result.filter(c => c.status === filters.status);
    }

    // Sector filter
    if (filters.sector) {
      result = result.filter(c => c.sector === filters.sector);
    }

    // Experience level filter
    if (filters.experienceLevel) {
      result = result.filter(c => c.experienceLevel === filters.experienceLevel);
    }

    // Availability filter
    if (filters.availability) {
      result = result.filter(c => c.availability === filters.availability);
    }

    // Rating filter (minimum rating)
    if (filters.minRating) {
      const minRating = parseFloat(filters.minRating);
      result = result.filter(c => (c.rating || 0) >= minRating);
    }

    // Skills filter (has at least one of the skills)
    if (filters.skills && filters.skills.length > 0) {
      result = result.filter(c => {
        if (!c.skills || c.skills.length === 0) return false;
        const candidateSkills = c.skills.map(s => s.toLowerCase());
        return filters.skills.some(filterSkill =>
          candidateSkills.some(cs => cs.includes(filterSkill.toLowerCase()))
        );
      });
    }

    // Location filter
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      result = result.filter(c =>
        c.location?.toLowerCase().includes(locationLower)
      );
    }

    // Experience range filters
    if (filters.minExperience) {
      const minExp = parseFloat(filters.minExperience);
      result = result.filter(c => (c.experience || 0) >= minExp);
    }

    if (filters.maxExperience) {
      const maxExp = parseFloat(filters.maxExperience);
      result = result.filter(c => (c.experience || 0) <= maxExp);
    }

    // Contract preferences filter
    if (filters.contractPreferences && filters.contractPreferences.length > 0) {
      result = result.filter(c => {
        if (!c.preferences?.contracts) return false;
        return c.preferences.contracts.some(contract =>
          filters.contractPreferences.includes(contract)
        );
      });
    }

    // Available only filter
    if (filters.availableOnly) {
      result = result.filter(c => c.availability === 'Immédiate');
    }

    // With CV filter
    if (filters.withCV) {
      result = result.filter(c => c.cvUrl);
    }

    // With LinkedIn filter
    if (filters.withLinkedIn) {
      result = result.filter(c => c.linkedinUrl);
    }

    // Recently added filter (last 30 days)
    if (filters.recentlyAdded) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      result = result.filter(c => new Date(c.createdAt) >= thirtyDaysAgo);
    }

    return result;
  }, [candidates, filters]);

  // Apply sorting
  const sortedCandidates = useMemo(() => {
    return sortBy(filteredCandidates, sortConfig.field, sortConfig.order);
  }, [filteredCandidates, sortConfig]);

  // Apply pagination
  const paginatedData = useMemo(() => {
    return paginate(sortedCandidates, currentPage, pageSize);
  }, [sortedCandidates, currentPage, pageSize]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⏳</div>
          <p className="text-gray-600">Chargement de la CVthèque...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredCandidates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucun candidat trouvé
        </h3>
        <p className="text-gray-600 mb-4">
          {candidates.length === 0
            ? 'La CVthèque est vide. Commencez par ajouter des candidats.'
            : 'Aucun candidat ne correspond à vos critères de recherche.'}
        </p>
        {candidates.length > 0 && (
          <p className="text-sm text-gray-500">
            Essayez de modifier vos filtres pour voir plus de résultats
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Results summary */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{filteredCandidates.length}</span>{' '}
          candidat{filteredCandidates.length > 1 ? 's' : ''} trouvé{filteredCandidates.length > 1 ? 's' : ''}
          {candidates.length !== filteredCandidates.length && (
            <span className="text-gray-500"> (sur {candidates.length} au total)</span>
          )}
        </div>

        {/* Match percentage (if filters are active) */}
        {Object.keys(filters).filter(k => filters[k] && filters[k] !== '').length > 0 && (
          <div className="text-sm">
            <span className="text-gray-600">Taux de correspondance: </span>
            <span className={`font-semibold ${
              (filteredCandidates.length / candidates.length) * 100 >= 50
                ? 'text-green-600'
                : (filteredCandidates.length / candidates.length) * 100 >= 20
                ? 'text-orange-600'
                : 'text-red-600'
            }`}>
              {((filteredCandidates.length / candidates.length) * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        {paginatedData.items.map((candidate) => (
          <CandidateCard
            key={candidate._id || candidate.id}
            candidate={candidate}
            onView={() => onView && onView(candidate)}
            onEdit={() => onEdit && onEdit(candidate)}
            onDelete={() => onDelete && onDelete(candidate)}
          />
        ))}
      </div>

      {/* Pagination */}
      {paginatedData.pagination.totalPages > 1 && (
        <Pagination
          currentPage={paginatedData.pagination.page}
          totalPages={paginatedData.pagination.totalPages}
          pageSize={pageSize}
          totalItems={paginatedData.pagination.total}
          onPageChange={onPageChange}
          onPageSizeChange={(newSize) => {
            onPageSizeChange(newSize);
            onPageChange(1); // Reset to page 1 when changing page size
          }}
        />
      )}
    </div>
  );
};
