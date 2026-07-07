/**
 * T-406 : logique de consolidation multi-évaluateurs (T-247) — auparavant une
 * closure locale de `PipelinePage.jsx` (`getConsolidatedEvaluation`), testée
 * uniquement via un script Node jetable jamais committé. Extraite ici en
 * fonction pure pour être couverte par un test Vitest pérenne.
 *
 * @param {Array<{globalScore: number, recommendation: string, evaluatorName: string}>} evals
 *   évaluations déjà filtrées pour une candidature donnée (voir getAppEvaluations)
 * @returns {null|{count: number, avgScore: number, consensusRecommendation: string, evaluators: Array}}
 *   null si aucune évaluation (rien à consolider)
 */
export function consolidateEvaluations(evals) {
  if (!evals || evals.length === 0) return null;
  const avgScore = Math.round(evals.reduce((sum, e) => sum + (e.globalScore || 0), 0) / evals.length);
  const recommendationCounts = evals.reduce((acc, e) => {
    acc[e.recommendation || 'pending'] = (acc[e.recommendation || 'pending'] || 0) + 1;
    return acc;
  }, {});
  const consensusRecommendation = Object.entries(recommendationCounts).sort((a, b) => b[1] - a[1])[0][0];
  return {
    count: evals.length,
    avgScore,
    consensusRecommendation,
    evaluators: evals.map(e => ({ name: e.evaluatorName, score: e.globalScore, recommendation: e.recommendation })),
  };
}
