-- Migration 011: Portail candidat — suivi de candidature (T-251)
-- À exécuter dans l'éditeur SQL de Supabase (https://supabase.com/dashboard → SQL Editor)
--
-- Découverte en investiguant T-251 : `TrackingPage.jsx` (page /track/:token) existait
-- déjà, mais lisait `localStorage['ats_tracking_' + token]` — écrit uniquement côté
-- recruteur (bouton "Lien de suivi candidat" dans PipelinePage.jsx, sur SON navigateur).
-- Un candidat ouvrant ce lien depuis son email, sur un autre appareil/navigateur, ne
-- pouvait jamais trouver les données (localStorage n'est jamais partagé entre
-- navigateurs) — la fonctionnalité était donc non fonctionnelle dans son usage réel
-- ("depuis l'email de confirmation" implique un appareil potentiellement différent).
--
-- Même pattern que T-249 (share_links) : table dédiée + fonction SECURITY DEFINER,
-- mais volontairement SÉPARÉE de share_links car la portée exposée diffère par
-- nature — le candidat ne doit voir QUE son statut et son propre CV, jamais les
-- notes internes recruteur, scores, évaluations ou avis manager qui transitent par
-- share_links. Garder ces deux primitives non confondables réduit le risque qu'une
-- évolution future de l'une expose accidentellement des données de l'autre.

CREATE TABLE IF NOT EXISTS public.tracking_links (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token           TEXT UNIQUE NOT NULL,
  company_id      UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  application_id  UUID,
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tracking_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_company_tracking_links" ON public.tracking_links;
CREATE POLICY "users_manage_own_company_tracking_links"
  ON public.tracking_links FOR ALL
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- Le candidat (anonyme) doit pouvoir créer son propre lien de suivi au moment
-- de postuler (T-245), avant d'avoir un compte — restreint comme les policies
-- anon de la migration 007 : uniquement pour une candidature liée à une
-- mission status='open' de la même company.
DROP POLICY IF EXISTS "public_can_create_tracking_link" ON public.tracking_links;
CREATE POLICY "public_can_create_tracking_link"
  ON public.tracking_links FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.missions m ON m.id = a.mission_id
      WHERE a.id = tracking_links.application_id
        AND a.company_id = tracking_links.company_id
        AND m.status = 'open'
    )
  );

CREATE INDEX IF NOT EXISTS idx_tracking_links_company_id ON public.tracking_links(company_id);
CREATE INDEX IF NOT EXISTS idx_tracking_links_token       ON public.tracking_links(token);

-- Retourne uniquement statut + CV du candidat lié au token — jamais les notes
-- internes, scores ou évaluations recruteur. RETURN NULL si token invalide.
CREATE OR REPLACE FUNCTION public.get_tracking_status(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_link public.tracking_links;
  v_result jsonb;
BEGIN
  SELECT * INTO v_link FROM public.tracking_links WHERE token = p_token;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'candidateName', a."candidateName",
    'missionTitle', a."missionTitle",
    'clientName', a."clientName",
    'status', a.status,
    'dateApplied', a."dateApplied",
    'resume', c.resume
  ) INTO v_result
  FROM public.applications a
  LEFT JOIN public.candidates c ON c.id = a.candidate_id
  WHERE a.id = v_link.application_id;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_tracking_status(text) TO anon;
