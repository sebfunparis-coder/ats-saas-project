/**
 * ☑️ Checkbox Component
 *
 * Composant checkbox réutilisable
 */

import React from 'react';

/**
 * @param {object} props
 * @param {string} props.label - Checkbox label
 * @param {boolean} props.checked - Checked state
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.className - Additional classes
 */
export const Checkbox = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <label className={`flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer disabled:cursor-not-allowed"
        {...props}
      />
      {label && (
        <span className="ml-2 text-sm text-gray-700">{label}</span>
      )}
    </label>
  );
};
