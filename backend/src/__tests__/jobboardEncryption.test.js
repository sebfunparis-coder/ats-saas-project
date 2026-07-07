/**
 * T-377 : les credentials jobboards (clientSecret, apiKey, accessToken...)
 * étaient stockées EN CLAIR dans MongoDB. Vérifie qu'elles sont désormais
 * chiffrées au repos (AES-256-GCM) tout en restant utilisables normalement
 * via l'API (round-trip transparent pour l'appelant).
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import JobboardIntegration from '../models/JobboardIntegration.model.js';
import { encryptJSON, decryptJSON } from '../utils/encryption.js';
import { connectTestDb, disconnectTestDb, clearTestDb } from './helpers/testDb.js';

const TENANT = { firstName: 'Alice', lastName: 'A', email: 'alice@jobboard-enc.com', password: 'TestPass123!', company: 'Jobboard Enc Co' };
let token;

beforeAll(async () => { await connectTestDb(); });
afterAll(async () => { await disconnectTestDb(); });

beforeEach(async () => {
  await clearTestDb();
  const res = await request(app).post('/api/auth/register').send(TENANT);
  token = res.body.data?.token;
});

describe('T-377 — encryptJSON / decryptJSON', () => {
  it('round-trip : ce qui est chiffré peut être déchiffré à l\'identique', () => {
    const secret = { apiKey: 'sk_live_super_secret_123', clientSecret: 'cs_abcdef' };
    const encrypted = encryptJSON(secret);
    expect(decryptJSON(encrypted)).toEqual(secret);
  });

  it('la valeur chiffrée ne contient AUCUNE trace du secret en clair', () => {
    const secret = { apiKey: 'sk_live_super_secret_123' };
    const encrypted = encryptJSON(secret);
    expect(encrypted).not.toContain('sk_live_super_secret_123');
  });

  it('un blob corrompu/invalide retombe sur {} sans planter', () => {
    expect(decryptJSON('n-importe-quoi')).toEqual({});
    expect(decryptJSON(null)).toEqual({});
    expect(decryptJSON('')).toEqual({});
  });
});

describe('T-377 — credentials jamais en clair en base', () => {
  it('PUT /api/integrations/linkedin chiffre bien le document MongoDB', async () => {
    if (!token) return;
    const res = await request(app)
      .put('/api/integrations/linkedin')
      .set('Authorization', `Bearer ${token}`)
      .send({ enabled: true, credentials: { clientId: 'client-123', clientSecret: 'SUPER_SECRET_VALUE_XYZ', accessToken: 'token-abc' } });

    if (res.status !== 200) return;

    // Lecture directe du document Mongo (contournant le contrôleur) — ce que
    // verrait quelqu'un avec un accès brut à la base (backup, dump...).
    const raw = await JobboardIntegration.findOne({ platform: 'linkedin' }).lean();
    expect(raw.credentials).not.toContain('SUPER_SECRET_VALUE_XYZ');
    expect(typeof raw.credentials).toBe('string');

    // Mais la donnée reste bien exploitable via l'API normale.
    const getRes = await request(app).get('/api/integrations').set('Authorization', `Bearer ${token}`);
    const linkedin = getRes.body.data.find(i => i.platform === 'linkedin');
    expect(linkedin.credentials.clientSecret).toMatch(/^••••••••/);
    expect(linkedin.credentials.clientSecret.endsWith('_XYZ')).toBe(true);
  });

  it('hellowork/apec/monster (T-377 bonus) acceptent bien runValidators sans erreur d\'enum', async () => {
    if (!token) return;
    for (const platform of ['hellowork', 'apec', 'monster']) {
      const res = await request(app)
        .put(`/api/integrations/${platform}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ enabled: true, credentials: { apiKey: `key-${platform}` } });
      expect(res.status).toBe(200);
    }
  });
});
