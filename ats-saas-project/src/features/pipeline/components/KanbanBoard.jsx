import React, { useRef, useState } from 'react';
import KanbanColumn from './KanbanColumn';

/**
 * Tableau Kanban - drag & drop natif HTML5
 *
 * ⚠️ On utilise useRef (pas useState) pour draggedId :
 *    setState pendant un drag provoque un re-render React qui mute le DOM
 *    → le navigateur annule le drag. useRef évite tout re-render pendant le drag.
 *    Le highlight de colonne (dragOverStatus) utilise setState car il ne touche
 *    pas la carte en cours de déplacement.
 */
export function KanbanBoard({ applications, onApplicationMove, onCardClick }) {
  const draggedIdRef = useRef(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);

  const columns = [
    { status: 'received',    title: '📨 Reçues',       color: '#6B7280' },
    { status: 'screening',   title: '🔍 Présélection',  color: '#3B82F6' },
    { status: 'interview_1', title: '👥 Entretien 1',   color: '#F59E0B' },
    { status: 'interview_2', title: '🎯 Entretien 2',   color: '#8B5CF6' },
    { status: 'offer',       title: '📋 Offre',         color: '#10B981' },
    { status: 'final',       title: '✅ Finaliste',     color: '#059669' },
    { status: 'hired',       title: '🎉 Recruté',       color: '#EC4899' },
    { status: 'rejected',    title: '❌ Refusé',        color: '#EF4444' },
  ];

  const byStatus = columns.reduce((acc, col) => {
    acc[col.status] = applications.filter(a => a.status === col.status);
    return acc;
  }, {});

  const handleDragStart = (e, application) => {
    draggedIdRef.current = application.id;
    // Stocker aussi dans dataTransfer comme backup
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(application.id));
  };

  const handleDragEnd = () => {
    draggedIdRef.current = null;
    setDragOverStatus(null);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStatus !== status) setDragOverStatus(status);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverStatus(null);
    }
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    e.stopPropagation();

    // Récupérer l'ID depuis le ref ou dataTransfer
    const rawId = draggedIdRef.current ?? e.dataTransfer.getData('text/plain');
    const id = typeof rawId === 'string' ? Number(rawId) : rawId;

    if (id) {
      const app = applications.find(a => a.id === id);
      if (app && app.status !== newStatus) {
        onApplicationMove(id, newStatus);
      }
    }

    draggedIdRef.current = null;
    setDragOverStatus(null);
  };

  return (
    <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '16px', paddingTop: '4px' }}>
      {columns.map(col => (
        <KanbanColumn
          key={col.status}
          title={col.title}
          status={col.status}
          color={col.color}
          applications={byStatus[col.status] || []}
          isDragOver={dragOverStatus === col.status}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}

export default KanbanBoard;
