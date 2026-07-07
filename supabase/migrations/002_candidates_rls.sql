-- Migration 002: RLS pour candidates (CVs et données PII candidats)
-- À exécuter dans l'éditeur SQL de Supabase (https://supabase.com/dashboard → SQL Editor)
--
-- Contexte (T-218) : la table public.candidates existe déjà en production (créée hors
-- des migrations versionnées de ce dépôt) et stocke notamment le CV de chaque candidat
-- en base64 dans la colonne JSONB `resume`. Contrairement à clients/events/tasks/team_members
-- (voir 001_clients_events_tasks.sql), aucune policy RLS n'était définie en base versionnée
-- pour cette table — un audit en lecture (clé anon, sans authentification, et avec un compte
-- fraîchement créé sans entreprise) n'a renvoyé aucune erreur de permission, ce qui est
-- compatible avec une absence de RLS. Cette migration applique le même pattern d'isolation
-- multi-tenant déjà en place ailleurs, par précaution et cohérence.

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_company_candidates" ON public.candidates;

CREATE POLICY "users_manage_own_company_candidates"
  ON public.candidates FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_candidates_company_id ON public.candidates(company_id);
