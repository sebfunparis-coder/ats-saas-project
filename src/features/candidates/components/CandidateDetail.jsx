/**
 * 👁️ Candidate Detail Component
 *
 * Modal de détail complet d'un candidat
 */

import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FileUpload } from '@/shared/components';
import { formatDate, formatInitials } from '@/core/utils/formatters';
import { CANDIDATE_STATUS_LABELS, CANDIDATE_STATUS_COLORS } from '@/config/constants';

export const CandidateDetail = ({
  candidate,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onRate
}) => {
  const [candidateCv, setCandidateCv] = useState(candidate?.cvUrl);

  if (!candidate) return null;

  const statusColor = CANDIDATE_STATUS_COLORS[candidate.status] || 'bg-gray-100 text-gray-800';
  const initials = formatInitials(candidate.firstName, candidate.lastName);

  const handleRate = (rating) => {
    if (onRate) {
      onRate(candidate, rating);
    }
  };

  const handleUploadSuccess = (data) => {
    setCandidateCv(data.url);
    // Optionally update candidate in parent component
    console.log('CV uploadé:', data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <ModalHeader>
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-2xl flex-shrink-0">
            {initials}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {candidate.firstName} {candidate.lastName}
            </h2>
            <p className="text-gray-600">{candidate.position}</p>
          </div>

          {/* Status badge */}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
            {CANDIDATE_STATUS_LABELS[candidate.status]}
          </span>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              📞 Informations de contact
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {candidate.email && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium w-24">Email:</span>
                  <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:underline">
                    {candidate.email}
                  </a>
                </div>
              )}
              {candidate.phone && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium w-24">Téléphone:</span>
                  <a href={`tel:${candidate.phone}`} className="text-blue-600 hover:underline">
                    {candidate.phone}
                  </a>
                </div>
              )}
              {candidate.location && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium w-24">Localisation:</span>
                  <span className="text-gray-900">{candidate.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              💼 Informations professionnelles
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {candidate.position && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-600 font-medium w-32 flex-shrink-0">Poste:</span>
                  <span className="text-gray-900">{candidate.position}</span>
                </div>
              )}
              {candidate.experience && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-600 font-medium w-32 flex-shrink-0">Expérience:</span>
                  <span className="text-gray-900">{candidate.experience}</span>
                </div>
              )}
              {candidate.sector && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-600 font-medium w-32 flex-shrink-0">Secteur:</span>
                  <span className="text-gray-900">{candidate.sector}</span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <span className="text-gray-600 font-medium w-32 flex-shrink-0">Disponibilité:</span>
                <span className={`font-medium ${candidate.available ? 'text-green-600' : 'text-orange-600'}`}>
                  {candidate.available ? '✅ Disponible' : '⏳ Non disponible'}
                </span>
              </div>
            </div>
          </div>

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                🛠️ Compétences
              </h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rating */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              ⭐ Évaluation
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-4 mb-3">
                <span className="text-3xl font-bold text-gray-900">
                  {candidate.rating || 0}/5
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      className={`text-2xl transition-colors ${
                        star <= (candidate.rating || 0)
                          ? 'text-yellow-400 hover:text-yellow-500'
                          : 'text-gray-300 hover:text-gray-400'
                      }`}
                      title={`Noter ${star}/5`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Cliquez sur les étoiles pour modifier la note
              </p>
            </div>
          </div>

          {/* Notes */}
          {candidate.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                📝 Notes
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{candidate.notes}</p>
              </div>
            </div>
          )}

          {/* CV Upload & Download */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              📄 CV
            </h3>

            {/* Show download if CV exists */}
            {(candidateCv || candidate.cvUrl) && (
              <div className="mb-4">
                <a
                  href={candidateCv || candidate.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <span>📥</span>
                  <span>Télécharger le CV actuel</span>
                </a>
              </div>
            )}

            {/* Upload new CV */}
            <FileUpload
              candidateId={candidate._id || candidate.id}
              onUploadSuccess={handleUploadSuccess}
              accept=".pdf,.doc,.docx"
              maxSize={5 * 1024 * 1024}
              label={(candidateCv || candidate.cvUrl) ? 'Remplacer le CV' : 'Upload un CV'}
            />
          </div>

          {/* Applications */}
          {candidate.applicationCount !== undefined && candidate.applicationCount > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                📨 Candidatures
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900">
                  Ce candidat a postulé à <strong>{candidate.applicationCount}</strong> mission(s)
                </p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Créé le:</span>{' '}
                {formatDate(candidate.createdAt, 'long')}
              </div>
              {candidate.updatedAt && candidate.updatedAt !== candidate.createdAt && (
                <div>
                  <span className="font-medium">Modifié le:</span>{' '}
                  {formatDate(candidate.updatedAt, 'long')}
                </div>
              )}
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex justify-between w-full">
          <Button
            variant="danger"
            onClick={() => onDelete && onDelete(candidate)}
            icon="🗑️"
          >
            Supprimer
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Fermer
            </Button>
            <Button onClick={() => onEdit && onEdit(candidate)} icon="✏️">
              Modifier
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};
