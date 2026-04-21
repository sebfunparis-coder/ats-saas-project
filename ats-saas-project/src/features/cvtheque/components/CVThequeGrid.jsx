import React from 'react';
import CandidateCard from '@/features/candidates/components/CandidateCard';

/**
 * Grille de candidats pour la CVthèque
 */
export function CVThequeGrid({ candidates, onCandidateClick }) {
  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
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

  if (candidates.length === 0) {
    return (
      <div style={emptyStateStyles}>
        <div style={emptyIconStyles}>🔍</div>
        <div style={emptyTextStyles}>Aucun candidat ne correspond aux critères</div>
      </div>
    );
  }

  return (
    <div style={gridStyles}>
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          onClick={() => onCandidateClick && onCandidateClick(candidate)}
        />
      ))}
    </div>
  );
}

export default CVThequeGrid;
