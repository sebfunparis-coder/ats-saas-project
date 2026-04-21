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

export default router;
