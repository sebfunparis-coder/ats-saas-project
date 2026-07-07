/**
 * 📄 CV Parser Service — Extraction et structuration via Claude API
 *
 * Flux :
 *  1. Extraction texte brut depuis le buffer PDF via pdf-parse
 *  2. Envoi à Claude (claude-haiku) pour structuration en JSON
 *  3. Retourne un objet candidat pré-rempli
 *
 * Nécessite ANTHROPIC_API_KEY dans .env
 */

import { createRequire } from 'module';
import Anthropic from '@anthropic-ai/sdk';
import logger from '../utils/logger.js';

// pdf-parse est un module CommonJS
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const getClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY manquante dans les variables d\'environnement');
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
};

/**
 * Extrait le texte brut d'un buffer PDF.
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
export const extractTextFromPDF = async (buffer) => {
  const data = await pdfParse(buffer);
  return data.text?.trim() || '';
};

/**
 * Extrait les informations structurées d'un CV via Claude.
 * @param {string} text — Texte brut du CV
 * @returns {Promise<object>} Données candidat structurées
 */
export const parseCVWithClaude = async (text) => {
  if (!text || text.length < 50) {
    throw new Error('Texte du CV trop court pour être analysé');
  }

  const client = getClient();

  // Tronquer le texte si trop long (max ~12 000 caractères)
  const truncated = text.length > 12000 ? text.slice(0, 12000) + '\n[...CV tronqué]' : text;

  const prompt = `Tu es un expert RH. Analyse ce CV et extrait les informations. Retourne UNIQUEMENT un objet JSON valide, sans aucun texte autour.

## CV à analyser
${truncated}

## Format de réponse (JSON strict — utilise null si information absente)
{
  "firstName": "<prénom ou null>",
  "lastName": "<nom de famille ou null>",
  "email": "<email ou null>",
  "phone": "<téléphone au format international ou null>",
  "position": "<poste actuel ou titre professionnel ou null>",
  "location": "<ville, pays ou null>",
  "experience": "<niveau expérience: Junior, Confirmé, Senior, Expert — déduit du nombre d'années ou null>",
  "skills": ["<compétence1>", "<compétence2>", ...],
  "languages": ["<langue1>", "<langue2>", ...],
  "education": [
    { "degree": "<diplôme>", "institution": "<école/université>", "year": "<année ou null>" }
  ],
  "summary": "<résumé profil en 1-2 phrases ou null>"
}

Règles :
- skills : liste uniquement les compétences techniques et métier (pas les soft skills génériques)
- experience : déduis uniquement Junior/Confirmé/Senior/Expert, ne mets pas un nombre d'années
- Toujours retourner du JSON valide même si le CV est incomplet`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0]?.text?.trim() || '';

  // Extraire le JSON même si entouré de backticks markdown
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    logger.error('cv-parser: réponse Claude non parseable', { raw: raw.slice(0, 200) });
    throw new Error('Réponse IA invalide');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Normalisation et valeurs par défaut
  return {
    firstName: parsed.firstName || '',
    lastName: parsed.lastName || '',
    email: parsed.email || '',
    phone: parsed.phone || '',
    position: parsed.position || '',
    location: parsed.location || '',
    experience: parsed.experience || '',
    skills: Array.isArray(parsed.skills) ? parsed.skills.slice(0, 20) : [],
    languages: Array.isArray(parsed.languages) ? parsed.languages : [],
    education: Array.isArray(parsed.education) ? parsed.education.slice(0, 5) : [],
    summary: parsed.summary || '',
  };
};

/**
 * Pipeline complet : buffer PDF → données candidat structurées.
 * @param {Buffer} buffer
 * @returns {Promise<object>}
 */
export const parseCV = async (buffer) => {
  const text = await extractTextFromPDF(buffer);
  return parseCVWithClaude(text);
};

export default { extractTextFromPDF, parseCVWithClaude, parseCV };
