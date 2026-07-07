-- Migration 021 : URGENT — corrige une récursion infinie RLS introduite par la
-- migration 016, qui casse actuellement TOUTES les requêtes sur profiles ET sur
-- toute autre table dont la policy fait une sous-requête sur profiles
-- (clients, events, tasks, team_members, companies, candidates, missions,
-- applications) — confirmé en conditions réelles juste après l'exécution de la
-- migration 016 : `select * from profiles` (anon) renvoie désormais l'erreur
-- Postgres 42P17 "infinite recursion detected in policy for relation profiles".
--
-- Cause : `profiles_select_own_or_company` (et les policies profiles suivantes)
-- font `company_id IN (SELECT company_id FROM public.profiles WHERE id =
-- auth.uid())` — une sous-requête SUR LA MÊME TABLE profiles. Pour évaluer
-- cette sous-requête, Postgres doit réappliquer la policy RLS de profiles,
-- qui refait la même sous-requête, etc. — récursion infinie. Ce même pattern
-- utilisé par TOUTES les autres tables (clients/events/tasks/team_members en
-- 001, companies en 007, candidates/missions/applications en 016) ne posait
-- aucun problème tant que profiles n'avait pas sa propre policy RLS
-- (avant le 016, la sous-requête sur profiles s'exécutait sans RLS à
-- réappliquer) — mais casse maintenant TOUT le reste de l'application.
--
-- Correctif standard Supabase pour ce cas précis : passer par des fonctions
-- SECURITY DEFINER (déjà le pattern utilisé dans ce projet pour share_links/
-- tracking_links/accept_invite) — une fonction SECURITY DEFINER s'exécute avec
-- les privilèges de son propriétaire et bypasse donc la RLS pour SA PROPRE
-- requête interne, ce qui casse la boucle de récursion.
--
-- ⚠️ EXÉCUTER IMMÉDIATEMENT — l'application entière (clients, missions,
-- candidats, équipe, calendrier, tâches) est probablement inutilisable tant
-- que cette migration n'est pas passée.

-- ============================================================================
-- PARTIE 1 — Fonctions SECURITY DEFINER (cassent la récursion)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.my_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.my_company_id() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.my_role() TO authenticated, anon;

-- ============================================================================
-- PARTIE 2 — Re-créer les policies profiles (migration 016) sans récursion
-- ============================================================================

DROP POLICY IF EXISTS "profiles_select_own_or_company" ON public.profiles;
CREATE POLICY "profiles_select_own_or_company"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid()
    OR company_id = public.my_company_id()
  );

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin"
  ON public.profiles FOR UPDATE
  USING (
    id = auth.uid()
    OR (
      company_id = public.my_company_id()
      AND public.my_role() IN ('admin', 'owner', 'manager', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "profiles_delete_admin_only" ON public.profiles;
CREATE POLICY "profiles_delete_admin_only"
  ON public.profiles FOR DELETE
  USING (
    company_id = public.my_company_id()
    AND public.my_role() IN ('admin', 'owner', 'manager', 'superadmin')
  );

-- ============================================================================
-- PARTIE 3 — Re-créer les policies applications/candidates/missions
-- (migration 016) sans récursion
-- ============================================================================

DROP POLICY IF EXISTS "applications_owner_roles_full_access" ON public.applications;
CREATE POLICY "applications_owner_roles_full_access"
  ON public.applications FOR ALL
  USING (
    company_id = public.my_company_id()
    AND public.my_role() IN ('admin', 'owner', 'manager', 'superadmin')
  );

DROP POLICY IF EXISTS "applications_equipier_assigned_only" ON public.applications;
CREATE POLICY "applications_equipier_assigned_only"
  ON public.applications FOR ALL
  USING (
    company_id = public.my_company_id()
    AND public.my_role() IN ('recruiter', 'viewer')
    AND "assignedTo" IN (
      SELECT id FROM public.team_members WHERE profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "candidates_owner_roles_full_access" ON public.candidates;
CREATE POLICY "candidates_owner_roles_full_access"
  ON public.candidates FOR ALL
  USING (
    company_id = public.my_company_id()
    AND public.my_role() IN ('admin', 'owner', 'manager', 'superadmin')
  );

DROP POLICY IF EXISTS "candidates_equipier_assigned_only" ON public.candidates;
CREATE POLICY "candidates_equipier_assigned_only"
  ON public.candidates FOR ALL
  USING (
    company_id = public.my_company_id()
    AND public.my_role() IN ('recruiter', 'viewer')
    AND EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.candidate_id = candidates.id
        AND a."assignedTo" IN (SELECT id FROM public.team_members WHERE profile_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "missions_owner_roles_full_access" ON public.missions;
CREATE POLICY "missions_owner_roles_full_access"
  ON public.missions FOR ALL
  USING (
    company_id = public.my_company_id()
    AND public.my_role() IN ('admin', 'owner', 'manager', 'superadmin')
  );

DROP POLICY IF EXISTS "missions_equipier_allowed_only" ON public.missions;
CREATE POLICY "missions_equipier_allowed_only"
  ON public.missions FOR ALL
  USING (
    company_id = public.my_company_id()
    AND public.my_role() IN ('recruiter', 'viewer')
    AND (
      "allowedRecruiters" IS NULL
      OR jsonb_array_length("allowedRecruiters") = 0
      OR "allowedRecruiters" @> to_jsonb(
        (SELECT id FROM public.team_members WHERE profile_id = auth.uid() LIMIT 1)::text
      )
    )
  );

-- ============================================================================
-- PARTIE 4 — Re-créer les policies des tables migration 001 (clients/events/
-- tasks/team_members) et migration 007 (companies) sans récursion
-- ============================================================================

DROP POLICY IF EXISTS "users_manage_own_company_clients" ON public.clients;
CREATE POLICY "users_manage_own_company_clients"
  ON public.clients FOR ALL
  USING (company_id = public.my_company_id());

DROP POLICY IF EXISTS "users_manage_own_company_events" ON public.events;
CREATE POLICY "users_manage_own_company_events"
  ON public.events FOR ALL
  USING (company_id = public.my_company_id());

DROP POLICY IF EXISTS "users_manage_own_company_tasks" ON public.tasks;
CREATE POLICY "users_manage_own_company_tasks"
  ON public.tasks FOR ALL
  USING (company_id = public.my_company_id());

DROP POLICY IF EXISTS "users_manage_own_company_team" ON public.team_members;
CREATE POLICY "users_manage_own_company_team"
  ON public.team_members FOR ALL
  USING (company_id = public.my_company_id());

DROP POLICY IF EXISTS "users_manage_own_company" ON public.companies;
CREATE POLICY "users_manage_own_company"
  ON public.companies FOR ALL
  USING (id = public.my_company_id());
