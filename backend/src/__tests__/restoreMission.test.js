/**
 * T-375 : PATCH /api/missions/:id/restore documentait "(admin uniquement)"
 * mais n'avait aucune restriction de rôle réelle.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.model.js';
import { connectTestDb, disconnectTestDb, clearTestDb } from './helpers/testDb.js';

const TENANT = { firstName: 'Alice', lastName: 'A', email: 'alice@restore.com', password: 'TestPass123!', company: 'Restore Co' };
let token;

beforeAll(async () => { await connectTestDb(); });
afterAll(async () => { await disconnectTestDb(); });

beforeEach(async () => {
  await clearTestDb();
  const res = await request(app).post('/api/auth/register').send(TENANT);
  token = res.body.data?.token;
});

function userIdFromToken(jwtToken) {
  return JSON.parse(Buffer.from(jwtToken.split('.')[1], 'base64').toString()).id;
}

describe('T-375 — restriction de rôle sur restore', () => {
  it('un rôle non élevé (recruiter) reçoit 403 sur restore', async () => {
    if (!token) return;
    const createRes = await request(app).post('/api/missions').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Mission À Restaurer', contract: 'CDI', location: 'Paris', status: 'open' });
    const missionId = createRes.body.data?._id;
    if (!missionId) return;

    await request(app).delete(`/api/missions/${missionId}`).set('Authorization', `Bearer ${token}`);

    await User.findByIdAndUpdate(userIdFromToken(token), { role: 'recruiter' });

    const res = await request(app)
      .patch(`/api/missions/${missionId}/restore`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('un admin peut restaurer normalement (pas de régression)', async () => {
    if (!token) return;
    const createRes = await request(app).post('/api/missions').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Mission À Restaurer 2', contract: 'CDI', location: 'Lyon', status: 'open' });
    const missionId = createRes.body.data?._id;
    if (!missionId) return;

    await request(app).delete(`/api/missions/${missionId}`).set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .patch(`/api/missions/${missionId}/restore`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
