-- Migration 010: Partage candidat avec manager via lien sécurisé (T-249)
-- À exécuter dans l'éditeur SQL de Supabase (https://supabase.com/dashboard → SQL Editor)
--
-- Un manager sans compte doit pouvoir consulter un profil candidat et laisser un
-- avis via un lien tokenisé (7 jours). Plutôt que d'affaiblir les RLS existantes
-- de candidates/applications pour anon (ce qui exposerait TOUTES les lignes, pas
-- seulement celle visée par le token), l'accès public passe exclusivement par 2
-- fonctions RPC SECURITY DEFINER qui valident le token côté serveur et ne
-- retournent/modifient que les données strictement liées à ce token précis.

CREATE TABLE IF NOT EXISTS public.share_links (
  id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token                  TEXT UNIQUE NOT NULL,
  company_id             UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  application_id         UUID,
  candidate_id           UUID,
  created_by             UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at             TIMESTAMPTZ NOT NULL,
  review_text            TEXT,
  review_recommendation  TEXT,
  reviewer_name          TEXT,
  reviewed_at            TIMESTAMPTZ,
  created_at             TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_company_share_links" ON public.share_links;
CREATE POLICY "users_manage_own_company_share_links"
  ON public.share_links FOR ALL
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- Pas de policy pour anon sur cette table : tout accès public passe par les
-- fonctions ci-dessous.

CREATE INDEX IF NOT EXISTS idx_share_links_company_id ON public.share_links(company_id);
CREATE INDEX IF NOT EXISTS idx_share_links_token       ON public.share_links(token);

-- Retourne le profil candidat + la candidature liés à un token valide (non expiré),
-- ou NULL si le token est invalide/expiré. Champs résume volontairement inclus
-- (le manager doit pouvoir consulter le CV) mais aucune autre ligne candidates/
-- applications n'est exposée — uniquement celle référencée par ce token précis.
CREATE OR REPLACE FUNCTION public.get_shared_candidate(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_link public.share_links;
  v_candidate jsonb;
  v_application jsonb;
BEGIN
  SELECT * INTO v_link FROM public.share_links WHERE token = p_token AND expires_at > now();
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT to_jsonb(c) INTO v_candidate FROM public.candidates c WHERE c.id = v_link.candidate_id;
  SELECT to_jsonb(a) INTO v_application FROM public.applications a WHERE a.id = v_link.application_id;

  RETURN jsonb_build_object(
    'candidate', v_candidate,
    'application', v_application,
    'expiresAt', v_link.expires_at,
    'review', jsonb_build_object(
      'text', v_link.review_text,
      'recommendation', v_link.review_recommendation,
      'reviewerName', v_link.reviewer_name,
      'reviewedAt', v_link.reviewed_at
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_shared_candidate(text) TO anon;

-- Enregistre l'avis du manager pour un token valide (non expiré). Ne touche à
-- aucune autre ligne ni aucune autre table.
CREATE OR REPLACE FUNCTION public.submit_share_review(p_token text, p_review_text text, p_recommendation text, p_reviewer_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.share_links
  SET review_text = p_review_text,
      review_recommendation = p_recommendation,
      reviewer_name = p_reviewer_name,
      reviewed_at = now()
  WHERE token = p_token AND expires_at > now();
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_share_review(text, text, text, text) TO anon;
