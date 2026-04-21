import React from 'react';

/**
 * Composant FormField
 * Wrapper pour Input/Select/Textarea avec label et message d'erreur
 *
 * @example
 * <FormField label="Email" error={errors.email} required>
 *   <Input
 *     type="email"
 *     value={email}
 *     onChange={(e) => setEmail(e.target.value)}
 *   />
 * </FormField>
 */
export function FormField({
  label,
  error,
  required = false,
  helpText,
  children,
  className = '',
  ...rest
}) {
  const containerStyles = {
    marginBottom: '20px',
  };

  const labelStyles = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: error ? '#EF4444' : '#374151',
  };

  const requiredStyles = {
    color: '#EF4444',
    marginLeft: '4px',
  };

  const errorStyles = {
    marginTop: '6px',
    fontSize: '13px',
    color: '#EF4444',
  };

  const helpTextStyles = {
    marginTop: '6px',
    fontSize: '13px',
    color: '#6B7280',
  };

  // Clone children pour passer la prop error
  const childrenWithError = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { error: !!error });
    }
    return child;
  });

  return (
    <div style={containerStyles} className={className} {...rest}>
      {label && (
        <label style={labelStyles}>
          {label}
          {required && <span style={requiredStyles}>*</span>}
        </label>
      )}

      {childrenWithError}

      {error && <div style={errorStyles}>{error}</div>}
      {!error && helpText && <div style={helpTextStyles}>{helpText}</div>}
    </div>
  );
}

export default FormField;
