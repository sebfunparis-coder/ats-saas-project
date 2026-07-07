-- Migration 035 : lien de disponibilité candidat — vraie table Supabase (T-426)
--
-- Contexte : découvert en corrigeant T-414 (token Math.random() du même
-- générateur) — `CalendarPage.jsx` (bouton "🔗 Lien de dispo") stocke les
-- créneaux UNIQUEMENT dans le localStorage du navigateur du recruteur, et
-- `AvailabilityPage.jsx` (route publique `/availability/:token`) lit ce même
-- localStorage. Un candidat ouvrant ce lien depuis son propre appareil (le
-- seul vrai destinataire) ne trouve jamais la donnée — "Lien introuvable" à
-- 100%, confirmé par un test réel (deux contextes navigateur isolés). Même
-- classe de bug déjà corrigée 4 fois sur ce projet (tracking_links T-251,
-- share_links/client_portal_links T-373, invite_links/satisfaction_surveys
-- T-336/337) — jamais appliquée à cette feature-ci jusqu'ici.
--
-- Durée de validité : 30 jours — plus court que tracking_links (90j, suivi
-- sur toute la durée d'un process de recrutement) mais plus long que
-- share_links/invite_links (7j, action ponctuelle attendue immédiatement) :
-- un lien de dispo sert à programmer un entretien dans un horizon proche
-- mais pas nécessairement sous 7 jours (relances, plannings chargés).

CREATE TABLE IF NOT EXISTS public.availability_links (
  token           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  recruiter_name  TEXT,
  note            TEXT,
  duration        INTEGER NOT NULL DEFAULT 60,
  -- slots: [{ date: 'YYYY-MM-DD', time: 'HH:MM', bookedBy: { name, email } | null }]
  slots           JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

ALTER TABLE public.availability_links ENABLE ROW LEVEL SECURITY;

-- Le recruteur authentifié gère ses propres liens (création directe, RLS
-- company-scoped standard — pas besoin de fonction SECURITY DEFINER pour la
-- création, contrairement au cas anon de tracking_links/T-424).
DROP POLICY IF EXISTS "users_manage_own_company_availability_links" ON public.availability_links;
CREATE POLICY "users_manage_own_company_availability_links"
  ON public.availability_links FOR ALL
  USING (company_id = public.my_company_id());

CREATE INDEX IF NOT EXISTS idx_availability_links_company_id ON public.availability_links(company_id);

-- Lecture publique restreinte : jamais company_id brut, jamais l'identité du
-- créateur — uniquement ce dont AvailabilityPage.jsx a besoin pour afficher
-- les créneaux disponibles.
CREATE OR REPLACE FUNCTION public.get_availability_link(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.availability_links;
BEGIN
  SELECT * INTO v_row FROM public.availability_links WHERE token = p_token AND expires_at > now();
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'recruiterName', v_row.recruiter_name,
    'note', v_row.note,
    'duration', v_row.duration,
    'slots', v_row.slots
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_availability_link(uuid) TO anon;

-- Réservation atomique d'un créneau par le candidat (anonyme). `FOR UPDATE`
-- verrouille la ligne pendant la transaction pour éviter qu'un même créneau
-- soit réservé deux fois par deux candidats simultanément (race condition).
-- Retourne false si le token est invalide/expiré, si aucun créneau ne
-- correspond à (date, time), ou si ce créneau est déjà réservé.
CREATE OR REPLACE FUNCTION public.book_availability_slot(
  p_token uuid, p_date text, p_time text, p_name text, p_email text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slots jsonb;
  v_new_slots jsonb := '[]'::jsonb;
  v_slot jsonb;
  v_matched boolean := false;
  v_already_booked boolean := false;
BEGIN
  SELECT slots INTO v_slots
  FROM public.availability_links
  WHERE token = p_token AND expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  FOR v_slot IN SELECT * FROM jsonb_array_elements(v_slots)
  LOOP
    IF (v_slot ->> 'date') = p_date AND (v_slot ->> 'time') = p_time THEN
      v_matched := true;
      IF (v_slot -> 'bookedBy') IS NOT NULL AND (v_slot -> 'bookedBy') <> 'null'::jsonb THEN
        v_already_booked := true;
        v_new_slots := v_new_slots || jsonb_build_array(v_slot);
      ELSE
        v_new_slots := v_new_slots || jsonb_build_array(
          v_slot || jsonb_build_object('bookedBy', jsonb_build_object('name', p_name, 'email', p_email))
        );
      END IF;
    ELSE
      v_new_slots := v_new_slots || jsonb_build_array(v_slot);
    END IF;
  END LOOP;

  IF NOT v_matched OR v_already_booked THEN
    RETURN false;
  END IF;

  UPDATE public.availability_links SET slots = v_new_slots WHERE token = p_token;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.book_availability_slot(uuid, text, text, text, text) TO anon;

-- Vérification recommandée après exécution (à faire manuellement) :
--   1. Générer un lien de dispo depuis l'Agenda (recruteur authentifié).
--   2. Ouvrir ce lien dans un navigateur différent (ou navigation privée) ->
--      les créneaux doivent s'afficher (pas "Lien introuvable").
--   3. Réserver un créneau -> confirmation affichée, créneau marqué "bookedBy".
--   4. Tenter de réserver le MÊME créneau une seconde fois -> doit échouer proprement.
