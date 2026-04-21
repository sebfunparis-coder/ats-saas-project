/**
 * 📤 Upload Middleware
 *
 * Multer configuration pour upload de fichiers
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { AppError } from './error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadDirs = {
  cvs: path.join(__dirname, '../../uploads/cvs'),
  documents: path.join(__dirname, '../../uploads/documents'),
  avatars: path.join(__dirname, '../../uploads/avatars')
};

// Create directories if they don't exist
Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Storage configuration for CVs
 */
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.cvs);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: cv-timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const sanitizedName = file.originalname
      .replace(ext, '')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    cb(null, `cv-${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

/**
 * Storage configuration for documents
 */
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.documents);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const sanitizedName = file.originalname
      .replace(ext, '')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    cb(null, `doc-${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

/**
 * Storage configuration for avatars
 */
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.avatars);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

/**
 * File filter for CVs and documents
 */
const documentFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Type de fichier non autorisé. Formats acceptés : PDF, DOC, DOCX, TXT', 400), false);
  }
};

/**
 * File filter for images (avatars)
 */
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Type de fichier non autorisé. Formats acceptés : JPG, PNG, GIF, WEBP', 400), false);
  }
};

/**
 * CV Upload Configuration
 */
export const uploadCV = multer({
  storage: cvStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

/**
 * Document Upload Configuration
 */
export const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

/**
 * Avatar Upload Configuration
 */
export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB max
  }
});

/**
 * Generic upload configuration
 */
export const upload = multer({
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

/**
 * Delete file helper
 */
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

export default {
  uploadCV,
  uploadDocument,
  uploadAvatar,
  upload,
  deleteFile
};
