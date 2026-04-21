import React from 'react';
import Card from '@/shared/components/Card/Card';

/**
 * Carte de statistique pour le dashboard
 */
export function StatsCard({ icon, label, value, trend, color = '#667EEA' }) {
  const cardStyles = {
    textAlign: 'center',
    background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
    border: `2px solid ${color}30`,
  };

  const iconStyles = {
    fontSize: '48px',
    marginBottom: '16px',
  };

  const valueStyles = {
    fontSize: '42px',
    fontWeight: '900',
    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px',
  };

  const labelStyles = {
    fontSize: '14px',
    color: '#6B7280',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  };

  const trendStyles = {
    fontSize: '13px',
    fontWeight: '600',
    color: trend?.startsWith('+') ? '#10B981' : trend?.startsWith('-') ? '#EF4444' : '#6B7280',
  };

  return (
    <Card style={cardStyles}>
      <div style={iconStyles}>{icon}</div>
      <div style={valueStyles}>{value}</div>
      <div style={labelStyles}>{label}</div>
      {trend && <div style={trendStyles}>{trend}</div>}
    </Card>
  );
}

export default StatsCard;
