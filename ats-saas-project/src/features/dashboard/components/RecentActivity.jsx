import React from 'react';
import Card from '@/shared/components/Card/Card';
import { formatDate } from '@/core/utils/formatters';

/**
 * Liste d'activité récente
 */
export function RecentActivity({ history = [] }) {
  const itemStyles = {
    padding: '16px',
    borderBottom: '1px solid #E5E7EB',
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  };

  const iconStyles = {
    fontSize: '24px',
    flexShrink: 0,
  };

  const contentStyles = {
    flex: 1,
    minWidth: 0,
  };

  const actionStyles = {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '4px',
  };

  const detailsStyles = {
    fontSize: '13px',
    color: '#6B7280',
    marginBottom: '4px',
  };

  const metaStyles = {
    fontSize: '12px',
    color: '#9CA3AF',
    display: 'flex',
    gap: '12px',
  };

  const emptyStateStyles = {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#9CA3AF',
  };

  if (history.length === 0) {
    return (
      <Card>
        <div style={emptyStateStyles}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>Aucune activité récente</div>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ padding: 0 }}>
      {history.slice(0, 10).map((item, index) => (
        <div key={item.id || index} style={itemStyles}>
          <div style={iconStyles}>{item.icon}</div>
          <div style={contentStyles}>
            <div style={actionStyles}>{item.action}</div>
            {item.details && <div style={detailsStyles}>{item.details}</div>}
            <div style={metaStyles}>
              <span>👤 {item.user}</span>
              <span>📅 {formatDate(item.date)}</span>
              {item.time && <span>🕐 {item.time}</span>}
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
}

export default RecentActivity;
