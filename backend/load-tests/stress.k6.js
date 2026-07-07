/**
 * Test de charge stress — T-308
 * Simule 100 utilisateurs simultanés sur les endpoints critiques.
 * Objectif : < 300ms p95 sur les endpoints principaux.
 *
 * Lancer : k6 run load-tests/stress.k6.js
 *          BASE_URL=https://api.votre-domaine.com TEST_TOKEN=... k6 run load-tests/stress.k6.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Métriques personnalisées
const errorRate = new Rate('error_rate');
const missionsLatency = new Trend('missions_latency', true);
const candidatesLatency = new Trend('candidates_latency', true);
const analyticsLatency = new Trend('analytics_latency', true);
const authErrors = new Counter('auth_errors');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api';
const TOKEN = __ENV.TEST_TOKEN || '';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Montée progressive à 10 VUs
    { duration: '1m', target: 50 },    // Montée à 50 VUs
    { duration: '2m', target: 100 },   // Charge cible : 100 VUs simultanés
    { duration: '1m', target: 50 },    // Descente
    { duration: '30s', target: 0 },    // Fin
  ],
  thresholds: {
    // Objectif T-308 : < 300ms p95 sur les endpoints principaux
    http_req_duration: ['p(95)<300', 'p(99)<500'],
    missions_latency: ['p(95)<300'],
    candidates_latency: ['p(95)<300'],
    analytics_latency: ['p(95)<500'],   // Analytics plus lent (agrégation)
    error_rate: ['rate<0.02'],           // < 2% d'erreurs
    auth_errors: ['count<10'],
  },
};

const headers = {
  'Content-Type': 'application/json',
  ...(TOKEN && { Authorization: `Bearer ${TOKEN}` }),
};

export default function () {
  group('Health check', () => {
    const res = http.get(`${BASE_URL}/health`);
    check(res, { 'health OK': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  });

  sleep(0.1);

  if (!TOKEN) {
    authErrors.add(1);
    sleep(1);
    return;
  }

  group('Read missions', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/missions?page=1&limit=20`, { headers });
    missionsLatency.add(Date.now() - start);
    check(res, {
      'missions: 200': (r) => r.status === 200,
      'missions: JSON valide': (r) => { try { return JSON.parse(r.body).success; } catch { return false; } },
    });
    errorRate.add(res.status !== 200);
  });

  sleep(0.1);

  group('Read candidates', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/candidates?page=1&limit=20`, { headers });
    candidatesLatency.add(Date.now() - start);
    check(res, { 'candidates: 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  });

  sleep(0.1);

  group('Read analytics', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/analytics`, { headers });
    analyticsLatency.add(Date.now() - start);
    check(res, { 'analytics: 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  });

  // Lecture des applications (pipeline)
  group('Read applications', () => {
    const res = http.get(`${BASE_URL}/applications?limit=10`, { headers });
    check(res, { 'applications: 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  });

  sleep(Math.random() * 2); // Pause aléatoire 0-2s (comportement réaliste)
}

/**
 * Rapport final affiché dans la console
 */
export function handleSummary(data) {
  return {
    stdout: `
=== RAPPORT TESTS DE CHARGE — ATS Ultimate ===
Durée totale         : ${Math.round(data.state.testRunDurationMs / 1000)}s
VUs max              : ${data.metrics.vus_max?.values?.max || 'N/A'}
Requêtes totales     : ${data.metrics.http_reqs?.values?.count || 0}
Taux d'erreur        : ${((data.metrics.error_rate?.values?.rate || 0) * 100).toFixed(2)}%
p95 global           : ${Math.round(data.metrics.http_req_duration?.values?.['p(95)'] || 0)}ms
p95 missions         : ${Math.round(data.metrics.missions_latency?.values?.['p(95)'] || 0)}ms
p95 candidates       : ${Math.round(data.metrics.candidates_latency?.values?.['p(95)'] || 0)}ms
p95 analytics        : ${Math.round(data.metrics.analytics_latency?.values?.['p(95)'] || 0)}ms

Objectif T-308 : < 300ms p95 → ${(data.metrics.http_req_duration?.values?.['p(95)'] || 0) < 300 ? '✅ ATTEINT' : '❌ DÉPASSÉ'}
===============================================
`,
  };
}
