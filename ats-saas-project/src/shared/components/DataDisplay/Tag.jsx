import React from 'react';

/**
 * Composant Tag réutilisable
 * Similaire à Badge mais avec possibilité de suppression
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Contenu du tag
 * @param {string} props.color - Couleur du tag (hex)
 * @param {boolean} props.removable - Afficher le bouton de suppression
 * @param {Function} props.onRemove - Callback de suppression
 *
 * @example
 * <Tag color="#EF4444" removable onRemove={handleRemove}>
 *   Urgent
 * </Tag>
 */
export function Tag({
  children,
  color = '#667EEA',
  removable = false,
  onRemove,
  className = '',
  ...rest
}) {
  const styles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    background: color + '20', // 20 = opacity 12.5%
    color: color,
    border: `1px solid ${color}40`,
  };

  const removeButtonStyles = {
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    padding: '0',
    marginLeft: '4px',
    fontSize: '14px',
    fontWeight: 'bold',
    lineHeight: '1',
  };

  return (
    <span style={styles} className={className} {...rest}>
      {children}
      {removable && (
        <button
          style={removeButtonStyles}
          onClick={onRemove}
          type="button"
        >
          ×
        </button>
      )}
    </span>
  );
}

export default Tag;
