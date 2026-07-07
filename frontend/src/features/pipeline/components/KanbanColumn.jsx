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
  wipLimit = null, onWipChange, onQuickNote, onSendEmail, onMove,
  fullWidth = false,
}) {
  const isOverWip = wipLimit !== null && applications.length > wipLimit;

  return (
    <div
      style={{
        background: isDragOver ? '#F0F4FF' : 'white',
        borderRadius: '16px',
        padding: '16px',
        minHeight: '520px',
        width: fullWidth ? '100%' : '240px',
        minWidth: fullWidth ? 0 : '240px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        border: isOverWip ? '2px solid #FCA5A5' : isDragOver ? `2px dashed ${color}` : '2px solid #F3F4F6',
        boxShadow: isDragOver
          ? `0 0 0 3px ${color}33, 0 8px 24px rgba(0,0,0,0.08)`
          : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
      }}
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, status)}
    >
      {/* Alerte WIP */}
      {isOverWip && (
        <div style={{
          marginBottom: '10px', padding: '6px 10px',
          background: '#FEF2F2', borderRadius: '8px',
          fontSize: '11px', fontWeight: '700', color: '#DC2626',
          border: '1px solid #FCA5A5',
        }}>
          ⚠️ Limite WIP dépassée ({applications.length}/{wipLimit})
        </div>
      )}

      {/* En-tête */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        paddingBottom: '12px',
        borderBottom: `3px solid ${isOverWip ? '#EF4444' : color}`,
      }}>
        <div style={{ fontSize: '14px', fontWeight: '800', color: '#1F2937' }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {wipLimit !== null && (
            <button
              onClick={() => onWipChange && onWipChange(status)}
              title="Modifier la limite WIP"
              style={{
                padding: '2px 7px', background: isOverWip ? '#FEF2F2' : '#F3F4F6',
                color: isOverWip ? '#EF4444' : '#6B7280',
                border: `1px solid ${isOverWip ? '#FCA5A5' : '#E5E7EB'}`,
                borderRadius: '8px', fontSize: '10px', fontWeight: '700', cursor: 'pointer',
              }}
            >
              WIP:{wipLimit}
            </button>
          )}
          <div style={{
            minWidth: '22px', height: '22px', padding: '0 7px',
            background: isOverWip ? '#EF4444' : color, color: 'white',
            borderRadius: '11px', fontSize: '11px', fontWeight: '800',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {applications.length}
          </div>
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
            onQuickNote={onQuickNote}
            onSendEmail={onSendEmail}
            onMove={onMove}
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
