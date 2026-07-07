-- T-424 (suite) : découvert en vérifiant que la candidature publique fonctionne
-- de bout en bout — la génération automatique du lien de suivi candidat
-- (createTrackingLink, T-251, appelée juste après une candidature publique
-- réussie) échoue avec 401 pour un visiteur anonyme.
--
-- Cause : la policy `public_can_create_tracking_link` (migration 011) valide
-- l'insertion via `EXISTS (SELECT 1 FROM applications a JOIN missions m ...)` —
-- cette sous-requête doit pouvoir LIRE `applications` en tant que `anon`. Or
-- `applications` n'a AUCUNE policy SELECT pour anon (seulement une policy
-- INSERT) : la sous-requête ne retourne donc jamais de ligne pour anon, quelle
-- que soit la candidature réelle, et la policy échoue systématiquement.
--
-- Contrairement au cas T-424 principal (candidates/applications), on ne peut
-- PAS corriger ça en retirant simplement un `.select()` — ici la policy elle-
-- même a besoin de lire `applications` pour valider la condition. Et on ne peut
-- PAS non plus ajouter une policy SELECT anon large sur `applications` : ça
-- exposerait TOUTES les candidatures liées à une mission ouverte (nom, email,
-- notes de screening...) à n'importe quel visiteur anonyme — un nouveau problème
-- de confidentialité pire que celui qu'on corrige.
--
-- Solution : une fonction SECURITY DEFINER dédiée (même pattern que
-- get_shared_candidate/accept_invite) qui valide la condition en bypassant la
-- RLS pour sa propre lecture interne, puis insère elle-même le tracking_link —
-- sans jamais exposer `applications` en lecture à anon.

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

  INSERT INTO public.tracking_links (token, company_id, application_id)
  VALUES (v_token, p_company_id, p_application_id);

  RETURN v_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_public_tracking_link(uuid, uuid) TO anon;

-- Vérification recommandée après exécution : soumettre une vraie candidature
-- depuis /careers/:companyId/job/:jobId dans un navigateur et confirmer que le
-- lien de suivi s'affiche (plus d'erreur 401 sur POST tracking_links dans la
-- console réseau).
