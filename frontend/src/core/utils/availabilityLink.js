import { supabase } from '@/services/supabase';

/**
 * T-426 : génère un lien de disponibilité candidat persisté en base (table
 * `availability_links`, migration 035) — remplace l'ancien stockage
 * localStorage (`CalendarPage.jsx`) qui ne fonctionnait jamais pour le
 * candidat réel (données écrites uniquement sur le navigateur du recruteur
 * qui génère le lien, même bug de fond déjà corrigé pour tracking_links/
 * share_links/client_portal_links/invite_links sur ce projet).
 */
export async function createAvailabilityLink({ companyId, recruiterName, note, duration, slots, actorId }) {
  const { data, error } = await supabase
    .from('availability_links')
    .insert({
      company_id: companyId,
      recruiter_name: recruiterName,
      note: note || null,
      duration: duration || 60,
      slots,
      created_by: actorId || null,
    })
    .select('token')
    .single();
  if (error) throw error;

  return `${window.location.origin}/availability/${data.token}`;
}

/**
 * Lecture publique des créneaux disponibles (candidat anonyme) — passe par la
 * fonction SECURITY DEFINER `get_availability_link` (ne renvoie jamais
 * company_id/created_by, uniquement ce qu'affiche AvailabilityPage.jsx).
 */
export async function getAvailabilityLink(token) {
  const { data, error } = await supabase.rpc('get_availability_link', { p_token: token });
  if (error) throw error;
  return data || null;
}

/**
 * Réservation d'un créneau (candidat anonyme) — passe par la fonction
 * SECURITY DEFINER `book_availability_slot`, atomique (verrou de ligne côté
 * serveur), pour éviter qu'un même créneau soit réservé deux fois.
 */
export async function bookAvailabilitySlot({ token, date, time, name, email }) {
  const { data, error } = await supabase.rpc('book_availability_slot', {
    p_token: token,
    p_date: date,
    p_time: time,
    p_name: name,
    p_email: email,
  });
  if (error) throw error;
  return !!data;
}
