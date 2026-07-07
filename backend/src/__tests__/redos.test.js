/**
 * T-366 : les filtres `position`/`location`/`industry`/`q` construisaient
 * `new RegExp(inputUtilisateur, 'i')` sans échapper les métacaractères —
 * un pattern à backtracking catastrophique pouvait bloquer un thread MongoDB
 * de façon disproportionnée (ReDoS).
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { escapeRegExp } from '../utils/regexHelpers.js';
import { connectTestDb, disconnectTestDb, clearTestDb } from './helpers/testDb.js';

describe('T-366 — escapeRegExp', () => {
  it('échappe tous les métacaractères regex standards', () => {
    expect(escapeRegExp('a.b*c+d?e^f$g{h}i(j)k|l[m]n\\o')).toBe(
      'a\\.b\\*c\\+d\\?e\\^f\\$g\\{h\\}i\\(j\\)k\\|l\\[m\\]n\\\\o'
    );
  });

  it('un pattern à backtracking catastrophique devient une chaîne littérale inoffensive', () => {
    const malicious = '(a+)+$';
    const escaped = escapeRegExp(malicious);
    const re = new RegExp(escaped, 'i');
    // Ne doit matcher QUE la sous-chaîne littérale "(a+)+$", jamais interpréter
    // les quantificateurs imbriqués.
    expect(re.test('(a+)+$')).toBe(true);
    expect(re.test('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!')).toBe(false);
  });

  it('une chaîne normale sans métacaractères est inchangée', () => {
    expect(escapeRegExp('Développeur Full Stack')).toBe('Développeur Full Stack');
  });
});

const TENANT = { firstName: 'Alice', lastName: 'R', email: 'alice@redos-test.com', password: 'TestPass123!', company: 'ReDoS Tenant' };
let token;

beforeAll(async () => { await connectTestDb(); });
afterAll(async () => { await disconnectTestDb(); });

beforeEach(async () => {
  await clearTestDb();
  const res = await request(app).post('/api/auth/register').send(TENANT);
  token = res.body.data?.token;
});

describe('T-366 — GET /api/candidates?position= reste rapide face à un pattern à backtracking catastrophique', () => {
  it('répond en un temps raisonnable (< 2s) et ne plante pas', async () => {
    if (!token) return; // skip si mock mode

    const maliciousPattern = '(a+)+$'; // classique ReDoS catastrophic backtracking
    const start = Date.now();
    const res = await request(app)
      .get('/api/candidates')
      .query({ position: maliciousPattern })
      .set('Authorization', `Bearer ${token}`);
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(2000);
  });
});

describe('T-400 — GET /api/admin/audit-logs?userEmail= reste rapide face à un pattern à backtracking catastrophique', () => {
  it('répond en un temps raisonnable (< 2s) et ne plante pas', async () => {
    if (!token) return; // skip si mock mode

    const maliciousPattern = '(a+)+$';
    const start = Date.now();
    const res = await request(app)
      .get('/api/admin/audit-logs')
      .query({ userEmail: maliciousPattern })
      .set('Authorization', `Bearer ${token}`);
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(2000);
  });
});
