/**
 * 🎨 Formatters Utilities
 *
 * Fonctions de formatage pour dates, nombres, textes, etc.
 */

/**
 * Format date to French locale
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'datetime', 'time')
 * @returns {string} - Formatted date
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '-';

  const options = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    datetime: {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    time: { hour: '2-digit', minute: '2-digit' }
  };

  return d.toLocaleDateString('fr-FR', options[format] || options.short);
};

/**
 * Format time only (HH:MM)
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted time
 */
export const formatTime = (date) => {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '-';

  return d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format relative time (il y a X jours)
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted relative time
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffYear > 0) return `il y a ${diffYear} an${diffYear > 1 ? 's' : ''}`;
  if (diffMonth > 0) return `il y a ${diffMonth} mois`;
  if (diffWeek > 0) return `il y a ${diffWeek} semaine${diffWeek > 1 ? 's' : ''}`;
  if (diffDay > 0) return `il y a ${diffDay} jour${diffDay > 1 ? 's' : ''}`;
  if (diffHour > 0) return `il y a ${diffHour} heure${diffHour > 1 ? 's' : ''}`;
  if (diffMin > 0) return `il y a ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
  return 'à l\'instant';
};

/**
 * Format currency (€)
 * @param {number} amount - Amount to format
 * @param {boolean} compact - Use compact notation (50k instead of 50 000)
 * @returns {string} - Formatted currency
 */
export const formatCurrency = (amount, compact = false) => {
  if (amount === null || amount === undefined) return '-';

  if (compact && amount >= 1000) {
    return `${Math.round(amount / 1000)}k€`;
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format number with French locale
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('fr-FR').format(num);
};

/**
 * Format percentage
 * @param {number} value - Value to format (0-100)
 * @param {number} decimals - Number of decimals
 * @returns {string} - Formatted percentage
 */
export const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format phone number (French)
 * @param {string} phone - Phone number
 * @returns {string} - Formatted phone
 */
export const formatPhone = (phone) => {
  if (!phone) return '-';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  return phone;
};

/**
 * Format full name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} - Formatted full name
 */
export const formatFullName = (firstName, lastName) => {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';

  if (!first && !last) return '-';
  if (!first) return last;
  if (!last) return first;

  return `${first} ${last}`;
};

/**
 * Format initials
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} - Initials (e.g., "JD")
 */
export const formatInitials = (firstName, lastName) => {
  const first = firstName?.trim()?.[0]?.toUpperCase() || '';
  const last = lastName?.trim()?.[0]?.toUpperCase() || '';
  return `${first}${last}` || '?';
};

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalize first letter
 * @param {string} text - Text to capitalize
 * @returns {string} - Capitalized text
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Pluralize word
 * @param {number} count - Count
 * @param {string} singular - Singular form
 * @param {string} plural - Plural form (optional, adds 's' by default)
 * @returns {string} - Pluralized word
 */
export const pluralize = (count, singular, plural) => {
  if (count <= 1) return singular;
  return plural || `${singular}s`;
};

/**
 * Format rating as stars
 * @param {number} rating - Rating (0-5)
 * @returns {string} - Stars representation
 */
export const formatRating = (rating) => {
  if (rating === null || rating === undefined) return '-';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return '⭐'.repeat(fullStars) + (hasHalfStar ? '⭐' : '') + '☆'.repeat(emptyStars);
};

/**
 * Format salary range
 * @param {number} minSalary - Minimum salary
 * @param {number} maxSalary - Maximum salary
 * @returns {string} - Formatted salary range
 */
export const formatSalaryRange = (minSalary, maxSalary) => {
  if (!minSalary && !maxSalary) return '-';
  if (!minSalary) return `Jusqu'à ${formatCurrency(maxSalary, true)}`;
  if (!maxSalary) return `À partir de ${formatCurrency(minSalary, true)}`;
  return `${formatCurrency(minSalary, true)} - ${formatCurrency(maxSalary, true)}`;
};

/**
 * Format duration in minutes to human readable
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration
 */
export const formatDuration = (minutes) => {
  if (!minutes) return '-';
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) return `${hours}h`;
  return `${hours}h${mins.toString().padStart(2, '0')}`;
};
