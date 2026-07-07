-- Migration 036 — Compte de test dédié SuperAdmin (T-428, suite)
-- À exécuter via Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Même pattern exact que la migration 012 (comptes de test par profil) —
-- insert direct dans auth.users avec email_confirmed_at déjà renseigné (pas
-- besoin de cliquer un lien de confirmation email) + profil avec
-- role='superadmin' directement.
--
-- T-429 : l'INSERT ci-dessous fixe explicitement instance_id + 4 colonnes
-- texte (email_change/recovery_token/confirmation_token/
-- email_change_token_new) à leurs valeurs attendues par Supabase Auth —
-- découvert en mettant au point ce compte : un INSERT sans ces colonnes
-- (comme le fait la migration 012, jamais corrigée depuis car test.manager
-- s'est "auto-guéri" après ses premières connexions réussies) provoque un
-- rejet `Invalid login credentials` (instance_id NULL) puis une erreur serveur
-- `500 Database error querying schema` (colonnes texte NULL au lieu de '')
-- pour tout compte qui ne s'est encore JAMAIS connecté avec succès.
--
-- ⚠️ Comme les autres comptes test.*@ats-demo.fr de ce projet : réservé au
-- développement/test. Ne jamais utiliser en production réelle — à supprimer
-- ou changer de mot de passe avant toute mise en ligne commerciale.

DO $$
DECLARE
  v_user_id uuid;
  v_company_id uuid := gen_random_uuid();
BEGIN
  v_user_id := (SELECT id FROM auth.users WHERE email = 'test.superadmin@ats-demo.fr');

  IF v_user_id IS NULL THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      aud, role, created_at, updated_at,
      email_change, recovery_token, confirmation_token, email_change_token_new
    ) VALUES (
      gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
      'test.superadmin@ats-demo.fr',
      crypt('TestSuperAdmin2026!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Super","last_name":"Admin"}',
      'authenticated', 'authenticated', now(), now(),
      '', '', '', ''
    ) RETURNING id INTO v_user_id;
  END IF;

  -- Company dédiée (même pattern que les autres comptes test) — non
  -- significative pour un SuperAdmin, qui accède aux autres companies via
  -- get_all_companies_superadmin() (SECURITY DEFINER), pas via my_company_id().
  INSERT INTO public.companies (id, name, plan, created_at)
  VALUES (v_company_id, 'ATS Ultimate — SuperAdmin', 'team_6', now())
  ON CONFLICT DO NOTHING;

  INSERT INTO public.profiles (id, first_name, last_name, email, role, company_id, created_at)
  VALUES (v_user_id, 'Super', 'Admin', 'test.superadmin@ats-demo.fr', 'superadmin', v_company_id, now())
  ON CONFLICT (id) DO UPDATE SET role = 'superadmin', company_id = v_company_id;

  RAISE NOTICE 'SuperAdmin test account created: test.superadmin@ats-demo.fr | company_id=%', v_company_id;
END $$;

-- Vérification finale
SELECT id, email, role, company_id
FROM public.profiles
WHERE email = 'test.superadmin@ats-demo.fr';
