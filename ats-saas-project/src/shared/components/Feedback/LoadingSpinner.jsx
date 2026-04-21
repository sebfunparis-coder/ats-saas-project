import React from 'react';

/**
 * Composant LoadingSpinner
 *
 * @example
 * <LoadingSpinner size="lg" />
 */
export function LoadingSpinner({
  size = 'md',
  color = '#667EEA',
  className = '',
  ...rest
}) {
  const sizeMap = {
    sm: '24px',
    md: '40px',
    lg: '64px',
  };

  const spinnerStyles = {
    width: sizeMap[size],
    height: sizeMap[size],
    border: `4px solid rgba(102, 126, 234, 0.2)`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={spinnerStyles} className={className} {...rest} />
    </>
  );
}

export default LoadingSpinner;
