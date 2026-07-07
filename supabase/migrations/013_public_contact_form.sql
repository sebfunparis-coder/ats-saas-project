-- Migration 013 : Formulaire de contact public → table Supabase
-- Stocke toutes les soumissions du formulaire /contact (dont les demandes de
-- démo initiées depuis les pages Tarifs et Démo) pour consultation dans
-- /superadmin, au lieu de dépendre uniquement de Formspree (externe).
--
-- Note sécurité : il n'existe aucune distinction "superadmin" au niveau base
-- de données dans ce projet (/superadmin n'est protégé que côté frontend par
-- mot de passe). Comme il n'y a qu'un seul SuperAdmin réel avec un email
-- documenté (CLAUDE.md), la policy de lecture/écriture est directement liée
-- à cet email via auth.jwt() plutôt que d'introduire une colonne dédiée.

CREATE TABLE IF NOT EXISTS public.contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Le formulaire public (visiteur non connecté, ou connecté) peut créer une demande
DROP POLICY IF EXISTS "public_can_submit_contact_requests" ON public.contact_requests;
CREATE POLICY "public_can_submit_contact_requests"
  ON public.contact_requests FOR INSERT
  WITH CHECK (true);

-- Seul le SuperAdmin (email unique documenté dans CLAUDE.md) peut consulter/traiter/supprimer
DROP POLICY IF EXISTS "superadmin_can_view_contact_requests" ON public.contact_requests;
CREATE POLICY "superadmin_can_view_contact_requests"
  ON public.contact_requests FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'sebfunparis@gmail.com');

DROP POLICY IF EXISTS "superadmin_can_update_contact_requests" ON public.contact_requests;
CREATE POLICY "superadmin_can_update_contact_requests"
  ON public.contact_requests FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'sebfunparis@gmail.com');

DROP POLICY IF EXISTS "superadmin_can_delete_contact_requests" ON public.contact_requests;
CREATE POLICY "superadmin_can_delete_contact_requests"
  ON public.contact_requests FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'sebfunparis@gmail.com');

CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON public.contact_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_requests_subject ON public.contact_requests(subject);
