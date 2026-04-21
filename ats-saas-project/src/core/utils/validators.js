/**
 * Utilitaires de validation
 * Fonctions pour valider emails, téléphones, formulaires, etc.
 */

/**
 * Valide une adresse email
 * @param {string} email - Email à valider
 * @returns {boolean} True si valide
 *
 * @example
 * isValidEmail('test@example.com') // true
 * isValidEmail('invalid-email') // false
 */
export function isValidEmail(email) {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide un numéro de téléphone français
 * @param {string} phone - Numéro de téléphone
 * @returns {boolean} True si valide
 *
 * @example
 * isValidPhone('0612345678') // true
 * isValidPhone('+33612345678') // true
 * isValidPhone('123') // false
 */
export function isValidPhone(phone) {
  if (!phone) return false;

  const cleaned = phone.replace(/\D/g, '');

  // Format français : 10 chiffres commençant par 0
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return true;
  }

  // Format international : +33 suivi de 9 chiffres
  if (cleaned.length === 11 && cleaned.startsWith('33')) {
    return true;
  }

  return false;
}

/**
 * Valide une URL
 * @param {string} url - URL à valider
 * @returns {boolean} True si valide
 *
 * @example
 * isValidUrl('https://example.com') // true
 * isValidUrl('not-a-url') // false
 */
