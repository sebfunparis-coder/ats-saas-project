/**
 * T-381 : la suite de tests backend (T-305) teste à 100% l'API Express/MongoDB
 * legacy, alors que missions/candidats/candidatures/clients/équipe/évaluations
 * sont 100% Supabase Postgres en production — pas une ligne ne testait les
 * policies RLS réellement actives, qui ont pourtant déjà eu 3 régressions
 * critiques documentées sur ce projet (`companies`/`missions` ouvertes en
 * lecture anon, `profiles` en récursion infinie).
 *
 * Ce fichier teste directement le vrai projet Supabase (pas de mock, pas
 * d'émulateur local — ce projet n'en a pas) avec les comptes de test
 * documentés dans `.claude/CLAUDE.md`. Volontairement TENU À L'ÉCART de la
 * suite Vitest unitaire (`npm test`) : ces tests dépendent du réseau, d'un
 * projet Supabase réel et de comptes de test précis — les faire tourner dans
 * la suite rapide/déterministe casserait `npm test` pour quiconque n'a pas
 * ces identifiants (nouveau contributeur, CI sans secrets). Lancer avec
 * `npm run test:rls`. Chaque test nettoie ses propres données après lui.
 *
 * Convention : chaque fonction retourne { name, passed, detail }. `run()`
 * exécute tout, affiche un résumé et sort avec un code non-zéro si un test
 * (autre qu'un skip documenté) échoue.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../../.env');

function loadEnv() {
  const raw = fs.readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const line of raw) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

function freshClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

async function loginAs(email, password) {
  const client = freshClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) return { client: null, user: null, error };
  return { client, user: data.user, error: null };
}

// ── T-381.1 : isolation cross-tenant authentifiée (candidats/missions/clients) ──

async function testCrossTenantIsolation() {
  const name = 'Isolation cross-tenant authentifiée (candidats/missions/clients)';
  const solo = await loginAs('test.solo@ats-demo.fr', 'TestSolo2026!');
  const manager = await loginAs('test.manager@ats-demo.fr', 'TestManager2026!');
  if (solo.error || manager.error) {
    return { name, passed: false, detail: `Login échoué : solo=${solo.error?.message || 'ok'} manager=${manager.error?.message || 'ok'}` };
  }

  const { data: soloProfile } = await solo.client.from('profiles').select('company_id').eq('id', solo.user.id).single();
  const companyIdA = soloProfile.company_id;

  // Company A (solo) crée un candidat privé (status brouillon, jamais public)
  const { data: candidate, error: candErr } = await solo.client.from('candidates').insert({
    name: 'RLS Test Candidate', email: `rls-test-${Date.now()}@example.com`, company_id: companyIdA, position: 'Dev',
  }).select().single();
  if (candErr) return { name, passed: false, detail: `Création candidat (setup) a échoué : ${candErr.message}` };

  try {
    // Company B (manager) tente de lire ce candidat par ID précis
    const { data: readAttempt } = await manager.client.from('candidates').select('*').eq('id', candidate.id);
    if (readAttempt && readAttempt.length > 0) {
      return { name, passed: false, detail: `FUITE RLS : company B a pu lire le candidat de company A (${readAttempt.length} ligne(s) retournée(s))` };
    }

    // Company B tente de le modifier
    const { data: updateAttempt, error: updateErr } = await manager.client.from('candidates')
      .update({ notes: 'hack attempt' }).eq('id', candidate.id).select();
    if (updateAttempt && updateAttempt.length > 0) {
      return { name, passed: false, detail: 'FUITE RLS : company B a pu modifier le candidat de company A' };
    }

    // Company A doit toujours pouvoir lire son propre candidat (non-régression)
    const { data: ownRead, error: ownReadErr } = await solo.client.from('candidates').select('*').eq('id', candidate.id).single();
    if (ownReadErr || !ownRead) {
      return { name, passed: false, detail: `Régression : company A ne peut plus lire son propre candidat (${ownReadErr?.message})` };
    }

    return { name, passed: true, detail: 'Company B ne peut ni lire ni modifier le candidat de company A ; company A garde son accès normal' };
  } finally {
    await solo.client.from('candidates').delete().eq('id', candidate.id);
    await solo.client.auth.signOut();
    await manager.client.auth.signOut();
  }
}

// ── T-381.2 : fonctions SECURITY DEFINER refusent un token invalide/inexistant ──

async function testSecurityDefinerRejectsInvalidToken() {
  const name = 'Fonctions publiques SECURITY DEFINER (partage/suivi/portail client) refusent un token bidon';
  const client = freshClient(); // anon, non authentifié — comme un vrai visiteur public
  const fakeToken = crypto.randomUUID();

  const checks = [
    ['get_shared_candidate', { p_token: fakeToken }],
    ['get_tracking_status', { p_token: fakeToken }],
    ['get_client_portal_data', { p_token: fakeToken }],
  ];

  const leaks = [];
  for (const [fn, args] of checks) {
    const { data, error } = await client.rpc(fn, args);
    // Comportement attendu : soit une erreur, soit un résultat vide/null — jamais de données.
    const leaked = !error && data != null && !(Array.isArray(data) && data.length === 0);
    if (leaked) leaks.push(`${fn} a retourné des données pour un token inexistant : ${JSON.stringify(data).slice(0, 200)}`);
  }

  if (leaks.length > 0) return { name, passed: false, detail: leaks.join(' | ') };
  return { name, passed: true, detail: 'Les 3 fonctions retournent bien null/vide pour un token qui n\'existe pas' };
}

// ── T-381.3 : create_public_tracking_link refuse une candidature/mission qui n'est pas ouverte ──

async function testPublicTrackingLinkScoped() {
  const name = 'create_public_tracking_link refuse une candidature liée à une mission non-ouverte';
  const manager = await loginAs('test.manager@ats-demo.fr', 'TestManager2026!');
  if (manager.error) return { name, passed: false, detail: `Login échoué : ${manager.error.message}` };

  const { data: profile } = await manager.client.from('profiles').select('company_id').eq('id', manager.user.id).single();
  const companyId = profile.company_id;

  const { data: mission, error: missionErr } = await manager.client.from('missions').insert({
    title: 'RLS Test Mission (draft)', company_id: companyId, status: 'draft', contractType: 'CDI', location: 'Paris',
  }).select().single();
  if (missionErr) return { name, passed: false, detail: `Création mission (setup) a échoué : ${missionErr.message}` };

  const { data: candidate, error: candErr } = await manager.client.from('candidates').insert({
    name: 'RLS Test Candidate 2', email: `rls-test2-${Date.now()}@example.com`, company_id: companyId, position: 'Dev',
  }).select().single();
  if (candErr) { await manager.client.from('missions').delete().eq('id', mission.id); return { name, passed: false, detail: `Création candidat (setup) a échoué : ${candErr.message}` }; }

  const { data: application, error: appErr } = await manager.client.from('applications').insert({
    candidate_id: candidate.id, mission_id: mission.id, company_id: companyId, status: 'received',
    candidateName: candidate.name, missionTitle: mission.title,
  }).select().single();
  if (appErr) {
    await manager.client.from('candidates').delete().eq('id', candidate.id);
    await manager.client.from('missions').delete().eq('id', mission.id);
    return { name, passed: false, detail: `Création candidature (setup) a échoué : ${appErr.message}` };
  }

  try {
    const anon = freshClient();
    const { data: token, error: rpcErr } = await anon.rpc('create_public_tracking_link', {
      p_application_id: application.id,
      p_company_id: companyId,
    });
    // Mission en status 'draft' (pas 'open') → la fonction doit refuser (retourner null ou lever une erreur)
    if (!rpcErr && token) {
      return { name, passed: false, detail: `FUITE : un lien de suivi public a été généré pour une candidature liée à une mission 'draft' (token=${token})` };
    }
    return { name, passed: true, detail: 'La fonction refuse bien de générer un lien pour une mission non-ouverte' };
  } finally {
    await manager.client.from('applications').delete().eq('id', application.id);
    await manager.client.from('candidates').delete().eq('id', candidate.id);
    await manager.client.from('missions').delete().eq('id', mission.id);
    await manager.client.auth.signOut();
  }
}

// ── T-381.4 : get_all_companies_superadmin() refuse un compte non-superadmin ──

async function testSuperadminRpcRejectsNonSuperadmin() {
  const name = 'get_all_companies_superadmin() refuse un compte non-superadmin';
  const manager = await loginAs('test.manager@ats-demo.fr', 'TestManager2026!');
  if (manager.error) return { name, passed: false, detail: `Login échoué : ${manager.error.message}` };

  try {
    const { data, error } = await manager.client.rpc('get_all_companies_superadmin');
    if (!error && data) {
      return { name, passed: false, detail: `FUITE : un compte non-superadmin (role='admin') a pu lire toutes les companies (${Array.isArray(data) ? data.length : '?'} lignes)` };
    }
    return { name, passed: true, detail: `Refusé comme attendu : ${error?.message || 'aucune donnée retournée'}` };
  } finally {
    await manager.client.auth.signOut();
  }
}

// ── T-381.5 : isolation Équipier (documenté comme limite de test connue) ──

async function testEquipierIsolation() {
  const name = 'Isolation Équipier (compte test.equipier@ats-demo.fr)';
  const equipier = await loginAs('test.equipier@ats-demo.fr', 'TestEquipier2026!');
  if (equipier.error) {
    return {
      name, passed: null,
      detail: `SKIP — compte de test absent/non fonctionnel (${equipier.error.message}). Limite connue et déjà documentée dans ce projet (mémoire de session 2026-07-06/07) : ce compte n'a jamais été créé avec succès dans la base. Créer ce compte (migration 012_test_accounts.sql, CLAUDE.md) avant de pouvoir vérifier ce point en conditions réelles.`,
    };
  }
  // Si le compte existe un jour : vérifier qu'il ne voit que ses données assignées.
  const { data: apps } = await equipier.client.from('applications').select('id, assignedTo');
  const foreign = (apps || []).filter(a => a.assignedTo && a.assignedTo !== equipier.user.id);
  await equipier.client.auth.signOut();
  if (foreign.length > 0) {
    return { name, passed: false, detail: `FUITE : l'équipier voit ${foreign.length} candidature(s) assignée(s) à quelqu'un d'autre` };
  }
  return { name, passed: true, detail: 'L\'équipier ne voit que ses propres candidatures assignées (ou aucune)' };
}

// ── Runner ────────────────────────────────────────────────────────────────────

async function run() {
  const tests = [
    testCrossTenantIsolation,
    testSecurityDefinerRejectsInvalidToken,
    testPublicTrackingLinkScoped,
    testSuperadminRpcRejectsNonSuperadmin,
    testEquipierIsolation,
  ];

  const results = [];
  for (const test of tests) {
    try {
      results.push(await test());
    } catch (err) {
      results.push({ name: test.name, passed: false, detail: `Exception non gérée : ${err.message}` });
    }
  }

  console.log('\n=== T-381 — Résultats des tests RLS Supabase (projet réel) ===\n');
  let failures = 0;
  let passes = 0;
  let skips = 0;
  for (const r of results) {
    const icon = r.passed === true ? '✅' : r.passed === false ? '❌' : '⏭️ ';
    console.log(`${icon} ${r.name}`);
    console.log(`   ${r.detail}\n`);
    if (r.passed === false) failures++;
    else if (r.passed === true) passes++;
    else skips++;
  }
  console.log(`${passes}/${passes + failures} tests réussis${skips > 0 ? ` (+ ${skips} skip(s) documenté(s))` : ''}`);

  process.exit(failures > 0 ? 1 : 0);
}

run();
