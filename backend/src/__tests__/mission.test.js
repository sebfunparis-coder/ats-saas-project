/**
 * Tests d'intégration — Missions CRUD (T-305)
 * Couvre : create → list → update → delete → workflow statuts → multi-tenant isolation
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { connectTestDb, disconnectTestDb, clearTestDb } from './helpers/testDb.js';

const COMPANY_A = { firstName: 'Alice', lastName: 'Martin', email: 'alice@companya.com', password: 'TestPass123!', company: 'Company A' };
const COMPANY_B = { firstName: 'Bob', lastName: 'Smith', email: 'bob@companyb.com', password: 'TestPass123!', company: 'Company B' };

const MISSION_DATA = {
  title: 'Développeur React Senior',
  description: 'Nous recherchons un développeur React expérimenté.',
  contract: 'CDI',
  location: 'Paris',
  salaryMin: 50000,
  salaryMax: 70000,
  status: 'active',
  companyName: 'Company A Test',
};

let tokenA, tokenB;

beforeAll(async () => {
  await connectTestDb();
});
afterAll(async () => {
  await disconnectTestDb();
});
beforeEach(async () => {
  await clearTestDb();
  // Créer deux companies distinctes
  const resA = await request(app).post('/api/auth/register').send(COMPANY_A);
  tokenA = resA.body.data?.token;
  const resB = await request(app).post('/api/auth/register').send(COMPANY_B);
  tokenB = resB.body.data?.token;
});

describe('POST /api/missions — Création', () => {
  it('crée une mission et la retourne', async () => {
    const res = await request(app)
      .post('/api/missions')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(MISSION_DATA);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(MISSION_DATA.title);
    expect(res.body.data.contract).toBe('CDI');
    expect(res.body.data.companyId).toBeDefined();
  });

  it('rejette une mission sans titre (400)', async () => {
    const res = await request(app)
      .post('/api/missions')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ ...MISSION_DATA, title: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejette sans authentification (401)', async () => {
    const res = await request(app).post('/api/missions').send(MISSION_DATA);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/missions — Liste', () => {
  it('retourne la liste des missions de la company', async () => {
    // Créer 2 missions
    await request(app).post('/api/missions').set('Authorization', `Bearer ${tokenA}`).send(MISSION_DATA);
    await request(app).post('/api/missions').set('Authorization', `Bearer ${tokenA}`).send({ ...MISSION_DATA, title: 'Product Manager' });

    const res = await request(app)
      .get('/api/missions')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  it('filtre par statut', async () => {
    await request(app).post('/api/missions').set('Authorization', `Bearer ${tokenA}`).send({ ...MISSION_DATA, status: 'active' });
    await request(app).post('/api/missions').set('Authorization', `Bearer ${tokenA}`).send({ ...MISSION_DATA, title: 'UX Designer', status: 'closed' });

    const res = await request(app)
      .get('/api/missions?status=active')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every(m => m.status === 'active')).toBe(true);
  });

  it('supporte la pagination', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/missions').set('Authorization', `Bearer ${tokenA}`).send({ ...MISSION_DATA, title: `Mission ${i}` });
    }
    const res = await request(app)
      .get('/api/missions?page=1&limit=3')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(3);
  });
});

describe('PUT /api/missions/:id — Mise à jour', () => {
  it('met à jour le titre d\'une mission', async () => {
    const createRes = await request(app)
      .post('/api/missions')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(MISSION_DATA);
    const missionId = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/missions/${missionId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Développeur React Principal' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Développeur React Principal');
  });

  it('retourne 404 pour une mission inexistante', async () => {
    const res = await request(app)
      .put('/api/missions/000000000000000000000001')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Test' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/missions/:id — Suppression', () => {
  it('supprime une mission existante', async () => {
    const createRes = await request(app)
      .post('/api/missions')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(MISSION_DATA);
    const missionId = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/missions/${missionId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);

    // Vérifier qu'elle n'est plus listée
    const listRes = await request(app)
      .get('/api/missions')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(listRes.body.data.find(m => m._id === missionId)).toBeUndefined();
  });
});

describe('Isolation multi-tenant — Missions', () => {
  it('Company B ne voit pas les missions de Company A', async () => {
    await request(app)
      .post('/api/missions')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(MISSION_DATA);

    const resB = await request(app)
      .get('/api/missions')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(resB.status).toBe(200);
    expect(resB.body.data.length).toBe(0);
  });

  it('Company B ne peut pas modifier une mission de Company A', async () => {
    const createRes = await request(app)
      .post('/api/missions')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(MISSION_DATA);
    const missionId = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/missions/${missionId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'Hack' });

    expect([403, 404]).toContain(res.status);
  });
});
