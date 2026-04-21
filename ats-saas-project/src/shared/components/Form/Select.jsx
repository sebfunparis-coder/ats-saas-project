import React from 'react';

/**
 * Composant Select réutilisable
 *
 * @example
 * <Select
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   options={[
 *     { value: 'option1', label: 'Option 1' },
 *     { value: 'option2', label: 'Option 2' }
 *   ]}
 * />
 */
export function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Sélectionnez...',
  disabled = false,
  error = false,
  className = '',
  children,
  ...rest
}) {
  const styles = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    border: error ? '2px solid #EF4444' : '2px solid #E5E7EB',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.2s',
    background: disabled ? '#F3F4F6' : 'white',
    color: disabled ? '#9CA3AF' : '#1F2937',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const handleFocus = (e) => {
    if (!disabled && !error) {
      e.target.style.borderColor = '#667EEA';
    }
  };

  const handleBlur = (e) => {
    if (!error) {
      e.target.style.borderColor = '#E5E7EB';
    }
  };

  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={styles}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
      {...rest}
    >
      {placeholder && !children && <option value="">{placeholder}</option>}
      {/* Support des children (options JSX) OU de la prop options */}
      {children ? children : options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Select;
