/**
 * T-374 : PUT /api/missions/bulk/status et /api/candidates/bulk/status
 * n'avaient aucune restriction de rôle (contrairement à DELETE /bulk) et
 * n'appliquaient pas les enums Mongoose (`runValidators` absent).
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.model.js';
import { connectTestDb, disconnectTestDb, clearTestDb } from './helpers/testDb.js';

const TENANT = { firstName: 'Alice', lastName: 'A', email: 'alice@bulkstatus.com', password: 'TestPass123!', company: 'Bulk Status Co' };

let token, companyId;

beforeAll(async () => { await connectTestDb(); });
afterAll(async () => { await disconnectTestDb(); });

beforeEach(async () => {
  await clearTestDb();
  const res = await request(app).post('/api/auth/register').send(TENANT);
  token = res.body.data?.token;
  companyId = res.body.data?.user?.companyId;
});

describe('T-374 — restriction de rôle sur bulk/status', () => {
  it('un rôle non élevé (recruiter) reçoit 403 sur missions bulk/status', async () => {
    if (!token) return;
    const userId = res_userId(token);
    await User.findByIdAndUpdate(userId, { role: 'recruiter' });

    const createRes = await request(app).post('/api/missions').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Mission Test', contract: 'CDI', location: 'Paris', status: 'open' });
    const missionId = createRes.body.data?._id;
    if (!missionId) return;

    const res = await request(app)
      .put('/api/missions/bulk/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids: [missionId], status: 'active' });
    expect(res.status).toBe(403);
  });

  it('un rôle non élevé (recruiter) reçoit 403 sur candidates bulk/status', async () => {
    if (!token) return;
    const userId = res_userId(token);
    await User.findByIdAndUpdate(userId, { role: 'recruiter' });

    const createRes = await request(app).post('/api/candidates').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Candidat Test', email: 'ct@test.com', position: 'Dev' });
    const candidateId = createRes.body.data?._id;
    if (!candidateId) return;

    const res = await request(app)
      .put('/api/candidates/bulk/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids: [candidateId], status: 'active' });
    expect(res.status).toBe(403);
  });

  it('un admin peut toujours utiliser bulk/status normalement (pas de régression)', async () => {
    if (!token) return;
    const createRes = await request(app).post('/api/missions').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Mission Admin', contract: 'CDI', location: 'Lyon', status: 'draft' });
    const missionId = createRes.body.data?._id;
    if (!missionId) return;

    const res = await request(app)
      .put('/api/missions/bulk/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids: [missionId], status: 'open' });
    expect(res.status).toBe(200);
    expect(res.body.updated).toBe(1);
  });

  it('runValidators rejette une valeur de statut hors de l\'enum Mongoose', async () => {
    if (!token) return;
    const createRes = await request(app).post('/api/missions').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Mission Enum', contract: 'CDI', location: 'Nice', status: 'open' });
    const missionId = createRes.body.data?._id;
    if (!missionId) return;

    const res = await request(app)
      .put('/api/missions/bulk/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids: [missionId], status: 'statut-invalide-qui-nexiste-pas' });
    expect(res.status).not.toBe(200);
  });
});

// Décode le JWT pour récupérer l'id utilisateur sans dépendance supplémentaire
function res_userId(jwtToken) {
  const payload = JSON.parse(Buffer.from(jwtToken.split('.')[1], 'base64').toString());
  return payload.id;
}
