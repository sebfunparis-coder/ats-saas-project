-- T-358 : le SuperAdmin ne peut techniquement voir AUCUNE donnée d'un autre tenant.
--
-- Contexte : toutes les policies RLS de ce projet sont de la forme
-- `company_id = my_company_id()` — le rôle 'superadmin' n'est utilisé que comme rôle
-- élevé AU SEIN de sa propre company, jamais comme bypass cross-tenant (confirmé par
-- la migration 013 : "il n'existe aucune distinction 'superadmin' au niveau base de
-- données"). Conséquence concrète : `SuperAdminPageFunctional.jsx` interroge
-- `companies` avec la RLS normale, ne reçoit donc jamais que SA PROPRE company, et le
-- fallback silencieux vers `INITIAL_COMPANIES` (données fictives de DataContext.jsx)
-- masque ce problème en donnant l'illusion que l'onglet "Entreprises" fonctionne.
--
-- Correctif : une fonction SECURITY DEFINER dédiée, qui vérifie explicitement le rôle
-- SuperAdmin AVANT de bypasser la RLS pour lire toutes les companies — même pattern
-- que get_shared_candidate()/get_tracking_status() (migrations 010/011), mais ici le
-- bypass est volontaire et scopé au seul rôle superadmin (jamais anon, jamais un
-- Owner/Manager normal).
--
-- Piège SQL à éviter (déjà rencontré ailleurs dans ce fichier de migrations) :
-- `IF my_role() != 'superadmin'` laisserait passer un appelant anonyme, car
-- `NULL != 'superadmin'` s'évalue à NULL (ni vrai ni faux) en SQL, et un IF ne
-- déclenche PAS sa branche sur NULL — `IS DISTINCT FROM` est la forme correcte,
-- NULL-safe, pour ce genre de garde.

CREATE OR REPLACE FUNCTION public.get_all_companies_superadmin()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF public.my_role() IS DISTINCT FROM 'superadmin' THEN
    RAISE EXCEPTION 'Accès réservé au SuperAdmin';
  END IF;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'email', c.email,
      'plan', c.plan,
      'plan_status', c.plan_status,
      'mrr', c.mrr,
      'sector', c.sector,
      'created_at', c.created_at,
      'profiles', COALESCE(
        (SELECT jsonb_agg(jsonb_build_object(
            'id', p.id,
            'first_name', p.first_name,
            'last_name', p.last_name,
            'email', p.email,
            'role', p.role
          ))
         FROM public.profiles p
         WHERE p.company_id = c.id),
        '[]'::jsonb
      )
    )
  ), '[]'::jsonb) INTO result
  FROM public.companies c;

  RETURN result;
END;
$$;

-- Ni anon ni un utilisateur normal n'a de raison légitime d'appeler cette fonction —
-- seul un SuperAdmin authentifié en tire un résultat non vide (garde interne
-- ci-dessus) ; restreindre le GRANT à `authenticated` limite en plus la surface
-- d'appel côté anon (défense en profondeur, la garde interne suffirait déjà seule).
GRANT EXECUTE ON FUNCTION public.get_all_companies_superadmin() TO authenticated;

-- Vérification recommandée après exécution (à faire manuellement dans le SQL Editor) :
--   1. En tant que SuperAdmin : select public.get_all_companies_superadmin();
--      -> doit renvoyer TOUTES les companies, pas seulement la sienne.
--   2. En tant qu'utilisateur normal (non-superadmin) : même appel
--      -> doit lever l'exception "Accès réservé au SuperAdmin".
