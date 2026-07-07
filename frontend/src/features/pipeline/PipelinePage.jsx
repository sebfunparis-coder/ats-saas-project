import React, { useState, useRef } from 'react';
import PageContainer from '@/shared/components/Layout/PageContainer';
import Input from '@/shared/components/Form/Input';
import Button from '@/shared/components/Button/Button';
import StatsCard, { StatsGrid } from '@/shared/components/StatsCard/StatsCard';
import KanbanBoard from './components/KanbanBoard';
import PipelineListView from './components/PipelineListView';
import CandidateCompareModal from './components/CandidateCompareModal';
import EvaluationModal from './components/EvaluationModal';
import { useApplications } from '@/core/hooks/useApplications';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import { useData } from '@/core/contexts/DataContext';
import { useAuth } from '@/core/contexts/AuthContext';
import { exportPipeline, generateFilename, printInterviewReport } from '@/core/utils/exporters';
import { createShareLink, getShareLinksForApplication } from '@/core/utils/shareLink';
import { createTrackingLink } from '@/core/utils/trackingLink';
import { createSurveyLink, getSurveysForCompany } from '@/core/utils/surveyLink';
import { isUUID } from '@/core/utils/isUUID';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import api from '@/services/api';
import { APPLICATION_PIPELINE_STAGES, APPLICATION_NEXT_STATUSES } from '@/config/constants';
import { consolidateEvaluations } from '@/core/utils/evaluationConsolidation';

const _getLocale = () => { const l = localStorage.getItem('ats_language') || 'fr'; return l.startsWith('en') ? 'en-GB' : 'fr-FR'; };

const COMMENTS_KEY = 'ats_app_comments';

const COMMENT_TYPES = {
  note:     { label: '📝 Note',      color: '#3B82F6', bg: '#EFF6FF' },
  feedback: { label: '💬 Feedback',  color: '#F59E0B', bg: '#FFFBEB' },
  decision: { label: '✅ Décision',  color: '#10B981', bg: '#ECFDF5' },
};

const SURVEY_QUESTIONS = [
  { id: 'process', label: 'Comment évaluez-vous le processus de recrutement ?' },
  { id: 'communication', label: 'La communication avec l\'équipe a-t-elle été satisfaisante ?' },
  { id: 'nps', label: 'Recommanderiez-vous notre entreprise comme employeur ? (0–10)' },
];

