import React from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Badge from '@/shared/components/DataDisplay/Badge';
import Button from '@/shared/components/Button/Button';
import { STATUS_LABELS } from '@/config/constants';
import { formatDate, formatFileSize } from '@/core/utils/formatters';
import { useData } from '@/core/contexts/DataContext';
import { downloadBase64File, openPDFInNewTab } from '@/core/utils/fileHandlers';
import { printCandidateProfile } from '@/core/utils/exporters';

const PIPELINE_STAGES = {
  received:    { label: '📨 Reçue',        color: '#6B7280', bg: '#F3F4F6' },
  screening:   { label: '🔍 Présélection', color: '#3B82F6', bg: '#EFF6FF' },
  interview_1: { label: '👥 Entretien 1',  color: '#F59E0B', bg: '#FFFBEB' },
  interview_2: { label: '🎯 Entretien 2',  color: '#8B5CF6', bg: '#F5F3FF' },
  offer:       { label: '📋 Offre',        color: '#10B981', bg: '#ECFDF5' },
  final:       { label: '✅ Finaliste',    color: '#059669', bg: '#D1FAE5' },
  hired:       { label: '🎉 Recruté',      color: '#EC4899', bg: '#FDF2F8' },
  rejected:    { label: '❌ Refusé',       color: '#EF4444', bg: '#FEF2F2' },
};

/**
 * Modal de détail d'un candidat avec section candidatures pipeline
 */
export function CandidateDetail({ candidate, isOpen, onClose, onEdit, onDelete, onToggleFavorite }) {
  const { tags: allTags, applications } = useData();

  if (!candidate) return null;

  const {
    name, email, phone, position, skills = [], status,
    location, experience, avatar = '👤', color = '#667EEA',
    links = [], documents = [], notes, department, metier, sector,
    dateAdded, tags = [], salary, availability, source, lastActivity,
    favorite = false, resume = null,
  } = candidate;

  const candidateTags = tags.map(id => allTags.find(t => t.id === id)).filter(Boolean);

  // Candidatures de ce candidat dans le pipeline
  const candidateApplications = applications.filter(
    a => a.candidateId === candidate.id || a.candidateName === candidate.name
  );

  const handlePrint = () => {
    printCandidateProfile(candidate, candidateApplications, allTags);
  };

  const section = { marginBottom: '24px' };
  const sectionTitle = {
    fontSize: '13px', fontWeight: '800', color: '#6B7280',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px',
  };
  const row = { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px', fontSize: '14px' };
  const label = { fontWeight: '700', color: '#374151', minWidth: '140px' };
  const value = { color: '#6B7280', flex: 1 };
  const linkStyle = { color: '#667EEA', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
          }}>
            {avatar}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1F2937', marginBottom: '4px' }}>
              {name} {favorite && '⭐'}
            </h2>
            <div style={{ fontSize: '16px', color: '#6B7280', fontWeight: '600', marginBottom: '8px' }}>{position}</div>
            <Badge variant={status === 'active' ? 'success' : status === 'passive' ? 'warning' : 'error'}>
              {STATUS_LABELS.CANDIDATE_STATUS?.[status] || status}
            </Badge>
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

        {/* Contact */}
        <div style={section}>
          <h3 style={sectionTitle}>📞 Contact</h3>
          <div style={row}>
            <span style={label}>Email :</span>
            <a href={`mailto:${email}`} style={linkStyle}>✉️ {email}</a>
          </div>
          <div style={row}>
            <span style={label}>Téléphone :</span>
            <a href={`tel:${phone}`} style={linkStyle}>📱 {phone}</a>
          </div>
          <div style={row}>
            <span style={label}>Localisation :</span>
            <span style={value}>📍 {location}</span>
          </div>
          {department && (
            <div style={row}>
              <span style={label}>Département :</span>
              <span style={value}>{department}</span>
            </div>
          )}
        </div>

        {/* Profil professionnel */}
        <div style={section}>
          <h3 style={sectionTitle}>💼 Profil Professionnel</h3>
          <div style={row}>
            <span style={label}>Expérience :</span>
            <span style={value}>{experience} ans</span>
          </div>
          {metier && <div style={row}><span style={label}>Métier :</span><span style={value}>{metier}</span></div>}
          {sector && <div style={row}><span style={label}>Secteur :</span><span style={value}>{sector}</span></div>}
          {salary && (
            <div style={row}>
              <span style={label}>Prétentions :</span>
              <span style={{ ...value, fontWeight: '800', color: '#667EEA' }}>💰 {salary}</span>
            </div>
          )}
          {availability && (
            <div style={row}>
              <span style={label}>Disponibilité :</span>
              <span style={value}>📅 {availability}</span>
            </div>
          )}
        </div>

        {/* Compétences */}
        {skills.length > 0 && (
          <div style={section}>
            <h3 style={sectionTitle}>🎯 Compétences</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {skills.map((skill, i) => (
                <span key={i} style={{
                  padding: '6px 12px', background: '#EFF6FF', color: '#3B82F6',
                  borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {candidateTags.length > 0 && (
          <div style={section}>
            <h3 style={sectionTitle}>🏷️ Tags</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {candidateTags.map((tag) => (
                <span key={tag.id} style={{
                  padding: '8px 16px', background: tag.color, color: 'white',
                  borderRadius: '8px', fontSize: '13px', fontWeight: '700',
                  boxShadow: `0 2px 12px ${tag.color}40`,
                }}>
                  🏷️ {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Informations sourcing */}
        <div style={section}>
          <h3 style={sectionTitle}>📊 Informations</h3>
          {source    && <div style={row}><span style={label}>Source :</span><span style={value}>{source}</span></div>}
          {dateAdded && <div style={row}><span style={label}>Ajouté le :</span><span style={value}>{formatDate(dateAdded)}</span></div>}
          {lastActivity && <div style={row}><span style={label}>Dernière activité :</span><span style={value}>{formatDate(lastActivity)}</span></div>}
        </div>

        {/* Liens */}
        {links.length > 0 && (
          <div style={section}>
            <h3 style={sectionTitle}>🔗 Liens</h3>
            {links.map((link, i) => (
              <div key={i} style={row}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                  🔗 {link.label}
                </a>
              </div>
            ))}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
      </Modal.Body>

      <Modal.Footer>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {onToggleFavorite && (
              <Button variant={favorite ? 'warning' : 'secondary'} onClick={() => onToggleFavorite(candidate)}>
                {favorite ? '⭐ Favori' : '☆ Favoris'}
              </Button>
            )}
            <button
              onClick={handlePrint}
              style={{
                padding: '9px 16px', border: '1.5px solid #667EEA',
                borderRadius: '10px', background: 'white',
                color: '#667EEA', cursor: 'pointer', fontWeight: '600',
                fontSize: '13px', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#667EEA'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#667EEA'; }}
              title="Exporter la fiche candidat en PDF"
            >
              🖨️ Exporter PDF
            </button>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {onDelete && <Button variant="error" onClick={() => onDelete(candidate)}>🗑️ Supprimer</Button>}
            {onEdit   && <Button variant="primary" onClick={() => onEdit(candidate)}>✏️ Modifier</Button>}
            <Button variant="secondary" onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default CandidateDetail;
