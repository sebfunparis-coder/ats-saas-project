import React, { useRef, useState } from 'react';
import { useIsMobile } from '@/core/hooks/useIsMobile';

const SWIPE_THRESHOLD = 80;
const MAX_SWIPE = 110;

/**
 * Enveloppe un élément de liste avec un geste swipe-to-delete (T-256) — glisser
 * vers la gauche révèle une action de suppression, glisser au-delà du seuil et
 * relâcher déclenche `onDelete`. Actif uniquement sur mobile/tactile (useIsMobile) ;
 * sur desktop, rend simplement les enfants tels quels (la souris n'a pas de
 * geste "swipe" équivalent, et le clic normal reste la voie d'accès principale).
 */
export function SwipeToDelete({ children, onDelete, disabled = false }) {
  const isMobile = useIsMobile();
  const [translateX, setTranslateX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  if (!isMobile || disabled) return children;

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    setDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!dragging) return;
    const delta = e.touches[0].clientX - startX.current;
    // Ne permet que le swipe vers la gauche (delta négatif)
    setTranslateX(Math.max(-MAX_SWIPE, Math.min(0, delta)));
  };

  const handleTouchEnd = () => {
    setDragging(false);
    if (translateX <= -SWIPE_THRESHOLD) {
      onDelete();
    }
    setTranslateX(0);
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, background: '#EF4444',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 24px', color: 'white', fontWeight: '800', fontSize: '14px',
          opacity: Math.min(1, Math.abs(translateX) / SWIPE_THRESHOLD),
        }}
      >
        🗑️ Supprimer
      </div>
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: dragging ? 'none' : 'transform 0.2s ease',
          touchAction: 'pan-y',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default SwipeToDelete;
