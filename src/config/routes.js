/**
 * 🚦 Routes Configuration
 *
 * Centralise toutes les routes de l'application
 */

export const ROUTES = {
  // Public routes
  HOME: '/',

  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',

  // App routes (protected)
  APP: {
    ROOT: '/app',
    DASHBOARD: '/app/dashboard',
    MISSIONS: {
      ROOT: '/app/missions',
      NEW: '/app/missions/new',
      DETAIL: '/app/missions/:id',
      EDIT: '/app/missions/:id/edit'
    },
    CANDIDATES: {
      ROOT: '/app/candidates',
      NEW: '/app/candidates/new',
      DETAIL: '/app/candidates/:id',
      EDIT: '/app/candidates/:id/edit'
    },
    CVTHEQUE: '/app/cvtheque',
    PIPELINE: '/app/pipeline',
    CALENDAR: '/app/calendar',
    TEAM: '/app/team',
    CLIENTS: '/app/clients',
    ADMIN: '/app/admin',
    SUPERADMIN: '/app/superadmin'
  }
};

/**
 * Generate route with params
 * @param {string} route - Route template
 * @param {object} params - Route parameters
 * @returns {string} - Generated route
 */
export const generateRoute = (route, params = {}) => {
  let generatedRoute = route;

  Object.keys(params).forEach(key => {
    generatedRoute = generatedRoute.replace(`:${key}`, params[key]);
  });

  return generatedRoute;
};

/**
 * Navigation items for sidebar
 */
export const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    path: ROUTES.APP.DASHBOARD,
    roles: ['user', 'admin', 'superadmin']
  },
  {
    id: 'missions',
    label: 'Missions',
    icon: '💼',
    path: ROUTES.APP.MISSIONS.ROOT,
    roles: ['user', 'admin', 'superadmin']
  },
  {
    id: 'candidates',
    label: 'Candidats',
    icon: '👥',
    path: ROUTES.APP.CANDIDATES.ROOT,
    roles: ['user', 'admin', 'superadmin']
  },
  {
    id: 'cvtheque',
    label: 'CVthèque',
    icon: '📚',
    path: ROUTES.APP.CVTHEQUE,
    roles: ['user', 'admin', 'superadmin']
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: '🎯',
    path: ROUTES.APP.PIPELINE,
    roles: ['user', 'admin', 'superadmin']
  },
  {
    id: 'calendar',
    label: 'Agenda',
    icon: '📅',
    path: ROUTES.APP.CALENDAR,
    roles: ['user', 'admin', 'superadmin']
  },
  {
    id: 'team',
    label: 'Équipe',
    icon: '👨‍💼',
    path: ROUTES.APP.TEAM,
    roles: ['admin', 'superadmin']
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: '🏢',
    path: ROUTES.APP.CLIENTS,
    roles: ['user', 'admin', 'superadmin']
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: '⚙️',
    path: ROUTES.APP.ADMIN,
    roles: ['admin', 'superadmin']
  },
  {
    id: 'superadmin',
    label: 'SuperAdmin',
    icon: '👑',
    path: ROUTES.APP.SUPERADMIN,
    roles: ['superadmin']
  }
];

/**
 * Filter nav items by user role
 * @param {string} userRole - Current user role
 * @returns {array} - Filtered nav items
 */
export const getNavItemsByRole = (userRole) => {
  return NAV_ITEMS.filter(item => item.roles.includes(userRole));
};
