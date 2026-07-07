/**
 * Tests d'intégration — Candidats CRUD (T-305)
 * Couvre : create → list → update → delete → multi-tenant isolation
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { connectTestDb, disconnectTestDb, clearTestDb } from './helpers/testDb.js';

const COMPANY_A = { firstName: 'Alice', lastName: 'RH', email: 'alice@rh-a.com', password: 'TestPass123!', company: 'RH Company A' };
const COMPANY_B = { firstName: 'Bob', lastName: 'RH', email: 'bob@rh-b.com', password: 'TestPass123!', company: 'RH Company B' };

const CANDIDATE_DATA = {
  firstName: 'Marie',
  lastName: 'Dupont',
  email: 'marie.dupont@email.com',
  phone: '0612345678',
  position: 'Développeuse Frontend',
  skills: ['React', 'TypeScript', 'CSS'],
  experience: 5,
  location: 'Lyon',
  status: 'new',
};

let tokenA, tokenB;

beforeAll(async () => { await connectTestDb(); });
afterAll(async () => { await disconnectTestDb(); });
beforeEach(async () => {
  await clearTestDb();
  const resA = await request(app).post('/api/auth/register').send(COMPANY_A);
  tokenA = resA.body.data?.token;
  const resB = await request(app).post('/api/auth/register').send(COMPANY_B);
  tokenB = resB.body.data?.token;
});

describe('POST /api/candidates — Création', () => {
  it('crée un candidat et le retourne', async () => {
    const res = await request(app)
      .post('/api/candidates')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(CANDIDATE_DATA);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.firstName).toBe(CANDIDATE_DATA.firstName);
    expect(res.body.data.email).toBe(CANDIDATE_DATA.email);
    expect(res.body.data.companyId).toBeDefined();
  });

  it('rejette un candidat sans nom (400)', async () => {
    const res = await request(app)
      .post('/api/candidates')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ ...CANDIDATE_DATA, firstName: '' });

    expect(res.status).toBe(400);
  });

  it('rejette un email invalide (400)', async () => {
    const res = await request(app)
      .post('/api/candidates')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ ...CANDIDATE_DATA, email: 'not-an-email' });

    expect(res.status).toBe(400);
  });

  it('refuse la création sans authentification (401)', async () => {
    const res = await request(app).post('/api/candidates').send(CANDIDATE_DATA);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/candidates — Liste', () => {
  it('retourne les candidats de la company', async () => {
    await request(app).post('/api/candidates').set('Authorization', `Bearer ${tokenA}`).send(CANDIDATE_DATA);
    await request(app).post('/api/candidates').set('Authorization', `Bearer ${tokenA}`).send({ ...CANDIDATE_DATA, firstName: 'Jean', lastName: 'Martin', email: 'jean@test.com' });

    const res = await request(app)
      .get('/api/candidates')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  it('retourne 0 candidat pour une company vide', async () => {
    const res = await request(app)
      .get('/api/candidates')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  it('filtre par statut', async () => {
    await request(app).post('/api/candidates').set('Authorization', `Bearer ${tokenA}`).send({ ...CANDIDATE_DATA, status: 'new' });
    await request(app).post('/api/candidates').set('Authorization', `Bearer ${tokenA}`).send({ ...CANDIDATE_DATA, firstName: 'Paul', lastName: 'Lefort', email: 'paul@test.com', status: 'contacted' });

    const res = await request(app)
      .get('/api/candidates?status=new')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every(c => c.status === 'new')).toBe(true);
  });
});

describe('PUT /api/candidates/:id — Mise à jour', () => {
  it('met à jour les infos d\'un candidat', async () => {
    const createRes = await request(app)
      .post('/api/candidates')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(CANDIDATE_DATA);
    const candidateId = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/candidates/${candidateId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ firstName: 'Marie', lastName: 'Dupont', email: 'marie.dupont@email.com', position: 'Dev', experience: 7, status: 'contacted' });

    expect(res.status).toBe(200);
    expect(res.body.data.experience).toBe(7);
    expect(res.body.data.status).toBe('contacted');
  });
});

describe('DELETE /api/candidates/:id — Suppression', () => {
  it('supprime un candidat existant', async () => {
    const createRes = await request(app)
      .post('/api/candidates')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(CANDIDATE_DATA);
    const candidateId = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/candidates/${candidateId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);

    const listRes = await request(app).get('/api/candidates').set('Authorization', `Bearer ${tokenA}`);
    expect(listRes.body.data.find(c => c._id === candidateId)).toBeUndefined();
  });
});

describe('Isolation multi-tenant — Candidats', () => {
  it('Company B ne voit pas les candidats de Company A', async () => {
    await request(app)
      .post('/api/candidates')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(CANDIDATE_DATA);

    const resB = await request(app)
      .get('/api/candidates')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(resB.status).toBe(200);
    expect(resB.body.data.length).toBe(0);
  });

  it('Company B ne peut pas modifier un candidat de Company A', async () => {
    const createRes = await request(app)
      .post('/api/candidates')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(CANDIDATE_DATA);
    const candidateId = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/candidates/${candidateId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ firstName: 'Hack' });

    expect([400, 403, 404]).toContain(res.status);
  });
});
