/**
 * 📤 Upload Middleware
 *
 * Storage adaptatif :
 *  - S3/R2 si S3_BUCKET + AWS_ACCESS_KEY_ID sont définis dans .env
 *  - Disque local sinon (comportement d'origine)
 *
 * Compatible Cloudflare R2 via S3_ENDPOINT.
 */

import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { fileTypeFromBuffer } from 'file-type';
import { AppError } from './error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== DÉTECTION DU MODE STORAGE =====

export const isS3Enabled = () =>
  !!(process.env.S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

// ===== CLIENT S3 (lazy-init) =====

let _s3Client = null;
const getS3Client = () => {
  if (!_s3Client) {
    _s3Client = new S3Client({
      region: process.env.S3_REGION || 'auto',
      ...(process.env.S3_ENDPOINT && { endpoint: process.env.S3_ENDPOINT }),
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      // Requis pour R2 et MinIO (path-style addressing)
      forcePathStyle: !!process.env.S3_ENDPOINT,
    });
  }
  return _s3Client;
};

// ===== HELPERS S3 =====

/**
 * Retourne une URL signée en lecture (expire dans 1 heure par défaut).
 * @param {string} key — Clé S3 de l'objet (ex: "cvs/cv-foo-123.pdf")
 * @param {number} expiresIn — Secondes (défaut 3600)
 */
export const getSignedDownloadUrl = async (key, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn });
};

/**
 * Supprime un objet S3.
 * @param {string} key — Clé S3 de l'objet
 */
export const deleteS3Object = async (key) => {
  await getS3Client().send(
    new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key })
  );
};

/**
 * T-344 : télécharge les premiers octets d'un objet S3 (suffisants pour la
 * détection de signature binaire via file-type, qui n'a besoin que de
 * quelques centaines/milliers d'octets selon le format).
 * @param {string} key — Clé S3 de l'objet
 * @param {number} byteCount — Nombre d'octets à récupérer
 */
export const getS3ObjectRangeBuffer = async (key, byteCount = 4100) => {
  const response = await getS3Client().send(
    new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Range: `bytes=0-${byteCount - 1}` })
  );
  const bytes = await response.Body.transformToByteArray();
  return Buffer.from(bytes);
};

// ===== HELPERS LOCAL =====

const uploadDirs = {
  cvs: path.join(__dirname, '../../uploads/cvs'),
  documents: path.join(__dirname, '../../uploads/documents'),
  avatars: path.join(__dirname, '../../uploads/avatars'),
};

if (!isS3Enabled()) {
  Object.values(uploadDirs).forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// ===== FACTORY STORAGE =====

const makeSuffix = () => `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

const sanitizeName = (original, ext) =>
  original.replace(ext, '').replace(/[^a-z0-9]/gi, '_').toLowerCase();

const buildDiskStorage = (folder, prefix) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDirs[folder]),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${prefix}-${sanitizeName(file.originalname, ext)}-${makeSuffix()}${ext}`);
    },
  });

const buildS3Storage = (folder, prefix) =>
  multerS3({
    s3: getS3Client(),
    bucket: process.env.S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${folder}/${prefix}-${sanitizeName(file.originalname, ext)}-${makeSuffix()}${ext}`);
    },
  });

// ===== FILE FILTERS =====

const documentMimes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

const imageMimes = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
]);

const documentFileFilter = (req, file, cb) => {
  documentMimes.has(file.mimetype)
    ? cb(null, true)
    : cb(new AppError('Type non autorisé. Formats acceptés : PDF, DOC, DOCX, TXT', 400), false);
};

const imageFileFilter = (req, file, cb) => {
  imageMimes.has(file.mimetype)
    ? cb(null, true)
    : cb(new AppError('Type non autorisé. Formats acceptés : JPG, PNG, GIF, WEBP', 400), false);
};

// ===== MAGIC BYTES VALIDATION (post-upload) =====

const DOCUMENT_MAGIC = new Set([
  'application/pdf',
  'application/msword',
  'application/x-cfb',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const IMAGE_MAGIC = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
]);

const checkMagic = (whitelist) => async (req, res, next) => {
  if (!req.file) return next();

  const ext = path.extname(req.file.originalname).toLowerCase();
  if (ext === '.txt') return next();

  // T-344 : cette validation était entièrement court-circuitée en mode S3
  // (req.file.buffer n'existe pas avec multer-s3, le fichier étant déjà
  // uploadé au moment où ce middleware s'exécute) — seul le Content-Type
  // déclaré par le client (trivialement falsifiable) restait vérifié. On
  // télécharge désormais un échantillon de l'objet S3 pour valider son
  // contenu réel, exactement comme en local.
  if (isS3Enabled()) {
    try {
      const sample = await getS3ObjectRangeBuffer(req.file.key);
      const detected = await fileTypeFromBuffer(sample);
      if (!detected || !whitelist.has(detected.mime)) {
        await deleteS3Object(req.file.key).catch(() => {});
        return next(new AppError('Type de fichier invalide (magic bytes)', 400));
      }
      return next();
    } catch {
      await deleteS3Object(req.file.key).catch(() => {});
      return next(new AppError('Impossible de vérifier le type de fichier', 500));
    }
  }

  try {
    const buf = fs.readFileSync(req.file.path);
    const detected = await fileTypeFromBuffer(buf);
    if (!detected || !whitelist.has(detected.mime)) {
      fs.unlinkSync(req.file.path);
      return next(new AppError('Type de fichier invalide (magic bytes)', 400));
    }
    next();
  } catch {
    if (req.file?.path) try { fs.unlinkSync(req.file.path); } catch {}
    next(new AppError('Impossible de vérifier le type de fichier', 500));
  }
};

export const validateDocumentMagicBytes = checkMagic(DOCUMENT_MAGIC);
export const validateImageMagicBytes = checkMagic(IMAGE_MAGIC);

// ===== EXPORTS MULTER CONFIGURÉS =====

export const uploadCV = multer({
  storage: isS3Enabled() ? buildS3Storage('cvs', 'cv') : buildDiskStorage('cvs', 'cv'),
  fileFilter: documentFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadDocument = multer({
  storage: isS3Enabled() ? buildS3Storage('documents', 'doc') : buildDiskStorage('documents', 'doc'),
  fileFilter: documentFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadAvatar = multer({
  storage: isS3Enabled() ? buildS3Storage('avatars', 'avatar') : buildDiskStorage('avatars', 'avatar'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

export const upload = multer({
  storage: isS3Enabled() ? buildS3Storage('documents', 'doc') : buildDiskStorage('documents', 'doc'),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default {
  uploadCV,
  uploadDocument,
  uploadAvatar,
  upload,
  deleteFile,
  deleteS3Object,
  getS3ObjectRangeBuffer,
  getSignedDownloadUrl,
  isS3Enabled,
  validateDocumentMagicBytes,
  validateImageMagicBytes,
};
