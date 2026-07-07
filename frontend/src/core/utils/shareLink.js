import { supabase } from '@/services/supabase';

const SHARE_LINK_VALIDITY_DAYS = 7;

/**
 * Crée un lien de partage tokenisé (7 jours) permettant à un manager sans
 * compte de consulter un profil candidat et laisser un avis (T-249).
 */
export async function createShareLink({ applicationId, candidateId, companyId, actorId }) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SHARE_LINK_VALIDITY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('share_links')
    .insert({
      token,
      company_id: companyId,
      application_id: applicationId,
      candidate_id: candidateId,
      created_by: actorId,
      expires_at: expiresAt,
    })
    .select()
    .single();
  if (error) throw error;

  return { ...data, url: `${window.location.origin}/share/${token}` };
}

/**
 * Récupère les liens de partage existants pour une candidature (côté recruteur,
 * authentifié — lecture directe de la table, RLS company-scoped).
 */
export async function getShareLinksForApplication(applicationId) {
  const { data, error } = await supabase
    .from('share_links')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * T-382 : `candidate_id` sur `share_links` n'a pas de FK `ON DELETE CASCADE`
 * (colonne UUID nue, voir migration 010) — supprimer un candidat laissait donc
 * subsister sa fiche + l'avis manager nominatif (`review_text`) dans cette
 * table. Appelé explicitement par `deleteCandidate()` (DataContext.jsx) avant
 * la suppression du candidat lui-même, pour que le droit à l'oubli (T-225)
 * couvre aussi cette trace résiduelle.
 */
export async function deleteShareLinksForCandidate(candidateId) {
  const { data, error } = await supabase
    .from('share_links')
    .delete()
    .eq('candidate_id', candidateId)
    .select('id');
  if (error) throw error;
  return data?.length || 0;
}
