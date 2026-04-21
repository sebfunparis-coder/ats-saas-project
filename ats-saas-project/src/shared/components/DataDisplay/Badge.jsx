import React from 'react';

/**
 * Composant Badge réutilisable
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Contenu du badge
 * @param {'success'|'warning'|'error'|'info'|'default'} props.variant - Variante du badge
 * @param {'sm'|'md'|'lg'} props.size - Taille du badge
 *
 * @example
 * <Badge variant="success">Actif</Badge>
 * <Badge variant="warning" size="sm">En attente</Badge>
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...rest
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  };

  const sizeStyles = {
    sm: { padding: '4px 8px', fontSize: '11px' },
    md: { padding: '6px 12px', fontSize: '13px' },
    lg: { padding: '8px 16px', fontSize: '14px' },
  };

  const variantStyles = {
    success: {
      background: '#D1FAE5',
      color: '#065F46',
    },
    warning: {
      background: '#FEF3C7',
      color: '#92400E',
    },
    error: {
      background: '#FEE2E2',
      color: '#991B1B',
    },
    info: {
      background: '#DBEAFE',
      color: '#1E40AF',
    },
    default: {
      background: '#F3F4F6',
      color: '#374151',
    },
  };

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  return (
    <span style={combinedStyles} className={className} {...rest}>
      {children}
    </span>
  );
}

export default Badge;
