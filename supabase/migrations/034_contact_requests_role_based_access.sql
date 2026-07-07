-- Migration 034 : ajoute un accès basé sur profiles.role à contact_requests (T-419)
--
-- Contexte : les 3 policies de lecture/écriture de contact_requests (migration
-- 013) sont couplées à un email SuperAdmin en dur (`auth.jwt() ->> 'email' =
-- 'sebfunparis@gmail.com'`) — au moment où 013 a été écrite, il n'existait
-- effectivement aucune distinction "superadmin" au niveau base de données
-- (constat exact à l'époque). Ce n'est plus vrai depuis les migrations
-- 016/021/024 : `profiles.role = 'superadmin'` est désormais une vraie
-- distinction utilisée ailleurs dans ce projet (`get_all_companies_superadmin()`,
-- migration 024, via `my_role() = 'superadmin'`).
--
-- Correctif choisi délibérément ADDITIF, pas un remplacement : `/superadmin`
-- est protégé côté frontend par un mot de passe (VITE_SUPERADMIN_PASSWORD,
-- cf. CLAUDE.md) indépendant de `profiles.role` — impossible de confirmer
-- depuis cet environnement (pas d'accès service_role) que le profil réel de
-- sebfunparis@gmail.com a bien `role = 'superadmin'` renseigné. Remplacer
-- purement et simplement l'email par le rôle risquerait de couper l'accès
-- réel au SuperAdmin si ce champ n'est pas synchronisé. La policy accepte
-- donc les DEUX conditions (email OU rôle) : ferme le point de maintenance
-- pour l'avenir (un nouveau SuperAdmin avec `role='superadmin'` correctement
-- renseigné serait couvert sans toucher à cette migration) sans aucun risque
-- de régression sur l'accès actuel.

DROP POLICY IF EXISTS "superadmin_can_view_contact_requests" ON public.contact_requests;
CREATE POLICY "superadmin_can_view_contact_requests"
  ON public.contact_requests FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'sebfunparis@gmail.com'
    OR public.my_role() = 'superadmin'
  );

DROP POLICY IF EXISTS "superadmin_can_update_contact_requests" ON public.contact_requests;
CREATE POLICY "superadmin_can_update_contact_requests"
  ON public.contact_requests FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'sebfunparis@gmail.com'
    OR public.my_role() = 'superadmin'
  );

DROP POLICY IF EXISTS "superadmin_can_delete_contact_requests" ON public.contact_requests;
CREATE POLICY "superadmin_can_delete_contact_requests"
  ON public.contact_requests FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'sebfunparis@gmail.com'
    OR public.my_role() = 'superadmin'
  );
