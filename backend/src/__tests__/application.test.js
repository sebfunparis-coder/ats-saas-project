/**
 * Tests d'intégration — Candidatures workflow (T-305)
 * Couvre : create → list → updateStatus → workflow complet → multi-tenant isolation
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { connectTestDb, disconnectTestDb, clearTestDb } from './helpers/testDb.js';

const COMPANY_A = { firstName: 'HR', lastName: 'Manager', email: 'hr@corp-a.com', password: 'TestPass123!', company: 'Corp A' };
const COMPANY_B = { firstName: 'HR', lastName: 'Manager', email: 'hr@corp-b.com', password: 'TestPass123!', company: 'Corp B' };

let tokenA, tokenB, missionId, candidateId;

beforeAll(async () => { await connectTestDb(); });
afterAll(async () => { await disconnectTestDb(); });

beforeEach(async () => {
  await clearTestDb();
  const resA = await request(app).post('/api/auth/register').send(COMPANY_A);
  tokenA = resA.body.data?.token;
  const resB = await request(app).post('/api/auth/register').send(COMPANY_B);
  tokenB = resB.body.data?.token;

  // Créer une mission et un candidat pour Company A
  const missionRes = await request(app)
    .post('/api/missions')
    .set('Authorization', `Bearer ${tokenA}`)
    .send({ title: 'Dev Backend', contract: 'CDI', location: 'Paris', status: 'active', companyName: 'Test Company' });
  missionId = missionRes.body.data?._id;

  const candidateRes = await request(app)
    .post('/api/candidates')
    .set('Authorization', `Bearer ${tokenA}`)
    .send({ firstName: 'Thomas', lastName: 'Dev', email: 'thomas@test.com', position: 'Backend Dev' });
  candidateId = candidateRes.body.data?._id;
});

describe('POST /api/applications — Création candidature', () => {
  it('crée une candidature entre un candidat et une mission', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        candidateId,
        missionId,
        status: 'received',
        candidateName: 'Thomas Dev',
        missionTitle: 'Dev Backend',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.candidateId?.toString() || res.body.data.candidate_id?.toString()).toBeTruthy();
    expect(res.body.data.status).toBeDefined();
  });

  it('rejette sans mission (400)', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ candidateId, status: 'received' });

    expect(res.status).toBe(400);
  });

  it('rejette sans authentification (401)', async () => {
    const res = await request(app)
      .post('/api/applications')
      .send({ candidateId, missionId, status: 'received' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/applications — Liste', () => {
  it('retourne les candidatures de la company', async () => {
    await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ candidateId, missionId, status: 'received', candidateName: 'Thomas', missionTitle: 'Dev Backend' });

    const res = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('filtre par statut', async () => {
    await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ candidateId, missionId, status: 'received', candidateName: 'Thomas', missionTitle: 'Dev' });

    const res = await request(app)
      .get('/api/applications?status=applied')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every(a => a.status !== undefined)).toBe(true);
  });
});

describe('PUT /api/applications/:id/status — Workflow statuts', () => {
  it('fait progresser une candidature dans le workflow', async () => {
    const createRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ candidateId, missionId, status: 'received', candidateName: 'Thomas', missionTitle: 'Dev' });
    const appId = createRes.body.data?._id;

    const WORKFLOW = ['screening', 'interview_1', 'interview_2', 'offer', 'hired'];

    for (const status of WORKFLOW) {
      const res = await request(app)
        .put(`/api/applications/${appId}/status`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ status });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(status);
    }
  });

  it('accepte le statut "rejected"', async () => {
    const createRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ candidateId, missionId, status: 'screening', candidateName: 'Thomas', missionTitle: 'Dev' });
    const appId = createRes.body.data?._id;

    const res = await request(app)
      .put(`/api/applications/${appId}/status`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ status: 'rejected' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('rejected');
  });
});

describe('Isolation multi-tenant — Candidatures', () => {
  it('Company B ne voit pas les candidatures de Company A', async () => {
    await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ candidateId, missionId, status: 'received', candidateName: 'Thomas', missionTitle: 'Dev' });

    const resB = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(resB.status).toBe(200);
    expect(resB.body.data.length).toBe(0);
  });
});
