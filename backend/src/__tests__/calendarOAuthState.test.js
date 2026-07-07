/**
 * T-365 : le `state` OAuth Calendar (Google/Microsoft) doit être signé et
 * infalsifiable — un attaquant qui connaît seulement le companyId/userId
 * d'une victime ne doit jamais pouvoir forger un state accepté par le callback.
 */
import { describe, it, expect } from '@jest/globals';
import crypto from 'crypto';
import request from 'supertest';
import app from '../app.js';
import { signState, verifySignedState } from '../routes/calendarCallback.routes.js';

describe('T-365 — signState / verifySignedState', () => {
  it('un state légitimement signé est accepté et restitue le bon payload', () => {
    const state = signState({ companyId: 'company-123', userId: 'user-456' });
    const parsed = verifySignedState(state);
    expect(parsed).toMatchObject({ companyId: 'company-123', userId: 'user-456' });
  });

  it('un state forgé (JSON+base64 auto-porté, ancien format sans signature) est rejeté', () => {
    // Exactement l'ancien format vulnérable : base64(JSON) sans HMAC.
    const forged = Buffer.from(JSON.stringify({ companyId: 'victime-company', userId: 'victime-user' })).toString('base64');
    expect(verifySignedState(forged)).toBeNull();
  });

  it('un state avec une signature invalide (payload modifié après coup) est rejeté', () => {
    const state = signState({ companyId: 'company-123', userId: 'user-456' });
    const [b64, sig] = state.split('.');
    // L'attaquant tente de remplacer le payload par celui d'une victime, en
    // gardant la signature du sien (qu'il ne peut pas recalculer sans le secret).
    const tamperedPayload = Buffer.from(JSON.stringify({ companyId: 'victime-company', userId: 'victime-user', iat: Date.now() })).toString('base64url');
    expect(verifySignedState(`${tamperedPayload}.${sig}`)).toBeNull();
  });

  it('un state expiré (> 10 minutes) est rejeté même signé correctement avec le vrai secret', () => {
    const payload = { companyId: 'company-123', userId: 'user-456', iat: Date.now() - 11 * 60 * 1000 };
    const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = crypto.createHmac('sha256', process.env.JWT_SECRET).update(b64).digest('base64url');
    expect(verifySignedState(`${b64}.${sig}`)).toBeNull();
  });

  it('un state absent/vide est rejeté', () => {
    expect(verifySignedState(undefined)).toBeNull();
    expect(verifySignedState('')).toBeNull();
    expect(verifySignedState('not-a-valid-state')).toBeNull();
  });
});

describe('T-365 — callback HTTP rejette un state forgé avant tout échange OAuth', () => {
  it('GET /api/calendar/google/callback avec un state forgé (ancien format) -> 400, jamais un succès', async () => {
    const forged = Buffer.from(JSON.stringify({ companyId: 'victime-company', userId: 'victime-user' })).toString('base64');
    const res = await request(app).get('/api/calendar/google/callback').query({ code: 'fake-code', state: forged });
    expect(res.status).toBe(400);
  });

  it('GET /api/calendar/microsoft/callback avec un state forgé -> 400', async () => {
    const forged = Buffer.from(JSON.stringify({ companyId: 'victime-company', userId: 'victime-user' })).toString('base64');
    const res = await request(app).get('/api/calendar/microsoft/callback').query({ code: 'fake-code', state: forged });
    expect(res.status).toBe(400);
  });
});
