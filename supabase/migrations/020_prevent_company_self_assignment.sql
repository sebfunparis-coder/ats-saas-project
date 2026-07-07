-- Migration 020 : empêche l'auto-assignation d'un company_id arbitraire sur un
-- profil neuf (T-345).
-- À REVOIR PUIS EXÉCUTER MANUELLEMENT dans le Supabase SQL Editor, APRÈS la
-- migration 016 ET la migration 021 (dépend des policies profiles qu'elles
-- créent, et des fonctions my_company_id()/my_role() introduites en 021).
--
-- Contexte : le trigger anti-escalade de la migration 016
-- (prevent_self_role_escalation) ne protège que les comptes DÉJÀ rattachés à
-- une company (OLD.company_id IS NOT NULL). Un compte tout juste créé
-- (profil inexistant, ou company_id encore NULL) pouvait en théorie
-- s'auto-assigner N'IMPORTE QUEL company_id existant et n'importe quel rôle
-- directement via `supabase.from('profiles').upsert({id: auth.uid(),
-- company_id: '<company d'un autre client>', role: 'owner'})`, sans passer
-- par le système d'invitation (migration 019) ni par le flux normal
-- d'inscription (qui crée sa PROPRE company).
--
-- Vérifié en lecture seule contre la base réelle (2026-07-04, compte de test
-- authentifié) avant d'écrire cette migration : `companies.created_by`
-- n'existe pas encore, colonnes actuelles de `companies` = id, name, email,
-- phone, address, sector, plan, plan_status, mrr, next_billing,
-- payment_method, health, notes, links, documents, contacts, created_at,
-- updated_at. Cette migration N'ALTÈRE PAS la policy RLS existante sur
-- `companies` (INSERT) — inconnue avec certitude depuis cet environnement —
-- elle se contente d'ajouter une colonne et de restreindre uniquement les
-- policies `profiles` créées par la migration 016, sans toucher au flux
-- d'inscription existant (qui continue de fonctionner à l'identique).
--
-- ============================================================================
-- GARDE-FOU (T-361) — échec rapide et explicite si exécutée hors ordre
-- ============================================================================
-- La numérotation de ce fichier (020) est trompeuse : il dépend de fonctions
-- introduites par la migration 021 (numériquement APRÈS). Sur un nouvel
-- environnement (staging, restauration disaster-recovery), rejouer les
-- migrations dans l'ordre numérique naturel exécuterait ce fichier avant 021 et
-- échouerait sur "function public.my_company_id() does not exist" — message peu
-- clair pour qui découvre ce projet. Ce bloc transforme l'échec en message
-- explicite qui pointe directement vers la cause et la solution.
DO $$
BEGIN
  IF to_regprocedure('public.my_company_id()') IS NULL
     OR to_regprocedure('public.my_role()') IS NULL THEN
    RAISE EXCEPTION 'Migration 020 exécutée hors ordre : exécutez d''abord 016_role_based_rls_and_profiles_security.sql PUIS 021_fix_profiles_rls_infinite_recursion.sql (qui créent my_company_id()/my_role()), puis relancez 020.';
  END IF;
END $$;

-- ============================================================================
-- PARTIE 1 — companies.created_by (traçabilité + base de la restriction)
-- ============================================================================

-- Référence auth.users (pas public.profiles) : setupUserAccount() (frontend)
-- crée la company AVANT la ligne profiles correspondante (le profil n'existe
-- pas encore à cet instant) — une FK vers profiles échouerait donc à
-- l'insertion. auth.users, lui, existe déjà (l'utilisateur vient de faire
-- signUp()) au moment de cet insert.
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Renseigne created_by pour les companies déjà existantes, à partir du premier
-- profil admin/owner rattaché (best-effort, ne bloque rien si aucun match).
UPDATE public.companies c
SET created_by = (
  SELECT p.id FROM public.profiles p
  WHERE p.company_id = c.id AND p.role IN ('admin', 'owner')
  ORDER BY p.created_at ASC
  LIMIT 1
)
WHERE c.created_by IS NULL;

-- ============================================================================
-- PARTIE 2 — Restriction sur profiles : un profil neuf ne peut s'auto-assigner
-- un company_id que s'il vient de créer cette company lui-même (created_by =
-- auth.uid()). Remplace les policies INSERT/UPDATE de la migration 016 par des
-- versions qui ajoutent cette condition supplémentaire pour le cas "premier
-- rattachement" (OLD.company_id IS NULL / ligne inexistante).
-- ============================================================================

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (
    id = auth.uid()
    AND (
      company_id IS NULL
      OR company_id IN (SELECT id FROM public.companies WHERE created_by = auth.uid())
    )
  );

-- T-345/récursion (migration 021) : USING réécrit avec my_company_id()/my_role()
-- (fonctions SECURITY DEFINER) au lieu de sous-requêtes directes sur profiles,
-- qui causaient une récursion infinie (migration 021 a déjà appliqué ce même
-- correctif — cette migration doit passer APRÈS la 021, sans quoi elle
-- réintroduirait la récursion en recréant cette policy avec l'ancien USING).
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin"
  ON public.profiles FOR UPDATE
  USING (
    id = auth.uid()
    OR (
      company_id = public.my_company_id()
      AND public.my_role() IN ('admin', 'owner', 'manager', 'superadmin')
    )
  )
  WITH CHECK (
    -- Un admin/manager modifiant la ligne d'un COLLÈGUE (pas la sienne) n'est
    -- pas concerné par cette contrainte de "première association" — elle ne
    -- s'applique qu'à l'auto-modification de sa propre ligne.
    id != auth.uid()
    OR company_id IS NULL
    OR company_id IN (SELECT id FROM public.companies WHERE created_by = auth.uid())
    -- Le trigger prevent_self_role_escalation (migration 016) empêche déjà tout
    -- changement de company_id une fois le profil pleinement configuré — cette
    -- clause ne s'active donc en pratique que pour un profil dont
    -- OLD.company_id était NULL (première configuration).
  );

-- Note : accept_invite() (migration 019) est SECURITY DEFINER et bypasse donc
-- entièrement ces policies — l'acceptation d'une invitation continue de
-- fonctionner sans changement.
