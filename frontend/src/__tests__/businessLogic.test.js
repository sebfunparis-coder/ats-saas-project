/**
 * T-406 : 4 logiques métier critiques n'avaient jamais été testées que via
 * des scripts Node jetables (jamais committés) — aucune protection contre
 * une régression future. 3 des 4 ont été extraites de leur composant/contexte
 * d'origine en fonctions pures réutilisables (core/utils/*.js) pour pouvoir
 * être testées directement ; la 4ᵉ (cascade RGPD) reste une expression courte
 * inline dans DataContext.jsx, répliquée fidèlement ici plutôt qu'extraite
 * (coût d'extraction disproportionné pour une expression aussi simple).
 */
import { describe, it, expect } from 'vitest';
import { shouldAutoCloseMission } from '../core/utils/missionAutoClose';
import { consolidateEvaluations } from '../core/utils/evaluationConsolidation';
import { computeEliminated } from '../core/utils/screeningElimination';

describe('T-406 / T-243 / T-244 — clôture automatique de mission (shouldAutoCloseMission)', () => {
  it('ne clôture jamais une mission déjà fermée', () => {
    const mission = { title: 'M', status: 'closed', expectedCloseDate: '2020-01-01' };
    expect(shouldAutoCloseMission(mission, { today: '2026-01-01' })).toBeNull();
  });

  it('clôture quand la date de clôture prévue est dépassée', () => {
    const mission = { title: 'Dev Backend', status: 'active', expectedCloseDate: '2026-01-01' };
    const result = shouldAutoCloseMission(mission, { today: '2026-06-01' });
    expect(result?.reason).toBe('expired_date');
  });

  it('ne clôture pas si la date de clôture prévue n\'est pas encore atteinte', () => {
    const mission = { title: 'Dev Backend', status: 'active', expectedCloseDate: '2026-12-31' };
    expect(shouldAutoCloseMission(mission, { today: '2026-06-01' })).toBeNull();
  });

  it('clôture quand le seuil de candidatures est atteint', () => {
    const mission = { title: 'Dev Frontend', status: 'active', maxApplications: 20 };
    expect(shouldAutoCloseMission(mission, { applicationsCount: 20 })?.reason).toBe('max_applications');
    expect(shouldAutoCloseMission(mission, { applicationsCount: 19 })).toBeNull();
  });

  it('clôture (T-243) quand tous les postes d\'une offre multi-postes sont pourvus', () => {
    const mission = { title: 'Offre x3', status: 'active', numberOfPositions: 3 };
    expect(shouldAutoCloseMission(mission, { hiredCount: 2 })).toBeNull();
    expect(shouldAutoCloseMission(mission, { hiredCount: 3 })?.reason).toBe('positions_filled');
  });

  it('une mission à 1 poste par défaut (numberOfPositions absent) se clôture dès le 1er hired', () => {
    const mission = { title: 'Offre simple', status: 'active' };
    expect(shouldAutoCloseMission(mission, { hiredCount: 1 })?.reason).toBe('positions_filled');
  });
});

describe('T-406 / T-247 — consolidation multi-évaluateurs (consolidateEvaluations)', () => {
  it('retourne null sans aucune évaluation', () => {
    expect(consolidateEvaluations([])).toBeNull();
    expect(consolidateEvaluations(null)).toBeNull();
  });

  it('calcule la moyenne et le consensus pour 3 évaluateurs', () => {
    const evals = [
      { globalScore: 80, recommendation: 'go', evaluatorName: 'A' },
      { globalScore: 60, recommendation: 'go', evaluatorName: 'B' },
      { globalScore: 40, recommendation: 'no_go', evaluatorName: 'C' },
    ];
    const result = consolidateEvaluations(evals);
    expect(result.count).toBe(3);
    expect(result.avgScore).toBe(60); // (80+60+40)/3 = 60
    expect(result.consensusRecommendation).toBe('go'); // majorité 2/3
    expect(result.evaluators).toHaveLength(3);
  });

  it('gère un seul évaluateur (pas de vraie "consolidation" mais reste correct)', () => {
    const result = consolidateEvaluations([{ globalScore: 90, recommendation: 'go', evaluatorName: 'Solo' }]);
    expect(result.count).toBe(1);
    expect(result.avgScore).toBe(90);
  });
});

describe('T-406 / T-245 — élimination par question de pré-sélection (computeEliminated)', () => {
  it('aucune question → jamais éliminé', () => {
    expect(computeEliminated([], {})).toBe(false);
  });

  it('question non-éliminatoire ratée → pas éliminé', () => {
    const questions = [{ id: 'q1', eliminatory: false, requiredAnswer: 'yes' }];
    expect(computeEliminated(questions, { q1: 'no' })).toBe(false);
  });

  it('question éliminatoire réussie → pas éliminé', () => {
    const questions = [{ id: 'q1', eliminatory: true, requiredAnswer: 'yes' }];
    expect(computeEliminated(questions, { q1: 'yes' })).toBe(false);
  });

  it('question éliminatoire ratée → éliminé', () => {
    const questions = [{ id: 'q1', eliminatory: true, requiredAnswer: 'yes' }];
    expect(computeEliminated(questions, { q1: 'no' })).toBe(true);
  });

  it('question éliminatoire sans réponse → éliminé (réponse absente ≠ réponse requise)', () => {
    const questions = [{ id: 'q1', eliminatory: true, requiredAnswer: 'yes' }];
    expect(computeEliminated(questions, {})).toBe(true);
  });

  it('mélange : une seule question éliminatoire ratée parmi plusieurs suffit à éliminer', () => {
    const questions = [
      { id: 'q1', eliminatory: false, requiredAnswer: 'yes' },
      { id: 'q2', eliminatory: true, requiredAnswer: 'yes' },
      { id: 'q3', eliminatory: true, requiredAnswer: 'no' },
    ];
    expect(computeEliminated(questions, { q1: 'no', q2: 'yes', q3: 'no' })).toBe(false);
    expect(computeEliminated(questions, { q1: 'no', q2: 'no', q3: 'no' })).toBe(true);
  });
});

// T-406 / T-225 / T-329 — cascade de suppression RGPD : réplique fidèle de
// l'expression de filtrage réelle dans DataContext.jsx > deleteCandidate()
// (extraction jugée disproportionnée pour une expression aussi courte).
function findRelatedApplications(applications, candidateId, candidateName) {
  return applications.filter(a => a.candidateId === candidateId || (candidateName && a.candidateName === candidateName));
}

describe('T-406 / T-225 / T-329 — cascade de suppression RGPD (filtrage des candidatures liées)', () => {
  const applications = [
    { id: 'app1', candidateId: 'cand-1', candidateName: 'Jean Dupont' },
    { id: 'app2', candidateId: 'cand-2', candidateName: 'Marie Martin' },
    { id: 'app3', candidateId: null, candidateName: 'Jean Dupont' }, // ancienne entrée sans candidateId (fallback par nom)
  ];

  it('trouve les candidatures par candidateId', () => {
    const related = findRelatedApplications(applications, 'cand-2', 'Marie Martin');
    expect(related.map(a => a.id)).toEqual(['app2']);
  });

  it('trouve aussi les anciennes candidatures sans candidateId, par nom (fallback)', () => {
    const related = findRelatedApplications(applications, 'cand-1', 'Jean Dupont');
    expect(related.map(a => a.id).sort()).toEqual(['app1', 'app3']);
  });

  it('un candidat sans aucune candidature liée retourne un tableau vide', () => {
    const related = findRelatedApplications(applications, 'cand-999', 'Personne');
    expect(related).toEqual([]);
  });
});
