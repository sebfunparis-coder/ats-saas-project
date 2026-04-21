/**
 * 🃏 Card Component
 *
 * Composant carte réutilisable
 */

import React from 'react';

/**
 * @param {object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.header - Custom header content
 * @param {React.ReactNode} props.footer - Footer content
 * @param {boolean} props.shadow - Add shadow
 * @param {boolean} props.border - Add border
 * @param {boolean} props.hover - Add hover effect
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional classes
 */
export const Card = ({
  children,
  title,
  header,
  footer,
  shadow = true,
  border = true,
  hover = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses = 'bg-white rounded-lg overflow-hidden';
  const shadowClass = shadow ? 'shadow-md' : '';
  const borderClass = border ? 'border border-gray-200' : '';
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : '';

  const classes = `${baseClasses} ${shadowClass} ${borderClass} ${hoverClass} ${className}`;

  return (
    <div className={classes} onClick={onClick} {...props}>
      {/* Header */}
      {(title || header) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {header || <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-4">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};
