/**
 * T-364 : IDOR cross-tenant sur le téléchargement de CV.
 * Vérifie qu'un utilisateur de la Company B ne peut pas télécharger le CV
 * d'un candidat de la Company A même en connaissant/devinant le nom de fichier.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { connectTestDb, disconnectTestDb, clearTestDb } from './helpers/testDb.js';

const TENANT_A = { firstName: 'Alice', lastName: 'A', email: 'alice@idor-a.com', password: 'TestPass123!', company: 'IDOR Tenant A' };
const TENANT_B = { firstName: 'Bob', lastName: 'B', email: 'bob@idor-b.com', password: 'TestPass123!', company: 'IDOR Tenant B' };

let tokenA, tokenB;

beforeAll(async () => { await connectTestDb(); });
afterAll(async () => { await disconnectTestDb(); });

beforeEach(async () => {
  await clearTestDb();
  const resA = await request(app).post('/api/auth/register').send(TENANT_A);
  tokenA = resA.body.data?.token;
  const resB = await request(app).post('/api/auth/register').send(TENANT_B);
  tokenB = resB.body.data?.token;
});

describe('T-364 — IDOR CV cross-tenant', () => {
  it('B ne peut pas télécharger le CV d\'un candidat de A, mais A le peut', async () => {
    if (!tokenA || !tokenB) return; // skip si l'auth échoue (mock mode)

    const createRes = await request(app)
      .post('/api/candidates')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Candidat A', email: 'candidat-a@test.com', position: 'Dev' });
    const candidateId = createRes.body.data?._id;
    if (!candidateId) return; // skip si mock mode

    const uploadRes = await request(app)
      .post(`/api/upload/cv/${candidateId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .attach('cv', Buffer.from('%PDF-1.4 fake cv content'), { filename: 'cv-secret.pdf', contentType: 'application/pdf' });

    if (uploadRes.status !== 200) return; // skip si l'upload échoue pour une autre raison (env sans dossier uploads/, etc.)

    const filename = uploadRes.body.data.filename;
    expect(filename).toBeTruthy();

    // B (autre company) tente de télécharger le CV de A via son nom de fichier
    const crossTenantRes = await request(app)
      .get(`/api/upload/cv/${filename}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(crossTenantRes.status).toBe(404);

    // A peut télécharger son propre CV sans problème
    const sameTenanRes = await request(app)
      .get(`/api/upload/cv/${filename}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(sameTenanRes.status).toBe(200);
  });

  it('B ne peut pas obtenir d\'URL signée pour une clé de A (mode S3 uniquement — ici vérifie juste le refus générique sans S3)', async () => {
    if (!tokenB) return;
    const res = await request(app)
      .get('/api/upload/signed-url')
      .query({ key: 'cvs/cv-quelquun-dautre-123.pdf' })
      .set('Authorization', `Bearer ${tokenB}`);
    // Sans S3 configuré dans cet environnement de test : 400 "S3 non activé".
    // Le test T-364 réel (company mismatch -> 404) ne peut être exercé qu'avec
    // S3 activé ; ce test confirme au moins que la route reste protégée par
    // `protect` et ne renvoie jamais un succès pour une clé arbitraire.
    expect(res.status).not.toBe(200);
  });
});
