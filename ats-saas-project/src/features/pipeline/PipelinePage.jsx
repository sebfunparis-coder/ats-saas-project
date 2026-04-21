import React, { useState } from 'react';
import PageContainer from '@/shared/components/Layout/PageContainer';
import Input from '@/shared/components/Form/Input';
import Button from '@/shared/components/Button/Button';
import KanbanBoard from './components/KanbanBoard';
import EvaluationModal from './components/EvaluationModal';
import { useApplications } from '@/core/hooks/useApplications';
import { useUI } from '@/core/contexts/UIContext';
import { useData } from '@/core/contexts/DataContext';
import { exportPipeline, generateFilename } from '@/core/utils/exporters';

const STATUS_LABELS = {
  received:    { label: '📨 Reçue',        color: '#6B7280', bg: '#F3F4F6' },
  screening:   { label: '🔍 Présélection', color: '#3B82F6', bg: '#EFF6FF' },
  interview_1: { label: '👥 Entretien 1',  color: '#F59E0B', bg: '#FFFBEB' },
  interview_2: { label: '🎯 Entretien 2',  color: '#8B5CF6', bg: '#F5F3FF' },
  offer:       { label: '📋 Offre',        color: '#10B981', bg: '#ECFDF5' },
  final:       { label: '✅ Finaliste',    color: '#059669', bg: '#D1FAE5' },
  hired:       { label: '🎉 Recruté',      color: '#EC4899', bg: '#FDF2F8' },
  rejected:    { label: '❌ Refusé',       color: '#EF4444', bg: '#FEF2F2' },
};

const NEXT_STATUSES = {
  received:    ['screening', 'rejected'],
  screening:   ['interview_1', 'rejected'],
  interview_1: ['interview_2', 'offer', 'rejected'],
  interview_2: ['offer', 'final', 'rejected'],
  offer:       ['hired', 'rejected'],
  final:       ['hired', 'rejected'],
  hired:       [],
  rejected:    ['received'],
};

// Étapes où l'évaluation est pertinente
const EVALUABLE_STAGES = ['interview_1', 'interview_2', 'offer', 'final'];

const RECOMMENDATION_COLORS = {
  go:      { color: '#10B981', label: '✅ Recommandé' },
  maybe:   { color: '#F59E0B', label: '🤔 À revoir' },
  no_go:   { color: '#EF4444', label: '❌ Non retenu' },
  pending: { color: '#6B7280', label: '⏳ En attente' },
};

/**
 * Page Pipeline - Vue Kanban avec drag & drop, modal détail et évaluation structurée
 */
