/**
 * SSE Routes — Server-Sent Events
 *
 * GET /api/sse/stream — connexion SSE persistante, auth JWT via query param.
 * EventSource ne supporte pas les headers custom, d'où le token en query string.
 */

import express from 'express';
import { addClient, removeClient } from '../utils/sseManager.js';
import { resolveUserFromJWT } from '../middleware/auth.middleware.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.get('/stream', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token requis' });
  }

  // T-338 : utilise désormais exactement les mêmes vérifications que le
  // middleware `protect` (utilisateur toujours actif, company non suspendue,
  // email vérifié, trial non expiré) — avant, un simple jwt.verify() laissait
  // un employé désactivé ou une company suspendue continuer à recevoir les
  // mises à jour temps réel tant que le JWT n'avait pas expiré (jusqu'à 7j).
  let user;
  try {
    user = await resolveUserFromJWT(token, req);
  } catch (err) {
    return res.status(err.statusCode || 401).json({ success: false, message: err.message || 'Token invalide' });
  }

  const companyId = String(user.companyId);

  // SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // désactive le buffering Nginx
  });

  // Confirmation de connexion
  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', companyId })}\n\n`);

  addClient(companyId, res);
  logger.info(`SSE client connected — companyId: ${companyId}`);

  // Heartbeat toutes les 30s pour maintenir la connexion ouverte
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeClient(companyId, res);
    logger.info(`SSE client disconnected — companyId: ${companyId}`);
  });
});

export default router;
