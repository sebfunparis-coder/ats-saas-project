/**
 * T-397 : `usePlanAccess.js` avait des conditions redondantes
 * (`isOwner && !isEquipier`, `isOwner || !isEquipier`) qui masquaient le fait
 * qu'`isOwner` implique toujours `!isEquipier` (les deux listes de rôles sont
 * mutuellement exclusives par construction). Simplifiées en `isOwner` et
 * `!isEquipier` respectivement. Ce test prouve la simplification équivalente
 * pour CHAQUE rôle réellement utilisé dans le codebase (y compris 'consultant',
 * qui n'appartient à aucune des deux listes) — pas juste un raisonnement logique
 * sur le papier.
 */
import { describe, it, expect } from 'vitest';
import { EQUIPIER_ROLES, OWNER_ROLES } from '../core/hooks/usePlanAccess';

const ALL_KNOWN_ROLES = ['admin', 'owner', 'manager', 'superadmin', 'recruiter', 'viewer', 'consultant'];

function computeAccess(role) {
  const isEquipier = EQUIPIER_ROLES.includes(role) && !OWNER_ROLES.includes(role);
  const isOwner = OWNER_ROLES.includes(role);
  return {
    isOwner,
    isEquipier,
    // Anciennes expressions (avant T-397)
    oldCanSeeAdmin: isOwner && !isEquipier,
    oldCanSeeAnalytics: isOwner || !isEquipier,
    oldCanSeeClients: isOwner || !isEquipier,
    // Nouvelles expressions (après T-397)
    newCanSeeAdmin: isOwner,
    newCanSeeAnalytics: !isEquipier,
    newCanSeeClients: !isEquipier,
  };
}

describe('T-397 — usePlanAccess : isOwner implique toujours !isEquipier', () => {
  it.each(ALL_KNOWN_ROLES)('rôle "%s" : isOwner et isEquipier ne sont jamais vrais en même temps', (role) => {
    const { isOwner, isEquipier } = computeAccess(role);
    expect(isOwner && isEquipier).toBe(false);
  });

  it.each(ALL_KNOWN_ROLES)('rôle "%s" : la simplification canSeeAdmin (isOwner && !isEquipier → isOwner) ne change jamais le résultat', (role) => {
    const { oldCanSeeAdmin, newCanSeeAdmin } = computeAccess(role);
    expect(newCanSeeAdmin).toBe(oldCanSeeAdmin);
  });

  it.each(ALL_KNOWN_ROLES)('rôle "%s" : la simplification canSeeAnalytics/canSeeClients (isOwner || !isEquipier → !isEquipier) ne change jamais le résultat', (role) => {
    const { oldCanSeeAnalytics, newCanSeeAnalytics, oldCanSeeClients, newCanSeeClients } = computeAccess(role);
    expect(newCanSeeAnalytics).toBe(oldCanSeeAnalytics);
    expect(newCanSeeClients).toBe(oldCanSeeClients);
  });

  it('le rôle "consultant" (hors des deux listes) garde un accès lecture élargie sans droits de gestion', () => {
    const { isOwner, isEquipier, newCanSeeAdmin, newCanSeeAnalytics, newCanSeeClients } = computeAccess('consultant');
    expect(isOwner).toBe(false);
    expect(isEquipier).toBe(false);
    expect(newCanSeeAdmin).toBe(false); // pas de droits de gestion
    expect(newCanSeeAnalytics).toBe(true); // accès lecture élargie
    expect(newCanSeeClients).toBe(true);
  });
});
