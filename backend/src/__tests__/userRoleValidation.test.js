/**
 * T-401 : `validRoles`/`validateUserRole` ne listaient que `['user','admin']`
 * ou `['user','admin','superadmin']`, alors que `User.model.js` définit
 * l'enum réel `['user','recruiter','manager','admin','superadmin']` — un
 * admin ne pouvait pas légitimement assigner 'recruiter'/'manager' via l'API.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { connectTestDb, disconnectTestDb, clearTestDb } from './helpers/testDb.js';

const TENANT = { firstName: 'Alice', lastName: 'Admin', email: 'alice@rolevalidation-test.com', password: 'TestPass123!', company: 'Role Validation Co' };
let token;

beforeAll(async () => { await connectTestDb(); });
afterAll(async () => { await disconnectTestDb(); });

beforeEach(async () => {
  await clearTestDb();
  const res = await request(app).post('/api/auth/register').send(TENANT);
  token = res.body.data?.token;
});

async function createTargetUser() {
  const res = await request(app).post('/api/users').set('Authorization', `Bearer ${token}`)
    .send({ email: 'target@rolevalidation-test.com', firstName: 'Target', lastName: 'User', password: 'TestPass123!' });
  return res.status === 201 ? res.body.data?._id : null;
}

describe('T-401 — validateUserRole accepte bien recruiter/manager (enum réel du modèle)', () => {
  it.each(['recruiter', 'manager'])('accepte le rôle "%s" (PUT /api/users/:id/role)', async (role) => {
    if (!token) return;
    const targetId = await createTargetUser();
    if (!targetId) return;

    const res = await request(app).put(`/api/users/${targetId}/role`).set('Authorization', `Bearer ${token}`)
      .send({ role });
    // Ne doit plus être rejeté par la validation express-validator ("Rôle invalide", 400)
    expect(res.status).not.toBe(400);
  });

  it('rejette toujours un rôle qui n\'existe pas dans l\'enum', async () => {
    if (!token) return;
    const targetId = await createTargetUser();
    if (!targetId) return;

    const res = await request(app).put(`/api/users/${targetId}/role`).set('Authorization', `Bearer ${token}`)
      .send({ role: 'not-a-real-role' });
    expect(res.status).toBe(400);
  });
});
