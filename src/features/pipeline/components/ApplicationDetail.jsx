/**
 * 👁️ Application Detail Component
 *
 * Modal de détail complet d'une candidature
 */

import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Select } from '@/shared/components';
import { formatDate, formatInitials } from '@/core/utils/formatters';
import { APPLICATION_STATUS, APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/config/constants';

export const ApplicationDetail = ({
  application,
  isOpen,
  onClose,
  onStatusChange,
  onReject,
  onAccept
}) => {
  if (!application) return null;

  // Candidate info
  const candidateName = application.candidate
    ? `${application.candidate.firstName} ${application.candidate.lastName}`
    : 'Candidat inconnu';

  const candidateInitials = application.candidate
    ? formatInitials(application.candidate.firstName, application.candidate.lastName)
    : '?';

  // Mission info
  const missionTitle = application.mission?.title || 'Mission inconnue';

  // Status info
  const statusColor = APPLICATION_STATUS_COLORS[application.status] || 'bg-gray-100 text-gray-800';
  const statusLabel = APPLICATION_STATUS_LABELS[application.status] || application.status;

  // Status options for select
  const statusOptions = Object.entries(APPLICATION_STATUS).map(([key, value]) => ({
    value,
    label: APPLICATION_STATUS_LABELS[value] || value
  }));

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (onStatusChange && newStatus !== application.status) {
      onStatusChange(application._id || application.id, newStatus);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <ModalHeader>
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-2xl flex-shrink-0">
            {candidateInitials}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{candidateName}</h2>
            <p className="text-gray-600">Candidature pour : {missionTitle}</p>
          </div>

          {/* Status badge */}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-6">
          {/* Candidate Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              👤 Informations du candidat
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {application.candidate?.email && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium w-32">Email:</span>
                  <a href={`mailto:${application.candidate.email}`} className="text-blue-600 hover:underline">
                    {application.candidate.email}
                  </a>
                </div>
              )}
              {application.candidate?.phone && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium w-32">Téléphone:</span>
                  <a href={`tel:${application.candidate.phone}`} className="text-blue-600 hover:underline">
                    {application.candidate.phone}
                  </a>
                </div>
              )}
              {application.candidate?.position && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium w-32">Poste actuel:</span>
                  <span className="text-gray-900">{application.candidate.position}</span>
                </div>
              )}
              {application.candidate?.experience && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium w-32">Expérience:</span>
                  <span className="text-gray-900">{application.candidate.experience}</span>
                </div>
              )}
            </div>
          </div>

          {/* Mission Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              💼 Informations de la mission
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-gray-600 font-medium w-32 flex-shrink-0">Titre:</span>
                <span className="text-gray-900">{missionTitle}</span>
              </div>
              {application.mission?.company && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium w-32">Entreprise:</span>
                  <span className="text-gray-900">{application.mission.company}</span>
                </div>
              )}
              {application.mission?.location && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium w-32">Localisation:</span>
                  <span className="text-gray-900">{application.mission.location}</span>
                </div>
              )}
              {application.mission?.contractType && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium w-32">Contrat:</span>
                  <span className="text-gray-900">{application.mission.contractType}</span>
                </div>
              )}
            </div>
          </div>

          {/* Application Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              📋 Détails de la candidature
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium w-32">Date:</span>
                <span className="text-gray-900">
                  {formatDate(application.createdAt || application.appliedAt, 'long')}
                </span>
              </div>
              {application.matchScore !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium w-32">Score de match:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                      <div
                        className={`h-2 rounded-full ${
                          application.matchScore >= 80
                            ? 'bg-green-500'
                            : application.matchScore >= 60
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${application.matchScore}%` }}
                      />
                    </div>
                    <span className="font-semibold text-gray-900">{application.matchScore}%</span>
                  </div>
                </div>
              )}
              {application.priority && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium w-32">Priorité:</span>
                  <span className={`font-medium ${
                    application.priority === 'high' ? 'text-red-600' :
                    application.priority === 'medium' ? 'text-orange-600' :
                    'text-gray-600'
                  }`}>
                    {application.priority === 'high' ? '🔥 Haute' :
                     application.priority === 'medium' ? '⚡ Moyenne' :
                     '📌 Normale'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes / Cover Letter */}
          {(application.notes || application.coverLetter) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                📝 {application.coverLetter ? 'Lettre de motivation' : 'Notes'}
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {application.coverLetter || application.notes}
                </p>
              </div>
            </div>
          )}

          {/* CV Link */}
          {application.candidate?.cvUrl && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                📄 CV
              </h3>
              <a
                href={application.candidate.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span>📥</span>
                <span>Télécharger le CV</span>
              </a>
            </div>
          )}

          {/* Change Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              🔄 Changer le statut
            </h3>
            <Select
              value={application.status}
              onChange={handleStatusChange}
              options={statusOptions}
            />
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">ID:</span> {application._id || application.id}
              </div>
              {application.updatedAt && application.updatedAt !== application.createdAt && (
                <div>
                  <span className="font-medium">Mis à jour:</span>{' '}
                  {formatDate(application.updatedAt, 'short')}
                </div>
              )}
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex justify-between w-full">
          <div className="flex gap-2">
            {onReject && application.status !== 'rejected' && (
              <Button
                variant="danger"
                onClick={() => onReject(application)}
                icon="❌"
              >
                Rejeter
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Fermer
            </Button>
            {onAccept && application.status !== 'hired' && (
              <Button onClick={() => onAccept(application)} icon="✅">
                Embaucher
              </Button>
            )}
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};
