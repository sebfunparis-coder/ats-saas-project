-- Migration 017 : colonne "quickNote" sur applications (T-331)
-- À REVOIR PUIS EXÉCUTER MANUELLEMENT dans le Supabase SQL Editor.
--
-- Contexte : `quickNote` (notes rapides depuis la carte Kanban, PipelinePage.jsx
-- → KanbanCard.jsx) est envoyé par le frontend à chaque saisie mais n'a jamais
-- eu de migration versionnée, contrairement à tous les autres champs ajoutés à
-- `applications` (candidateName, missionTitle, testScore, screeningAnswers...).
-- Si la colonne n'existe pas déjà en base (ajoutée hors migrations versionnées),
-- toute sauvegarde de note rapide échoue silencieusement côté PostgREST (42703).
-- `ADD COLUMN IF NOT EXISTS` est sans effet si la colonne existe déjà.

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS "quickNote" text;
