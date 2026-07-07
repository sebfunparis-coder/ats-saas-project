/**
 * 🎥 Video Call Service — T-272 (Zoom) + T-273 (Microsoft Teams)
 *
 * Création automatique de réunions vidéo lors de la planification d'entretiens.
 * Le lien est inclus dans l'invitation email et le SMS de convocation.
 *
 * ── Zoom (T-272) ──────────────────────────────────────────────────────────────
 * Variables d'environnement :
 *   ZOOM_ACCOUNT_ID     — Server-to-Server OAuth App → Account ID
 *   ZOOM_CLIENT_ID      — Server-to-Server OAuth App → Client ID
 *   ZOOM_CLIENT_SECRET  — Server-to-Server OAuth App → Client Secret
 *
 * Note : Zoom Server-to-Server OAuth (recommandé) ne nécessite pas que chaque
 * utilisateur autorise individuellement. Un seul compte Zoom "hôte" crée les
 * réunions pour toute la company. Alternative : JWT Credentials (déprécié mars 2023).
 *
 * ── Microsoft Teams (T-273) ──────────────────────────────────────────────────
 * Réutilise les tokens Microsoft OAuth2 du calendar.service.js.
 * Nécessite en plus la permission OnlineMeetings.ReadWrite dans Azure AD.
 * Variables d'environnement : mêmes que calendar.service.js (MICROSOFT_*).
 *
 * Détection préférence de la company : champ company.videoProvider
 * (zoom | teams | none, voir Company.model.js) défini dans AdminPage → Paramètres.
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

// ═══════════════════════════════════════════════════════════════════════════════
// ZOOM — T-272
// ═══════════════════════════════════════════════════════════════════════════════

const ZOOM = {
  accountId:    () => process.env.ZOOM_ACCOUNT_ID,
  clientId:     () => process.env.ZOOM_CLIENT_ID,
  clientSecret: () => process.env.ZOOM_CLIENT_SECRET,
  isEnabled:    () => !!(process.env.ZOOM_ACCOUNT_ID && process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET),
};

// Cache du token Zoom (Server-to-Server OAuth, expire en 1h)
let _zoomTokenCache = null;

/**
 * Obtient un token Zoom via Server-to-Server OAuth (Account Credentials).
 */
async function getZoomAccessToken() {
  if (_zoomTokenCache && _zoomTokenCache.expiresAt > Date.now() + 30000) {
    return _zoomTokenCache.token;
  }

  const credentials = Buffer.from(`${ZOOM.clientId()}:${ZOOM.clientSecret()}`).toString('base64');

  const result = await new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      grant_type: 'account_credentials',
      account_id: ZOOM.accountId(),
    }).toString();

    const req = https.request(
      {
        hostname: 'zoom.us',
        path: '/oauth/token',
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
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
    req.write(body);
    req.end();
  });

  if (result.status !== 200) {
    throw new Error(`Zoom token erreur ${result.status}: ${JSON.stringify(result.body)}`);
  }

  _zoomTokenCache = {
    token:     result.body.access_token,
    expiresAt: Date.now() + (result.body.expires_in * 1000),
  };

  return _zoomTokenCache.token;
}

/**
 * Crée une réunion Zoom pour un entretien.
 * @param {object} interview — { date, duration (min), title }
 * @param {object} candidate — { name }
 * @param {object} mission — { title }
 * @returns {Promise<{joinUrl, startUrl, meetingId, password}>}
 */
export async function createZoomMeeting(interview, candidate, mission) {
  if (!ZOOM.isEnabled()) {
    throw new Error('Zoom non configuré. Définissez ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID et ZOOM_CLIENT_SECRET.');
  }

  const accessToken = await getZoomAccessToken();
  const startTime = new Date(interview.date).toISOString().replace('.000', '');

  const meetingPayload = {
    topic: `Entretien — ${candidate.name} — ${mission.title}`,
    type: 2, // Scheduled meeting
    start_time: startTime,
    duration: interview.duration || 60,
    timezone: 'Europe/Paris',
    agenda: `Entretien pour le poste : ${mission.title}\nCandidature de : ${candidate.name}`,
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: false,
      mute_upon_entry: false,
      waiting_room: true,
      auto_recording: 'none',
      audio: 'both',
      approval_type: 2, // No registration required
    },
  };

  const result = await jsonRequest(
    'api.zoom.us',
    '/v2/users/me/meetings',
    'POST',
    { Authorization: `Bearer ${accessToken}` },
    meetingPayload
  );

  if (result.status !== 201 && result.status !== 200) {
    throw new Error(`Zoom API erreur ${result.status}: ${JSON.stringify(result.body)}`);
  }

  logger.info('[Videocall] Réunion Zoom créée', { meetingId: result.body.id, candidate: candidate.name });

  return {
    provider: 'zoom',
    meetingId: String(result.body.id),
    joinUrl: result.body.join_url,
    startUrl: result.body.start_url, // URL hôte (ne pas partager avec le candidat)
    password: result.body.password,
  };
}