export function PipelinePage() {
  const { applications, changeStatus } = useApplications();
  const { showNotification } = useUI();
  const { evaluations } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [evaluationTarget, setEvaluationTarget] = useState(null); // app pour laquelle ouvrir le modal éval

  const filteredApplications = searchQuery.trim()
    ? applications.filter((app) =>
        app.candidateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.missionTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : applications;

  const handleApplicationMove = async (applicationId, newStatus) => {
    try {
      await changeStatus(applicationId, newStatus);
      if (selectedApp?.id === applicationId) {
        setSelectedApp((prev) => ({ ...prev, status: newStatus }));
      }
      showNotification('Candidature déplacée avec succès', 'success');
    } catch (error) {
      console.error('Erreur déplacement candidature:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedApp) return;
    await handleApplicationMove(selectedApp.id, newStatus);
  };

  const handleExportCSV = () => {
    if (applications.length === 0) {
      showNotification('Aucune candidature à exporter', 'warning');
      return;
    }
    exportPipeline(applications, generateFilename('pipeline', 'csv'));
    showNotification(`${applications.length} candidature(s) exportée(s)`, 'success');
  };

  const getAppEvaluations = (appId) =>
    evaluations.filter((e) => e.applicationId === appId);

  const getLatestEvaluation = (appId) => {
    const evals = getAppEvaluations(appId);
    return evals.length > 0 ? evals[evals.length - 1] : null;
  };

  const stats = {
    total:     applications.length,
    screening: applications.filter((a) => a.status === 'screening').length,
    interview: applications.filter((a) => a.status === 'interview_1' || a.status === 'interview_2').length,
    hired:     applications.filter((a) => a.status === 'hired').length,
  };

  return (
    <PageContainer
      title="Pipeline"
      subtitle={`Vue Kanban de vos ${applications.length} candidatures`}
      actions={
        <button
          onClick={handleExportCSV}
          style={{
            padding: '10px 18px', border: '1.5px solid #10B981',
            borderRadius: '10px', background: 'white',
            color: '#10B981', cursor: 'pointer', fontWeight: '600',
            fontSize: '14px', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#10B981'; }}
        >
          📤 Exporter CSV ({applications.length})
        </button>
      }
    >
      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        {[
          { label: '📊 Total',        value: stats.total,     grad: '#667EEA,#764BA2' },
          { label: '🔍 Présélection', value: stats.screening, grad: '#3B82F6,#60A5FA' },
          { label: '👥 Entretiens',   value: stats.interview, grad: '#F59E0B,#FBBF24' },
          { label: '🎉 Recrutés',     value: stats.hired,     grad: '#10B981,#34D399' },
        ].map((s) => (
          <div key={s.label} style={{
            padding: '20px', background: 'white', borderRadius: '16px',
            border: '2px solid #F3F4F6', textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              fontSize: '34px', fontWeight: '900',
              background: `linear-gradient(135deg, ${s.grad})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: '4px',
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Recherche */}
      <div style={{ marginBottom: '24px' }}>
        <Input
          type="search"
          placeholder="🔍 Rechercher par candidat ou mission..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Board */}
      <KanbanBoard
        applications={filteredApplications}
        onApplicationMove={handleApplicationMove}
        onCardClick={setSelectedApp}
      />

      {/* Modal détail candidature */}
      {selectedApp && (() => {
        const latestEval = getLatestEvaluation(selectedApp.id);
        const appEvals = getAppEvaluations(selectedApp.id);
        const canEvaluate = EVALUABLE_STAGES.includes(selectedApp.status);
        return (
          <div
            onClick={() => setSelectedApp(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, backdropFilter: 'blur(6px)', padding: '20px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white', borderRadius: '24px', maxWidth: '580px',
                width: '100%', padding: '36px',
                boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
                maxHeight: '90vh', overflowY: 'auto',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{
                    width: '56px', height: '56px',
                    background: `linear-gradient(135deg, ${STATUS_LABELS[selectedApp.status]?.color || '#667EEA'} 0%, ${STATUS_LABELS[selectedApp.status]?.color || '#667EEA'}99 100%)`,
                    borderRadius: '16px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '28px',
                  }}>
                    {selectedApp.candidateAvatar || '👤'}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#1F2937', marginBottom: '4px' }}>
                      {selectedApp.candidateName}
                    </h2>
                    <div style={{
                      display: 'inline-flex', padding: '4px 12px', borderRadius: '20px',
                      background: STATUS_LABELS[selectedApp.status]?.bg || '#F3F4F6',
                      color: STATUS_LABELS[selectedApp.status]?.color || '#6B7280',
                      fontSize: '12px', fontWeight: '700',
                    }}>
                      {STATUS_LABELS[selectedApp.status]?.label || selectedApp.status}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  style={{
                    width: '36px', height: '36px', border: 'none', background: '#FEF2F2',
                    color: '#EF4444', borderRadius: '10px', cursor: 'pointer',
                    fontSize: '16px', fontWeight: '700', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Infos */}
              <div style={{
                background: '#F9FAFB', borderRadius: '16px', padding: '20px',
                marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px',
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Mission</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>{selectedApp.missionTitle}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Client</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>{selectedApp.clientName || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Score IA</div>
                  <div style={{
                    fontSize: '20px', fontWeight: '900',
                    color: selectedApp.score >= 75 ? '#10B981' : selectedApp.score >= 50 ? '#F59E0B' : '#EF4444',
                  }}>
                    {selectedApp.score || 0}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Candidature</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>
                    {selectedApp.dateApplied ? new Date(selectedApp.dateApplied).toLocaleDateString('fr-FR') : '—'}
                  </div>
                </div>
              </div>

              {/* Évaluation existante */}
              {latestEval && (
                <div style={{
                  background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                  border: '1.5px solid #F59E0B', borderRadius: '14px',
                  padding: '16px', marginBottom: '20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#92400E' }}>
                      ⭐ Dernière évaluation — {latestEval.date}
                    </div>
                    <div style={{
                      fontSize: '18px', fontWeight: '900',
                      color: latestEval.globalScore >= 75 ? '#10B981' : latestEval.globalScore >= 50 ? '#F59E0B' : '#EF4444',
                    }}>
                      {latestEval.globalScore}%
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {latestEval.criteria.map((c) => c.score > 0 && (
                      <span key={c.id} style={{
                        fontSize: '11px', padding: '3px 8px', borderRadius: '6px',
                        background: 'white', color: '#6B7280', fontWeight: '600',
                      }}>
                        {c.name}: {'★'.repeat(c.score)}{'☆'.repeat(5 - c.score)}
                      </span>
                    ))}
                  </div>
                  {latestEval.recommendation && (
                    <div style={{
                      fontSize: '12px', fontWeight: '700',
                      color: RECOMMENDATION_COLORS[latestEval.recommendation]?.color || '#6B7280',
                    }}>
                      {RECOMMENDATION_COLORS[latestEval.recommendation]?.label}
                    </div>
                  )}
                  {appEvals.length > 1 && (
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px' }}>
                      {appEvals.length} évaluations au total
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {selectedApp.notes && (
                <div style={{
                  padding: '16px', background: '#FFFBEB', borderLeft: '4px solid #F59E0B',
                  borderRadius: '10px', marginBottom: '20px', fontSize: '14px',
                  color: '#92400E', lineHeight: '1.6',
                }}>
                  💬 {selectedApp.notes}
                </div>
              )}

              {/* Actions évaluation */}
              {canEvaluate && (
                <div style={{ marginBottom: '20px' }}>
                  <Button
                    variant="primary"
                    onClick={() => { setEvaluationTarget(selectedApp); setSelectedApp(null); }}
                    style={{ width: '100%' }}
                  >
                    {latestEval ? '✏️ Modifier l\'évaluation' : '⭐ Évaluer ce candidat'}
                  </Button>
                </div>
              )}

              {/* Déplacer vers */}
              {NEXT_STATUSES[selectedApp.status]?.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Déplacer vers
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {NEXT_STATUSES[selectedApp.status].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        style={{
                          padding: '10px 18px',
                          background: STATUS_LABELS[status]?.bg || '#F3F4F6',
                          color: STATUS_LABELS[status]?.color || '#374151',
                          border: `1.5px solid ${STATUS_LABELS[status]?.color || '#E5E7EB'}`,
                          borderRadius: '10px', cursor: 'pointer',
                          fontSize: '13px', fontWeight: '700', transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
                      >
                        {STATUS_LABELS[status]?.label || status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Modal d'évaluation */}
      {evaluationTarget && (
        <EvaluationModal
          application={evaluationTarget}
          isOpen={!!evaluationTarget}
          onClose={() => setEvaluationTarget(null)}
          existingEvaluation={getLatestEvaluation(evaluationTarget.id)}
        />
      )}
    </PageContainer>
  );
}

export default PipelinePage;
