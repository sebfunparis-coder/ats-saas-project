/**
 * 📋 Recent Activity Component
 *
 * Affiche la liste des activités récentes
 */

import React from 'react';
import { Card } from '@/shared/components';
import { formatDate, formatTime } from '@/core/utils/formatters';

export const RecentActivity = ({ activities = [], maxItems = 10 }) => {
  const getActivityIcon = (type) => {
    const icons = {
      mission_created: '📝',
      mission_updated: '✏️',
      mission_deleted: '🗑️',
      candidate_created: '👤',
      candidate_updated: '✏️',
      candidate_deleted: '🗑️',
      application_created: '📨',
      application_status_changed: '🔄',
      interview_scheduled: '📅',
      offer_sent: '💼',
      candidate_hired: '🎉',
      candidate_rejected: '❌',
      comment_added: '💬',
      document_uploaded: '📎',
      team_member_added: '👥',
      client_created: '🏢',
      default: '🔔'
    };
    return icons[type] || icons.default;
  };

  const getActivityColor = (type) => {
    const colors = {
      mission_created: 'blue',
      mission_updated: 'orange',
      mission_deleted: 'red',
      candidate_created: 'blue',
      candidate_updated: 'orange',
      candidate_deleted: 'red',
      application_created: 'purple',
      application_status_changed: 'blue',
      interview_scheduled: 'green',
      offer_sent: 'purple',
      candidate_hired: 'green',
      candidate_rejected: 'red',
      comment_added: 'gray',
      document_uploaded: 'blue',
      team_member_added: 'green',
      client_created: 'blue',
      default: 'gray'
    };
    const color = colors[type] || colors.default;
    return {
      dot: `bg-${color}-500`,
      bg: `bg-${color}-50`,
      text: `text-${color}-900`
    };
  };

  const displayedActivities = activities.slice(0, maxItems);

  if (displayedActivities.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Activité récente
        </h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-gray-600">Aucune activité récente</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          📋 Activité récente
        </h3>
        {activities.length > maxItems && (
          <span className="text-sm text-gray-500">
            {maxItems} sur {activities.length}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {displayedActivities.map((activity, index) => {
          const colors = getActivityColor(activity.type);
          return (
            <div
              key={activity.id || index}
              className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center text-lg`}>
                {getActivityIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-sm text-gray-600 mt-0.5">
                    {activity.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {formatDate(activity.createdAt)}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {formatTime(activity.createdAt)}
                  </span>
                  {activity.user && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        par {activity.user.firstName} {activity.user.lastName}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Status badge (optional) */}
              {activity.status && (
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                    {activity.status}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activities.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Voir toutes les activités ({activities.length})
          </button>
        </div>
      )}
    </Card>
  );
};
