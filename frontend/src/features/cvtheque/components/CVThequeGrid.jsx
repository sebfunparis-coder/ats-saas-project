import React from 'react';
import CandidateCard from '@/features/candidates/components/CandidateCard';
import VirtualizedGrid from '@/shared/components/VirtualizedGrid/VirtualizedGrid';
import { SkeletonCardGrid } from '@/shared/components/Skeleton/Skeleton';
import EmptyState from '@/shared/components/Feedback/EmptyState';

// Au-delà de ce seuil, la grille passe en mode virtualisé (T-257)
const VIRTUALIZE_THRESHOLD = 60;

/**
 * Grille de candidats pour la CVthèque
 */
export function CVThequeGrid({ candidates, onCandidateClick, loading = false }) {
  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '24px',
  };

  const emptyState = (
    <EmptyState
      icon="🔍"
      title="Aucun candidat ne correspond aux critères"
      description="Essayez d'élargir vos filtres ou d'effacer la recherche."
    />
  );

  if (loading && candidates.length === 0) return <SkeletonCardGrid count={6} />;

  if (candidates.length === 0) return emptyState;

  const renderCandidate = (candidate) => (
    <CandidateCard
      candidate={candidate}
      onClick={() => onCandidateClick && onCandidateClick(candidate)}
    />
  );

  if (candidates.length > VIRTUALIZE_THRESHOLD) {
    return (
      <VirtualizedGrid
        items={candidates}
        renderItem={renderCandidate}
        itemMinWidth={360}
        itemHeight={340}
        gap={24}
        emptyState={emptyState}
      />
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
