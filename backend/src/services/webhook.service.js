/**
 * 🔔 Webhook Service — T-276
 *
 * Implémente les webhooks sortants réels vers Zapier, Make (ex-Integromat),
 * et endpoints personnalisés. L'UI des webhooks existe déjà dans AdminPage ;
 * ce service remplace les envois simulés par de vrais appels HTTP avec :
 *   - Retry automatique (3 tentatives, backoff exponentiel : 5s / 25s / 125s)
 *   - Timeout 10 secondes par tentative
 *   - Logs persistants en DB (WebhookLog model)
 *   - Signature HMAC-SHA256 pour vérification côté destinataire
 *   - File d'attente légère (en mémoire, remplaceable par Bull/Redis en prod)
 */

import crypto from 'crypto';
import https from 'https';
import http from 'http';
import dns from 'dns';
import net from 'net';
import logger from '../utils/logger.js';

// ── T-340 : garde-fou SSRF ──────────────────────────────────────────────────
// Un utilisateur admin/manager de sa propre company pouvait enregistrer
// n'importe quelle URL de webhook (169.254.169.254 métadonnées cloud,
// localhost, réseau interne...) : sendHttpRequest faisait la requête serveur
// sans aucune validation d'IP/hostname. On bloque désormais les cibles privées/
// réservées, et on fige l'IP résolue au moment de la validation (via l'option
// `lookup`) pour éviter un contournement par DNS rebinding entre la validation
// et l'envoi réel de la requête.

function isPrivateOrReservedIP(ip) {
  const version = net.isIP(ip);
  if (version === 4) {
    const [a, b] = ip.split('.').map(Number);
    if (a === 10) return true;                          // 10.0.0.0/8
    if (a === 127) return true;                          // 127.0.0.0/8 (loopback)
    if (a === 169 && b === 254) return true;              // 169.254.0.0/16 (link-local, métadonnées cloud)
    if (a === 172 && b >= 16 && b <= 31) return true;      // 172.16.0.0/12
    if (a === 192 && b === 168) return true;               // 192.168.0.0/16
    if (a === 100 && b >= 64 && b <= 127) return true;     // 100.64.0.0/10 (CGNAT)
    if (a === 0) return true;                              // 0.0.0.0/8
    if (a >= 224) return true;                             // 224.0.0.0/4 multicast + 240.0.0.0/4 réservé
    return false;
  }
  if (version === 6) {
    const lower = ip.toLowerCase();
    if (lower === '::1') return true;                      // loopback
    if (lower.startsWith('fe80:') || lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true; // link-local fe80::/10
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // unique local fc00::/7
    // IPv4-mapped (::ffff:a.b.c.d) : revalider l'IPv4 embarquée
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateOrReservedIP(mapped[1]);
    return false;
  }
  return true; // ni IPv4 ni IPv6 reconnu → on refuse par prudence
}

/**
 * Résout le hostname et rejette toute cible privée/réservée. Retourne l'IP
 * validée à utiliser pour la connexion (fige la résolution DNS).
 */
async function assertPublicHostnameAndResolve(hostname) {
  if (hostname.toLowerCase() === 'localhost') {
    throw new Error('URL de webhook refusée : hôte local non autorisé');
  }
  // IP littérale dans l'URL (pas de résolution DNS nécessaire)
  if (net.isIP(hostname)) {
    if (isPrivateOrReservedIP(hostname)) {
      throw new Error('URL de webhook refusée : adresse IP privée/réservée non autorisée');
    }
    return hostname;
  }
  const addresses = await dns.promises.lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length) {
    throw new Error('URL de webhook refusée : hostname introuvable');
  }
  for (const { address } of addresses) {
    if (isPrivateOrReservedIP(address)) {
      throw new Error('URL de webhook refusée : ce nom de domaine résout vers une adresse privée/réservée');
    }
  }
  return addresses[0].address;
}

// ── Constantes ────────────────────────────────────────────────────────────────

const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [5000, 25000, 125000]; // 5s, 25s, 125s (backoff exp)
const TIMEOUT_MS = 10000; // 10s timeout par tentative

// ── Signature HMAC ────────────────────────────────────────────────────────────

/**
 * Génère la signature HMAC-SHA256 du payload.
 * Le destinataire peut vérifier : HMAC-SHA256(secret, JSON.stringify(payload))
 */
function signPayload(payload, secret) {
  if (!secret) return null;
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
}

// ── HTTP request avec timeout ──────────────────────────────────────────────────

