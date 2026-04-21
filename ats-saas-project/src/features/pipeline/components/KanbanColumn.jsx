import React from 'react';
import KanbanCard from './KanbanCard';

/**
 * Colonne Kanban avec zone de drop visuellement réactive
 * isDragging retiré des cartes pour éviter les re-renders pendant le drag
 */
export function KanbanColumn({
  title, status, color = '#667EEA',
  applications, isDragOver,
  onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop, onCardClick,
}) {
  return (
    <div
      style={{
        background: isDragOver ? '#F0F4FF' : 'white',
        borderRadius: '16px',
        padding: '16px',
        minHeight: '520px',
        width: '240px',
        minWidth: '240px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        border: isDragOver ? `2px dashed ${color}` : '2px solid #F3F4F6',
        boxShadow: isDragOver
          ? `0 0 0 3px ${color}33, 0 8px 24px rgba(0,0,0,0.08)`
          : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
      }}
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, status)}
    >
      {/* En-tête */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        paddingBottom: '12px',
        borderBottom: `3px solid ${color}`,
      }}>
        <div style={{ fontSize: '14px', fontWeight: '800', color: '#1F2937' }}>{title}</div>
        <div style={{
          minWidth: '22px', height: '22px', padding: '0 7px',
          background: color, color: 'white',
          borderRadius: '11px', fontSize: '11px', fontWeight: '800',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {applications.length}
        </div>
      </div>

      {/* Cartes */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {applications.map(app => (
          <KanbanCard
            key={app.id}
            application={app}
            columnColor={color}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={onCardClick}
          />
        ))}

        {applications.length === 0 && (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px dashed ${isDragOver ? color : '#E5E7EB'}`,
            borderRadius: '12px',
            color: isDragOver ? color : '#D1D5DB',
            fontSize: '13px', fontWeight: '600',
            transition: 'all 0.15s',
            minHeight: '80px',
          }}>
            {isDragOver ? '⬇️ Déposer ici' : 'Aucune candidature'}
          </div>
        )}
      </div>
    </div>
  );
}

export default KanbanColumn;
