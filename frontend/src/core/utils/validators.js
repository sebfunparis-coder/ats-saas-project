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

  // Type valide — T-367 : 'email'/'deadline' manquaient alors que EventForm.jsx
  // les propose dans son <select> et que la contrainte SQL (migration 014) les
  // autorise déjà en base, bloquant silencieusement toute création de ces 2 types.
  const validTypes = ['interview', 'meeting', 'call', 'email', 'deadline', 'other'];
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
