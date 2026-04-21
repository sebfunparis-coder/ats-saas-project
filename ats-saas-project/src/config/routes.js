/**
 * Routes de l'application ATS SaaS
 * Centralisation de toutes les routes pour faciliter la maintenance
 */

export const ROUTES = {
  // Routes publiques
  LANDING: '/',
  FEATURES: '/features',
  PRICING: '/pricing',
  INTEGRATIONS: '/integrations',
  BLOG: '/blog',
  CASE_STUDIES: '/case-studies',
  DEMO: '/demo',
  LOGIN: '/login',
  REGISTER: '/register',
  REGISTER_PLAN: '/register/plan',
  REGISTER_PAYMENT: '/register/payment',
  REGISTER_CONFIRM: '/register/confirm',

  // Pages pratiques
  FAQ: '/faq',
  A_PROPOS: '/a-propos',
  CONTACT: '/contact',
  AIDE: '/aide',

  // Pages légales
  MENTIONS_LEGALES: '/mentions-legales',
  POLITIQUE_CONFIDENTIALITE: '/politique-confidentialite',
  CGU: '/cgu',
  POLITIQUE_COOKIES: '/politique-cookies',

  // Routes privées (authentifiées)
  APP: '/app',
  DASHBOARD: '/app/dashboard',

  MISSIONS: '/app/missions',
  MISSIONS_DETAIL: '/app/missions/:id',

  CANDIDATES: '/app/candidates',
  CANDIDATES_DETAIL: '/app/candidates/:id',

  CVTHEQUE: '/app/cvtheque',

  PIPELINE: '/app/pipeline',

  CALENDAR: '/app/calendar',

  TEAM: '/app/team',
  TEAM_MEMBER: '/app/team/:id',

  CLIENTS: '/app/clients',
  CLIENTS_DETAIL: '/app/clients/:id',

  ADMIN: '/app/admin',

  // Routes SuperAdmin
  SUPERADMIN: '/superadmin',
  SUPERADMIN_OVERVIEW: '/superadmin/overview',
  SUPERADMIN_USERS: '/superadmin/users',
  SUPERADMIN_COMPANIES: '/superadmin/companies',
  SUPERADMIN_CANDIDATES: '/superadmin/candidates',
  SUPERADMIN_MISSIONS: '/superadmin/missions',
  SUPERADMIN_LOGS: '/superadmin/logs',
  SUPERADMIN_DATABASE: '/superadmin/database',
};

/**
 * Helper pour construire des routes avec paramètres
 * @param {string} route - Route template
 * @param {object} params - Paramètres à remplacer
 * @returns {string} Route construite
 *
 * @example
 * buildRoute(ROUTES.MISSIONS_DETAIL, { id: 123 })
 * // => '/app/missions/123'
 */
export function buildRoute(route, params = {}) {
  let builtRoute = route;
  Object.keys(params).forEach(key => {
    builtRoute = builtRoute.replace(`:${key}`, params[key]);
  });
  return builtRoute;
}
