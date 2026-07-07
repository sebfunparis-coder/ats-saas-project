import JSZip from 'jszip';

/**
 * Export RGPD complet d'un candidat (T-223).
 * Génère un ZIP côté navigateur : profil JSON + CV + candidatures + entretiens + historique + notes + références.
 * Tout est déjà chargé côté client (DataContext/Supabase) — aucun appel réseau supplémentaire nécessaire.
 *
 * @param {Object} params
 * @param {Object} params.candidate - Objet candidat complet (depuis DataContext)
 * @param {Array} params.applications - Candidatures déjà filtrées pour ce candidat
 * @param {Array} params.evaluations - Évaluations/entretiens déjà filtrés pour ce candidat
 * @param {Array} params.timeline - Entrées de timeline/historique déjà agrégées pour ce candidat
 * @param {Array} params.references - Références (stockées en localStorage)
 */
export async function exportCandidateRGPD({ candidate, applications = [], evaluations = [], timeline = [], references = [] }) {
  const zip = new JSZip();
  const { resume, ...profileWithoutCV } = candidate;

  // Profil candidat (sans le base64 du CV, exporté séparément en fichier binaire)
  const profile = {
    ...profileWithoutCV,
    cv: resume ? { fileName: resume.fileName, fileSizeFormatted: resume.fileSizeFormatted, uploadDate: resume.uploadDate } : null,
    exportedAt: new Date().toISOString(),
    exportType: 'RGPD - Droit d\'accès / portabilité (Art. 15 & 20 RGPD)',
  };
  zip.file('profil.json', JSON.stringify(profile, null, 2));

  // CV (décodage du data URI base64 en binaire)
  if (resume?.base64Data) {
    const base64 = resume.base64Data.replace(/^data:[^;]+;base64,/, '');
    zip.file(`cv/${resume.fileName || 'cv.pdf'}`, base64, { base64: true });
  }

  zip.file('candidatures.json', JSON.stringify(applications, null, 2));
  zip.file('entretiens.json', JSON.stringify(evaluations, null, 2));
  zip.file('historique.json', JSON.stringify(timeline, null, 2));
  zip.file('references.json', JSON.stringify(references, null, 2));

  if (candidate.notes) {
    zip.file('notes-internes.txt', candidate.notes);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (candidate.name || 'candidat').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  a.download = `export-rgpd-${safeName}-${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
