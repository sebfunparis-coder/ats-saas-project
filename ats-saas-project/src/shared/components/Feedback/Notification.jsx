import React from 'react';

/**
 * Composant Notification/Toast
 *
 * @example
 * <Notification
 *   type="success"
 *   message="Opération réussie"
 *   onClose={handleClose}
 * />
 */
export function Notification({
  type = 'info',
  message,
  onClose,
  className = '',
  ...rest
}) {
  const baseStyles = {
    padding: '16px 20px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: '300px',
    animation: 'slideIn 0.3s ease-out',
  };

  const typeStyles = {
    success: {
      background: '#D1FAE5',
      border: '2px solid #10B981',
      color: '#065F46',
    },
    error: {
      background: '#FEE2E2',
      border: '2px solid #EF4444',
      color: '#991B1B',
    },
    warning: {
      background: '#FEF3C7',
      border: '2px solid #F59E0B',
      color: '#92400E',
    },
    info: {
      background: '#DBEAFE',
      border: '2px solid #3B82F6',
      color: '#1E40AF',
    },
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const iconStyles = {
    fontSize: '20px',
    fontWeight: 'bold',
  };

  const messageStyles = {
    flex: 1,
    fontSize: '14px',
    fontWeight: '600',
  };

  const closeButtonStyles = {
    background: 'transparent',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: 'inherit',
    padding: '0',
    lineHeight: '1',
  };

  const combinedStyles = {
    ...baseStyles,
    ...typeStyles[type],
  };

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div style={combinedStyles} className={className} {...rest}>
        <span style={iconStyles}>{icons[type]}</span>
        <span style={messageStyles}>{message}</span>
        {onClose && (
          <button
            style={closeButtonStyles}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        )}
      </div>
    </>
  );
}

export default Notification;
