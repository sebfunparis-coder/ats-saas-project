/**
 * 📝 Input Component
 *
 * Composant input réutilisable
 */

import React from 'react';

/**
 * @param {object} props
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.icon - Icon (emoji)
 * @param {string} props.className - Additional classes
 */
export const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  icon,
  className = '',
  ...props
}) => {
  const inputClasses = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    error ? 'border-red-500' : 'border-gray-300'
  } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${icon ? 'pl-10' : ''}`;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
