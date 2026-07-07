/**
 * Test de charge smoke — Supabase/PostgREST (T-383)
 *
 * `smoke.k6.js`/`stress.k6.js` ciblent l'API Express (`localhost:5000/api`),
 * qui n'est pas déployée en production et ne gère plus missions/candidats/
 * candidatures/clients depuis leur migration vers Supabase (voir CLAUDE.md,
 * section 10 — état réel du déploiement). Un test de charge sur ces routes ne
 * mesure donc pas la charge réelle subie en production, qui frappe l'API
 * PostgREST de Supabase directement depuis le navigateur du client.
 *
 * Ce script teste le vrai chemin de production : auth Supabase (GoTrue) +
 * lecture missions/candidats via PostgREST, avec la clé anon publique (la
 * même que celle exposée dans le bundle JS du frontend) + un JWT utilisateur
 * obtenu via un login réel — reflète ce qu'un navigateur client fait
 * réellement, RLS comprise (contrairement à un test contre Express, qui ne
 * mesure aucune policy RLS).
 *
 * Lancer :
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_ANON_KEY=... \
 *   TEST_EMAIL=test.manager@ats-demo.fr TEST_PASSWORD=TestManager2026! \
 *   k6 run load-tests/supabase-smoke.k6.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('error_rate');

const SUPABASE_URL = __ENV.SUPABASE_URL;
const ANON_KEY = __ENV.SUPABASE_ANON_KEY;
const EMAIL = __ENV.TEST_EMAIL || 'test.manager@ats-demo.fr';
const PASSWORD = __ENV.TEST_PASSWORD || 'TestManager2026!';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    error_rate: ['rate<0.01'],
  },
};

// Login une seule fois par VU (setup), réutilisé pour toutes les itérations —
// reflète un vrai navigateur qui garde sa session, pas un login par requête.
export function setup() {
  if (!SUPABASE_URL || !ANON_KEY) {
    throw new Error('SUPABASE_URL et SUPABASE_ANON_KEY sont requis (voir en-tête du script).');
  }
  const res = http.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    JSON.stringify({ email: EMAIL, password: PASSWORD }),
    { headers: { 'Content-Type': 'application/json', apikey: ANON_KEY } }
  );
  check(res, { 'login: status 200': (r) => r.status === 200 });
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

  // Lecture missions (authentifié, RLS company-scoped — chemin réel du Dashboard/MissionsPage)
  let res = http.get(`${SUPABASE_URL}/rest/v1/missions?select=id,title,status&limit=20`, { headers });
  check(res, { 'missions: status 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  sleep(0.5);

  // Lecture candidats (authentifié, RLS company-scoped — chemin réel de CandidatesPage/CVthèque)
  res = http.get(`${SUPABASE_URL}/rest/v1/candidates?select=id,name,status&limit=20`, { headers });
  check(res, { 'candidates: status 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  sleep(0.5);

  // Lecture candidatures (authentifié — chemin réel du Pipeline Kanban)
  res = http.get(`${SUPABASE_URL}/rest/v1/applications?select=id,status&limit=20`, { headers });
  check(res, { 'applications: status 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  sleep(0.5);

  // Lecture anonyme du portail carrières public (aucune auth — chemin réel de CareersPage)
  res = http.get(`${SUPABASE_URL}/rest/v1/companies_public?select=id,name&limit=5`, {
    headers: { apikey: ANON_KEY },
  });
  check(res, { 'companies_public (anon): status 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);

  sleep(1);
}
