-- Migration 008: Test de pré-qualification en ligne (T-246)
-- À exécuter dans l'éditeur SQL de Supabase (https://supabase.com/dashboard → SQL Editor)
--
-- testLink (missions) : lien optionnel vers un test externe (Testgorilla, AssessFirst...),
-- configuré par le recruteur, affiché au candidat dans le wizard de candidature (T-245).
-- testScore (applications) : score 0-100 du test, saisi par le recruiteur dans le pipeline
-- une fois le résultat du test externe reçu.

ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS "testLink" text;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS "testScore" integer;
