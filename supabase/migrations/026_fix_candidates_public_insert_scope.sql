-- T-362 : la policy publique INSERT sur `candidates` (migration 007, PARTIE 3)
-- ne vérifie que "cette company a AU MOINS UNE mission ouverte quelque part" —
-- pas que le candidat postule réellement à une mission précise, contrairement à
-- la policy `applications` (PARTIE 2 de la même migration) qui, elle, vérifie
-- bien `mission_id` + `status = 'open'`.
--
-- Conséquence : un script automatisé peut injecter un volume arbitraire de faux
-- candidats (CV base64 dans `resume`, donc coût de stockage réel) dans la
-- CVthèque de N'IMPORTE QUELLE entreprise cliente ayant au moins un poste
-- publié, sans jamais créer la candidature correspondante — pollution de
-- données difficile à distinguer des vrais candidats a posteriori.
--
-- Correctif choisi : plutôt qu'une réécriture complète du flux de candidature
-- (JobDetailPage.jsx) vers une fonction SECURITY DEFINER unique qui insère
-- candidat + candidature de façon atomique (plus sûr dans l'absolu, mais plus
-- risqué à livrer sans pouvoir tester la nouvelle route bout en bout dans cet
-- environnement — gros wizard multi-étapes avec upload CV), on ajoute une
-- colonne `sourceMissionId` renseignée par le formulaire public au moment de
-- l'insertion du candidat, et la policy vérifie désormais qu'elle référence une
-- mission RÉELLE, OUVERTE, de la MÊME company — exactement le même niveau de
-- garantie que la policy `applications` déjà correcte, sans toucher au flux
-- d'insertion existant (toujours 2 inserts séparés, juste un champ de plus).

ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS "sourceMissionId" uuid REFERENCES public.missions(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "public_can_apply_candidates" ON public.candidates;
CREATE POLICY "public_can_apply_candidates"
  ON public.candidates FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.missions m
      WHERE m.id = candidates."sourceMissionId"
        AND m.company_id = candidates.company_id
        AND m.status = 'open'
    )
  );

-- ============================================================================
-- DÉCOUVERTE CRITIQUE EN VÉRIFIANT CE TICKET (2026-07-07) — le formulaire de
-- candidature public semble ENTIÈREMENT CASSÉ en production actuellement, sans
-- rapport direct avec la faille ci-dessus.
--
-- Test réalisé avec la clé anon (aucun accès service_role/pg_policies dans cet
-- environnement, donc diagnostic par comportement observé uniquement) : un
-- INSERT anon minimal sur `candidates` avec le company_id EXACT d'une vraie
-- mission `status='open'` (visible et confirmée par une lecture anon juste
-- avant) échoue avec 42501 "new row violates row-level security policy" — alors
-- que la policy documentée dans les migrations 007/016 devrait l'autoriser. Le
-- MÊME test sur `applications` (avec mission_id/company_id réels et cohérents)
-- échoue IDENTIQUEMENT. Ce n'est donc pas un bug de logique dans la condition
-- WITH CHECK (qui semble correcte à la lecture) — les deux policies anon
-- `public_can_apply_candidates`/`public_can_apply_applications` semblent
-- absentes ou non fonctionnelles en base, malgré leur présence dans le code SQL
-- source. Hypothèse la plus probable : la migration 016 (fichier volumineux,
-- dont on sait par ailleurs qu'elle a nécessité un correctif d'urgence en 021
-- pour une récursion RLS) a pu échouer PARTIELLEMENT lors de son exécution —
-- après le DROP POLICY de ces deux policies mais avant leur recréation — les
-- laissant supprimées sans successeur.
--
-- Conséquence si confirmé : plus AUCUN candidat ne peut postuler via le portail
-- carrières public actuellement (JobDetailPage.jsx) — régression totale du
-- tunnel d'acquisition candidat, bien plus grave que la faille de spam T-362
-- elle-même. Les deux DROP/CREATE POLICY ci-dessous et ci-dessus les
-- re-déclarent explicitement (idempotent, sans risque si elles existaient déjà
-- correctement) — cette migration corrige donc probablement les DEUX problèmes
-- à la fois. Vérification impérative après exécution (voir plus bas), avec un
-- vrai test de soumission de candidature en navigateur si possible.
-- ============================================================================

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

-- Filet de sécurité supplémentaire pour T-424 : si la cause réelle n'est pas la
-- policy manquante mais un privilège table-level `INSERT` révoqué pour `anon`
-- (RLS ne s'applique qu'APRÈS ce privilège de base — sans lui, aucune policy ne
-- peut rendre l'INSERT possible), ce GRANT le restaure. Idempotent et sans
-- risque : ce projet n'accorde jamais explicitement moins que les privilèges
-- par défaut Supabase, ce GRANT ne fait donc que confirmer l'état attendu.
GRANT INSERT ON public.candidates   TO anon;
GRANT INSERT ON public.applications TO anon;

-- Vérification recommandée après exécution (SQL Editor, avec la clé anon) :
--   1. INSERT candidates sans sourceMissionId (ou avec un id de mission fermée/
--      inexistante) -> doit échouer (42501, insufficient_privilege).
--   2. INSERT candidates avec sourceMissionId = une vraie mission `status='open'`
--      de la bonne company -> doit réussir.
--   3. INSERT applications avec mission_id/company_id d'une vraie mission
--      ouverte -> doit réussir (c'est ce test précis qui échouait avant cette
--      migration, à re-tester en priorité).
--   4. Idéalement : test réel de soumission de candidature depuis
--      /careers/:companyId/job/:jobId dans un navigateur.
