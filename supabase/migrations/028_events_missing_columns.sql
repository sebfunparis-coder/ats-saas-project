-- Découvert en corrigeant T-367 (validation des types d'événement) : la
-- création d'un événement échoue à 100% en production, quel que soit son
-- type, avec PGRST204 "Could not find the 'candidate_id' column of 'events'".
--
-- Cause : les migrations 001 (CREATE TABLE IF NOT EXISTS ... candidate_id,
-- mission_id ...) et 014 (ADD COLUMN IF NOT EXISTS participants, reminder,
-- email_reminder, notes, visio_url, status) supposaient toutes deux un état de
-- la table `events` qui ne correspond pas à la réalité de cette base — vérifié
-- en lecture directe (clé anon authentifiée) : SEULES `type` et `status`
-- existent parmi les colonnes que ces deux migrations pensaient garantir.
-- `CREATE TABLE IF NOT EXISTS` ne crée les colonnes qu'à la création initiale
-- de la table — si `events` existait déjà avant migration 001 (créée hors
-- migrations versionnées, comme candidates/companies/missions à l'origine),
-- la liste de colonnes de cette instruction n'a jamais été appliquée. Pour
-- migration 014, la cause exacte de sa non-application n'a pas pu être
-- déterminée depuis cet environnement (pas d'accès à l'historique
-- d'exécution SQL) — possiblement jamais exécutée du tout.
--
-- `useAPIEvents()` (frontend/src/core/hooks/useAPIData.js) envoie
-- inconditionnellement `candidate_id`/`mission_id` à la création ET à la
-- modification — sans ces colonnes, AUCUN événement ne peut être créé ni
-- modifié via l'Agenda, quel que soit son type. Vérifié : le CHECK constraint
-- sur `type` (s'il existe) accepte déjà 'email'/'deadline'/'call'/'other' —
-- testé directement, aucun blocage de ce côté une fois candidate_id retiré du
-- payload.

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS candidate_id    UUID,
  ADD COLUMN IF NOT EXISTS mission_id      UUID,
  ADD COLUMN IF NOT EXISTS attendees       JSONB DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS participants    TEXT,
  ADD COLUMN IF NOT EXISTS reminder        INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS email_reminder  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notes           TEXT,
  ADD COLUMN IF NOT EXISTS visio_url       TEXT;

-- Vérification recommandée après exécution : créer un événement de chaque
-- type (interview/meeting/call/email/deadline/other) depuis l'Agenda dans un
-- vrai navigateur — les 6 doivent réussir sans erreur PGRST204.
