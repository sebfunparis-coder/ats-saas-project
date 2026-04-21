import React, { useCallback, useMemo } from 'react';

/**
 * Composant Card réutilisable (optimisé avec React.memo)
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Contenu de la carte
 * @param {boolean} props.hoverable - Effet hover
 * @param {Function} props.onClick - Callback au clic
 * @param {string} props.className - Classes CSS additionnelles
 *
 * @example
 * <Card hoverable onClick={handleClick}>
 *   <h3>Titre</h3>
 *   <p>Contenu de la carte</p>
 * </Card>
 */
export const Card = React.memo(function Card({
  children,
  hoverable = false,
  onClick,
  className = '',
  style = {},
  ...rest
}) {
  // Memoize styles to avoid recalculation on every render
  const combinedStyles = useMemo(() => ({
    padding: '24px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    border: '1px solid #E5E7EB',
    transition: 'all 0.3s',
    cursor: hoverable ? 'pointer' : 'default',
    ...style,
  }), [hoverable, style]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleMouseEnter = useCallback((e) => {
    if (hoverable) {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
    }
  }, [hoverable]);

  const handleMouseLeave = useCallback((e) => {
    if (hoverable) {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
    }
  }, [hoverable]);

  return (
    <div
      style={combinedStyles}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      {...rest}
    >
      {children}
    </div>
  );
});

export default Card;
