import React, { useState, useMemo } from 'react';
import PageContainer from '@/shared/components/Layout/PageContainer';
import Button from '@/shared/components/Button/Button';
import { useData } from '@/core/contexts/DataContext';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import StatsCard, { StatsGrid } from '@/shared/components/StatsCard/StatsCard';

const PRIORITY_CONFIG = {
  high:   { label: '🔴 Haute',   color: '#EF4444', bg: '#FEF2F2' },
  medium: { label: '🟡 Moyenne', color: '#F59E0B', bg: '#FFFBEB' },
  low:    { label: '🟢 Basse',   color: '#10B981', bg: '#ECFDF5' },
};

const STATUS_CONFIG = {
  pending:     { label: '⏳ À faire',    color: '#6B7280', bg: '#F9FAFB' },
  in_progress: { label: '🔵 En cours',  color: '#3B82F6', bg: '#EFF6FF' },
  done:        { label: '✅ Terminé',   color: '#10B981', bg: '#ECFDF5' },
};

const RELATED_ICONS = { candidate: '👤', mission: '💼', client: '🏢', task: '✅' };

const EMPTY_FORM = {
  title: '', description: '', dueDate: '', priority: 'medium',
  relatedTo: null, assignedTo: '',
};

function TaskForm({ initial = EMPTY_FORM, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const isMobile = useIsMobile();
  const { candidates, missions, clients } = useData();
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const relatedType = form.relatedTo?.type || '';
  const relatedOptions = relatedType === 'candidate' ? candidates
    : relatedType === 'mission' ? missions
    : relatedType === 'client' ? clients
    : [];
  const getRelatedName = (item, type) => type === 'candidate'
    ? `${item.firstName || ''} ${item.lastName || item.name || ''}`.trim()
    : (item.title || item.name || '');

  const handleRelatedTypeChange = (type) => {
    if (!type) { set('relatedTo', null); return; }
    set('relatedTo', { type, id: '', name: '' });
  };

  const handleRelatedIdChange = (id) => {
    const item = relatedOptions.find(o => String(o.id) === String(id));
    if (!item) return;
    set('relatedTo', { type: relatedType, id: item.id, name: getRelatedName(item, relatedType) });
  };

  return (
    <div style={{
      padding: '20px', background: 'white', borderRadius: '16px',
      border: '2px solid #667EEA', boxShadow: '0 8px 24px rgba(102,126,234,0.12)',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Titre *</label>
          <input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Ex: Rappeler le candidat Alice..."
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Échéance</label>
          <input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Priorité</label>
          <select value={form.priority} onChange={(e) => set('priority', e.target.value)} style={inputStyle}>
            <option value="high">🔴 Haute</option>
            <option value="medium">🟡 Moyenne</option>
            <option value="low">🟢 Basse</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Assignée à</label>
          <input
            value={form.assignedTo}
            onChange={(e) => set('assignedTo', e.target.value)}
            placeholder="Nom du responsable..."
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Liée à</label>
          <select value={relatedType} onChange={(e) => handleRelatedTypeChange(e.target.value)} style={inputStyle}>
            <option value="">Aucun</option>
            <option value="candidate">👤 Candidat</option>
            <option value="mission">💼 Mission</option>
            <option value="client">🏢 Client</option>
          </select>
        </div>
        {relatedType && (
          <div>
            <label style={labelStyle}>{relatedType === 'candidate' ? 'Candidat' : relatedType === 'mission' ? 'Mission' : 'Client'}</label>
            <select value={form.relatedTo?.id || ''} onChange={(e) => handleRelatedIdChange(e.target.value)} style={inputStyle}>
              <option value="">Sélectionner...</option>
              {relatedOptions.map(item => (
                <option key={item.id} value={item.id}>{getRelatedName(item, relatedType)}</option>
              ))}
            </select>
          </div>
        )}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Détails de la tâche..."
            rows={2}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button variant="primary" onClick={() => form.title.trim() && onSave(form)} disabled={!form.title.trim()}>
          💾 Enregistrer
        </Button>
      </div>
    </div>
  );
}

const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: '9px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };

/**
 * Page de gestion des tâches et rappels
 */
export function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask } = useData();
  const { showNotification } = useNotifications();
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState('all'); // all | pending | in_progress | done
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const filtered = useMemo(() => {
    let list = [...tasks].sort((a, b) => {
      // Trier par priorité puis date
      const pOrder = { high: 0, medium: 1, low: 2 };
      if (pOrder[a.priority] !== pOrder[b.priority]) return pOrder[a.priority] - pOrder[b.priority];
      return (a.dueDate || '9999') < (b.dueDate || '9999') ? -1 : 1;
    });
    if (filter !== 'all') list = list.filter((t) => t.status === filter);
    if (priorityFilter !== 'all') list = list.filter((t) => t.priority === priorityFilter);
    return list;
  }, [tasks, filter, priorityFilter]);

  const stats = useMemo(() => ({
    total:       tasks.length,
    pending:     tasks.filter((t) => t.status === 'pending').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done:        tasks.filter((t) => t.status === 'done').length,
    overdue:     tasks.filter((t) => t.status !== 'done' && t.dueDate && t.dueDate < new Date().toISOString().split('T')[0]).length,
    highPriority: tasks.filter((t) => t.priority === 'high' && t.status !== 'done').length,
  }), [tasks]);

  const handleCreate = (form) => {
    addTask(form);
    setShowForm(false);
    showNotification('Tâche créée', 'success');
  };

  const handleEdit = (form) => {
    updateTask(editingTask.id, form);
    setEditingTask(null);
    showNotification('Tâche mise à jour', 'success');
  };

  const handleToggleStatus = (task) => {
    const next = task.status === 'done' ? 'pending' : task.status === 'pending' ? 'in_progress' : 'done';
    updateTask(task.id, { status: next });
  };

  const handleDelete = (id) => {
    deleteTask(id);
    showNotification('Tâche supprimée', 'success');
  };

  const isOverdue = (task) =>
    task.status !== 'done' && task.dueDate && task.dueDate < new Date().toISOString().split('T')[0];

  return (
    <PageContainer
      title="Tâches & Rappels"
      subtitle={`${stats.pending + stats.in_progress} tâches actives`}
      actions={
        <Button variant="primary" onClick={() => setShowForm(true)}>
          ➕ Nouvelle tâche
        </Button>
      }
    >
      {/* Stats */}
      <StatsGrid>
        <StatsCard icon="📊" label="Total" value={stats.total} color="#667EEA" />
        <StatsCard icon="⏳" label="À faire" value={stats.pending} color="#6B7280" />
        <StatsCard icon="🔵" label="En cours" value={stats.in_progress} color="#3B82F6" />
        <StatsCard icon="✅" label="Terminées" value={stats.done} color="#10B981" />
        <StatsCard icon="🚨" label="En retard" value={stats.overdue} color="#EF4444" />
        <StatsCard icon="🔴" label="Priorité haute" value={stats.highPriority} color="#DC2626" />
      </StatsGrid>

      {/* Formulaire de création */}
      {showForm && (
        <div style={{ marginBottom: '24px' }}>
          <TaskForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['all', 'pending', 'in_progress', 'done'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              border: `1.5px solid ${filter === s ? '#667EEA' : '#E5E7EB'}`,
              background: filter === s ? '#EEF2FF' : 'white',
              color: filter === s ? '#4338CA' : '#6B7280',
              transition: 'all 0.15s',
            }}
          >
            {s === 'all' ? '📋 Toutes' : STATUS_CONFIG[s]?.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          {['all', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              style={{
                padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                border: `1.5px solid ${priorityFilter === p ? (PRIORITY_CONFIG[p]?.color || '#667EEA') : '#E5E7EB'}`,
                background: priorityFilter === p ? (PRIORITY_CONFIG[p]?.bg || '#EEF2FF') : 'white',
                color: priorityFilter === p ? (PRIORITY_CONFIG[p]?.color || '#4338CA') : '#9CA3AF',
              }}
            >
              {p === 'all' ? 'Toutes priorités' : PRIORITY_CONFIG[p]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des tâches */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>Aucune tâche pour le moment</div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>Créez votre première tâche !</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((task) => (
            <div key={task.id}>
              {editingTask?.id === task.id ? (
                <TaskForm
                  initial={editingTask}
                  onSave={handleEdit}
                  onCancel={() => setEditingTask(null)}
                />
              ) : (
                <div style={{
                  padding: '16px 20px', background: 'white', borderRadius: '14px',
                  border: `1.5px solid ${isOverdue(task) ? '#FECACA' : task.status === 'done' ? '#D1FAE5' : '#F3F4F6'}`,
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  opacity: task.status === 'done' ? 0.7 : 1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s',
                }}>
                  {/* Checkbox status */}
                  <button
                    onClick={() => handleToggleStatus(task)}
                    title="Changer le statut"
                    style={{
                      width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                      border: `2px solid ${STATUS_CONFIG[task.status]?.color || '#6B7280'}`,
                      background: task.status === 'done' ? '#10B981' : task.status === 'in_progress' ? '#3B82F6' : 'white',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', color: 'white', marginTop: '2px',
                    }}
                  >
                    {task.status === 'done' ? '✓' : task.status === 'in_progress' ? '▶' : ''}
                  </button>

                  {/* Contenu */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '14px', fontWeight: '700', color: '#1F2937',
                        textDecoration: task.status === 'done' ? 'line-through' : 'none',
                      }}>
                        {task.title}
                      </span>
                      <span style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '6px',
                        background: PRIORITY_CONFIG[task.priority]?.bg,
                        color: PRIORITY_CONFIG[task.priority]?.color,
                        fontWeight: '700',
                      }}>
                        {PRIORITY_CONFIG[task.priority]?.label}
                      </span>
                      {isOverdue(task) && (
                        <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: '700' }}>🚨 En retard</span>
                      )}
                    </div>
                    {task.description && (
                      <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>{task.description}</div>
                    )}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: '#9CA3AF' }}>
                      {task.dueDate && (
                        <span>📅 {new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
                      )}
                      {task.assignedTo && <span>👤 {task.assignedTo}</span>}
                      {task.relatedTo && (
                        <span>
                          {RELATED_ICONS[task.relatedTo.type] || '🔗'} {task.relatedTo.name}
                        </span>
                      )}
                      <span style={{
                        color: STATUS_CONFIG[task.status]?.color,
                        fontWeight: '700',
                      }}>
                        {STATUS_CONFIG[task.status]?.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      onClick={() => setEditingTask(task)}
                      title="Modifier"
                      aria-label={`Modifier la tâche ${task.title || ''}`.trim()}
                      style={{
                        padding: '6px 10px', background: '#F3F4F6', border: 'none',
                        borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      title="Supprimer"
                      aria-label={`Supprimer la tâche ${task.title || ''}`.trim()}
                      style={{
                        padding: '6px 10px', background: '#FEF2F2', border: 'none',
                        borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

export default TasksPage;
