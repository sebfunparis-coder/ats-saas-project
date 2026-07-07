-- Migration 005: Colonnes manquantes startDate/expectedCloseDate/contactClient
-- + maxApplications pour la clôture automatique (T-244)
-- À exécuter dans l'éditeur SQL de Supabase (https://supabase.com/dashboard → SQL Editor)
--
-- Contexte : MissionForm.jsx envoie déjà startDate, expectedCloseDate et contactClient
-- à chaque création/modification de mission (insert/update sur public.missions), mais
-- ces 3 colonnes n'existaient pas en base — vérifié en lecture seule (clé anon) le
-- 2026-06-30, découvert pendant l'implémentation de T-244 (clôture auto par date de
-- clôture prévue, qui a besoin d'expectedCloseDate). PostgREST rejette les colonnes
-- inconnues sur insert/update, donc toute sauvegarde de mission avec une date de début,
-- une date de clôture prévue ou un contact client renseigné échouait probablement déjà
-- en prod — bug préexistant, corrigé ici à l'occasion plutôt que de le laisser ouvert
-- alors que la cause racine (colonnes manquantes) est la même.
--
-- maxApplications (nullable) : seuil optionnel de candidatures avant clôture auto.
-- Si NULL, ce déclencheur ne s'applique pas à la mission (uniquement la date ou le
-- nombre de postes pourvus — voir T-243 — peuvent alors la clôturer).

ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS "startDate" date,
  ADD COLUMN IF NOT EXISTS "expectedCloseDate" date,
  ADD COLUMN IF NOT EXISTS "contactClient" jsonb,
  ADD COLUMN IF NOT EXISTS "maxApplications" integer;
