import React, { useRef, useState, useCallback, useEffect } from 'react';
import KanbanColumn from './KanbanColumn';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import { APPLICATION_STATUS_COLORS, APPLICATION_NEXT_STATUSES } from '@/config/constants';

const WIP_STORAGE_KEY = 'ats_kanban_wip_limits';
const PIPELINE_COLS_KEY = 'ats_kanban_columns';
const DEFAULT_COLUMNS = [
  { status: 'received',    title: '📨 Reçues',       color: APPLICATION_STATUS_COLORS.received },
  { status: 'screening',   title: '🔍 Présélection',  color: APPLICATION_STATUS_COLORS.screening },
  { status: 'interview_1', title: '👥 Entretien 1',   color: APPLICATION_STATUS_COLORS.interview_1 },
  { status: 'interview_2', title: '🎯 Entretien 2',   color: APPLICATION_STATUS_COLORS.interview_2 },
  { status: 'offer',       title: '📋 Offre',         color: APPLICATION_STATUS_COLORS.offer },
  { status: 'final',       title: '✅ Finaliste',     color: APPLICATION_STATUS_COLORS.final },
  { status: 'hired',       title: '🎉 Recruté',       color: APPLICATION_STATUS_COLORS.hired },
  { status: 'rejected',    title: '❌ Refusé',        color: APPLICATION_STATUS_COLORS.rejected },
];
const DEFAULT_WIP = {
  received: 10, screening: 8, interview_1: 6, interview_2: 5,
  offer: 4, final: 4, hired: null, rejected: null,
};

/**
 * Tableau Kanban - drag & drop natif HTML5
 *
 * ⚠️ On utilise useRef (pas useState) pour draggedId :
 *    setState pendant un drag provoque un re-render React qui mute le DOM
 *    → le navigateur annule le drag. useRef évite tout re-render pendant le drag.
 *    Le highlight de colonne (dragOverStatus) utilise setState car il ne touche
 *    pas la carte en cours de déplacement.
 */
const ARCHIVE_COLUMN = { status: 'archived', title: '🗄️ Archive', color: APPLICATION_STATUS_COLORS.archived };

export function KanbanBoard({ applications, onApplicationMove, onInvalidMove, onCardClick, onQuickNote, showArchived, onSendEmail }) {
  const draggedIdRef = useRef(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const isMobile = useIsMobile();
  const [mobileActiveStatus, setMobileActiveStatus] = useState(null);
  const [wipLimits, setWipLimits] = useState(() => {
    try {
      const stored = localStorage.getItem(WIP_STORAGE_KEY);
      return stored ? { ...DEFAULT_WIP, ...JSON.parse(stored) } : DEFAULT_WIP;
    } catch { return DEFAULT_WIP; }
  });

  const handleWipChange = useCallback((status) => {
    const current = wipLimits[status];
    const input = window.prompt(`Limite WIP pour cette colonne (vide = illimité) :`, current ?? '');
    if (input === null) return;
    const value = input.trim() === '' ? null : Number(input);
    if (input.trim() !== '' && (isNaN(value) || value < 1)) return;
    const updated = { ...wipLimits, [status]: value };
    setWipLimits(updated);
    try { localStorage.setItem(WIP_STORAGE_KEY, JSON.stringify(updated)); } catch {}
  }, [wipLimits]);

  const rawCustomCols = (() => { try { return JSON.parse(localStorage.getItem(PIPELINE_COLS_KEY)); } catch { return null; } })();
  const columns = (Array.isArray(rawCustomCols) && rawCustomCols.length > 0)
    ? rawCustomCols.map(c => ({ status: c.id || c.status, title: c.title, color: c.color }))
    : DEFAULT_COLUMNS;

  const allColumns = showArchived ? [...columns, ARCHIVE_COLUMN] : columns;

  // T-254 — Mobile : une seule colonne affichée à la fois (sélecteur en onglets)
  // plutôt que le scroll horizontal sur 8-9 colonnes de 240px fixes, peu lisible.
  useEffect(() => {
    if (!mobileActiveStatus && allColumns.length > 0) setMobileActiveStatus(allColumns[0].status);
  }, [allColumns, mobileActiveStatus]);

  const byStatus = allColumns.reduce((acc, col) => {
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
    // Ne pas convertir en Number : les IDs Supabase sont des UUIDs (strings)
    const id = draggedIdRef.current ?? e.dataTransfer.getData('text/plain');

    if (id) {
      // Cherche par id ou _id, en comparant comme strings pour gérer UUIDs et nombres
      const app = applications.find(a =>
        String(a.id) === String(id) || String(a._id) === String(id)
      );
      if (app && app.status !== newStatus) {
        // T-391 : le drag & drop autorisait n'importe quel saut d'étape (ex.
        // received → hired directement) — seuls les boutons "Déplacer vers"
        // du modal respectaient NEXT_STATUSES. Même règle appliquée ici.
        // Archiver/désarchiver reste volontairement autorisé dans les deux
        // sens depuis/vers n'importe quel statut : c'est une action manuelle
        // hors du flux séquentiel du pipeline (déjà le comportement existant
        // de la colonne Archive), pas une étape de progression normale.
        const allowed = APPLICATION_NEXT_STATUSES[app.status] || [];
        if (newStatus === 'archived' || app.status === 'archived' || allowed.includes(newStatus)) {
          onApplicationMove(id, newStatus);
        } else {
          onInvalidMove?.(app, newStatus);
        }
      }
    }

    draggedIdRef.current = null;
    setDragOverStatus(null);
  };

  if (isMobile) {
    const activeCol = allColumns.find(c => c.status === mobileActiveStatus) || allColumns[0];
    return (
      <div>
        {/* Sélecteur de colonne (onglets scrollables horizontalement) */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '8px', WebkitOverflowScrolling: 'touch' }}>
          {allColumns.map(col => {
            const active = col.status === mobileActiveStatus;
            const count = (byStatus[col.status] || []).length;
            return (
              <button
                key={col.status}
                onClick={() => setMobileActiveStatus(col.status)}
                style={{
                  flexShrink: 0, padding: '10px 16px', minHeight: '44px', borderRadius: '10px',
                  border: `2px solid ${active ? col.color : '#E5E7EB'}`,
                  background: active ? col.color : 'white',
                  color: active ? 'white' : '#374151',
                  fontWeight: '700', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {col.title} ({count})
              </button>
            );
          })}
        </div>
        {activeCol && (
          <KanbanColumn
            key={activeCol.status}
            title={activeCol.title}
            status={activeCol.status}
            color={activeCol.color}
            applications={byStatus[activeCol.status] || []}
            isDragOver={dragOverStatus === activeCol.status}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onCardClick={onCardClick}
            wipLimit={wipLimits[activeCol.status] ?? null}
            onWipChange={handleWipChange}
            onQuickNote={onQuickNote}
            onSendEmail={onSendEmail}
            onMove={onApplicationMove}
            fullWidth
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '16px', paddingTop: '4px' }}>
      {allColumns.map(col => (
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
          wipLimit={wipLimits[col.status] ?? null}
          onWipChange={handleWipChange}
          onQuickNote={onQuickNote}
          onSendEmail={onSendEmail}
          onMove={onApplicationMove}
        />
      ))}
    </div>
  );
}

export default KanbanBoard;
