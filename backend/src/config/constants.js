/**
 * Constantes métier backend — statuts, types, énumérations
 *
 * Source de vérité unique : les modèles Mongoose doivent référencer ces valeurs.
 */

// ── Missions ────────────────────────────────────────────────────────────────
export const MISSION_STATUS = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  CLOSED: 'closed'
});

export const CONTRACT_TYPES = Object.freeze({
  CDI: 'CDI',
  CDD: 'CDD',
  FREELANCE: 'Freelance',
  INTERIM: 'Intérim',
  STAGE: 'Stage',
  ALTERNANCE: 'Alternance'
});

export const REMOTE_TYPES = Object.freeze({
  ONSITE: 'Sur site',
  HYBRID: 'Hybride',
  FULL_REMOTE: 'Full remote'
});

// ── Candidats ────────────────────────────────────────────────────────────────
export const CANDIDATE_STATUS = Object.freeze({
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  INTERVIEW: 'interview',
  OFFER: 'offer',
  HIRED: 'hired',
  REJECTED: 'rejected'
});

export const EXPERIENCE_LEVELS = Object.freeze({
  JUNIOR: 'Junior',
  CONFIRMED: 'Confirmé',
  SENIOR: 'Senior',
  EXPERT: 'Expert'
});

export const AVAILABILITY_OPTIONS = Object.freeze({
  IMMEDIATE: 'Immédiate',
  ONE_MONTH: '1 mois',
  TWO_MONTHS: '2 mois',
  THREE_MONTHS_PLUS: '3 mois+'
});

// ── Candidatures ─────────────────────────────────────────────────────────────
export const APPLICATION_STATUS = Object.freeze({
  APPLIED: 'applied',
  SCREENING: 'screening',
  INTERVIEW: 'interview',
  OFFER: 'offer',
  HIRED: 'hired',
  REJECTED: 'rejected'
});

export const INTERVIEW_TYPES = Object.freeze({
  INTERVIEW: 'interview',
  CALL: 'call',
  MEETING: 'meeting',
  OTHER: 'other'
});

// ── Événements ───────────────────────────────────────────────────────────────
export const EVENT_TYPES = Object.freeze({
  INTERVIEW: 'interview',
  MEETING: 'meeting',
  CALL: 'call',
  DEADLINE: 'deadline',
  OTHER: 'other'
});

export const EVENT_STATUS = Object.freeze({
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled'
});

// ── Utilisateurs / Equipe ────────────────────────────────────────────────────
export const USER_ROLES = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin'
});

export const TEAM_ROLES = Object.freeze({
  ADMIN: 'Admin',
  RECRUITER: 'Recruteur',
  MANAGER: 'Manager',
  CONSULTANT: 'Consultant'
});

// ── Clients ──────────────────────────────────────────────────────────────────
export const CLIENT_STATUS = Object.freeze({
  LEAD: 'lead',
  PROSPECT: 'prospect',
  ACTIVE: 'active',
  INACTIVE: 'inactive'
});

// ── Plans ────────────────────────────────────────────────────────────────────
export const PLANS = Object.freeze({
  STARTER: 'Starter',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise'
});
