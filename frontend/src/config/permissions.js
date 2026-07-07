// T-356 : source unique des permissions par onglet/fonctionnalité, partagée entre
// AdminPage.jsx (modale "Gérer les permissions" d'un Manager) et l'enforcement réel
// côté Sidebar/usePlanAccess. Avant ce fichier, AdminPage écrivait `profiles.permissions`
// mais aucun composant ne le relisait jamais — un Manager pouvait décocher "Candidats"
// pour un équipier en croyant lui retirer l'accès, sans aucun effet réel.

export const ALL_PERMISSIONS = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'clients', label: 'Clients', icon: '🏢' },
  { key: 'missions', label: 'Missions', icon: '💼' },
  { key: 'candidates', label: 'Candidats', icon: '👥' },
  { key: 'pipeline', label: 'Pipeline', icon: '📋' },
  { key: 'calendar', label: 'Agenda', icon: '📅' },
  { key: 'cvtheque', label: 'CVthèque', icon: '🔍' },
  { key: 'team', label: 'Équipe', icon: '👥' },
  { key: 'admin', label: 'Admin', icon: '⚙️' },
  { key: 'export', label: 'Exporter données', icon: '📤' },
  { key: 'import', label: 'Importer données', icon: '📥' },
  { key: 'reports', label: 'Rapports', icon: '📊' },
];

// Clé = rôle réel stocké en base (profiles.role / team_members.role) — PAS le libellé
// affiché ('Admin', 'Recruteur'...). Utiliser ROLE_MAP (AdminPage.jsx) pour convertir
// si un composant a besoin de la version keyée par libellé d'affichage.
export const ROLE_DEFAULT_PERMISSIONS_BY_DB_ROLE = {
  admin:      ['dashboard','clients','missions','candidates','pipeline','calendar','cvtheque','team','admin','export','import','reports'],
  manager:    ['dashboard','clients','missions','candidates','pipeline','calendar','cvtheque','team','export','reports'],
  recruiter:  ['dashboard','missions','candidates','pipeline','calendar','cvtheque','export'],
  consultant: ['dashboard','candidates','cvtheque'],
  viewer:     ['dashboard'],
};
