/**
 * Constantes métier de l'application ATS SaaS
 */

// Statuts des missions
export const MISSION_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  FILLED: 'filled',
  PAUSED: 'paused',
  PENDING_APPROVAL: 'pending_approval',
  DRAFT: 'draft',
};

export const MISSION_STATUS_LABELS = {
  [MISSION_STATUS.OPEN]: 'Ouverte',
  [MISSION_STATUS.CLOSED]: 'Fermée',
  [MISSION_STATUS.FILLED]: 'Pourvue',
  [MISSION_STATUS.PAUSED]: 'En pause',
  [MISSION_STATUS.PENDING_APPROVAL]: 'En attente de validation',
  [MISSION_STATUS.DRAFT]: 'Brouillon (refusée)',
};

export const MISSION_STATUS_COLORS = {
  [MISSION_STATUS.OPEN]: '#10B981',
  [MISSION_STATUS.CLOSED]: '#EF4444',
  [MISSION_STATUS.FILLED]: '#8B5CF6',
  [MISSION_STATUS.PAUSED]: '#F59E0B',
  [MISSION_STATUS.PENDING_APPROVAL]: '#3B82F6',
  [MISSION_STATUS.DRAFT]: '#6B7280',
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
// T-390 : 'hired' est une valeur réelle de candidate.status (option dynamique
// par défaut — voir INITIAL_CANDIDATE_STATUSES dans DataContext.jsx) mais
// n'était déclarée nulle part ici, donc absente du badge (retombait dans le
// variant "error"/rouge, alors qu'"embauché" est le meilleur statut possible).
export const CANDIDATE_STATUS = {
  ACTIVE: 'active',
  PASSIVE: 'passive',
  HIRED: 'hired',
  ARCHIVED: 'archived',
};

export const CANDIDATE_STATUS_LABELS = {
  [CANDIDATE_STATUS.ACTIVE]: 'Actif',
  [CANDIDATE_STATUS.PASSIVE]: 'Passif',
  [CANDIDATE_STATUS.HIRED]: 'Recruté',
  [CANDIDATE_STATUS.ARCHIVED]: 'Archivé',
};

export const CANDIDATE_STATUS_COLORS = {
  [CANDIDATE_STATUS.ACTIVE]: '#10B981',
  [CANDIDATE_STATUS.PASSIVE]: '#F59E0B',
  [CANDIDATE_STATUS.HIRED]: '#8B5CF6',
  [CANDIDATE_STATUS.ARCHIVED]: '#6B7280',
};

// Statuts des candidatures (pipeline)
// T-395 : l'enum n'incluait ni FINAL ni ARCHIVED alors que ces deux statuts
// sont réellement utilisés partout dans le pipeline (colonne Kanban dédiée,
// filtre "Archivées"...) — seul `APPLICATION_STATUS_COLORS` les avait, en
// clés ad-hoc hors enum. Complété pour que l'enum reflète les 9 statuts réels.
export const APPLICATION_STATUS = {
  RECEIVED: 'received',
  SCREENING: 'screening',
  INTERVIEW_1: 'interview_1',
  INTERVIEW_2: 'interview_2',
  OFFER: 'offer',
  FINAL: 'final',
  HIRED: 'hired',
  REJECTED: 'rejected',
  ARCHIVED: 'archived',
};

export const APPLICATION_STATUS_LABELS = {
  [APPLICATION_STATUS.RECEIVED]: 'Reçu',
  [APPLICATION_STATUS.SCREENING]: 'Présélection',
  [APPLICATION_STATUS.INTERVIEW_1]: 'Entretien 1',
  [APPLICATION_STATUS.INTERVIEW_2]: 'Entretien 2',
  [APPLICATION_STATUS.OFFER]: 'Offre',
  [APPLICATION_STATUS.FINAL]: 'Finaliste',
  [APPLICATION_STATUS.HIRED]: 'Embauché',
  [APPLICATION_STATUS.REJECTED]: 'Refusé',
  [APPLICATION_STATUS.ARCHIVED]: 'Archivé',
};

// Couleurs du pipeline de candidatures (statut → couleur) — source unique.
// Utilisée par CandidateDetail, PipelineListView, CandidateCompareModal, KanbanBoard
// et AnalyticsPage pour qu'un même statut affiche toujours la même couleur.
export const APPLICATION_STATUS_COLORS = {
  [APPLICATION_STATUS.RECEIVED]: '#6B7280',
  [APPLICATION_STATUS.SCREENING]: '#3B82F6',
  [APPLICATION_STATUS.INTERVIEW_1]: '#F59E0B',
  [APPLICATION_STATUS.INTERVIEW_2]: '#8B5CF6',
  [APPLICATION_STATUS.OFFER]: '#10B981',
  [APPLICATION_STATUS.FINAL]: '#059669',
  [APPLICATION_STATUS.HIRED]: '#EC4899',
  [APPLICATION_STATUS.REJECTED]: '#EF4444',
  [APPLICATION_STATUS.ARCHIVED]: '#9CA3AF',
};

// T-395 : ces libellés+couleurs+fond étaient redéfinis à l'identique dans 3
// fichiers (PipelinePage.jsx, CandidateDetail.jsx, PipelineListView.jsx) —
// dont 2 sans l'entrée `archived`, déjà divergentes. Source unique désormais.
export const APPLICATION_PIPELINE_STAGES = {
  [APPLICATION_STATUS.RECEIVED]:    { label: '📨 Reçue',        color: APPLICATION_STATUS_COLORS.received,    bg: '#F3F4F6' },
  [APPLICATION_STATUS.SCREENING]:   { label: '🔍 Présélection', color: APPLICATION_STATUS_COLORS.screening,   bg: '#EFF6FF' },
  [APPLICATION_STATUS.INTERVIEW_1]: { label: '👥 Entretien 1',  color: APPLICATION_STATUS_COLORS.interview_1, bg: '#FFFBEB' },
  [APPLICATION_STATUS.INTERVIEW_2]: { label: '🎯 Entretien 2',  color: APPLICATION_STATUS_COLORS.interview_2, bg: '#F5F3FF' },
  [APPLICATION_STATUS.OFFER]:       { label: '📋 Offre',        color: APPLICATION_STATUS_COLORS.offer,       bg: '#ECFDF5' },
  [APPLICATION_STATUS.FINAL]:       { label: '✅ Finaliste',    color: APPLICATION_STATUS_COLORS.final,       bg: '#D1FAE5' },
  [APPLICATION_STATUS.HIRED]:       { label: '🎉 Recruté',      color: APPLICATION_STATUS_COLORS.hired,       bg: '#FDF2F8' },
  [APPLICATION_STATUS.REJECTED]:    { label: '❌ Refusé',       color: APPLICATION_STATUS_COLORS.rejected,    bg: '#FEF2F2' },
  [APPLICATION_STATUS.ARCHIVED]:    { label: '🗄️ Archivé',      color: APPLICATION_STATUS_COLORS.archived,    bg: '#F9FAFB' },
};

// T-391 : transitions valides du pipeline — n'étaient consommées que par les
// boutons "Déplacer vers" du modal (PipelinePage.jsx), jamais par le drag &
// drop du Kanban (KanbanBoard.jsx `handleDrop`), qui autorisait un saut direct
// ex. received → hired. Source unique désormais utilisée par les deux.
export const APPLICATION_NEXT_STATUSES = {
  [APPLICATION_STATUS.RECEIVED]:    [APPLICATION_STATUS.SCREENING, APPLICATION_STATUS.REJECTED],
  [APPLICATION_STATUS.SCREENING]:   [APPLICATION_STATUS.INTERVIEW_1, APPLICATION_STATUS.REJECTED],
  [APPLICATION_STATUS.INTERVIEW_1]: [APPLICATION_STATUS.INTERVIEW_2, APPLICATION_STATUS.OFFER, APPLICATION_STATUS.REJECTED],
  [APPLICATION_STATUS.INTERVIEW_2]: [APPLICATION_STATUS.OFFER, APPLICATION_STATUS.FINAL, APPLICATION_STATUS.REJECTED],
  [APPLICATION_STATUS.OFFER]:       [APPLICATION_STATUS.HIRED, APPLICATION_STATUS.REJECTED],
  [APPLICATION_STATUS.FINAL]:       [APPLICATION_STATUS.HIRED, APPLICATION_STATUS.REJECTED],
  [APPLICATION_STATUS.HIRED]:       [],
  [APPLICATION_STATUS.REJECTED]:    [APPLICATION_STATUS.RECEIVED],
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

// Plans d'abonnement (voir CLAUDE.md "Règles métier critiques")
export const PLANS = {
  SOLO: 'solo',
  TEAM_3: 'team_3',
  TEAM_6: 'team_6',
};

export const PLAN_LABELS = {
  [PLANS.SOLO]: 'Solo',
  [PLANS.TEAM_3]: 'Manager · 3 postes',
  [PLANS.TEAM_6]: 'Manager · 6 postes',
};

// Prix réels en euros. annualMonthly = prix mensuel équivalent si engagement
// annuel (payé en une fois pour annualTotal).
export const PLAN_PRICING = {
  [PLANS.SOLO]:   { monthly: 29.90, annualMonthly: 19.90, annualTotal: 238.80, seats: 1 },
  [PLANS.TEAM_3]: { monthly: 69.90, annualMonthly: 49.90, annualTotal: 598.80, seats: 3 },
  [PLANS.TEAM_6]: { monthly: 99.90, annualMonthly: 79.90, annualTotal: 958.80, seats: 6 },
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
