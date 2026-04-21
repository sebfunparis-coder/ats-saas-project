/**
 * 🎴 Kanban Card Component
 *
 * Carte draggable représentant une candidature dans le pipeline
 */

import React from 'react';
import { formatDate, formatInitials } from '@/core/utils/formatters';
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/config/constants';

export const KanbanCard = ({
  application,
  onView,
  onDragStart,
  onDragEnd
}) => {
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application', JSON.stringify(application));
    if (onDragStart) onDragStart(application);
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) onDragEnd();
  };

  // Get candidate info
  const candidateName = application.candidate
    ? `${application.candidate.firstName} ${application.candidate.lastName}`
    : 'Candidat inconnu';

  const candidateInitials = application.candidate
    ? formatInitials(application.candidate.firstName, application.candidate.lastName)
    : '?';

  // Get mission info
  const missionTitle = application.mission?.title || 'Mission inconnue';
  const missionCompany = application.mission?.company || '';

  // Status color
  const statusColor = APPLICATION_STATUS_COLORS[application.status] || 'bg-gray-100 text-gray-800';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onView && onView(application)}
      className="bg-white rounded-lg border border-gray-200 p-4 mb-3 cursor-move hover:shadow-lg transition-shadow group"
    >
      {/* Header with avatar and name */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
          {candidateInitials}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
            {candidateName}
          </h4>
          {application.candidate?.email && (
            <p className="text-xs text-gray-500 truncate">{application.candidate.email}</p>
          )}
        </div>

        {/* Priority badge (if high priority) */}
        {application.priority === 'high' && (
          <span className="text-lg" title="Haute priorité">
            🔥
          </span>
        )}
      </div>

      {/* Mission info */}
      <div className="mb-3 pb-3 border-b border-gray-100">
        <div className="flex items-start gap-2">
          <span className="text-gray-400 text-sm flex-shrink-0">💼</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 font-medium truncate">{missionTitle}</p>
            {missionCompany && (
              <p className="text-xs text-gray-500 truncate">{missionCompany}</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span>📅</span>
          <span>{formatDate(application.createdAt || application.appliedAt, 'short')}</span>
        </div>

        {/* Match score if available */}
        {application.matchScore !== undefined && (
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span className="font-medium text-gray-700">{application.matchScore}%</span>
          </div>
        )}
      </div>

      {/* Notes preview (if any) */}
      {application.notes && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-600 line-clamp-2">{application.notes}</p>
        </div>
      )}
    </div>
  );
};
