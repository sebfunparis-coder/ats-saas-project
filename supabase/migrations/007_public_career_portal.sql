-- Migration 007: Sécurisation companies/missions + activation table applications
-- + support du portail carrières public (T-245)
-- À exécuter dans l'éditeur SQL de Supabase (https://supabase.com/dashboard → SQL Editor)
--
-- ============================================================================
-- PARTIE 1 — Faille critique découverte (2026-06-30, lecture seule) : ni
-- `companies` ni `missions` n'avaient de RLS. N'importe qui muni de la clé anon
-- publique (déjà exposée côté client dans frontend/.env) pouvait lire TOUTES les
-- companies de TOUS les tenants, colonnes sensibles incluses (email du compte,
-- mrr, payment_method, notes internes) ainsi que toutes les missions de tous les
-- tenants (y compris brouillons/en attente de validation). Même pattern que la
-- faille RLS candidates corrigée en migration 002 (T-218).
-- ============================================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_company" ON public.companies;
CREATE POLICY "users_manage_own_company"
  ON public.companies FOR ALL
  USING (
    id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- Vue publique minimale (id + nom uniquement) pour le portail carrières.
-- Les vues Postgres s'exécutent par défaut avec les privilèges du propriétaire
-- (ici un rôle admin qui contourne la RLS de la table sous-jacente) : la RLS
-- ci-dessus protège donc bien companies, tandis que cette vue expose
-- volontairement et uniquement 2 colonnes non sensibles à anon.
CREATE OR REPLACE VIEW public.companies_public AS
SELECT id, name FROM public.companies;

GRANT SELECT ON public.companies_public TO anon;

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_company_missions" ON public.missions;
CREATE POLICY "users_manage_own_company_missions"
  ON public.missions FOR ALL
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- Les offres "open" sont légitimement publiques (portail carrières) ; les
-- brouillons/en attente de validation/fermées restent réservés à la company.
DROP POLICY IF EXISTS "public_can_view_open_missions" ON public.missions;
CREATE POLICY "public_can_view_open_missions"
  ON public.missions FOR SELECT
  TO anon
  USING (status = 'open');

-- ============================================================================
-- PARTIE 2 — Table applications : colonnes manquantes (dénormalisées, utilisées
-- partout dans l'UI pipeline : KanbanCard, CandidateDetail, MissionDetail...),
-- activation RLS (jamais faite, table créée hors migrations versionnées comme
-- candidates/missions), + INSERT public restreint aux missions ouvertes pour
-- que le formulaire de candidature du portail carrières puisse écrire.
-- ============================================================================

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS "candidateName" text,
  ADD COLUMN IF NOT EXISTS "candidateAvatar" text,
  ADD COLUMN IF NOT EXISTS "missionTitle" text,
  ADD COLUMN IF NOT EXISTS "clientName" text,
  ADD COLUMN IF NOT EXISTS "dateApplied" date,
  ADD COLUMN IF NOT EXISTS "screeningAnswers" jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "eliminated" boolean NOT NULL DEFAULT false;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_company_applications" ON public.applications;
CREATE POLICY "users_manage_own_company_applications"
  ON public.applications FOR ALL
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "public_can_apply_applications" ON public.applications;
CREATE POLICY "public_can_apply_applications"
  ON public.applications FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.missions m
      WHERE m.id = applications.mission_id
        AND m.company_id = applications.company_id
        AND m.status = 'open'
    )
  );

CREATE INDEX IF NOT EXISTS idx_applications_company_id   ON public.applications(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_mission_id   ON public.applications(mission_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON public.applications(candidate_id);

-- ============================================================================
-- PARTIE 3 — candidates : INSERT public restreint (en plus de la policy "ALL"
-- déjà en place pour les membres authentifiés depuis la migration 002), pour
-- que le formulaire public puisse créer le candidat avant la candidature.
-- ============================================================================

DROP POLICY IF EXISTS "public_can_apply_candidates" ON public.candidates;
CREATE POLICY "public_can_apply_candidates"
  ON public.candidates FOR INSERT
  TO anon
  WITH CHECK (
    company_id IN (SELECT company_id FROM public.missions WHERE status = 'open')
  );

-- ============================================================================
-- PARTIE 4 — Questions de pré-sélection configurables par mission (T-245),
-- éliminatoires ou non. Tableau JSONB : [{ id, question, type, eliminatory,
-- expectedAnswer? }].
-- ============================================================================

ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS "screeningQuestions" jsonb NOT NULL DEFAULT '[]'::jsonb;
