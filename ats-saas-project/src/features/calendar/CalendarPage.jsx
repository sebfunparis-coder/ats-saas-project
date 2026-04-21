import React, { useState, useMemo } from 'react';
import { useData } from '@/core/contexts/DataContext';
import EventForm from './components/EventForm';

/**
 * Page Calendar - Agenda avec vues jour/semaine/mois + fonctionnalités complètes
 */
export function CalendarPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useData();
  const [view, setView] = useState('month'); // 'day', 'week', 'month'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('all');

  // 🔥 Fonctions de navigation
  const navigatePeriod = (direction) => {
    const newDate = new Date(selectedDate);

    if (view === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    }

    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // 🔥 Gestion des événements
  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setIsFormOpen(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setIsFormOpen(true);
  };

  const handleSubmitEvent = (eventData) => {
    if (selectedEvent) {
      updateEvent(eventData);
    } else {
      addEvent(eventData);
    }
    setIsFormOpen(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Supprimer cet événement ?')) {
      deleteEvent(eventId);
    }
  };

  const viewButtons = [
    { id: 'day', icon: '📅', label: 'Jour' },
    { id: 'week', icon: '📆', label: 'Semaine' },
    { id: 'month', icon: '🗓️', label: 'Mois' }
  ];

  const eventTypeColors = {
    interview: '#667EEA',
    meeting: '#10B981',
    call: '#F59E0B',
    email: '#8B5CF6',
    deadline: '#EF4444',
    other: '#6B7280'
  };

  // 🔥 Filtrer les événements
  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return events;
    return events.filter(e => e.type === filterType);
  }, [events, filterType]);

  // 🔥 Compter les événements par type
  const eventCounts = useMemo(() => ({
    total: filteredEvents.length,
    interview: filteredEvents.filter(e => e.type === 'interview').length,
    meeting: filteredEvents.filter(e => e.type === 'meeting').length,
    deadline: filteredEvents.filter(e => e.type === 'deadline').length,
  }), [filteredEvents]);

  // 🔥 Obtenir les événements pour une date spécifique
  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredEvents.filter(e => e.date === dateStr);
  };

  // 🔥 Obtenir le titre de la période affichée
  const getPeriodTitle = () => {
    if (view === 'month') {
      return selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    } else if (view === 'week') {
      const weekStart = new Date(selectedDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `Semaine du ${weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au ${weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else {
      return selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  // 🔥 Générer les jours du mois pour la vue calendrier
  const getMonthDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Lundi = 0
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Jours du mois précédent
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Jours du mois actuel
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Jours du mois suivant pour compléter la grille (42 = 6 semaines)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  // 🔥 Générer les jours de la semaine
  const getWeekDays = () => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Lundi

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }

    return days;
  };

  return (
    <div style={{ padding: '50px', background: 'linear-gradient(180deg, #ffffff 0%, #fef5ff 50%, #f3e7ff 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '12px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              📅 Agenda
            </h1>
            <p style={{ fontSize: '18px', color: '#6B7280' }}>Planification et gestion de vos événements</p>
          </div>
          <button
            onClick={handleCreateEvent}
            style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)', transition: 'all 0.3s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            ➕ Nouvel Événement
          </button>
        </div>

        {/* Stats Rapides */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
          {[
            { icon: '📋', label: 'Total Événements', value: eventCounts.total, color: '#667EEA' },
            { icon: '👥', label: 'Entretiens', value: eventCounts.interview, color: '#10B981' },
            { icon: '📅', label: 'Réunions', value: eventCounts.meeting, color: '#F59E0B' },
            { icon: '⏰', label: 'Échéances', value: eventCounts.deadline, color: '#EF4444' }
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                padding: '24px',
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = stat.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'transparent';
              }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>{stat.icon}</div>
              <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>{stat.label}</div>
              <div style={{ fontSize: '32px', fontWeight: '900', background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}99 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Contrôles de Vue */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

            {/* Navigation Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => navigatePeriod(-1)}
                style={{ padding: '12px 20px', background: '#F3F4F6', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '18px', color: '#1F2937', transition: 'all 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#F3F4F6'}>
                ←
              </button>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#1F2937', minWidth: '350px', textAlign: 'center', textTransform: 'capitalize' }}>
                {getPeriodTitle()}
              </div>
              <button
                onClick={() => navigatePeriod(1)}
                style={{ padding: '12px 20px', background: '#F3F4F6', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '18px', color: '#1F2937', transition: 'all 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#F3F4F6'}>
                →
              </button>
              <button
                onClick={goToToday}
                style={{ padding: '12px 24px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#5568D3'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#667EEA'}>
                Aujourd'hui
              </button>
            </div>

            {/* Sélecteur de Vue */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {viewButtons.map(btn => (
                <button
                  key={btn.id}
                  onClick={() => setView(btn.id)}
                  style={{
                    padding: '12px 24px',
                    background: view === btn.id ? 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)' : '#F3F4F6',
                    color: view === btn.id ? 'white' : '#6B7280',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s',
                    boxShadow: view === btn.id ? '0 6px 20px rgba(102, 126, 234, 0.4)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (view !== btn.id) e.currentTarget.style.background = '#E5E7EB';
                  }}
                  onMouseLeave={(e) => {
                    if (view !== btn.id) e.currentTarget.style.background = '#F3F4F6';
                  }}>
                  <span>{btn.icon}</span>
                  <span>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calendrier */}
        <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          {view === 'month' && (
            <div>
              {/* En-tête des jours */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '16px' }}>
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => (
                  <div key={i} style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '800', color: '#6B7280' }}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Grille des jours */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                {getMonthDays().map((dayInfo, i) => {
                  const { date, isCurrentMonth } = dayInfo;
                  const dayEvents = getEventsForDate(date);
                  const today = new Date();
                  const isToday = date.toDateString() === today.toDateString();

                  return (
                    <div
                      key={i}
                      style={{
                        minHeight: '100px',
                        padding: '12px',
                        background: isToday ? 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)' : isCurrentMonth ? '#F9FAFB' : '#FAFAFA',
                        borderRadius: '12px',
                        cursor: isCurrentMonth ? 'pointer' : 'default',
                        opacity: isCurrentMonth ? 1 : 0.4,
                        border: dayEvents.length > 0 ? '2px solid #667EEA' : '2px solid transparent',
                        transition: 'all 0.3s'
                      }}
                      onClick={() => {
                        if (isCurrentMonth) {
                          setSelectedDate(date);
                          setView('day');
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (isCurrentMonth) {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.borderColor = '#667EEA';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isCurrentMonth) {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.borderColor = dayEvents.length > 0 ? '#667EEA' : 'transparent';
                        }
                      }}>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: isToday ? 'white' : isCurrentMonth ? '#1F2937' : '#9CA3AF', marginBottom: '8px' }}>
                        {date.getDate()}
                      </div>
                      {dayEvents.length > 0 && isCurrentMonth && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {dayEvents.slice(0, 2).map((event, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '4px 8px',
                                background: eventTypeColors[event.type],
                                color: 'white',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: '700',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditEvent(event);
                              }}>
                              {event.time} - {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div style={{ fontSize: '10px', color: isToday ? 'white' : '#6B7280', fontWeight: '600' }}>
                              +{dayEvents.length - 2} autres
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === 'week' && (
            <div>
              {/* En-tête des jours */}
              <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', gap: '8px', marginBottom: '16px' }}>
                <div style={{ padding: '12px' }}></div>
                {getWeekDays().map((day, i) => {
                  const today = new Date();
                  const isToday = day.toDateString() === today.toDateString();
                  return (
                    <div
                      key={i}
                      style={{
                        padding: '12px',
                        textAlign: 'center',
                        borderRadius: '8px',
                        background: isToday ? 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)' : 'transparent',
                        color: isToday ? 'white' : '#1F2937',
                      }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                        {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '900' }}>
                        {day.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grille horaire */}
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {Array.from({ length: 14 }, (_, i) => i + 8).map(hour => (
                  <div key={hour} style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#6B7280', textAlign: 'right' }}>
                      {String(hour).padStart(2, '0')}:00
                    </div>
                    {getWeekDays().map((day, dayIdx) => {
                      const dayEvents = getEventsForDate(day).filter(e => {
                        const eventHour = parseInt(e.time.split(':')[0]);
                        return eventHour === hour;
                      });

                      return (
                        <div
                          key={dayIdx}
                          style={{
                            minHeight: '60px',
                            padding: '4px',
                            background: '#F9FAFB',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onClick={() => {
                            setSelectedDate(day);
                            handleCreateEvent();
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#F9FAFB'}>
                          {dayEvents.map((event, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '6px 8px',
                                background: eventTypeColors[event.type],
                                color: 'white',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                marginBottom: '4px',
                                cursor: 'pointer',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditEvent(event);
                              }}>
                              {event.time} - {event.title}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'day' && (
            <div>
              {/* Liste des événements du jour */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {getEventsForDate(selectedDate).length > 0 ? (
                  getEventsForDate(selectedDate)
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((event, i) => (
                      <div
                        key={event.id || i}
                        style={{
                          padding: '20px',
                          background: '#F9FAFB',
                          borderRadius: '12px',
                          borderLeft: `4px solid ${eventTypeColors[event.type]}`,
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onClick={() => handleEditEvent(event)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateX(8px)';
                          e.currentTarget.style.background = '#F3F4F6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.background = '#F9FAFB';
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '18px', fontWeight: '800', color: '#1F2937', marginBottom: '8px' }}>
                              {event.title}
                            </div>
                            {event.description && (
                              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                                {event.description}
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#9CA3AF', flexWrap: 'wrap' }}>
                              <span>🕐 {event.time} ({event.duration || 60} min)</span>
                              {event.location && <span>📍 {event.location}</span>}
                              {event.participants && <span>👤 {event.participants}</span>}
                            </div>
                          </div>
                          <div style={{
                            padding: '6px 16px',
                            background: eventTypeColors[event.type],
                            color: 'white',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            whiteSpace: 'nowrap'
                          }}>
                            {event.type === 'interview' && '👥 Entretien'}
                            {event.type === 'meeting' && '📅 Réunion'}
                            {event.type === 'call' && '📞 Appel'}
                            {event.type === 'email' && '📧 Email'}
                            {event.type === 'deadline' && '⏰ Échéance'}
                            {event.type === 'other' && '📌 Autre'}
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Aucun événement</div>
                    <div style={{ fontSize: '14px' }}>Cliquez sur "➕ Nouvel Événement" pour en créer un</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Formulaire d'événement */}
      <EventForm
        event={selectedEvent}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedEvent(null);
        }}
        onSubmit={handleSubmitEvent}
      />
    </div>
  );
}

export default CalendarPage;
