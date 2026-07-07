-- Migration 022 : URGENT — 3 colonnes manquantes supplémentaires sur missions
-- (T-351), qui cassaient RÉELLEMENT la création de mission en conditions
-- réelles (testé en navigateur le 2026-07-06, après avoir corrigé T-349) :
-- erreur PostgREST PGRST204 "Could not find the 'contractType' column of
-- 'missions' in the schema cache".
--
-- Contexte : MissionForm.jsx envoie inconditionnellement `contractType`,
-- `workMode`, `weeklyHours` dans le payload de création/mise à jour (valeurs
-- par défaut 'CDI'/'hybride'/'35 heures'), mais ces 3 colonnes n'ont jamais eu
-- de migration versionnée. Contrairement à `allowedRecruiters`/`assignedTo`
-- (T-349, migration 016), découvertes par vérification ciblée des colonnes
-- utilisées par mes propres tickets, celles-ci n'ont été découvertes qu'en
-- testant réellement le flux de création de mission dans le navigateur —
-- rappel qu'une vérification de colonnes ciblée sur QUELQUES champs ne
-- garantit pas l'absence d'autres colonnes manquantes ailleurs dans le même
-- formulaire.

ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS "contractType" text,
  ADD COLUMN IF NOT EXISTS "workMode" text,
  ADD COLUMN IF NOT EXISTS "weeklyHours" text;
