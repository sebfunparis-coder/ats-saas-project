import React from 'react';
import Card from '@/shared/components/Card/Card';
import Badge from '@/shared/components/DataDisplay/Badge';
import {
  cardBase, cardHoverEnter, cardHoverLeave,
  cardHeader, cardAvatar, cardContent,
  cardTitle, cardSubtitle, cardMeta,
  cardChips, cardChip, cardChipNeutral,
  cardFooter, cardFooterBadges,
} from '@/shared/styles/cardStyles';

const STATUS_META = {
  active:   { label: '✓ Actif',    variant: 'success' },
  prospect: { label: '🎯 Prospect', variant: 'warning' },
  inactive: { label: 'Inactif',    variant: 'default' },
  lost:     { label: '❌ Perdu',    variant: 'error' },
};

export function ClientCard({ client, onClick, npsAvg = null, healthScore = null }) {
  const {
    name, industry, email, phone,
    status = 'prospect', emoji = '🏢',
    color = '#F59E0B', missions = 0, city,
  } = client;

  const statusMeta = STATUS_META[status] || STATUS_META.prospect;

  const healthColor = healthScore === null ? null
    : healthScore >= 80 ? '#10B981'
    : healthScore >= 50 ? '#F59E0B'
    : '#EF4444';

  return (
    <Card
      style={cardBase}
      onClick={onClick}
      onMouseEnter={cardHoverEnter(color)}
      onMouseLeave={cardHoverLeave}
    >
      {/* Header — même structure que CandidateCard */}
      <div style={cardHeader}>
        <div style={cardAvatar(color)}>{emoji}</div>
        <div style={cardContent}>
          <h3 style={cardTitle}>{name}</h3>
          <div style={cardSubtitle}>{industry}</div>
          <div style={cardMeta}>
            {city  && <span>📍 {city}</span>}
            {email && <span>✉️ {email}</span>}
          </div>
        </div>
      </div>

      {/* Chips — même style que CandidateCard */}
      <div style={cardChips}>
        <span style={cardChip}>💼 {missions} mission{missions !== 1 ? 's' : ''}</span>
        {phone && <span style={cardChip}>📞 {phone}</span>}
      </div>

      {/* Barre santé discrète si disponible */}
      {healthScore !== null && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Santé client</span>
            <span style={{ fontSize: '11px', fontWeight: '800', color: healthColor }}>{healthScore}%</span>
          </div>
          <div style={{ height: '4px', background: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${healthScore}%`, background: healthColor, borderRadius: '2px', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      )}

      {/* Footer — même structure que CandidateCard */}
      <div style={cardFooter}>
        <div />
        <div style={cardFooterBadges}>
          {npsAvg !== null && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '3px 8px', background: '#FDF2F8', border: '1.5px solid #EC4899', borderRadius: '8px', fontSize: '11px', fontWeight: '700', color: '#BE185D' }}>
              NPS {npsAvg}/10
            </span>
          )}
          <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
        </div>
      </div>
    </Card>
  );
}

export default ClientCard;
