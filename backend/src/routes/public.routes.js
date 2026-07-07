/**
 * 🌐 Public Routes — Portail candidats (sans authentification)
 * /api/public/*
 */

import express from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import {
  getCompanyPage,
  getMissionDetail,
  applyToMission,
  getSitemap,
} from '../controllers/public.controller.js';

const router = express.Router();

// Rate limiter strict pour les candidatures (évite le spam)
const applyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5,
  message: { success: false, message: 'Trop de candidatures soumises. Réessayez dans une heure.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter général pour les pages publiques
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload CV en mémoire (max 5 Mo, PDF uniquement)
const cvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    cb(null, false); // Rejeter silencieusement les non-PDF (fallback gracieux)
  },
});

router.use(publicLimiter);

// Pages entreprise + missions
router.get('/companies/:slug', getCompanyPage);

// Détail d'une mission
router.get('/missions/:id', getMissionDetail);

// Soumettre une candidature (CV optionnel)
router.post('/missions/:id/apply', applyLimiter, cvUpload.single('cv'), applyToMission);

// Sitemap XML
router.get('/sitemap/:slug', getSitemap);

export default router;
