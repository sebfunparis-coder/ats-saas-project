-- Migration 019 : invitation d'un équipier par lien tokenisé (T-336)
-- À REVOIR PUIS EXÉCUTER MANUELLEMENT dans le Supabase SQL Editor. Cette
-- migration touche à l'inscription (profiles/team_members) — à tester en
-- staging avant la prod si possible.
--
-- Contexte : le bouton "Inviter un équipier" (AdminPage.jsx → generateInviteLink)
-- stockait le token UNIQUEMENT dans le localStorage du navigateur du Manager,
-- et la route `/invite/:token` n'existait même pas dans le routeur — lien 404
-- garanti. Cette migration crée la vraie table + les fonctions d'acceptation,
-- sur le modèle de share_links/tracking_links (migrations 010/011).

CREATE TABLE IF NOT EXISTS public.invite_links (
  token           TEXT PRIMARY KEY,
  company_id      UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'recruiter',
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at     TIMESTAMPTZ,
  accepted_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.invite_links ENABLE ROW LEVEL SECURITY;

-- Seuls les rôles élevés de la company peuvent créer/lister/révoquer leurs
-- propres liens d'invitation (un Équipier ne peut pas inviter quelqu'un
-- d'autre avec un rôle plus élevé que le sien).
DROP POLICY IF EXISTS "invite_links_manage_own_company" ON public.invite_links;
CREATE POLICY "invite_links_manage_own_company"
  ON public.invite_links FOR ALL
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles me
      WHERE me.id = auth.uid() AND me.role IN ('admin', 'owner', 'manager', 'superadmin')
    )
  );

CREATE INDEX IF NOT EXISTS idx_invite_links_company_id ON public.invite_links(company_id);

-- Lecture publique restreinte : nom de la company + rôle proposé + validité.
-- Jamais d'autre colonne (pas de company_id brut, pas d'identité du créateur).
CREATE OR REPLACE FUNCTION public.get_invite_details(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'companyName', c.name,
    'role', i.role,
    'valid', (i.expires_at > now() AND i.accepted_at IS NULL)
  ) INTO result
  FROM public.invite_links i
  JOIN public.companies c ON c.id = i.company_id
  WHERE i.token = p_token;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_invite_details(text) TO anon;

-- Acceptation : appelée par l'invité UNE FOIS authentifié (auth.uid() non nul —
-- donc après confirmation d'email + connexion, voir AuthContext.jsx). Rattache
-- son profil à la company de l'invitation et crée sa ligne team_members.
-- SECURITY DEFINER : bypasse la RLS de profiles/team_members pour ce cas précis
-- (chicken-and-egg — un profil pas encore rattaché à une company ne pourrait
-- pas s'insérer lui-même dans team_members via les policies normales).
CREATE OR REPLACE FUNCTION public.accept_invite(p_token text, p_first_name text, p_last_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite RECORD;
  v_email TEXT;
  v_team_member_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentification requise';
  END IF;

  SELECT * INTO v_invite FROM public.invite_links WHERE token = p_token FOR UPDATE;

  IF v_invite IS NULL OR v_invite.expires_at <= now() OR v_invite.accepted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Lien d''invitation invalide ou expiré';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();

  INSERT INTO public.profiles (id, company_id, role, first_name, last_name)
  VALUES (auth.uid(), v_invite.company_id, v_invite.role, p_first_name, p_last_name)
  ON CONFLICT (id) DO UPDATE
    SET company_id = EXCLUDED.company_id,
        role = EXCLUDED.role,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name;

  INSERT INTO public.team_members (company_id, profile_id, first_name, last_name, email, role, active)
  VALUES (v_invite.company_id, auth.uid(), p_first_name, p_last_name, v_email, 'recruiter', true)
  RETURNING id INTO v_team_member_id;

  UPDATE public.invite_links SET accepted_at = now(), accepted_by = auth.uid() WHERE token = p_token;

  RETURN json_build_object('companyId', v_invite.company_id, 'teamMemberId', v_team_member_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_invite(text, text, text) TO authenticated;

-- ============================================================================
-- Note (trouvé en cours de route, non traité ici) : les policies profiles de
-- la migration 016 empêchent un utilisateur DÉJÀ rattaché à une company de
-- changer son propre role/company_id (trigger prevent_self_role_escalation),
-- mais un compte tout juste créé (profil inexistant ou company_id encore NULL)
-- peut en théorie s'auto-assigner N'IMPORTE QUEL company_id/role directement
-- via un simple insert/update client, sans passer par ce système d'invitation
-- ni par le flux normal d'inscription (qui, lui, crée sa PROPRE company). Ce
-- garde-fou de "première configuration" mériterait un ticket dédié (ex. n'
-- autoriser l'auto-assignation de company_id que si la company vient d'être
-- créée par ce même utilisateur), plutôt qu'un correctif ad hoc ici.
-- ============================================================================
