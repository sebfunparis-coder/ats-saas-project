import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook useDebounce - Optimise les recherches et inputs
 *
 * Retarde la mise à jour d'une valeur pour éviter trop d'appels
 * Utile pour les recherches temps réel, autocomplete, etc.
 *
 * @param {any} value - Valeur à debouncer
 * @param {number} delay - Délai en ms (défaut: 500ms)
 * @returns {any} Valeur debouncée
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   // API call avec debouncedSearch
 * }, [debouncedSearch]);
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set un timer pour mettre à jour la valeur après le délai
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup : annuler le timer si value change avant la fin du délai
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook useDebouncedCallback - Debounce une fonction
 *
 * @param {Function} callback - Fonction à debouncer
 * @param {number} delay - Délai en ms
 * @returns {Function} Fonction debouncée
 *
 * @example
 * const handleSearch = useDebouncedCallback((term) => {
 *   searchAPI(term);
 * }, 300);
 *
 * <input onChange={(e) => handleSearch(e.target.value)} />
 */
export function useDebouncedCallback(callback, delay = 500) {
  // T-389 : `timeoutId` en useState + fonction retournée non mémoïsée
  // signifiait qu'un nouveau callback (référence différente) était renvoyé à
  // CHAQUE rendu — cassant silencieusement tout `useEffect`/`useMemo`/enfant
  // mémoïsé dépendant de la stabilité référentielle de la valeur retournée
  // par ce hook. `useRef` (pas de re-render pour suivre le timer) + `useCallback`
  // (référence stable tant que `callback`/`delay` ne changent pas) corrigent ça.
  const timeoutRef = useRef(null);

  // T-412 : sans ce cleanup, un timer déjà armé au moment du démontage du
  // composant appelant continuait à se déclencher après coup, invoquant
  // `callback` sur un composant démonté (état obsolète, avertissement React).
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

export default useDebounce;
