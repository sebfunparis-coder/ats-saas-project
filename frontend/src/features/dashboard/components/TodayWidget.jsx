import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const TYPE_META = {
  interview:    { icon: '🎤', color: '#667EEA', bg: '#EEF2FF', label: 'Entretien' },
  meeting:      { icon: '📅', color: '#F59E0B', bg: '#FFFBEB', label: 'Réunion' },
  phone_screen: { icon: '📞', color: '#10B981', bg: '#ECFDF5', label: 'Appel' },
  deadline:     { icon: '⏰', color: '#EF4444', bg: '#FEF2F2', label: 'Deadline' },
  reminder:     { icon: '🔔', color: '#8B5CF6', bg: '#F5F3FF', label: 'Rappel' },
  task:         { icon: '✅', color: '#3B82F6', bg: '#EFF6FF', label: 'Tâche' },
};

const PRIORITY_COLOR = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function TodayWidget({ events = [], tasks = [] }) {
  const navigate = useNavigate();
  const today = todayISO();

  const tomorrowISO = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const { todayEvents, dueTasks, tomorrowInterviews } = useMemo(() => {
    const todayEvents = events
      .filter(e => e.date === today)
      .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));

    const tomorrowInterviews = events
      .filter(e => e.date === tomorrowISO && e.type === 'interview')
      .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));

    const dueTasks = tasks
      .filter(t => t.status !== 'done' && t.dueDate <= today)
      .sort((a, b) => {
        const pd = { high: 0, medium: 1, low: 2 };
        return (pd[a.priority] ?? 1) - (pd[b.priority] ?? 1);
      });

    return { todayEvents, dueTasks, tomorrowInterviews };
  }, [events, tasks, today, tomorrowISO]);

  const total = todayEvents.length + dueTasks.length;

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      border: '1px solid #F3F4F6',
    }}>
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#1F2937' }}>
            📋 À faire aujourd'hui
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9CA3AF' }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div style={{
          background: total > 0 ? '#EEF2FF' : '#F9FAFB',
          color: total > 0 ? '#667EEA' : '#9CA3AF',
          borderRadius: '20px',
          padding: '4px 12px',
          fontSize: '13px',
          fontWeight: '800',
        }}>
          {total} élément{total !== 1 ? 's' : ''}
        </div>
      </div>

      {total === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎉</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>Rien de prévu aujourd'hui !</div>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Profitez-en pour avancer sur vos missions.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* Événements du jour */}
          {todayEvents.map(event => {
            const meta = TYPE_META[event.type] || TYPE_META.reminder;
            return (
              <div
                key={`ev-${event.id}`}
                onClick={() => navigate('/app/calendar')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: meta.bg,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: meta.color, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                }}>
                  {meta.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {event.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                    {meta.label}{event.time ? ` · ${event.time}` : ''}{event.location ? ` · ${event.location}` : ''}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Tâches dues */}
          {dueTasks.map(task => {
            const isOverdue = task.dueDate < today;
            return (
              <div
                key={`tk-${task.id}`}
                onClick={() => navigate('/app/tasks')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: isOverdue ? '#FEF2F2' : '#EFF6FF',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                  border: isOverdue ? '1px solid #FECACA' : '1px solid transparent',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: isOverdue ? '#EF4444' : '#3B82F6',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                }}>
                  {isOverdue ? '⚠️' : '✅'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '12px', color: isOverdue ? '#EF4444' : '#6B7280', marginTop: '2px' }}>
                    {isOverdue ? `En retard depuis le ${task.dueDate}` : 'Due aujourd\'hui'}
                    {task.relatedTo ? ` · ${task.relatedTo.name}` : ''}
                  </div>
                </div>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: PRIORITY_COLOR[task.priority] || '#9CA3AF',
                  flexShrink: 0,
                  title: task.priority,
                }} />
              </div>
            );
          })}
        </div>
      )}

      {/* Entretiens demain */}
      {tomorrowInterviews.length > 0 && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: '#667EEA', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
            🎤 Entretiens demain ({tomorrowInterviews.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tomorrowInterviews.map(ev => (
              <div key={ev.id} onClick={() => navigate('/app/calendar')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#EEF2FF', borderRadius: '10px', cursor: 'pointer' }}>
                <span style={{ fontSize: '18px' }}>🎤</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</div>
                  {ev.time && <div style={{ fontSize: '11px', color: '#667EEA', marginTop: '1px' }}>{ev.time}{ev.duration ? ` · ${ev.duration}min` : ''}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TodayWidget;
