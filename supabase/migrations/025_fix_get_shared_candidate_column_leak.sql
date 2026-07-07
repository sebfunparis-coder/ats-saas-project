-- T-360 : get_shared_candidate() (migration 010) fait un `to_jsonb(c)`/`to_jsonb(a)`
-- complet — ça sérialise TOUTES les colonnes de candidates/applications, pas
-- seulement celles destinées à un manager externe sans compte. Un manager qui reçoit
-- un lien de partage (7 jours, pour donner un avis sur un candidat) recevait donc
-- aussi en clair : applications.quickNote (notes internes rapides du recruteur),
-- assignedTo/assignedToName (identité du recruteur), testScore, eliminated,
-- screeningAnswers, score IA — rien de tout ça n'est destiné à un tiers externe.
--
-- Corrigé en remplaçant les deux `to_jsonb()` par des `jsonb_build_object()` listant
-- explicitement les seuls champs réellement affichés par SharedCandidatePage.jsx
-- (vérifié par grep exhaustif du composant + vérification des noms de colonnes
-- réels contre le schéma live avant d'écrire cette migration) — même pattern que
-- get_tracking_status()/get_survey_details()/get_invite_details(), qui faisaient
-- déjà ça correctement.
--
-- CREATE OR REPLACE ne casse pas GRANT EXECUTE déjà accordé en migration 010 (les
-- privilèges sur une fonction survivent à un REPLACE tant que la signature — nom +
-- types d'arguments — ne change pas, ce qui est le cas ici).

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

  SELECT jsonb_build_object(
    'name', c.name,
    'position', c.position,
    'email', c.email,
    'phone', c.phone,
    'location', c.location,
    'experience', c.experience,
    'skills', c.skills,
    'avatar', c.avatar,
    'resume', c.resume
  ) INTO v_candidate
  FROM public.candidates c WHERE c.id = v_link.candidate_id;

  SELECT jsonb_build_object(
    'missionTitle', a."missionTitle"
  ) INTO v_application
  FROM public.applications a WHERE a.id = v_link.application_id;

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

-- Vérification recommandée après exécution (SQL Editor) :
--   1. Générer un vrai lien de partage depuis l'app (PipelinePage → candidature →
--      "Générer un lien"), puis : select public.get_shared_candidate('<le token>');
--      -> doit renvoyer candidate{name,position,email,phone,location,experience,
--         skills,avatar,resume} + application{missionTitle} UNIQUEMENT, aucun autre
--         champ (notamment aucun quickNote/assignedTo/testScore/score/eliminated/
--         screeningAnswers).
