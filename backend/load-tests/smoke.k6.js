/**
 * Test de charge smoke — T-308
 * Vérifie que les endpoints principaux répondent correctement
 * sous une charge minimale (1 utilisateur, 30s).
 *
 * Lancer : k6 run load-tests/smoke.k6.js
 * Prérequis : k6 installé (https://k6.io/docs/get-started/installation/)
 *             + variable env BASE_URL et TEST_TOKEN
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('error_rate');
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api';
const TOKEN = __ENV.TEST_TOKEN || '';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% des requêtes < 500ms
    error_rate: ['rate<0.01'],          // Taux d'erreur < 1%
  },
};

const headers = {
  'Content-Type': 'application/json',
  ...(TOKEN && { Authorization: `Bearer ${TOKEN}` }),
};

export default function () {
  // Health check
  let res = http.get(`${BASE_URL}/health`);
  check(res, { 'health: status 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);

  sleep(0.5);

  // Missions list (authentifié)
  if (TOKEN) {
    res = http.get(`${BASE_URL}/missions`, { headers });
    check(res, {
      'missions: status 200': (r) => r.status === 200,
      'missions: has data': (r) => {
        try { return JSON.parse(r.body).success === true; }
        catch { return false; }
      },
    });
    errorRate.add(res.status !== 200);
    sleep(0.5);

    // Candidates list
    res = http.get(`${BASE_URL}/candidates`, { headers });
    check(res, { 'candidates: status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(0.5);

    // Analytics
    res = http.get(`${BASE_URL}/analytics`, { headers });
    check(res, { 'analytics: status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  }

  sleep(1);
}
