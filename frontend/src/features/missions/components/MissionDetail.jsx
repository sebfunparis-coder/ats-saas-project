import React, { useState, useMemo, useCallback } from 'react';

const SCORECARD_KEY = 'ats_scorecards';

function ScorecardSection({ missionId }) {
  const [criteria, setCriteria] = React.useState(() => {
    try { const all = JSON.parse(localStorage.getItem(SCORECARD_KEY) || '{}'); return all[missionId] || []; } catch { return []; }
  });
  const [newCrit, setNewCrit] = React.useState('');
  const [newWeight, setNewWeight] = React.useState('20');

  const save = (updated) => {
    setCriteria(updated);
    try {
      const all = JSON.parse(localStorage.getItem(SCORECARD_KEY) || '{}');
      localStorage.setItem(SCORECARD_KEY, JSON.stringify({ ...all, [missionId]: updated }));
    } catch {}
  };

  const addCrit = () => {
    if (!newCrit.trim()) return;
    save([...criteria, { id: Date.now(), name: newCrit.trim(), weight: parseInt(newWeight) || 20 }]);
    setNewCrit('');
  };

  const removeCrit = (id) => save(criteria.filter(c => c.id !== id));

  return (
    <div style={{ padding: '20px', background: '#FFFBEB', borderRadius: '12px', border: '1.5px solid #FDE68A', marginBottom: '24px' }}>
      <div style={{ fontSize: '13px', fontWeight: '800', color: '#92400E', marginBottom: '12px' }}>📋 Scorecard de mission</div>
      {criteria.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          {criteria.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'white', borderRadius: '8px', border: '1px solid #FDE68A' }}>
              <span style={{ flex: 1, fontSize: '13px', color: '#1F2937', fontWeight: '600' }}>{c.name}</span>
              <span style={{ fontSize: '11px', background: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>{c.weight}pts</span>
              <button onClick={() => removeCrit(c.id)} aria-label={`Supprimer le critère ${c.name}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '14px', padding: '0 2px' }}>✕</button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '10px', fontStyle: 'italic' }}>Aucun critère défini. Ajoutez des critères d'évaluation propres à cette mission.</div>
      )}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input value={newCrit} onChange={e => setNewCrit(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addCrit(); }}
          placeholder="Ex: React avancé, Autonomie..."
          style={{ flex: 1, padding: '7px 10px', border: '1px solid #FDE68A', borderRadius: '7px', fontSize: '12px', fontFamily: 'inherit', background: 'white' }} />
        <select value={newWeight} onChange={e => setNewWeight(e.target.value)}
          style={{ padding: '7px 8px', border: '1px solid #FDE68A', borderRadius: '7px', fontSize: '12px', background: 'white' }}>
          {[10,15,20,25,30].map(w => <option key={w} value={w}>{w}pts</option>)}
        </select>
        <button onClick={addCrit} disabled={!newCrit.trim()}
          style={{ padding: '7px 14px', borderRadius: '7px', border: 'none', background: newCrit.trim() ? '#F59E0B' : '#E5E7EB', color: newCrit.trim() ? 'white' : '#9CA3AF', cursor: newCrit.trim() ? 'pointer' : 'not-allowed', fontWeight: '700', fontSize: '12px' }}>
          + Ajouter
        </button>
      </div>
    </div>
  );
}
import Modal from '@/shared/components/Modal/Modal';
import Badge from '@/shared/components/DataDisplay/Badge';
import Button from '@/shared/components/Button/Button';
import { STATUS_LABELS } from '@/config/constants';
import { formatDate, formatFileSize } from '@/core/utils/formatters';
import { useAuth } from '@/core/contexts/AuthContext';
import { useData } from '@/core/contexts/DataContext';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import {
  sectionStyle, sectionTitleStyle,
  twoColGrid, readFieldWrapper, readFieldLabel, readFieldValue,
  iconBoxStyle, modalHeaderInner, modalHeaderTitle, modalHeaderSubtitle,
} from '@/shared/styles/modalStyles';

/**
 * Modal de détail d'une mission
 *
 * @example
 * <MissionDetail
 *   mission={mission}
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 */
export function MissionDetail({ mission, isOpen, onClose, onEdit, onDelete, onDuplicate, onSaveAsTemplate, onMatch, onRefresh }) {
  const { user } = useAuth();
  const { history = [], candidates = [], updateMission } = useData();
  const { success: notifySuccess, error: notifyError } = useNotifications();

  // Candidats similaires refuses sur d'autres missions
  const { applications = [] } = useData();
  const crossRecommendations = useMemo(() => {
    if (!mission || !candidates.length || !applications.length) return [];
    const mId = mission._id || mission.id;
    const mSkills = (mission.skills || []).map(s => s.toLowerCase());
    // Find candidates rejected on OTHER missions
    const rejectedOnOtherMissions = applications
      .filter(a => String(a.missionId) !== String(mId) && a.status === 'rejected' && a.candidateId);
    const rejectedCandidateIds = [...new Set(rejectedOnOtherMissions.map(a => String(a.candidateId)))];
    return candidates
      .filter(c => rejectedCandidateIds.includes(String(c.id || c._id)))
      .map(c => {
        const cSkills = (c.skills || []).map(s => s.toLowerCase());
        const matched = mSkills.filter(s => cSkills.some(cs => cs.includes(s) || s.includes(cs)));
        const score = mSkills.length > 0 ? Math.round((matched.length / mSkills.length) * 100) : 50;
        return { ...c, matchScore: score };
      })
      .filter(c => c.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 4);
  }, [mission, candidates, applications]);

  // IA Matching — score top 5 candidates vs this mission
  const topMatches = useMemo(() => {
    if (!mission || !candidates.length) return [];
    const mSkills = (mission.skills || []).map(s => s.toLowerCase());
    const mLocation = (mission.location || '').toLowerCase();
    return candidates
      .map(c => {
        let score = 0;
        const cSkills = (c.skills || []).map(s => s.toLowerCase());
        // Skills match (up to 60%)
        if (mSkills.length > 0) {
          const matched = mSkills.filter(s => cSkills.some(cs => cs.includes(s) || s.includes(cs)));
          score += Math.round((matched.length / mSkills.length) * 60);
        } else {
          score += 30;
        }
        // Location match (up to 20%)
        if (mLocation && c.location) {
          if (c.location.toLowerCase().includes(mLocation) || mLocation.includes(c.location.toLowerCase())) score += 20;
          else if ((c.availability || '').toLowerCase().includes('remote') || (c.availability || '').toLowerCase().includes('teletravail')) score += 10;
        } else {
          score += 10;
        }
        // Experience bonus (up to 20%)
        const minExp = mission.minExperience || 0;
        if (c.experience >= minExp) score += 20;
        else if (c.experience >= minExp - 1) score += 10;
        return { ...c, matchScore: Math.min(score, 100) };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  }, [mission, candidates]);
  const [approvalComment, setApprovalComment] = useState('');
  const [approvalLoading, setApprovalLoading] = useState(false);

  const DIFFUSION_KEY = 'ats_diffusion';
  const missionIdForDiff = mission?._id || mission?.id;
  const [diffusion, setDiffusion] = useState(() => {
    try { const all = JSON.parse(localStorage.getItem(DIFFUSION_KEY) || '{}'); return all[missionIdForDiff] || {}; } catch { return {}; }
  });
  const toggleDiffusion = (platform) => {
    const updated = { ...diffusion, [platform]: diffusion[platform] ? null : new Date().toISOString().split('T')[0] };
    setDiffusion(updated);
    try {
      const all = JSON.parse(localStorage.getItem(DIFFUSION_KEY) || '{}');
      all[missionIdForDiff] = updated;
      localStorage.setItem(DIFFUSION_KEY, JSON.stringify(all));
    } catch {}
  };

  const isManager = user && ['admin', 'manager', 'superadmin'].includes(user.role?.toLowerCase());

  const skillsGap = useMemo(() => {
    if (!mission) return null;
    const mSkills = (mission.skills || []).map(s => s.toLowerCase().trim()).filter(Boolean);
    if (!mSkills.length) return null;
    const mId = mission._id || mission.id;
    const pipelineCandidateIds = new Set(applications.filter(a => String(a.missionId) === String(mId)).map(a => String(a.candidateId)));
    const pipelineCandidates = candidates.filter(c => pipelineCandidateIds.has(String(c._id || c.id)));
    if (!pipelineCandidates.length) return { mSkills, covered: [], missing: mSkills, coverage: 0, candidateCount: 0 };
    const allCandidateSkills = new Set(pipelineCandidates.flatMap(c => (c.skills || []).map(s => s.toLowerCase().trim())));
    const covered = mSkills.filter(s => [...allCandidateSkills].some(cs => cs.includes(s) || s.includes(cs)));
    const missing = mSkills.filter(s => !covered.includes(s));
    return { mSkills, covered, missing, coverage: Math.round((covered.length / mSkills.length) * 100), candidateCount: pipelineCandidates.length };
  }, [mission, applications, candidates]);

  // T-243 — Offre multi-postes : compteur "X/N postes pourvus"
  const hiredCount = useMemo(() => {
    if (!mission) return 0;
    const mId = mission._id || mission.id;
    return applications.filter(a => String(a.missionId) === String(mId) && a.status === 'hired').length;
  }, [mission, applications]);

  const missionHistory = useMemo(() => {
    if (!mission) return [];
    const mid = mission._id || mission.id;
    return history
      .filter(h => h.relatedTo?.type === 'mission' && String(h.relatedTo?.id) === String(mid))
      .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`) - new Date(`${a.date}T${a.time || '00:00'}`));
  }, [history, mission]);

  // Score de complétude
  const COMPLETENESS_FIELDS = [
    { key: 'title',        label: 'Titre',           weight: 15, check: m => !!m.title },
    { key: 'description',  label: 'Description',     weight: 15, check: m => !!m.description && m.description.length > 20 },
    { key: 'skills',       label: 'Compétences',     weight: 15, check: m => Array.isArray(m.skills) && m.skills.length > 0 },
    { key: 'salary',       label: 'Salaire',         weight: 10, check: m => !!m.salary },
    { key: 'location',     label: 'Localisation',    weight: 10, check: m => !!m.location },
    { key: 'contractType', label: 'Type contrat',    weight: 10, check: m => !!m.contractType },
    { key: 'workMode',     label: 'Mode travail',    weight: 5,  check: m => !!m.workMode },
    { key: 'startDate',    label: 'Date début',      weight: 5,  check: m => !!m.startDate },
    { key: 'contactClient',label: 'Contact client',  weight: 10, check: m => !!(m.contactClient?.name || m.contactClient?.email) },
    { key: 'documents',    label: 'Documents',       weight: 5,  check: m => Array.isArray(m.documents) && m.documents.length > 0 },
  ];
  const completeness = mission ? COMPLETENESS_FIELDS.reduce((acc, f) => acc + (f.check(mission) ? f.weight : 0), 0) : 0;
  const missingFields = mission ? COMPLETENESS_FIELDS.filter(f => !f.check(mission)) : [];
  const completenessColor = completeness >= 80 ? '#10B981' : completeness >= 50 ? '#F59E0B' : '#EF4444';

  // Guard APRÈS tous les hooks (Rules of Hooks : pas de return conditionnel avant les hooks)
  if (!mission) return null;

  // T-242 — Workflow d'approbation, écrit directement sur la mission Supabase
  // (les missions affichées dans l'app sont 100% Supabase — voir useAPIMissions ;
  // l'ancien appel à l'API Express /missions/:id/approve opérait sur un modèle
  // Mongoose mort, jamais connecté aux données réellement affichées).
  const appendApprovalEntry = async (action, comment = '') => {
    const missionId = mission._id || mission.id;
    const byName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Utilisateur';
    const entry = {
      action,
      by: user?.id || null,
      byName,
      comment: comment || null,
      at: new Date().toISOString(),
    };
    const nextHistory = [...(mission.approvalHistory || []), entry];
    const statusByAction = { requested: 'pending_approval', approved: 'open', rejected: 'draft' };
    await updateMission(missionId, { approvalHistory: nextHistory, status: statusByAction[action] });
  };

  const handleApprove = async () => {
    setApprovalLoading(true);
    try {
      await appendApprovalEntry('approved', approvalComment);
      setApprovalComment('');
      notifySuccess('Mission approuvée', `"${mission.title}" est maintenant publiée.`);
      onRefresh?.();
      onClose();
    } catch (e) {
      notifyError('Erreur', e.message);
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleReject = async () => {
    if (!approvalComment.trim()) { alert('Un commentaire est requis pour refuser.'); return; }
    setApprovalLoading(true);
    try {
      await appendApprovalEntry('rejected', approvalComment);
      setApprovalComment('');
      notifySuccess('Mission refusée', `"${mission.title}" a été renvoyée au recruteur avec votre commentaire.`);
      onRefresh?.();
      onClose();
    } catch (e) {
      notifyError('Erreur', e.message);
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleRequestApproval = async () => {
    setApprovalLoading(true);
    try {
      await appendApprovalEntry('requested');
      notifySuccess('Soumise pour validation', `"${mission.title}" attend la validation d'un manager.`);
      onRefresh?.();
      onClose();
    } catch (e) {
      notifyError('Erreur', e.message);
    } finally {
      setApprovalLoading(false);
    }
  };

  const {
    title,
    client,
    location,
    salary,
    status,
    skills: rawSkills,
    description,
    emoji = '💼',
    color = '#667EEA',
    links: rawLinks,
    documents: rawDocuments,
    notes,
    startDate,
    urgency,
    address: rawAddress,
    workMode,
    contractType,
    weeklyHours,
    contactClient: rawContactClient,
    progress = 0,
  } = mission;

  // Bug trouvé en vérifiant T-368 : les valeurs par défaut de déstructuration
  // (ex. `contactClient = {}`) ne s'appliquent QUE si le champ vaut `undefined`,
  // jamais s'il est explicitement `null` — cas réel et courant d'une mission
  // dont la colonne JSONB (contactClient/address) n'a jamais été renseignée en
  // base (vaut `null`, pas `undefined`). Sans cette re-normalisation, ouvrir le
  // détail de n'importe quelle mission sans contact client faisait planter
  // TOUTE la page ("Cannot read properties of null (reading 'name')").
  const skills = rawSkills || [];
  const links = rawLinks || [];
  const documents = rawDocuments || [];
  const address = rawAddress || {};
  const contactClient = rawContactClient || {};

  // Styles — système partagé
  const isMobile = window.matchMedia?.('(max-width:768px)').matches ?? false;
  const sectionStyles = { ...sectionStyle(), marginBottom: '16px' };
  const sectionTitleStyles = sectionTitleStyle('#64748B');
  const grid2 = twoColGrid(isMobile);
  const fieldWrap = readFieldWrapper;
  const fieldLbl = readFieldLabel;
  const fieldVal = readFieldValue;

  const skillTagStyles = {
    padding: '6px 12px',
    background: '#EFF6FF',
    color: '#3B82F6',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
  };

  const linkStyles = {
    color: '#667EEA',
    textDecoration: 'none',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '14px',
  };

  // ── Styles footer unifiés : même taille pour TOUS les boutons ──────────────
  const fBtn = {
    padding: '10px 16px',
    borderRadius: '10px',
    border: 'none',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.15s',
    textDecoration: 'none',
  };
  const fBtnUtil    = { ...fBtn, background: 'white',   border: '1.5px solid #E5E7EB', color: '#374151' };
  const fBtnPrimary = { ...fBtn, background: 'linear-gradient(135deg,#667EEA 0%,#764BA2 100%)', color: 'white' };
  const fBtnDanger  = { ...fBtn, background: 'linear-gradient(135deg,#EF4444 0%,#DC2626 100%)', color: 'white' };
  const fBtnNeutral = { ...fBtn, background: '#F3F4F6', border: '1.5px solid #E5E7EB', color: '#374151' };

  const skillsContainerStyles = { display: 'flex', gap: '8px', flexWrap: 'wrap' };

  // ── Helpers footer ────────────────────────────────────────────────────────
  const fgb = (bg, shadow) => ({
    padding: '16px', background: bg, color: 'white', border: 'none',
    borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px',
    transition: 'all 0.3s', boxShadow: shadow,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    textDecoration: 'none',
  });
  const fhover   = e => { e.currentTarget.style.transform = 'translateY(-2px)'; };
  const funhover = e => { e.currentTarget.style.transform = 'translateY(0)'; };
  const fgrid = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', alignItems: 'stretch' };

  const documentItemStyles = {
    padding: '12px', background: '#F9FAFB', borderRadius: '8px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px',
  };

  const progressBarContainerStyles = {
    width: '100%', height: '8px', background: '#E5E7EB',
    borderRadius: '4px', overflow: 'hidden', marginTop: '8px',
  };

  const progressBarStyles = {
    height: '100%',
    background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
    width: `${progress}%`,
    transition: 'width 0.3s ease',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>
        <div style={modalHeaderInner}>
          <div style={iconBoxStyle(color)}>{emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={modalHeaderTitle}>{title}</h2>
            {(location || contractType) && (
              <div style={modalHeaderSubtitle}>
                {location && `📍 ${location}`}{location && contractType && ' · '}{contractType && `📄 ${contractType}`}
              </div>
            )}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <Badge variant={status === 'open' || status === 'active' ? 'success' : status === 'closed' ? 'error' : 'warning'}>
                {STATUS_LABELS.MISSION_STATUS[status] || status}
              </Badge>
              {(mission.numberOfPositions > 1 || hiredCount > 0) && (
                <Badge variant={hiredCount >= (mission.numberOfPositions || 1) ? 'success' : 'default'}>
                  👥 {hiredCount}/{mission.numberOfPositions || 1} postes
                </Badge>
              )}
              {urgency && (
                <Badge variant={urgency === 'tres urgent' ? 'error' : 'warning'}>
                  {urgency === 'tres urgent' ? '🔥 Très urgent' : '⚡ Urgent'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        {/* Score de complétude */}
        <div style={{ marginBottom: '24px', padding: '14px 16px', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>
              📊 Complétude de la fiche
            </span>
            <span style={{ fontSize: '14px', fontWeight: '900', color: completenessColor }}>
              {completeness}%
            </span>
          </div>
          <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{
              height: '100%', width: `${completeness}%`,
              background: completenessColor, borderRadius: '4px',
              transition: 'width 0.4s ease',
            }} />
          </div>
          {missingFields.length > 0 && (
            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
              Manquant : {missingFields.map(f => f.label).join(', ')}
            </div>
          )}
        </div>

        {/* Informations principales */}
        <div style={sectionStyles}>
          <h3 style={sectionTitleStyles}>📋 Informations Générales</h3>
          <div style={grid2}>
            {client && (
              <div style={fieldWrap}>
                <div style={fieldLbl}>Client</div>
                <div style={fieldVal}>🏢 {client}</div>
              </div>
            )}
            {location && (
              <div style={fieldWrap}>
                <div style={fieldLbl}>Localisation</div>
                <div style={fieldVal}>📍 {location}</div>
              </div>
            )}
            {salary && (
              <div style={fieldWrap}>
                <div style={fieldLbl}>Salaire</div>
                <div style={{ ...fieldVal, fontWeight: '800', color: '#667EEA' }}>💰 {salary}</div>
              </div>
            )}
            {startDate && (
              <div style={fieldWrap}>
                <div style={fieldLbl}>Date de début</div>
                <div style={fieldVal}>📅 {formatDate(startDate)}</div>
              </div>
            )}
            {address.street && (
              <div style={{ ...fieldWrap, gridColumn: '1 / -1' }}>
                <div style={fieldLbl}>Adresse</div>
                <div style={fieldVal}>{address.street}, {address.zipCode} {address.city}</div>
              </div>
            )}
          </div>
        </div>

        {/* Détails contrat */}
        {(contractType || workMode || weeklyHours) && (
          <div style={sectionStyles}>
            <h3 style={sectionTitleStyles}>💼 Détails du Contrat</h3>
            <div style={grid2}>
              {contractType && (
                <div style={fieldWrap}>
                  <div style={fieldLbl}>Type de contrat</div>
                  <div style={fieldVal}>{contractType}</div>
                </div>
              )}
              {workMode && (
                <div style={fieldWrap}>
                  <div style={fieldLbl}>Mode de travail</div>
                  <div style={fieldVal}>{workMode}</div>
                </div>
              )}
              {weeklyHours && (
                <div style={fieldWrap}>
                  <div style={fieldLbl}>Horaires</div>
                  <div style={fieldVal}>{weeklyHours}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <div style={sectionStyles}>
            <h3 style={sectionTitleStyles}>📝 Description</h3>
            <p style={{ color: '#6B7280', lineHeight: '1.7', fontSize: '14px' }}>{description}</p>
          </div>
        )}

        {/* Compétences */}
        {skills.length > 0 && (
          <div style={sectionStyles}>
            <h3 style={sectionTitleStyles}>🎯 Compétences Requises</h3>
            <div style={skillsContainerStyles}>
              {skills.map((skill, index) => (
                <span key={index} style={skillTagStyles}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact client */}
        {contactClient.name && (
          <div style={sectionStyles}>
            <h3 style={sectionTitleStyles}>👤 Contact Client</h3>
            <div style={grid2}>
              <div style={fieldWrap}>
                <div style={fieldLbl}>Nom</div>
                <div style={fieldVal}>{contactClient.name}</div>
              </div>
              {contactClient.phone && (
                <div style={fieldWrap}>
                  <div style={fieldLbl}>Téléphone</div>
                  <div style={fieldVal}>📞 {contactClient.phone}</div>
                </div>
              )}
              {contactClient.email && (
                <div style={fieldWrap}>
                  <div style={fieldLbl}>Email</div>
                  <a href={`mailto:${contactClient.email}`} style={linkStyles}>✉️ {contactClient.email}</a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Liens */}
        {links.length > 0 && (
          <div style={sectionStyles}>
            <h3 style={sectionTitleStyles}>🔗 Liens Utiles</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {links.map((link, index) => (
                <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" style={linkStyles}>
                  🔗 {link.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <div style={sectionStyles}>
            <h3 style={sectionTitleStyles}>📎 Documents</h3>
            {documents.map((doc, index) => (
              <div key={index} style={documentItemStyles}>
                <span style={{ fontWeight: '600', color: '#374151' }}>📄 {doc.name}</span>
                <span style={{ fontSize: '13px', color: '#9CA3AF' }}>{formatFileSize(doc.size)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Progression */}
        {progress > 0 && (
          <div style={sectionStyles}>
            <h3 style={sectionTitleStyles}>📊 Progression</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#6B7280' }}>Avancement du recrutement</span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: color }}>{progress}%</span>
            </div>
            <div style={progressBarContainerStyles}>
              <div style={progressBarStyles} />
            </div>
          </div>
        )}

        {/* Skills Gap */}
        {skillsGap && (
          <div style={sectionStyles}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ ...sectionTitleStyles, marginBottom: 0 }}>🎯 Analyse Skills Gap</h3>
              <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', background: skillsGap.coverage >= 75 ? '#ECFDF5' : skillsGap.coverage >= 50 ? '#FFFBEB' : '#FEF2F2', color: skillsGap.coverage >= 75 ? '#10B981' : skillsGap.coverage >= 50 ? '#F59E0B' : '#EF4444' }}>
                {skillsGap.coverage}% couverture · {skillsGap.candidateCount} candidat{skillsGap.candidateCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ height: '8px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ height: '100%', width: `${skillsGap.coverage}%`, background: skillsGap.coverage >= 75 ? '#10B981' : skillsGap.coverage >= 50 ? '#F59E0B' : '#EF4444', borderRadius: '4px', transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {skillsGap.covered.map(s => (
                <span key={s} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: '#ECFDF5', color: '#059669', border: '1px solid #6EE7B7' }}>✅ {s}</span>
              ))}
              {skillsGap.missing.map(s => (
                <span key={s} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>❌ {s}</span>
              ))}
            </div>
            {skillsGap.candidateCount === 0 && <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '8px', fontStyle: 'italic' }}>Aucun candidat dans le pipeline pour cette mission.</div>}
          </div>
        )}

        {/* Diffusion Jobboards */}
        <div style={sectionStyles}>
          <h3 style={sectionTitleStyles}>📡 Diffusion Jobboards</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
            {[
              { key: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
              { key: 'indeed', label: 'Indeed', color: '#003A9B' },
              { key: 'wttj', label: 'Welcome to the Jungle', color: '#FF3D5E' },
              { key: 'apec', label: 'APEC', color: '#005AA7' },
            ].map(p => (
              <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', border: `2px solid ${diffusion[p.key] ? p.color : '#E5E7EB'}`, background: diffusion[p.key] ? `${p.color}08` : 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
                <input type="checkbox" checked={!!diffusion[p.key]} onChange={() => toggleDiffusion(p.key)} style={{ width: '16px', height: '16px', accentColor: p.color }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: diffusion[p.key] ? p.color : '#374151' }}>🌐 {p.label}</div>
                  {diffusion[p.key] && <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '2px' }}>Diffusé le {diffusion[p.key]}</div>}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div style={sectionStyles}>
            <h3 style={sectionTitleStyles}>💬 Notes Internes</h3>
            <div
              style={{
                padding: '16px',
                background: '#FFFBEB',
                borderLeft: '4px solid #F59E0B',
                borderRadius: '8px',
                color: '#92400E',
                fontSize: '14px',
                lineHeight: '1.6',
              }}
            >
              {notes}
            </div>
          </div>
        )}

        {/* Workflow de validation */}
        {(status === 'pending_approval' || (mission.approvalHistory && mission.approvalHistory.length > 0)) && (
          <div style={sectionStyles}>
            <h3 style={sectionTitleStyles}>✅ Validation</h3>

            {/* Historique */}
            {mission.approvalHistory && mission.approvalHistory.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                {mission.approvalHistory.map((entry, i) => (
                  <div key={i} style={{
                    padding: '10px 14px', marginBottom: '8px', borderRadius: '8px',
                    background: entry.action === 'approved' ? '#F0FDF4' : entry.action === 'rejected' ? '#FEF2F2' : '#EFF6FF',
                    borderLeft: `3px solid ${entry.action === 'approved' ? '#10B981' : entry.action === 'rejected' ? '#EF4444' : '#3B82F6'}`,
                    fontSize: '13px',
                  }}>
                    <strong>{entry.byName || entry.by}</strong>
                    {' — '}
                    {entry.action === 'approved' ? '✅ Approuvé' : entry.action === 'rejected' ? '❌ Refusé' : '📤 Soumis'}
                    {' · '}
                    <span style={{ color: '#6B7280' }}>{formatDate(entry.at)}</span>
                    {entry.comment && <div style={{ marginTop: '4px', color: '#6B7280' }}>{entry.comment}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Actions selon statut et rôle */}
            {status === 'pending_approval' && isManager && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea
                  placeholder="Commentaire (obligatoire pour refuser)…"
                  value={approvalComment}
                  onChange={e => setApprovalComment(e.target.value)}
                  rows={2}
                  style={{ padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleApprove}
                    disabled={approvalLoading}
                    style={{ padding: '10px 20px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
                  >
                    ✅ Approuver
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={approvalLoading}
                    style={{ padding: '10px 20px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
                  >
                    ❌ Refuser
                  </button>
                </div>
              </div>
            )}

            {(status === 'open' || status === 'draft') && !isManager && (
              <button
                onClick={handleRequestApproval}
                disabled={approvalLoading}
                style={{ padding: '10px 20px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
              >
                {status === 'draft' ? '📤 Re-soumettre pour validation' : '📤 Soumettre pour validation'}
              </button>
            )}
          </div>
        )}
        {/* Historique des modifications */}
        <div style={sectionStyles}>
          <h3 style={sectionTitleStyles}>🕓 Historique</h3>
          {missionHistory.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic' }}>
              Aucune activité enregistrée pour cette mission.
            </p>
          ) : (
            <div style={{ position: 'relative', paddingLeft: '20px' }}>
              {/* ligne verticale */}
              <div style={{ position: 'absolute', left: '7px', top: 0, bottom: 0, width: '2px', background: '#E5E7EB' }} />
              {missionHistory.map((entry, i) => (
                <div key={entry.id || i} style={{ position: 'relative', marginBottom: '16px', paddingLeft: '16px' }}>
                  {/* point */}
                  <div style={{
                    position: 'absolute', left: '-16px', top: '4px',
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: '#667EEA', border: '2px solid white',
                    boxShadow: '0 0 0 2px #667EEA44',
                  }} />
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>
                    {entry.icon} {entry.action}
                    <span style={{ fontWeight: '400', color: '#9CA3AF', marginLeft: '8px' }}>
                      {entry.date} {entry.time ? `à ${entry.time}` : ''}
                    </span>
                  </div>
                  {entry.details && (
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{entry.details}</div>
                  )}
                  {entry.user && (
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>Par {entry.user}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <ScorecardSection missionId={mission._id || mission.id} />

        {/* Recommandations croisees */}
        {crossRecommendations.length > 0 && (
          <div style={{ padding: '20px', background: 'linear-gradient(135deg, #FEF3C7, #FFFBEB)', borderRadius: '14px', border: '1.5px solid #FDE68A', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#92400E', marginBottom: '14px' }}>♻️ Candidats similaires refusés sur d'autres missions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {crossRecommendations.map((c) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'white', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>👤</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937' }}>{c.name}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>{c.position}{c.location ? ` — ${c.location}` : ''}</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '900', color: c.matchScore >= 60 ? '#F59E0B' : '#9CA3AF' }}>{c.matchScore}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IA Matching */}
        {topMatches.length > 0 && (
          <div style={{ padding: '20px', background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', borderRadius: '14px', border: '1.5px solid #C4B5FD', marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#5B21B6', marginBottom: '14px' }}>🤖 IA — Top {topMatches.length} candidats correspondants</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topMatches.map((c, idx) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'white', borderRadius: '10px', border: '1px solid #DDD6FE' }}>
                  <span style={{ fontSize: '13px', fontWeight: '900', color: '#7C3AED', width: '20px' }}>#{idx + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937' }}>{c.name}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>{c.position}{c.location ? ` — ${c.location}` : ''}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '15px', fontWeight: '900', color: c.matchScore >= 70 ? '#10B981' : c.matchScore >= 40 ? '#F59E0B' : '#EF4444' }}>{c.matchScore}%</div>
                    <div style={{ height: '4px', width: '60px', background: '#E5E7EB', borderRadius: '2px', overflow: 'hidden', marginTop: '2px' }}>
                      <div style={{ height: '100%', width: `${c.matchScore}%`, background: c.matchScore >= 70 ? '#10B981' : c.matchScore >= 40 ? '#F59E0B' : '#EF4444', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div style={fgrid}>
          {onEdit && <button style={fgb('linear-gradient(135deg,#F59E0B 0%,#FBBF24 100%)', '0 4px 16px rgba(245,158,11,0.4)')} onClick={() => onEdit(mission)} onMouseEnter={fhover} onMouseLeave={funhover}>✏️ Modifier</button>}
          {onDelete && <button style={fgb('linear-gradient(135deg,#EF4444 0%,#DC2626 100%)', '0 4px 16px rgba(239,68,68,0.4)')} onClick={() => onDelete(mission)} onMouseEnter={fhover} onMouseLeave={funhover}>🗑️ Supprimer</button>}
          <button style={fgb('linear-gradient(135deg,#6B7280 0%,#4B5563 100%)', '0 4px 16px rgba(107,114,128,0.3)')} onClick={onClose} onMouseEnter={fhover} onMouseLeave={funhover}>Fermer</button>
          {onDuplicate && <button style={fgb('linear-gradient(135deg,#8B5CF6 0%,#7C3AED 100%)', '0 4px 16px rgba(139,92,246,0.4)')} onClick={() => onDuplicate(mission)} onMouseEnter={fhover} onMouseLeave={funhover}>📋 Dupliquer</button>}
          {onMatch && <button style={fgb('linear-gradient(135deg,#7C3AED 0%,#5B21B6 100%)', '0 4px 16px rgba(124,58,237,0.4)')} onClick={() => onMatch(mission)} onMouseEnter={fhover} onMouseLeave={funhover}>🤖 Matching IA</button>}
          <button style={fgb('linear-gradient(135deg,#0EA5E9 0%,#0284C7 100%)', '0 4px 16px rgba(14,165,233,0.4)')} onMouseEnter={fhover} onMouseLeave={funhover} onClick={() => { const name = window.prompt('Nom du modèle :', mission.title); if (!name) return; const existing = JSON.parse(localStorage.getItem('ats_mission_templates') || '[]'); existing.push({ _templateName: name, title: mission.title, description: mission.description, skills: Array.isArray(mission.skills) ? mission.skills.join(', ') : mission.skills, salary: mission.salary, contractType: mission.contractType, workMode: mission.workMode, weeklyHours: mission.weeklyHours, urgency: mission.urgency }); localStorage.setItem('ats_mission_templates', JSON.stringify(existing)); alert(`Modèle "${name}" sauvegardé !`); }}>🗂️ Modèle</button>
          <button style={fgb('linear-gradient(135deg,#10B981 0%,#059669 100%)', '0 4px 16px rgba(16,185,129,0.4)')} onMouseEnter={fhover} onMouseLeave={funhover} onClick={() => { const url = `${window.location.origin}/jobs/${mission._id || mission.id}`; navigator.clipboard.writeText(url).then(() => alert('Lien copié !')); }}>🔗 Partager</button>
          <a style={fgb('linear-gradient(135deg,#0A66C2 0%,#004182 100%)', '0 4px 16px rgba(10,102,194,0.4)')} href={`https://www.linkedin.com/jobs/post/?title=${encodeURIComponent(mission.title || '')}&location=${encodeURIComponent(mission.location || '')}`} target="_blank" rel="noopener noreferrer" onMouseEnter={fhover} onMouseLeave={funhover}>🌐 LinkedIn</a>
          <a style={fgb('linear-gradient(135deg,#003A9B 0%,#002680 100%)', '0 4px 16px rgba(0,58,155,0.4)')} href={`https://employers.indeed.com/p/post-job?title=${encodeURIComponent(mission.title || '')}`} target="_blank" rel="noopener noreferrer" onMouseEnter={fhover} onMouseLeave={funhover}>🌐 Indeed</a>
          <a style={fgb('linear-gradient(135deg,#FF3D5E 0%,#E5192F 100%)', '0 4px 16px rgba(255,61,94,0.4)')} href="https://www.welcometothejungle.com/fr/companies" target="_blank" rel="noopener noreferrer" onMouseEnter={fhover} onMouseLeave={funhover}>🌐 WTTJ</a>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default MissionDetail;
