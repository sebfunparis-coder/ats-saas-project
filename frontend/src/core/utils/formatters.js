/**
 * Retourne la locale BCP 47 courante depuis localStorage (T-304).
 * Utilisé par toutes les fonctions de formatage pour remplacer 'fr-FR' hardcodé.
 */
function getLocale() {
  const lang = (typeof localStorage !== 'undefined' ? localStorage.getItem('ats_language') : null) || 'fr';
  return lang.startsWith('en') ? 'en-GB' : 'fr-FR';
}

/**
 * Utilitaires de formatage
 * Fonctions pour formater dates, nombres, devises, texte, etc.
 */

/**
 * Formate une date en format français
 * @param {string|Date} date - Date à formater
 * @param {string} format - Format de sortie ('short', 'long', 'time')
 * @returns {string} Date formatée
 *
 * @example
 * formatDate('2026-02-17') // '17/02/2026'
 * formatDate('2026-02-17', 'long') // '17 février 2026'
 */
export function formatDate(date, format = 'short') {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  if (format === 'short') {
    return d.toLocaleDateString(getLocale());
  }

  if (format === 'long') {
    return d.toLocaleDateString(getLocale(), {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  if (format === 'time') {
    return d.toLocaleTimeString(getLocale(), {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (format === 'datetime') {
    return d.toLocaleDateString(getLocale(), {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return d.toLocaleDateString(getLocale());
}

/**
 * Formate un montant en devise
 * @param {number} amount - Montant à formater
 * @param {string} currency - Code devise (EUR, USD, etc.)
 * @returns {string} Montant formaté
 *
 * @example
 * formatCurrency(1500) // '1 500,00 €'
 * formatCurrency(1500, 'USD') // '$1,500.00'
 */
export function formatCurrency(amount, currency = 'EUR') {
  if (amount === null || amount === undefined) return '';

  return new Intl.NumberFormat(getLocale(), {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Formate un nombre avec séparateurs de milliers
 * @param {number} number - Nombre à formater
 * @returns {string} Nombre formaté
 *
 * @example
 * formatNumber(1500000) // '1 500 000'
 */
export function formatNumber(number) {
  if (number === null || number === undefined) return '';
  return new Intl.NumberFormat(getLocale()).format(number);
}

/**
 * Formate une taille de fichier en unités lisibles
 * @param {number} bytes - Taille en bytes
 * @returns {string} Taille formatée
 *
 * @example
 * formatFileSize(1024) // '1 KB'
 * formatFileSize(1048576) // '1 MB'
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Formate un numéro de téléphone français
 * @param {string} phone - Numéro de téléphone
 * @returns {string} Numéro formaté
 *
 * @example
 * formatPhone('0612345678') // '06 12 34 56 78'
 * formatPhone('+33612345678') // '+33 6 12 34 56 78'
 */
export function formatPhone(phone) {
  if (!phone) return '';

  // Supprime tous les espaces et caractères spéciaux
  const cleaned = phone.replace(/\D/g, '');

  // Format français
  if (cleaned.startsWith('33')) {
    return '+33 ' + cleaned.slice(2).match(/.{1,2}/g)?.join(' ') || '';
  }

  if (cleaned.length === 10) {
    return cleaned.match(/.{1,2}/g)?.join(' ') || '';
  }

  return phone;
}

/**
 * Capitalise la première lettre d'une chaîne
 * @param {string} str - Chaîne à capitaliser
 * @returns {string} Chaîne capitalisée
 *
 * @example
 * capitalize('bonjour') // 'Bonjour'
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Tronque un texte avec ellipse
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Texte tronqué
 *
 * @example
 * truncate('Lorem ipsum dolor sit amet', 10) // 'Lorem ipsu...'
 */
export function truncate(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Formate un pourcentage
 * @param {number} value - Valeur (0-1 ou 0-100)
 * @param {boolean} isDecimal - True si la valeur est entre 0 et 1
 * @returns {string} Pourcentage formaté
 *
 * @example
 * formatPercentage(0.5, true) // '50%'
 * formatPercentage(75, false) // '75%'
 */
export function formatPercentage(value, isDecimal = false) {
  if (value === null || value === undefined) return '';
  const percent = isDecimal ? value * 100 : value;
  return Math.round(percent) + '%';
}

/**
 * Formate une durée en format lisible
 * @param {number} minutes - Durée en minutes
 * @returns {string} Durée formatée
 *
 * @example
 * formatDuration(90) // '1h 30min'
 * formatDuration(45) // '45min'
 */
export function formatDuration(minutes) {
  if (!minutes) return '0min';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;

  return `${hours}h ${mins}min`;
}

/**
 * Formate une date relative (il y a X jours)
 * @param {string|Date} date - Date
 * @returns {string} Date relative
 *
 * @example
 * formatRelativeDate('2026-02-16') // 'il y a 1 jour'
 */
export function formatRelativeDate(date) {
  if (!date) return '';

  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return 'hier';
  if (diffDays < 7) return `il y a ${diffDays} jours`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `il y a ${months} mois`;
  }

  const years = Math.floor(diffDays / 365);
  return `il y a ${years} an${years > 1 ? 's' : ''}`;
}

/**
 * Génère des initiales à partir d'un nom
 * @param {string} name - Nom complet
 * @returns {string} Initiales
 *
 * @example
 * getInitials('Jean Dupont') // 'JD'
 */
export function getInitials(name) {
  if (!name) return '';

  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
