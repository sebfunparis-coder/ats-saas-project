/**
 * T-399 : `recordActivity`/`incrementStat` (team.controller.js) n'avaient
 * aucun `authorize()` ni vérification que le `teamMemberId` ciblé correspond
 * à l'appelant — n'importe quel utilisateur authentifié de la company
 * pouvait gonfler/dégonfler les statistiques (placements, revenue...) de
 * n'importe quel collègue.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { connectTestDb, disconnectTestDb, clearTestDb } from './helpers/testDb.js';

const TENANT = { firstName: 'Alice', lastName: 'Admin', email: 'alice@teamstats-test.com', password: 'TestPass123!', company: 'Team Stats Co' };
let adminToken;

beforeAll(async () => { await connectTestDb(); });
afterAll(async () => { await disconnectTestDb(); });

beforeEach(async () => {
  await clearTestDb();
  const res = await request(app).post('/api/auth/register').send(TENANT);
  adminToken = res.body.data?.token;
});

async function createColleagueAndLogin(email, firstName) {
  const createRes = await request(app).post('/api/team').set('Authorization', `Bearer ${adminToken}`)
    .send({ email, firstName, lastName: 'Test', role: 'Recruteur' });
  if (createRes.status !== 201) return null;
  const teamMemberId = createRes.body.data._id;
  const tempPassword = createRes.body.data.temporaryPassword;

  const loginRes = await request(app).post('/api/auth/login').send({ email, password: tempPassword });
  if (loginRes.body?.code === 'EMAIL_NOT_VERIFIED' || loginRes.status !== 200) {
    return { teamMemberId, token: null };
  }
  return { teamMemberId, token: loginRes.body.data.token };
}

describe('T-399 — incrementStat/recordActivity restreints à admin/manager ou l\'intéressé lui-même', () => {
  it('un collègue (recruiter) ne peut pas incrémenter les stats d\'un AUTRE collègue', async () => {
    if (!adminToken) return;
    const colleagueA = await createColleagueAndLogin('colleagueA@teamstats-test.com', 'ColA');
    const colleagueB = await createColleagueAndLogin('colleagueB@teamstats-test.com', 'ColB');
    if (!colleagueA?.token || !colleagueB) return;

    const res = await request(app).put(`/api/team/${colleagueB.teamMemberId}/stats`).set('Authorization', `Bearer ${colleagueA.token}`)
      .send({ stat: 'placements', value: 100 });
    expect(res.status).toBe(403);
  });

  it('un collègue (recruiter) PEUT incrémenter ses PROPRES stats', async () => {
    if (!adminToken) return;
    const colleagueA = await createColleagueAndLogin('colleagueC@teamstats-test.com', 'ColC');
    if (!colleagueA?.token) return;

    const res = await request(app).put(`/api/team/${colleagueA.teamMemberId}/stats`).set('Authorization', `Bearer ${colleagueA.token}`)
      .send({ stat: 'candidatesAdded', value: 1 });
    expect(res.status).toBe(200);
  });

  it('un collègue (recruiter) ne peut pas modifier l\'activité d\'un AUTRE collègue', async () => {
    if (!adminToken) return;
    const colleagueA = await createColleagueAndLogin('colleagueD@teamstats-test.com', 'ColD');
    const colleagueB = await createColleagueAndLogin('colleagueE@teamstats-test.com', 'ColE');
    if (!colleagueA?.token || !colleagueB) return;

    const res = await request(app).post(`/api/team/${colleagueB.teamMemberId}/activity`).set('Authorization', `Bearer ${colleagueA.token}`);
    expect(res.status).toBe(403);
  });

  it('un admin peut toujours incrémenter les stats de n\'importe quel membre (pas de régression)', async () => {
    if (!adminToken) return;
    const colleague = await createColleagueAndLogin('colleagueF@teamstats-test.com', 'ColF');
    if (!colleague) return;

    const res = await request(app).put(`/api/team/${colleague.teamMemberId}/stats`).set('Authorization', `Bearer ${adminToken}`)
      .send({ stat: 'placements', value: 1 });
    expect(res.status).toBe(200);
  });
});
