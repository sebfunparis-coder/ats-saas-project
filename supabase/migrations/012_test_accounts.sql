-- Migration 012 — Comptes de test par type de profil
-- À exécuter via Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ⚠️ Ces comptes sont UNIQUEMENT pour les tests en développement

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. COMPTE SOLO — test.solo@ats-demo.fr / TestSolo2026!
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_user_id uuid;
  v_company_id uuid := gen_random_uuid();
BEGIN
  -- Créer l'utilisateur Supabase Auth
  v_user_id := (
    SELECT id FROM auth.users WHERE email = 'test.solo@ats-demo.fr'
  );

  IF v_user_id IS NULL THEN
    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      aud, role, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      'test.solo@ats-demo.fr',
      crypt('TestSolo2026!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Alice","last_name":"Solo"}',
      'authenticated', 'authenticated',
      now(), now()
    )
    RETURNING id INTO v_user_id;
  END IF;

  -- Créer la company avec plan solo
  INSERT INTO public.companies (id, name, plan, created_at)
  VALUES (v_company_id, 'Agence Solo Test', 'solo', now())
  ON CONFLICT DO NOTHING;

  -- Créer/mettre à jour le profil
  INSERT INTO public.profiles (id, first_name, last_name, email, role, company_id, created_at)
  VALUES (v_user_id, 'Alice', 'Solo', 'test.solo@ats-demo.fr', 'admin', v_company_id, now())
  ON CONFLICT (id) DO UPDATE SET role = 'admin', company_id = v_company_id;

  RAISE NOTICE 'Solo account created: test.solo@ats-demo.fr | company_id=%', v_company_id;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. COMPTE MANAGER 3 postes — test.manager@ats-demo.fr / TestManager2026!
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_user_id uuid;
  v_company_id uuid := gen_random_uuid();
BEGIN
  v_user_id := (SELECT id FROM auth.users WHERE email = 'test.manager@ats-demo.fr');

  IF v_user_id IS NULL THEN
    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      aud, role, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), 'test.manager@ats-demo.fr',
      crypt('TestManager2026!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Bruno","last_name":"Manager"}',
      'authenticated', 'authenticated', now(), now()
    ) RETURNING id INTO v_user_id;
  END IF;

  INSERT INTO public.companies (id, name, plan, created_at)
  VALUES (v_company_id, 'Cabinet RH Manager (3 postes)', 'team_3', now())
  ON CONFLICT DO NOTHING;

  INSERT INTO public.profiles (id, first_name, last_name, email, role, company_id, created_at)
  VALUES (v_user_id, 'Bruno', 'Manager', 'test.manager@ats-demo.fr', 'admin', v_company_id, now())
  ON CONFLICT (id) DO UPDATE SET role = 'admin', company_id = v_company_id;

  RAISE NOTICE 'Manager-3 account created: test.manager@ats-demo.fr | company_id=%', v_company_id;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. COMPTE ÉQUIPIER — test.equipier@ats-demo.fr / TestEquipier2026!
--    (dans la même company que le Manager ci-dessus)
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_user_id uuid;
  v_manager_company_id uuid;
BEGIN
  -- Récupérer la company du manager
  v_manager_company_id := (
    SELECT company_id FROM public.profiles WHERE email = 'test.manager@ats-demo.fr' LIMIT 1
  );

  IF v_manager_company_id IS NULL THEN
    RAISE NOTICE 'Manager company not found — run this after the manager block above';
    RETURN;
  END IF;

  v_user_id := (SELECT id FROM auth.users WHERE email = 'test.equipier@ats-demo.fr');

  IF v_user_id IS NULL THEN
    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      aud, role, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), 'test.equipier@ats-demo.fr',
      crypt('TestEquipier2026!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Camille","last_name":"Equipier"}',
      'authenticated', 'authenticated', now(), now()
    ) RETURNING id INTO v_user_id;
  END IF;

  INSERT INTO public.profiles (id, first_name, last_name, email, role, company_id, created_at)
  VALUES (v_user_id, 'Camille', 'Equipier', 'test.equipier@ats-demo.fr', 'recruiter', v_manager_company_id, now())
  ON CONFLICT (id) DO UPDATE SET role = 'recruiter', company_id = v_manager_company_id;

  RAISE NOTICE 'Equipier account created: test.equipier@ats-demo.fr | same company as manager: %', v_manager_company_id;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. COMPTE MANAGER 6 postes — test.manager6@ats-demo.fr / TestManager2026!
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_user_id uuid;
  v_company_id uuid := gen_random_uuid();
BEGIN
  v_user_id := (SELECT id FROM auth.users WHERE email = 'test.manager6@ats-demo.fr');

  IF v_user_id IS NULL THEN
    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      aud, role, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), 'test.manager6@ats-demo.fr',
      crypt('TestManager2026!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Diana","last_name":"DirecteurRH"}',
      'authenticated', 'authenticated', now(), now()
    ) RETURNING id INTO v_user_id;
  END IF;

  INSERT INTO public.companies (id, name, plan, created_at)
  VALUES (v_company_id, 'Groupe RH Premium (6 postes)', 'team_6', now())
  ON CONFLICT DO NOTHING;

  INSERT INTO public.profiles (id, first_name, last_name, email, role, company_id, created_at)
  VALUES (v_user_id, 'Diana', 'DirecteurRH', 'test.manager6@ats-demo.fr', 'admin', v_company_id, now())
  ON CONFLICT (id) DO UPDATE SET role = 'admin', company_id = v_company_id;

  RAISE NOTICE 'Manager-6 account created: test.manager6@ats-demo.fr | company_id=%', v_company_id;
END $$;

-- Vérification finale
SELECT
  p.email,
  p.role,
  c.name as company,
  c.plan
FROM public.profiles p
JOIN public.companies c ON c.id = p.company_id
WHERE p.email LIKE 'test.%@ats-demo.fr'
ORDER BY c.plan, p.email;
