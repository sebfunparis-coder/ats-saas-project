/**
 * 📋 Application Constants
 *
 * Centralise toutes les constantes métier de l'application
 */

// ===== STATUS & ÉTATS =====

export const MISSION_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  CLOSED: 'closed'
};

export const MISSION_STATUS_LABELS = {
  [MISSION_STATUS.DRAFT]: 'Brouillon',
  [MISSION_STATUS.ACTIVE]: 'Active',
  [MISSION_STATUS.PAUSED]: 'En pause',
  [MISSION_STATUS.CLOSED]: 'Fermée'
};

export const MISSION_STATUS_COLORS = {
  [MISSION_STATUS.DRAFT]: 'bg-gray-100 text-gray-800',
  [MISSION_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
  [MISSION_STATUS.PAUSED]: 'bg-yellow-100 text-yellow-800',
  [MISSION_STATUS.CLOSED]: 'bg-red-100 text-red-800'
};

export const CANDIDATE_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  REJECTED: 'rejected',
  HIRED: 'hired'
};

export const CANDIDATE_STATUS_LABELS = {
  [CANDIDATE_STATUS.NEW]: 'Nouveau',
  [CANDIDATE_STATUS.CONTACTED]: 'Contacté',
  [CANDIDATE_STATUS.QUALIFIED]: 'Qualifié',
  [CANDIDATE_STATUS.REJECTED]: 'Rejeté',
  [CANDIDATE_STATUS.HIRED]: 'Embauché'
};

export const CANDIDATE_STATUS_COLORS = {
  [CANDIDATE_STATUS.NEW]: 'bg-blue-100 text-blue-800',
  [CANDIDATE_STATUS.CONTACTED]: 'bg-purple-100 text-purple-800',
  [CANDIDATE_STATUS.QUALIFIED]: 'bg-green-100 text-green-800',
  [CANDIDATE_STATUS.REJECTED]: 'bg-red-100 text-red-800',
  [CANDIDATE_STATUS.HIRED]: 'bg-emerald-100 text-emerald-800'
};

export const APPLICATION_STATUS = {
  APPLIED: 'applied',
  SCREENING: 'screening',
  INTERVIEW: 'interview',
  OFFER: 'offer',
  HIRED: 'hired',
  REJECTED: 'rejected'
};

export const APPLICATION_STATUS_LABELS = {
  [APPLICATION_STATUS.APPLIED]: 'Candidature',
  [APPLICATION_STATUS.SCREENING]: 'Présélection',
  [APPLICATION_STATUS.INTERVIEW]: 'Entretien',
  [APPLICATION_STATUS.OFFER]: 'Offre',
  [APPLICATION_STATUS.HIRED]: 'Embauché',
  [APPLICATION_STATUS.REJECTED]: 'Rejeté'
};

export const APPLICATION_STATUS_COLORS = {
  [APPLICATION_STATUS.APPLIED]: 'bg-blue-500',
  [APPLICATION_STATUS.SCREENING]: 'bg-yellow-500',
  [APPLICATION_STATUS.INTERVIEW]: 'bg-purple-500',
  [APPLICATION_STATUS.OFFER]: 'bg-orange-500',
  [APPLICATION_STATUS.HIRED]: 'bg-green-500',
  [APPLICATION_STATUS.REJECTED]: 'bg-red-500'
};

// ===== TYPES & CATÉGORIES =====

export const CONTRACT_TYPES = {
  CDI: 'CDI',
  CDD: 'CDD',
  FREELANCE: 'Freelance',
  INTERIM: 'Intérim',
  STAGE: 'Stage',
  ALTERNANCE: 'Alternance'
};

export const REMOTE_OPTIONS = {
  FULL: 'full',
  HYBRID: 'hybrid',
  ONSITE: 'onsite'
};

export const REMOTE_LABELS = {
  [REMOTE_OPTIONS.FULL]: '100% Remote',
  [REMOTE_OPTIONS.HYBRID]: 'Hybride',
  [REMOTE_OPTIONS.ONSITE]: 'Présentiel'
};

export const SECTORS = [
  'IT / Tech',
  'Finance',
  'Santé',
  'Industrie',
  'Commerce',
  'Marketing',
  'RH',
  'Logistique',
  'Immobilier',
  'Autre'
];

export const DEPARTMENTS = [
  '75 - Paris',
  '92 - Hauts-de-Seine',
  '93 - Seine-Saint-Denis',
  '94 - Val-de-Marne',
  '91 - Essonne',
  '78 - Yvelines',
  '95 - Val-d\'Oise',
  '77 - Seine-et-Marne',
  '69 - Rhône',
  '13 - Bouches-du-Rhône',
  '31 - Haute-Garonne',
  '33 - Gironde',
  '59 - Nord',
  '44 - Loire-Atlantique',
  'Remote'
];

