const DELETION_PROOFS_KEY = 'ats_deletion_proofs';

/**
 * Historique local des preuves de suppression (droit à l'oubli — Art. 17 RGPD).
 * Sert de trace d'audit en l'absence d'AuditLog Express accessible en prod
 * (même constat que pour T-221/T-224 : backend non déployé).
 */
export function getDeletionProofs() {
  try {
    return JSON.parse(localStorage.getItem(DELETION_PROOFS_KEY)) || [];
  } catch {
    return [];
  }
}

function logDeletionProof(proof) {
  const next = [proof, ...getDeletionProofs()].slice(0, 50);
  localStorage.setItem(DELETION_PROOFS_KEY, JSON.stringify(next));
  return next;
}

/**
 * Génère et télécharge une preuve de suppression (certificat JSON) pour un candidat,
 * et l'enregistre dans l'historique local des suppressions.
 *
 * @param {Object} params
 * @param {Object} params.candidate - Candidat tel qu'il existait avant suppression
 * @param {number} params.deletedApplicationsCount - Nombre de candidatures liées supprimées
 * @param {number} params.deletedHistoryEntriesCount - Nombre d'entrées d'historique purgées
 * @param {number} [params.deletedShareLinksCount] - Nombre de liens de partage manager purgés (T-382)
 * @param {number} [params.deletedTrackingLinksCount] - Nombre de liens de suivi candidat purgés (T-382)
 * @param {string} [params.actorId]
 * @param {string} [params.actorEmail]
 */
export function generateAndDownloadDeletionProof({ candidate, deletedApplicationsCount = 0, deletedHistoryEntriesCount = 0, deletedShareLinksCount = 0, deletedTrackingLinksCount = 0, actorId, actorEmail }) {
  const proof = {
    action: 'right_to_erasure',
    legalBasis: "Droit à l'effacement — Art. 17 RGPD",
    candidateId: candidate.id,
    candidateName: candidate.name,
    candidateEmail: candidate.email,
    cvDeleted: !!candidate.resume,
    notesDeleted: !!candidate.notes,
    deletedApplicationsCount,
    deletedHistoryEntriesCount,
    deletedShareLinksCount,
    deletedTrackingLinksCount,
    actorId: actorId || null,
    actorEmail: actorEmail || null,
    deletedAt: new Date().toISOString(),
  };

  logDeletionProof(proof);

  const blob = new Blob([JSON.stringify(proof, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (candidate.name || 'candidat').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  a.download = `preuve-suppression-${safeName}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return proof;
}