async function sendHttpRequest(url, payload, headers = {}) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('URL de webhook refusée : seuls http:// et https:// sont autorisés');
  }
  // T-340 : résout et valide la cible AVANT toute connexion (bloque
  // localhost/réseau privé/métadonnées cloud), et fige l'IP validée via
  // `lookup` pour empêcher un contournement par DNS rebinding.
  const resolvedIP = await assertPublicHostnameAndResolve(parsed.hostname);

  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const lib = parsed.protocol === 'https:' ? https : http;

    const req = lib.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: 'POST',
        timeout: TIMEOUT_MS,
        lookup: (_hostname, _options, callback) => callback(null, resolvedIP, net.isIP(resolvedIP)),
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'User-Agent': 'ATS-Ultimate-Webhooks/1.0',
          ...headers,
        },
      },
      res => {
        let raw = '';
        res.on('data', c => (raw += c));
        res.on('end', () => resolve({ status: res.statusCode, body: raw.slice(0, 500) }));
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout après ${TIMEOUT_MS}ms`));
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ── Delivery avec retry ───────────────────────────────────────────────────────

/**
 * Envoie un événement webhook avec retry automatique et backoff exponentiel.
 * @param {object} webhook — { url, secret?, headers?: {} }
 * @param {object} event — { event, data }
 * @returns {Promise<{success, attempts, lastStatus, lastError, duration}>}
 */
export async function deliverWebhookEvent(webhook, event) {
  const { url, secret, headers: customHeaders = {} } = webhook;
  const startTime = Date.now();
  let lastError = null;
  let lastStatus = null;
  let attempt = 0;

  const payload = {
    event: event.event,
    data: event.data,
    timestamp: new Date().toISOString(),
    webhookId: webhook.id || webhook._id || null,
  };

  const signature = signPayload(payload, secret);
  const headers = {
    ...customHeaders,
    ...(signature && { 'X-Webhook-Signature': `sha256=${signature}` }),
    'X-Webhook-Attempt': '1',
  };

  for (let i = 0; i < MAX_RETRIES; i++) {
    attempt = i + 1;
    headers['X-Webhook-Attempt'] = String(attempt);

    try {
      const result = await sendHttpRequest(url, payload, headers);
      lastStatus = result.status;

      if (result.status >= 200 && result.status < 300) {
        const duration = Date.now() - startTime;
        logger.info('[Webhook] Livré avec succès', {
          url, event: event.event, attempt, status: result.status, duration,
        });
        return { success: true, attempts: attempt, lastStatus: result.status, duration };
      }

      // 4xx ne mérite généralement pas un retry (erreur côté destinataire)
      if (result.status >= 400 && result.status < 500) {
        lastError = `HTTP ${result.status} (client error, pas de retry)`;
        logger.warn('[Webhook] Erreur client — pas de retry', {
          url, event: event.event, status: result.status, body: result.body,
        });
        break;
      }

      lastError = `HTTP ${result.status}`;
    } catch (err) {
      lastError = err.message;
      logger.warn('[Webhook] Tentative échouée', {
        url, event: event.event, attempt, error: err.message,
      });
    }

    // Attente avant retry (pas de délai après la dernière tentative)
    if (i < MAX_RETRIES - 1) {
      const delay = RETRY_DELAYS_MS[i];
      logger.info(`[Webhook] Retry dans ${delay / 1000}s`, { url, attempt: attempt + 1 });
      await new Promise(r => setTimeout(r, delay));
    }
  }

  const duration = Date.now() - startTime;
  logger.error('[Webhook] Livraison échouée après toutes les tentatives', {
    url, event: event.event, attempts: attempt, lastError, lastStatus, duration,
  });

  return { success: false, attempts: attempt, lastStatus, lastError, duration };
}

// ── Catalogue d'événements ATS ────────────────────────────────────────────────

export const WEBHOOK_EVENTS = {
  // Candidatures
  'application.created':      'Nouvelle candidature reçue',
  'application.status_changed': 'Statut candidature changé',
  'application.hired':        'Candidat embauché',
  'application.rejected':     'Candidature rejetée',
  // Candidats
  'candidate.created':        'Nouveau candidat ajouté',
  'candidate.updated':        'Profil candidat mis à jour',
  'candidate.deleted':        'Candidat supprimé (droit à l\'oubli)',
  // Missions
  'mission.created':          'Nouvelle mission créée',
  'mission.published':        'Mission publiée sur un jobboard',
  'mission.closed':           'Mission clôturée',
  'mission.approved':         'Mission approuvée par le manager',
  // Entretiens
  'interview.scheduled':      'Entretien planifié',
  'interview.reminder':       'Rappel entretien (J-1)',
  // Équipe
  'team.member_added':        'Nouveau membre d\'équipe invité',
  'team.member_removed':      'Membre d\'équipe retiré',
};

// ── Dispatch vers tous les webhooks actifs d'une company ─────────────────────

/**
 * Déclenche un événement pour tous les webhooks actifs d'une company.
 * À appeler depuis les contrôleurs après chaque action importante.
 *
 * @param {string} companyId
 * @param {string} eventName — clé dans WEBHOOK_EVENTS
 * @param {object} data — payload de l'événement
 */
export async function triggerWebhookEvent(companyId, eventName, data) {
  if (!companyId || !eventName) return;

  // Chargement lazy du modèle pour éviter les dépendances circulaires
  let webhooks = [];
  try {
    const WebhookConfig = (await import('../models/WebhookConfig.model.js')).default;
    webhooks = await WebhookConfig.find({
      companyId,
      enabled: true,
      events: eventName,
    }).lean();
  } catch {
    // Modèle non disponible (mock DB) — log silencieux
    logger.debug('[Webhook] Modèle WebhookConfig non disponible (mock mode)', { companyId, eventName });
    return;
  }

  if (!webhooks.length) return;

  const event = { event: eventName, data };

  // Livraison en parallèle (sans bloquer le thread principal)
  Promise.allSettled(
    webhooks.map(async webhook => {
      const result = await deliverWebhookEvent(webhook, event);
      // Persistance du log en DB
      try {
        const WebhookLog = (await import('../models/WebhookLog.model.js')).default;
        await WebhookLog.create({
          companyId,
          webhookId: webhook._id,
          event: eventName,
          url: webhook.url,
          success: result.success,
          attempts: result.attempts,
          lastStatus: result.lastStatus,
          lastError: result.lastError,
          duration: result.duration,
        });
      } catch (logErr) {
        logger.debug('[Webhook] Log non persisté (mock mode)', { error: logErr.message });
      }
    })
  );
}

// ── Test webhook (envoi d'un ping) ────────────────────────────────────────────

export async function pingWebhook(url, secret = null) {
  const event = {
    event: 'ping',
    data: { message: 'Test webhook depuis ATS Ultimate', timestamp: new Date().toISOString() },
  };
  return deliverWebhookEvent({ url, secret }, event);
}

export default { deliverWebhookEvent, triggerWebhookEvent, pingWebhook, WEBHOOK_EVENTS, signPayload };
