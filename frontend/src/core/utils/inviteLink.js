import { supabase } from '@/services/supabase';

/**
 * Invitation d'un équipier par lien tokenisé (T-336). Même pattern que
 * shareLink.js/trackingLink.js : la table réelle est en Supabase, l'acceptation
 * (côté invité, sans compte au départ) passe par les fonctions SECURITY DEFINER
 * get_invite_details / accept_invite (migration 019).
 */
export async function createInviteLink({ companyId, role = 'recruiter', actorId }) {
  const token = crypto.randomUUID();
  const { error } = await supabase
    .from('invite_links')
    .insert({ token, company_id: companyId, role, created_by: actorId || null });
  if (error) throw error;
  return `${window.location.origin}/invite/${token}`;
}
