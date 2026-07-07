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

export function MissionCard({ mission, onClick, isStale = false }) {
  const {
    title, client, location, salary, status,
    skills = [], emoji = '💼', color = '#667EEA',
    urgency, progress = 0, expectedCloseDate,
    numberOfPositions = 1, contractType,
  } = mission;

  const { applications = [] } = useData();
  const missionId = mission.id || mission._id;
  const hiredCount = applications.filter(
    a => String(a.missionId) === String(missionId) && a.status === 'hired'
  ).length;

  const isOverdue = expectedCloseDate && status === 'open' && new Date(expectedCloseDate) < new Date();

  return (
    <Card
      style={cardBase}
      onClick={onClick}
      onMouseEnter={cardHoverEnter(color)}
      onMouseLeave={cardHoverLeave}
    >
      {/* Alertes */}
      {isStale && (
        <div style={{ marginBottom: '10px', padding: '5px 10px', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', fontSize: '11px', fontWeight: '700', color: '#92400E' }}>
          ⚠️ Inactive depuis plus de 60 jours
        </div>
      )}
      {isOverdue && (
        <div style={{ marginBottom: '10px', padding: '5px 10px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '11px', fontWeight: '700', color: '#DC2626' }}>
          ⏰ Date de clôture dépassée
        </div>
      )}

      {/* Badges absolus */}
      {(numberOfPositions > 1 || hiredCount > 0) && (
        <div style={{ position: 'absolute', top: '14px', right: '14px', padding: '3px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', background: hiredCount >= numberOfPositions ? '#D1FAE5' : '#F3F4F6', color: hiredCount >= numberOfPositions ? '#065F46' : '#374151' }}>
          👥 {hiredCount}/{numberOfPositions}
        </div>
      )}

      {/* Header — même structure que CandidateCard */}
      <div style={cardHeader}>
        <div style={cardAvatar(color)}>{emoji}</div>
        <div style={cardContent}>
          <h3 style={cardTitle}>{title}</h3>
          <div style={cardSubtitle}>{client}</div>
          <div style={cardMeta}>
            {location     && <span>📍 {location}</span>}
            {contractType && <span>📄 {contractType}</span>}
          </div>
        </div>
      </div>

      {/* Chips compétences — même style que CandidateCard */}
      {skills.length > 0 && (
        <div style={cardChips}>
          {skills.slice(0, 3).map((s, i) => <span key={i} style={cardChip}>{s}</span>)}
          {skills.length > 3 && <span style={cardChipNeutral}>+{skills.length - 3}</span>}
        </div>
      )}

      {/* Progress bar discrète si renseignée */}
      {progress > 0 && (
        <div style={{ height: '4px', background: '#E5E7EB', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`, borderRadius: '2px' }} />
        </div>
      )}

      {/* Footer — même structure que CandidateCard */}
      <div style={cardFooter}>
        <div style={cardFooterValue}>{salary}</div>
        <div style={cardFooterBadges}>
          {urgency && (
            <span style={{
              padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
              background: urgency === 'tres urgent' ? '#FEE2E2' : '#FEF3C7',
              color:      urgency === 'tres urgent' ? '#991B1B'  : '#92400E',
            }}>
              {urgency === 'tres urgent' ? '🔥 Très urgent' : '⚡ Urgent'}
            </span>
          )}
          <Badge variant={status === 'open' ? 'success' : status === 'closed' ? 'error' : 'warning'}>
            {STATUS_LABELS.MISSION_STATUS?.[status] || status}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

export default MissionCard;
