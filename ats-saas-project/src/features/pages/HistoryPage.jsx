import React, { useState, useMemo } from 'react';
import PageContainer from '@/shared/components/Layout/PageContainer';
import { useData } from '@/core/contexts/DataContext';

const ENTITY_FILTERS = [
  { value: 'all',         label: '📋 Tout' },
  { value: 'candidate',   label: '👤 Candidats' },
  { value: 'mission',     label: '💼 Missions' },
  { value: 'application', label: '📨 Candidatures' },
  { value: 'client',      label: '🏢 Clients' },
  { value: 'event',       label: '📅 Événements' },
  { value: 'team',        label: '👥 Équipe' },
];

const ACTION_COLORS = {
  'créé':      { color: '#10B981', bg: '#ECFDF5' },
  'ajouté':    { color: '#10B981', bg: '#ECFDF5' },
  'modifié':   { color: '#3B82F6', bg: '#EFF6FF' },
  'mis à jour':{ color: '#3B82F6', bg: '#EFF6FF' },
  'supprimé':  { color: '#EF4444', bg: '#FEF2F2' },
  'déplacé':   { color: '#8B5CF6', bg: '#F5F3FF' },
  'évalué':    { color: '#F59E0B', bg: '#FFFBEB' },
};

function getActionColor(action) {
  const lower = action.toLowerCase();
  for (const [key, val] of Object.entries(ACTION_COLORS)) {
    if (lower.includes(key)) return val;
  }
  return { color: '#6B7280', bg: '#F9FAFB' };
}

function DiffView({ before, after }) {
  if (!before || !after) return null;
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])];
  return (
    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {keys.map((k) => (
        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <span style={{ fontWeight: '700', color: '#6B7280', minWidth: '80px' }}>{k} :</span>
          {before[k] !== undefined && (
            <span style={{
              padding: '2px 8px', borderRadius: '5px',
              background: '#FEF2F2', color: '#EF4444',
              textDecoration: 'line-through', fontWeight: '600',
            }}>
              {String(before[k])}
            </span>
          )}
          <span style={{ color: '#9CA3AF' }}>→</span>
          {after[k] !== undefined && (
            <span style={{
              padding: '2px 8px', borderRadius: '5px',
              background: '#ECFDF5', color: '#10B981',
              fontWeight: '600',
            }}>
              {String(after[k])}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Page Historique complet des modifications avec before/after
 */
export function HistoryPage() {
  const { history } = useData();
  const [entityFilter, setEntityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    let list = [...history];
    if (entityFilter !== 'all') {
      list = list.filter((h) => h.relatedTo?.type === entityFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (h) =>
          h.action?.toLowerCase().includes(q) ||
          h.details?.toLowerCase().includes(q) ||
          h.relatedTo?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [history, entityFilter, search]);

  // Regrouper par date
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((item) => {
      const date = item.date || 'Inconnu';
      if (!map.has(date)) map.set(date, []);
      map.get(date).push(item);
    });
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const formatDateLabel = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateStr === today) return "Aujourd'hui";
    if (dateStr === yesterday) return 'Hier';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    } catch { return dateStr; }
  };

  return (
    <PageContainer
      title="Historique"
      subtitle={`${history.length} événements enregistrés`}
    >
      {/* Filtres */}
      <div style={{ marginBottom: '20px' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Rechercher dans l'historique..."
          style={{
            width: '100%', padding: '10px 16px', border: '1.5px solid #E5E7EB',
            borderRadius: '10px', fontSize: '14px', outline: 'none',
            boxSizing: 'border-box', marginBottom: '12px',
          }}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ENTITY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setEntityFilter(f.value)}
              style={{
                padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '12px', fontWeight: '600', transition: 'all 0.15s',
                border: `1.5px solid ${entityFilter === f.value ? '#667EEA' : '#E5E7EB'}`,
                background: entityFilter === f.value ? '#EEF2FF' : 'white',
                color: entityFilter === f.value ? '#4338CA' : '#6B7280',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>Aucun événement trouvé</div>
        </div>
      ) : (
        <div>
          {grouped.map(([date, items]) => (
            <div key={date} style={{ marginBottom: '28px' }}>
              {/* Date label */}
              <div style={{
                fontSize: '13px', fontWeight: '800', color: '#6B7280',
                textTransform: 'uppercase', letterSpacing: '0.5px',
                marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
                {formatDateLabel(date)}
                <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map((item) => {
                  const ac = getActionColor(item.action);
                  const isExpanded = expandedId === item.id;
                  const hasDiff = item.before || item.after;
                  return (
                    <div
                      key={item.id}
                      onClick={() => hasDiff && setExpandedId(isExpanded ? null : item.id)}
                      style={{
                        padding: '14px 18px', background: 'white', borderRadius: '12px',
                        border: '1.5px solid #F3F4F6',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                        cursor: hasDiff ? 'pointer' : 'default',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => { if (hasDiff) e.currentTarget.style.borderColor = '#667EEA'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#F3F4F6'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Icon */}
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                          background: ac.bg, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '18px',
                        }}>
                          {item.icon || '📋'}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: '13px', fontWeight: '800',
                              color: ac.color, padding: '2px 8px',
                              background: ac.bg, borderRadius: '6px',
                            }}>
                              {item.action}
                            </span>
                            <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>
                              {item.relatedTo?.name || ''}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '3px' }}>
                            {item.details}
                          </div>
                          {isExpanded && hasDiff && (
                            <DiffView before={item.before} after={item.after} />
                          )}
                        </div>

                        {/* Time + expand indicator */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                          <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600' }}>
                            {item.time || ''}
                          </span>
                          {item.user && (
                            <span style={{ fontSize: '11px', color: '#D1D5DB' }}>{item.user}</span>
                          )}
                          {hasDiff && (
                            <span style={{ fontSize: '11px', color: '#667EEA' }}>
                              {isExpanded ? '▲ Masquer' : '▼ Détails'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

export default HistoryPage;
