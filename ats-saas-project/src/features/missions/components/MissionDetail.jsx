import React from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Badge from '@/shared/components/DataDisplay/Badge';
import Button from '@/shared/components/Button/Button';
import { STATUS_LABELS } from '@/config/constants';
import { formatDate, formatFileSize } from '@/core/utils/formatters';

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
export function MissionDetail({ mission, isOpen, onClose, onEdit, onDelete, onMatch }) {
  if (!mission) return null;

  const {
    title,
    client,
    location,
    salary,
    status,
    skills = [],
    description,
    emoji = '💼',
    color = '#667EEA',
    links = [],
    documents = [],
    notes,
    startDate,
    urgency,
    address = {},
    workMode,
    contractType,
    weeklyHours,
    contactClient = {},
    progress = 0,
  } = mission;

  const sectionStyles = {
    marginBottom: '24px',
  };

  const sectionTitleStyles = {
    fontSize: '14px',
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '12px',
  };

  const infoRowStyles = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '10px',
    fontSize: '14px',
  };

  const labelStyles = {
    fontWeight: '700',
    color: '#374151',
    minWidth: '140px',
  };

  const valueStyles = {
    color: '#6B7280',
    flex: 1,
  };

  const skillsContainerStyles = {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  };

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
  };

  const documentItemStyles = {
    padding: '12px',
    background: '#F9FAFB',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  };

  const progressBarContainerStyles = {
    width: '100%',
    height: '8px',
    background: '#E5E7EB',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '8px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            {emoji}
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1F2937', marginBottom: '4px' }}>
              {title}
            </h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Badge variant={status === 'open' ? 'success' : status === 'closed' ? 'error' : 'warning'}>
                {STATUS_LABELS.MISSION_STATUS[status] || status}
              </Badge>
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
        {/* Informations principales */}
        <div style={sectionStyles}>
          <h3 style={sectionTitleStyles}>📋 Informations Générales</h3>
          <div style={infoRowStyles}>
            <span style={labelStyles}>Client :</span>
            <span style={valueStyles}>🏢 {client}</span>
          </div>
          <div style={infoRowStyles}>
            <span style={labelStyles}>Localisation :</span>
            <span style={valueStyles}>📍 {location}</span>
          </div>
          {address.street && (
            <div style={infoRowStyles}>
              <span style={labelStyles}>Adresse :</span>
              <span style={valueStyles}>{address.street}, {address.zipCode} {address.city}</span>
            </div>
          )}
          <div style={infoRowStyles}>
            <span style={labelStyles}>Salaire :</span>
            <span style={{ ...valueStyles, fontWeight: '800', color: '#667EEA' }}>{salary}</span>
          </div>
          {startDate && (
            <div style={infoRowStyles}>
              <span style={labelStyles}>Début :</span>
              <span style={valueStyles}>📅 {formatDate(startDate)}</span>
            </div>
          )}
        </div>

        {/* Détails contrat */}
        {(contractType || workMode || weeklyHours) && (
          <div style={sectionStyles}>
            <h3 style={sectionTitleStyles}>💼 Détails du Contrat</h3>
            {contractType && (
              <div style={infoRowStyles}>
                <span style={labelStyles}>Type de contrat :</span>
                <span style={valueStyles}>{contractType}</span>
              </div>
            )}
            {workMode && (
              <div style={infoRowStyles}>
                <span style={labelStyles}>Mode de travail :</span>
                <span style={valueStyles}>{workMode}</span>
              </div>
            )}
            {weeklyHours && (
              <div style={infoRowStyles}>
                <span style={labelStyles}>Horaires :</span>
                <span style={valueStyles}>{weeklyHours}</span>
              </div>
            )}
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
            <div style={infoRowStyles}>
              <span style={labelStyles}>Nom :</span>
              <span style={valueStyles}>{contactClient.name}</span>
            </div>
            {contactClient.phone && (
              <div style={infoRowStyles}>
                <span style={labelStyles}>Téléphone :</span>
                <span style={valueStyles}>📞 {contactClient.phone}</span>
              </div>
            )}
            {contactClient.email && (
              <div style={infoRowStyles}>
                <span style={labelStyles}>Email :</span>
                <a href={`mailto:${contactClient.email}`} style={linkStyles}>
                  ✉️ {contactClient.email}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Liens */}
        {links.length > 0 && (
          <div style={sectionStyles}>
            <h3 style={sectionTitleStyles}>🔗 Liens Utiles</h3>
            {links.map((link, index) => (
              <div key={index} style={infoRowStyles}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" style={linkStyles}>
                  🔗 {link.label}
                </a>
              </div>
            ))}
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
      </Modal.Body>

      <Modal.Footer>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', width: '100%' }}>
          <div>
            {onMatch && (
              <button
                onClick={() => onMatch(mission)}
                style={{
                  padding: '9px 16px', border: '1.5px solid #667EEA', borderRadius: '10px',
                  background: 'white', color: '#667EEA', cursor: 'pointer',
                  fontWeight: '600', fontSize: '13px', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#667EEA'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#667EEA'; }}
              >
                🤖 Matching IA
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {onDelete && (
              <Button variant="error" onClick={() => onDelete(mission)}>
                🗑️ Supprimer
              </Button>
            )}
            {onEdit && (
              <Button variant="primary" onClick={() => onEdit(mission)}>
                ✏️ Modifier
              </Button>
            )}
            <Button variant="secondary" onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default MissionDetail;
