-- Migration 014 : Agenda → Supabase (au lieu du backend Express/MongoDB mort)
-- La table public.events existe déjà depuis la migration 001 (RLS déjà en
-- place), mais le frontend appelait jusqu'ici /api/events (Express, non
-- déployé en production) — l'Agenda ne persistait donc réellement aucune
-- donnée en prod. On complète le schéma pour matcher tous les champs déjà
-- utilisés par EventForm.jsx (participants, reminder, email_reminder, notes,
-- visio_url, status) et on élargit le CHECK sur `type` pour inclure 'call',
-- 'email' et 'other' (déjà proposés dans le formulaire mais rejetés par la
-- contrainte d'origine).

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS participants   TEXT,
  ADD COLUMN IF NOT EXISTS reminder       INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS email_reminder BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notes          TEXT,
  ADD COLUMN IF NOT EXISTS visio_url      TEXT,
  ADD COLUMN IF NOT EXISTS status         TEXT DEFAULT 'scheduled';

ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_type_check;
ALTER TABLE public.events ADD CONSTRAINT events_type_check
  CHECK (type IN ('interview','meeting','deadline','phone_screen','reminder','task','call','email','other'));
