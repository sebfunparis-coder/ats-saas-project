/**
 * 📱 SMS Service — T-274
 *
 * Envoi de SMS via Twilio pour :
 *   - Confirmation de convocation entretien
 *   - Rappel J-1 avant entretien
 *   - Mise à jour du statut candidature
 *
 * Variables d'environnement requises :
 *   TWILIO_ACCOUNT_SID  — SID du compte Twilio (console.twilio.com)
 *   TWILIO_AUTH_TOKEN   — Auth token Twilio
 *   TWILIO_FROM_NUMBER  — Numéro Twilio source (ex: +33757000000) ou Messaging Service SID
 *
 * Tarif indicatif : ~0,07€/SMS France (vérifier tarifs actuels Twilio).
 */

import https from 'https';
import logger from '../utils/logger.js';

const TWILIO_BASE = 'api.twilio.com';
const ACCOUNT_SID = () => process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN  = () => process.env.TWILIO_AUTH_TOKEN;
const FROM        = () => process.env.TWILIO_FROM_NUMBER;

const isTwilioEnabled = () => !!(ACCOUNT_SID() && AUTH_TOKEN() && FROM());

// ── Low-level helper ─────────────────────────────────────────────────────────

function twilioRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${ACCOUNT_SID()}:${AUTH_TOKEN()}`).toString('base64');
    const payload = body ? new URLSearchParams(body).toString() : null;

    const req = https.request(
      {
        hostname: TWILIO_BASE,
        path,
        method,
        headers: {
          Authorization: `Basic ${auth}`,
          ...(payload && { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(payload) }),
        },
      },
      res => {
        let raw = '';
        res.on('data', c => (raw += c));
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
          catch { resolve({ status: res.statusCode, body: raw }); }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ── Normalize phone number to E.164 ──────────────────────────────────────────

function normalizePhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  // France : 06/07 → +336/+337 ; numéro à 10 chiffres
  if (digits.length === 10 && digits.startsWith('0')) {
    return '+33' + digits.slice(1);
  }
  // Already has country code
  if (digits.length > 10) return '+' + digits;
  return null;
}

// ── Core send function ────────────────────────────────────────────────────────

/**
 * Envoie un SMS via Twilio.
 * @param {string} to — Numéro destinataire (format quelconque, normalisé en E.164)
 * @param {string} body — Texte du SMS (max 160 chars pour un segment)
 * @returns {Promise<{messageSid, status}>}
 */
export async function sendSMS(to, body) {
  if (!isTwilioEnabled()) {
    logger.warn('[SMS] Twilio non configuré — SMS non envoyé', { to, preview: body.slice(0, 40) });
    return { messageSid: null, status: 'skipped', reason: 'twilio_not_configured' };
  }

  const toNormalized = normalizePhone(to);
  if (!toNormalized) throw new Error(`Numéro de téléphone invalide : ${to}`);

  const path = `/2010-04-01/Accounts/${ACCOUNT_SID()}/Messages.json`;
  const result = await twilioRequest('POST', path, {
    To: toNormalized,
    From: FROM(),
    Body: body.slice(0, 1600), // Twilio max par message
  });

  if (result.status !== 201 && result.status !== 200) {
    const msg = result.body?.message || JSON.stringify(result.body);
    throw new Error(`Twilio erreur ${result.status}: ${msg}`);
  }

  logger.info('[SMS] Envoyé', { to: toNormalized, messageSid: result.body.sid, status: result.body.status });
  return { messageSid: result.body.sid, status: result.body.status };
}

// ── Templates SMS ─────────────────────────────────────────────────────────────

/**
 * SMS de confirmation de convocation.
 */
export async function sendInterviewConfirmationSMS(candidate, interview, mission) {
  const { date, location, type } = interview;
  const dateStr = new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  const timeStr = new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const typeLabel = type === 'video' ? `visio (lien envoyé par email)` : location || 'nos locaux';

  const body = `ATS Ultimate : Bonjour ${candidate.name.split(' ')[0]}, votre entretien pour le poste "${mission.title}" est confirmé le ${dateStr} à ${timeStr} — ${typeLabel}. Répondre STOP pour désinscrire.`;

  return sendSMS(candidate.phone || candidate.phoneNumber, body);
}

/**
 * SMS de rappel J-1 avant entretien.
 */
export async function sendInterviewReminderSMS(candidate, interview, mission) {
  const { date, location, type } = interview;
  const timeStr = new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const typeLabel = type === 'video' ? 'en visio' : `à ${location || 'nos locaux'}`;

  const body = `ATS Ultimate : Rappel — votre entretien pour "${mission.title}" est demain à ${timeStr} ${typeLabel}. Bonne préparation ! STOP pour désinscrire.`;

  return sendSMS(candidate.phone || candidate.phoneNumber, body);
}

/**
 * SMS de mise à jour du statut candidature.
 */
export async function sendStatusUpdateSMS(candidate, mission, newStatus) {
  const MESSAGES = {
    screening:   `Bonne nouvelle ! Votre candidature pour "${mission.title}" passe à l'étape de présélection.`,
    interview_1: `Votre candidature pour "${mission.title}" est retenue pour un entretien. Vous recevrez bientôt une invitation.`,
    offer:       `Félicitations ! Une offre vous est proposée pour le poste "${mission.title}". Votre recruteur vous contacte bientôt.`,
    hired:       `Félicitations ${candidate.name.split(' ')[0]} ! Votre candidature pour "${mission.title}" a été retenue. Bienvenue !`,
    rejected:    `Votre candidature pour "${mission.title}" n'a pas été retenue. Merci pour votre intérêt. Bonne continuation !`,
  };

  const message = MESSAGES[newStatus];
  if (!message) return null; // Pas de SMS pour ce statut

  const body = `ATS Ultimate : ${message} STOP pour désinscrire.`;
  return sendSMS(candidate.phone || candidate.phoneNumber, body);
}

/**
 * Vérifier si la configuration Twilio est valide.
 */
export async function testTwilioConfig() {
  if (!isTwilioEnabled()) {
    throw new Error('Twilio non configuré. Définissez TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN et TWILIO_FROM_NUMBER.');
  }

  const path = `/2010-04-01/Accounts/${ACCOUNT_SID()}.json`;
  const result = await twilioRequest('GET', path);

  if (result.status !== 200) {
    throw new Error(`Twilio credentials invalides (HTTP ${result.status}): ${result.body?.message || ''}`);
  }

  return {
    accountName: result.body?.friendly_name,
    accountStatus: result.body?.status,
    fromNumber: FROM(),
  };
}

export default { sendSMS, sendInterviewConfirmationSMS, sendInterviewReminderSMS, sendStatusUpdateSMS, testTwilioConfig, isTwilioEnabled };
