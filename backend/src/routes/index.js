/**
 * 🚦 Routes Index
 *
 * Centralise toutes les routes de l'API
 */

import express from 'express';
import authRoutes from './auth.routes.js';
import missionRoutes from './mission.routes.js';
import candidateRoutes from './candidate.routes.js';
import applicationRoutes from './application.routes.js';
import clientRoutes from './client.routes.js';
import teamRoutes from './team.routes.js';
import eventRoutes from './event.routes.js';
import userRoutes from './user.routes.js';
import uploadRoutes from './upload.routes.js';
import superadminRoutes from './superadmin.routes.js';
import adminRoutes from './admin.routes.js';
import sseRoutes from './sse.routes.js';
import apikeyRoutes from './apikey.routes.js';
import analyticsRoutes from './analytics.routes.js';
import publicRoutes from './public.routes.js';
import emailTemplateRoutes from './emailtemplate.routes.js';
import integrationRoutes from './integration.routes.js';
import billingRoutes from './billing.routes.js';
import publicApiRoutes from './publicApi.routes.js';
import { auditLog } from '../middleware/audit.middleware.js';

const router = express.Router();

/**
 * Route de santé de l'API
 * GET /api/health
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API ATS Ultimate - Serveur opérationnel',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ===== AUDIT MIDDLEWARE (global — logs all mutations after auth) =====
router.use(auditLog);

// ===== ROUTES DE L'API =====

/**
 * Auth Routes
 * /api/auth/*
 */
router.use('/auth', authRoutes);

/**
 * Mission Routes
 * /api/missions/*
 */
router.use('/missions', missionRoutes);

/**
 * Candidate Routes
 * /api/candidates/*
 */
router.use('/candidates', candidateRoutes);

/**
 * Application Routes
 * /api/applications/*
 */
router.use('/applications', applicationRoutes);

/**
 * Client Routes
 * /api/clients/*
 */
router.use('/clients', clientRoutes);

/**
 * Team Routes
 * /api/team/*
 */
router.use('/team', teamRoutes);

/**
 * Event Routes
 * /api/events/*
 */
router.use('/events', eventRoutes);

/**
 * User Routes
 * /api/users/*
 */
router.use('/users', userRoutes);

/**
 * Upload Routes
 * /api/upload/*
 */
router.use('/upload', uploadRoutes);

/**
 * SuperAdmin Routes
 * /api/superadmin/*
 */
router.use('/superadmin', superadminRoutes);

/**
 * Admin Routes
 * /api/admin/*
 */
router.use('/admin', adminRoutes);

/**
 * SSE Routes — Server-Sent Events (temps réel)
 * /api/sse/stream
 */
router.use('/sse', sseRoutes);

/**
 * ApiKey Routes — Gestion des clés API
 * /api/apikeys/*
 */
router.use('/apikeys', apikeyRoutes);

/**
 * Analytics Routes — Rapports & métriques
 * /api/analytics
 */
router.use('/analytics', analyticsRoutes);

/**
 * Public Routes — Portail carrières (sans auth)
 * /api/public/*
 */
router.use('/public', publicRoutes);

/**
 * Email Template Routes — Templates d'email personnalisables
 * /api/email-templates
 */
router.use('/email-templates', emailTemplateRoutes);

/**
 * Integration Routes — Jobboards (LinkedIn, Indeed, WTTJ)
 * /api/integrations
 */
router.use('/integrations', integrationRoutes);

/**
 * Billing Routes — Stripe Checkout, Portal, Webhook
 * /api/billing/*
 */
router.use('/billing', billingRoutes);

/**
 * API Publique — T-277 — Accès via clé API (sk_live_*)
 * /api/v1/*
 * Scopes : missions:read, missions:write, candidates:read, candidates:write
 */
router.use('/v1', publicApiRoutes);

/**
 * Calendar OAuth callbacks — T-270/T-271
 * /api/calendar/*
 */
import calendarCallbackRoutes from './calendarCallback.routes.js';
router.use('/calendar', calendarCallbackRoutes);

/**
 * Webhooks sortants — T-276 (test/ping depuis AdminPage)
 * /api/webhooks/*
 */
import webhookRoutes from './webhook.routes.js';
router.use('/webhooks', webhookRoutes);

export default router;
