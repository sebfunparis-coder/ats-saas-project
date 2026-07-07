/**
 * T-406 : logique de clôture automatique de mission (T-243 — tous les postes
 * pourvus, T-244 — date de clôture dépassée ou seuil de candidatures atteint)
 * était dupliquée à 3 endroits de `DataContext.jsx`, testée uniquement via
 * des scripts Node jetables jamais committés. Extraite ici en fonction pure
 * (même règles, une seule source) pour être couverte par un test Vitest
 * pérenne et réutilisée aux 3 points d'appel.
 *
 * @param {object} mission
 * @param {object} context
 * @param {string} [context.today] - date du jour au format ISO (YYYY-MM-DD), pour la règle "date dépassée"
 * @param {number} [context.applicationsCount] - nombre total de candidatures sur la mission, pour la règle "seuil atteint"
 * @param {number} [context.hiredCount] - nombre de candidatures 'hired' sur la mission, pour la règle "postes pourvus"
 * @returns {null|{reason: 'expired_date'|'max_applications'|'positions_filled', message: string}}
 *   null si aucune règle de clôture automatique ne s'applique
 */
export function shouldAutoCloseMission(mission, { today, applicationsCount, hiredCount } = {}) {
  if (!mission || mission.status === 'closed') return null;

  if (mission.expectedCloseDate && today && mission.expectedCloseDate < today) {
    return {
      reason: 'expired_date',
      message: `"${mission.title}" a dépassé sa date de clôture prévue (${mission.expectedCloseDate}).`,
    };
  }

  if (mission.maxApplications && applicationsCount !== undefined && applicationsCount >= mission.maxApplications) {
    return {
      reason: 'max_applications',
      message: `"${mission.title}" a atteint son seuil de ${mission.maxApplications} candidatures.`,
    };
  }

  if (hiredCount !== undefined) {
    const targetPositions = mission.numberOfPositions || 1;
    if (hiredCount >= targetPositions) {
      return {
        reason: 'positions_filled',
        message: `"${mission.title}" : ${targetPositions}/${targetPositions} poste(s) pourvu(s).`,
      };
    }
  }

  return null;
}
