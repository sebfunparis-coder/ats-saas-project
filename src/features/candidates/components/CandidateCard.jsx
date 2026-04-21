/**
 * 👤 Candidate Card Component
 *
 * Carte d'affichage d'un candidat
 */

import React from 'react';
import { Card, Button, Checkbox } from '@/shared/components';
import { formatDate, formatInitials } from '@/core/utils/formatters';
import { CANDIDATE_STATUS_LABELS, CANDIDATE_STATUS_COLORS } from '@/config/constants';

export const CandidateCard = ({
  candidate,
  onView,
  onEdit,
  onDelete,
  selectable = false,
  selected = false,
  onSelect
}) => {
  const statusColor = CANDIDATE_STATUS_COLORS[candidate.status] || 'bg-gray-100 text-gray-800';
  const initials = formatInitials(candidate.firstName, candidate.lastName);

  return (
    <Card hover className={`h-full flex flex-col ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Selection checkbox */}
      {selectable && (
        <div className="mb-2">
          <Checkbox
            checked={selected}
            onChange={() => onSelect(candidate)}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg flex-shrink-0">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 cursor-pointer truncate"
            onClick={onView}
          >
            {candidate.firstName} {candidate.lastName}
          </h3>
          <p className="text-sm text-gray-600 truncate">{candidate.position}</p>
        </div>

        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor} flex-shrink-0`}>
          {CANDIDATE_STATUS_LABELS[candidate.status]}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4 flex-1">
        {candidate.email && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📧</span>
            <span className="truncate">{candidate.email}</span>
          </div>
        )}

        {candidate.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📞</span>
            <span>{candidate.phone}</span>
          </div>
        )}

        {candidate.location && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📍</span>
            <span>{candidate.location}</span>
          </div>
        )}

        {candidate.experience && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">💼</span>
            <span>{candidate.experience}</span>
          </div>
        )}

        {candidate.rating !== undefined && candidate.rating > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">⭐</span>
            <span>{candidate.rating}/5</span>
          </div>
        )}

        {candidate.skills && candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {candidate.skills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {skill}
              </span>
            ))}
            {candidate.skills.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                +{candidate.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>Ajouté le {formatDate(candidate.createdAt, 'short')}</span>
          {candidate.available && (
            <span className="font-medium text-green-600">Disponible</span>
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

          <Button
            size="sm"
            variant="secondary"
            onClick={onEdit}
            icon="✏️"
          >
            Éditer
          </Button>
        </div>
      </div>
    </Card>
  );
};
