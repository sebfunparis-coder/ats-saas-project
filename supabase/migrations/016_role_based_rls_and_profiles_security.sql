-- Migration 016 : sécurisation de public.profiles + isolation par rôle (Équipier)
-- sur candidates/applications/missions.
-- À REVOIR PUIS EXÉCUTER MANUELLEMENT dans le Supabase SQL Editor, comme toutes
-- les migrations précédentes de ce projet. Vu la sensibilité (RLS sur la table
-- qui porte l'identité/le rôle de chaque utilisateur), une vérification en
-- environnement de staging avant la prod est recommandée.
--
-- Contexte (T-327) : contrairement à toutes les autres tables sensibles
-- (clients/events/tasks/team_members en 001, candidates en 002, companies/
-- missions/applications en 007), `public.profiles` — pourtant la source de
-- vérité de `role`/`company_id` utilisée par TOUTES les policies RLS des autres
-- tables via `SELECT company_id FROM public.profiles WHERE id = auth.uid()` —
-- n'avait aucune RLS versionnée dans ce dépôt. Si la policy existante côté
-- Supabase (hors repo) autorisait un utilisateur à modifier ses propres colonnes
-- role/company_id, n'importe quel Équipier pouvait s'auto-promouvoir owner.
--
-- Contexte (T-321) : toutes les policies existantes sur candidates/applications
-- sont `FOR ALL USING (company_id IN (...))` — aucune ne distingue un rôle
-- Owner/Manager d'un Équipier. Cette migration remplace ces policies "tout ou
-- rien" par des policies différenciées par rôle.
--
-- Contexte (T-322) : `missions.allowedRecruiters` (liste de team_members.id
-- autorisés) est capturé par MissionForm.jsx mais n'était appliqué nulle part,
-- ni côté client ni côté base. Cette migration l'applique en RLS pour les
-- Équipiers (un Owner/Manager voit toujours tout, quelle que soit la liste).
--
-- ⚠️ CORRECTIF CRITIQUE (2026-07-04, avant toute exécution) : vérifié en lecture
-- seule contre la base réelle (clé anon + comptes de test documentés dans
-- CLAUDE.md) — `missions."allowedRecruiters"`, `applications."assignedTo"` et
-- `applications."assignedToName"` N'EXISTENT PAS en base, alors que cette
-- migration les référence dans des policies RLS (PARTIE 2/4 plus bas). Sans
-- cette PARTIE 0, l'exécution de cette migration aurait échoué dès la première
-- policy qui les référence ("column does not exist"). Découverte plus large et
-- plus grave au passage : `MissionForm.jsx` envoie TOUJOURS `allowedRecruiters`
-- dans son payload de création/mise à jour (jamais conditionnel), et
-- `PipelinePage.jsx` envoie TOUJOURS `assignedTo`/`assignedToName` lors de
-- l'assignation d'un recruteur — sans ces colonnes, **la création/modification
-- de mission et l'assignation d'un recruteur à une candidature échouent
-- actuellement en production** (erreur PostgREST 42703 propagée telle quelle
-- au frontend). Cette découverte est indépendante de T-321/322 et bien plus
-- urgente : elle casse une fonctionnalité cœur (sauvegarde des missions), pas
-- seulement l'isolation par rôle.
--
-- ============================================================================
-- PARTIE 0 — Colonnes manquantes (bug de sauvegarde actif en production)
-- ============================================================================

ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS "allowedRecruiters" jsonb NOT NULL DEFAULT '[]'::jsonb;

-- "assignedTo" stocke un `team_members.id` (UUID) — typé en uuid (et non text
-- comme les champs purement d'affichage candidateName/missionTitle) pour que
-- la comparaison `"assignedTo" IN (SELECT id FROM team_members ...)` plus bas
-- (PARTIE 2) fonctionne sans cast implicite text/uuid.
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS "assignedTo" uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "assignedToName" text;

-- ============================================================================
-- PARTIE 1 — public.profiles
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Lecture : sa propre ligne, ou toute ligne de la même company (nécessaire pour
-- la liste des membres dans Administration → Équipe/Utilisateurs).
DROP POLICY IF EXISTS "profiles_select_own_or_company" ON public.profiles;
CREATE POLICY "profiles_select_own_or_company"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid()
    OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- Création : uniquement sa propre ligne (onboarding — setupUserAccount côté
-- frontend fait un upsert avec id = auth.uid()).
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Modification : sa propre ligne, OU une ligne d'un collègue de la même company
-- si l'appelant a déjà un rôle élevé (admin/owner/manager/superadmin). Le
-- contrôle "un Équipier ne peut pas changer role/company_id" est fait par le
-- trigger ci-dessous, pas ici — une policy RLS seule ne peut pas comparer
-- proprement l'ancienne et la nouvelle valeur d'une colonne pour la même ligne.
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin"
  ON public.profiles FOR UPDATE
  USING (
    id = auth.uid()
    OR (
      company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.profiles me
        WHERE me.id = auth.uid() AND me.role IN ('admin', 'owner', 'manager', 'superadmin')
      )
    )
  );

-- Suppression : réservée aux rôles élevés de la même company (retrait d'un membre).
DROP POLICY IF EXISTS "profiles_delete_admin_only" ON public.profiles;
CREATE POLICY "profiles_delete_admin_only"
  ON public.profiles FOR DELETE
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles me
      WHERE me.id = auth.uid() AND me.role IN ('admin', 'owner', 'manager', 'superadmin')
    )
  );

