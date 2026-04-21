import React from 'react';
import Sidebar from './Sidebar';

/**
 * Layout principal de l'application avec Sidebar
 */
export function AppLayout({ children }) {
  const layoutStyles = {
    display: 'flex',
    minHeight: '100vh',
    background: '#F9FAFB',
  };

  const contentStyles = {
    flex: 1,
    marginLeft: '280px',
    minHeight: '100vh',
  };

  return (
    <div style={layoutStyles}>
      <Sidebar />
      <div style={contentStyles}>
        {children}
      </div>
    </div>
  );
}

export default AppLayout;
