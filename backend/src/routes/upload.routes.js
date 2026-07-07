/**
 * 📤 Upload Routes
 *
 * Routes pour l'upload de fichiers — compatibles stockage local et S3/R2.
 *
 * En mode S3 :
 *  - L'upload retourne req.file.location (URL S3 publique ou clé)
 *  - Le téléchargement redirige vers une URL signée (1 heure)
 * En mode local :
 *  - Comportement inchangé (sendFile, paths locaux)
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import {
  uploadCV,
  uploadDocument,
  uploadAvatar,
  deleteFile,
  deleteS3Object,
  getSignedDownloadUrl,
  isS3Enabled,
  validateDocumentMagicBytes,
  validateImageMagicBytes,
} from '../middleware/upload.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import Candidate from '../models/Candidate.model.js';
import { AppError } from '../middleware/error.middleware.js';
import { parseCV } from '../services/cv-parser.service.js';

// Upload en mémoire pour le parsing (pas de stockage sur disque/S3)
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    cb(new AppError('Seuls les fichiers PDF sont acceptés pour le parsing', 400));
  },
});

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(uploadLimiter);

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Retourne la clé S3 ou le chemin local selon le mode de stockage.
 * En local, cvUrl ressemble à "/uploads/cvs/filename".
 * En S3, cvUrl est directement la clé S3 (ex: "cvs/cv-foo-123.pdf").
 */
const deleteStoredFile = async (cvUrl) => {
  if (!cvUrl) return;
  if (isS3Enabled()) {
    await deleteS3Object(cvUrl).catch(() => {});
  } else {
    const localPath = path.join(__dirname, '../../uploads', cvUrl.replace('/uploads/', ''));
    deleteFile(localPath);
  }
};

/**
 * Extrait la clé S3 ou l'URL locale depuis req.file après upload.
 * En local : "/uploads/<folder>/<filename>"
 * En S3    : la clé est dans req.file.key (multer-s3)
 */
const getFileRef = (req, folder) => {
  if (isS3Enabled()) return req.file.key; // ex: "cvs/cv-name-123.pdf"
  return `/uploads/${folder}/${req.file.filename}`;
};

// ── POST /api/upload/cv/parse — Parsing IA d'un CV PDF (sans stockage) ───────
// IMPORTANT : cette route doit être avant POST /cv/:candidateId pour éviter
// que "parse" soit capturé comme un candidateId.

router.post('/cv/parse', protect, memoryUpload.single('cv'), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('Aucun fichier fourni', 400);
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new AppError('Le parsing IA n\'est pas configuré (ANTHROPIC_API_KEY manquante)', 503);
    }

    const extracted = await parseCV(req.file.buffer);
    res.json({ success: true, data: extracted });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/upload/cv/:candidateId ──────────────────────────────────────────

router.post('/cv/:candidateId', protect, uploadCV.single('cv'), validateDocumentMagicBytes, async (req, res, next) => {
  try {
    const { candidateId } = req.params;
    const { companyId } = req.user;

    if (!req.file) throw new AppError('Aucun fichier fourni', 400);

    const candidate = await Candidate.findOne({ _id: candidateId, companyId });
    if (!candidate) {
      await deleteStoredFile(isS3Enabled() ? req.file.key : req.file.path);
      throw new AppError('Candidat non trouvé', 404);
    }

    // Supprimer l'ancien CV
    await deleteStoredFile(candidate.cvUrl);

    const fileRef = getFileRef(req, 'cvs');
    candidate.cvUrl = fileRef;
    candidate.cvFilename = req.file.originalname;
    candidate.cvUploadedAt = new Date();
    await candidate.save();

    res.json({
      success: true,
      message: 'CV uploadé avec succès',
      data: {
        filename: req.file.filename || req.file.key,
        originalName: req.file.originalname,
        size: req.file.size,
        url: isS3Enabled() ? req.file.location : fileRef,
        uploadedAt: candidate.cvUploadedAt,
      },
    });
  } catch (error) {
    if (req.file && !isS3Enabled()) deleteFile(req.file.path);
    next(error);
  }
});

// ── GET /api/upload/cv/:filename ──────────────────────────────────────────────

