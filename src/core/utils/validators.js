/**
 * ✅ Validators Utilities
 *
 * Fonctions de validation pour formulaires
 */

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} - Is valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result {isValid, errors}
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    return { isValid: false, errors: ['Le mot de passe est requis'] };
  }

  if (password.length < 8) {
    errors.push('Au moins 8 caractères');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Au moins une minuscule');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Au moins une majuscule');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Au moins un chiffre');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate phone number (French format)
 * @param {string} phone - Phone to validate
 * @returns {boolean} - Is valid
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 && cleaned.startsWith('0');
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} - Is valid
 */
export const isValidURL = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @returns {boolean} - Is valid
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Validate min length
 * @param {string} value - Value to validate
 * @param {number} min - Minimum length
 * @returns {boolean} - Is valid
 */
export const minLength = (value, min) => {
  if (!value) return false;
  return value.trim().length >= min;
};

/**
 * Validate max length
 * @param {string} value - Value to validate
 * @param {number} max - Maximum length
 * @returns {boolean} - Is valid
 */
export const maxLength = (value, max) => {
  if (!value) return true;
  return value.trim().length <= max;
};

/**
 * Validate number range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} - Is valid
 */
export const isInRange = (value, min, max) => {
  const num = Number(value);
  if (isNaN(num)) return false;
  return num >= min && num <= max;
};

/**
 * Validate date is not in the past
 * @param {Date|string} date - Date to validate
 * @returns {boolean} - Is valid
 */
export const isNotPastDate = (date) => {
  if (!date) return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
};

/**
 * Validate date is in the future
 * @param {Date|string} date - Date to validate
 * @returns {boolean} - Is valid
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  return d > new Date();
};

/**
 * Validate mission form data
 * @param {object} data - Mission data
 * @returns {object} - Validation result {isValid, errors}
 */
export const validateMission = (data) => {
  const errors = {};

  if (!isRequired(data.title)) {
    errors.title = 'Le titre est requis';
  } else if (!minLength(data.title, 3)) {
    errors.title = 'Le titre doit faire au moins 3 caractères';
  } else if (!maxLength(data.title, 100)) {
    errors.title = 'Le titre ne peut pas dépasser 100 caractères';
  }

  if (!isRequired(data.company)) {
    errors.company = 'L\'entreprise est requise';
  }

  if (!isRequired(data.contract)) {
    errors.contract = 'Le type de contrat est requis';
  }

  if (!isRequired(data.location)) {
    errors.location = 'La localisation est requise';
  }

  if (!isRequired(data.description)) {
    errors.description = 'La description est requise';
  } else if (!minLength(data.description, 50)) {
    errors.description = 'La description doit faire au moins 50 caractères';
  }

  if (data.minSalary && data.maxSalary && Number(data.minSalary) > Number(data.maxSalary)) {
    errors.salary = 'Le salaire minimum ne peut pas être supérieur au maximum';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate candidate form data
 * @param {object} data - Candidate data
 * @returns {object} - Validation result {isValid, errors}
 */
export const validateCandidate = (data) => {
  const errors = {};

  if (!isRequired(data.firstName)) {
    errors.firstName = 'Le prénom est requis';
  }

  if (!isRequired(data.lastName)) {
    errors.lastName = 'Le nom est requis';
  }

  if (!isRequired(data.email)) {
    errors.email = 'L\'email est requis';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'L\'email n\'est pas valide';
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Le téléphone n\'est pas valide (format: 06 12 34 56 78)';
  }

  if (!isRequired(data.position)) {
    errors.position = 'Le poste actuel est requis';
  }

  if (data.linkedIn && !isValidURL(data.linkedIn)) {
    errors.linkedIn = 'L\'URL LinkedIn n\'est pas valide';
  }

  if (data.cvUrl && !isValidURL(data.cvUrl)) {
    errors.cvUrl = 'L\'URL du CV n\'est pas valide';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate application form data
 * @param {object} data - Application data
 * @returns {object} - Validation result {isValid, errors}
 */
export const validateApplication = (data) => {
  const errors = {};

  if (!isRequired(data.candidateId)) {
    errors.candidateId = 'Le candidat est requis';
  }

  if (!isRequired(data.missionId)) {
    errors.missionId = 'La mission est requise';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate interview form data
 * @param {object} data - Interview data
 * @returns {object} - Validation result {isValid, errors}
 */
export const validateInterview = (data) => {
  const errors = {};

  if (!isRequired(data.date)) {
    errors.date = 'La date est requise';
  } else if (!isNotPastDate(data.date)) {
    errors.date = 'La date ne peut pas être dans le passé';
  }

  if (!isRequired(data.type)) {
    errors.type = 'Le type d\'entretien est requis';
  }

  if (data.duration && !isInRange(data.duration, 15, 480)) {
    errors.duration = 'La durée doit être entre 15 et 480 minutes';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate client form data
 * @param {object} data - Client data
 * @returns {object} - Validation result {isValid, errors}
 */
export const validateClient = (data) => {
  const errors = {};

  if (!isRequired(data.name)) {
    errors.name = 'Le nom est requis';
  }

  if (!isRequired(data.email)) {
    errors.email = 'L\'email est requis';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'L\'email n\'est pas valide';
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Le téléphone n\'est pas valide';
  }

  if (data.website && !isValidURL(data.website)) {
    errors.website = 'L\'URL du site web n\'est pas valide';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
