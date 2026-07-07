/**
 * T-406 : logique d'élimination par question de pré-sélection (T-245) —
 * auparavant une closure locale de `JobDetailPage.jsx` (`computeEliminated`),
 * testée uniquement via un script Node jetable jamais committé. Extraite ici
 * en fonction pure pour être couverte par un test Vitest pérenne.
 *
 * @param {Array<{id: string, eliminatory: boolean, requiredAnswer: any}>} screeningQuestions
 * @param {Record<string, any>} answers - réponses du candidat, indexées par question.id
 * @returns {boolean} true si au moins une question éliminatoire a une réponse incorrecte
 */
export function computeEliminated(screeningQuestions, answers) {
  return (screeningQuestions || []).some(q => q.eliminatory && answers[q.id] !== q.requiredAnswer);
}
