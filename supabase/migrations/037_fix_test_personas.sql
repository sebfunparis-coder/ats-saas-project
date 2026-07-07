-- Migration 037 — Réparation des comptes de test cassés (T-431)
-- À exécuter via Supabase SQL Editor (Dashboard → SQL Editor → New Query)
--
-- Découvert en testant les 4 comptes documentés dans CLAUDE.md (migration 012) :
-- 2 sur 4 étaient réellement cassés, pas juste le SuperAdmin (T-429) :
-- - test.manager6@ats-demo.fr : login OK mais AUCUN profil/company (jamais
--   entièrement provisionné — la ligne auth.users existe mais le reste du
--   bloc migration 012 correspondant n'a jamais commité).
-- - test.equipier@ats-demo.fr : login refusé (Invalid login credentials).
--
-- ============================================================================
-- PARTIE 1 — Durcissement préventif : même correctif que T-429 (instance_id +
-- colonnes texte NULL) appliqué à TOUS les comptes test.*@ats-demo.fr d'un
-- coup, au cas où l'un d'eux ne se soit jamais "auto-guéri" par une connexion
-- réussie antérieure. Sans effet sur les comptes déjà sains.
-- ============================================================================

UPDATE auth.users
SET instance_id = COALESCE(instance_id, '00000000-0000-0000-0000-000000000000'),
    email_change = COALESCE(email_change, ''),
    recovery_token = COALESCE(recovery_token, ''),
    confirmation_token = COALESCE(confirmation_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, '')
WHERE email LIKE 'test.%@ats-demo.fr';

-- ============================================================================
-- PARTIE 2 — test.manager6@ats-demo.fr : créer la company + le profil
-- manquants (même données que prévues par la migration 012 d'origine).
-- ============================================================================

DO $$
DECLARE
  v_user_id uuid;
  v_company_id uuid;
BEGIN
  v_user_id := (SELECT id FROM auth.users WHERE email = 'test.manager6@ats-demo.fr');
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'test.manager6@ats-demo.fr introuvable dans auth.users — rien à faire';
    RETURN;
  END IF;

  v_company_id := (SELECT company_id FROM public.profiles WHERE id = v_user_id);
  IF v_company_id IS NULL THEN
    v_company_id := (SELECT id FROM public.companies WHERE name = 'Groupe RH Premium (6 postes)');
    IF v_company_id IS NULL THEN
      INSERT INTO public.companies (id, name, plan, created_at)
      VALUES (gen_random_uuid(), 'Groupe RH Premium (6 postes)', 'team_6', now())
      RETURNING id INTO v_company_id;
    END IF;

    INSERT INTO public.profiles (id, first_name, last_name, email, role, company_id, created_at)
    VALUES (v_user_id, 'Diana', 'DirecteurRH', 'test.manager6@ats-demo.fr', 'admin', v_company_id, now())
    ON CONFLICT (id) DO UPDATE SET role = 'admin', company_id = v_company_id;

    RAISE NOTICE 'test.manager6 réparé | company_id=%', v_company_id;
  ELSE
    RAISE NOTICE 'test.manager6 avait déjà un profil (company_id=%) — rien à faire', v_company_id;
  END IF;
END $$;

-- ============================================================================
-- PARTIE 3 — test.equipier@ats-demo.fr : recréer le compte proprement s'il
-- n'existe pas ou est irrécupérable (mot de passe réinitialisé au passage).
-- Rejoint la company de test.manager@ats-demo.fr (comme prévu par la 012).
-- ============================================================================

DO $$
DECLARE
  v_user_id uuid;
  v_manager_company_id uuid;
BEGIN
  v_manager_company_id := (SELECT company_id FROM public.profiles WHERE email = 'test.manager@ats-demo.fr' LIMIT 1);
  IF v_manager_company_id IS NULL THEN
    RAISE NOTICE 'Company de test.manager introuvable — impossible de réparer test.equipier';
    RETURN;
  END IF;

  v_user_id := (SELECT id FROM auth.users WHERE email = 'test.equipier@ats-demo.fr');

  IF v_user_id IS NULL THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      aud, role, created_at, updated_at,
      email_change, recovery_token, confirmation_token, email_change_token_new
    ) VALUES (
      gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
      'test.equipier@ats-demo.fr',
      crypt('TestEquipier2026!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Camille","last_name":"Equipier"}',
      'authenticated', 'authenticated', now(), now(),
      '', '', '', ''
    ) RETURNING id INTO v_user_id;
  ELSE
    -- Le compte existe mais refusait la connexion : mot de passe réinitialisé
    -- au cas où l'ancien hash soit corrompu/différent de celui documenté.
    UPDATE auth.users
    SET encrypted_password = crypt('TestEquipier2026!', gen_salt('bf'))
    WHERE id = v_user_id;
  END IF;

  INSERT INTO public.profiles (id, first_name, last_name, email, role, company_id, created_at)
  VALUES (v_user_id, 'Camille', 'Equipier', 'test.equipier@ats-demo.fr', 'recruiter', v_manager_company_id, now())
  ON CONFLICT (id) DO UPDATE SET role = 'recruiter', company_id = v_manager_company_id;

  RAISE NOTICE 'test.equipier réparé | company_id=%', v_manager_company_id;
END $$;

-- Vérification finale
SELECT p.email, p.role, c.name AS company, c.plan
FROM public.profiles p
JOIN public.companies c ON c.id = p.company_id
WHERE p.email LIKE 'test.%@ats-demo.fr'
ORDER BY c.plan, p.email;
