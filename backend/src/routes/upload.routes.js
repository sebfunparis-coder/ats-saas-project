/**
 * 📤 Upload Routes
 *
 * Routes pour l'upload de fichiers
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadCV, uploadDocument, uploadAvatar, deleteFile } from '../middleware/upload.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import Candidate from '../models/Candidate.model.js';
import { AppError } from '../middleware/error.middleware.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Apply rate limiting to all upload routes
router.use(uploadLimiter);

/**
 * @route   POST /api/upload/cv/:candidateId
 * @desc    Upload CV for a candidate
 * @access  Private
 */
router.post('/cv/:candidateId', protect, uploadCV.single('cv'), async (req, res, next) => {
  try {
    const { candidateId } = req.params;
    const { companyId } = req.user;

    if (!req.file) {
      throw new AppError('Aucun fichier fourni', 400);
    }

    // Find candidate
    const candidate = await Candidate.findOne({ _id: candidateId, companyId });

    if (!candidate) {
      // Delete uploaded file if candidate not found
      deleteFile(req.file.path);
      throw new AppError('Candidat non trouvé', 404);
    }

    // Delete old CV if exists
    if (candidate.cvUrl) {
      const oldCvPath = path.join(__dirname, '../../uploads', candidate.cvUrl.replace('/uploads/', ''));
      deleteFile(oldCvPath);
    }

    // Update candidate with new CV
    candidate.cvUrl = `/uploads/cvs/${req.file.filename}`;
    candidate.cvFilename = req.file.originalname;
    candidate.cvUploadedAt = new Date();
    await candidate.save();

    res.json({
      success: true,
      message: 'CV uploadé avec succès',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: candidate.cvUrl,
        uploadedAt: candidate.cvUploadedAt
      }
    });
  } catch (error) {
    // Delete uploaded file on error
    if (req.file) {
      deleteFile(req.file.path);
    }
    next(error);
  }
});

/**
 * @route   GET /api/upload/cv/:filename
 * @desc    Download/view CV file
 * @access  Private
 */
router.get('/cv/:filename', protect, (req, res, next) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(__dirname, '../../uploads/cvs', filename);

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filepath)) {
      throw new AppError('Fichier non trouvé', 404);
    }

    res.sendFile(filepath);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/upload/cv/:candidateId
 * @desc    Delete CV for a candidate
 * @access  Private
 */
router.delete('/cv/:candidateId', protect, async (req, res, next) => {
  try {
    const { candidateId } = req.params;
    const { companyId } = req.user;

    const candidate = await Candidate.findOne({ _id: candidateId, companyId });

    if (!candidate) {
      throw new AppError('Candidat non trouvé', 404);
    }

    if (!candidate.cvUrl) {
      throw new AppError('Aucun CV à supprimer', 400);
    }

    // Delete file
    const cvPath = path.join(__dirname, '../../uploads', candidate.cvUrl.replace('/uploads/', ''));
    deleteFile(cvPath);

    // Update candidate
    candidate.cvUrl = null;
    candidate.cvFilename = null;
    candidate.cvUploadedAt = null;
    await candidate.save();

    res.json({
      success: true,
      message: 'CV supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/upload/document/:candidateId
 * @desc    Upload additional document for a candidate
 * @access  Private
 */
router.post('/document/:candidateId', protect, uploadDocument.single('document'), async (req, res, next) => {
  try {
    const { candidateId } = req.params;
    const { companyId } = req.user;

    if (!req.file) {
      throw new AppError('Aucun fichier fourni', 400);
    }

    const candidate = await Candidate.findOne({ _id: candidateId, companyId });

    if (!candidate) {
      deleteFile(req.file.path);
      throw new AppError('Candidat non trouvé', 404);
    }

    // Add document to candidate's documents array
    if (!candidate.documents) {
      candidate.documents = [];
    }

    candidate.documents.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/documents/${req.file.filename}`,
      size: req.file.size,
      uploadedAt: new Date()
    });

    await candidate.save();

    res.json({
      success: true,
      message: 'Document uploadé avec succès',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: `/uploads/documents/${req.file.filename}`
      }
    });
  } catch (error) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    next(error);
  }
});

/**
 * @route   POST /api/upload/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post('/avatar', protect, uploadAvatar.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('Aucun fichier fourni', 400);
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Update user avatar in database (to be implemented)
    // await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl });

    res.json({
      success: true,
      message: 'Avatar uploadé avec succès',
      data: {
        filename: req.file.filename,
        url: avatarUrl
      }
    });
  } catch (error) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    next(error);
  }
});

export default router;
