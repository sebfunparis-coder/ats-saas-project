import React, { useState, useRef, useEffect } from 'react';
import { APPLICATION_NEXT_STATUSES, APPLICATION_PIPELINE_STAGES } from '@/config/constants';

export function KanbanCard({ application, columnColor, onDragStart, onDragEnd, onClick, onQuickNote, onSendEmail, onMove }) {
  const { candidateName, candidateAvatar = '👤', missionTitle, clientName, score = 0, testScore, dateApplied, quickNote = '', assignedToName } = application;
  const [showNote, setShowNote] = useState(false);
  const [noteValue, setNoteValue] = useState(quickNote || '');
  const [showMenu, setShowMenu] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!showMenu) return;
    const handler = () => setShowMenu(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showMenu]);
  const textareaRef = useRef(null);

  const SLA_DAYS = { received: 3, screening: 5, interview_1: 7, interview_2: 7, test: 5, offer: 3 };
  const slaLimit = SLA_DAYS[application.status];
  const daysInStatus = dateApplied ? Math.round((Date.now() - new Date(dateApplied).getTime()) / 86400000) : 0;
  const slaOverdue = slaLimit && daysInStatus > slaLimit;
  const scoreColor = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  const dateLabel = dateApplied
    ? new Date(dateApplied).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    : '—';

  const saveNote = () => {
    setShowNote(false);
    if (onQuickNote) onQuickNote(application.id, noteValue.trim());
  };

  // T-392 : le drag & drop HTML5 n'a pas d'équivalent tactile fiable sur
  // mobile (et une seule colonne est visible à la fois, T-254), et la carte
  // n'était accessible ni au clavier (pas de tabIndex/role/onKeyDown) ni aux
  // lecteurs d'écran (pas d'aria-label). `role="button"` + `tabIndex` +
  // `onKeyDown` rendent l'ouverture de la carte (Entrée/Espace) équivalente
  // au clic ; le menu "⋯" expose désormais aussi les transitions valides
  // (mêmes règles que le drag & drop, T-391) comme alternative explicite au
  // geste de glisser-déposer, utilisable au clavier comme au tactile.
  const nextStatuses = APPLICATION_NEXT_STATUSES[application.status] || [];

  return (
    <div
      draggable
      role="button"
      tabIndex={0}
      aria-label={`Candidature de ${candidateName} pour ${missionTitle}, statut ${APPLICATION_PIPELINE_STAGES[application.status]?.label || application.status}`}
      onDragStart={(e) => onDragStart(e, application)}
      onDragEnd={onDragEnd}
      onClick={() => onClick && onClick(application)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return; // ignore les touches remontées depuis les boutons/menu internes
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick(application);
        }
      }}
      style={{
        padding: '12px 14px',
        background: 'white',
        borderRadius: '12px',
        marginBottom: '10px',
        cursor: 'grab',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        border: '1.5px solid #F3F4F6',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 8px 24px ${columnColor}25`;
        e.currentTarget.style.borderColor = columnColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
        e.currentTarget.style.borderColor = '#F3F4F6';
      }}
    >
      {/* Avatar + Nom */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <div style={{
          width: '34px', height: '34px', flexShrink: 0,
          background: `linear-gradient(135deg, ${columnColor} 0%, ${columnColor}99 100%)`,
          borderRadius: '9px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '17px',
        }}>
          {candidateAvatar}
        </div>
        <div style={{
          fontSize: '13px', fontWeight: '800', color: '#1F2937',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
        }}>
          {candidateName}
        </div>
      </div>

      {/* Mission */}
      <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        📋 {missionTitle}
      </div>

      {/* Client */}
      {clientName && (
        <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          🏢 {clientName}
        </div>
      )}

      {/* Assigned recruiter */}
      {assignedToName && (
        <div style={{ fontSize: '11px', color: '#7C3AED', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '600' }}>
          👤 {assignedToName}
        </div>
      )}

      {/* Score + Date + Note button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{dateLabel}</span>
          {slaOverdue && (
            <span title={`SLA dépassé — J+${daysInStatus} (max ${slaLimit}j)`} style={{
              padding: '1px 6px', borderRadius: '5px', fontSize: '10px', fontWeight: '800',
              background: '#FEE2E2', color: '#DC2626',
            }}>🔴 J+{daysInStatus}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setNoteValue(application.quickNote || '');
              setShowNote(v => {
                if (!v) setTimeout(() => textareaRef.current?.focus(), 50);
                return !v;
              });
            }}
            title="Note rapide"
            aria-label="Note rapide"
            style={{
              padding: '2px 7px', borderRadius: '6px', border: 'none',
              background: noteValue || application.quickNote ? '#FEF3C7' : '#F3F4F6',
              color: noteValue || application.quickNote ? '#92400E' : '#9CA3AF',
              cursor: 'pointer', fontSize: '11px', fontWeight: '700',
            }}
          >
            📝
          </button>
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v); }}
              title="Actions"
              aria-label="Actions sur la candidature"
              style={{ padding: '2px 7px', borderRadius: '6px', border: 'none', background: '#F3F4F6', color: '#6B7280', cursor: 'pointer', fontSize: '13px', fontWeight: '700', lineHeight: '1' }}
            >
              ⋯
            </button>
            {showMenu && (
              <div
                onClick={e => e.stopPropagation()}
                style={{ position: 'absolute', right: 0, bottom: '100%', marginBottom: '4px', background: 'white', border: '1px solid #E5E7EB', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, minWidth: '160px', overflow: 'hidden' }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); if (onSendEmail) onSendEmail(application); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: '#374151' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  📧 Envoyer un email
                </button>
                {nextStatuses.length > 0 && onMove && (
                  <>
                    <div style={{ borderTop: '1px solid #F3F4F6', margin: '4px 0' }} />
                    {nextStatuses.map(nextStatus => (
                      <button
                        key={nextStatus}
                        onClick={(e) => { e.stopPropagation(); setShowMenu(false); onMove(application.id, nextStatus); }}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: '#374151' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        ↪️ Déplacer vers {APPLICATION_PIPELINE_STAGES[nextStatus]?.label || nextStatus}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
          {testScore != null && (
            <span title="Score test de pré-qualification" style={{
              padding: '2px 8px',
              background: '#EEF2FF',
              color: '#4338CA',
              borderRadius: '6px', fontSize: '11px', fontWeight: '800',
            }}>
              🧪 {testScore}%
            </span>
          )}
          <span style={{
            padding: '2px 8px',
            background: `${scoreColor}18`,
            color: scoreColor,
            borderRadius: '6px', fontSize: '11px', fontWeight: '800',
          }}>
            {score}%
          </span>
        </div>
      </div>

      {/* Inline note */}
      {showNote && (
        <div
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          style={{ marginTop: '8px' }}
        >
          <textarea
            ref={textareaRef}
            value={noteValue}
            onChange={e => setNoteValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveNote(); } if (e.key === 'Escape') { setShowNote(false); } }}
            onBlur={saveNote}
            placeholder="Note rapide… (Entrée pour sauvegarder)"
            rows={2}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '6px 8px', border: '1.5px solid #FCD34D',
              borderRadius: '8px', fontSize: '11px', resize: 'none',
              background: '#FFFBEB', color: '#92400E', fontFamily: 'inherit',
              outline: 'none',
            }}
          />
        </div>
      )}

      {/* Afficher la note existante */}
      {!showNote && (application.quickNote || noteValue) && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            marginTop: '6px', padding: '4px 8px',
            background: '#FFFBEB', borderRadius: '6px',
            fontSize: '10px', color: '#92400E', lineHeight: '1.4',
          }}
        >
          📝 {application.quickNote || noteValue}
        </div>
      )}
    </div>
  );
}

export default KanbanCard;