/**
 * Supprime une réunion Zoom.
 */
export async function deleteZoomMeeting(meetingId) {
  if (!ZOOM.isEnabled()) return;

  try {
    const accessToken = await getZoomAccessToken();
    await jsonRequest(
      'api.zoom.us',
      `/v2/meetings/${meetingId}`,
      'DELETE',
      { Authorization: `Bearer ${accessToken}` }
    );
    logger.info('[Videocall] Réunion Zoom supprimée', { meetingId });
  } catch (err) {
    logger.warn('[Videocall] Zoom delete warning', { meetingId, error: err.message });
  }
}

/**
 * Teste la configuration Zoom.
 */
export async function testZoomConfig() {
  if (!ZOOM.isEnabled()) {
    throw new Error('Zoom non configuré. Définissez ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID et ZOOM_CLIENT_SECRET.');
  }

  const accessToken = await getZoomAccessToken();
  const result = await jsonRequest(
    'api.zoom.us',
    '/v2/users/me',
    'GET',
    { Authorization: `Bearer ${accessToken}` }
  );

  if (result.status !== 200) throw new Error(`Zoom API inaccessible (HTTP ${result.status})`);

  return {
    userId: result.body.id,
    email: result.body.email,
    accountId: result.body.account_id,
    plan: result.body.type === 1 ? 'Basic (gratuit)' : 'Pro/Business',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MICROSOFT TEAMS — T-273
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Crée une réunion Teams via Microsoft Graph API.
 * Réutilise les tokens du calendar.service.js (OAuth2 Microsoft, permission OnlineMeetings.ReadWrite).
 *
 * @param {object} tokens — { accessToken, refreshToken, expiresAt } issus de l'auth Microsoft
 * @param {object} interview — { date, duration (min) }
 * @param {object} candidate — { name }
 * @param {object} mission — { title }
 * @returns {Promise<{joinUrl, meetingId}>}
 */
export async function createTeamsMeeting(tokens, interview, candidate, mission) {
  if (!tokens?.accessToken) {
    throw new Error('Compte Microsoft non connecté. Autorisez la connexion Microsoft dans les paramètres admin.');
  }

  // Rafraîchir le token si nécessaire
  let accessToken = tokens.accessToken;
  if (Date.now() > (tokens.expiresAt - 60000) && tokens.refreshToken) {
    const { refreshMicrosoftToken } = await import('./calendar.service.js');
    const refreshed = await refreshMicrosoftToken(tokens.refreshToken);
    accessToken = refreshed.accessToken;
  }

  const startDt = new Date(interview.date);
  const endDt = new Date(startDt.getTime() + ((interview.duration || 60) * 60000));

  const meetingPayload = {
    subject: `Entretien — ${candidate.name} — ${mission.title}`,
    startDateTime: startDt.toISOString(),
    endDateTime: endDt.toISOString(),
    lobbyBypassSettings: {
      scope: 'organizer',
      isDialInBypassEnabled: false,
    },
    audioConferencing: {
      dialinUrl: null,
      conferenceId: null,
    },
  };

  const result = await jsonRequest(
    'graph.microsoft.com',
    '/v1.0/me/onlineMeetings',
    'POST',
    { Authorization: `Bearer ${accessToken}` },
    meetingPayload
  );

  if (result.status !== 201 && result.status !== 200) {
    throw new Error(`Teams API erreur ${result.status}: ${JSON.stringify(result.body)}`);
  }

  logger.info('[Videocall] Réunion Teams créée', { meetingId: result.body.id, candidate: candidate.name });

  return {
    provider: 'teams',
    meetingId: result.body.id,
    joinUrl: result.body.joinWebUrl,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Dispatcher — détection préférence company
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Crée une réunion vidéo selon la préférence de la company.
 * @param {string} provider — 'zoom' | 'teams' | 'none'
 * @param {object} tokens — tokens OAuth Microsoft (pour Teams uniquement)
 */
export async function createVideoMeeting(provider, tokens, interview, candidate, mission) {
  switch (provider) {
    case 'zoom':
      return createZoomMeeting(interview, candidate, mission);
    case 'teams':
      return createTeamsMeeting(tokens, interview, candidate, mission);
    default:
      return null; // Pas de réunion vidéo automatique
  }
}

export default { createZoomMeeting, deleteZoomMeeting, testZoomConfig, createTeamsMeeting, createVideoMeeting };
