/**
 * 🚚 Script de migration — stockage local → S3/R2
 *
 * Usage : node src/scripts/migrate-to-s3.js
 *
 * Pré-requis :
 *  - Les variables S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY doivent être définies dans .env
 *  - MongoDB doit être accessible (pour mettre à jour les cvUrl des candidats)
 *
 * Comportement :
 *  1. Parcourt tous les fichiers dans uploads/cvs/, uploads/documents/, uploads/avatars/
 *  2. Les envoie vers S3 dans les dossiers cvs/, documents/, avatars/
 *  3. Met à jour les champs cvUrl des candidats en base de données
 *  4. Supprime les fichiers locaux après migration réussie (opt-in via --delete-local)
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DELETE_LOCAL = process.argv.includes('--delete-local');

// ── Vérifications ─────────────────────────────────────────────────────────────

const required = ['S3_BUCKET', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`❌ Variables manquantes : ${missing.join(', ')}`);
  process.exit(1);
}

// ── Client S3 ─────────────────────────────────────────────────────────────────

const s3 = new S3Client({
  region: process.env.S3_REGION || 'auto',
  ...(process.env.S3_ENDPOINT && { endpoint: process.env.S3_ENDPOINT }),
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: !!process.env.S3_ENDPOINT,
});

const uploadToS3 = async (localPath, s3Key, contentType) => {
  const body = fs.readFileSync(localPath);
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: s3Key,
    Body: body,
    ContentType: contentType,
  }));
};

const guessMime = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return map[ext] || 'application/octet-stream';
};

// ── Migration fichiers ────────────────────────────────────────────────────────

const migrateFolder = async (localFolder, s3Prefix) => {
  const dir = path.join(__dirname, '../../uploads', localFolder);
  if (!fs.existsSync(dir)) {
    console.log(`  ⚠️  Dossier introuvable : ${dir}`);
    return { migrated: 0, errors: 0 };
  }

  const files = fs.readdirSync(dir).filter(f => !f.startsWith('.'));
  let migrated = 0;
  let errors = 0;

  for (const filename of files) {
    const localPath = path.join(dir, filename);
    const s3Key = `${s3Prefix}/${filename}`;

    try {
      await uploadToS3(localPath, s3Key, guessMime(filename));
      console.log(`  ✅ ${filename} → s3://${process.env.S3_BUCKET}/${s3Key}`);
      migrated++;

      if (DELETE_LOCAL) {
        fs.unlinkSync(localPath);
        console.log(`     🗑️  Local supprimé`);
      }
    } catch (err) {
      console.error(`  ❌ ${filename} : ${err.message}`);
      errors++;
    }
  }

  return { migrated, errors };
};

// ── Mise à jour des cvUrl en base ─────────────────────────────────────────────

const updateCandidates = async () => {
  if (!process.env.MONGODB_URI) {
    console.log('  ⚠️  MONGODB_URI absent — mise à jour des cvUrl ignorée');
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const Candidate = (await import('../models/Candidate.model.js')).default;

  // Candidats avec cvUrl au format local "/uploads/cvs/filename"
  const candidates = await Candidate.find({ cvUrl: /^\/uploads\// });
  let updated = 0;

  for (const candidate of candidates) {
    const filename = candidate.cvUrl.split('/').pop();
    candidate.cvUrl = `cvs/${filename}`;
    await candidate.save({ validateBeforeSave: false });
    updated++;
  }

  console.log(`\n  🗂️  ${updated} candidat(s) mis à jour en base (cvUrl → clé S3)`);
  await mongoose.disconnect();
};

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  console.log('🚚 Migration fichiers locaux → S3/R2');
  console.log(`   Bucket  : ${process.env.S3_BUCKET}`);
  console.log(`   Région  : ${process.env.S3_REGION || 'auto'}`);
  if (process.env.S3_ENDPOINT) console.log(`   Endpoint: ${process.env.S3_ENDPOINT}`);
  console.log(`   Suppression locale : ${DELETE_LOCAL ? 'OUI (--delete-local)' : 'NON'}`);
  console.log('');

  const results = {};

  console.log('📁 cvs/');
  results.cvs = await migrateFolder('cvs', 'cvs');

  console.log('\n📁 documents/');
  results.documents = await migrateFolder('documents', 'documents');

  console.log('\n📁 avatars/');
  results.avatars = await migrateFolder('avatars', 'avatars');

  console.log('\n📊 Mise à jour des références en base...');
  await updateCandidates();

  const total = Object.values(results).reduce((a, r) => ({ migrated: a.migrated + r.migrated, errors: a.errors + r.errors }), { migrated: 0, errors: 0 });
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Migrés  : ${total.migrated}`);
  if (total.errors > 0) console.log(`❌ Erreurs : ${total.errors}`);
  console.log('Migration terminée.');
})();
