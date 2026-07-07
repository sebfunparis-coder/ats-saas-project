import React from 'react';
import CandidateCard from './CandidateCard';
import SwipeToDelete from '@/shared/components/SwipeToDelete/SwipeToDelete';
import VirtualizedGrid from '@/shared/components/VirtualizedGrid/VirtualizedGrid';
import { SkeletonCardGrid } from '@/shared/components/Skeleton/Skeleton';
import EmptyState from '@/shared/components/Feedback/EmptyState';

// Au-delà de ce seuil, la grille passe en mode virtualisé (T-257) — en dessous,
// le rendu DOM classique est conservé pour ne pas changer le comportement de
// scroll (page entière) sur les listes de taille normale.
const VIRTUALIZE_THRESHOLD = 60;

/**
 * Liste des candidats en grille
 *
 * @example
 * <CandidateList
 *   candidates={candidates}
 *   onCandidateClick={handleCandidateClick}
 * />
 */
export function CandidateList({ candidates = [], onCandidateClick, emptyMessage = "Aucun candidat pour l'instant", emptyDescription, emptyAction, selectedIds, onToggleSelect, onDeleteCandidate, loading = false }) {
  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '24px',
  };

  const emptyState = (
    <EmptyState
      icon="👥"
      title={emptyMessage}
      description={emptyDescription}
      action={emptyAction}
    />
  );

  if (loading && candidates.length === 0) return <SkeletonCardGrid count={6} />;

  if (candidates.length === 0) return emptyState;

  const renderCandidate = (candidate) => {
    const isSelected = selectedIds && selectedIds.has(candidate.id);
    const card = (
      <div style={{ position: 'relative' }}>
        {onToggleSelect && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}
            onClick={e => { e.stopPropagation(); onToggleSelect(candidate.id); }}>
            <div style={{
              width: '20px', height: '20px', borderRadius: '5px',
              border: `2px solid ${isSelected ? '#667EEA' : '#D1D5DB'}`,
              background: isSelected ? '#667EEA' : 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {isSelected && <span style={{ color: 'white', fontSize: '12px', lineHeight: 1, fontWeight: '900' }}>✓</span>}
            </div>
          </div>
        )}
        <div style={{ outline: isSelected ? '2px solid #667EEA' : 'none', borderRadius: '16px', transition: 'outline 0.15s' }}>
          <CandidateCard
            candidate={candidate}
            onClick={() => onCandidateClick && onCandidateClick(candidate)}
            hasCheckbox={!!onToggleSelect}
          />
        </div>
      </div>
    );
    return onDeleteCandidate ? (
      <SwipeToDelete onDelete={() => onDeleteCandidate(candidate)}>{card}</SwipeToDelete>
    ) : card;
  };

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
        <div key={candidate.id}>{renderCandidate(candidate)}</div>
      ))}
    </div>
  );
}

export default CandidateList;