// T-364 : `protect` vérifie seulement qu'un utilisateur est authentifié, PEU
// IMPORTE sa company — sans le check ci-dessous, un utilisateur de la Company A
// pouvait télécharger le CV d'un candidat de la Company B en devinant/obtenant
// son nom de fichier (visible dans certains payloads API `cvUrl`). On vérifie
// désormais qu'un candidat de LA COMPANY DE L'APPELANT référence bien ce fichier
// comme son CV avant de le servir/signer.
router.get('/cv/:filename', protect, async (req, res, next) => {
  try {
    const { filename } = req.params;
    const { companyId } = req.user;

    const key = isS3Enabled()
      ? (filename.startsWith('cvs/') ? filename : `cvs/${filename}`)
      : `/uploads/cvs/${filename}`;

    const candidate = await Candidate.findOne({ cvUrl: key, companyId });
    if (!candidate) throw new AppError('Fichier non trouvé', 404);

    if (isS3Enabled()) {
      const signedUrl = await getSignedDownloadUrl(key, 3600);
      return res.redirect(302, signedUrl);
    }

    // Local
    const filepath = path.join(__dirname, '../../uploads/cvs', filename);
    if (!fs.existsSync(filepath)) throw new AppError('Fichier non trouvé', 404);
    res.sendFile(filepath);
  } catch (error) {
    next(error);
  }
});

// ── GET /api/upload/signed-url — Générer une URL signée pour un fichier de SA company ──

router.get('/signed-url', protect, async (req, res, next) => {
  try {
    if (!isS3Enabled()) throw new AppError('Le stockage S3 n\'est pas activé', 400);

    const { key, expiresIn = 3600 } = req.query;
    if (!key) throw new AppError('Paramètre key requis', 400);

    // T-364 : sans ce check, n'importe quel utilisateur authentifié pouvait
    // signer N'IMPORTE QUELLE clé du bucket (CV/documents d'une autre company)
    // — cette route n'a aucun usage frontend actuel, mais reste exposée si ce
    // backend est un jour redéployé. On ne signe que si un candidat de la
    // company de l'appelant référence effectivement cette clé (CV ou document).
    const { companyId } = req.user;
    const candidate = await Candidate.findOne({
      companyId,
      $or: [{ cvUrl: key }, { 'documents.url': key }],
    });
    if (!candidate) throw new AppError('Fichier non trouvé ou non autorisé', 404);

    const signedUrl = await getSignedDownloadUrl(key, parseInt(expiresIn));
    res.json({ success: true, data: { signedUrl, expiresIn: parseInt(expiresIn) } });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /api/upload/cv/:candidateId ────────────────────────────────────────

router.delete('/cv/:candidateId', protect, async (req, res, next) => {
  try {
    const { candidateId } = req.params;
    const { companyId } = req.user;

    const candidate = await Candidate.findOne({ _id: candidateId, companyId });
    if (!candidate) throw new AppError('Candidat non trouvé', 404);
    if (!candidate.cvUrl) throw new AppError('Aucun CV à supprimer', 400);

    await deleteStoredFile(candidate.cvUrl);

    candidate.cvUrl = null;
    candidate.cvFilename = null;
    candidate.cvUploadedAt = null;
    await candidate.save();

    res.json({ success: true, message: 'CV supprimé avec succès' });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/upload/document/:candidateId ────────────────────────────────────

router.post('/document/:candidateId', protect, uploadDocument.single('document'), validateDocumentMagicBytes, async (req, res, next) => {
  try {
    const { candidateId } = req.params;
    const { companyId } = req.user;

    if (!req.file) throw new AppError('Aucun fichier fourni', 400);

    const candidate = await Candidate.findOne({ _id: candidateId, companyId });
    if (!candidate) {
      if (!isS3Enabled()) deleteFile(req.file.path);
      throw new AppError('Candidat non trouvé', 404);
    }

    const fileRef = getFileRef(req, 'documents');
    if (!candidate.documents) candidate.documents = [];
    candidate.documents.push({
      filename: req.file.filename || req.file.key,
      originalName: req.file.originalname,
      url: fileRef,
      size: req.file.size,
      uploadedAt: new Date(),
    });
    await candidate.save();

    res.json({
      success: true,
      message: 'Document uploadé avec succès',
      data: {
        filename: req.file.filename || req.file.key,
        originalName: req.file.originalname,
        size: req.file.size,
        url: isS3Enabled() ? req.file.location : fileRef,
      },
    });
  } catch (error) {
    if (req.file && !isS3Enabled()) deleteFile(req.file.path);
    next(error);
  }
});

// ── POST /api/upload/avatar ───────────────────────────────────────────────────

router.post('/avatar', protect, uploadAvatar.single('avatar'), validateImageMagicBytes, async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('Aucun fichier fourni', 400);

    const fileRef = getFileRef(req, 'avatars');

    res.json({
      success: true,
      message: 'Avatar uploadé avec succès',
      data: {
        filename: req.file.filename || req.file.key,
        url: isS3Enabled() ? req.file.location : fileRef,
      },
    });
  } catch (error) {
    if (req.file && !isS3Enabled()) deleteFile(req.file.path);
    next(error);
  }
});

export default router;
