import React from 'react';
import Card from '@/shared/components/Card/Card';
import Badge from '@/shared/components/DataDisplay/Badge';
import { STATUS_LABELS } from '@/config/constants';
import { useData } from '@/core/contexts/DataContext';

/**
 * Carte d'affichage d'un candidat
 *
 * @example
 * <CandidateCard
 *   candidate={candidate}
 *   onClick={handleClick}
 * />
 */
export function CandidateCard({ candidate, onClick }) {
  const { tags: allTags } = useData();

  const {
    name,
    position,
    email,
    phone,
    skills = [],
    status,
    location,
    experience,
    avatar = '👤',
    color = '#667EEA',
    salary,
    availability,
    favorite = false,
    tags = [],
  } = candidate;

  // Récupérer les objets tags complets à partir des IDs
  const candidateTags = tags.map(tagId => allTags.find(t => t.id === tagId)).filter(Boolean);

  const cardStyles = {
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
  };

  const headerStyles = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '16px',
  };

  const avatarBoxStyles = {
    width: '64px',
    height: '64px',
    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    flexShrink: 0,
    boxShadow: `0 4px 16px ${color}40`,
  };

  const contentStyles = {
    flex: 1,
    minWidth: 0,
  };

  const nameStyles = {
    fontSize: '20px',
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const positionStyles = {
    fontSize: '14px',
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: '8px',
  };

  const metaStyles = {
    fontSize: '12px',
    color: '#9CA3AF',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  };

  const skillsContainerStyles = {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '12px',
  };

  const skillTagStyles = {
    padding: '4px 10px',
    background: '#EFF6FF',
    color: '#3B82F6',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
  };

  const footerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #E5E7EB',
  };

  const infoStyles = {
    fontSize: '13px',
    color: '#374151',
    fontWeight: '600',
  };

  const favoriteIconStyles = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    fontSize: '20px',
  };

  return (
    <Card
      style={cardStyles}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 12px 32px ${color}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
      }}
    >
      {favorite && <div style={favoriteIconStyles}>⭐</div>}

      <div style={headerStyles}>
        <div style={avatarBoxStyles}>{avatar}</div>
        <div style={contentStyles}>
          <h3 style={nameStyles}>{name}</h3>
          <div style={positionStyles}>{position}</div>
          <div style={metaStyles}>
            <span>📍 {location}</span>
            <span>💼 {experience} ans</span>
          </div>
        </div>
      </div>

      {skills.length > 0 && (
        <div style={skillsContainerStyles}>
          {skills.slice(0, 3).map((skill, index) => (
            <span key={index} style={skillTagStyles}>
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span style={{ ...skillTagStyles, background: '#F3F4F6', color: '#6B7280' }}>
              +{skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Tags */}
      {candidateTags.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {candidateTags.map((tag) => (
            <span
              key={tag.id}
              style={{
                padding: '4px 10px',
                background: tag.color,
                color: 'white',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                boxShadow: `0 2px 8px ${tag.color}40`,
              }}
            >
              🏷️ {tag.name}
            </span>
          ))}
        </div>
      )}

      <div style={footerStyles}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {salary && <div style={infoStyles}>💰 {salary}</div>}
          {availability && <div style={{ fontSize: '12px', color: '#6B7280' }}>📅 Dispo: {availability}</div>}
        </div>
        <Badge variant={status === 'active' ? 'success' : status === 'passive' ? 'warning' : 'error'}>
          {STATUS_LABELS.CANDIDATE_STATUS[status] || status}
        </Badge>
      </div>
    </Card>
  );
}

export default CandidateCard;
