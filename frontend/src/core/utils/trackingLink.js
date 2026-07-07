import { supabase } from '@/services/supabase';

// T-418 : durée volontairement plus longue que share_links/invite_links (7
// jours) — ce lien sert au candidat à suivre l'avancement de sa candidature
// sur toute la durée du process de recrutement (semaines/mois), pas à une
// action ponctuelle. 90 jours borne quand même l'exposition du CV dans le
// temps (minimisation RGPD) sans casser l'usage normal de la fonctionnalité.
const TRACKING_LINK_VALIDITY_DAYS = 90;

/**
 * Crée un lien de suivi candidat tokenisé (T-251) — utilisable en authentifié
 * (recruteur, depuis PipelinePage) comme en anonyme (candidat au moment de
 * postuler, depuis JobDetailPage — RLS restreint l'INSERT anon aux candidatures
 * liées à une mission status='open', voir migration 011).
 */
export async function createTrackingLink({ applicationId, companyId, actorId }) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + TRACKING_LINK_VALIDITY_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from('tracking_links')
    .insert({ token, company_id: companyId, application_id: applicationId, created_by: actorId || null, expires_at: expiresAt });
  if (error) throw error;
  return `${window.location.origin}/track/${token}`;
}

// T-424 (suite) : variante pour l'appel PUBLIC/anonyme (JobDetailPage.jsx, juste
// après une candidature). Un INSERT direct comme ci-dessus échoue pour anon car
// la policy `public_can_create_tracking_link` (migration 011) doit lire
// `applications` pour valider sa condition — table sans policy SELECT pour anon
// (et qu'on ne peut pas lui en ajouter une large sans exposer les candidatures
// d'autres candidats). La RPC `create_public_tracking_link` (migration 027)
// valide la même condition côté serveur (SECURITY DEFINER, bypass RLS pour sa
// propre lecture) et insère elle-même — aucune lecture d'applications n'est
// jamais exposée à anon.
export async function createPublicTrackingLink({ applicationId, companyId }) {
  const { data: token, error } = await supabase.rpc('create_public_tracking_link', {
    p_application_id: applicationId,
    p_company_id: companyId,
  });
  if (error) throw error;
  if (!token) throw new Error('Lien de suivi non généré (candidature introuvable)');
  return `${window.location.origin}/track/${token}`;
}

/**
 * T-382 : `application_id` sur `tracking_links` n'a pas de FK `ON DELETE
 * CASCADE` (colonne UUID nue, voir migration 011). Contrairement à
 * `share_links`, cette table n'a pas de `candidate_id` direct — appelé par
 * `deleteCandidate()` (DataContext.jsx) avec les IDs des candidatures déjà
 * identifiées comme liées au candidat supprimé, pour purger les liens de
 * suivi correspondants (droit à l'oubli, T-225).
 */
export async function deleteTrackingLinksForApplications(applicationIds) {
  if (!applicationIds?.length) return 0;
  const { data, error } = await supabase
    .from('tracking_links')
    .delete()
    .in('application_id', applicationIds)
    .select('id');
  if (error) throw error;
  return data?.length || 0;
}
