import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Focus trap (T-264 — WCAG 2.1 AA) — confine Tab/Shift+Tab à l'intérieur d'un
 * conteneur modal. Le focus revient au déclencheur quand la trap se désactive.
 *
 * @param {boolean} active — activer/désactiver le trap (typiquement = isOpen)
 * @returns {React.RefObject} — à poser sur l'élément conteneur de la modal
 */
export function useFocusTrap(active) {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    previousFocusRef.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    // Focus le premier élément focusable si aucun n'a déjà le focus
    const focusableEls = Array.from(container.querySelectorAll(FOCUSABLE));
    if (focusableEls.length && !container.contains(document.activeElement)) {
      focusableEls[0].focus();
    }

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(container.querySelectorAll(FOCUSABLE));
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Rend le focus au déclencheur quand la modale se ferme
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [active]);

  return containerRef;
}
