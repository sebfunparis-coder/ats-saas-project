/**
 * 🔔 Webhook Routes — T-276
 * /api/webhooks/*
 *
 * Endpoints pour gérer les webhooks sortants (Zapier, Make, endpoints custom).
 * L'UI de configuration dans AdminPage → Webhooks est déjà construite ;
 * ces routes implémentent le backend réel.
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { pingWebhook, WEBHOOK_EVENTS } from '../services/webhook.service.js';
import { AppError } from '../utils/AppError.js';
import { sensitiveLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();
router.use(protect, authorize('admin', 'superadmin', 'manager'));

// ── Modèle WebhookConfig (lazy import car peut être absent en mock mode) ──────

async function getWebhookConfig() {
  try {
    return (await import('../models/WebhookConfig.model.js')).default;
  } catch {
    return null;
  }
}

// ── GET /api/webhooks ─────────────────────────────────────────────────────────

router.get('/', async (req, res, next) => {
  try {
    const WebhookConfig = await getWebhookConfig();
    if (!WebhookConfig) return res.json({ success: true, data: [] });

    const webhooks = await WebhookConfig.find({ companyId: req.user.companyId })
      .select('-secret')
      .lean();

    res.json({ success: true, data: webhooks });
  } catch (err) { next(err); }
});

// ── POST /api/webhooks ────────────────────────────────────────────────────────

router.post('/', async (req, res, next) => {
  try {
    const { url, events = [], secret, enabled = true, name } = req.body;

    if (!url) return next(new AppError('URL requise', 400));
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      return next(new AppError('URL invalide (https:// ou http:// requis)', 400));
    }

    const invalidEvents = events.filter(e => !WEBHOOK_EVENTS[e]);
    if (invalidEvents.length) {
      return next(new AppError(`Événements inconnus : ${invalidEvents.join(', ')}`, 400));
    }

    const WebhookConfig = await getWebhookConfig();
    if (!WebhookConfig) return next(new AppError('Webhooks nécessitent MongoDB', 503));

    const webhook = await WebhookConfig.create({
      companyId: req.user.companyId,
      name: name || url,
      url,
      events,
      secret: secret || null,
      enabled,
    });

    const { secret: _, ...safeWebhook } = webhook.toObject();
    res.status(201).json({ success: true, data: safeWebhook });
  } catch (err) { next(err); }
});

// ── PUT /api/webhooks/:id ─────────────────────────────────────────────────────

router.put('/:id', async (req, res, next) => {
  try {
    const WebhookConfig = await getWebhookConfig();
    if (!WebhookConfig) return next(new AppError('Webhooks nécessitent MongoDB', 503));

    const { url, events, secret, enabled, name } = req.body;
    const updates = {};
    if (url !== undefined) updates.url = url;
    if (events !== undefined) updates.events = events;
    if (secret !== undefined) updates.secret = secret;
    if (enabled !== undefined) updates.enabled = enabled;
    if (name !== undefined) updates.name = name;

    const webhook = await WebhookConfig.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-secret').lean();

    if (!webhook) return next(new AppError('Webhook introuvable', 404));
    res.json({ success: true, data: webhook });
  } catch (err) { next(err); }
});

// ── DELETE /api/webhooks/:id ──────────────────────────────────────────────────

router.delete('/:id', sensitiveLimiter, async (req, res, next) => {
  try {
    const WebhookConfig = await getWebhookConfig();
    if (!WebhookConfig) return next(new AppError('Webhooks nécessitent MongoDB', 503));

    await WebhookConfig.findOneAndDelete({ _id: req.params.id, companyId: req.user.companyId });
    res.json({ success: true, message: 'Webhook supprimé' });
  } catch (err) { next(err); }
});

// ── POST /api/webhooks/:id/ping — Envoi d'un ping de test réel (T-276) ────────

router.post('/:id/ping', async (req, res, next) => {
  try {
    const WebhookConfig = await getWebhookConfig();
    let url, secret;

    if (WebhookConfig) {
      const webhook = await WebhookConfig.findOne({ _id: req.params.id, companyId: req.user.companyId });
      if (!webhook) return next(new AppError('Webhook introuvable', 404));
      url = webhook.url;
      secret = webhook.secret;
    } else {
      // Mock mode : utiliser l'URL passée dans le body
      url = req.body.url;
      secret = req.body.secret;
    }

    if (!url) return next(new AppError('URL webhook requise', 400));

    // Envoyer un ping réel avec retry (T-276)
    const result = await pingWebhook(url, secret);

    res.json({
      success: result.success,
      data: result,
      message: result.success
        ? `Ping livré avec succès (HTTP ${result.lastStatus}, ${result.attempts} tentative(s), ${result.duration}ms)`
        : `Échec après ${result.attempts} tentative(s) : ${result.lastError}`,
    });
  } catch (err) { next(err); }
});

// ── GET /api/webhooks/events — Liste des événements disponibles ───────────────

router.get('/events/catalog', (req, res) => {
  res.json({
    success: true,
    data: Object.entries(WEBHOOK_EVENTS).map(([key, description]) => ({ event: key, description })),
  });
});

// ── GET /api/webhooks/:id/logs — Logs des livraisons ─────────────────────────

router.get('/:id/logs', async (req, res, next) => {
  try {
    let logs = [];
    try {
      const WebhookLog = (await import('../models/WebhookLog.model.js')).default;
      logs = await WebhookLog.find({ webhookId: req.params.id, companyId: req.user.companyId })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
    } catch {
      // Modèle absent (mock mode)
    }
    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
});

export default router;
