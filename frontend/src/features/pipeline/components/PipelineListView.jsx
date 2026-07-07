import React, { useState, useMemo } from 'react';
import { List } from 'react-window';
import { SkeletonRowList } from '@/shared/components/Skeleton/Skeleton';
import EmptyState from '@/shared/components/Feedback/EmptyState';
import { APPLICATION_PIPELINE_STAGES } from '@/config/constants';

// Au-delà de ce seuil, la liste passe en mode virtualisé (T-257) — en dessous,
// le <table> natif (auto-layout des colonnes par le navigateur) est conservé,
// car la virtualisation impose de remplacer <table>/<tr>/<td> par des lignes
// flex à largeurs fixes (react-window ne peut pas virtualiser à l'intérieur
// d'un <tbody>, ses lignes sont positionnées en absolu).
const VIRTUALIZE_THRESHOLD = 60;

// Largeurs de colonnes partagées entre l'en-tête et les lignes virtualisées,
// pour garder l'alignement (impossible de compter sur l'auto-layout du
// navigateur comme avec <table>).
const COLUMNS = [
  { key: 'candidateName', label: 'Candidat', flex: 2.2 },
  { key: 'missionTitle', label: 'Mission', flex: 2 },
  { key: 'clientName', label: 'Client', flex: 1.4 },
  { key: 'status', label: 'Statut', flex: 1.2 },
  { key: 'score', label: 'Score IA', flex: 0.9 },
  { key: 'dateApplied', label: 'Date candidat.', flex: 1.2 },
];
const ROW_HEIGHT = 56;

// T-395 : redéfini localement à l'identique dans 3 fichiers, sans l'entrée
// `archived` ici (repérée par ce ticket) — source unique désormais dans
// constants.js.
const PIPELINE_STAGES = APPLICATION_PIPELINE_STAGES;

const TH = ({ label, field, sort, onSort }) => {
  const active = sort.field === field;
  return (
    <th
      onClick={() => onSort(field)}
      style={{
        padding: '10px 16px', textAlign: 'left', fontSize: '11px',
        fontWeight: '800', color: active ? '#667EEA' : '#6B7280',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none',
        background: '#F9FAFB', borderBottom: '2px solid #E5E7EB',
      }}
    >
      {label} {active ? (sort.dir === 'asc' ? '↑' : '↓') : ''}
    </th>
  );
};

