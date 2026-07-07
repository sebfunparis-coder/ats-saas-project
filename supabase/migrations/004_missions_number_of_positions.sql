-- Migration 004: Colonne numberOfPositions pour les offres multi-postes (T-243)
-- À exécuter dans l'éditeur SQL de Supabase (https://supabase.com/dashboard → SQL Editor)
--
-- Contexte (T-243) : permet de définir combien de postes une mission doit pourvoir.
-- Le pipeline compte les candidatures au statut 'hired' liées à la mission et la
-- clôture automatiquement (status = 'closed') quand ce nombre est atteint.
-- Vérifié en lecture seule (clé anon) le 2026-06-30 : la colonne n'existait pas.

ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS "numberOfPositions" integer NOT NULL DEFAULT 1;
