/**
 * BLOC 29 — API publique v1 (backend Express legacy) : 3 bugs distincts
 * trouvés dans `publicApi.routes.js` en corrigeant des tickets voisins.
 *
 * T-402 : la recherche `?q=` sur /api/v1/candidates cherchait un champ `name`
 * qui n'existe pas sur le modèle Candidate (seulement firstName/lastName) —
 * cette branche du $or ne matchait donc jamais rien.
 * T-403 : `.select('-resume')` — Candidate n'a pas de champ `resume` (confusion
 * avec le schéma Supabase du frontend) — l'exclusion voulue ne faisait rien ;
 * remplacée par `-notes` (le vrai champ interne sensible).
 * T-404 : `Mission.create({...req.body, companyId, createdVia:'api'})` et
 * l'équivalent Candidate n'avaient aucune allowlist (mass-assignment), aucun
 * appel aux vérifications de quota du plan, et une mission créée via l'API
 * héritait du défaut Mongoose `status: 'active'` — publiée en direct, sans
 * passer par le workflow d'approbation manager.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import Mission from '../models/Mission.model.js';
import Candidate from '../models/Candidate.model.js';
import { connectTestDb, disconnectTestDb, clearTestDb } from './helpers/testDb.js';

const TENANT = { firstName: 'Alice', lastName: 'Martin', email: 'alice@publicapi-test.com', password: 'TestPass123!', company: 'Public API Co' };
let token, companyId;

beforeAll(async () => { await connectTestDb(); });
afterAll(async () => { await disconnectTestDb(); });

beforeEach(async () => {
  await clearTestDb();
  const res = await request(app).post('/api/auth/register').send(TENANT);
  token = res.body.data?.token;
  companyId = res.body.data?.user?.companyId;
});

describe('T-402 — GET /api/v1/candidates?q= cherche bien sur firstName/lastName', () => {
  it('trouve un candidat par son prénom (pas seulement email/skills)', async () => {
    if (!token) return;
    await request(app).post('/api/v1/candidates').set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Zéphyrine', lastName: 'Dupont', email: 'zephyrine@test.com', position: 'Dev' });

    const res = await request(app).get('/api/v1/candidates').query({ q: 'Zéphyrine' }).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.some(c => c.firstName === 'Zéphyrine')).toBe(true);
  });

  it('trouve un candidat par son nom de famille', async () => {
    if (!token) return;
    await request(app).post('/api/v1/candidates').set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Jean', lastName: 'Kowalczyk', email: 'jean.k@test.com', position: 'Dev' });

    const res = await request(app).get('/api/v1/candidates').query({ q: 'Kowalczyk' }).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.some(c => c.lastName === 'Kowalczyk')).toBe(true);
  });
});

describe('T-403 — les notes internes ne sont jamais exposées via l\'API publique', () => {
  it('GET /api/v1/candidates n\'inclut jamais le champ notes', async () => {
    if (!token) return;
    await Candidate.create({ firstName: 'Paul', lastName: 'Secret', email: 'paul.secret@test.com', position: 'Dev', companyId, notes: 'Ne jamais recruter — info confidentielle RH' });

    const res = await request(app).get('/api/v1/candidates').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.every(c => c.notes === undefined)).toBe(true);
  });

  it('GET /api/v1/candidates/:id n\'inclut jamais le champ notes', async () => {
    if (!token) return;
    const candidate = await Candidate.create({ firstName: 'Paul', lastName: 'Secret', email: 'paul2@test.com', position: 'Dev', companyId, notes: 'Confidentiel' });

    const res = await request(app).get(`/api/v1/candidates/${candidate._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.notes).toBeUndefined();
  });
});

describe('T-404 — mass-assignment bloqué sur POST/PATCH missions et candidats', () => {
  it('POST /api/v1/missions force status=pending_approval même si le body tente de le forcer à "active"', async () => {
    if (!token) return;
    const res = await request(app).post('/api/v1/missions').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Dev Backend', contract: 'CDI', location: 'Paris', status: 'active' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending_approval');
  });

  it('POST /api/v1/missions ignore les champs internes non-allowlistés (approvalHistory, applicationCount)', async () => {
    if (!token) return;
    const res = await request(app).post('/api/v1/missions').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Dev Frontend', contract: 'CDI', location: 'Lyon', approvalHistory: [{ action: 'approved' }], applicationCount: 9999 });
    expect(res.status).toBe(201);
    expect(res.body.data.applicationCount).not.toBe(9999);
    expect(res.body.data.approvalHistory || []).toHaveLength(0);
  });

  it('POST /api/v1/candidates ignore les champs internes non-allowlistés (notes, rating)', async () => {
    if (!token) return;
    const res = await request(app).post('/api/v1/candidates').set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Test', lastName: 'User', email: 'testuser@test.com', position: 'Dev', notes: 'injection tentative', rating: 5 });
    expect(res.status).toBe(201);
    expect(res.body.data.notes).toBeUndefined();
  });

  it('PATCH /api/v1/missions/:id ignore aussi les champs non-allowlistés', async () => {
    if (!token) return;
    const createRes = await request(app).post('/api/v1/missions').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Mission à patcher', contract: 'CDI', location: 'Paris' });
    const missionId = createRes.body.data?._id;
    expect(missionId).toBeTruthy();

    const patchRes = await request(app).patch(`/api/v1/missions/${missionId}`).set('Authorization', `Bearer ${token}`)
      .send({ status: 'active', applicationCount: 500 });
    expect(patchRes.status).toBe(200);
    // status n'est pas dans l'allowlist PATCH — reste inchangé (pending_approval)
    expect(patchRes.body.data.status).toBe('pending_approval');
    expect(patchRes.body.data.applicationCount).not.toBe(500);
  });

  it('POST /api/v1/missions refuse au-delà du quota du plan (10 missions pour Starter)', async () => {
    if (!token || !companyId) return;
    const userId = decodeUserId(token);
    const bulk = Array.from({ length: 10 }, (_, i) => ({
      title: `Mission ${i}`, contract: 'CDI', location: 'Paris', companyId,
      company: companyId, companyName: TENANT.company, createdBy: userId, status: 'draft',
    }));
    await Mission.insertMany(bulk);

    const res = await request(app).post('/api/v1/missions').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Mission de trop', contract: 'CDI', location: 'Paris' });
    expect(res.status).toBe(403);
  });
});

function decodeUserId(jwtToken) {
  const payload = JSON.parse(Buffer.from(jwtToken.split('.')[1], 'base64').toString());
  return payload.id;
}
