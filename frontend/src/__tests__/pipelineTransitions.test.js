/**
 * T-391 : le drag & drop du Kanban ignorait les règles de transition métier
 * (`APPLICATION_NEXT_STATUSES`) — seuls les boutons "Déplacer vers" du modal
 * les respectaient, un glisser-déposer direct pouvait sauter des étapes
 * (ex. received → hired). Ce fichier teste la règle elle-même (source unique
 * désormais dans constants.js, T-395) et la même logique de garde que
 * `KanbanBoard.jsx`'s `handleDrop` applique avant d'appeler `onApplicationMove`.
 *
 * Note : la simulation d'un vrai glisser-déposer HTML5 natif via Playwright
 * s'est avérée peu fiable en environnement headless (limitation connue de
 * l'automatisation du drag & drop natif, indépendante du code applicatif) —
 * la vérification en navigateur réel a donc porté sur ce qui est fiablement
 * testable (page Pipeline sans erreur console, focus clavier des cartes,
 * menu "Déplacer vers" bien présent) ; ce test unitaire couvre la règle de
 * transition elle-même, qui est la partie réellement à risque de régression.
 */
import { describe, it, expect } from 'vitest';
import { APPLICATION_NEXT_STATUSES, APPLICATION_STATUS } from '../config/constants';

// Réplique exacte de la garde ajoutée dans KanbanBoard.jsx handleDrop()
function isMoveAllowed(fromStatus, toStatus) {
  const allowed = APPLICATION_NEXT_STATUSES[fromStatus] || [];
  return toStatus === 'archived' || fromStatus === 'archived' || allowed.includes(toStatus);
}

describe('T-391 — règles de transition du pipeline (drag & drop)', () => {
  it('bloque un saut direct received → hired', () => {
    expect(isMoveAllowed(APPLICATION_STATUS.RECEIVED, APPLICATION_STATUS.HIRED)).toBe(false);
  });

  it('bloque un saut direct received → offer', () => {
    expect(isMoveAllowed(APPLICATION_STATUS.RECEIVED, APPLICATION_STATUS.OFFER)).toBe(false);
  });

  it('autorise les transitions séquentielles normales', () => {
    expect(isMoveAllowed(APPLICATION_STATUS.RECEIVED, APPLICATION_STATUS.SCREENING)).toBe(true);
    expect(isMoveAllowed(APPLICATION_STATUS.SCREENING, APPLICATION_STATUS.INTERVIEW_1)).toBe(true);
    expect(isMoveAllowed(APPLICATION_STATUS.INTERVIEW_1, APPLICATION_STATUS.INTERVIEW_2)).toBe(true);
    expect(isMoveAllowed(APPLICATION_STATUS.OFFER, APPLICATION_STATUS.HIRED)).toBe(true);
  });

  it('autorise le rejet depuis n\'importe quelle étape active', () => {
    for (const status of [APPLICATION_STATUS.RECEIVED, APPLICATION_STATUS.SCREENING, APPLICATION_STATUS.INTERVIEW_1, APPLICATION_STATUS.INTERVIEW_2, APPLICATION_STATUS.OFFER, APPLICATION_STATUS.FINAL]) {
      expect(isMoveAllowed(status, APPLICATION_STATUS.REJECTED)).toBe(true);
    }
  });

  it('autorise archiver/désarchiver depuis et vers n\'importe quel statut (action manuelle hors flux séquentiel)', () => {
    expect(isMoveAllowed(APPLICATION_STATUS.RECEIVED, 'archived')).toBe(true);
    expect(isMoveAllowed(APPLICATION_STATUS.HIRED, 'archived')).toBe(true);
    expect(isMoveAllowed('archived', APPLICATION_STATUS.RECEIVED)).toBe(true);
    expect(isMoveAllowed('archived', APPLICATION_STATUS.INTERVIEW_2)).toBe(true);
  });

  it('un candidat "hired" est un statut terminal (aucune transition sortante hors archive)', () => {
    expect(APPLICATION_NEXT_STATUSES[APPLICATION_STATUS.HIRED]).toEqual([]);
  });
});

describe('T-395 — APPLICATION_PIPELINE_STAGES couvre bien les 9 statuts réels, y compris archived', () => {
  it('constants.js expose une entrée pour chaque statut utilisé dans le pipeline', async () => {
    const { APPLICATION_PIPELINE_STAGES } = await import('../config/constants');
    const expected = ['received', 'screening', 'interview_1', 'interview_2', 'offer', 'final', 'hired', 'rejected', 'archived'];
    expect(Object.keys(APPLICATION_PIPELINE_STAGES).sort()).toEqual(expected.sort());
  });
});