export function PipelineListView({ applications, onCardClick, compareIds = new Set(), onToggleCompare, loading = false }) {
  const [sort, setSort] = useState({ field: 'dateApplied', dir: 'desc' });

  const handleSort = (field) => {
    setSort(prev => ({
      field,
      dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sorted = useMemo(() => {
    const arr = [...applications];
    const { field, dir } = sort;
    arr.sort((a, b) => {
      let va = a[field], vb = b[field];
      if (field === 'score') { va = Number(va) || 0; vb = Number(vb) || 0; }
      else if (field === 'dateApplied' || field === 'lastActivity') {
        va = va ? new Date(va).getTime() : 0;
        vb = vb ? new Date(vb).getTime() : 0;
      } else {
        va = (va || '').toString().toLowerCase();
        vb = (vb || '').toString().toLowerCase();
      }
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [applications, sort]);

  if (loading && sorted.length === 0) return <SkeletonRowList count={8} columns={6} />;

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="Aucune candidature dans le pipeline"
        description="Commencez par associer des candidats à une mission ouverte."
      />
    );
  }

  if (sorted.length > VIRTUALIZE_THRESHOLD) {
    return (
      <VirtualizedPipelineTable
        sorted={sorted}
        sort={sort}
        onSort={handleSort}
        onCardClick={onCardClick}
        compareIds={compareIds}
        onToggleCompare={onToggleCompare}
      />
    );
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid #E5E7EB', background: 'white' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {onToggleCompare && <th style={{ padding: '10px 12px', background: '#F9FAFB', borderBottom: '2px solid #E5E7EB', width: '40px' }} />}
            <TH label="Candidat"       field="candidateName" sort={sort} onSort={handleSort} />
            <TH label="Mission"        field="missionTitle"  sort={sort} onSort={handleSort} />
            <TH label="Client"         field="clientName"    sort={sort} onSort={handleSort} />
            <TH label="Statut"         field="status"        sort={sort} onSort={handleSort} />
            <TH label="Score IA"       field="score"         sort={sort} onSort={handleSort} />
            <TH label="Date candidat." field="dateApplied"   sort={sort} onSort={handleSort} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((app, i) => {
            const stage = PIPELINE_STAGES[app.status] || { label: app.status, color: '#6B7280' };
            const scoreColor = Number(app.score) >= 75 ? '#10B981' : Number(app.score) >= 50 ? '#F59E0B' : '#EF4444';
            return (
              <tr
                key={app.id}
                onClick={() => onCardClick && onCardClick(app)}
                style={{
                  cursor: 'pointer',
                  background: i % 2 === 0 ? 'white' : '#FAFAFA',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; }}
                onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#FAFAFA'; }}
              >
                {onToggleCompare && (
                  <td style={{ padding: '12px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={compareIds.has(app.id)}
                      onChange={() => onToggleCompare(app.id)}
                      style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                    />
                  </td>
                )}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667EEA, #764BA2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', flexShrink: 0,
                    }}>
                      {app.candidateAvatar || '👤'}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937' }}>
                      {app.candidateName || '—'}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', maxWidth: '180px' }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {app.missionTitle || '—'}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6B7280' }}>
                  {app.clientName || '—'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                    background: `${stage.color}18`, color: stage.color, whiteSpace: 'nowrap',
                  }}>
                    {stage.label}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {app.score > 0 ? (
                    <span style={{ fontSize: '12px', fontWeight: '800', color: scoreColor }}>
                      {app.score}%
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#D1D5DB' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                  {app.dateApplied
                    ? new Date(app.dateApplied).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// En-tête virtualisé : mêmes largeurs (COLUMNS[].flex) que les lignes, en flex
// au lieu de l'auto-layout natif du <table> (incompatible avec react-window).
const VirtualHeaderCell = ({ col, sort, onSort }) => {
  const active = sort.field === col.key;
  return (
    <div
      onClick={() => onSort(col.key)}
      style={{
        flex: col.flex, minWidth: 0, padding: '10px 16px', textAlign: 'left',
        fontSize: '12px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase',
        cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none',
        background: '#F9FAFB', borderBottom: '2px solid #E5E7EB',
      }}
    >
      {col.label} {active ? (sort.dir === 'asc' ? '↑' : '↓') : ''}
    </div>
  );
};

// Ligne virtualisée — react-window positionne ce composant en absolu (`style`
// fourni par la lib), donc la structure interne est en flex et non en <tr>/<td>.
const VirtualRow = ({ index, style, sorted, onCardClick, compareIds, onToggleCompare }) => {
  const app = sorted[index];
  const stage = PIPELINE_STAGES[app.status] || { label: app.status, color: '#6B7280' };
  const scoreColor = Number(app.score) >= 75 ? '#10B981' : Number(app.score) >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div
      onClick={() => onCardClick && onCardClick(app)}
      style={{
        ...style,
        display: 'flex', alignItems: 'center', cursor: 'pointer',
        background: index % 2 === 0 ? 'white' : '#FAFAFA',
        borderBottom: '1px solid #F3F4F6',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; }}
      onMouseLeave={e => { e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#FAFAFA'; }}
    >
      {onToggleCompare && (
        <div style={{ width: '40px', flexShrink: 0, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={compareIds.has(app.id)}
            onChange={() => onToggleCompare(app.id)}
            style={{ width: '15px', height: '15px', cursor: 'pointer' }}
          />
        </div>
      )}
      <div style={{ flex: COLUMNS[0].flex, minWidth: 0, padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #667EEA, #764BA2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', flexShrink: 0,
          }}>
            {app.candidateAvatar || '👤'}
          </div>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {app.candidateName || '—'}
          </span>
        </div>
      </div>
      <div style={{ flex: COLUMNS[1].flex, minWidth: 0, padding: '0 16px', fontSize: '13px', color: '#374151' }}>
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {app.missionTitle || '—'}
        </div>
      </div>
      <div style={{ flex: COLUMNS[2].flex, minWidth: 0, padding: '0 16px', fontSize: '12px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {app.clientName || '—'}
      </div>
      <div style={{ flex: COLUMNS[3].flex, minWidth: 0, padding: '0 16px' }}>
        <span style={{
          padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
          background: `${stage.color}18`, color: stage.color, whiteSpace: 'nowrap',
        }}>
          {stage.label}
        </span>
      </div>
      <div style={{ flex: COLUMNS[4].flex, minWidth: 0, padding: '0 16px', textAlign: 'center' }}>
        {app.score > 0 ? (
          <span style={{ fontSize: '12px', fontWeight: '800', color: scoreColor }}>
            {app.score}%
          </span>
        ) : (
          <span style={{ fontSize: '11px', color: '#D1D5DB' }}>—</span>
        )}
      </div>
      <div style={{ flex: COLUMNS[5].flex, minWidth: 0, padding: '0 16px', fontSize: '12px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
        {app.dateApplied
          ? new Date(app.dateApplied).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—'}
      </div>
    </div>
  );
};

// Variante virtualisée (T-257) — au-delà de VIRTUALIZE_THRESHOLD lignes,
// remplace le <table> natif par un en-tête flex + un <List> react-window
// (qui ne peut pas virtualiser à l'intérieur d'un <tbody> natif).
function VirtualizedPipelineTable({ sorted, sort, onSort, onCardClick, compareIds, onToggleCompare }) {
  return (
    <div style={{ borderRadius: '16px', border: '1px solid #E5E7EB', background: 'white', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {onToggleCompare && <div style={{ width: '40px', flexShrink: 0, background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }} />}
        {COLUMNS.map(col => (
          <VirtualHeaderCell key={col.key} col={col} sort={sort} onSort={onSort} />
        ))}
      </div>
      <List
        rowComponent={VirtualRow}
        rowProps={{ sorted, onCardClick, compareIds, onToggleCompare }}
        rowCount={sorted.length}
        rowHeight={ROW_HEIGHT}
        overscanCount={6}
        style={{ height: '65vh', width: '100%' }}
      />
    </div>
  );
}

export default PipelineListView;
