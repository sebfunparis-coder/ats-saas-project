import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = '(max-width: 768px)';

/**
 * Détecte le breakpoint mobile (< 768px) en temps réel via matchMedia.
 * Utilisé pour piloter la navigation drawer/sidebar (T-254/T-255) — ce
 * codebase n'utilise pas de CSS Modules pour la mise en page (tout en inline
 * style), donc la logique responsive de layout passe par du state React
 * plutôt que par des media queries CSS classiques.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_BREAKPOINT).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_BREAKPOINT);
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isMobile;
}

export default useIsMobile;
