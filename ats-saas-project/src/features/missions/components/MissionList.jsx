import React from 'react';
import MissionCard from './MissionCard';

/**
 * Liste des missions en grille
 *
 * @example
 * <MissionList
 *   missions={missions}
 *   onMissionClick={handleMissionClick}
 * />
 */
export function MissionList({ missions = [], onMissionClick, emptyMessage = 'Aucune mission trouvée' }) {
  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '24px',
  };

  const emptyStateStyles = {
    textAlign: 'center',
    padding: '80px 20px',
    color: '#9CA3AF',
  };

  const emptyIconStyles = {
    fontSize: '64px',
    marginBottom: '16px',
  };

  const emptyTextStyles = {
    fontSize: '18px',
    fontWeight: '600',
  };

  if (missions.length === 0) {
    return (
      <div style={emptyStateStyles}>
        <div style={emptyIconStyles}>📭</div>
        <div style={emptyTextStyles}>{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div style={gridStyles}>
      {missions.map((mission) => (
        <MissionCard
          key={mission.id}
          mission={mission}
          onClick={() => onMissionClick && onMissionClick(mission)}
        />
      ))}
    </div>
  );
}

export default MissionList;
