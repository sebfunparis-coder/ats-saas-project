-- Migration 015 : Nettoyage schéma clients
-- Découvert lors d'un audit de cohérence formulaire ↔ Supabase (2026-07-03) :
-- `missions_count` et `last_contact` (migration 001, snake_case) ont été
-- remplacés dès la migration 006 par "missions" et "lastContact" (camelCase,
-- entre guillemets) — ClientForm.jsx/ClientsPage.jsx n'utilisent que les
-- versions camelCase. Les colonnes snake_case ne sont plus référencées nulle
-- part dans le frontend : colonnes mortes, supprimées ici.
--
-- `siret`/`size`/`zip_code` existaient déjà (migration 001) mais n'étaient
-- jamais envoyées par ClientForm.jsx (formulaire ne les proposait pas) —
-- désormais câblées, aucune colonne à ajouter pour celles-ci.

ALTER TABLE public.clients
  DROP COLUMN IF EXISTS missions_count,
  DROP COLUMN IF EXISTS last_contact;
