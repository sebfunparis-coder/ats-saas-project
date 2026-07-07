import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

/**
 * Page Admin Login — dépréciée (T-317).
 *
 * L'ancien flux vérifiait un mot de passe stocké dans VITE_SUPERADMIN_PASSWORD,
 * une variable Vite qui est TOUJOURS inlinée en clair dans le bundle JS livré au
 * navigateur — ce n'est donc pas un secret, et cette page ne protégeait rien.
 * L'accès SuperAdmin repose désormais exclusivement sur `profiles.role === 'superadmin'`
 * (Supabase Auth), déjà vérifié par le garde de la route `/superadmin` — voir
 * `SuperAdminPageFunctional.jsx`. Se connecter normalement via /login suffit donc
 * pour tout compte dont le rôle Supabase est superadmin.
 */
export function AdminLoginPage() {
  return <Navigate to={ROUTES.LOGIN} replace />;
}

export default AdminLoginPage;