// T-395 : source unique désormais dans constants.js (voir APPLICATION_PIPELINE_STAGES/
// APPLICATION_NEXT_STATUSES) — alias locaux conservés pour ne pas retoucher
// tous les usages de STATUS_LABELS/NEXT_STATUSES plus bas dans ce fichier.
const STATUS_LABELS = APPLICATION_PIPELINE_STAGES;
const NEXT_STATUSES = APPLICATION_NEXT_STATUSES;

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
  const { applications, loading: applicationsLoading, changeStatus, updateApplication } = useApplications();
  const { showNotification } = useNotifications();
  const { evaluations, missions, team } = useData();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMission, setFilterMission] = useState('');
  const [filterMinScore, setFilterMinScore] = useState('');
  const [filterMaxDays, setFilterMaxDays] = useState('');
  const [filterRecruiter, setFilterRecruiter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [evaluationTarget, setEvaluationTarget] = useState(null);
  const [shareLinks, setShareLinks] = useState([]);
  const [sharing, setSharing] = useState(false);
  const [scoringAppId, setScoringAppId] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list' | 'swimlane'
  const [showArchived, setShowArchived] = useState(false);
  const [compareIds, setCompareIds] = useState(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const [allComments, setAllComments] = useState(() => JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}'));
  const [commentInput, setCommentInput] = useState('');
  const [commentType, setCommentType] = useState('note');
  const commentInputRef = useRef(null);
  // T-337 : les enquêtes de satisfaction vivent désormais en Supabase (plus en
  // localStorage) — chargées une fois par company au montage de la page.
  const [surveys, setSurveys] = useState({});
  const [surveyLinkCopied, setSurveyLinkCopied] = useState(false);
  const [trackingLinkCopied, setTrackingLinkCopied] = useState(false);
  const [emailTarget, setEmailTarget] = useState(null);
  const [emailTemplateId, setEmailTemplateId] = useState('');
  const [emailCustomBody, setEmailCustomBody] = useState('');

  // T-251 — Lien de suivi candidat (Supabase, voir migration 011 — l'ancienne
  // version localStorage n'était jamais accessible depuis l'appareil du candidat)
  // Garde-fou (trouvé en testant réellement l'app) : quand Supabase n'a pas
  // encore de vraies candidatures, `applications` retombe sur des données mock
  // avec des ID entiers ("1", "2"...) — les colonnes uuid des tables de liens
  // (tracking_links/satisfaction_surveys/share_links) rejettent ces ID avec une
  // erreur Postgres 22P02 peu compréhensible pour l'utilisateur. On l'anticipe.
  const generateTrackingLink = (app) => {
    if (!isUUID(app.id)) throw new Error('Cette candidature est une donnée de démonstration (pas encore synchronisée avec la base) — cette action n\'est disponible que sur une vraie candidature.');
    return createTrackingLink({ applicationId: app.id, companyId: user?.companyId, actorId: user?.id });
  };

  // T-337 — Charge les enquêtes de satisfaction déjà envoyées pour cette company.
  React.useEffect(() => {
    if (!user?.companyId) return;
    let cancelled = false;
    getSurveysForCompany(user.companyId)
      .then(list => {
        if (cancelled) return;
        const byAppId = {};
        list.forEach(s => { byAppId[String(s.appId)] = s; });
        setSurveys(byAppId);
      })
      .catch(err => console.error('Erreur chargement enquêtes satisfaction:', err));
    return () => { cancelled = true; };
  }, [user?.companyId]);

  const getAppComments = (appId) => allComments[String(appId)] || [];

  const addComment = (appId, text, type) => {
    if (!text.trim()) return;
    const comment = {
      id: Date.now(),
      author: user?.name || user?.email || 'Moi',
      text: text.trim(),
      type,
      createdAt: new Date().toISOString(),
    };
    const updated = { ...allComments, [String(appId)]: [...getAppComments(appId), comment] };
    setAllComments(updated);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(updated));
    setCommentInput('');
    // Detect @mentions and show notification
    const mentions = text.match(/@(\w[\w\s]*?)(?=\s|$|,|\.)/g);
    if (mentions && mentions.length > 0) {
      mentions.forEach(m => {
        const name = m.replace('@', '').trim();
        if (name && name.toLowerCase() !== (user?.name || '').toLowerCase()) {
          showNotification('[Mention] ' + (user?.name || 'Quelqu\'un') + ' vous a mentionne dans un commentaire', 'info');
        }
      });
    }
  };

  const deleteComment = (appId, commentId) => {
    const updated = { ...allComments, [String(appId)]: getAppComments(appId).filter(c => c.id !== commentId) };
    setAllComments(updated);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(updated));
  };

  const getSurveyForApp = (appId) => surveys[String(appId)];

  // T-337 : génère réellement la ligne en base (avant : localStorage local au
  // navigateur du recruteur, jamais visible depuis l'appareil du candidat, et
  // la route /survey/:token n'existait même pas).
  const generateSurveyLink = async (app) => {
    if (!isUUID(app.id)) throw new Error('Cette candidature est une donnée de démonstration (pas encore synchronisée avec la base) — cette action n\'est disponible que sur une vraie candidature.');
    const created = await createSurveyLink({
      applicationId: app.id,
      companyId: user?.companyId,
      candidateName: app.candidateName,
      missionTitle: app.missionTitle,
      actorId: user?.id,
    });
    setSurveys(prev => ({ ...prev, [String(app.id)]: created }));
    return created.link;
  };

  const missionOptions = [...new Set(applications.map(a => a.missionTitle).filter(Boolean))];

  const activeFilterCount = [filterMission, filterMinScore, filterMaxDays, filterRecruiter].filter(Boolean).length;

  const filteredApplications = applications.filter((app) => {
    if (!showArchived && app.status === 'archived') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!app.candidateName?.toLowerCase().includes(q) && !app.missionTitle?.toLowerCase().includes(q)) return false;
    }
    if (filterMission && app.missionTitle !== filterMission) return false;
    if (filterMinScore) {
      const score = Number(app.score) || 0;
      if (score < Number(filterMinScore)) return false;
    }
    if (filterMaxDays) {
      const ref = app.lastActivity || app.dateApplied || app.updatedAt;
      if (ref) {
        const days = Math.floor((Date.now() - new Date(ref).getTime()) / 86_400_000);
        if (days > Number(filterMaxDays)) return false;
      }
    }
    if (filterRecruiter && String(app.assignedTo) !== filterRecruiter) return false;
    return true;
  });

  const archivedCount = applications.filter(a => a.status === 'archived').length;

  const STAGE_HISTORY_KEY = 'ats_stage_history';
  const appendStageHistory = (applicationId, fromStatus, toStatus) => {
    try {
      const all = JSON.parse(localStorage.getItem(STAGE_HISTORY_KEY) || '{}');
      const history = all[applicationId] || [];
      history.push({ from: fromStatus, to: toStatus, at: new Date().toISOString() });
      all[applicationId] = history;
      localStorage.setItem(STAGE_HISTORY_KEY, JSON.stringify(all));
    } catch {}
  };
  const getStageHistory = (applicationId) => {
    try { const all = JSON.parse(localStorage.getItem(STAGE_HISTORY_KEY) || '{}'); return all[applicationId] || []; } catch { return []; }
  };

  const handleApplicationMove = async (applicationId, newStatus) => {
    try {
      const app = applications.find(a => a.id === applicationId || a._id === applicationId);
      appendStageHistory(applicationId, app?.status, newStatus);
      await changeStatus(applicationId, newStatus);
      if (selectedApp?.id === applicationId) {
        setSelectedApp((prev) => ({ ...prev, status: newStatus }));
      }
      const stageTpls = (() => { try { return JSON.parse(localStorage.getItem('ats_stage_templates') || '{}'); } catch { return {}; } })();
      const tplSlug = stageTpls[newStatus];
      const msg = tplSlug ? `✅ Candidature déplacée — Template "${tplSlug}" disponible pour envoi` : 'Candidature déplacée avec succès';
      showNotification(msg, 'success');
    } catch (error) {
      console.error('Erreur déplacement candidature:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedApp) return;
    await handleApplicationMove(selectedApp.id, newStatus);
  };

  // T-391 : le drag & drop du Kanban ne vérifiait aucune règle de transition
  // (contrairement aux boutons "Déplacer vers", qui ne proposent déjà que les
  // statuts de NEXT_STATUSES) — un glisser-déposer direct pouvait sauter
  // plusieurs étapes (ex. received → hired). KanbanBoard.jsx bloque désormais
  // ce cas et appelle ce callback au lieu de déplacer la carte.
  const handleInvalidMove = (app, newStatus) => {
    const fromLabel = STATUS_LABELS[app.status]?.label || app.status;
    const toLabel = STATUS_LABELS[newStatus]?.label || newStatus;
    showNotification(
      `Passage direct de "${fromLabel}" à "${toLabel}" non autorisé — utilisez le menu "Déplacer vers" de la candidature pour suivre les étapes du pipeline.`,
      'error'
    );
  };

  const handleAIScore = async (app) => {
    setScoringAppId(app.id);
    try {
      const { data } = await api.post(`/applications/${app.id}/score`);
      const newScore = data?.score ?? data?.data?.score ?? null;
      if (newScore !== null) {
        setSelectedApp((prev) => prev ? { ...prev, score: newScore } : prev);
        showNotification(`Score IA calculé : ${newScore}%`, 'success');
      }
    } catch {
      showNotification('Impossible de calculer le score IA', 'error');
    } finally {
      setScoringAppId(null);
    }
  };

  const handleQuickNote = (appId, note) => {
    // T-331 : l'appel n'était ni attendu ni catché — un échec d'écriture
    // (colonne manquante, etc.) laissait la note affichée en state local sans
    // jamais persister, sans que l'utilisateur en soit informé.
    if (updateApplication) {
      updateApplication(appId, { quickNote: note }).catch(error => {
        console.error('Erreur sauvegarde note rapide:', error);
        showNotification('La note n\'a pas pu être enregistrée', 'error');
      });
    }
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

  // T-247 — Évaluation du recruteur courant (pas "la dernière par n'importe qui")
  const getMyEvaluation = (appId) =>
    getAppEvaluations(appId).find((e) => e.evaluatorId === user?.id) || null;

  // T-247 — Consolidation automatique si plusieurs recruteurs évaluent
  // (logique pure extraite dans core/utils/evaluationConsolidation.js, T-406)
  const getConsolidatedEvaluation = (appId) => consolidateEvaluations(getAppEvaluations(appId));

  const getMissionCriteria = (application) => {
    const mission = missions.find(m => String(m.id || m._id) === String(application?.missionId));
    return mission?.evaluationCriteria?.length > 0 ? mission.evaluationCriteria : null;
  };

  // T-249 — Partage candidat avec manager via lien sécurisé
  React.useEffect(() => {
    if (!selectedApp || !isUUID(selectedApp.id)) { setShareLinks([]); return; }
    let cancelled = false;
    getShareLinksForApplication(selectedApp.id)
      .then(links => { if (!cancelled) setShareLinks(links); })
      .catch(() => { if (!cancelled) setShareLinks([]); });
    return () => { cancelled = true; };
  }, [selectedApp?.id]);

  const handleShareWithManager = async () => {
    if (!selectedApp) return;
    if (!isUUID(selectedApp.id)) {
      showNotification('Cette candidature est une donnée de démonstration — le partage n\'est disponible que sur une vraie candidature.', 'error');
      return;
    }
    setSharing(true);
    try {
      const link = await createShareLink({
        applicationId: selectedApp.id,
        candidateId: selectedApp.candidateId,
        companyId: user?.companyId,
        actorId: user?.id,
      });
      await navigator.clipboard.writeText(link.url);
      showNotification('Lien copié — valable 7 jours', 'success');
      setShareLinks(prev => [link, ...prev]);
    } catch (error) {
      showNotification(`Erreur lors de la création du lien: ${error.message}`, 'error');
    } finally {
      setSharing(false);
    }
  };

  const stats = {
    total:     applications.length,
    screening: applications.filter((a) => a.status === 'screening').length,
    interview: applications.filter((a) => a.status === 'interview_1' || a.status === 'interview_2').length,
    offer:     applications.filter((a) => a.status === 'offer').length,
    hired:     applications.filter((a) => a.status === 'hired').length,
    rejected:  applications.filter((a) => a.status === 'rejected').length,
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
      <StatsGrid>
        <StatsCard icon="📊" label="Total" value={stats.total} color="#667EEA" />
        <StatsCard icon="🔍" label="Présélection" value={stats.screening} color="#3B82F6" />
        <StatsCard icon="👥" label="Entretiens" value={stats.interview} color="#F59E0B" />
        <StatsCard icon="📋" label="Offres" value={stats.offer} color="#8B5CF6" />
        <StatsCard icon="🎉" label="Recrutés" value={stats.hired} color="#10B981" />
        <StatsCard icon="❌" label="Refusés" value={stats.rejected} color="#EF4444" />
      </StatsGrid>

      {/* Barre filtres */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Input
              type="search"
              placeholder="🔍 Candidat ou mission…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            style={{
              padding: '9px 16px', border: `1.5px solid ${activeFilterCount > 0 ? '#667EEA' : '#E5E7EB'}`,
              borderRadius: '10px', background: activeFilterCount > 0 ? '#EEF2FF' : 'white',
              color: activeFilterCount > 0 ? '#667EEA' : '#6B7280',
              cursor: 'pointer', fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap',
            }}
          >
            🎛️ Filtres {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setFilterMission(''); setFilterMinScore(''); setFilterMaxDays(''); setFilterRecruiter(''); }}
              style={{ padding: '9px 14px', border: '1.5px solid #FCA5A5', borderRadius: '10px', background: '#FEF2F2', color: '#EF4444', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
            >
              ✕ Réinitialiser
            </button>
          )}
        </div>

        {showFilters && (
          <div style={{
            marginTop: '12px', padding: '16px 20px',
            background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB',
            display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end',
          }}>
            {/* Mission */}
            <div style={{ minWidth: '200px', flex: 1 }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: '6px' }}>
                Mission
              </label>
              <select
                value={filterMission}
                onChange={e => setFilterMission(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', background: 'white' }}
              >
                <option value="">Toutes les missions</option>
                {missionOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Score minimum */}
            <div style={{ minWidth: '160px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: '6px' }}>
                Score IA minimum
              </label>
              <select
                value={filterMinScore}
                onChange={e => setFilterMinScore(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', background: 'white' }}
              >
                <option value="">Tous</option>
                <option value="25">≥ 25%</option>
                <option value="50">≥ 50%</option>
                <option value="75">≥ 75%</option>
                <option value="90">≥ 90%</option>
              </select>
            </div>

            {/* Activité récente */}
            <div style={{ minWidth: '180px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: '6px' }}>
                Activité récente
              </label>
              <select
                value={filterMaxDays}
                onChange={e => setFilterMaxDays(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', background: 'white' }}
              >
                <option value="">Toutes périodes</option>
                <option value="7">7 derniers jours</option>
                <option value="14">14 derniers jours</option>
                <option value="30">30 derniers jours</option>
                <option value="90">90 derniers jours</option>
              </select>
            </div>

            {/* Recruteur assigné */}
            {team && team.length > 0 && (
              <div style={{ minWidth: '180px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Recruteur assigné
                </label>
                <select
                  value={filterRecruiter}
                  onChange={e => setFilterRecruiter(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', background: 'white' }}
                >
                  <option value="">Tous</option>
                  {team.map(m => <option key={m.id} value={String(m.id)}>{m.name}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

        {filteredApplications.length !== applications.length && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#667EEA', fontWeight: '600' }}>
            {filteredApplications.length} candidature(s) affichée(s) sur {applications.length}
          </div>
        )}
      </div>

      {/* Toggle vue + Compare */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[{ mode: 'kanban', label: '⬛ Kanban' }, { mode: 'list', label: '☰ Liste' }, { mode: 'swimlane', label: '🏊 Swimlane' }].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
                cursor: 'pointer',
                border: `1.5px solid ${viewMode === mode ? '#667EEA' : '#E5E7EB'}`,
                background: viewMode === mode ? '#EEF2FF' : 'white',
                color: viewMode === mode ? '#667EEA' : '#6B7280',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowArchived(v => !v)}
          style={{
            padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
            cursor: 'pointer',
            border: `1.5px solid ${showArchived ? '#9CA3AF' : '#E5E7EB'}`,
            background: showArchived ? '#F3F4F6' : 'white',
            color: showArchived ? '#4B5563' : '#9CA3AF',
            transition: 'all 0.15s',
          }}
        >
          🗄️ Archivés{archivedCount > 0 ? ` (${archivedCount})` : ''}
        </button>
        {compareIds.size >= 2 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#667EEA', fontWeight: '700' }}>
              {compareIds.size} sélectionné(s)
            </span>
            <button
              onClick={() => setCompareOpen(true)}
              style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', border: '1.5px solid #667EEA', background: '#667EEA', color: 'white' }}
            >
              ⚖️ Comparer
            </button>
            <button
              onClick={() => setCompareIds(new Set())}
              aria-label="Effacer la sélection de comparaison"
              style={{ padding: '7px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', border: '1.5px solid #E5E7EB', background: 'white', color: '#6B7280' }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Board */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          applications={filteredApplications}
          onApplicationMove={handleApplicationMove}
          onInvalidMove={handleInvalidMove}
          onCardClick={(app) => { setSelectedApp(app); setCommentInput(''); setCommentType('note'); }}
          onQuickNote={handleQuickNote}
          showArchived={showArchived}
          onSendEmail={(app) => { setEmailTarget(app); setEmailTemplateId(''); setEmailCustomBody(''); }}
        />
      ) : viewMode === 'list' ? (
        <PipelineListView
          applications={filteredApplications}
          onCardClick={setSelectedApp}
          loading={applicationsLoading}
          compareIds={compareIds}
          onToggleCompare={(id) => setCompareIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else if (next.size < 3) next.add(id);
            return next;
          })}
        />
      ) : viewMode === 'swimlane' ? (() => {
        const STAGES = ['received','screening','interview_1','interview_2','test','offer','hired'];
        const STAGE_LABELS = { received:'Nouveau', screening:'Présélection', interview_1:'Entretien 1', interview_2:'Entretien 2', test:'Test', offer:'Offre', hired:'Embauché' };
        const recruiters = [...new Set(filteredApplications.map(a => a.assignedToName || 'Non assigné'))];
        return (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', minWidth: '900px', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 16px', background: '#F9FAFB', borderBottom: '2px solid #E5E7EB', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: '#374151', whiteSpace: 'nowrap', minWidth: '140px' }}>Recruteur</th>
                  {STAGES.map(s => (
                    <th key={s} style={{ padding: '10px 12px', background: '#F9FAFB', borderBottom: '2px solid #E5E7EB', textAlign: 'center', fontSize: '11px', fontWeight: '800', color: '#667EEA', whiteSpace: 'nowrap' }}>{STAGE_LABELS[s]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recruiters.map(recruiter => (
                  <tr key={recruiter} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '10px 16px', fontWeight: '700', fontSize: '13px', color: '#1F2937', background: '#FAFAFA', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>👤 {recruiter}</td>
                    {STAGES.map(stage => {
                      const apps = filteredApplications.filter(a => (a.assignedToName || 'Non assigné') === recruiter && a.status === stage);
                      return (
                        <td key={stage} style={{ padding: '8px', textAlign: 'center', verticalAlign: 'top', minWidth: '100px' }}>
                          {apps.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {apps.map(app => (
                                <div key={app.id} onClick={() => setSelectedApp(app)} style={{ padding: '6px 8px', background: '#EEF2FF', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', color: '#3730A3', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                                  {app.candidateName}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: '18px', color: '#E5E7EB' }}>—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })() : null}

      {/* Modal détail candidature */}
      {selectedApp && (() => {
        const latestEval = getLatestEvaluation(selectedApp.id);
        const appEvals = getAppEvaluations(selectedApp.id);
        const consolidated = getConsolidatedEvaluation(selectedApp.id);
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
                  aria-label="Fermer la fiche candidature"
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
                marginBottom: '20px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '20px', fontWeight: '900',
                      color: selectedApp.score >= 75 ? '#10B981' : selectedApp.score >= 50 ? '#F59E0B' : '#EF4444',
                    }}>
                      {selectedApp.score || 0}%
                    </span>
                    <button
                      onClick={() => handleAIScore(selectedApp)}
                      disabled={scoringAppId === selectedApp.id}
                      title="Recalculer le score IA"
                      style={{
                        padding: '4px 10px', fontSize: '11px', fontWeight: '700',
                        background: scoringAppId === selectedApp.id ? '#E5E7EB' : '#EEF2FF',
                        color: scoringAppId === selectedApp.id ? '#9CA3AF' : '#4338CA',
                        border: 'none', borderRadius: '6px', cursor: scoringAppId === selectedApp.id ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {scoringAppId === selectedApp.id ? '⏳' : '🤖 Scorer'}
                    </button>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Candidature</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>
                    {selectedApp.dateApplied ? new Date(selectedApp.dateApplied).toLocaleDateString(_getLocale()) : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>🧪 Score test pré-qualification</div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="—"
                    defaultValue={selectedApp.testScore ?? ''}
                    onBlur={async (e) => {
                      const value = e.target.value === '' ? null : Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                      if (value === (selectedApp.testScore ?? null)) return;
                      if (updateApplication) {
                        await updateApplication(selectedApp.id, { testScore: value });
                        setSelectedApp(prev => ({ ...prev, testScore: value }));
                        showNotification('Score test mis à jour', 'success');
                      }
                    }}
                    style={{ width: '80px', padding: '6px 10px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', fontWeight: '700' }}
                  />
                  <span style={{ fontSize: '13px', color: '#9CA3AF', marginLeft: '6px' }}>%</span>
                </div>
              </div>

              {/* Recruteur assigné */}
              {team && team.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                    👤 Recruteur assigné
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <select
                      value={selectedApp.assignedTo || ''}
                      onChange={async (e) => {
                        const memberId = e.target.value;
                        const member = team.find(m => m.id === memberId || m.id === Number(memberId));
                        const updated = { assignedTo: memberId || null, assignedToName: member?.name || null };
                        if (updateApplication) {
                          await updateApplication(selectedApp.id, updated);
                          setSelectedApp(prev => ({ ...prev, ...updated }));
                          showNotification(memberId ? `Assigné à ${member?.name}` : 'Assignation retirée', 'success');
                        }
                      }}
                      style={{
                        padding: '8px 12px', border: '1.5px solid #E5E7EB', borderRadius: '10px',
                        fontSize: '13px', background: 'white', minWidth: '200px', fontWeight: '600',
                      }}
                    >
                      <option value="">— Non assigné</option>
                      {team.map(m => (
                        <option key={m.id} value={m.id}>{m.avatar || '👤'} {m.name} ({m.role})</option>
                      ))}
                    </select>
                    {selectedApp.assignedToName && (
                      <span style={{
                        padding: '6px 12px', background: '#EEF2FF', borderRadius: '8px',
                        fontSize: '12px', fontWeight: '700', color: '#667EEA',
                      }}>
                        ✓ {selectedApp.assignedToName}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* T-249 — Partage candidat avec manager via lien sécurisé */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase' }}>
                    🔗 Partager avec un manager
                  </div>
                  <button
                    onClick={handleShareWithManager}
                    disabled={sharing}
                    style={{ padding: '6px 14px', background: '#EEF2FF', color: '#667EEA', border: '1.5px solid #C7D2FE', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: sharing ? 'wait' : 'pointer' }}
                  >
                    {sharing ? '⏳…' : '🔗 Générer un lien (7 jours)'}
                  </button>
                </div>
                {shareLinks.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {shareLinks.map(link => {
                      const expired = new Date(link.expires_at) < new Date();
                      return (
                        <div key={link.id} style={{ padding: '10px 12px', background: '#F9FAFB', borderRadius: '8px', fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: expired ? '#9CA3AF' : '#374151' }}>
                            <span>{expired ? '⌛ Expiré' : `Valable jusqu'au ${new Date(link.expires_at).toLocaleDateString(_getLocale())}`}</span>
                            {link.reviewed_at && <span style={{ fontWeight: '700', color: '#667EEA' }}>✓ Avis reçu</span>}
                          </div>
                          {link.review_text && (
                            <div style={{ marginTop: '6px', padding: '8px 10px', background: 'white', borderRadius: '6px', color: '#374151' }}>
                              <strong>{link.reviewer_name || 'Manager'}</strong> {link.review_recommendation && `— ${{ go: '✅ Recommandé', maybe: '🤔 À revoir', no_go: '❌ Non retenu' }[link.review_recommendation] || link.review_recommendation}`}
                              <div style={{ marginTop: '4px', color: '#6B7280' }}>{link.review_text}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* T-247 — Consolidation automatique si plusieurs recruteurs évaluent */}
              {consolidated && consolidated.count > 1 && (
                <div style={{
                  background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                  border: '1.5px solid #818CF8', borderRadius: '14px',
                  padding: '16px', marginBottom: '20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#3730A3' }}>
                      🧮 Consolidation — {consolidated.count} évaluateurs
                    </div>
                    <div style={{
                      fontSize: '18px', fontWeight: '900',
                      color: consolidated.avgScore >= 75 ? '#10B981' : consolidated.avgScore >= 50 ? '#F59E0B' : '#EF4444',
                    }}>
                      {consolidated.avgScore}% (moy.)
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: RECOMMENDATION_COLORS[consolidated.consensusRecommendation]?.color || '#6B7280', marginBottom: '10px' }}>
                    Consensus : {RECOMMENDATION_COLORS[consolidated.consensusRecommendation]?.label}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {consolidated.evaluators.map((e, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#4338CA' }}>
                        <span>{e.name}</span>
                        <span style={{ fontWeight: '700' }}>{e.score}% · {RECOMMENDATION_COLORS[e.recommendation]?.label || e.recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => printInterviewReport(selectedApp, latestEval)}
                        title="Exporter le rapport d'entretien en PDF"
                        style={{ padding: '4px 10px', fontSize: '11px', fontWeight: '700', background: 'white', color: '#92400E', border: '1px solid #F59E0B', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        🖨️ PDF
                      </button>
                      <div style={{
                        fontSize: '18px', fontWeight: '900',
                        color: latestEval.globalScore >= 75 ? '#10B981' : latestEval.globalScore >= 50 ? '#F59E0B' : '#EF4444',
                      }}>
                        {latestEval.globalScore}%
                      </div>
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

              {/* Lien de suivi candidat */}
              <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={async () => {
                    try {
                      const link = await generateTrackingLink(selectedApp);
                      await navigator.clipboard.writeText(link);
                      setTrackingLinkCopied(true);
                      setTimeout(() => setTrackingLinkCopied(false), 2500);
                    } catch (error) {
                      showNotification(`Erreur lors de la création du lien: ${error.message}`, 'error');
                    }
                  }}
                  style={{ padding: '7px 14px', borderRadius: '8px', border: '1.5px solid #E5E7EB', background: trackingLinkCopied ? '#ECFDF5' : 'white', color: trackingLinkCopied ? '#10B981' : '#667EEA', cursor: 'pointer', fontWeight: '700', fontSize: '12px', transition: 'all 0.2s' }}
                >
                  {trackingLinkCopied ? '✓ Lien copié !' : '🔗 Lien de suivi candidat'}
                </button>
              </div>

              {/* Survey candidat */}
              {(() => {
                const survey = getSurveyForApp(selectedApp.id);
                return (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>📊 Feedback candidat</div>
                    {!survey ? (
                      <button onClick={() => {
                        generateSurveyLink(selectedApp)
                          .then(link => { navigator.clipboard.writeText(link).catch(() => {}); showNotification('Lien copié dans le presse-papiers', 'success'); })
                          .catch(err => { console.error('Erreur création enquête satisfaction:', err); showNotification(err.message || 'Impossible de créer le questionnaire', 'error'); });
                      }}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #667EEA', background: '#EEF2FF', color: '#667EEA', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                        📤 Envoyer questionnaire satisfaction
                      </button>
                    ) : (
                      <div style={{ padding: '14px', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                        {survey.answers ? (
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#10B981', marginBottom: '8px' }}>✅ Réponse reçue le {new Date(survey.answeredAt).toLocaleDateString(_getLocale())}</div>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                              <div style={{ fontSize: '12px' }}>Processus: <strong>{'★'.repeat(survey.answers.process)}{'☆'.repeat(5 - survey.answers.process)}</strong></div>
                              <div style={{ fontSize: '12px' }}>Communication: <strong>{'★'.repeat(survey.answers.communication)}{'☆'.repeat(5 - survey.answers.communication)}</strong></div>
                              <div style={{ fontSize: '12px' }}>NPS: <strong style={{ color: survey.answers.nps >= 9 ? '#10B981' : survey.answers.nps >= 7 ? '#F59E0B' : '#EF4444' }}>{survey.answers.nps}/10</strong></div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>⏳ Envoyé le {new Date(survey.sentAt).toLocaleDateString(_getLocale())} — En attente de réponse</div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button onClick={() => { navigator.clipboard.writeText(survey.link || '').catch(() => {}); setSurveyLinkCopied(true); setTimeout(() => setSurveyLinkCopied(false), 2000); }}
                                style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: surveyLinkCopied ? '#10B981' : '#6B7280' }}>
                                {surveyLinkCopied ? '✓ Copié' : '🔗 Copier le lien'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Comments thread */}
              {(() => {
                const comments = getAppComments(selectedApp.id);
                return (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
                      💬 Commentaires ({comments.length})
                    </div>
                    {/* Thread */}
                    {comments.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', maxHeight: '220px', overflowY: 'auto' }}>
                        {comments.map(c => {
                          const ct = COMMENT_TYPES[c.type] || COMMENT_TYPES.note;
                          return (
                            <div key={c.id} style={{
                              padding: '10px 12px', background: ct.bg,
                              borderLeft: `3px solid ${ct.color}`, borderRadius: '8px',
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <span style={{ fontSize: '11px', fontWeight: '800', color: ct.color }}>{ct.label}</span>
                                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>par {c.author}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <span style={{ fontSize: '10px', color: '#9CA3AF' }}>
                                    {new Date(c.createdAt).toLocaleDateString(_getLocale(), { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <button onClick={() => deleteComment(selectedApp.id, c.id)}
                                    aria-label="Supprimer le commentaire"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '12px', padding: '0' }}>✕</button>
                                </div>
                              </div>
                              <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
                                  {c.text.split(/(@\w+)/g).map((part, pi) =>
                                    part.startsWith('@') ? (
                                      <span key={pi} style={{ color: '#667EEA', fontWeight: '700', background: '#EEF2FF', borderRadius: '4px', padding: '0 3px' }}>{part}</span>
                                    ) : part
                                  )}
                                </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {/* Input */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        value={commentType}
                        onChange={e => setCommentType(e.target.value)}
                        style={{ padding: '8px 10px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '12px', background: 'white', flexShrink: 0 }}
                      >
                        {Object.entries(COMMENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      <input
                        ref={commentInputRef}
                        value={commentInput}
                        onChange={e => setCommentInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addComment(selectedApp.id, commentInput, commentType); } }}
                        placeholder="Ajouter un commentaire… (Entrée)"
                        style={{
                          flex: 1, padding: '8px 12px', border: '1.5px solid #E5E7EB',
                          borderRadius: '8px', fontSize: '13px', outline: 'none',
                          fontFamily: 'inherit',
                        }}
                      />
                      <button
                        onClick={() => addComment(selectedApp.id, commentInput, commentType)}
                        disabled={!commentInput.trim()}
                        aria-label="Ajouter le commentaire"
                        style={{
                          padding: '8px 14px', borderRadius: '8px', border: 'none',
                          background: commentInput.trim() ? '#667EEA' : '#E5E7EB',
                          color: commentInput.trim() ? 'white' : '#9CA3AF',
                          cursor: commentInput.trim() ? 'pointer' : 'not-allowed',
                          fontWeight: '700', fontSize: '13px', flexShrink: 0,
                        }}
                      >+</button>
                    </div>
                  </div>
                );
              })()}

              {/* Historique déplacements */}
              {(() => {
                const history = getStageHistory(selectedApp.id || selectedApp._id);
                if (!history.length) return null;
                const STAGE_LABEL_MAP = {
                  new: 'Nouveau', shortlisted: 'Présélection', interview: 'Entretien',
                  test: 'Test', offer: 'Offre', hired: 'Embauché', archived: 'Archivé',
                };
                return (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px' }}>📋 Historique des étapes</div>
                    <div style={{ position: 'relative', paddingLeft: '20px' }}>
                      <div style={{ position: 'absolute', left: '7px', top: '0', bottom: '0', width: '2px', background: '#E5E7EB' }} />
                      {history.map((entry, idx) => {
                        const daysSince = Math.floor((Date.now() - new Date(entry.at).getTime()) / 86400000);
                        const label = daysSince === 0 ? "Aujourd'hui" : daysSince === 1 ? 'Hier' : `J-${daysSince}`;
                        return (
                          <div key={idx} style={{ position: 'relative', marginBottom: '10px', paddingLeft: '16px' }}>
                            <div style={{ position: 'absolute', left: '-13px', top: '5px', width: '10px', height: '10px', borderRadius: '50%', background: '#667EEA', border: '2px solid white', boxShadow: '0 0 0 2px #667EEA' }} />
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937' }}>
                              {STAGE_LABEL_MAP[entry.from] || entry.from} → {STAGE_LABEL_MAP[entry.to] || entry.to}
                            </div>
                            <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                              {new Date(entry.at).toLocaleDateString(_getLocale(), { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} · {label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

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
          existingEvaluation={getMyEvaluation(evaluationTarget.id)}
          missionCriteria={getMissionCriteria(evaluationTarget)}
        />
      )}
      <CandidateCompareModal
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        applications={applications.filter(a => compareIds.has(a.id))}
      />

      {/* Modal envoi email rapide */}
      {emailTarget && (() => {
        const DEFAULT_TEMPLATES = [
          { id: 'invite_interview', label: 'Invitation entretien', body: `Bonjour {candidat},\n\nNous souhaitons vous inviter à un entretien pour le poste {mission}.\n\nCordialement,\nL'équipe recrutement` },
          { id: 'relance', label: 'Relance candidat', body: `Bonjour {candidat},\n\nNous revenons vers vous concernant votre candidature pour {mission}. Seriez-vous toujours disponible ?\n\nCordialement,\nL'équipe recrutement` },
          { id: 'refus', label: 'Notification refus', body: `Bonjour {candidat},\n\nAprès examen de votre candidature pour {mission}, nous ne souhaitons pas donner suite.\n\nMerci de votre intérêt.\nCordialement,\nL'équipe recrutement` },
          { id: 'offre', label: 'Proposition offre', body: `Bonjour {candidat},\n\nNous avons le plaisir de vous proposer le poste {mission}. Merci de confirmer votre acceptation.\n\nCordialement,\nL'équipe recrutement` },
        ];
        const storedTemplates = (() => { try { return JSON.parse(localStorage.getItem('ats_email_templates') || '[]'); } catch { return []; } })();
        const allTemplates = [...DEFAULT_TEMPLATES, ...storedTemplates];
        const selectedTpl = allTemplates.find(t => t.id === emailTemplateId);
        const resolveBody = (body) => body.replace(/\{candidat\}/g, emailTarget.candidateName || '').replace(/\{mission\}/g, emailTarget.missionTitle || '');
        const finalBody = emailCustomBody || (selectedTpl ? resolveBody(selectedTpl.body) : '');

        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setEmailTarget(null)}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '520px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1F2937', margin: 0 }}>📧 Envoyer un email</h3>
                <button onClick={() => setEmailTarget(null)} aria-label="Fermer la fenêtre d'envoi d'email" style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
              </div>
              <div style={{ marginBottom: '16px', padding: '10px 14px', background: '#EEF2FF', borderRadius: '10px', fontSize: '13px', fontWeight: '700', color: '#4338CA' }}>
                À : {emailTarget.candidateName} — {emailTarget.missionTitle}
              </div>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', marginBottom: '6px' }}>TEMPLATE</div>
                <select
                  value={emailTemplateId}
                  onChange={e => { setEmailTemplateId(e.target.value); setEmailCustomBody(''); }}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#374151' }}
                >
                  <option value="">— Choisir un template —</option>
                  {allTemplates.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', marginBottom: '6px' }}>MESSAGE</div>
                <textarea
                  rows={7}
                  value={emailCustomBody || (selectedTpl ? resolveBody(selectedTpl.body) : '')}
                  onChange={e => setEmailCustomBody(e.target.value)}
                  placeholder="Rédigez votre message…"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', resize: 'vertical', fontFamily: 'inherit', outline: 'none', color: '#374151' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setEmailTarget(null)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #E5E7EB', background: 'white', color: '#6B7280', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>Annuler</button>
                <button
                  onClick={() => {
                    if (!finalBody.trim()) { showNotification('Veuillez rédiger un message', 'error'); return; }
                    showNotification(`Email envoyé à ${emailTarget.candidateName} ✓`, 'success');
                    setEmailTarget(null);
                  }}
                  style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#667EEA', color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
                >
                  📤 Envoyer (simulé)
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </PageContainer>
  );
}

export default PipelinePage;
