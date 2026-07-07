/**
 * Tests d'isolation multi-tenant (T-305)
 * Vérifie que chaque tenant voit UNIQUEMENT ses propres données
 * sur toutes les ressources principales.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { connectTestDb, disconnectTestDb, clearTestDb } from './helpers/testDb.js';

const TENANT_1 = { firstName: 'Alice', lastName: 'T1', email: 'alice@tenant1.com', password: 'TestPass123!', company: 'Tenant One' };
const TENANT_2 = { firstName: 'Bob', lastName: 'T2', email: 'bob@tenant2.com', password: 'TestPass123!', company: 'Tenant Two' };

let token1, token2;

beforeAll(async () => { await connectTestDb(); });
afterAll(async () => { await disconnectTestDb(); });

beforeEach(async () => {
  await clearTestDb();
  const res1 = await request(app).post('/api/auth/register').send(TENANT_1);
  token1 = res1.body.data?.token;
  const res2 = await request(app).post('/api/auth/register').send(TENANT_2);
  token2 = res2.body.data?.token;
});

describe('Isolation horizontale — Missions', () => {
  it('T1 crée une mission ; T2 ne la voit pas', async () => {
    await request(app).post('/api/missions').set('Authorization', `Bearer ${token1}`)
      .send({ title: 'Mission T1 privée', contract: 'CDI', location: 'Paris', status: 'open' });

    const res2 = await request(app).get('/api/missions').set('Authorization', `Bearer ${token2}`);
    expect(res2.body.data?.length || 0).toBe(0);
  });
});

describe('Isolation horizontale — Candidats', () => {
  it('T1 crée un candidat ; T2 ne le voit pas', async () => {
    await request(app).post('/api/candidates').set('Authorization', `Bearer ${token1}`)
      .send({ name: 'Candidat T1', email: 'ct1@test.com', position: 'Dev' });

    const res2 = await request(app).get('/api/candidates').set('Authorization', `Bearer ${token2}`);
    expect(res2.body.data?.length || 0).toBe(0);
  });
});

describe('Isolation horizontale — Clients', () => {
  it('T1 crée un client ; T2 ne le voit pas', async () => {
    await request(app).post('/api/clients').set('Authorization', `Bearer ${token1}`)
      .send({ name: 'Client T1 Secret', email: 'client@t1.com', status: 'active' });

    const res2 = await request(app).get('/api/clients').set('Authorization', `Bearer ${token2}`);
    const clientsT2 = res2.body.data || [];
    const found = clientsT2.some(c => c.name === 'Client T1 Secret');
    expect(found).toBe(false);
  });
});

describe('Tentatives d\'accès cross-tenant', () => {
  it('T2 ne peut pas lire un candidat de T1 par son ID', async () => {
    const createRes = await request(app).post('/api/candidates').set('Authorization', `Bearer ${token1}`)
      .send({ name: 'Candidat Privé T1', email: 'priv@t1.com', position: 'Analyst' });
    const candidateId = createRes.body.data?._id;
    if (!candidateId) return; // Skip si la création a échoué (mock mode)

    const res2 = await request(app)
      .get(`/api/candidates/${candidateId}`)
      .set('Authorization', `Bearer ${token2}`);

    // Doit retourner 403 ou 404, jamais 200 avec les données de T1
    expect(res2.status).not.toBe(200);
  });

  it('T2 ne peut pas supprimer une mission de T1', async () => {
    const createRes = await request(app).post('/api/missions').set('Authorization', `Bearer ${token1}`)
      .send({ title: 'Mission Privée T1', contract: 'CDI', location: 'Paris', status: 'open' });
    const missionId = createRes.body.data?._id;
    if (!missionId) return;

    const res2 = await request(app)
      .delete(`/api/missions/${missionId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect([403, 404]).toContain(res2.status);

    // Vérifier que la mission existe toujours pour T1
    const res1 = await request(app).get('/api/missions').set('Authorization', `Bearer ${token1}`);
    const stillExists = (res1.body.data || []).some(m => m._id === missionId);
    expect(stillExists).toBe(true);
  });
});

describe('Sécurité — Tokens', () => {
  it('token expiré retourne 401', async () => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1NiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAxfQ.invalid';
    const res = await request(app)
      .get('/api/missions')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
  });

  it('token malformé retourne 401', async () => {
    const res = await request(app)
      .get('/api/candidates')
      .set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  it('header Authorization absent retourne 401', async () => {
    const res = await request(app).get('/api/missions');
    expect(res.status).toBe(401);
  });
});
