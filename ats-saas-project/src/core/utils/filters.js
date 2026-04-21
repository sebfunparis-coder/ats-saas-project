/**
 * Utilitaires de filtrage et tri
 * Fonctions pour filtrer, trier, rechercher dans des listes
 */

/**
 * Recherche texte dans un objet (recherche dans toutes les propriétés)
 * @param {object} item - Objet à rechercher
 * @param {string} query - Requête de recherche
 * @param {Array} searchFields - Champs spécifiques à rechercher (optionnel)
 * @returns {boolean} True si match trouvé
 *
 * @example
 * searchInObject({ name: 'Jean', email: 'jean@test.com' }, 'jean')
 * // true
 */
export function searchInObject(item, query, searchFields = null) {
  if (!query || query.trim() === '') return true;

  const normalizedQuery = query.toLowerCase().trim();

  const fieldsToSearch = searchFields || Object.keys(item);

  return fieldsToSearch.some(field => {
    const value = item[field];

    if (value === null || value === undefined) return false;

    // Si c'est un tableau (ex: skills), rechercher dans tous les éléments
    if (Array.isArray(value)) {
      return value.some(v =>
        String(v).toLowerCase().includes(normalizedQuery)
      );
    }

    // Sinon recherche simple
    return String(value).toLowerCase().includes(normalizedQuery);
  });
}

/**
 * Filtre une liste par recherche textuelle
 * @param {Array} items - Liste d'items
 * @param {string} query - Requête de recherche
 * @param {Array} searchFields - Champs à rechercher
 * @returns {Array} Items filtrés
 *
 * @example
 * filterBySearch(candidates, 'react', ['skills', 'position'])
 */
export function filterBySearch(items, query, searchFields = null) {
  if (!query || query.trim() === '') return items;

  return items.filter(item => searchInObject(item, query, searchFields));
}

/**
 * Filtre une liste par valeur de propriété
 * @param {Array} items - Liste d'items
 * @param {string} field - Champ à filtrer
 * @param {*} value - Valeur à matcher
 * @returns {Array} Items filtrés
 *
 * @example
 * filterByField(missions, 'status', 'open')
 */
export function filterByField(items, field, value) {
  if (!value || value === 'all') return items;

  return items.filter(item => item[field] === value);
}

/**
 * Filtre par multiple critères
 * @param {Array} items - Liste d'items
 * @param {object} filters - Objet de filtres { field: value }
 * @returns {Array} Items filtrés
 *
 * @example
 * filterByMultiple(candidates, {
 *   status: 'active',
 *   location: 'Paris',
 *   experience: 5
 * })
 */
export function filterByMultiple(items, filters) {
  if (!filters || Object.keys(filters).length === 0) return items;

  return items.filter(item => {
    return Object.keys(filters).every(field => {
      const filterValue = filters[field];

      // Ignorer si 'all' ou vide
      if (filterValue === 'all' || filterValue === '' || filterValue === null) {
        return true;
      }

      return item[field] === filterValue;
    });
  });
}

/**
 * Filtre par plage de dates
 * @param {Array} items - Liste d'items
 * @param {string} dateField - Champ de date
 * @param {string} period - Période ('today', 'week', 'month', '3months', '6months', 'year')
 * @returns {Array} Items filtrés
 *
 * @example
 * filterByDateRange(candidates, 'dateAdded', 'week')
 */
export function filterByDateRange(items, dateField, period) {
  if (period === 'all' || !period) return items;

  const now = new Date();
  const periodDays = {
    today: 0,
    week: 7,
    month: 30,
    '3months': 90,
    '6months': 180,
    year: 365,
  };

  const days = periodDays[period];
  if (days === undefined) return items;

  return items.filter(item => {
    const itemDate = new Date(item[dateField]);
    const diffMs = now - itemDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return diffDays <= days;
  });
}

/**
 * Filtre par tags (un item peut avoir plusieurs tags)
 * @param {Array} items - Liste d'items
 * @param {Array} selectedTags - IDs des tags sélectionnés
 * @param {string} tagsField - Nom du champ contenant les tags
 * @returns {Array} Items filtrés
 *
 * @example
 * filterByTags(candidates, [1, 3], 'tags')
 */
export function filterByTags(items, selectedTags, tagsField = 'tags') {
  if (!selectedTags || selectedTags.length === 0) return items;

  return items.filter(item => {
    const itemTags = item[tagsField] || [];
    return selectedTags.some(tag => itemTags.includes(tag));
  });
}

