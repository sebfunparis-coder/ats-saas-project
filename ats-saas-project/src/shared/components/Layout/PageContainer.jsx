import React from 'react';

/**
 * Conteneur de page réutilisable
 *
 * @example
 * <PageContainer title="Missions" subtitle="Gérez vos missions">
 *   {children}
 * </PageContainer>
 */
export function PageContainer({
  title,
  subtitle,
  actions,
  children,
  className = '',
  ...rest
}) {
  const containerStyles = {
    padding: '32px',
    minHeight: '100vh',
  };

  const headerStyles = {
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const titleContainerStyles = {
    flex: 1,
  };

  const titleStyles = {
    fontSize: '42px',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: subtitle ? '8px' : '0',
  };

  const subtitleStyles = {
    fontSize: '16px',
    color: '#6B7280',
  };

  const actionsStyles = {
    display: 'flex',
    gap: '12px',
  };

  return (
    <div style={containerStyles} className={className} {...rest}>
      {(title || actions) && (
        <div style={headerStyles}>
          {title && (
            <div style={titleContainerStyles}>
              <h1 style={titleStyles}>{title}</h1>
              {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
            </div>
          )}
          {actions && <div style={actionsStyles}>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export default PageContainer;
