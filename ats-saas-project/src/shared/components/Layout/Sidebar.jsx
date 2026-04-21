import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/core/contexts/AuthContext';

/**
 * Sidebar de navigation principale
 */
export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: ROUTES.DASHBOARD, icon: '📊', label: 'Dashboard' },
    { path: '/app/clients', icon: '🏢', label: 'Clients' },
    { path: ROUTES.MISSIONS, icon: '💼', label: 'Missions' },
    { path: ROUTES.CANDIDATES, icon: '👥', label: 'Candidats' },
    { path: ROUTES.PIPELINE, icon: '📋', label: 'Pipeline' },
    { path: '/app/calendar', icon: '📅', label: 'Agenda' },
    { path: '/app/tasks', icon: '✅', label: 'Tâches' },
    { path: ROUTES.CVTHEQUE, icon: '🔍', label: 'CVthèque' },
    { path: '/app/team', icon: '👨‍👩‍👧‍👦', label: 'Équipe' },
    { path: '/app/history', icon: '🕒', label: 'Historique' },
    { path: '/app/admin', icon: '⚙️', label: 'Admin' },
  ];

  const sidebarStyles = {
    width: '280px',
    height: '100vh',
    background: 'linear-gradient(180deg, #1F2937 0%, #111827 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 100,
  };

  const logoStyles = {
    padding: '32px 24px',
    fontSize: '24px',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  };

  const menuContainerStyles = {
    flex: 1,
    padding: '24px 16px',
    overflowY: 'auto',
  };

  const menuItemStyles = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    marginBottom: '8px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: isActive ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
    border: isActive ? '2px solid #667EEA' : '2px solid transparent',
    fontWeight: isActive ? '800' : '600',
  });

  const iconStyles = {
    fontSize: '24px',
  };

  const footerStyles = {
    padding: '24px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  };

  const logoutButtonStyles = {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '800',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LANDING);
  };

  return (
    <div style={sidebarStyles}>
      <div style={logoStyles}>✨ ATS Ultimate</div>

      <div style={menuContainerStyles}>
        {menuItems.map((item) => (
          <div
            key={item.path}
            style={menuItemStyles(location.pathname === item.path)}
            onClick={() => navigate(item.path)}
            onMouseEnter={(e) => {
              if (location.pathname !== item.path) {
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== item.path) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <span style={iconStyles}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div style={footerStyles}>
        <button style={logoutButtonStyles} onClick={handleLogout}>
          🚪 Déconnexion
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
