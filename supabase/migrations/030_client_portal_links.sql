-- T-373 : ClientPortalPage.jsx (portail client public via lien tokenisé)
-- souffrait du même bug que TrackingPage.jsx avant son correctif T-251 —
-- `handleGeneratePortal()` (ClientsPage.jsx) écrit le contenu du portail dans
-- `localStorage['ats_client_portal_' + token]` SUR LE NAVIGATEUR DU RECRUTEUR,
-- et `ClientPortalPage.jsx` le relit dans `localStorage` DU NAVIGATEUR DE CELUI
-- QUI OUVRE LE LIEN — jamais partagé entre navigateurs/appareils. Un recruteur
-- génère le lien, l'envoie par email à son client ; le client l'ouvre sur son
-- propre ordinateur → localStorage vide → "Portail introuvable" à chaque fois.
--
-- Corrigé avec le même pattern que tracking_links (migration 011) : table
-- dédiée + fonction SECURITY DEFINER qui valide le token et ne retourne QUE
-- les données strictement nécessaires (nom du client, missions liées, statut,
-- progression, compteurs de pipeline PAR STATUT — jamais les candidats
-- individuels/leurs coordonnées, notes internes, ou informations d'autres
-- clients). Table séparée de client_portal_links/share_links/tracking_links
-- (même principe déjà appliqué : portées d'exposition différentes par nature,
-- ne jamais les confondre).

CREATE TABLE IF NOT EXISTS public.client_portal_links (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token       TEXT UNIQUE NOT NULL,
  company_id  UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id   UUID,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.client_portal_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_company_client_portal_links" ON public.client_portal_links;
CREATE POLICY "users_manage_own_company_client_portal_links"
  ON public.client_portal_links FOR ALL
  USING (
    company_id = public.my_company_id()
  );

-- Pas de policy anon sur cette table : tout accès public passe par la
-- fonction ci-dessous, jamais par une lecture directe.

CREATE INDEX IF NOT EXISTS idx_client_portal_links_token ON public.client_portal_links(token);

CREATE OR REPLACE FUNCTION public.get_client_portal_data(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_link public.client_portal_links;
  v_client_name text;
  v_missions jsonb;
BEGIN
  SELECT * INTO v_link FROM public.client_portal_links WHERE token = p_token AND expires_at > now();
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT name INTO v_client_name FROM public.clients WHERE id = v_link.client_id;
  IF v_client_name IS NULL THEN
    RETURN NULL;
  END IF;

  -- Missions liées à ce client (par nom, seule liaison existante — `missions`
  -- n'a pas de FK client_id), avec compteurs de pipeline par statut. Aucune
  -- donnée candidat individuelle n'est jamais exposée, uniquement des compteurs.
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', m.id,
      'title', m.title,
      'status', m.status,
      'location', m.location,
      'contractType', m."contractType",
      'progress', COALESCE(m.progress, 0),
      'stages', (
        SELECT COALESCE(jsonb_object_agg(a.status, a.cnt), '{}'::jsonb)
        FROM (
          SELECT status, COUNT(*) AS cnt
          FROM public.applications
          WHERE mission_id = m.id
          GROUP BY status
        ) a
      )
    )
  ), '[]'::jsonb) INTO v_missions
  FROM public.missions m
  WHERE m.client = v_client_name AND m.company_id = v_link.company_id;

  RETURN jsonb_build_object(
    'clientName', v_client_name,
    'generatedAt', v_link.created_at,
    'missions', v_missions
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_client_portal_data(text) TO anon;

-- Vérification recommandée après exécution : générer un vrai lien depuis
-- ClientsPage.jsx ("Générer un portail client"), l'ouvrir dans une fenêtre de
-- navigation privée (simulateur de "navigateur du client") et confirmer que
-- le portail affiche bien les missions du client, sans "Portail introuvable".
