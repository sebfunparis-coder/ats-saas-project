/**
 * 🤖 AI Service — Scoring de candidatures via Claude API
 *
 * Nécessite ANTHROPIC_API_KEY dans .env
 */

import Anthropic from '@anthropic-ai/sdk';
import logger from '../utils/logger.js';

const getClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY manquante dans les variables d\'environnement');
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
};

/**
 * Score une candidature sur 4 critères (0-100 chacun).
 * Retourne un score global pondéré + détails + justification.
 *
 * @param {{ application: object, mission: object, candidate: object }} context
 * @returns {Promise<{ score, skillsMatch, experienceMatch, locationMatch, salaryMatch, justification, strengths, concerns }>}
 */
export const scoreApplication = async ({ application, mission, candidate }) => {
  const client = getClient();

  const missionInfo = {
    title: mission.title || '',
    department: mission.department || '',
    location: mission.location || '',
    contract: mission.contract || '',
    salary: mission.salary ? `${mission.salary.min || '?'}–${mission.salary.max || '?'} ${mission.salary.currency || 'EUR'}` : 'Non précisé',
    skills: mission.skills?.join(', ') || 'Non précisées',
    requirements: mission.requirements || '',
  };

  const candidateInfo = {
    currentPosition: candidate.position || 'Non précisé',
    experience: candidate.experience ? `${candidate.experience} ans` : 'Non précisée',
    skills: candidate.skills?.join(', ') || 'Non précisées',
    location: candidate.location || 'Non précisée',
    languages: candidate.languages?.join(', ') || 'Non précisées',
    salaryExpectation: application.salaryExpectation ? `${application.salaryExpectation} EUR` : 'Non précisée',
  };

  const prompt = `Tu es un expert RH. Analyse cette candidature et retourne UNIQUEMENT un objet JSON valide, sans aucun texte autour.

## Poste recherché
- Titre : ${missionInfo.title}
- Département : ${missionInfo.department}
- Localisation : ${missionInfo.location}
- Type de contrat : ${missionInfo.contract}
- Salaire proposé : ${missionInfo.salary}
- Compétences requises : ${missionInfo.skills}
${missionInfo.requirements ? `- Prérequis : ${missionInfo.requirements}` : ''}

## Candidat
- Poste actuel : ${candidateInfo.currentPosition}
- Expérience : ${candidateInfo.experience}
- Compétences : ${candidateInfo.skills}
- Localisation : ${candidateInfo.location}
- Langues : ${candidateInfo.languages}
- Prétentions salariales : ${candidateInfo.salaryExpectation}

## Format de réponse (JSON strict)
{
  "score": <entier 0-100, moyenne pondérée des 4 critères>,
  "skillsMatch": <entier 0-100, correspondance compétences>,
  "experienceMatch": <entier 0-100, adéquation niveau d'expérience>,
  "locationMatch": <entier 0-100, compatibilité localisation>,
  "salaryMatch": <entier 0-100, compatibilité prétentions vs offre, 75 si non précisé>,
  "justification": "<2-3 phrases résumant l'adéquation globale>",
  "strengths": ["<point fort 1>", "<point fort 2>", "<point fort 3>"],
  "concerns": ["<point d'attention 1>", "<point d'attention 2>"]
}

Pondération du score global : skillsMatch×40% + experienceMatch×30% + locationMatch×20% + salaryMatch×10%.`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0]?.text?.trim() || '';

  // Extraire le JSON même si entouré de backticks
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    logger.error('ai.service: réponse Claude non parseable', { raw });
    throw new Error('Réponse IA invalide');
  }

  const result = JSON.parse(jsonMatch[0]);

  // Recalculer le score pour éviter les erreurs de Claude
  const computed = Math.round(
    (result.skillsMatch || 0) * 0.4 +
    (result.experienceMatch || 0) * 0.3 +
    (result.locationMatch || 0) * 0.2 +
    (result.salaryMatch || 75) * 0.1
  );

  return {
    score: computed,
    skillsMatch: Math.min(100, Math.max(0, result.skillsMatch || 0)),
    experienceMatch: Math.min(100, Math.max(0, result.experienceMatch || 0)),
    locationMatch: Math.min(100, Math.max(0, result.locationMatch || 0)),
    salaryMatch: Math.min(100, Math.max(0, result.salaryMatch || 75)),
    justification: result.justification || '',
    strengths: Array.isArray(result.strengths) ? result.strengths.slice(0, 5) : [],
    concerns: Array.isArray(result.concerns) ? result.concerns.slice(0, 3) : [],
  };
};

export default { scoreApplication };
