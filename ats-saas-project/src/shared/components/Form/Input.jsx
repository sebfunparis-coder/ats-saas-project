import React from 'react';

/**
 * Composant Input réutilisable
 *
 * @example
 * <Input
 *   type="text"
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   placeholder="Entrez votre nom"
 * />
 */
export function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  error = false,
  className = '',
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
    cursor: disabled ? 'not-allowed' : 'text',
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
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={styles}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
      {...rest}
    />
  );
}

export default Input;
