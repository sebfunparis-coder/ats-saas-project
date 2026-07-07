import React from 'react';
import Card from '@/shared/components/Card/Card';

/**
 * Pattern FilterPanel
 * Panel de filtres réutilisable
 *
 * @example
 * <FilterPanel title="Filtres">
 *   {children}
 * </FilterPanel>
 */
export function FilterPanel({
  title = 'Filtres',
  children,
  onReset,
  className = '',
  ...rest
}) {
  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '2px solid #E5E7EB',
  };

  const titleStyles = {
    fontSize: '18px',
    fontWeight: '800',
    color: '#1F2937',
  };

  const resetButtonStyles = {
    background: 'transparent',
    border: 'none',
    color: '#EF4444',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    padding: '4px 8px',
  };

  return (
    <Card className={className} {...rest}>
      <div style={headerStyles}>
        <h3 style={titleStyles}>{title}</h3>
        {onReset && (
          <button style={resetButtonStyles} onClick={onReset}>
            🔄 Réinitialiser
          </button>
        )}
      </div>
      {children}
    </Card>
  );
}

export default FilterPanel;
