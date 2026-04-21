import React from 'react';

/**
 * Carte draggable du Kanban
 * Pas de prop isDragging : évite les re-renders React pendant le drag
 * qui provoqueraient l'annulation du drag par le navigateur.
 */
export function KanbanCard({ application, columnColor, onDragStart, onDragEnd, onClick }) {
  const { candidateName, candidateAvatar = '👤', missionTitle, clientName, score = 0, dateApplied } = application;

  const scoreColor = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  const dateLabel = dateApplied
    ? new Date(dateApplied).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    : '—';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, application)}
      onDragEnd={onDragEnd}
      onClick={() => onClick && onClick(application)}
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
        <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          🏢 {clientName}
        </div>
      )}

      {/* Score + Date */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #F3F4F6' }}>
        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{dateLabel}</span>
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
  );
}

export default KanbanCard;
