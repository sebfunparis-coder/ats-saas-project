/**
 * 📅 Upcoming Events Component
 *
 * Affiche les événements à venir (entretiens, rappels)
 */

import React from 'react';
import { Card } from '@/shared/components';
import { formatDate, formatTime } from '@/core/utils/formatters';

export const UpcomingEvents = ({ events = [], maxItems = 5 }) => {
  const getEventIcon = (type) => {
    const icons = {
      interview: '🎤',
      phone_screen: '📞',
      meeting: '👥',
      deadline: '⏰',
      reminder: '🔔',
      follow_up: '📧',
      default: '📅'
    };
    return icons[type] || icons.default;
  };

  const getEventColor = (type) => {
    const colors = {
      interview: 'blue',
      phone_screen: 'green',
      meeting: 'purple',
      deadline: 'red',
      reminder: 'orange',
      follow_up: 'gray'
    };
    const color = colors[type] || 'blue';
    return {
      bg: `bg-${color}-50`,
      text: `text-${color}-900`,
      border: `border-${color}-200`
    };
  };

  const isToday = (date) => {
    const today = new Date();
    const eventDate = new Date(date);
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  };

  const isTomorrow = (date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const eventDate = new Date(date);
    return (
      eventDate.getDate() === tomorrow.getDate() &&
      eventDate.getMonth() === tomorrow.getMonth() &&
      eventDate.getFullYear() === tomorrow.getFullYear()
    );
  };

  const getDateLabel = (date) => {
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return 'Demain';
    return formatDate(date);
  };

  const displayedEvents = events
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, maxItems);

  if (displayedEvents.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📅 Événements à venir
        </h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-gray-600">Aucun événement prévu</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          📅 Événements à venir
        </h3>
        {events.length > maxItems && (
          <span className="text-sm text-gray-500">
            {maxItems} sur {events.length}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {displayedEvents.map((event, index) => {
          const colors = getEventColor(event.type);
          const isUrgent = isToday(event.date) || isTomorrow(event.date);

          return (
            <div
              key={event.id || index}
              className={`flex gap-3 p-3 rounded-lg border-l-4 ${colors.border} ${colors.bg} hover:shadow-sm transition-shadow`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 text-2xl">
                {getEventIcon(event.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {event.title}
                </p>
                {event.description && (
                  <p className="text-sm text-gray-600 mt-0.5">
                    {event.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs font-medium ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
                    {getDateLabel(event.date)}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-600">
                    {formatTime(event.date)}
                  </span>
                  {event.location && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-600">
                        📍 {event.location}
                      </span>
                    </>
                  )}
                </div>
                {event.participants && event.participants.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs text-gray-500">👥</span>
                    <span className="text-xs text-gray-600">
                      {event.participants.map(p => p.firstName).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Urgent badge */}
              {isUrgent && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Urgent
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {events.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Voir tous les événements ({events.length})
          </button>
        </div>
      )}
    </Card>
  );
};
