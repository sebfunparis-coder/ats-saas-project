import React from 'react';
import MissionCard from './MissionCard';
import { SkeletonCardGrid } from '@/shared/components/Skeleton/Skeleton';
import EmptyState from '@/shared/components/Feedback/EmptyState';

/**
 * Liste des missions en grille
 *
 * @example
 * <MissionList
 *   missions={missions}
 *   onMissionClick={handleMissionClick}
 * />
 */
export function MissionList({ missions = [], onMissionClick, staleIds = new Set(), emptyMessage = 'Aucune mission pour l\'instant', emptyDescription, emptyAction, loading = false }) {
  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '24px',
  };

  if (loading && missions.length === 0) return <SkeletonCardGrid count={6} />;

  if (missions.length === 0) {
    return (
      <EmptyState
        icon="💼"
        title={emptyMessage}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div style={gridStyles}>
      {missions.map((mission) => (
        <MissionCard
          key={mission.id}
          mission={mission}
          isStale={staleIds.has(mission.id)}
          onClick={() => onMissionClick && onMissionClick(mission)}
        />
      ))}
    </div>
  );
}

export default MissionList;
