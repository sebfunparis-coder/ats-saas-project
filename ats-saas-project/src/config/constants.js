/**
 * Constantes métier de l'application ATS SaaS
 */

// Statuts des missions
export const MISSION_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  FILLED: 'filled',
  PAUSED: 'paused',
};

export const MISSION_STATUS_LABELS = {
  [MISSION_STATUS.OPEN]: 'Ouverte',
  [MISSION_STATUS.CLOSED]: 'Fermée',
  [MISSION_STATUS.FILLED]: 'Pourvue',
  [MISSION_STATUS.PAUSED]: 'En pause',
};

export const MISSION_STATUS_COLORS = {
  [MISSION_STATUS.OPEN]: '#10B981',
  [MISSION_STATUS.CLOSED]: '#EF4444',
  [MISSION_STATUS.FILLED]: '#8B5CF6',
  [MISSION_STATUS.PAUSED]: '#F59E0B',
};

// Urgence des missions
export const MISSION_URGENCY = {
  LOW: 'a venir',
  MEDIUM: 'urgent',
  HIGH: 'tres urgent',
};

export const MISSION_URGENCY_LABELS = {
  [MISSION_URGENCY.LOW]: 'À venir',
  [MISSION_URGENCY.MEDIUM]: 'Urgent',
  [MISSION_URGENCY.HIGH]: 'Très urgent',
};

// Types de contrat
export const CONTRACT_TYPES = {
  CDI: 'CDI',
  CDD: 'CDD',
  STAGE: 'Stage',
  ALTERNANCE: 'Alternance',
  FREELANCE: 'Freelance',
};

// Modes de travail
export const WORK_MODES = {
  ON_SITE: 'sur site',
  REMOTE: 'total remote',
  HYBRID: 'hybride',
};

export const WORK_MODES_LABELS = {
  [WORK_MODES.ON_SITE]: 'Sur site',
  [WORK_MODES.REMOTE]: 'Télétravail',
  [WORK_MODES.HYBRID]: 'Hybride',
};

// Statuts des candidats
export const CANDIDATE_STATUS = {
  ACTIVE: 'active',
  PASSIVE: 'passive',
  ARCHIVED: 'archived',
};

export const CANDIDATE_STATUS_LABELS = {
  [CANDIDATE_STATUS.ACTIVE]: 'Actif',
  [CANDIDATE_STATUS.PASSIVE]: 'Passif',
  [CANDIDATE_STATUS.ARCHIVED]: 'Archivé',
};

export const CANDIDATE_STATUS_COLORS = {
  [CANDIDATE_STATUS.ACTIVE]: '#10B981',
  [CANDIDATE_STATUS.PASSIVE]: '#F59E0B',
  [CANDIDATE_STATUS.ARCHIVED]: '#6B7280',
};

// Statuts des candidatures (pipeline)
export const APPLICATION_STATUS = {
  RECEIVED: 'received',
  SCREENING: 'screening',
  INTERVIEW_1: 'interview_1',
  INTERVIEW_2: 'interview_2',
  OFFER: 'offer',
  HIRED: 'hired',
  REJECTED: 'rejected',
};

export const APPLICATION_STATUS_LABELS = {
  [APPLICATION_STATUS.RECEIVED]: 'Reçu',
  [APPLICATION_STATUS.SCREENING]: 'Présélection',
  [APPLICATION_STATUS.INTERVIEW_1]: 'Entretien 1',
  [APPLICATION_STATUS.INTERVIEW_2]: 'Entretien 2',
  [APPLICATION_STATUS.OFFER]: 'Offre',
  [APPLICATION_STATUS.HIRED]: 'Embauché',
  [APPLICATION_STATUS.REJECTED]: 'Refusé',
};

// Types d'événements (agenda)
export const EVENT_TYPES = {
  INTERVIEW: 'interview',
  MEETING: 'meeting',
  CALL: 'call',
  EMAIL: 'email',
  DEADLINE: 'deadline',
};

export const EVENT_TYPE_LABELS = {
  [EVENT_TYPES.INTERVIEW]: 'Entretien',
  [EVENT_TYPES.MEETING]: 'Réunion',
  [EVENT_TYPES.CALL]: 'Appel',
  [EVENT_TYPES.EMAIL]: 'Email',
  [EVENT_TYPES.DEADLINE]: 'Échéance',
};

export const EVENT_TYPE_ICONS = {
  [EVENT_TYPES.INTERVIEW]: '👥',
  [EVENT_TYPES.MEETING]: '📅',
  [EVENT_TYPES.CALL]: '📞',
  [EVENT_TYPES.EMAIL]: '📧',
  [EVENT_TYPES.DEADLINE]: '⏰',
};

// Statuts des clients
export const CLIENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PROSPECT: 'prospect',
};

export const CLIENT_STATUS_LABELS = {
  [CLIENT_STATUS.ACTIVE]: 'Actif',
  [CLIENT_STATUS.INACTIVE]: 'Inactif',
  [CLIENT_STATUS.PROSPECT]: 'Prospect',
};

// Plans d'abonnement
export const SUBSCRIPTION_PLANS = {
  STARTER: 'Starter',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
};

export const PLAN_PRICES = {
  [SUBSCRIPTION_PLANS.STARTER]: 99,
  [SUBSCRIPTION_PLANS.PRO]: 299,
  [SUBSCRIPTION_PLANS.ENTERPRISE]: 'Sur devis',
};

// Rôles utilisateurs
export const USER_ROLES = {
  ADMIN: 'Admin',
  RECRUITER: 'Recruteur',
  MANAGER: 'Manager',
  VIEWER: 'Lecteur',
};

// Secteurs d'activité
export const SECTORS = [
  'Tech & IT',
  'Finance',
  'Santé',
  'Éducation',
  'Commerce',
  'Industrie',
  'Services',
  'Marketing & Communication',
  'Création & Design',
  'Ressources Humaines',
  'Juridique',
  'Immobilier',
  'Transport & Logistique',
  'Hôtellerie & Restauration',
  'Autre',
];

// Sources de candidatures
export const CANDIDATE_SOURCES = [
  'LinkedIn',
  'Indeed',
  'Site carrière',
  'Cooptation',
  'Apec',
  'Pôle Emploi',
  'Candidature spontanée',
  'Cabinet de recrutement',
  'École/Université',
  'Behance',
  'GitHub',
  'Autre',
];

// Pagination par défaut
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Formats d'export
export const EXPORT_FORMATS = {
  CSV: 'csv',
  JSON: 'json',
  PDF: 'pdf',
};

// Durée de notification (ms)
export const NOTIFICATION_DURATION = 5000;

// Délai de recherche (debounce)
export const SEARCH_DEBOUNCE_DELAY = 300;

// Export combiné des labels pour faciliter les imports
export const STATUS_LABELS = {
  MISSION_STATUS: MISSION_STATUS_LABELS,
  CANDIDATE_STATUS: CANDIDATE_STATUS_LABELS,
  APPLICATION_STATUS: APPLICATION_STATUS_LABELS,
};

// Export combiné des couleurs
export const STATUS_COLORS = {
  MISSION_STATUS: MISSION_STATUS_COLORS,
  CANDIDATE_STATUS: CANDIDATE_STATUS_COLORS,
};
