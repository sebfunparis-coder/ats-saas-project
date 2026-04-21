/**
 * 📋 Candidate List Component
 *
 * Liste/Grid de candidats avec filtres et pagination
 */

import React, { useMemo, useState } from 'react';
import { CandidateCard } from './CandidateCard';
import { Pagination } from '@/shared/components';
import { useFilters } from '@/core/contexts';
import { filterCandidates, sortBy, paginate } from '@/core/utils/filters';

export const CandidateList = ({
  candidates,
  onView,
  onEdit,
  onDelete,
  loading = false,
  selectable = false,
  selectedCandidates = [],
  onSelect
}) => {
  const { candidateFilters, sortConfig, viewPreferences } = useFilters();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Apply filters and sorting
  const filteredAndSortedCandidates = useMemo(() => {
    let result = filterCandidates(candidates, candidateFilters);
    result = sortBy(result, sortConfig.candidates.field, sortConfig.candidates.order);
    return result;
  }, [candidates, candidateFilters, sortConfig.candidates]);

  // Apply pagination
  const paginatedData = useMemo(() => {
    return paginate(filteredAndSortedCandidates, currentPage, pageSize);
  }, [filteredAndSortedCandidates, currentPage, pageSize]);

  const viewMode = viewPreferences.candidatesView || 'grid';

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [candidateFilters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⏳</div>
          <p className="text-gray-600">Chargement des candidats...</p>
        </div>
      </div>
    );
  }

  if (filteredAndSortedCandidates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucun candidat trouvé
        </h3>
        <p className="text-gray-600">
          {candidates.length === 0
            ? 'Commencez par ajouter votre premier candidat'
            : 'Essayez de modifier vos filtres'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        {filteredAndSortedCandidates.length} candidat{filteredAndSortedCandidates.length > 1 ? 's' : ''} trouvé{filteredAndSortedCandidates.length > 1 ? 's' : ''}
        {candidates.length !== filteredAndSortedCandidates.length && (
          <span className="text-gray-500"> (sur {candidates.length} au total)</span>
        )}
      </div>

      {/* Grid or List view */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {paginatedData.items.map((candidate) => {
            const candidateId = candidate._id || candidate.id;
            return (
              <CandidateCard
                key={candidateId}
                candidate={candidate}
                onView={() => onView(candidate)}
                onEdit={() => onEdit(candidate)}
                onDelete={() => onDelete(candidate)}
                selectable={selectable}
                selected={selectedCandidates.includes(candidateId)}
                onSelect={onSelect}
              />
            );
          })}
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {paginatedData.items.map((candidate) => {
            const candidateId = candidate._id || candidate.id;
            return (
              <CandidateCard
                key={candidateId}
                candidate={candidate}
                onView={() => onView(candidate)}
                onEdit={() => onEdit(candidate)}
                onDelete={() => onDelete(candidate)}
                selectable={selectable}
                selected={selectedCandidates.includes(candidateId)}
                onSelect={onSelect}
              />
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={paginatedData.pagination.page}
        totalPages={paginatedData.pagination.totalPages}
        pageSize={pageSize}
        totalItems={paginatedData.pagination.total}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};
