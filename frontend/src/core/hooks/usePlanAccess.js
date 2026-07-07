/**
 * usePlanAccess — Contrôle d'accès par plan et rôle
 *
 * RÈGLES MÉTIER (voir CLAUDE.md section "Règles Métier Critiques") :
 *
 * SOLO (29,90€/mois ou 19,90€/an) :
 *   - Accès à toute l'app SAUF onglet Équipe
 *   - 1 seul utilisateur
 *
 * MANAGER (3 ou 6 postes) :
 *   - Accès complet + gestion d'équipe
 *   - Les équipiers voient leur espace personnalisé (défini par le manager)
 *
 * SUPERADMIN :
 *   - Accès absolu à tout, sans exception
 */

import { useAuth } from '../contexts/AuthContext';
import { ROLE_DEFAULT_PERMISSIONS_BY_DB_ROLE } from '../../config/permissions';

// Plans qui donnent accès à la gestion d'équipe
const MANAGER_PLANS = ['team_3', 'team_6', 'enterprise', 'professional', 'pro'];

// Rôles "équipier" (membre assigné par un manager, accès restreint)
// Exportés pour être réutilisés par DataContext.jsx (T-355) plutôt que redéfinis.
export const EQUIPIER_ROLES = ['recruiter', 'viewer'];

// Rôles "propriétaire/manager" dans une company
export const OWNER_ROLES = ['admin', 'owner', 'manager', 'superadmin'];

// T-397 : le rôle 'consultant' (utilisé dans AdminPage.jsx, ROLE_REVERSE)
// n'appartient à AUCUNE des deux listes ci-dessus. Conséquence documentée
// explicitement ici (auparavant implicite, "fonctionnait par accident") :
// pour ce rôle, `isOwner` et `isEquipier` valent tous les deux `false`, donc
// tout accès conditionné par `!isEquipier` (canSeeAnalytics, canSeeClients)
// reste accordé, mais tout accès conditionné strictement par `isOwner`
// (canSeeAdmin, canManageTeam, canSeeTeamTab, can('admin')...) reste refusé.
// Un consultant a donc un accès "lecture élargie" sans droits de gestion —
// comportement jugé correct pour ce rôle, mais une future modification
// d'EQUIPIER_ROLES/OWNER_ROLES qui y ajouterait 'consultant' changerait ce
// comportement : à faire consciemment, pas par inadvertance.

export function usePlanAccess() {
  const { user, isSuperAdmin } = useAuth();

  const plan = user?.plan || 'solo';
  const role = user?.role || 'recruiter';

  // SuperAdmin = accès absolu
  if (isSuperAdmin) {
    return {
      isSolo: false,
      isManager: true,
      isEquipier: false,
      isSuperAdmin: true,
      canSeeTeamTab: true,
      canSeeAdmin: true,
      canManageTeam: true,
      canSeeAnalytics: true,
      canSeeClients: true,
      maxSeats: Infinity,
      plan: 'superadmin',
      role,
      hasPermission: () => true,
    };
  }

  const isSolo = plan === 'solo' || plan === 'starter';
  const isManagerPlan = MANAGER_PLANS.some(p => plan?.toLowerCase().includes(p) || plan === p);
  const isEquipier = EQUIPIER_ROLES.includes(role) && !OWNER_ROLES.includes(role);
  const isOwner = OWNER_ROLES.includes(role);

  // T-356 : permissions custom définies par le Manager (AdminPage → Équipe → 🔑).
  // Un tableau vide/absent signifie "jamais configuré pour ce membre" — on retombe
  // alors sur les permissions par défaut du rôle plutôt que de tout bloquer ou tout
  // autoriser (voir config/permissions.js, même défauts que la modale AdminPage).
  const customPermissions = user?.permissions;
  const effectivePermissions = (Array.isArray(customPermissions) && customPermissions.length > 0)
    ? customPermissions
    : (ROLE_DEFAULT_PERMISSIONS_BY_DB_ROLE[role] || []);
  // Owner/Manager/SuperAdmin ne sont jamais restreints par ce mécanisme — il ne
  // s'applique qu'aux équipiers, conformément à la règle métier (CLAUDE.md).
  const hasPermission = (key) => !isEquipier || effectivePermissions.includes(key);

  // Nombre de postes selon le plan
  const maxSeats = plan === 'team_3' ? 3
    : plan === 'team_6' ? 6
    : plan === 'enterprise' ? Infinity
    : isSolo ? 1
    : 3; // fallback

  return {
    isSolo,
    isManager: isManagerPlan && isOwner,
    isEquipier,
    isOwner,
    isSuperAdmin: false,

    // Onglets / sections accessibles
    // T-320 : c'était un `||` — un Équipier (non-owner) sur un plan Manager
    // voyait quand même l'onglet Équipe. Il faut les deux conditions à la fois.
    canSeeTeamTab: !isSolo && isManagerPlan && isOwner,
    // T-397 : `isOwner && !isEquipier` / `isOwner || !isEquipier` — isOwner et
    // isEquipier sont déjà mutuellement exclusifs (voir définitions ci-dessus :
    // isEquipier exige explicitement `!OWNER_ROLES.includes(role)`), donc
    // isOwner implique toujours !isEquipier. Le terme `isOwner` était redondant
    // dans les deux expressions ; simplifié pour ne plus masquer cette relation
    // et rendre le traitement du rôle 'consultant' (ni owner ni équipier,
    // voir note plus haut) directement visible dans la condition elle-même.
    canSeeAdmin: isOwner,
    canManageTeam: isOwner && isManagerPlan,
    canSeeAnalytics: !isEquipier, // équipier: selon rôle (hasPermission)
    canSeeClients: !isEquipier,
    canSeeCalendar: true,
    canSeePipeline: true,
    canSeeCvtheque: true,
    canSeeMissions: true,
    canSeeCandidates: true,

    // Données
    maxSeats,
    plan,
    role,
    hasPermission,

    // Helper pour vérifier un accès spécifique
    can: (feature) => {
      switch (feature) {
        case 'team': return !isSolo && isOwner;
        case 'admin': return isOwner;
        case 'billing': return isOwner;
        case 'integrations': return isOwner;
        case 'invite_members': return isOwner && isManagerPlan;
        case 'see_all_data': return isOwner;
        default: return true;
      }
    },
  };
}

export default usePlanAccess;
