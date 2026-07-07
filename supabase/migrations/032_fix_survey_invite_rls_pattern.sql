-- Migration 032 : aligne les policies RLS de satisfaction_surveys (018) et
-- invite_links (019) sur le pattern my_company_id()/my_role() introduit en
-- urgence par la migration 021 (T-417).
--
-- Contexte : 018 et 019 ont été écrites avant que la récursion infinie sur
-- profiles ne soit découverte et corrigée par la 021 (mais exécutées APRÈS
-- 021 en pratique — ordre réel : 016 → 021 → 017 → 018 → 019 → 020, cf.
-- mémoire de session). Leurs policies utilisent encore l'ancien pattern brut
-- `company_id IN (SELECT company_id FROM public.profiles WHERE id =
-- auth.uid())` au lieu de la fonction SECURITY DEFINER `my_company_id()`.
--
-- Pas de bug actif aujourd'hui : ce sous-select cible `profiles.id = auth.uid()`
-- (branche directe de la policy SELECT de profiles, pas une évaluation
-- récursive) donc il ne boucle pas dans son état actuel. Mais c'est exactement
-- le pattern qui A DÉJÀ causé une récursion infinie en prod une fois (016) dès
-- que les policies de `profiles` ont changé de forme — une fragilité qui
-- resterait silencieuse jusqu'au prochain changement de policy sur profiles.
-- Corrigé ici par cohérence et robustesse, pas en réaction à un incident.
--
-- Ordre sûr : my_company_id()/my_role() sont définies en 021, numériquement
-- avant cette migration 032 — donc rejouable sans risque sur un environnement
-- neuf en ordre numérique strict (contrairement à 018/019 elles-mêmes, qui ne
-- fonctionneraient pas en ordre numérique strict sans l'ordre réel documenté
-- ci-dessus — non modifiées ici pour ne pas réécrire l'historique déjà exécuté
-- en production).

DROP POLICY IF EXISTS "surveys_manage_own_company" ON public.satisfaction_surveys;
CREATE POLICY "surveys_manage_own_company"
  ON public.satisfaction_surveys FOR ALL
  USING (company_id = public.my_company_id());

DROP POLICY IF EXISTS "invite_links_manage_own_company" ON public.invite_links;
CREATE POLICY "invite_links_manage_own_company"
  ON public.invite_links FOR ALL
  USING (
    company_id = public.my_company_id()
    AND public.my_role() IN ('admin', 'owner', 'manager', 'superadmin')
  );
