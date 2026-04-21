/**
 * 🔍 Mission Detail Component
 *
 * Modal affichant les détails complets d'une mission
 */

import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from '@/shared/components';
import { formatDate, formatSalaryRange } from '@/core/utils/formatters';
import {
  MISSION_STATUS_LABELS,
  MISSION_STATUS_COLORS,
  REMOTE_LABELS
} from '@/config/constants';

/**
 * @param {object} props
 * @param {object} props.mission - Mission object
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 * @param {Function} props.onPublish - Publish handler
 * @param {Function} props.onClose - Close mission handler
 */
export const MissionDetail = ({
  mission,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onPublish,
  onCloseMission
}) => {
  if (!mission) return null;

  const statusColor = MISSION_STATUS_COLORS[mission.status] || 'bg-gray-100 text-gray-800';
  const remoteLabel = REMOTE_LABELS[mission.remote] || mission.remote;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <div className="flex items-start justify-between pr-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {mission.title}
            </h2>
            <p className="text-lg text-gray-600">{mission.company}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
            {MISSION_STATUS_LABELS[mission.status]}
          </span>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-6">
          {/* Key Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Type de contrat</p>
              <p className="font-medium text-gray-900">{mission.contract}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Localisation</p>
              <p className="font-medium text-gray-900">{mission.location}</p>
            </div>

            {mission.remote && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Mode de travail</p>
                <p className="font-medium text-gray-900">{remoteLabel}</p>
              </div>
            )}

            {mission.sector && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Secteur</p>
                <p className="font-medium text-gray-900">{mission.sector}</p>
              </div>
            )}

            {mission.department && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Département</p>
                <p className="font-medium text-gray-900">{mission.department}</p>
              </div>
            )}

            {(mission.minSalary || mission.maxSalary) && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Salaire</p>
                <p className="font-medium text-gray-900">
                  {formatSalaryRange(mission.minSalary, mission.maxSalary)}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          {mission.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description du poste</h3>
              <div className="prose prose-sm text-gray-600 whitespace-pre-wrap">
                {mission.description}
              </div>
            </div>
          )}

          {/* Requirements */}
          {mission.requirements && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Compétences requises</h3>
              <div className="prose prose-sm text-gray-600 whitespace-pre-wrap">
                {mission.requirements}
              </div>
            </div>
          )}

          {/* Benefits */}
          {mission.benefits && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Avantages</h3>
              <div className="prose prose-sm text-gray-600 whitespace-pre-wrap">
                {mission.benefits}
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Date de création</p>
                <p className="font-medium text-gray-900">
                  {formatDate(mission.createdAt, 'long')}
                </p>
              </div>

              {mission.applicationsCount !== undefined && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Candidatures</p>
                  <p className="font-medium text-gray-900">
                    {mission.applicationsCount} candidature{mission.applicationsCount > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex gap-3 w-full">
          {mission.status === 'draft' && (
            <Button
              variant="success"
              onClick={() => {
                onPublish(mission);
                onClose();
              }}
              icon="📢"
            >
              Publier
            </Button>
          )}

          {mission.status === 'active' && (
            <Button
              variant="secondary"
              onClick={() => {
                onCloseMission(mission);
                onClose();
              }}
              icon="🔒"
            >
              Fermer
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() => {
              onEdit(mission);
              onClose();
            }}
            icon="✏️"
          >
            Éditer
          </Button>

          <Button
            variant="danger"
            onClick={() => {
              if (confirm('Êtes-vous sûr de vouloir supprimer cette mission ?')) {
                onDelete(mission);
                onClose();
              }
            }}
            icon="🗑️"
          >
            Supprimer
          </Button>

          <div className="flex-1"></div>

          <Button variant="ghost" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};
