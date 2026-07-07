/**
 * 🌐 Public Controller — Portail candidats
 *
 * Endpoints publics (sans authentification) :
 *  GET  /api/public/companies/:slug  — page entreprise + missions actives
 *  GET  /api/public/missions/:id     — détail d'une mission
 *  POST /api/public/missions/:id/apply — soumettre une candidature (avec CV)
 *  GET  /api/public/sitemap/:slug    — liste d'URLs pour le sitemap SEO
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Company from '../models/Company.model.js';
import Mission from '../models/Mission.model.js';
import Candidate from '../models/Candidate.model.js';
import Application from '../models/Application.model.js';
import { AppError } from '../middleware/error.middleware.js';
import { sendApplicationConfirmation } from '../services/email.service.js';
import { isS3Enabled } from '../middleware/upload.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Helpers ───────────────────────────────────────────────────────────────────

const MISSION_PUBLIC_FIELDS =
  'title description requirements benefits skills experience contract location remote salary department companyName companyId applicationCount createdAt';

const COMPANY_PUBLIC_FIELDS =
  'name slug industry size website description address careerPageEnabled careerPageBio';

const findCompanyBySlug = async (slug) => {
  // Essai par slug d'abord, puis par ObjectId si c'est un ID valide
  let company = await Company.findOne({ slug }).select(COMPANY_PUBLIC_FIELDS);
  if (!company && mongoose.Types.ObjectId.isValid(slug)) {
    company = await Company.findById(slug).select(COMPANY_PUBLIC_FIELDS);
  }
  return company;
};

// Sauvegarde d'un buffer de fichier en local ou S3
const saveCVBuffer = async (buffer, originalName, companyId) => {
  const ext = path.extname(originalName).toLowerCase() || '.pdf';
  const safeName = `cv-public-${companyId}-${crypto.randomBytes(8).toString('hex')}${ext}`;

  if (isS3Enabled()) {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const s3 = new S3Client({
      // T-398 : ce chemin utilisait AWS_REGION alors que upload.js/migrate-to-s3.js
      // (et .env.example) documentent tous S3_REGION — avec les deux chemins
      // actifs (S3 activé), l'upload public utilisait toujours 'eu-west-3' par
      // défaut peu importe la vraie config S3_REGION renseignée.
      region: process.env.S3_REGION || 'eu-west-3',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    const key = `cvs/${safeName}`;
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf',
    }));
    return key;
  }

  // Stockage local
  const uploadsDir = path.join(__dirname, '../../uploads/cvs');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, safeName);
  fs.writeFileSync(filePath, buffer);
  return `/uploads/cvs/${safeName}`;
};

// ── GET /api/public/companies/:slug ───────────────────────────────────────────

export const getCompanyPage = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const company = await findCompanyBySlug(slug);
    if (!company || !company.careerPageEnabled) {
      throw new AppError('Page carrières introuvable', 404);
    }

    const missions = await Mission.find({
      companyId: company._id,
      status: 'active',
    })
      .select(MISSION_PUBLIC_FIELDS)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: { company, missions },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/public/missions/:id ──────────────────────────────────────────────

export const getMissionDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Mission introuvable', 404);

    const mission = await Mission.findOne({ _id: id, status: 'active' })
      .select(MISSION_PUBLIC_FIELDS);
    if (!mission) throw new AppError('Mission introuvable ou fermée', 404);

    const company = await Company.findById(mission.companyId)
      .select(COMPANY_PUBLIC_FIELDS);

    res.json({ success: true, data: { mission, company } });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/public/missions/:id/apply ───────────────────────────────────────

export const applyToMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Mission introuvable', 404);

    const mission = await Mission.findOne({ _id: id, status: 'active' });
    if (!mission) throw new AppError('Cette mission n\'est plus disponible', 404);

    const company = await Company.findById(mission.companyId).select('name website careerPageEnabled');
    if (!company || !company.careerPageEnabled) throw new AppError('Page carrières désactivée', 403);

    const { firstName, lastName, email, phone, coverLetter } = req.body;

    if (!firstName?.trim()) throw new AppError('Le prénom est requis', 400);
    if (!lastName?.trim()) throw new AppError('Le nom est requis', 400);
    if (!email?.trim() || !/^\S+@\S+\.\S+$/.test(email)) throw new AppError('Email invalide', 400);

    // Trouver ou créer le Candidate (scopé par company)
    let candidate = await Candidate.findOne({
      email: email.toLowerCase().trim(),
      companyId: mission.companyId,
    });

    if (!candidate) {
      candidate = await Candidate.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || '',
        position: mission.title,
        companyId: mission.companyId,
        status: 'new',
        source: 'Portail public',
      });
    }

    // Vérifier si déjà candidaté
    const existing = await Application.findOne({
      candidateId: candidate._id,
      missionId: mission._id,
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Vous avez déjà postulé à cette offre.',
      });
    }

    // Upload CV si fourni
    let cvUrl = null;
    let cvFilename = null;
    if (req.file?.buffer) {
      try {
        cvUrl = await saveCVBuffer(req.file.buffer, req.file.originalname, mission.companyId.toString());
        cvFilename = req.file.originalname;
        await Candidate.findByIdAndUpdate(candidate._id, {
          cvUrl,
          cvFilename,
          cvUploadedAt: new Date(),
        });
      } catch (uploadErr) {
        logger.error('public apply: CV upload failed', uploadErr.message);
        // Fallback gracieux — on continue sans CV
      }
    }

    // Créer la candidature
    const application = await Application.create({
      missionId: mission._id,
      candidateId: candidate._id,
      missionTitle: mission.title,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      candidateEmail: candidate.email,
      companyId: mission.companyId,
      status: 'applied',
      coverLetter: coverLetter?.trim() || '',
      source: 'Site web',
      appliedAt: new Date(),
    });

    // Incrémenter le compteur de candidatures sur la mission
    await Mission.findByIdAndUpdate(mission._id, { $inc: { applicationCount: 1 } });

    // Email de confirmation (non-bloquant)
    sendApplicationConfirmation(candidate.email, {
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      missionTitle: mission.title,
      companyName: company.name,
      companyWebsite: company.website || '',
    }).catch(err => logger.warn('public apply: confirmation email failed', err.message));

    res.status(201).json({
      success: true,
      message: 'Votre candidature a bien été enregistrée. Vous allez recevoir un email de confirmation.',
      data: { applicationId: application._id },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/public/sitemap/:slug ─────────────────────────────────────────────

export const getSitemap = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const company = await findCompanyBySlug(slug);
    if (!company || !company.careerPageEnabled) throw new AppError('Page introuvable', 404);

    const missions = await Mission.find({ companyId: company._id, status: 'active' })
      .select('_id title updatedAt')
      .sort({ updatedAt: -1 });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const baseUrl = `${frontendUrl}/careers/${company.slug || company._id}`;

    const urls = [
      { loc: baseUrl, lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: '0.8' },
      ...missions.map(m => ({
        loc: `${baseUrl}/jobs/${m._id}`,
        lastmod: m.updatedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.6',
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml').send(xml);
  } catch (error) {
    next(error);
  }
};

export default { getCompanyPage, getMissionDetail, applyToMission, getSitemap };