-- Trigger : empêche un utilisateur déjà rattaché à une company de modifier SON
-- PROPRE rôle ou SA PROPRE company_id (auto-élévation de privilège), quelle que
-- soit la policy RLS qui a autorisé l'UPDATE. La condition `OLD.company_id IS
-- NOT NULL` laisse passer la toute première configuration du compte lors de
-- l'onboarding (le profil n'a pas encore de company_id à ce moment-là) —
-- seul un compte déjà pleinement configuré est protégé contre l'auto-élévation.
CREATE OR REPLACE FUNCTION public.prevent_self_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.id = auth.uid()
     AND OLD.company_id IS NOT NULL
     AND (NEW.role IS DISTINCT FROM OLD.role OR NEW.company_id IS DISTINCT FROM OLD.company_id) THEN
    RAISE EXCEPTION 'Vous ne pouvez pas modifier votre propre rôle ou entreprise directement.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_self_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_role_escalation();

-- ============================================================================
-- PARTIE 2 — Isolation par rôle sur applications (T-321)
--
-- team_members.profile_id relie la ligne "roster" (team_members.id, utilisé
-- par applications."assignedTo"/missions."allowedRecruiters") à l'identité
-- Supabase Auth réelle (profiles.id / auth.uid()). On s'en sert pour retrouver
-- "mon team_members.id" à partir de auth.uid().
-- ============================================================================

DROP POLICY IF EXISTS "users_manage_own_company_applications" ON public.applications;

CREATE POLICY "applications_owner_roles_full_access"
  ON public.applications FOR ALL
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles me
      WHERE me.id = auth.uid() AND me.role IN ('admin', 'owner', 'manager', 'superadmin')
    )
  );

CREATE POLICY "applications_equipier_assigned_only"
  ON public.applications FOR ALL
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles me
      WHERE me.id = auth.uid() AND me.role IN ('recruiter', 'viewer')
    )
    AND "assignedTo" IN (
      SELECT id FROM public.team_members WHERE profile_id = auth.uid()
    )
  );

-- ============================================================================
-- PARTIE 3 — Isolation par rôle sur candidates (T-321)
--
-- Il n'existe pas de colonne d'affectation directe sur candidates (l'affectation
-- se fait au niveau de la candidature). Un Équipier voit donc un candidat s'il a
-- au moins une candidature qui lui est assignée sur ce candidat.
-- ============================================================================

DROP POLICY IF EXISTS "users_manage_own_company_candidates" ON public.candidates;

CREATE POLICY "candidates_owner_roles_full_access"
  ON public.candidates FOR ALL
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles me
      WHERE me.id = auth.uid() AND me.role IN ('admin', 'owner', 'manager', 'superadmin')
    )
  );

CREATE POLICY "candidates_equipier_assigned_only"
  ON public.candidates FOR ALL
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles me
      WHERE me.id = auth.uid() AND me.role IN ('recruiter', 'viewer')
    )
    AND EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.candidate_id = candidates.id
        AND a."assignedTo" IN (SELECT id FROM public.team_members WHERE profile_id = auth.uid())
    )
  );

-- Ré-appliquer les policies publiques du portail carrières (INSERT anon), qui
-- référençaient l'ancienne policy "ALL" par leur propre nom — elles restent
-- valides telles quelles (elles ne dépendent pas de la policy remplacée
-- ci-dessus), mais on les recrée par précaution pour rester alignées avec 002/007.
DROP POLICY IF EXISTS "public_can_apply_candidates" ON public.candidates;
CREATE POLICY "public_can_apply_candidates"
  ON public.candidates FOR INSERT
  TO anon
  WITH CHECK (
    company_id IN (SELECT company_id FROM public.missions WHERE status = 'open')
  );

DROP POLICY IF EXISTS "public_can_apply_applications" ON public.applications;
CREATE POLICY "public_can_apply_applications"
  ON public.applications FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.missions m
      WHERE m.id = applications.mission_id
        AND m.company_id = applications.company_id
        AND m.status = 'open'
    )
  );

-- ============================================================================
-- PARTIE 4 — missions.allowedRecruiters appliqué en RLS pour les Équipiers (T-322)
--
-- Un Owner/Manager/Admin/Superadmin voit toujours toutes les missions de sa
-- company. Un Équipier ne voit que les missions non restreintes (tableau vide)
-- ou explicitement ouvertes à son team_members.id.
-- ============================================================================

DROP POLICY IF EXISTS "users_manage_own_company_missions" ON public.missions;

CREATE POLICY "missions_owner_roles_full_access"
  ON public.missions FOR ALL
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles me
      WHERE me.id = auth.uid() AND me.role IN ('admin', 'owner', 'manager', 'superadmin')
    )
  );

CREATE POLICY "missions_equipier_allowed_only"
  ON public.missions FOR ALL
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles me
      WHERE me.id = auth.uid() AND me.role IN ('recruiter', 'viewer')
    )
    AND (
      "allowedRecruiters" IS NULL
      OR jsonb_array_length("allowedRecruiters") = 0
      OR "allowedRecruiters" @> to_jsonb(
        (SELECT id FROM public.team_members WHERE profile_id = auth.uid() LIMIT 1)::text
      )
    )
  );

-- La policy publique du portail carrières (missions "open" visibles par anon)
-- n'est pas affectée par ce qui précède (policies distinctes, PERMISSIVE par
-- défaut = combinées en OR) mais recréée par précaution :
DROP POLICY IF EXISTS "public_can_view_open_missions" ON public.missions;
CREATE POLICY "public_can_view_open_missions"
  ON public.missions FOR SELECT
  TO anon
  USING (status = 'open');
