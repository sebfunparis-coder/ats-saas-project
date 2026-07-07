/**
 * 📅 Calendar Service — T-270 (Google Calendar) + T-271 (Outlook/M365)
 *
 * Synchronise les entretiens créés dans l'ATS vers Google Calendar et/ou
 * Microsoft Outlook / Microsoft 365.
 *
 * ── Google Calendar (T-270) ──────────────────────────────────────────────────
 * Variables d'environnement :
 *   GOOGLE_CLIENT_ID        — Google Cloud Console → OAuth 2.0 Client ID
 *   GOOGLE_CLIENT_SECRET    — Google Cloud Console → OAuth 2.0 Client Secret
 *   GOOGLE_REDIRECT_URI     — URI de callback OAuth (ex: https://ats-ultimate.com/api/calendar/google/callback)
 *
 * Flux OAuth2 :
 *   1. GET /api/calendar/google/auth-url  → redirect vers Google consentement
 *   2. GET /api/calendar/google/callback  → échange code → tokens → stocké en DB
 *   3. POST /api/calendar/google/sync     → crée/met à jour l'événement dans Google Calendar
 *
 * ── Outlook / Microsoft 365 (T-271) ─────────────────────────────────────────
 * Variables d'environnement :
 *   MICROSOFT_CLIENT_ID       — Azure App Registration → Application (client) ID
 *   MICROSOFT_CLIENT_SECRET   — Azure App Registration → Client secret
 *   MICROSOFT_TENANT_ID       — Azure tenant ID (ex: "common" pour multi-tenant)
 *   MICROSOFT_REDIRECT_URI    — URI de callback OAuth
 *
 * Flux OAuth2 :
 *   Même structure que Google, endpoint Microsoft identity platform.
 */

import https from 'https';
import logger from '../utils/logger.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function jsonRequest(hostname, path, method, headers, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(data && { 'Content-Length': Buffer.byteLength(data) }),
          ...headers,
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
    if (data) req.write(data);
    req.end();
  });
}

