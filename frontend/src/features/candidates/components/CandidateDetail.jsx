import React, { useState, useMemo } from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Badge from '@/shared/components/DataDisplay/Badge';
import Button from '@/shared/components/Button/Button';
import { STATUS_LABELS, APPLICATION_PIPELINE_STAGES } from '@/config/constants';
import { formatDate, formatFileSize } from '@/core/utils/formatters';
import { useData } from '@/core/contexts/DataContext';
import { downloadBase64File, openPDFInNewTab } from '@/core/utils/fileHandlers';
import { printCandidateProfile } from '@/core/utils/exporters';
import { exportCandidateRGPD } from '@/core/utils/rgpdExport';
import api from '@/services/api';
import { EmailComposerModal } from './EmailComposerModal';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import {
  sectionStyle, sectionTitleStyle,
  twoColGrid, readFieldWrapper, readFieldLabel, readFieldValue,
  avatarStyle, modalHeaderInner, modalHeaderTitle, modalHeaderSubtitle,
  tagStyle,
} from '@/shared/styles/modalStyles';

// T-395 : redéfini localement à l'identique dans 3 fichiers, sans l'entrée
// `archived` ici — source unique désormais dans constants.js.
const PIPELINE_STAGES = APPLICATION_PIPELINE_STAGES;

/**
 * Modal de détail d'un candidat avec section candidatures pipeline
 */
