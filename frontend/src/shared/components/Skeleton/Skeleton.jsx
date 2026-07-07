import React from 'react';

const shimmerKeyframes = `
  @keyframes ats-skeleton-shimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
`;

/**
 * Bloc skeleton de base (T-259) — rectangle avec animation shimmer.
 * Brique réutilisée par SkeletonCard/SkeletonRow ci-dessous.
 */
export function Skeleton({ width = '100%', height = '16px', radius = '6px', style = {} }) {
  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        aria-hidden="true"
        style={{
          width,
          height,
          borderRadius: radius,
          background: 'linear-gradient(90deg, var(--skeleton-base, #EEF0F3) 25%, var(--skeleton-highlight, #F7F8FA) 37%, var(--skeleton-base, #EEF0F3) 63%)',
          backgroundSize: '800px 100%',
          animation: 'ats-skeleton-shimmer 1.4s ease-in-out infinite',
          ...style,
        }}
      />
    </>
  );
}

/**
 * Skeleton d'une carte type CandidateCard/MissionCard (avatar + lignes de texte).
 */
export function SkeletonCard() {
  return (
    <div style={{
      background: 'white', borderRadius: '16px', padding: '24px',
      border: '1px solid #F3F4F6', boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
        <Skeleton width="64px" height="64px" radius="50%" />
        <div style={{ flex: 1 }}>
          <Skeleton width="65%" height="18px" style={{ marginBottom: '10px' }} />
          <Skeleton width="45%" height="13px" style={{ marginBottom: '10px' }} />
          <Skeleton width="80%" height="11px" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        <Skeleton width="60px" height="22px" radius="6px" />
        <Skeleton width="60px" height="22px" radius="6px" />
        <Skeleton width="40px" height="22px" radius="6px" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
        <Skeleton width="80px" height="13px" />
        <Skeleton width="60px" height="20px" radius="20px" />
      </div>
    </div>
  );
}

/**
 * Grille de N SkeletonCard — repli pendant le chargement initial d'une
 * liste/grille de cartes (CandidateList, MissionList, CVThequeGrid...).
 */
export function SkeletonCardGrid({ count = 6 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

/**
 * Skeleton d'une ligne de tableau/liste (PipelineListView, tables admin...).
 */
export function SkeletonRow({ columns = 5 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}>
      {Array.from({ length: columns }, (_, i) => (
        <Skeleton key={i} width={i === 0 ? '24%' : `${Math.max(10, 18 - i * 2)}%`} height="13px" />
      ))}
    </div>
  );
}

/**
 * N SkeletonRow empilées.
 */
export function SkeletonRowList({ count = 8, columns = 5 }) {
  return (
    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
      {Array.from({ length: count }, (_, i) => <SkeletonRow key={i} columns={columns} />)}
    </div>
  );
}

export default Skeleton;
