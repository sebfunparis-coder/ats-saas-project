/**
 * 📋 Mission List Component
 *
 * Liste/Grid de missions avec filtres
 */

import React, { useMemo, useState } from 'react';
import { MissionCard } from './MissionCard';
import { Pagination } from '@/shared/components';
import { useFilters } from '@/core/contexts';
import { filterMissions, sortBy, paginate } from '@/core/utils/filters';

/**
 * @param {object} props
 * @param {array} props.missions - Array of missions
 * @param {Function} props.onView - View handler
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 * @param {Function} props.onPublish - Publish handler
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onDuplicate - Duplicate handler
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.selectable - Selection mode
 * @param {array} props.selectedMissions - Selected mission IDs
 * @param {Function} props.onSelect - Selection handler
 */
export const MissionList = ({
  missions,
  onView,
  onEdit,
  onDelete,
  onPublish,
  onClose,
  onDuplicate,
  loading = false,
  selectable = false,
  selectedMissions = [],
  onSelect
}) => {
  const { missionFilters, sortConfig, viewPreferences } = useFilters();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Apply filters and sorting
  const filteredAndSortedMissions = useMemo(() => {
    let result = filterMissions(missions, missionFilters);
    result = sortBy(result, sortConfig.missions.field, sortConfig.missions.order);
    return result;
  }, [missions, missionFilters, sortConfig.missions]);

  // Apply pagination
  const paginatedData = useMemo(() => {
    return paginate(filteredAndSortedMissions, currentPage, pageSize);
  }, [filteredAndSortedMissions, currentPage, pageSize]);

  const viewMode = viewPreferences.missionsView || 'grid';

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [missionFilters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⏳</div>
          <p className="text-gray-600">Chargement des missions...</p>
        </div>
      </div>
    );
  }

  if (filteredAndSortedMissions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucune mission trouvée
        </h3>
        <p className="text-gray-600">
          {missions.length === 0
            ? 'Commencez par créer votre première mission'
            : 'Essayez de modifier vos filtres'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        {filteredAndSortedMissions.length} mission{filteredAndSortedMissions.length > 1 ? 's' : ''} trouvée{filteredAndSortedMissions.length > 1 ? 's' : ''}
        {missions.length !== filteredAndSortedMissions.length && (
          <span className="text-gray-500"> (sur {missions.length} au total)</span>
        )}
      </div>

      {/* Grid or List view */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {paginatedData.items.map((mission) => {
            const missionId = mission._id || mission.id;
            return (
              <MissionCard
                key={missionId}
                mission={mission}
                onView={() => onView(mission)}
                onEdit={() => onEdit(mission)}
                onDelete={() => onDelete(mission)}
                onPublish={() => onPublish(mission)}
                onClose={() => onClose(mission)}
                onDuplicate={onDuplicate}
                selectable={selectable}
                selected={selectedMissions.includes(missionId)}
                onSelect={onSelect}
              />
            );
          })}
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {paginatedData.items.map((mission) => {
            const missionId = mission._id || mission.id;
            return (
              <MissionCard
                key={missionId}
                mission={mission}
                onView={() => onView(mission)}
                onEdit={() => onEdit(mission)}
                onDelete={() => onDelete(mission)}
                onPublish={() => onPublish(mission)}
                onClose={() => onClose(mission)}
                onDuplicate={onDuplicate}
                selectable={selectable}
                selected={selectedMissions.includes(missionId)}
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