function formRequest(hostname, path, params) {
  return new Promise((resolve, reject) => {
    const data = new URLSearchParams(params).toString();
    const req = https.request(
      {
        hostname,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(data),
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
    req.write(data);
    req.end();
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOOGLE CALENDAR — T-270
// ═══════════════════════════════════════════════════════════════════════════════

const GOOGLE = {
  clientId:     () => process.env.GOOGLE_CLIENT_ID,
  clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
  redirectUri:  () => process.env.GOOGLE_REDIRECT_URI || 'https://ats-ultimate.com/api/calendar/google/callback',
  isEnabled:    () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
};

/**
 * Génère l'URL de consentement OAuth2 Google.
 * Redirect le recruteur vers Google pour autoriser l'accès calendrier.
 */
export function getGoogleAuthUrl(state = '') {
  if (!GOOGLE.isEnabled()) throw new Error('Google OAuth non configuré. Définissez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET.');

  const params = new URLSearchParams({
    client_id: GOOGLE.clientId(),
    redirect_uri: GOOGLE.redirectUri(),
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/**
 * Échange le code d'autorisation contre les tokens d'accès/refresh Google.
 */
export async function exchangeGoogleCode(code) {
  const result = await formRequest('oauth2.googleapis.com', '/token', {
    code,
    client_id: GOOGLE.clientId(),
    client_secret: GOOGLE.clientSecret(),
    redirect_uri: GOOGLE.redirectUri(),
    grant_type: 'authorization_code',
  });

  if (result.status !== 200) {
    throw new Error(`Google token exchange erreur ${result.status}: ${JSON.stringify(result.body)}`);
  }

  return {
    accessToken:  result.body.access_token,
    refreshToken: result.body.refresh_token,
    expiresAt:    Date.now() + (result.body.expires_in * 1000),
    scope:        result.body.scope,
  };
}

/**
 * Rafraîchit le token d'accès Google via le refresh token.
 */
export async function refreshGoogleToken(refreshToken) {
  const result = await formRequest('oauth2.googleapis.com', '/token', {
    refresh_token: refreshToken,
    client_id: GOOGLE.clientId(),
    client_secret: GOOGLE.clientSecret(),
    grant_type: 'refresh_token',
  });

  if (result.status !== 200) throw new Error(`Google refresh token erreur ${result.status}`);

  return {
    accessToken: result.body.access_token,
    expiresAt:   Date.now() + (result.body.expires_in * 1000),
  };
}

/**
 * Crée un événement dans Google Calendar pour un entretien.
 * @param {object} tokens — { accessToken, refreshToken, expiresAt }
 * @param {object} interview — { date, duration (min), location, videoLink, notes }
 * @param {object} candidate — { name, email }
 * @param {object} mission — { title }
 * @param {string[]} attendeeEmails — emails des participants (recruteurs)
 * @returns {Promise<{googleEventId, googleEventUrl}>}
 */
export async function createGoogleCalendarEvent(tokens, interview, candidate, mission, attendeeEmails = []) {
  let accessToken = tokens.accessToken;

  // Rafraîchir si expiré
  if (Date.now() > (tokens.expiresAt - 60000) && tokens.refreshToken) {
    const refreshed = await refreshGoogleToken(tokens.refreshToken);
    accessToken = refreshed.accessToken;
  }

  const startDt = new Date(interview.date);
  const endDt = new Date(startDt.getTime() + ((interview.duration || 60) * 60000));

  const event = {
    summary: `Entretien — ${candidate.name} — ${mission.title}`,
    description: [
      `Candidat : ${candidate.name} (${candidate.email || ''})`,
      `Poste : ${mission.title}`,
      interview.notes ? `Notes : ${interview.notes}` : '',
      interview.videoLink ? `Lien vidéo : ${interview.videoLink}` : '',
    ].filter(Boolean).join('\n'),
    location: interview.location || (interview.videoLink ? 'Visioconférence' : ''),
    start: { dateTime: startDt.toISOString(), timeZone: 'Europe/Paris' },
    end:   { dateTime: endDt.toISOString(),   timeZone: 'Europe/Paris' },
    attendees: [
      { email: candidate.email, displayName: candidate.name },
      ...attendeeEmails.map(e => ({ email: e })),
    ].filter(a => a.email),
    conferenceData: interview.videoLink ? undefined : undefined, // Zoom/Teams géré séparément
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // J-1
        { method: 'popup', minutes: 30 },
      ],
    },
    sendUpdates: 'all', // Envoie invitations aux participants
  };

  const result = await jsonRequest(
    'www.googleapis.com',
    `/calendar/v3/calendars/primary/events?sendUpdates=all`,
    'POST',
    { Authorization: `Bearer ${accessToken}` },
    event
  );

  if (result.status !== 200 && result.status !== 201) {
    throw new Error(`Google Calendar API erreur ${result.status}: ${JSON.stringify(result.body)}`);
  }

  logger.info('[Calendar] Événement Google créé', { eventId: result.body.id, candidate: candidate.name });
  return { googleEventId: result.body.id, googleEventUrl: result.body.htmlLink };
}

/**
 * Met à jour un événement Google Calendar existant.
 */
export async function updateGoogleCalendarEvent(tokens, googleEventId, updates) {
  let accessToken = tokens.accessToken;
  if (Date.now() > (tokens.expiresAt - 60000) && tokens.refreshToken) {
    const refreshed = await refreshGoogleToken(tokens.refreshToken);
    accessToken = refreshed.accessToken;
  }

  const result = await jsonRequest(
    'www.googleapis.com',
    `/calendar/v3/calendars/primary/events/${googleEventId}?sendUpdates=all`,
    'PATCH',
    { Authorization: `Bearer ${accessToken}` },
    updates
  );

  if (result.status !== 200) {
    throw new Error(`Google Calendar update erreur ${result.status}: ${JSON.stringify(result.body)}`);
  }
  return result.body;
}

/**
 * Supprime un événement Google Calendar.
 */
export async function deleteGoogleCalendarEvent(tokens, googleEventId) {
  let accessToken = tokens.accessToken;
  if (Date.now() > (tokens.expiresAt - 60000) && tokens.refreshToken) {
    const refreshed = await refreshGoogleToken(tokens.refreshToken);
    accessToken = refreshed.accessToken;
  }

  const result = await jsonRequest(
    'www.googleapis.com',
    `/calendar/v3/calendars/primary/events/${googleEventId}?sendUpdates=all`,
    'DELETE',
    { Authorization: `Bearer ${accessToken}` }
  );

  if (result.status !== 204 && result.status !== 200) {
    logger.warn('[Calendar] Google delete event warning', { status: result.status, eventId: googleEventId });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MICROSOFT OUTLOOK / CALENDAR — T-271
// ═══════════════════════════════════════════════════════════════════════════════

const MS = {
  clientId:     () => process.env.MICROSOFT_CLIENT_ID,
  clientSecret: () => process.env.MICROSOFT_CLIENT_SECRET,
  tenantId:     () => process.env.MICROSOFT_TENANT_ID || 'common',
  redirectUri:  () => process.env.MICROSOFT_REDIRECT_URI || 'https://ats-ultimate.com/api/calendar/microsoft/callback',
  isEnabled:    () => !!(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET),
};

/**
 * Génère l'URL de consentement OAuth2 Microsoft.
 */
export function getMicrosoftAuthUrl(state = '') {
  if (!MS.isEnabled()) throw new Error('Microsoft OAuth non configuré. Définissez MICROSOFT_CLIENT_ID et MICROSOFT_CLIENT_SECRET.');

  const params = new URLSearchParams({
    client_id: MS.clientId(),
    redirect_uri: MS.redirectUri(),
    response_type: 'code',
    scope: 'Calendars.ReadWrite User.Read offline_access',
    state,
    response_mode: 'query',
  });

  return `https://login.microsoftonline.com/${MS.tenantId()}/oauth2/v2.0/authorize?${params}`;
}

/**
 * Échange le code Microsoft contre les tokens.
 */
export async function exchangeMicrosoftCode(code) {
  const result = await formRequest(
    'login.microsoftonline.com',
    `/${MS.tenantId()}/oauth2/v2.0/token`,
    {
      code,
      client_id: MS.clientId(),
      client_secret: MS.clientSecret(),
      redirect_uri: MS.redirectUri(),
      grant_type: 'authorization_code',
      scope: 'Calendars.ReadWrite User.Read offline_access',
    }
  );

  if (result.status !== 200) {
    throw new Error(`Microsoft token exchange erreur ${result.status}: ${JSON.stringify(result.body)}`);
  }

  return {
    accessToken:  result.body.access_token,
    refreshToken: result.body.refresh_token,
    expiresAt:    Date.now() + (result.body.expires_in * 1000),
    scope:        result.body.scope,
  };
}

/**
 * Rafraîchit le token Microsoft.
 */
export async function refreshMicrosoftToken(refreshToken) {
  const result = await formRequest(
    'login.microsoftonline.com',
    `/${MS.tenantId()}/oauth2/v2.0/token`,
    {
      refresh_token: refreshToken,
      client_id: MS.clientId(),
      client_secret: MS.clientSecret(),
      grant_type: 'refresh_token',
    }
  );

  if (result.status !== 200) throw new Error(`Microsoft refresh token erreur ${result.status}`);

  return {
    accessToken: result.body.access_token,
    expiresAt:   Date.now() + (result.body.expires_in * 1000),
  };
}

/**
 * Crée un événement dans Outlook Calendar via Microsoft Graph API.
 */
export async function createOutlookEvent(tokens, interview, candidate, mission, attendeeEmails = []) {
  let accessToken = tokens.accessToken;
  if (Date.now() > (tokens.expiresAt - 60000) && tokens.refreshToken) {
    const refreshed = await refreshMicrosoftToken(tokens.refreshToken);
    accessToken = refreshed.accessToken;
  }

  const startDt = new Date(interview.date);
  const endDt = new Date(startDt.getTime() + ((interview.duration || 60) * 60000));

  const event = {
    subject: `Entretien — ${candidate.name} — ${mission.title}`,
    body: {
      contentType: 'text',
      content: [
        `Candidat : ${candidate.name} (${candidate.email || ''})`,
        `Poste : ${mission.title}`,
        interview.notes ? `Notes : ${interview.notes}` : '',
        interview.videoLink ? `Lien vidéo : ${interview.videoLink}` : '',
      ].filter(Boolean).join('\n'),
    },
    start: { dateTime: startDt.toISOString().slice(0, 19), timeZone: 'Europe/Paris' },
    end:   { dateTime: endDt.toISOString().slice(0, 19),   timeZone: 'Europe/Paris' },
    location: { displayName: interview.location || (interview.videoLink ? 'Visioconférence' : '') },
    attendees: [
      { emailAddress: { address: candidate.email, name: candidate.name }, type: 'required' },
      ...attendeeEmails.map(e => ({ emailAddress: { address: e }, type: 'required' })),
    ].filter(a => a.emailAddress.address),
    isOnlineMeeting: !!interview.videoLink,
    onlineMeetingProvider: interview.type === 'teams' ? 'teamsForBusiness' : 'unknown',
    reminderMinutesBeforeStart: 30,
    isReminderOn: true,
  };

  const result = await jsonRequest(
    'graph.microsoft.com',
    '/v1.0/me/events',
    'POST',
    { Authorization: `Bearer ${accessToken}` },
    event
  );

  if (result.status !== 201 && result.status !== 200) {
    throw new Error(`Microsoft Graph API erreur ${result.status}: ${JSON.stringify(result.body)}`);
  }

  logger.info('[Calendar] Événement Outlook créé', { eventId: result.body.id, candidate: candidate.name });
  return { outlookEventId: result.body.id, outlookEventUrl: result.body.webLink };
}

/**
 * Supprime un événement Outlook Calendar.
 */
export async function deleteOutlookEvent(tokens, outlookEventId) {
  let accessToken = tokens.accessToken;
  if (Date.now() > (tokens.expiresAt - 60000) && tokens.refreshToken) {
    const refreshed = await refreshMicrosoftToken(tokens.refreshToken);
    accessToken = refreshed.accessToken;
  }

  const result = await jsonRequest(
    'graph.microsoft.com',
    `/v1.0/me/events/${outlookEventId}`,
    'DELETE',
    { Authorization: `Bearer ${accessToken}` }
  );

  if (result.status !== 204 && result.status !== 200) {
    logger.warn('[Calendar] Outlook delete event warning', { status: result.status, eventId: outlookEventId });
  }
}

export default {
  getGoogleAuthUrl, exchangeGoogleCode, refreshGoogleToken,
  createGoogleCalendarEvent, updateGoogleCalendarEvent, deleteGoogleCalendarEvent,
  getMicrosoftAuthUrl, exchangeMicrosoftCode, refreshMicrosoftToken,
  createOutlookEvent, deleteOutlookEvent,
};
