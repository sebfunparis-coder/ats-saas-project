import React, { useMemo, useCallback } from 'react';

/**
 * Composant Button réutilisable (optimisé avec React.memo)
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Contenu du bouton
 * @param {'primary'|'secondary'|'success'|'warning'|'error'|'ghost'} props.variant - Variante du bouton
 * @param {'sm'|'md'|'lg'} props.size - Taille du bouton
 * @param {boolean} props.disabled - Bouton désactivé
 * @param {boolean} props.fullWidth - Bouton pleine largeur
 * @param {Function} props.onClick - Callback au clic
 *
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Cliquez-moi
 * </Button>
 */
export const Button = React.memo(function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...rest
}) {
  // Memoize variant styles (constant object)
  const variantStyles = useMemo(() => ({
    primary: {
      background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
      color: 'white',
      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
    },
    secondary: {
      background: 'linear-gradient(135deg, #FF6B9D 0%, #C06595 100%)',
      color: 'white',
      boxShadow: '0 6px 20px rgba(255, 107, 157, 0.4)',
    },
    success: {
      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      color: 'white',
      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
    },
    warning: {
      background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
      color: 'white',
      boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)',
    },
    error: {
      background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      color: 'white',
      boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
    },
    ghost: {
      background: 'transparent',
      color: '#667EEA',
      border: '2px solid #667EEA',
      boxShadow: 'none',
    },
  }), []);

  const sizeStyles = useMemo(() => ({
    sm: { padding: '8px 16px', fontSize: '13px' },
    md: { padding: '12px 24px', fontSize: '15px' },
    lg: { padding: '16px 32px', fontSize: '16px' },
  }), []);

  // Memoize combined styles
  const combinedStyles = useMemo(() => ({
    fontWeight: '700',
    borderRadius: '12px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    ...sizeStyles[size],
    ...variantStyles[variant],
  }), [disabled, fullWidth, size, variant, sizeStyles, variantStyles]);

  // Memoize click handler
  const handleClick = useCallback((e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  }, [disabled, onClick]);

  return (
    <button
      type={type}
      style={combinedStyles}
      onClick={handleClick}
      disabled={disabled}
      className={className}
      {...rest}
    >
      {children}
    </button>
  );
});

export default Button;
