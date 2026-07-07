-- Migration 018 : enquête de satisfaction post-candidature (T-337)
-- À REVOIR PUIS EXÉCUTER MANUELLEMENT dans le Supabase SQL Editor.
--
-- Contexte : le bouton "Envoyer questionnaire satisfaction" (PipelinePage.jsx)
-- générait un lien `/survey/:token` en stockant les données UNIQUEMENT dans le
-- localStorage du navigateur du recruteur — un candidat ouvrant ce lien depuis
-- son propre appareil ne trouvait jamais rien (même classe de bug que
-- TrackingPage avant T-251), et la route `/survey/:token` n'existait même pas
-- dans le routeur. Cette migration crée la vraie table + les fonctions d'accès
-- public, sur le modèle exact de tracking_links (migration 011) : aucune
-- policy anon directe sur la table, tout accès public passe par des fonctions
-- SECURITY DEFINER qui ne retournent/modifient que la ligne liée au token.

CREATE TABLE IF NOT EXISTS public.satisfaction_surveys (
  token                 TEXT PRIMARY KEY,
  company_id            UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  application_id        UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  candidate_name        TEXT,
  mission_title         TEXT,
  process_rating        SMALLINT,
  communication_rating  SMALLINT,
  nps                   SMALLINT,
  comment               TEXT,
  sent_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answered_at           TIMESTAMPTZ,
  created_by            UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.satisfaction_surveys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "surveys_manage_own_company" ON public.satisfaction_surveys;
CREATE POLICY "surveys_manage_own_company"
  ON public.satisfaction_surveys FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_satisfaction_surveys_application_id ON public.satisfaction_surveys(application_id);
CREATE INDEX IF NOT EXISTS idx_satisfaction_surveys_company_id ON public.satisfaction_surveys(company_id);

-- Lecture publique restreinte : nom du candidat, poste, et si déjà répondu.
-- Jamais les notes/commentaires d'un tiers, jamais d'autres candidatures.
CREATE OR REPLACE FUNCTION public.get_survey_details(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'candidateName', candidate_name,
    'missionTitle', mission_title,
    'alreadyAnswered', answered_at IS NOT NULL
  ) INTO result
  FROM public.satisfaction_surveys
  WHERE token = p_token;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_survey_details(text) TO anon;

-- Écriture publique restreinte : uniquement les colonnes de réponse, uniquement
-- si le questionnaire n'a pas déjà été répondu (une seule soumission par lien).
CREATE OR REPLACE FUNCTION public.submit_survey_response(
  p_token text, p_process smallint, p_communication smallint, p_nps smallint, p_comment text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.satisfaction_surveys
  SET process_rating = p_process,
      communication_rating = p_communication,
      nps = p_nps,
      comment = p_comment,
      answered_at = now()
  WHERE token = p_token AND answered_at IS NULL;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_survey_response(text, smallint, smallint, smallint, text) TO anon;