export function isValidUrl(url) {
  if (!url) return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valide un mot de passe selon des critères
 * @param {string} password - Mot de passe à valider
 * @param {object} options - Options de validation
 * @returns {object} { isValid, errors }
 *
 * @example
 * validatePassword('Test123!', { minLength: 8, requireNumbers: true })
 * // { isValid: true, errors: [] }
 */
export function validatePassword(password, options = {}) {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false,
  } = options;

  const errors = [];

  if (!password) {
    return { isValid: false, errors: ['Le mot de passe est requis'] };
  }

  if (password.length < minLength) {
    errors.push(`Le mot de passe doit contenir au moins ${minLength} caractères`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }

  if (requireNumbers && !/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valide un objet de formulaire
 * @param {object} data - Données du formulaire
 * @param {object} schema - Schéma de validation
 * @returns {object} { isValid, errors }
 *
 * @example
 * const schema = {
 *   email: { required: true, type: 'email' },
 *   name: { required: true, minLength: 2 }
 * };
 * validateForm({ email: 'test@test.com', name: 'Jo' }, schema)
 */
export function validateForm(data, schema) {
  const errors = {};
  let isValid = true;

  Object.keys(schema).forEach(field => {
    const rules = schema[field];
    const value = data[field];

    // Required
    if (rules.required && (!value || value.toString().trim() === '')) {
      errors[field] = 'Ce champ est requis';
      isValid = false;
      return;
    }

    if (!value) return; // Si pas de valeur et pas required, skip les autres validations

    // Type validation
    if (rules.type === 'email' && !isValidEmail(value)) {
      errors[field] = 'Email invalide';
      isValid = false;
      return;
    }

    if (rules.type === 'phone' && !isValidPhone(value)) {
      errors[field] = 'Numéro de téléphone invalide';
      isValid = false;
      return;
    }

    if (rules.type === 'url' && !isValidUrl(value)) {
      errors[field] = 'URL invalide';
      isValid = false;
      return;
    }

    // Min/Max length
    if (rules.minLength && value.length < rules.minLength) {
      errors[field] = `Minimum ${rules.minLength} caractères`;
      isValid = false;
      return;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors[field] = `Maximum ${rules.maxLength} caractères`;
      isValid = false;
      return;
    }

    // Min/Max value (pour nombres)
    if (rules.min !== undefined && Number(value) < rules.min) {
      errors[field] = `La valeur minimum est ${rules.min}`;
      isValid = false;
      return;
    }

    if (rules.max !== undefined && Number(value) > rules.max) {
      errors[field] = `La valeur maximum est ${rules.max}`;
      isValid = false;
      return;
    }

    // Pattern (regex)
    if (rules.pattern && !rules.pattern.test(value)) {
      errors[field] = rules.patternMessage || 'Format invalide';
      isValid = false;
      return;
    }

    // Custom validator
    if (rules.validator && !rules.validator(value, data)) {
      errors[field] = rules.validatorMessage || 'Valeur invalide';
      isValid = false;
      return;
    }
  });

  return { isValid, errors };
}

/**
 * Vérifie si une chaîne est vide (null, undefined, ou que des espaces)
 * @param {string} str - Chaîne à vérifier
 * @returns {boolean} True si vide
 */
export function isEmpty(str) {
  return !str || str.toString().trim() === '';
}

/**
 * Vérifie si un tableau contient des éléments
 * @param {Array} arr - Tableau à vérifier
 * @returns {boolean} True si non vide
 */
export function isNotEmpty(arr) {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Valide un code postal français
 * @param {string} zipCode - Code postal
 * @returns {boolean} True si valide
 */
export function isValidZipCode(zipCode) {
  if (!zipCode) return false;
  return /^\d{5}$/.test(zipCode);
}

/**
 * Valide un SIRET français
 * @param {string} siret - Numéro SIRET
 * @returns {boolean} True si valide
 */
export function isValidSiret(siret) {
  if (!siret) return false;

  const cleaned = siret.replace(/\s/g, '');
  if (!/^\d{14}$/.test(cleaned)) return false;

  // Algorithme de Luhn
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(cleaned[i]);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }

  return sum % 10 === 0;
}

/**
 * Valide un candidat complet
 * @param {object} candidate - Données du candidat
 * @returns {object} { isValid, errors }
 */
export function validateCandidate(candidate) {
  const errors = [];

  // Nom obligatoire (min 2 caractères)
  if (!candidate.name || candidate.name.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }

  // Email valide
  if (!candidate.email) {
    errors.push('L\'email est obligatoire');
  } else if (!isValidEmail(candidate.email)) {
    errors.push('L\'email est invalide');
  }

  // Téléphone optionnel mais doit être valide si fourni
  if (candidate.phone && !isValidPhone(candidate.phone)) {
    errors.push('Le numéro de téléphone est invalide');
  }

  // Position obligatoire
  if (!candidate.position || candidate.position.trim().length < 2) {
    errors.push('Le poste doit être renseigné');
  }

  // Localisation obligatoire
  if (!candidate.location || candidate.location.trim().length < 2) {
    errors.push('La localisation est obligatoire');
  }

  // Experience doit être un nombre positif
  if (candidate.experience !== undefined) {
    const exp = parseInt(candidate.experience);
    if (isNaN(exp) || exp < 0 || exp > 50) {
      errors.push('L\'expérience doit être entre 0 et 50 ans');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valide une mission complète
 * @param {object} mission - Données de la mission
 * @returns {object} { isValid, errors }
 */
export function validateMission(mission) {
  const errors = [];

  // Titre obligatoire
  if (!mission.title || mission.title.trim().length < 3) {
    errors.push('Le titre doit contenir au moins 3 caractères');
  }

  // Client obligatoire
  if (!mission.client || mission.client.trim().length < 2) {
    errors.push('Le nom du client est obligatoire');
  }

  // Location obligatoire
  if (!mission.location || mission.location.trim().length < 2) {
    errors.push('La localisation est obligatoire');
  }

  // Salaire optionnel mais doit être valide si fourni
  if (mission.salary) {
    const salaryRegex = /^\d+k?(-\d+k?)?\s?€?$/i;
    if (!salaryRegex.test(mission.salary)) {
      errors.push('Format de salaire invalide (ex: 50k-70k€)');
    }
  }

  // Skills doivent être un tableau
  if (mission.skills && !Array.isArray(mission.skills)) {
    errors.push('Les compétences doivent être une liste');
  }

  // Date de début valide si fournie
  if (mission.startDate) {
    const date = new Date(mission.startDate);
    if (isNaN(date.getTime())) {
      errors.push('La date de début est invalide');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valide un client/entreprise
 * @param {object} client - Données du client
 * @returns {object} { isValid, errors }
 */
export function validateClient(client) {
  const errors = [];

  // Nom obligatoire
  if (!client.name || client.name.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }

  // Email valide
  if (!client.email) {
    errors.push('L\'email est obligatoire');
  } else if (!isValidEmail(client.email)) {
    errors.push('L\'email est invalide');
  }

  // Industrie obligatoire
  if (!client.industry || client.industry.trim().length < 2) {
    errors.push('Le secteur d\'activité est obligatoire');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valide une entreprise (pour SuperAdmin)
 * @param {object} company - Données de l'entreprise
 * @returns {object} { isValid, errors }
 */
export function validateCompany(company) {
  const errors = [];

  // Nom obligatoire
  if (!company.name || company.name.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }

  // Email valide
  if (!company.email) {
    errors.push('L\'email est obligatoire');
  } else if (!isValidEmail(company.email)) {
    errors.push('L\'email est invalide');
  }

  // Plan valide
  const validPlans = ['Starter', 'Professional', 'Enterprise'];
  if (company.plan && !validPlans.includes(company.plan)) {
    errors.push('Plan invalide (Starter, Professional ou Enterprise)');
  }

  // Status valide
  const validStatuses = ['active', 'trial', 'suspended', 'cancelled'];
  if (company.status && !validStatuses.includes(company.status)) {
    errors.push('Statut invalide');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valide un événement
 * @param {object} event - Données de l'événement
 * @returns {object} { isValid, errors }
 */
export function validateEvent(event) {
  const errors = [];

  // Titre obligatoire
  if (!event.title || event.title.trim().length < 3) {
    errors.push('Le titre doit contenir au moins 3 caractères');
  }

  // Date obligatoire et valide
  if (!event.date) {
    errors.push('La date est obligatoire');
  } else {
    const date = new Date(event.date);
    if (isNaN(date.getTime())) {
      errors.push('La date est invalide');
    }
  }

  // Time obligatoire
  if (!event.time) {
    errors.push('L\'heure est obligatoire');
  } else {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(event.time)) {
      errors.push('L\'heure est invalide (format HH:MM)');
    }
  }

  // Type valide
  const validTypes = ['interview', 'meeting', 'call', 'other'];
  if (event.type && !validTypes.includes(event.type)) {
    errors.push('Type d\'événement invalide');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valide un membre d'équipe
 * @param {object} member - Données du membre
 * @returns {object} { isValid, errors }
 */
export function validateTeamMember(member) {
  const errors = [];

  // Nom obligatoire
  if (!member.name || member.name.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }

  // Email valide
  if (!member.email) {
    errors.push('L\'email est obligatoire');
  } else if (!isValidEmail(member.email)) {
    errors.push('L\'email est invalide');
  }

  // Rôle obligatoire
  const validRoles = ['Admin', 'Manager', 'Recruteur', 'Consultant'];
  if (!member.role) {
    errors.push('Le rôle est obligatoire');
  } else if (!validRoles.includes(member.role)) {
    errors.push(`Rôle invalide (${validRoles.join(', ')})`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Helper pour formater les erreurs de validation
 * @param {Array} errors - Liste des erreurs
 * @returns {string} Message formaté
 */
export function formatValidationErrors(errors) {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  return `${errors.length} erreurs:\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}`;
}

/**
 * Sanitize input pour empêcher XSS
 * @param {string} input - Texte à nettoyer
 * @returns {string} Texte nettoyé
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
