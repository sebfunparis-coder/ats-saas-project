-- Migration 033 : ajoute une expiration à tracking_links (T-418)
--
-- Contexte : `share_links` (010) et `invite_links` (019) expirent après 7
-- jours, mais `tracking_links` (011) n'a jamais eu de colonne `expires_at` —
-- un lien de suivi candidat (donnant accès au CV + statut de candidature)
-- reste donc valide indéfiniment. Incohérence de design signalée par
-- l'audit ; pas d'exploitation active connue (le token est un UUID v4
-- non énumérable), mais un défaut de minimisation RGPD réel : plus le lien
-- reste valide, plus la fenêtre d'exposition d'une donnée personnelle (CV)
-- via un accès non authentifié est grande.
--
-- Durée choisie délibérément différente de share_links/invite_links (7 jours) :
-- ces deux-là sont des liens d'ACTION ponctuelle (un manager qui doit donner
-- un avis rapidement, un équipier qui doit accepter une invitation) — 7 jours
-- est cohérent avec une action attendue à court terme. `tracking_links` sert
-- au candidat à SUIVRE l'avancement de sa candidature sur toute la durée du
-- process de recrutement, qui peut légitimement s'étaler sur plusieurs
-- semaines voire mois (cf. `missions.expectedCloseDate`) — un lien qui expire
-- en 7 jours casserait la fonctionnalité pour son usage normal. Choix retenu :
-- 90 jours, même ordre de grandeur que la rétention déjà utilisée ailleurs
-- dans ce projet pour un compromis similaire (WebhookLog, bloc 5 — "long mais
-- borné" plutôt qu'illimité).

ALTER TABLE public.tracking_links ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Backfill : les liens déjà émis gardent 90 jours à compter de LEUR création
-- (pas de la date d'exécution de cette migration), pour ne pas invalider
-- immédiatement un lien légitimement en cours d'usage.
UPDATE public.tracking_links
SET expires_at = created_at + INTERVAL '90 days'
WHERE expires_at IS NULL;

ALTER TABLE public.tracking_links ALTER COLUMN expires_at SET DEFAULT (now() + INTERVAL '90 days');
ALTER TABLE public.tracking_links ALTER COLUMN expires_at SET NOT NULL;

-- get_tracking_status() : un token expiré doit se comporter comme un token
-- invalide (RETURN NULL — TrackingPage.jsx affiche déjà "Lien introuvable"
-- dans ce cas, aucun changement frontend nécessaire).
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
  SELECT * INTO v_link FROM public.tracking_links WHERE token = p_token AND expires_at > now();
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

-- create_public_tracking_link() (migration 027) : l'INSERT fournit désormais
-- explicitement expires_at (le DEFAULT posé ci-dessus l'aurait de toute façon
-- couvert, explicite par cohérence avec le reste de cette migration).
-- Aucun changement de logique de validation.
CREATE OR REPLACE FUNCTION public.create_public_tracking_link(p_application_id uuid, p_company_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valid boolean;
  v_token text;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.missions m ON m.id = a.mission_id
    WHERE a.id = p_application_id
      AND a.company_id = p_company_id
      AND m.status = 'open'
  ) INTO v_valid;

  IF NOT v_valid THEN
    RETURN NULL;
  END IF;

  v_token := gen_random_uuid()::text;

  INSERT INTO public.tracking_links (token, company_id, application_id, expires_at)
  VALUES (v_token, p_company_id, p_application_id, now() + INTERVAL '90 days');

  RETURN v_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_tracking_status(text) TO anon;
GRANT EXECUTE ON FUNCTION public.create_public_tracking_link(uuid, uuid) TO anon;
