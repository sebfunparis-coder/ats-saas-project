import React from 'react';
import Card from '@/shared/components/Card/Card';
import Badge from '@/shared/components/DataDisplay/Badge';
import { STATUS_LABELS } from '@/config/constants';
import { useData } from '@/core/contexts/DataContext';
import {
  cardBase, cardHoverEnter, cardHoverLeave,
  cardHeader, cardAvatar, cardContent,
  cardTitle, cardSubtitle, cardMeta,
  cardChips, cardChip, cardChipNeutral,
  cardFooter, cardFooterValue, cardFooterBadges,
} from '@/shared/styles/cardStyles';

export function CandidateCard({ candidate, onClick, hasCheckbox = false }) {
  const { tags: allTags } = useData();

  const {
    name, position, skills = [], status,
    location, experience, avatar = '👤',
    color = '#667EEA', salary, availability,
    favorite = false, tags = [], mood,
  } = candidate;

  const MOOD_META = {
    hot:  { icon: '🔥', label: 'Chaud',  color: '#EF4444', bg: '#FEE2E2' },
    warm: { icon: '😊', label: 'Tiède',  color: '#F59E0B', bg: '#FFFBEB' },
    cold: { icon: '❄️', label: 'Froid',  color: '#3B82F6', bg: '#EFF6FF' },
  };
  const moodMeta = mood ? MOOD_META[mood] : null;
  const candidateTags = tags.map(id => allTags.find(t => t.id === id)).filter(Boolean);

  const daysSince = (() => {
    const ref = candidate.lastActivity || candidate.dateAdded;
    if (!ref) return null;
    return Math.floor((Date.now() - new Date(ref).getTime()) / 86_400_000);
  })();
  const freshness = daysSince === null ? null
    : daysSince < 7  ? { label: 'Récent',        color: '#10B981', bg: '#ECFDF5' }
    : daysSince < 30 ? { label: `${daysSince}j`,  color: '#3B82F6', bg: '#EFF6FF' }
    : daysSince < 90 ? { label: `${daysSince}j`,  color: '#F59E0B', bg: '#FFFBEB' }
    :                  { label: `${daysSince}j`,  color: '#EF4444', bg: '#FEF2F2' };

  return (
    <Card
      style={cardBase}
      onClick={onClick}
      onMouseEnter={cardHoverEnter(color)}
      onMouseLeave={cardHoverLeave}
    >
      {/* Badges absolus */}
      {favorite && <div style={{ position: 'absolute', top: '14px', right: '14px', fontSize: '18px' }}>⭐</div>}
      {freshness && (
        <div style={{ position: 'absolute', top: '12px', left: hasCheckbox ? '40px' : '12px', padding: '2px 8px', borderRadius: '20px', background: freshness.bg, color: freshness.color, fontSize: '10px', fontWeight: '800' }}>
          🕐 {freshness.label}
        </div>
      )}

      {/* Header */}
      <div style={{ ...cardHeader, marginTop: freshness ? '22px' : 0 }}>
        <div style={cardAvatar(color)}>{avatar}</div>
        <div style={cardContent}>
          <h3 style={cardTitle}>{name}</h3>
          <div style={cardSubtitle}>{position}</div>
          <div style={cardMeta}>
            {location   && <span>📍 {location}</span>}
            {experience > 0 && <span>💼 {experience} ans</span>}
          </div>
        </div>
      </div>

      {/* Chips compétences */}
      {skills.length > 0 && (
        <div style={cardChips}>
          {skills.slice(0, 3).map((s, i) => <span key={i} style={cardChip}>{s}</span>)}
          {skills.length > 3 && <span style={cardChipNeutral}>+{skills.length - 3}</span>}
        </div>
      )}

      {/* Tags */}
      {candidateTags.length > 0 && (
        <div style={{ ...cardChips, marginBottom: '0' }}>
          {candidateTags.slice(0, 2).map(tag => (
            <span key={tag.id} style={{ padding: '4px 10px', background: tag.color, color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
              🏷️ {tag.name}
            </span>
          ))}
          {candidateTags.length > 2 && <span style={cardChipNeutral}>+{candidateTags.length - 2}</span>}
        </div>
      )}

      {/* Footer */}
      <div style={cardFooter}>
        <div>
          {salary       && <div style={cardFooterValue}>{salary}</div>}
          {availability && <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>📅 {availability}</div>}
        </div>
        <div style={cardFooterBadges}>
          {moodMeta && (
            <span style={{ padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: moodMeta.bg, color: moodMeta.color }}>
              {moodMeta.icon} {moodMeta.label}
            </span>
          )}
          <Badge variant={status === 'active' || status === 'hired' ? 'success' : status === 'passive' ? 'warning' : status === 'archived' ? 'default' : 'error'}>
            {STATUS_LABELS.CANDIDATE_STATUS?.[status] || status}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

export default CandidateCard;
