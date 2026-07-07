-- Migration 006: Colonnes manquantes critiques sur candidates et clients
-- À exécuter dans l'éditeur SQL de Supabase (https://supabase.com/dashboard → SQL Editor)
--
-- BUG CRITIQUE découvert le 2026-06-30 (audit systématique déclenché par T-245) :
-- CandidateForm.jsx et ClientForm.jsx envoient inconditionnellement (à chaque
-- création ET modification, sans exception) des champs absents du schéma Supabase
-- réel. PostgREST rejette les colonnes inconnues sur insert/update, donc CHAQUE
-- sauvegarde de candidat ou de client échouait en production jusqu'ici — cohérent
-- avec le fait que candidates/clients retournaient systématiquement 0 ligne lors
-- de tous les sondages en lecture seule effectués cette session.
--
-- candidates : 6 champs manquants (videoInterviewUrl, resume, legalBasis,
-- consentDate, dateAdded, lastActivity). resume est l'objet JSONB contenant le CV
-- en base64 ({ fileName, fileSize, fileSizeFormatted, uploadDate, base64Data }) —
-- la RLS de la migration 002 protège cette colonne dès qu'elle existe.
--
-- clients : 6 champs manquants (contact, position — compat 1er contact legacy ;
-- missions — compteur ; createdAt, lastContact ; contracts — array JSONB).

ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS "videoInterviewUrl" text,
  ADD COLUMN IF NOT EXISTS "resume" jsonb,
  ADD COLUMN IF NOT EXISTS "legalBasis" text,
  ADD COLUMN IF NOT EXISTS "consentDate" date,
  ADD COLUMN IF NOT EXISTS "dateAdded" date,
  ADD COLUMN IF NOT EXISTS "lastActivity" date;

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS "contact" text,
  ADD COLUMN IF NOT EXISTS "position" text,
  ADD COLUMN IF NOT EXISTS "missions" integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "createdAt" timestamptz,
  ADD COLUMN IF NOT EXISTS "lastContact" timestamptz,
  ADD COLUMN IF NOT EXISTS "contracts" jsonb NOT NULL DEFAULT '[]'::jsonb;