export function CandidateDetail({ candidate, isOpen, onClose, onEdit, onDelete, onToggleFavorite }) {
  const { tags: allTags, addTag, updateCandidate: ctxUpdateCandidate, applications, events = [], history = [], missions = [], evaluations = [] } = useData();
  const isMobile = useIsMobile();

  const handleToggleTag = async (tagId) => {
    const currentTags = Array.isArray(candidate.tags) ? candidate.tags : [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    if (ctxUpdateCandidate) {
      try { await ctxUpdateCandidate(candidate.id, { tags: newTags }); } catch {}
    }
    if (onEdit) onEdit({ ...candidate, tags: newTags });
  };

  const handleCreateTag = () => {
    const name = window.prompt('Nom du tag :');
    if (!name) return;
    const color = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    addTag({ name, color });
  };
  const [linkedinEnriching, setLinkedinEnriching] = useState(false);
  const [linkedinMsg, setLinkedinMsg] = useState(null);
  const [emailOpen, setEmailOpen] = useState(false);

  const REFS_KEY = `ats_refs_${candidate?.id}`;
  const [references, setReferences] = useState(() => {
    try { return JSON.parse(localStorage.getItem(REFS_KEY) || '[]'); } catch { return []; }
  });
  const [refForm, setRefForm] = useState({ name: '', email: '', phone: '', status: 'pending', company: '' });
  const [showRefForm, setShowRefForm] = useState(false);
  const [rgpdExporting, setRgpdExporting] = useState(false);

  const addReference = () => {
    if (!refForm.name.trim()) return;
    const ref = { ...refForm, id: Date.now() };
    const updated = [...references, ref];
    setReferences(updated);
    localStorage.setItem(REFS_KEY, JSON.stringify(updated));
    setRefForm({ name: '', email: '', phone: '', status: 'pending', company: '' });
    setShowRefForm(false);
  };
  const updateRefStatus = (id, status) => {
    const updated = references.map(r => r.id === id ? { ...r, status } : r);
    setReferences(updated);
    localStorage.setItem(REFS_KEY, JSON.stringify(updated));
  };
  const deleteRef = (id) => {
    const updated = references.filter(r => r.id !== id);
    setReferences(updated);
    localStorage.setItem(REFS_KEY, JSON.stringify(updated));
  };

  const handleLinkedInEnrich = async () => {
    const url = window.prompt('URL LinkedIn du candidat :', candidate?.linkedinUrl || '');
    if (!url) return;
    setLinkedinEnriching(true);
    setLinkedinMsg(null);
    try {
      const res = await api.post(`/candidates/${candidate._id || candidate.id}/enrich`, { linkedinUrl: url });
      setLinkedinMsg({ type: 'success', text: 'Profil enrichi avec succès ! Rechargez la fiche.' });
      if (onEdit) onEdit({ ...candidate, ...res.data });
    } catch (err) {
      setLinkedinMsg({ type: 'info', text: 'Enrichissement non disponible en mode démo — connectez le backend LinkedIn.' });
    } finally {
      setLinkedinEnriching(false);
    }
  };


  // Guard : tous les hooks sont avant ce point
  if (!candidate) return null;

  const {
    name, email, phone, position, skills = [], status,
    location, experience, avatar = '👤', color = '#667EEA',
    links = [], documents = [], notes, department, metier, sector,
    dateAdded, tags = [], salary, availability, source, lastActivity,
    favorite = false, resume = null, videoInterviewUrl,
  } = candidate;

  const candidateTags = tags.map(id => allTags.find(t => t.id === id)).filter(Boolean);

  // Candidatures de ce candidat dans le pipeline
  const candidateApplications = applications.filter(
    a => a.candidateId === candidate.id || a.candidateName === candidate.name
  );

  // Évaluations (entretiens) de ce candidat
  const candidateEvaluations = evaluations
    .filter(e => e.candidateId === candidate.id || e.candidateName === candidate.name)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  // Agréger tous les événements de la timeline
  const timelineEntries = (() => {
    const entries = [];

    // Profil créé
    if (dateAdded) {
      entries.push({ date: dateAdded, icon: '✨', label: 'Profil créé', type: 'creation', color: '#667EEA' });
    }

    // Candidatures
    candidateApplications.forEach(app => {
      if (app.dateApplied) {
        const stage = PIPELINE_STAGES[app.status] || { label: app.status, color: '#6B7280' };
        entries.push({
          date: app.dateApplied,
          icon: '📋',
          label: `Candidature : ${app.missionTitle || 'Mission'}`,
          sub: stage.label,
          type: 'application',
          color: stage.color,
        });
      }
    });

    // Événements liés au candidat
    events.forEach(ev => {
      const linked = ev.candidateId === candidate.id || ev.candidateName === candidate.name
        || (ev.description && (ev.description.includes(candidate.name || '') || ev.description.includes(candidate.email || '')));
      if (linked && ev.date) {
        const typeMap = {
          interview: { icon: '👥', color: '#8B5CF6' },
          meeting:   { icon: '🤝', color: '#3B82F6' },
          phone_screen: { icon: '📞', color: '#10B981' },
          reminder:  { icon: '🔔', color: '#F59E0B' },
          deadline:  { icon: '⏰', color: '#EF4444' },
        };
        const t = typeMap[ev.type] || { icon: '📅', color: '#6B7280' };
        entries.push({ date: ev.date, icon: t.icon, label: ev.title || ev.type, sub: ev.time || null, type: 'event', color: t.color });
      }
    });

    // Historique
    history.filter(h => h.relatedTo?.type === 'candidate' && h.relatedTo?.id === candidate.id).forEach(h => {
      if (h.date || h.createdAt) {
        entries.push({ date: h.date || h.createdAt, icon: '📝', label: h.action || h.message || 'Action', type: 'history', color: '#6B7280' });
      }
    });

    return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  })();

  // Calcul matching inverse : missions compatibles avec le profil
  const matchingMissions = (() => {
    if (!missions || missions.length === 0) return [];
    const cSkills = (skills || []).map(s => s.toLowerCase());
    return missions
      .filter(m => m.status === 'open' || m.status === 'active')
      .map(m => {
        let score = 0;
        const mSkills = (m.skills || m.requiredSkills || []).map(s => s.toLowerCase());
        const matchedSkills = cSkills.filter(s => mSkills.some(ms => ms.includes(s) || s.includes(ms)));
        if (mSkills.length > 0) score += Math.round((matchedSkills.length / Math.max(mSkills.length, cSkills.length || 1)) * 60);
        if (experience && m.minExperience && Number(experience) >= Number(m.minExperience)) score += 20;
        if (location && m.location && location.toLowerCase().includes(m.location?.toLowerCase() || '')) score += 20;
        return { ...m, matchScore: Math.min(score, 100), matchedSkills };
      })
      .filter(m => m.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  })();

  const handlePrint = () => {
    printCandidateProfile(candidate, candidateApplications, allTags);
  };

  const handleRgpdExport = async () => {
    setRgpdExporting(true);
    try {
      await exportCandidateRGPD({
        candidate,
        applications: candidateApplications,
        evaluations: candidateEvaluations,
        timeline: timelineEntries,
        references,
      });
    } finally {
      setRgpdExporting(false);
    }
  };

  // Styles locaux (système partagé)
  const section = { ...sectionStyle(), marginBottom: '16px' };
  const sectionTitle = sectionTitleStyle('#64748B');
  const grid2 = twoColGrid(isMobile);
  const fieldWrap = readFieldWrapper;
  const fieldLbl = readFieldLabel;
  const fieldVal = readFieldValue;
  const linkStyle = { color: '#667EEA', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px' };

  // ── Helpers footer ────────────────────────────────────────────────────────
  const fgb = (bg, shadow, extra = {}) => ({
    padding: '16px', background: bg, color: 'white', border: 'none',
    borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px',
    transition: 'all 0.3s', boxShadow: shadow,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    ...extra,
  });
  const fhover   = e => { e.currentTarget.style.transform = 'translateY(-2px)'; };
  const funhover = e => { e.currentTarget.style.transform = 'translateY(0)'; };
  const fgrid = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', alignItems: 'stretch' };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>
        <div style={modalHeaderInner}>
          <div style={avatarStyle(color)}>{avatar}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={modalHeaderTitle}>{name} {favorite && '⭐'}</h2>
            <div style={modalHeaderSubtitle}>{position}</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <Badge variant={status === 'active' || status === 'hired' ? 'success' : status === 'passive' ? 'warning' : status === 'archived' ? 'default' : 'error'}>
                {STATUS_LABELS.CANDIDATE_STATUS?.[status] || status}
              </Badge>
              {location && <Badge variant="default">📍 {location}</Badge>}
              {experience > 0 && <Badge variant="default">💼 {experience} ans</Badge>}
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>

        {/* Candidatures dans le pipeline */}
        {candidateApplications.length > 0 && (
          <div style={{
            ...section,
            background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E0E7FF',
          }}>
            <h3 style={{ ...sectionTitle, color: '#4F46E5' }}>🗂️ Candidatures en cours</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {candidateApplications.map((app) => {
                const stage = PIPELINE_STAGES[app.status] || { label: app.status, color: '#6B7280', bg: '#F3F4F6' };
                return (
                  <div key={app.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'white',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        📋 {app.missionTitle}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                        {app.clientName && `🏢 ${app.clientName}`}
                        {app.dateApplied && ` · ${formatDate(app.dateApplied)}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: '12px' }}>
                      {app.score > 0 && (
                        <span style={{
                          fontSize: '12px', fontWeight: '800',
                          color: app.score >= 75 ? '#10B981' : app.score >= 50 ? '#F59E0B' : '#EF4444',
                        }}>
                          {app.score}%
                        </span>
                      )}
                      <span style={{
                        padding: '4px 12px', borderRadius: '20px',
                        background: stage.bg, color: stage.color,
                        fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap',
                      }}>
                        {stage.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Historique des entretiens */}
        {candidateEvaluations.length > 0 && (
          <div style={{ ...section, background: '#FFFBEB', borderRadius: '16px', padding: '20px', border: '1px solid #FDE68A' }}>
            <h3 style={{ ...sectionTitle, color: '#92400E' }}>📅 Historique des entretiens ({candidateEvaluations.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {candidateEvaluations.map((ev, i) => {
                const scoreColor = ev.globalScore >= 75 ? '#10B981' : ev.globalScore >= 50 ? '#F59E0B' : '#EF4444';
                return (
                  <div key={ev.id || i} style={{ display: 'flex', gap: '12px', padding: '12px 14px', background: 'white', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>⭐</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937' }}>{ev.missionTitle || 'Mission'} · {ev.stage || ''}</div>
                        {ev.globalScore > 0 && <span style={{ fontSize: '14px', fontWeight: '900', color: scoreColor, flexShrink: 0, marginLeft: '8px' }}>{ev.globalScore}%</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                        {ev.date && formatDate(ev.date)} {ev.evaluatorName && `· par ${ev.evaluatorName}`}
                      </div>
                      {ev.recommendation && ev.recommendation !== 'pending' && (
                        <div style={{ fontSize: '11px', marginTop: '4px', fontWeight: '700', color: ev.recommendation === 'go' ? '#10B981' : ev.recommendation === 'no_go' ? '#EF4444' : '#F59E0B' }}>
                          {ev.recommendation === 'go' ? '✅ Recommandé' : ev.recommendation === 'no_go' ? '❌ Non retenu' : '🤔 À revoir'}
                        </div>
                      )}
                      {ev.notes && <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', lineHeight: '1.4' }}>{ev.notes}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Matching inverse : missions compatibles */}
        {matchingMissions.length > 0 && (
          <div style={{
            ...section,
            background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #A7F3D0',
          }}>
            <h3 style={{ ...sectionTitle, color: '#065F46' }}>🎯 Missions compatibles ({matchingMissions.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {matchingMissions.map((m) => (
                <div key={m.id || m._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'white', borderRadius: '12px', padding: '12px 16px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.title}
                    </div>
                    {m.matchedSkills.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {m.matchedSkills.slice(0, 3).map(s => (
                          <span key={s} style={{ padding: '2px 6px', background: '#D1FAE5', color: '#065F46', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ flexShrink: 0, marginLeft: '12px', textAlign: 'center' }}>
                    <div style={{
                      fontSize: '18px', fontWeight: '900',
                      color: m.matchScore >= 70 ? '#10B981' : m.matchScore >= 40 ? '#F59E0B' : '#6B7280',
                    }}>
                      {m.matchScore}%
                    </div>
                    <div style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '600' }}>match</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <div style={section}>
          <h3 style={sectionTitle}>📞 Contact</h3>
          <div style={grid2}>
            {email && (
              <div style={fieldWrap}>
                <div style={fieldLbl}>Email</div>
                <a href={`mailto:${email}`} style={linkStyle}>✉️ {email}</a>
              </div>
            )}
            {phone && (
              <div style={fieldWrap}>
                <div style={fieldLbl}>Téléphone</div>
                <a href={`tel:${phone}`} style={linkStyle}>📱 {phone}</a>
              </div>
            )}
            {location && (
              <div style={fieldWrap}>
                <div style={fieldLbl}>Localisation</div>
                <div style={fieldVal}>📍 {location}</div>
              </div>
            )}
            {department && (
              <div style={fieldWrap}>
                <div style={fieldLbl}>Département</div>
                <div style={fieldVal}>{department}</div>
              </div>
            )}
          </div>
          {videoInterviewUrl && (
            <div style={{ marginTop: '14px' }}>
              <a
                href={videoInterviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 12px rgba(102,126,234,0.4)' }}
              >
                🎥 Rejoindre l'entretien vidéo
              </a>
            </div>
          )}
        </div>

        {/* Profil professionnel */}
        <div style={section}>
          <h3 style={sectionTitle}>💼 Profil Professionnel</h3>
          <div style={grid2}>
            {experience > 0 && (
              <div style={fieldWrap}>
                <div style={fieldLbl}>Expérience</div>
                <div style={fieldVal}>{experience} ans</div>
              </div>
            )}
            {metier && (
              <div style={fieldWrap}>
                <div style={fieldLbl}>Métier</div>
                <div style={fieldVal}>{metier}</div>
              </div>
            )}
            {sector && (
              <div style={fieldWrap}>
                <div style={fieldLbl}>Secteur</div>
                <div style={fieldVal}>{sector}</div>
              </div>
            )}
            {salary && (
              <div style={fieldWrap}>
                <div style={fieldLbl}>Prétentions salariales</div>
                <div style={{ ...fieldVal, fontWeight: '800', color: '#667EEA' }}>💰 {salary}</div>
              </div>
            )}
            {availability && (
              <div style={fieldWrap}>
                <div style={fieldLbl}>Disponibilité</div>
                <div style={fieldVal}>📅 {availability}</div>
              </div>
            )}
            {source && (
              <div style={fieldWrap}>
                <div style={fieldLbl}>Source</div>
                <div style={fieldVal}>{source}</div>
              </div>
            )}
          </div>
        </div>

        {/* Compétences + Radar */}
        {skills.length > 0 && (
          <div style={section}>
            <h3 style={sectionTitle}>🎯 Compétences</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {skills.map((skill, i) => (
                <span key={i} style={{ padding: '6px 12px', background: '#EFF6FF', color: '#3B82F6', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                  {skill}
                </span>
              ))}
            </div>
            {skills.length >= 3 && (() => {
              const axes = skills.slice(0, 6);
              const n = axes.length;
              const size = 160; const cx = size / 2; const cy = size / 2; const r = 60;
              const pts = axes.map((_, i) => {
                const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
                return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), lx: cx + (r + 18) * Math.cos(angle), ly: cy + (r + 18) * Math.sin(angle) };
              });
              const poly = pts.map(p => `${p.x},${p.y}`).join(' ');
              return (
                <svg width={size} height={size} style={{ display:'block', margin:'0 auto' }}>
                  {[0.33, 0.66, 1].map(s => (
                    <polygon key={s} points={pts.map(p => `${cx + (p.x - cx) * s},${cy + (p.y - cy) * s}`).join(' ')} fill="none" stroke="#E5E7EB" strokeWidth="1" />
                  ))}
                  {pts.map((p, i) => <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E5E7EB" strokeWidth="1" />)}
                  <polygon points={poly} fill="#3B82F620" stroke="#3B82F6" strokeWidth="2" />
                  {pts.map((p, i) => (
                    <text key={i} x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#374151" fontWeight="600">{axes[i].slice(0, 8)}</text>
                  ))}
                </svg>
              );
            })()}
          </div>
        )}

        {/* Tags — gestion interactive */}
        <div style={section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ ...sectionTitle, marginBottom: 0 }}>🏷️ Tags</h3>
            <button
              onClick={handleCreateTag}
              style={{ padding: '4px 10px', background: '#EEF2FF', color: '#667EEA', border: '1.5px solid #C7D2FE', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
            >
              + Nouveau tag
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {allTags.map((tag) => {
              const active = Array.isArray(tags) && tags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => handleToggleTag(tag.id)}
                  style={{
                    padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                    cursor: 'pointer', border: `2px solid ${active ? tag.color : '#E5E7EB'}`,
                    background: active ? tag.color : 'white',
                    color: active ? 'white' : '#6B7280',
                    transition: 'all 0.15s',
                  }}
                  title={active ? 'Retirer ce tag' : 'Ajouter ce tag'}
                >
                  {active ? '✓ ' : ''}{tag.name}
                </button>
              );
            })}
            {allTags.length === 0 && (
              <span style={{ fontSize: '13px', color: '#9CA3AF' }}>Aucun tag disponible — créez-en un !</span>
            )}
          </div>
        </div>

        {/* Informations sourcing */}
        {(dateAdded || lastActivity) && (
          <div style={section}>
            <h3 style={sectionTitle}>📊 Informations</h3>
            <div style={grid2}>
              {dateAdded && (
                <div style={fieldWrap}>
                  <div style={fieldLbl}>Ajouté le</div>
                  <div style={fieldVal}>{formatDate(dateAdded)}</div>
                </div>
              )}
              {lastActivity && (
                <div style={fieldWrap}>
                  <div style={fieldLbl}>Dernière activité</div>
                  <div style={fieldVal}>{formatDate(lastActivity)}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mood Tracker */}
        <div style={section}>
          <h3 style={sectionTitle}>🌡️ Température candidat</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { key: 'hot',  icon: '🔥', label: 'Chaud',  color: '#EF4444', bg: '#FEE2E2' },
              { key: 'warm', icon: '😊', label: 'Tiède',  color: '#F59E0B', bg: '#FFFBEB' },
              { key: 'cold', icon: '❄️', label: 'Froid',  color: '#3B82F6', bg: '#EFF6FF' },
            ].map(m => {
              const isActive = candidate.mood === m.key;
              return (
                <button
                  key={m.key}
                  onClick={async () => {
                    const newMood = isActive ? null : m.key;
                    try { await ctxUpdateCandidate(candidate.id, { mood: newMood }); } catch {}
                    if (onEdit) onEdit({ ...candidate, mood: newMood });
                  }}
                  style={{ flex: 1, padding: '10px 8px', borderRadius: '10px', border: `2px solid ${isActive ? m.color : '#E5E7EB'}`, background: isActive ? m.bg : 'white', cursor: 'pointer', fontWeight: '700', fontSize: '13px', color: isActive ? m.color : '#6B7280', transition: 'all 0.2s' }}
                >
                  {m.icon} {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Références */}
        <div style={section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ ...sectionTitle, marginBottom: 0 }}>📋 Références ({references.length})</h3>
            <button onClick={() => setShowRefForm(v => !v)} style={{ padding: '6px 12px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
              {showRefForm ? '✕ Annuler' : '+ Ajouter'}
            </button>
          </div>
          {showRefForm && (
            <div style={{ padding: '14px', background: '#F9FAFB', borderRadius: '10px', border: '1.5px solid #E5E7EB', marginBottom: '12px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
              {[['name', 'Nom *'], ['company', 'Entreprise'], ['email', 'Email'], ['phone', 'Téléphone']].map(([field, lbl]) => (
                <input key={field} placeholder={lbl} value={refForm[field]} onChange={e => setRefForm(p => ({ ...p, [field]: e.target.value }))} style={{ padding: '8px 10px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit' }} />
              ))}
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button onClick={addReference} style={{ padding: '8px 16px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>✅ Enregistrer</button>
              </div>
            </div>
          )}
          {references.length === 0 && !showRefForm && <div style={{ fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic' }}>Aucune référence ajoutée.</div>}
          {references.map(ref => {
            const STATUS_META = { pending: { label: 'En attente', color: '#6B7280', bg: '#F3F4F6' }, contacted: { label: 'Contacté', color: '#F59E0B', bg: '#FFFBEB' }, validated: { label: 'Validé', color: '#10B981', bg: '#ECFDF5' } };
            const sm = STATUS_META[ref.status] || STATUS_META.pending;
            return (
              <div key={ref.id} style={{ padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: '10px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: '#1F2937' }}>👤 {ref.name}{ref.company ? ` · ${ref.company}` : ''}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>{ref.email || ''}{ref.phone ? ` · ${ref.phone}` : ''}</div>
                </div>
                <select value={ref.status} onChange={e => updateRefStatus(ref.id, e.target.value)} style={{ padding: '4px 8px', borderRadius: '6px', border: `1.5px solid ${sm.color}`, background: sm.bg, color: sm.color, fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}>
                  <option value="pending">En attente</option>
                  <option value="contacted">Contacté</option>
                  <option value="validated">Validé</option>
                </select>
                <button onClick={() => deleteRef(ref.id)} aria-label="Supprimer la référence" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '16px', padding: '0 2px' }}>✕</button>
              </div>
            );
          })}
        </div>

        {/* Liens */}
        {links.length > 0 && (
          <div style={section}>
            <h3 style={sectionTitle}>🔗 Liens</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {links.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                  🔗 {link.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* CV */}
        {resume && (
          <div style={section}>
            <h3 style={sectionTitle}>📄 CV / Documents</h3>
            <div style={{
              padding: '20px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
              border: '2px solid #667EEA',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ fontSize: '48px' }}>📄</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#1F2937', marginBottom: '4px' }}>{resume.fileName}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>
                    {resume.fileSizeFormatted} · Uploadé le {formatDate(resume.uploadDate)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <button
                  onClick={() => openPDFInNewTab(resume.base64Data)}
                  style={{ padding: '12px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
                >
                  👁️ Visualiser
                </button>
                <button
                  onClick={() => downloadBase64File(resume.base64Data, resume.fileName)}
                  style={{ padding: '12px', background: '#10B981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
                >
                  ⬇️ Télécharger
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Documents supplémentaires */}
        {documents.length > 0 && (
          <div style={section}>
            <h3 style={sectionTitle}>📎 Autres Documents</h3>
            {documents.map((doc, i) => (
              <div key={i} style={{
                padding: '12px', background: '#F9FAFB', borderRadius: '8px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px',
              }}>
                <span style={{ fontWeight: '600', color: '#374151' }}>📄 {doc.name}</span>
                <span style={{ fontSize: '13px', color: '#9CA3AF' }}>{formatFileSize(doc.size)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Timeline */}
        {timelineEntries.length > 0 && (
          <div style={section}>
            <h3 style={sectionTitle}>⏱️ Timeline</h3>
            <div style={{ position: 'relative', paddingLeft: '28px' }}>
              {/* vertical line */}
              <div style={{
                position: 'absolute', left: '10px', top: 0, bottom: 0,
                width: '2px', background: 'linear-gradient(to bottom, #667EEA44, #E5E7EB)',
              }} />
              {timelineEntries.map((entry, i) => (
                <div key={i} style={{ position: 'relative', marginBottom: i < timelineEntries.length - 1 ? '18px' : 0, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {/* dot */}
                  <div style={{
                    position: 'absolute', left: '-22px', top: '2px',
                    width: '16px', height: '16px', borderRadius: '50%',
                    background: entry.color, border: '2px solid white',
                    boxShadow: `0 0 0 2px ${entry.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '8px',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937' }}>
                        {entry.icon} {entry.label}
                      </span>
                      <span style={{ fontSize: '11px', color: '#9CA3AF', whiteSpace: 'nowrap', marginTop: '1px' }}>
                        {formatDate(entry.date)}
                      </span>
                    </div>
                    {entry.sub && (
                      <div style={{ fontSize: '11px', color: entry.color, fontWeight: '600', marginTop: '2px' }}>
                        {entry.sub}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div style={section}>
            <h3 style={sectionTitle}>💬 Notes Internes</h3>
            <div style={{
              padding: '16px', background: '#FFFBEB',
              borderLeft: '4px solid #F59E0B', borderRadius: '8px',
              color: '#92400E', fontSize: '14px', lineHeight: '1.6',
            }}>
              {notes}
            </div>
          </div>
        )}

        {/* Alerte disponibilite */}
        {(() => {
          const isOpen = candidate.openToOpportunities || false;
          const toggle = () => {
            const updated = { ...candidate, openToOpportunities: !isOpen };
            if (ctxUpdateCandidate) ctxUpdateCandidate(candidate.id, { openToOpportunities: !isOpen });
            if (onEdit) onEdit(updated);
          };
          return (
            <div style={{ padding: '16px 20px', background: isOpen ? '#ECFDF5' : '#F9FAFB', borderRadius: '12px', border: `1.5px solid ${isOpen ? '#A7F3D0' : '#E5E7EB'}`, marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: isOpen ? '#065F46' : '#374151' }}>
                  {isOpen ? '🟢 Ouvert aux opportunites' : '⚪ Disponibilite'}
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                  {isOpen ? 'Ce candidat sera notifie lors de missions correspondantes' : 'Activer pour recevoir des alertes de missions'}
                </div>
              </div>
              <button
                onClick={toggle}
                style={{
                  padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '12px',
                  background: isOpen ? '#10B981' : '#E5E7EB', color: isOpen ? 'white' : '#374151', transition: 'all 0.2s', flexShrink: 0,
                }}
              >
                {isOpen ? 'Desactiver' : 'Activer'}
              </button>
            </div>
          );
        })()}

        {/* ── Actions ── */}
        <div style={fgrid}>
          {onEdit && <button style={fgb('linear-gradient(135deg,#667EEA 0%,#764BA2 100%)', '0 4px 16px rgba(102,126,234,0.4)')} onClick={() => onEdit(candidate)} onMouseEnter={fhover} onMouseLeave={funhover}>✏️ Modifier</button>}
          {onDelete && <button style={fgb('linear-gradient(135deg,#EF4444 0%,#DC2626 100%)', '0 4px 16px rgba(239,68,68,0.4)')} onClick={() => onDelete(candidate)} onMouseEnter={fhover} onMouseLeave={funhover}>🗑️ Supprimer</button>}
          <button style={fgb('linear-gradient(135deg,#6B7280 0%,#4B5563 100%)', '0 4px 16px rgba(107,114,128,0.3)')} onClick={onClose} onMouseEnter={fhover} onMouseLeave={funhover}>Fermer</button>
          {onToggleFavorite && (
            <button style={fgb(favorite ? 'linear-gradient(135deg,#F59E0B 0%,#D97706 100%)' : 'linear-gradient(135deg,#FBBF24 0%,#F59E0B 100%)', '0 4px 16px rgba(245,158,11,0.4)')} onClick={() => onToggleFavorite(candidate)} onMouseEnter={fhover} onMouseLeave={funhover}>{favorite ? '⭐ Favori' : '☆ Favoris'}</button>
          )}
          <button style={fgb('linear-gradient(135deg,#10B981 0%,#059669 100%)', '0 4px 16px rgba(16,185,129,0.4)')} onClick={() => setEmailOpen(true)} onMouseEnter={fhover} onMouseLeave={funhover}>✉️ Email</button>
          <button style={fgb('linear-gradient(135deg,#4F46E5 0%,#4338CA 100%)', '0 4px 16px rgba(79,70,229,0.4)')} onClick={handlePrint} onMouseEnter={fhover} onMouseLeave={funhover}>🖨️ PDF</button>
          <button style={fgb('linear-gradient(135deg,#8B5CF6 0%,#7C3AED 100%)', '0 4px 16px rgba(139,92,246,0.4)', { opacity: rgpdExporting ? 0.6 : 1, cursor: rgpdExporting ? 'wait' : 'pointer' })} onClick={handleRgpdExport} disabled={rgpdExporting} onMouseEnter={fhover} onMouseLeave={funhover}>{rgpdExporting ? '⏳ Export…' : '📦 RGPD'}</button>
          <button style={fgb('linear-gradient(135deg,#0A66C2 0%,#004182 100%)', '0 4px 16px rgba(10,102,194,0.4)', { opacity: linkedinEnriching ? 0.6 : 1, cursor: linkedinEnriching ? 'wait' : 'pointer' })} onClick={handleLinkedInEnrich} disabled={linkedinEnriching} onMouseEnter={fhover} onMouseLeave={funhover}>{linkedinEnriching ? '⏳ Enrichissement…' : '🔗 LinkedIn'}</button>
        </div>
      </Modal.Body>
    </Modal>

    <EmailComposerModal
      isOpen={emailOpen}
      onClose={() => setEmailOpen(false)}
      candidate={candidate}
    />
    </>
  );
}

export default CandidateDetail;
