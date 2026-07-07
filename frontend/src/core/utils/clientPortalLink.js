import { supabase } from '@/services/supabase';

/**
 * T-373 : génère un lien de portail client tokenisé, persisté en base
 * (table client_portal_links, migration 030) — remplace l'ancien stockage
 * localStorage qui ne fonctionnait jamais pour le client réel (données
 * écrites uniquement sur le navigateur du recruteur qui génère le lien).
 */
export async function createClientPortalLink({ clientId, companyId }) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours
  const { error } = await supabase.from('client_portal_links').insert({
    token,
    company_id: companyId,
    client_id: clientId,
    expires_at: expiresAt.toISOString(),
  });
  if (error) throw error;
  return `${window.location.origin}/client-portal/${token}`;
}
