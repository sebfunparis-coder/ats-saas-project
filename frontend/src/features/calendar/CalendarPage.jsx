import React, { useState, useMemo, useRef } from 'react';
import { useData } from '@/core/contexts/DataContext';
import { useAuth } from '@/core/contexts/AuthContext';
import { useConfirm } from '@/core/contexts/ConfirmContext';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import EventForm from './components/EventForm';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import StatsCard, { StatsGrid } from '@/shared/components/StatsCard/StatsCard';
import { createAvailabilityLink } from '@/core/utils/availabilityLink';

const _getLocale = () => { const l = localStorage.getItem('ats_language') || 'fr'; return l.startsWith('en') ? 'en-GB' : 'fr-FR'; };

/**
 * Page Calendar - Agenda avec vues jour/semaine/mois + fonctionnalités complètes
 */
export function CalendarPage() {
  const { events, addEvent, updateEvent, deleteEvent, team } = useData();
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const { error: showError } = useNotifications();
  const isMobile = useIsMobile();
  const [view, setView] = useState('month'); // 'agenda', 'day', 'week', 'month'
  const [colorByRecruiter, setColorByRecruiter] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const draggedEventRef = useRef(null);
  const [dragOverSlot, setDragOverSlot] = useState(null); // { dayIso, hour }
  const [availModalOpen, setAvailModalOpen] = useState(false);
  const [availDuration, setAvailDuration] = useState('60');
  const [availNote, setAvailNote] = useState('');
  const [availSlots, setAvailSlots] = useState({}); // { 'YYYY-MM-DD': Set<'HH:MM'> }
  const [availLink, setAvailLink] = useState(null); // generated URL
  const [availCopied, setAvailCopied] = useState(false);
  const [availGenerating, setAvailGenerating] = useState(false);

  const CHECKLIST_KEY = 'ats_interview_checklist';
  const DEFAULT_CHECKLIST = [
    'CV imprimé / lu',
    'Salle réservée',
    'Questions préparées',
    'Grille d\'évaluation imprimée',
    'Profil LinkedIn consulté',
    'Recruteur notifié',
    'Offre salariale validée',
    'Tests techniques prêts',
  ];

  const [checklistEvent, setChecklistEvent] = useState(null);
  const [checklistState, setChecklistState] = useState({});

  const loadChecklist = (eventId) => {
    try {
      const all = JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '{}');
      return all[String(eventId)] || DEFAULT_CHECKLIST.reduce((acc, item) => { acc[item] = false; return acc; }, {});
    } catch { return DEFAULT_CHECKLIST.reduce((acc, item) => { acc[item] = false; return acc; }, {}); }
  };

  const saveChecklist = (eventId, state) => {
    try {
      const all = JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '{}');
      all[String(eventId)] = state;
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify(all));
    } catch {}
  };

  const toggleChecklistItem = (item) => {
    const updated = { ...checklistState, [item]: !checklistState[item] };
    setChecklistState(updated);
    if (checklistEvent) saveChecklist(checklistEvent.id, updated);
  };

  const HOURS = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'];

  const next7Days = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }, []);

  const toggleAvailSlot = (date, hour) => {
    setAvailSlots(prev => {
      const set = new Set(prev[date] || []);
      if (set.has(hour)) set.delete(hour); else set.add(hour);
      return { ...prev, [date]: set };
    });
  };

  const handleGenerateLink = async () => {
    // T-426 : la génération/lecture passait par localStorage — un candidat
    // ouvrant ce lien depuis son propre appareil (le seul vrai destinataire)
    // ne trouvait jamais la donnée (localStorage n'est jamais partagé entre
    // navigateurs). Persisté en base désormais (table availability_links,
    // migration 035), même pattern que tracking_links/share_links.
    const slots = [];
    Object.entries(availSlots).forEach(([date, times]) => {
      times.forEach(time => slots.push({ date, time, bookedBy: null }));
    });
    setAvailGenerating(true);
    try {
      const url = await createAvailabilityLink({
        companyId: user?.companyId,
        recruiterName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Recruteur',
        note: availNote,
        duration: parseInt(availDuration) || 60,
        slots,
        actorId: user?.id,
      });
      setAvailLink(url);
    } catch (err) {
      showError('Erreur', `Impossible de générer le lien de disponibilité : ${err.message}`);
    } finally {
      setAvailGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (availLink) {
      navigator.clipboard.writeText(availLink).then(() => {
        setAvailCopied(true);
        setTimeout(() => setAvailCopied(false), 2000);
      });
    }
  };

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
  const [quickDate, setQuickDate] = useState(null);
  const [quickHour, setQuickHour] = useState(null);

  const handleCreateEvent = (date = null, hour = null) => {
    setSelectedEvent(null);
    setQuickDate(date);
    setQuickHour(hour);
    setIsFormOpen(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setIsFormOpen(true);
  };

  const handleSubmitEvent = (eventData) => {
    // T-332 : addEvent/updateEvent propagent désormais réellement les erreurs
    // Supabase (avant : succès simulé silencieux) — il faut donc les capter ici.
    const onError = (error) => {
      console.error('Erreur enregistrement événement:', error);
      showError('Erreur', error.message);
    };
    if (selectedEvent) {
      const eventId = selectedEvent.id || selectedEvent._id;
      updateEvent(eventId, eventData).catch(onError);
    } else {
      addEvent({ ...eventData, createdBy: user?.name || user?.email || 'Moi' }).catch(onError);
    }
    setIsFormOpen(false);
    setSelectedEvent(null);
  };

  const RECRUITER_PALETTE = ['#667EEA','#10B981','#F59E0B','#EC4899','#8B5CF6','#EF4444','#06B6D4','#84CC16'];
  const recruiterColors = useMemo(() => {
    const map = {};
    const recruiterNames = [...new Set(events.map(e => e.createdBy).filter(Boolean))];
    recruiterNames.forEach((name, i) => {
      const member = (team || []).find(m => m.name === name || m.email === name);
      map[name] = member?.color || RECRUITER_PALETTE[i % RECRUITER_PALETTE.length];
    });
    return map;
  }, [events, team]);

  const getEventColor = (event) => {
    if (colorByRecruiter && event.createdBy && recruiterColors[event.createdBy]) {
      return recruiterColors[event.createdBy];
    }
    return eventTypeColors[event.type] || '#6B7280';
  };

  const handleDeleteEvent = async (eventId) => {
    if (await confirm('Supprimer cet événement ?', { title: 'Supprimer l\'événement' })) {
      deleteEvent(eventId);
    }
  };

  const handleExportICal = () => {
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ATS SaaS//Calendar//FR',
      'CALSCALE:GREGORIAN',
    ];
    filteredEvents.forEach(ev => {
      const dtStart = ev.date ? ev.date.replace(/-/g, '') + (ev.time ? 'T' + ev.time.replace(':', '') + '00' : '') : '';
      icsLines.push(
        'BEGIN:VEVENT',
        `UID:${ev.id || Math.random().toString(36).slice(2)}@ats-saas`,
        `SUMMARY:${ev.title || 'Événement'}`,
        `DTSTART${ev.time ? '' : ';VALUE=DATE'}:${dtStart}`,
        ev.description ? `DESCRIPTION:${ev.description.replace(/\n/g, '\\n')}` : '',
        'END:VEVENT',
      );
    });
    icsLines.push('END:VCALENDAR');
    const blob = new Blob([icsLines.filter(Boolean).join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'ats-agenda.ics'; a.click();
    URL.revokeObjectURL(url);
  };

  const viewButtons = [
    { id: 'agenda', icon: '📋', label: 'Agenda' },
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
    call: filteredEvents.filter(e => e.type === 'call').length,
    email: filteredEvents.filter(e => e.type === 'email').length,
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
      return selectedDate.toLocaleDateString(_getLocale(), { month: 'long', year: 'numeric' });
    } else if (view === 'week') {
      const weekStart = new Date(selectedDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `Semaine du ${weekStart.toLocaleDateString(_getLocale(), { day: 'numeric', month: 'short' })} au ${weekEnd.toLocaleDateString(_getLocale(), { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else {
      return selectedDate.toLocaleDateString(_getLocale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
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
    <div style={{ padding: '32px', background: 'linear-gradient(180deg, #ffffff 0%, #fef5ff 50%, #f3e7ff 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '8px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Agenda
            </h1>
            <p style={{ fontSize: '16px', color: '#6B7280' }}>Planification et gestion de vos événements</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => { setAvailLink(null); setAvailSlots({}); setAvailModalOpen(true); }}
              style={{ padding: '14px 20px', background: 'white', color: '#10B981', border: '2px solid #10B981', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.3s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F0FDF4'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}>
              🔗 Lien de dispo
            </button>
            <button
              onClick={handleExportICal}
              style={{ padding: '14px 20px', background: 'white', color: '#667EEA', border: '2px solid #667EEA', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.3s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#EEF2FF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}>
              📅 Export iCal
            </button>
            <button
              onClick={handleCreateEvent}
              style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)', transition: 'all 0.3s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              ➕ Nouvel Événement
            </button>
          </div>
        </div>

        {/* Stats Rapides */}
        <StatsGrid>
          <StatsCard icon="📋" label="Total Événements" value={eventCounts.total} color="#667EEA" />
          <StatsCard icon="👥" label="Entretiens" value={eventCounts.interview} color="#10B981" />
          <StatsCard icon="📅" label="Réunions" value={eventCounts.meeting} color="#F59E0B" />
          <StatsCard icon="📞" label="Appels" value={eventCounts.call} color="#3B82F6" />
          <StatsCard icon="✉️" label="Emails" value={eventCounts.email} color="#8B5CF6" />
          <StatsCard icon="⏰" label="Échéances" value={eventCounts.deadline} color="#EF4444" />
        </StatsGrid>

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

            {/* Sélecteur de Vue + toggle recruteur */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setColorByRecruiter(v => !v)}
                style={{ padding: '10px 16px', borderRadius: '10px', border: `1.5px solid ${colorByRecruiter ? '#667EEA' : '#E5E7EB'}`, background: colorByRecruiter ? '#EEF2FF' : 'white', color: colorByRecruiter ? '#667EEA' : '#6B7280', cursor: 'pointer', fontWeight: '700', fontSize: '13px', transition: 'all 0.2s' }}
              >
                👤 {colorByRecruiter ? 'Par recruteur ✓' : 'Par type'}
              </button>
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

        {/* Légende recruteurs */}
        {colorByRecruiter && Object.keys(recruiterColors).length > 0 && (
          <div style={{ background: 'white', padding: '14px 24px', borderRadius: '14px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase' }}>Recruteurs :</span>
            {Object.entries(recruiterColors).map(([name, color]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{name}</span>
              </div>
            ))}
          </div>
        )}

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
                          handleCreateEvent(date.toISOString().split('T')[0], null);
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
                                background: getEventColor(event),
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
                        {day.toLocaleDateString(_getLocale(), { weekday: 'short' })}
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

                      const slotKey = `${day.toISOString().split('T')[0]}-${hour}`;
                      const isOver = dragOverSlot === slotKey;
                      return (
                        <div
                          key={dayIdx}
                          style={{
                            minHeight: '60px',
                            padding: '4px',
                            background: isOver ? '#EEF2FF' : '#F9FAFB',
                            borderRadius: '8px',
                            border: isOver ? '2px dashed #667EEA' : '1px solid #E5E7EB',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                          onClick={() => { setSelectedDate(day); handleCreateEvent(day.toISOString().split('T')[0], hour); }}
                          onDragOver={(e) => { e.preventDefault(); setDragOverSlot(slotKey); }}
                          onDragLeave={() => setDragOverSlot(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragOverSlot(null);
                            const ev = draggedEventRef.current;
                            if (!ev) return;
                            draggedEventRef.current = null;
                            const newDate = day.toISOString().split('T')[0];
                            const newTime = `${String(hour).padStart(2, '0')}:00`;
                            const evId = ev.id || ev._id;
                            updateEvent(evId, { ...ev, date: newDate, time: newTime }).catch(error => {
                              console.error('Erreur déplacement événement:', error);
                              showError('Erreur', error.message);
                            });
                          }}
                        >
                          {dayEvents.map((event, idx) => (
                            <div
                              key={idx}
                              draggable
                              onDragStart={(e) => {
                                draggedEventRef.current = event;
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onDragEnd={() => { draggedEventRef.current = null; setDragOverSlot(null); }}
                              style={{
                                padding: '6px 8px',
                                background: getEventColor(event),
                                color: 'white',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                marginBottom: '4px',
                                cursor: 'grab',
                              }}
                              onClick={(e) => { e.stopPropagation(); handleEditEvent(event); }}
                            >
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

          {view === 'agenda' && (() => {
            const now = new Date();
            const end = new Date(now); end.setDate(end.getDate() + 30);
            const upcoming = filteredEvents
              .filter(e => { if (!e.date) return false; const d = new Date(e.date); return d >= now && d <= end; })
              .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));

            const grouped = upcoming.reduce((acc, ev) => {
              (acc[ev.date] = acc[ev.date] || []).push(ev);
              return acc;
            }, {});

            const TYPE_ICONS = { interview: '👥', meeting: '📅', call: '📞', email: '📧', deadline: '⏰', other: '📌' };
            const today = now.toISOString().split('T')[0];
            const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            if (!upcoming.length) return (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Aucun événement dans les 30 prochains jours</div>
                <div style={{ fontSize: '14px' }}>Créez un événement pour le voir apparaître ici</div>
              </div>
            );

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {Object.entries(grouped).map(([dateStr, evs]) => {
                  const d = new Date(dateStr + 'T00:00:00');
                  const dayLabel = dateStr === today ? "Aujourd'hui"
                    : dateStr === tomorrowStr ? 'Demain'
                    : d.toLocaleDateString(_getLocale(), { weekday: 'long', day: 'numeric', month: 'long' });
                  return (
                    <div key={dateStr}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ padding: '4px 14px', borderRadius: '20px', background: dateStr === today ? 'linear-gradient(135deg,#667EEA,#FF6B9D)' : '#F3F4F6', color: dateStr === today ? 'white' : '#374151', fontSize: '13px', fontWeight: '800', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                          {dayLabel}
                        </div>
                        <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
                        <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600' }}>{evs.length} événement{evs.length > 1 ? 's' : ''}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '16px' }}>
                        {evs.map((ev, idx) => (
                          <div key={ev.id || idx}
                            onClick={() => handleEditEvent(ev)}
                            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: '#F9FAFB', borderRadius: '12px', borderLeft: `4px solid ${getEventColor(ev)}`, cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.transform = 'none'; }}
                          >
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: getEventColor(ev), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                              {TYPE_ICONS[ev.type] || '📌'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '14px', fontWeight: '800', color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                              {ev.description && <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.description}</div>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
                              {ev.time && <span style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>🕐 {ev.time}</span>}
                              {ev.location && <span style={{ fontSize: '11px', color: '#9CA3AF' }}>📍 {ev.location}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

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
                          borderLeft: `4px solid ${getEventColor(event)}`,
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
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                            <div style={{ padding: '6px 16px', background: getEventColor(event), color: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                              {event.type === 'interview' && '👥 Entretien'}
                              {event.type === 'meeting' && '📅 Réunion'}
                              {event.type === 'call' && '📞 Appel'}
                              {event.type === 'email' && '📧 Email'}
                              {event.type === 'deadline' && '⏰ Échéance'}
                              {event.type === 'other' && '📌 Autre'}
                            </div>
                            {event.type === 'interview' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); const state = loadChecklist(event.id); setChecklistState(state); setChecklistEvent(event); }}
                                style={{ padding: '5px 12px', background: '#EEF2FF', color: '#667EEA', border: '1.5px solid #667EEA', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
                              >
                                ✅ Checklist
                              </button>
                            )}
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

      {/* Modal checklist entretien */}
      {checklistEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setChecklistEvent(null)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '460px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1F2937', margin: 0 }}>✅ Checklist entretien</h3>
              <button onClick={() => setChecklistEvent(null)} aria-label="Fermer la checklist" style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>{checklistEvent.title} — {checklistEvent.date} {checklistEvent.time && `à ${checklistEvent.time}`}</div>
            {(() => {
              const items = Object.keys(checklistState);
              const done = items.filter(k => checklistState[k]).length;
              const pct = items.length ? Math.round((done / items.length) * 100) : 0;
              return (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#374151' }}>{done}/{items.length} complété</span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: pct === 100 ? '#10B981' : '#667EEA' }}>{pct}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#F3F4F6', borderRadius: '3px' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10B981' : '#667EEA', borderRadius: '3px', transition: 'width 0.3s' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {items.map(item => (
                      <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: checklistState[item] ? '#F0FDF4' : '#F9FAFB', borderRadius: '10px', cursor: 'pointer', border: `1px solid ${checklistState[item] ? '#BBF7D0' : '#E5E7EB'}` }}>
                        <input type="checkbox" checked={!!checklistState[item]} onChange={() => toggleChecklistItem(item)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                        <span style={{ fontSize: '13px', fontWeight: '600', color: checklistState[item] ? '#065F46' : '#374151', textDecoration: checklistState[item] ? 'line-through' : 'none' }}>{item}</span>
                      </label>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal lien de disponibilité */}
      {availModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '560px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#1F2937', margin: 0 }}>🔗 Générer un lien de disponibilité</h2>
              <button onClick={() => setAvailModalOpen(false)} aria-label="Fermer la fenêtre de disponibilité" style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6B7280' }}>✕</button>
            </div>

            {!availLink ? (
              <>
                <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Durée de chaque créneau</label>
                    <select value={availDuration} onChange={e => setAvailDuration(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }}>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">1 heure</option>
                      <option value="90">1h30</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Message au candidat (optionnel)</label>
                    <textarea value={availNote} onChange={e => setAvailNote(e.target.value)} placeholder="Ex: Choisissez un créneau pour votre entretien RH..." rows={2} style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <p style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '12px' }}>Sélectionnez vos créneaux disponibles :</p>
                <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                  {next7Days.map(date => {
                    const d = new Date(date);
                    const label = d.toLocaleDateString(_getLocale(), { weekday: 'short', day: 'numeric', month: 'short' });
                    const selectedTimes = availSlots[date] || new Set();
                    return (
                      <div key={date} style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '12px' }}>
                        <p style={{ fontWeight: '700', color: '#374151', fontSize: '13px', marginBottom: '8px', textTransform: 'capitalize' }}>{label}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {HOURS.map(h => {
                            const active = selectedTimes.has(h);
                            return (
                              <button key={h} onClick={() => toggleAvailSlot(date, h)} style={{ padding: '6px 12px', borderRadius: '8px', border: '2px solid', borderColor: active ? '#10B981' : '#E5E7EB', background: active ? '#D1FAE5' : 'white', color: active ? '#065F46' : '#6B7280', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>
                                {h}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleGenerateLink}
                  disabled={availGenerating || Object.values(availSlots).every(s => s.size === 0)}
                  style={{ width: '100%', padding: '14px', background: Object.values(availSlots).some(s => s.size > 0) ? 'linear-gradient(135deg, #10B981, #059669)' : '#E5E7EB', color: Object.values(availSlots).some(s => s.size > 0) ? 'white' : '#9CA3AF', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: availGenerating || Object.values(availSlots).every(s => s.size === 0) ? 'default' : 'pointer' }}
                >
                  {availGenerating ? '⏳ Génération...' : '🔗 Générer le lien'}
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '56px', marginBottom: '12px' }}>🎉</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1F2937', marginBottom: '8px' }}>Lien créé avec succès !</h3>
                <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>Partagez ce lien avec votre candidat :</p>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <input readOnly value={availLink} style={{ flex: 1, padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', background: '#F9FAFB' }} />
                  <button onClick={handleCopyLink} style={{ padding: '10px 16px', background: availCopied ? '#10B981' : '#667EEA', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {availCopied ? '✅ Copié !' : '📋 Copier'}
                  </button>
                </div>
                <button onClick={() => { setAvailLink(null); setAvailSlots({}); }} style={{ background: 'none', border: '2px solid #E5E7EB', borderRadius: '10px', padding: '10px 20px', color: '#6B7280', fontWeight: '600', cursor: 'pointer' }}>
                  Créer un autre lien
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Formulaire d'événement */}
      <EventForm
        event={selectedEvent || (quickDate ? { date: quickDate, time: quickHour ? `${String(quickHour).padStart(2,'0')}:00` : '' } : null)}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedEvent(null);
          setQuickDate(null);
          setQuickHour(null);
        }}
        onSubmit={handleSubmitEvent}
      />
    </div>
  );
}

export default CalendarPage;
