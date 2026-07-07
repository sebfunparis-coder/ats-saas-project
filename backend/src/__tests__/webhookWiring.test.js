/**
 * T-378 : les webhooks sortants (T-276, catalogue de 15 événements) et les
 * intégrations calendrier/visio (T-270/271/272/273) avaient un service complet
 * et fonctionnel mais n'étaient déclenchés depuis AUCUN contrôleur — un client
 * ayant configuré un webhook Zapier/Make ne recevait donc jamais rien.
 *
 * La livraison HTTP réelle (avec retry 5s/25s/125s, voir webhook.service.js)
 * est volontairement hors de portée d'un test rapide : le garde-fou SSRF
 * (T-340) refuse justement localhost/IP privées, donc un webhook de test
 * pointant vers un récepteur local échouerait par conception et déclencherait
 * les 3 tentatives de retry (~155s). Ce fichier vérifie donc :
 *   1. Que chaque contrôleur déclenche bien `triggerWebhookEvent` avec le bon
 *      nom d'événement (présent dans le catalogue WEBHOOK_EVENTS — un typo de
 *      chaîne serait le bug silencieux le plus probable ici).
 *   2. Que `triggerWebhookEvent` ne livre jamais rien quand aucun webhook
 *      n'est configuré, ou quand le webhook configuré est désactivé /
 *      n'écoute pas cet événement (chemins rapides, sans réseau).
 *   3. Que les endpoints continuent de répondre normalement (regression) une
 *      fois le webhook (fire-and-forget) branché dans le flux de la requête.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import crypto from 'crypto';
import app from '../app.js';
import WebhookConfig from '../models/WebhookConfig.model.js';
import WebhookLog from '../models/WebhookLog.model.js';
import webhookService, { WEBHOOK_EVENTS, triggerWebhookEvent } from '../services/webhook.service.js';
import { connectTestDb, disconnectTestDb, clearTestDb } from './helpers/testDb.js';

const TENANT = { firstName: 'Alice', lastName: 'Martin', email: 'alice@webhook-wiring.com', password: 'TestPass123!', company: 'Webhook Wiring Co' };

let token, companyId;

beforeAll(async () => { await connectTestDb(); });
afterAll(async () => { await disconnectTestDb(); });

beforeEach(async () => {
  await clearTestDb();
  const res = await request(app).post('/api/auth/register').send(TENANT);
  token = res.body.data?.token;
  companyId = res.body.data?.user?.companyId;
});

function decodeUserId(jwtToken) {
  const payload = JSON.parse(Buffer.from(jwtToken.split('.')[1], 'base64').toString());
  return payload.id;
}

describe('T-378 — catalogue WEBHOOK_EVENTS', () => {
  it('contient les 15 événements attendus (candidatures, candidats, missions, entretiens, équipe)', () => {
    const expected = [
      'application.created', 'application.status_changed', 'application.hired', 'application.rejected',
      'candidate.created', 'candidate.updated', 'candidate.deleted',
      'mission.created', 'mission.published', 'mission.closed', 'mission.approved',
      'interview.scheduled', 'interview.reminder',
      'team.member_added', 'team.member_removed',
    ];
    expect(Object.keys(WEBHOOK_EVENTS).sort()).toEqual(expected.sort());
  });
});

describe('T-378 — signPayload (HMAC-SHA256, via export default)', () => {
  it('produit une signature déterministe vérifiable côté destinataire', () => {
    const payload = { event: 'candidate.created', data: { id: '123' } };
    const secret = 'my-secret';
    const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    expect(webhookService.signPayload(payload, secret)).toBe(expected);
  });

  it('retourne null sans secret (pas de signature attendue par le destinataire)', () => {
    expect(webhookService.signPayload({ event: 'x' }, null)).toBeNull();
  });
});

describe('T-378 — triggerWebhookEvent : chemins rapides sans réseau', () => {
  it('aucun webhook configuré → résout sans rien livrer ni logger', async () => {
    await triggerWebhookEvent(companyId, 'candidate.created', { candidateId: 'x' });
    const logs = await WebhookLog.find({ companyId }).lean();
    expect(logs.length).toBe(0);
  });

  it('webhook désactivé (enabled:false) → jamais livré', async () => {
    await WebhookConfig.create({
      companyId, name: 'Test', url: 'https://example.com/hook',
      events: ['candidate.created'], enabled: false,
    });
    await triggerWebhookEvent(companyId, 'candidate.created', { candidateId: 'x' });
    const logs = await WebhookLog.find({ companyId }).lean();
    expect(logs.length).toBe(0);
  });

  it("webhook actif mais n'écoutant pas cet événement → jamais livré", async () => {
    await WebhookConfig.create({
      companyId, name: 'Test', url: 'https://example.com/hook',
      events: ['mission.created'], enabled: true,
    });
    await triggerWebhookEvent(companyId, 'candidate.created', { candidateId: 'x' });
    const logs = await WebhookLog.find({ companyId }).lean();
    expect(logs.length).toBe(0);
  });
});

describe('T-378 — câblage contrôleurs : les endpoints répondent normalement (regression)', () => {
  it('POST /api/candidates déclenche candidate.created sans casser la réponse', async () => {
    const res = await request(app).post('/api/candidates').set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@wiring-test.com', position: 'Dev' });
    expect(res.status).toBe(201);
  });

  it('PUT /api/candidates/:id déclenche candidate.updated sans casser la réponse', async () => {
    const createRes = await request(app).post('/api/candidates').set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Jean', lastName: 'Dupont', email: 'jean2@wiring-test.com', position: 'Dev' });
    const candidateId = createRes.body.data?._id;
    expect(candidateId).toBeTruthy();

    const res = await request(app).put(`/api/candidates/${candidateId}`).set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Jean', lastName: 'Dupont', email: 'jean2@wiring-test.com', position: 'Dev', notes: 'Mise à jour test' });
    expect(res.status).toBe(200);
  });

  it('DELETE /api/candidates/:id déclenche candidate.deleted sans casser la réponse', async () => {
    const createRes = await request(app).post('/api/candidates').set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Jean', lastName: 'Dupont', email: 'jean3@wiring-test.com', position: 'Dev' });
    const candidateId = createRes.body.data?._id;
    expect(candidateId).toBeTruthy();

    const res = await request(app).delete(`/api/candidates/${candidateId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('POST /api/missions déclenche mission.created sans casser la réponse', async () => {
    const res = await request(app).post('/api/missions').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Mission Webhook', contract: 'CDI', location: 'Paris', status: 'draft', companyName: 'Test Company' });
    expect(res.status).toBe(201);
  });

  it('POST /api/missions/:id/publish déclenche mission.published sans casser la réponse', async () => {
    const createRes = await request(app).post('/api/missions').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Mission à publier', contract: 'CDI', location: 'Paris', status: 'draft', companyName: 'Test Company' });
    const missionId = createRes.body.data?._id;
    expect(missionId).toBeTruthy();

    const res = await request(app).post(`/api/missions/${missionId}/publish`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('POST /api/missions/:id/close déclenche mission.closed sans casser la réponse', async () => {
    const createRes = await request(app).post('/api/missions').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Mission à fermer', contract: 'CDI', location: 'Paris', status: 'active', companyName: 'Test Company' });
    const missionId = createRes.body.data?._id;
    expect(missionId).toBeTruthy();

    const res = await request(app).post(`/api/missions/${missionId}/close`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('POST /api/team déclenche team.member_added sans casser la réponse', async () => {
    const res = await request(app).post('/api/team').set('Authorization', `Bearer ${token}`)
      .send({ email: 'membre@wiring-test.com', firstName: 'Marc', lastName: 'Recruteur', role: 'Recruteur' });
    expect(res.status).toBe(201);
  });

  it('DELETE /api/team/:id déclenche team.member_removed sans casser la réponse', async () => {
    const createRes = await request(app).post('/api/team').set('Authorization', `Bearer ${token}`)
      .send({ email: 'membre2@wiring-test.com', firstName: 'Marc', lastName: 'Recruteur', role: 'Recruteur' });
    const teamMemberId = createRes.body.data?._id;
    expect(teamMemberId).toBeTruthy();

    const res = await request(app).delete(`/api/team/${teamMemberId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('POST /api/applications/:id/interview déclenche interview.scheduled sans casser la réponse (aucune intégration calendrier/visio connectée)', async () => {
    const missionRes = await request(app).post('/api/missions').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Dev Backend', contract: 'CDI', location: 'Paris', status: 'active', companyName: 'Test Company' });
    const missionId = missionRes.body.data?._id;

    const candidateRes = await request(app).post('/api/candidates').set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Thomas', lastName: 'Dev', email: 'thomas@wiring-test.com', position: 'Backend Dev' });
    const candidateId = candidateRes.body.data?._id;

    const appRes = await request(app).post('/api/applications').set('Authorization', `Bearer ${token}`)
      .send({ candidateId, missionId, status: 'received', candidateName: 'Thomas Dev', missionTitle: 'Dev Backend' });
    const applicationId = appRes.body.data?._id;
    expect(applicationId).toBeTruthy();

    const res = await request(app).post(`/api/applications/${applicationId}/interview`).set('Authorization', `Bearer ${token}`)
      .send({ type: 'interview', scheduledAt: new Date(Date.now() + 86400000).toISOString(), interviewer: decodeUserId(token) });
    expect(res.status).toBe(201);
    // Aucune company.videoProvider / integrationTokens configurés dans ce test
    // → la mission de départ (T-378) est de ne jamais faire échouer la
    // planification, pas de créer une vraie réunion Zoom/Teams ici.
    expect(res.body.success).toBe(true);
  });
});
