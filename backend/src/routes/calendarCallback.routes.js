/**
 * 📅 Calendar OAuth2 Callback Routes — T-270 (Google) + T-271 (Microsoft)
 * /api/calendar/*
 */

import express from 'express';
import crypto from 'crypto';
import { protect } from '../middleware/auth.middleware.js';
import {
  getGoogleAuthUrl, exchangeGoogleCode,
  getMicrosoftAuthUrl, exchangeMicrosoftCode,
} from '../services/calendar.service.js';
import { AppError } from '../utils/AppError.js';

const router = express.Router();

// T-365 : le `state` OAuth n'était qu'un base64(JSON) auto-porté, sans
// signature ni nonce vérifié côté serveur — un attaquant pouvait faire son
// propre consentement OAuth, puis appeler le callback avec un `state` ciblant
// le companyId d'une victime pour lui injecter SES tokens (le futur sync
// calendrier de la victime serait alors passé par le calendrier de
// l'attaquant). Signé désormais avec HMAC-SHA256 (JWT_SECRET, jamais exposé
// au client) + horodatage vérifié (10 min max) : falsifier un state exige de
// connaître le secret serveur, pas seulement le companyId/userId de la cible.
const STATE_TTL_MS = 10 * 60 * 1000;

export function signState(payload) {
  const json = JSON.stringify({ ...payload, iat: Date.now() });
  const b64 = Buffer.from(json).toString('base64url');
  const sig = crypto.createHmac('sha256', process.env.JWT_SECRET).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

export function verifySignedState(state) {
  const [b64, sig] = String(state || '').split('.');
  if (!b64 || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', process.env.JWT_SECRET).update(b64).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString());
    if (!payload.iat || Date.now() - payload.iat > STATE_TTL_MS) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Google Calendar — T-270 ───────────────────────────────────────────────────

/**
 * GET /api/calendar/google/auth-url
 * Génère l'URL OAuth2 Google. Le frontend redirige le recruteur vers cette URL.
 */
router.get('/google/auth-url', protect, (req, res, next) => {
  try {
    const state = signState({ companyId: req.user.companyId, userId: req.user.id });
    const url = getGoogleAuthUrl(state);
    res.json({ success: true, data: { url } });
  } catch (err) { next(err); }
});

/**
 * GET /api/calendar/google/callback
 * Callback OAuth2 Google : échange le code contre les tokens et les stocke.
 * Configuré dans Google Cloud Console comme Redirect URI.
 */
router.get('/google/callback', async (req, res, next) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/app/admin?tab=integrations&error=google_calendar_denied`);
    }

    if (!code) return next(new AppError('Code OAuth manquant', 400));

    const parsedState = verifySignedState(state);
    if (!parsedState) return next(new AppError('State OAuth invalide ou expiré', 400));

    const tokens = await exchangeGoogleCode(code);

    // Stocker les tokens dans la DB de la company
    // (adaptez selon votre modèle — ici utilisation du modèle Company)
    if (parsedState.companyId) {
      const Company = (await import('../models/Company.model.js')).default;
      await Company.findByIdAndUpdate(parsedState.companyId, {
        'integrationTokens.googleCalendar': {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(tokens.expiresAt),
          connectedAt: new Date(),
          scope: tokens.scope,
        },
      });
    }

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/app/admin?tab=integrations&success=google_calendar`);
  } catch (err) { next(err); }
});

// ── Microsoft Outlook — T-271 ─────────────────────────────────────────────────

/**
 * GET /api/calendar/microsoft/auth-url
 */
router.get('/microsoft/auth-url', protect, (req, res, next) => {
  try {
    const state = signState({ companyId: req.user.companyId, userId: req.user.id });
    const url = getMicrosoftAuthUrl(state);
    res.json({ success: true, data: { url } });
  } catch (err) { next(err); }
});

/**
 * GET /api/calendar/microsoft/callback
 */
router.get('/microsoft/callback', async (req, res, next) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/app/admin?tab=integrations&error=microsoft_calendar_denied`);
    }

    if (!code) return next(new AppError('Code OAuth manquant', 400));

    const parsedState = verifySignedState(state);
    if (!parsedState) return next(new AppError('State OAuth invalide ou expiré', 400));

    const tokens = await exchangeMicrosoftCode(code);

    if (parsedState.companyId) {
      const Company = (await import('../models/Company.model.js')).default;
      await Company.findByIdAndUpdate(parsedState.companyId, {
        'integrationTokens.microsoftCalendar': {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(tokens.expiresAt),
          connectedAt: new Date(),
          scope: tokens.scope,
        },
      });
    }

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/app/admin?tab=integrations&success=microsoft_calendar`);
  } catch (err) { next(err); }
});

/**
 * GET /api/calendar/status
 * Retourne le statut des connexions calendrier de la company.
 */
router.get('/status', protect, async (req, res, next) => {
  try {
    const Company = (await import('../models/Company.model.js')).default;
    const company = await Company.findById(req.user.companyId).select('integrationTokens').lean();
    const tokens = company?.integrationTokens || {};

    res.json({
      success: true,
      data: {
        google: {
          connected: !!(tokens.googleCalendar?.accessToken),
          connectedAt: tokens.googleCalendar?.connectedAt || null,
          expired: tokens.googleCalendar?.expiresAt
            ? new Date(tokens.googleCalendar.expiresAt) < new Date()
            : false,
        },
        microsoft: {
          connected: !!(tokens.microsoftCalendar?.accessToken),
          connectedAt: tokens.microsoftCalendar?.connectedAt || null,
          expired: tokens.microsoftCalendar?.expiresAt
            ? new Date(tokens.microsoftCalendar.expiresAt) < new Date()
            : false,
        },
      },
    });
  } catch (err) { next(err); }
});

/**
 * DELETE /api/calendar/:provider
 * Déconnecte un calendrier (révoque les tokens stockés).
 */
router.delete('/:provider', protect, async (req, res, next) => {
  try {
    const { provider } = req.params;
    if (!['google', 'microsoft'].includes(provider)) {
      return next(new AppError('Provider invalide', 400));
    }

    const key = provider === 'google' ? 'googleCalendar' : 'microsoftCalendar';
    const Company = (await import('../models/Company.model.js')).default;
    await Company.findByIdAndUpdate(req.user.companyId, {
      $unset: { [`integrationTokens.${key}`]: '' },
    });

    res.json({ success: true, message: `Connexion ${provider} révoquée` });
  } catch (err) { next(err); }
});

export default router;
