import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/core/contexts/AuthContext';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import { usePlanAccess } from '@/core/hooks/usePlanAccess';

/**
 * Sidebar de navigation principale
 */
const getUISettings = () => {
  try { return JSON.parse(localStorage.getItem('ats_ui_settings') || '{}'); } catch { return {}; }
};

/**
 * @param {boolean} [mobileOpen] - Sidebar ouverte (drawer) sur mobile (T-254/T-255)
 * @param {Function} [onClose] - Fermeture du drawer (clic sur un lien ou overlay)
 */
export function Sidebar({ mobileOpen = false, onClose }) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { i18n, t } = useTranslation();
  const { canSeeTeamTab, canSeeAdmin, plan, isSolo, isManager, isEquipier, hasPermission } = usePlanAccess();

  const planLabel = isSolo ? 'Plan Solo'
    : plan === 'team_3' ? 'Manager · 3 postes'
    : plan === 'team_6' ? 'Manager · 6 postes'
    : isManager ? 'Plan Manager'
    : isEquipier ? 'Équipier'
    : 'Aucun plan';
  const planColor = isSolo ? '#10B981' : isManager ? '#667EEA' : isEquipier ? '#F59E0B' : '#9CA3AF';
  const [uiSettings, setUiSettings] = React.useState(getUISettings);

  React.useEffect(() => {
    const handler = () => setUiSettings(getUISettings());
    window.addEventListener('ats-ui-settings-changed', handler);
    return () => window.removeEventListener('ats-ui-settings-changed', handler);
  }, []);

  React.useEffect(() => {
    const appName = uiSettings.appName || 'ATS Ultimate';
    document.title = appName;
  }, [uiSettings.appName]);

  const accentColor = uiSettings.accentColor || '#667EEA';

  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'fr';
  const toggleLang = () => i18n.changeLanguage(currentLang === 'fr' ? 'en' : 'fr');

  const menuItems = [
    { path: ROUTES.DASHBOARD,   icon: '📊', label: t('nav.dashboard'), permKey: 'dashboard' },
    { path: '/app/clients',     icon: '🏢', label: t('nav.clients'), permKey: 'clients' },
    { path: ROUTES.MISSIONS,    icon: '💼', label: t('nav.missions'), permKey: 'missions' },
    { path: ROUTES.CANDIDATES,  icon: '👥', label: t('nav.candidates'), permKey: 'candidates' },
    { path: ROUTES.PIPELINE,    icon: '📋', label: t('nav.pipeline'), permKey: 'pipeline' },
    { path: '/app/calendar',    icon: '📅', label: t('nav.calendar'), permKey: 'calendar' },
    { path: '/app/tasks',       icon: '✅', label: t('nav.tasks') },
    { path: ROUTES.CVTHEQUE,    icon: '🔍', label: t('nav.cvtheque'), permKey: 'cvtheque' },
    { path: '/app/analytics',   icon: '📈', label: t('nav.analytics') },
    // Onglet Équipe — visible uniquement pour les plans Manager (pas Solo)
    ...(canSeeTeamTab ? [{ path: '/app/team', icon: '👨‍👩‍👧‍👦', label: t('nav.team') }] : []),
    { path: '/app/history',     icon: '🕒', label: t('nav.history') },
    // Administration — visible uniquement pour les propriétaires/admins (pas équipiers)
    ...(canSeeAdmin ? [{ path: '/app/admin', icon: '⚙️', label: t('nav.admin') }] : []),
  // T-356 : un item avec permKey n'est affiché que si le membre (équipier) a la
  // permission correspondante — sans effet pour Owner/Manager/SuperAdmin, jamais
  // restreints par ce mécanisme (hasPermission() retourne toujours true pour eux).
  ].filter((item) => !item.permKey || hasPermission(item.permKey));

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
    zIndex: 1100,
    transform: isMobile ? `translateX(${mobileOpen ? '0' : '-100%'})` : 'none',
    transition: 'transform 0.25s ease',
    boxShadow: isMobile && mobileOpen ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
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
    background: isActive ? accentColor + '30' : 'transparent',
    border: isActive ? '2px solid ' + accentColor : '2px solid transparent',
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
    <div style={sidebarStyles} role="navigation" aria-label="Navigation principale" aria-hidden={isMobile && !mobileOpen}>
      <div style={{ ...logoStyles, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {uiSettings.companyLogo ? (
          <img
            src={uiSettings.companyLogo}
            alt="Logo"
            style={{ maxHeight: '44px', maxWidth: '220px', objectFit: 'contain', display: 'block' }}
          />
        ) : (
          <span style={{ background: 'linear-gradient(135deg, ' + accentColor + ' 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ✨ {uiSettings.appName || 'ATS Ultimate'}
          </span>
        )}
        {isMobile && (
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', width: '44px', height: '44px', borderRadius: '10px', cursor: 'pointer', fontSize: '18px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        )}
      </div>

      <div style={menuContainerStyles}>
        {menuItems.map((item) => (
          <div
            key={item.path}
            style={menuItemStyles(location.pathname === item.path)}
            onClick={() => { navigate(item.path); if (isMobile && onClose) onClose(); }}
            onMouseEnter={(e) => {
              if (location.pathname !== item.path) {
                e.currentTarget.style.background = accentColor + '18';
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

      {/* Badge plan utilisateur */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 12px' }}>
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: planColor, flexShrink: 0 }} />
            <span style={{ fontSize: '11px', fontWeight: '700', color: planColor }}>{planLabel}</span>
          </div>
        </div>
      </div>

      <div style={footerStyles}>
        <button
          onClick={toggleLang}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            background: 'rgba(255,255,255,0.08)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          🌐 {currentLang === 'fr' ? 'FR → EN' : 'EN → FR'}
        </button>
        <button style={logoutButtonStyles} onClick={handleLogout}>
          🚪 Déconnexion
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
