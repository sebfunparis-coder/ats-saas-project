/**
 * 📅 Calendar Page
 *
 * Agenda avec vues jour/semaine/mois
 */

import React, { useState, useMemo } from 'react';
import { useData } from '@/core/contexts';
import { Card, Button } from '@/shared/components';
import { formatDate, formatTime } from '@/core/utils/formatters';

export const CalendarPage = () => {
  const { events } = useData();
  const [view, setView] = useState('month'); // day, week, month
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get current month events
  const currentMonthEvents = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    return events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= start && eventDate <= end;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, currentDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  // Generate calendar grid
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
      days.push(null);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getDayEvents = (day) => {
    if (!day) return [];
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return currentMonthEvents.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getDate() === day &&
             eventDate.getMonth() === dayDate.getMonth() &&
             eventDate.getFullYear() === dayDate.getFullYear();
    });
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const getEventColor = (type) => {
    const colors = {
      interview: 'bg-blue-500',
      meeting: 'bg-purple-500',
      deadline: 'bg-red-500',
      phone_screen: 'bg-green-500',
      reminder: 'bg-orange-500',
      default: 'bg-gray-500'
    };
    return colors[type] || colors.default;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
            📅 {monthName}
          </h1>
          <p className="text-gray-600">
            {currentMonthEvents.length} événement{currentMonthEvents.length > 1 ? 's' : ''} ce mois
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={goToPreviousMonth}>
            ←
          </Button>
          <Button size="sm" variant="secondary" onClick={goToToday}>
            Aujourd'hui
          </Button>
          <Button size="sm" variant="secondary" onClick={goToNextMonth}>
            →
          </Button>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={view === 'day' ? 'primary' : 'ghost'}
          onClick={() => setView('day')}
        >
          Jour
        </Button>
        <Button
          size="sm"
          variant={view === 'week' ? 'primary' : 'ghost'}
          onClick={() => setView('week')}
        >
          Semaine
        </Button>
        <Button
          size="sm"
          variant={view === 'month' ? 'primary' : 'ghost'}
          onClick={() => setView('month')}
        >
          Mois
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card>
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 border-b">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="bg-white p-2 text-center font-semibold text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {calendarDays.map((day, index) => {
            const dayEvents = getDayEvents(day);
            return (
              <div
                key={index}
                className={`bg-white min-h-[120px] p-2 ${
                  day ? 'hover:bg-gray-50 cursor-pointer' : ''
                } ${isToday(day) ? 'bg-blue-50' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-semibold mb-1 ${
                      isToday(day) ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id || event._id}
                          className={`${getEventColor(event.type)} text-white text-xs px-2 py-1 rounded truncate`}
                          title={`${event.title} - ${formatTime(event.date)}`}
                        >
                          {formatTime(event.date)} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 px-2">
                          +{dayEvents.length - 3} autre{dayEvents.length - 3 > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Events List */}
      <Card title="Événements du mois">
        {currentMonthEvents.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📅</div>
            <p className="text-gray-600">Aucun événement ce mois</p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentMonthEvents.map(event => (
              <div
                key={event.id || event._id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <div className={`w-2 h-2 rounded-full ${getEventColor(event.type)}`} />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{event.title}</div>
                  <div className="text-sm text-gray-600">
                    {formatDate(event.date, 'long')} à {formatTime(event.date)}
                  </div>
                </div>
                {event.location && (
                  <div className="text-sm text-gray-600">📍 {event.location}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
