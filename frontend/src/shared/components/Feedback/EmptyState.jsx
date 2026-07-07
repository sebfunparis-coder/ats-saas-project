import React from 'react';

/**
 * Composant Empty State (T-263) — illustration + titre + bouton d'action primaire.
 * Remplace les states vides inline éparpillés dans les composants de liste.
 *
 * @example
 * <EmptyState
 *   icon="💼"
 *   title="Aucune mission pour l'instant"
 *   description="Créez votre première mission pour commencer à recruter."
 *   action={{ label: 'Créer une mission', onClick: () => setIsFormOpen(true) }}
 * />
 */
export function EmptyState({ icon = '📋', title, description, action }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '80px 24px',
      color: '#9CA3AF',
      maxWidth: '420px',
      margin: '0 auto',
    }}>
      <div style={{ fontSize: '72px', marginBottom: '20px', lineHeight: 1 }}>{icon}</div>
      <h3 style={{
        fontSize: '20px', fontWeight: '800', color: '#111827',
        marginBottom: description ? '10px' : '28px',
      }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '28px', lineHeight: 1.6 }}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
            color: 'white',
            borderRadius: '12px',
            border: 'none',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(102,126,234,0.35)',
            transition: 'opacity 0.15s, transform 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
