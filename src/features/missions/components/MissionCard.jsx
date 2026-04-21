/**
 * 💼 Mission Card Component
 *
 * Carte d'affichage d'une mission
 */

import React from 'react';
import { Card, Button, Checkbox } from '@/shared/components';
import { formatDate, formatSalaryRange } from '@/core/utils/formatters';
import {
  MISSION_STATUS_LABELS,
  MISSION_STATUS_COLORS,
  REMOTE_LABELS
} from '@/config/constants';

/**
 * @param {object} props
 * @param {object} props.mission - Mission object
 * @param {Function} props.onView - View details handler
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 * @param {Function} props.onPublish - Publish handler
 * @param {Function} props.onClose - Close handler
 * @param {boolean} props.selectable - Show checkbox for selection
 * @param {boolean} props.selected - Is selected
 * @param {Function} props.onSelect - Selection handler
 */
export const MissionCard = ({
  mission,
  onView,
  onEdit,
  onDelete,
  onPublish,
  onClose,
  selectable = false,
  selected = false,
  onSelect
}) => {
  const statusColor = MISSION_STATUS_COLORS[mission.status] || 'bg-gray-100 text-gray-800';
  const remoteLabel = REMOTE_LABELS[mission.remote] || mission.remote;

  return (
    <Card hover className={`h-full flex flex-col ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Selection checkbox */}
      {selectable && (
        <div className="mb-2">
          <Checkbox
            checked={selected}
            onChange={() => onSelect(mission)}
          />
        </div>
      )}

      {/* Header with status badge */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3
            className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 cursor-pointer"
            onClick={onView}
          >
            {mission.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {mission.company}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {MISSION_STATUS_LABELS[mission.status]}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4 flex-1">
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">📍</span>
          <span>{mission.location}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">📝</span>
          <span>{mission.contract}</span>
        </div>

        {mission.remote && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">💻</span>
            <span>{remoteLabel}</span>
          </div>
        )}

        {(mission.minSalary || mission.maxSalary) && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">💰</span>
            <span>{formatSalaryRange(mission.minSalary, mission.maxSalary)}</span>
          </div>
        )}

        {mission.sector && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">🏢</span>
            <span>{mission.sector}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>Créée le {formatDate(mission.createdAt, 'short')}</span>
          {mission.applicationsCount > 0 && (
            <span className="font-medium text-blue-600">
              {mission.applicationsCount} candidature{mission.applicationsCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onView}
            className="flex-1"
          >
            Voir
          </Button>

          {mission.status === 'draft' && (
            <Button
              size="sm"
              variant="success"
              onClick={onPublish}
              icon="📢"
            >
              Publier
            </Button>
          )}

          {mission.status === 'active' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onClose}
              icon="🔒"
            >
              Fermer
            </Button>
          )}

          <Button
            size="sm"
            variant="secondary"
            onClick={onEdit}
            icon="✏️"
          >
            Éditer
          </Button>

          {onDuplicate && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDuplicate(mission)}
              icon="📋"
              title="Dupliquer"
            />
          )}
        </div>
      </div>
    </Card>
  );
};
