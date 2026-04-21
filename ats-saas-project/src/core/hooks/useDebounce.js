import { useState, useEffect } from 'react';

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
  const [timeoutId, setTimeoutId] = useState(null);

  return (...args) => {
    // Annuler le timeout précédent
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Créer un nouveau timeout
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}

export default useDebounce;
