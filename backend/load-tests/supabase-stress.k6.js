/**
 * Test de charge stress — Supabase/PostgREST (T-409, complément de T-383)
 *
 * `stress.k6.js` monte jusqu'à 100 VUs contre l'API Express (`localhost:5000/api`)
 * — backend non déployé en production (cf. CLAUDE.md section 10) et qui ne gère
 * plus missions/candidats/candidatures depuis leur migration vers Supabase. Un
 * test de charge contre cette API ne représente donc PAS la charge réelle
 * subie en production, qui frappe directement l'API PostgREST de Supabase
 * depuis le navigateur de chaque client (RLS comprise — un test contre
 * Express ne mesure aucune policy RLS, potentiellement le facteur de latence
 * le plus significatif en charge réelle).
 *
 * Ce script réplique le même profil de charge (montée à 100 VUs) mais contre
 * le vrai chemin de production.
 *
 * Lancer :
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_ANON_KEY=... \
 *   TEST_EMAIL=test.manager@ats-demo.fr TEST_PASSWORD=TestManager2026! \
 *   k6 run load-tests/supabase-stress.k6.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('error_rate');
const missionsLatency = new Trend('missions_latency', true);
const candidatesLatency = new Trend('candidates_latency', true);
const applicationsLatency = new Trend('applications_latency', true);

const SUPABASE_URL = __ENV.SUPABASE_URL;
const ANON_KEY = __ENV.SUPABASE_ANON_KEY;
const EMAIL = __ENV.TEST_EMAIL || 'test.manager@ats-demo.fr';
const PASSWORD = __ENV.TEST_PASSWORD || 'TestManager2026!';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    // Mêmes objectifs que stress.k6.js (T-308), appliqués au vrai chemin de prod.
    http_req_duration: ['p(95)<300', 'p(99)<500'],
    missions_latency: ['p(95)<300'],
    candidates_latency: ['p(95)<300'],
    applications_latency: ['p(95)<300'],
    error_rate: ['rate<0.02'],
  },
};

// Login une seule fois (setup, exécuté avant la montée en charge) — reflète
// une vraie session navigateur qui garde son JWT, pas un login par requête ;
// évite aussi de marteler l'API Auth (GoTrue) avec 100 logins simultanés.
export function setup() {
  if (!SUPABASE_URL || !ANON_KEY) {
    throw new Error('SUPABASE_URL et SUPABASE_ANON_KEY sont requis (voir en-tête du script).');
  }
  const res = http.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    JSON.stringify({ email: EMAIL, password: PASSWORD }),
    { headers: { 'Content-Type': 'application/json', apikey: ANON_KEY } }
  );
  const body = JSON.parse(res.body);
  if (!body.access_token) throw new Error(`Login échoué : ${res.status} ${res.body}`);
  return { accessToken: body.access_token };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    apikey: ANON_KEY,
    Authorization: `Bearer ${data.accessToken}`,
  };

  group('Read missions (RLS company-scoped)', () => {
    const start = Date.now();
    const res = http.get(`${SUPABASE_URL}/rest/v1/missions?select=id,title,status&limit=20`, { headers });
    missionsLatency.add(Date.now() - start);
    check(res, { 'missions: 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  });

  sleep(0.1);

  group('Read candidates (RLS company-scoped)', () => {
    const start = Date.now();
    const res = http.get(`${SUPABASE_URL}/rest/v1/candidates?select=id,name,status&limit=20`, { headers });
    candidatesLatency.add(Date.now() - start);
    check(res, { 'candidates: 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  });

  sleep(0.1);

  group('Read applications (pipeline)', () => {
    const start = Date.now();
    const res = http.get(`${SUPABASE_URL}/rest/v1/applications?select=id,status&limit=20`, { headers });
    applicationsLatency.add(Date.now() - start);
    check(res, { 'applications: 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  });

  sleep(Math.random() * 2); // Pause aléatoire 0-2s (comportement réaliste)
}

export function handleSummary(data) {
  return {
    stdout: `
=== RAPPORT TESTS DE CHARGE — Supabase/PostgREST (T-409) ===
Durée totale         : ${Math.round(data.state.testRunDurationMs / 1000)}s
VUs max              : ${data.metrics.vus_max?.values?.max || 'N/A'}
Requêtes totales     : ${data.metrics.http_reqs?.values?.count || 0}
Taux d'erreur        : ${((data.metrics.error_rate?.values?.rate || 0) * 100).toFixed(2)}%
p95 global           : ${Math.round(data.metrics.http_req_duration?.values?.['p(95)'] || 0)}ms
p95 missions         : ${Math.round(data.metrics.missions_latency?.values?.['p(95)'] || 0)}ms
p95 candidates       : ${Math.round(data.metrics.candidates_latency?.values?.['p(95)'] || 0)}ms
p95 applications     : ${Math.round(data.metrics.applications_latency?.values?.['p(95)'] || 0)}ms

Objectif T-308/T-409 : < 300ms p95 → ${(data.metrics.http_req_duration?.values?.['p(95)'] || 0) < 300 ? '✅ ATTEINT' : '❌ DÉPASSÉ'}
===============================================
`,
  };
}
