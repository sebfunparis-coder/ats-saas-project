-- Migration 023 : colonne `department` manquante sur team_members
-- Trouvée en testant réellement "Nouveau Membre" (TeamPage.jsx) dans un vrai
-- navigateur : TeamMemberForm.jsx envoie inconditionnellement `department`
-- (déjà noté par un fix antérieur côté payload dans useAPIData.js, en supposant
-- la colonne déjà existante), mais la colonne n'a en réalité jamais été créée
-- par aucune migration versionnée. Résultat : PGRST204 "Could not find the
-- 'department' column of 'team_members' in the schema cache" — la création
-- de tout membre d'équipe échouait à 100% en production.

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS department text;