export const EXPERIENCE_LEVELS = [
  'Junior (0-2 ans)',
  'Confirmé (2-5 ans)',
  'Senior (5-10 ans)',
  'Expert (10+ ans)'
];

// ===== ROLES & PERMISSIONS =====

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'superadmin'
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.USER]: 'Utilisateur',
  [USER_ROLES.ADMIN]: 'Administrateur',
  [USER_ROLES.SUPER_ADMIN]: 'Super Admin'
};

// ===== PAGINATION & LIMITS =====

export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_LIMIT = 50;
export const MAX_EXPORT_ITEMS = 1000;

// ===== FORMATS =====

export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const TIME_FORMAT = 'HH:mm';

// ===== VALIDATION =====

export const SALARY_RANGE = {
  MIN: 0,
  MAX: 500000
};

export const RATING_RANGE = {
  MIN: 0,
  MAX: 5
};

// ===== KANBAN COLUMNS =====

export const KANBAN_COLUMNS = [
  {
    id: APPLICATION_STATUS.APPLIED,
    title: APPLICATION_STATUS_LABELS[APPLICATION_STATUS.APPLIED],
    color: APPLICATION_STATUS_COLORS[APPLICATION_STATUS.APPLIED]
  },
  {
    id: APPLICATION_STATUS.SCREENING,
    title: APPLICATION_STATUS_LABELS[APPLICATION_STATUS.SCREENING],
    color: APPLICATION_STATUS_COLORS[APPLICATION_STATUS.SCREENING]
  },
  {
    id: APPLICATION_STATUS.INTERVIEW,
    title: APPLICATION_STATUS_LABELS[APPLICATION_STATUS.INTERVIEW],
    color: APPLICATION_STATUS_COLORS[APPLICATION_STATUS.INTERVIEW]
  },
  {
    id: APPLICATION_STATUS.OFFER,
    title: APPLICATION_STATUS_LABELS[APPLICATION_STATUS.OFFER],
    color: APPLICATION_STATUS_COLORS[APPLICATION_STATUS.OFFER]
  },
  {
    id: APPLICATION_STATUS.HIRED,
    title: APPLICATION_STATUS_LABELS[APPLICATION_STATUS.HIRED],
    color: APPLICATION_STATUS_COLORS[APPLICATION_STATUS.HIRED]
  },
  {
    id: APPLICATION_STATUS.REJECTED,
    title: APPLICATION_STATUS_LABELS[APPLICATION_STATUS.REJECTED],
    color: APPLICATION_STATUS_COLORS[APPLICATION_STATUS.REJECTED]
  }
];

// ===== CALENDAR VIEWS =====

export const CALENDAR_VIEWS = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month'
};

export const CALENDAR_VIEW_LABELS = {
  [CALENDAR_VIEWS.DAY]: 'Jour',
  [CALENDAR_VIEWS.WEEK]: 'Semaine',
  [CALENDAR_VIEWS.MONTH]: 'Mois'
};

// ===== EVENT TYPES =====

export const EVENT_TYPES = {
  INTERVIEW: 'interview',
  MEETING: 'meeting',
  CALL: 'call',
  DEADLINE: 'deadline',
  OTHER: 'other'
};

export const EVENT_TYPE_LABELS = {
  [EVENT_TYPES.INTERVIEW]: 'Entretien',
  [EVENT_TYPES.MEETING]: 'Réunion',
  [EVENT_TYPES.CALL]: 'Appel',
  [EVENT_TYPES.DEADLINE]: 'Deadline',
  [EVENT_TYPES.OTHER]: 'Autre'
};

export const EVENT_TYPE_COLORS = {
  [EVENT_TYPES.INTERVIEW]: 'bg-purple-500',
  [EVENT_TYPES.MEETING]: 'bg-blue-500',
  [EVENT_TYPES.CALL]: 'bg-green-500',
  [EVENT_TYPES.DEADLINE]: 'bg-red-500',
  [EVENT_TYPES.OTHER]: 'bg-gray-500'
};

// ===== EXPORT FORMATS =====

export const EXPORT_FORMATS = {
  CSV: 'csv',
  JSON: 'json',
  PDF: 'pdf'
};

export const EXPORT_FORMAT_LABELS = {
  [EXPORT_FORMATS.CSV]: 'CSV',
  [EXPORT_FORMATS.JSON]: 'JSON',
  [EXPORT_FORMATS.PDF]: 'PDF'
};

// ===== NOTIFICATION TYPES =====

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// ===== LOCAL STORAGE KEYS =====

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  DARK_MODE: 'darkMode',
  FILTERS: 'filters',
  VIEW_PREFERENCES: 'viewPreferences'
};