/**
 * Filtre les favoris
 * @param {Array} items - Liste d'items
 * @param {boolean} favoritesOnly - True pour afficher uniquement les favoris
 * @returns {Array} Items filtrés
 */
export function filterFavorites(items, favoritesOnly) {
  if (!favoritesOnly) return items;
  return items.filter(item => item.favorite === true);
}

/**
 * Tri une liste par champ
 * @param {Array} items - Liste d'items
 * @param {string} field - Champ à trier
 * @param {string} order - Ordre ('asc' ou 'desc')
 * @returns {Array} Items triés
 *
 * @example
 * sortBy(missions, 'startDate', 'desc')
 */
export function sortBy(items, field, order = 'asc') {
  if (!field) return items;

  const sorted = [...items].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    // Gérer les valeurs null/undefined
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // Tri numérique
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Tri par date
    if (field.toLowerCase().includes('date')) {
      const dateA = new Date(aValue);
      const dateB = new Date(bValue);
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    }

    // Tri alphabétique
    const strA = String(aValue).toLowerCase();
    const strB = String(bValue).toLowerCase();

    if (order === 'asc') {
      return strA.localeCompare(strB);
    } else {
      return strB.localeCompare(strA);
    }
  });

  return sorted;
}

/**
 * Pagine une liste
 * @param {Array} items - Liste d'items
 * @param {number} page - Numéro de page (commence à 1)
 * @param {number} pageSize - Taille de la page
 * @returns {object} { items, totalPages, currentPage }
 *
 * @example
 * paginate(candidates, 2, 20)
 * // { items: [...], totalPages: 5, currentPage: 2 }
 */
export function paginate(items, page = 1, pageSize = 20) {
  const totalPages = Math.ceil(items.length / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    items: items.slice(startIndex, endIndex),
    totalPages,
    currentPage,
    totalItems: items.length,
  };
}

/**
 * Groupe des items par valeur de champ
 * @param {Array} items - Liste d'items
 * @param {string} field - Champ de groupement
 * @returns {object} Objet groupé { [value]: [items] }
 *
 * @example
 * groupBy(candidates, 'department')
 * // { '75': [...], '69': [...], ... }
 */
export function groupBy(items, field) {
  return items.reduce((groups, item) => {
    const value = item[field] || 'non défini';
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(item);
    return groups;
  }, {});
}

/**
 * Compte les occurrences par valeur de champ
 * @param {Array} items - Liste d'items
 * @param {string} field - Champ à compter
 * @returns {object} { [value]: count }
 *
 * @example
 * countBy(missions, 'status')
 * // { 'open': 5, 'closed': 2, 'filled': 3 }
 */
export function countBy(items, field) {
  return items.reduce((counts, item) => {
    const value = item[field] || 'non défini';
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

/**
 * Filtre et tri combinés (fonction complète pour CVthèque)
 * @param {Array} items - Liste d'items
 * @param {object} options - Options de filtrage et tri
 * @returns {Array} Items filtrés et triés
 *
 * @example
 * filterAndSort(candidates, {
 *   search: 'react',
 *   searchFields: ['skills', 'position'],
 *   filters: { status: 'active' },
 *   dateRange: { field: 'dateAdded', period: 'month' },
 *   tags: [1, 3],
 *   favoritesOnly: false,
 *   sortBy: 'name',
 *   sortOrder: 'asc'
 * })
 */
export function filterAndSort(items, options = {}) {
  let result = [...items];

  // Recherche textuelle
  if (options.search) {
    result = filterBySearch(result, options.search, options.searchFields);
  }

  // Filtres par champs
  if (options.filters) {
    result = filterByMultiple(result, options.filters);
  }

  // Filtre par plage de dates
  if (options.dateRange) {
    result = filterByDateRange(
      result,
      options.dateRange.field,
      options.dateRange.period
    );
  }

  // Filtre par tags
  if (options.tags && options.tags.length > 0) {
    result = filterByTags(result, options.tags, options.tagsField);
  }

  // Filtre favoris
  if (options.favoritesOnly) {
    result = filterFavorites(result, true);
  }

  // Tri
  if (options.sortBy) {
    result = sortBy(result, options.sortBy, options.sortOrder || 'asc');
  }

  return result;
}
