import React from 'react';
import Card from '@/shared/components/Card/Card';
import Badge from '@/shared/components/DataDisplay/Badge';
import { STATUS_COLORS, STATUS_LABELS } from '@/config/constants';

/**
 * Carte d'affichage d'une mission
 *
 * @example
 * <MissionCard
 *   mission={mission}
 *   onClick={handleClick}
 * />
 */
export function MissionCard({ mission, onClick }) {
  const {
    title,
    client,
    location,
    salary,
    status,
    skills = [],
    emoji = '💼',
    color = '#667EEA',
    urgency,
    progress = 0,
  } = mission;

  const cardStyles = {
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  };

  const headerStyles = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '16px',
  };

  const emojiBoxStyles = {
    width: '56px',
    height: '56px',
    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    flexShrink: 0,
    boxShadow: `0 4px 16px ${color}40`,
  };

  const contentStyles = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyles = {
    fontSize: '18px',
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const metaStyles = {
    fontSize: '13px',
    color: '#6B7280',
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

  const salaryStyles = {
    fontSize: '16px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const progressBarContainerStyles = {
    width: '100%',
    height: '4px',
    background: '#E5E7EB',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '12px',
  };

  const progressBarStyles = {
    height: '100%',
    background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
    width: `${progress}%`,
    transition: 'width 0.3s ease',
  };

  const urgencyBadgeStyles = urgency === 'tres urgent'
    ? { background: '#FEE2E2', color: '#991B1B', border: '1px solid #EF4444' }
    : urgency === 'urgent'
    ? { background: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B' }
    : null;

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
      <div style={headerStyles}>
        <div style={emojiBoxStyles}>{emoji}</div>
        <div style={contentStyles}>
          <h3 style={titleStyles}>{title}</h3>
          <div style={metaStyles}>
            <span>🏢 {client}</span>
            <span>📍 {location}</span>
          </div>
        </div>
      </div>

      {skills.length > 0 && (
        <div style={skillsContainerStyles}>
          {skills.slice(0, 4).map((skill, index) => (
            <span key={index} style={skillTagStyles}>
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span style={{ ...skillTagStyles, background: '#F3F4F6', color: '#6B7280' }}>
              +{skills.length - 4}
            </span>
          )}
        </div>
      )}

      <div style={footerStyles}>
        <div style={salaryStyles}>{salary}</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {urgency && urgencyBadgeStyles && (
            <span
              style={{
                ...urgencyBadgeStyles,
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
              }}
            >
              {urgency === 'tres urgent' ? '🔥 Très urgent' : '⚡ Urgent'}
            </span>
          )}
          <Badge variant={status === 'open' ? 'success' : status === 'closed' ? 'error' : 'warning'}>
            {STATUS_LABELS.MISSION_STATUS[status] || status}
          </Badge>
        </div>
      </div>

      {progress > 0 && (
        <div style={progressBarContainerStyles}>
          <div style={progressBarStyles} />
        </div>
      )}
    </Card>
  );
}

export default MissionCard;
