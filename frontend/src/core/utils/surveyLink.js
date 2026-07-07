import { supabase } from '@/services/supabase';

/**
 * Enquête de satisfaction post-candidature (T-337). Même pattern que
 * trackingLink.js (T-251) : la table réelle est en Supabase, l'accès public
 * (candidat sans compte) passe par les fonctions SECURITY DEFINER get_survey_details
 * / submit_survey_response (migration 018).
 */
export async function createSurveyLink({ applicationId, companyId, candidateName, missionTitle, actorId }) {
  const token = crypto.randomUUID();
  const { data, error } = await supabase
    .from('satisfaction_surveys')
    .insert({
      token,
      company_id: companyId,
      application_id: applicationId,
      candidate_name: candidateName,
      mission_title: missionTitle,
      created_by: actorId || null,
    })
    .select()
    .single();
  if (error) throw error;
  return { ...normalizeSurvey(data), link: `${window.location.origin}/survey/${token}` };
}

export async function getSurveysForCompany(companyId) {
  const { data, error } = await supabase
    .from('satisfaction_surveys')
    .select('*')
    .eq('company_id', companyId);
  if (error) throw error;
  return (data || []).map(normalizeSurvey);
}

function normalizeSurvey(row) {
  return {
    token: row.token,
    appId: row.application_id,
    candidateName: row.candidate_name,
    missionTitle: row.mission_title,
    sentAt: row.sent_at,
    answeredAt: row.answered_at,
    answers: row.answered_at
      ? { process: row.process_rating, communication: row.communication_rating, nps: row.nps, comment: row.comment }
      : null,
    link: `${window.location.origin}/survey/${row.token}`,
  };
}
