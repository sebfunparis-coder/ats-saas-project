-- Migration 009: Table evaluations + critères configurables par mission (T-247)
-- À exécuter dans l'éditeur SQL de Supabase (https://supabase.com/dashboard → SQL Editor)
--
-- Contexte : EvaluationModal.jsx (grille d'évaluation structurée, notation 1-5 avec
-- descripteurs) existait déjà côté UI mais `evaluations` était en state local +
-- localStorage['ats_data'] — aucune table Supabase. Impossible donc de consolider
-- les évaluations de plusieurs recruteurs sur un même candidat (chaque recruteur a
-- son propre navigateur). Cette migration crée la table manquante, suivant le même
-- pattern que 001 (clients/events/tasks/team_members) — RLS dès la création, pas
-- de fenêtre où la table existe sans protection (contrairement à candidates/missions/
-- applications, créées hors migrations versionnées et corrigées a posteriori).

CREATE TABLE IF NOT EXISTS public.evaluations (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id      UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  application_id  UUID,
  candidate_id    UUID,
  candidate_name  TEXT,
  mission_title   TEXT,
  stage           TEXT,
  date            DATE DEFAULT CURRENT_DATE,
  evaluator_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  evaluator_name  TEXT,
  criteria        JSONB DEFAULT '[]'::JSONB,
  global_score    INTEGER DEFAULT 0,
  notes           TEXT,
  recommendation  TEXT DEFAULT 'pending',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_company_evaluations" ON public.evaluations;
CREATE POLICY "users_manage_own_company_evaluations"
  ON public.evaluations FOR ALL
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_evaluations_company_id     ON public.evaluations(company_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_application_id ON public.evaluations(application_id);

-- Critères d'évaluation configurables par mission (sinon fallback sur les 5
-- critères par défaut côté frontend : Communication, Technique, Culture fit,
-- Motivation, Leadership).
ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS "evaluationCriteria" jsonb;
