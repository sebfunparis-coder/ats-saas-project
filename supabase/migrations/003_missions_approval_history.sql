-- Migration 003: Colonne approvalHistory pour le workflow d'approbation des missions (T-242)
-- À exécuter dans l'éditeur SQL de Supabase (https://supabase.com/dashboard → SQL Editor)
--
-- Contexte (T-242) : MissionDetail.jsx contient déjà une UI complète de workflow
-- d'approbation (soumettre → approuver/refuser, historique affiché) mais elle appelle
-- l'API Express `/missions/:id/approve` etc., qui opère sur le modèle Mongoose Mission —
-- backend non déployé en production (voir CLAUDE.md section 10) et de toute façon
-- déconnecté des données réelles, puisque les missions affichées dans l'app sont
-- 100% Supabase (table public.missions, voir useAPIMissions). Cette UI est donc
-- non fonctionnelle en pratique. Vérifié par sonde en lecture (clé anon) le 2026-06-30 :
-- la colonne approvalHistory n'existe pas sur public.missions ; status existe déjà et
-- accepte n'importe quelle valeur texte (pas un enum Postgres), donc 'pending_approval'
-- et 'rejected' sont utilisables sans migration supplémentaire sur cette colonne.

ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS "approvalHistory" jsonb NOT NULL DEFAULT '[]'::jsonb;
