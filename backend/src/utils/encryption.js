/**
 * 🔐 Chiffrement AES-256-GCM pour données sensibles au repos (T-377)
 *
 * Utilisé pour les credentials jobboards (JobboardIntegration.model.js), qui
 * étaient stockées en clair dans MongoDB (clientSecret, accessToken, apiKey,
 * username/password) — quiconque ayant un accès lecture à la base (backup,
 * dump, accès admin MongoDB) pouvait les lire directement.
 *
 * Clé dérivée de ENCRYPTION_KEY (recommandé en production, 32 octets en hex/
 * base64) — repli sur une dérivation scrypt de JWT_SECRET si absente, pour ne
 * jamais bloquer un environnement existant qui n'aurait pas encore cette
 * variable définie.
 */
import crypto from 'crypto';

function getKey() {
  const raw = process.env.ENCRYPTION_KEY;
  if (raw) {
    // Accepte hex (64 chars) ou base64, sinon dérive via scrypt.
    if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, 'hex');
    if (/^[A-Za-z0-9+/=]{43,44}$/.test(raw)) return Buffer.from(raw, 'base64');
    return crypto.scryptSync(raw, 'ats-ultimate-jobboard-credentials', 32);
  }
  // Repli : dérive une clé stable depuis JWT_SECRET (déjà requis au démarrage
  // du serveur, voir server.js) pour ne jamais casser un déploiement existant.
  return crypto.scryptSync(process.env.JWT_SECRET || 'insecure-fallback', 'ats-ultimate-jobboard-credentials', 32);
}

const ALGO = 'aes-256-gcm';

export function encryptJSON(obj) {
  const plaintext = JSON.stringify(obj ?? {});
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':');
}

export function decryptJSON(encoded) {
  if (!encoded || typeof encoded !== 'string') return {};
  try {
    const [ivB64, tagB64, dataB64] = encoded.split(':');
    if (!ivB64 || !tagB64 || !dataB64) return {};
    const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
  } catch {
    // Déchiffrement impossible (mauvaise clé, donnée corrompue ou — cas de
    // migration — ancienne valeur en clair non chiffrée) : ne jamais faire
    // planter l'appelant, retourner un objet vide plutôt qu'une exception.
    return {};
  }
}
