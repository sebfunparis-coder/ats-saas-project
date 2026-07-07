import { useState, useEffect } from 'react';

/**
 * Charge la liste des métiers (`data/metiers.js`, 21 121 entrées, 750 kB —
 * le plus gros chunk du bundle) à la demande plutôt qu'au chargement de la
 * page, même pattern que le lazy-load déjà utilisé pour pdfjs-dist (T-260).
 * Utilisé par les 3 formulaires qui en ont besoin (Candidat, CVthèque,
 * Mission) — `options` reste `[]` le temps du chargement, `CreatableSelect`
 * gère déjà proprement une liste vide (affiche "Aucune option disponible").
 */
export function useLazyMetiers() {
  const [metiers, setMetiers] = useState([]);

  useEffect(() => {
    let cancelled = false;
    import('@/data/metiers').then((mod) => {
      if (!cancelled) setMetiers(mod.METIERS);
    });
    return () => { cancelled = true; };
  }, []);

  return metiers;
}
