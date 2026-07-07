import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config/routes';
import { LanguageSwitcher } from '@/shared/components/UI/LanguageSwitcher';
import styles from './Navbar.module.css';

/**
 * Navbar Marketing - Composant réutilisable pour toutes les pages publiques
 * Version responsive avec menu hamburger mobile
 *
 * @param {Object} props
 * @param {string} props.activePage - Page active pour highlight navigation
 */
export function Navbar({ activePage = 'landing' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Déterminer la page active automatiquement si non fournie
  const getCurrentPage = () => {
    if (activePage !== 'landing') return activePage;

    const path = location.pathname;
    if (path === ROUTES.FEATURES) return 'features';
    if (path === ROUTES.PRICING) return 'pricing';
    if (path === ROUTES.DEMO) return 'demo';
    if (path === ROUTES.NOUS) return 'nous';
    if (path.includes('/admin')) return 'admin';
    return 'landing';
  };

  const currentPage = getCurrentPage();

  const handleNavigation = (route) => {
    navigate(route);
    setMobileMenuOpen(false); // Fermer le menu mobile après navigation
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          {/* Logo */}
          {/* Lighthouse (2026-07-06) : aria-label="Retour à l'accueil" masquait le texte
              visible "ATS Ultimate" pour les lecteurs d'écran (WCAG 2.5.3 Label in Name) —
              l'accessible name se calcule désormais depuis le contenu visible. */}
          <div
            className={styles.logoContainer}
            onClick={() => handleNavigation(ROUTES.LANDING)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigation(ROUTES.LANDING)}>
            <div className={styles.logoIcon} aria-hidden="true">✨</div>
            <div className={styles.logoText}>ATS Ultimate</div>
          </div>

          {/* Hamburger Button (Mobile) */}
          <button
            className={`${styles.hamburger} ${mobileMenuOpen ? styles.open : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Menu de navigation"
            aria-expanded={mobileMenuOpen}>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>

          {/* Navigation Links */}
          <div className={`${styles.navLinks} ${mobileMenuOpen ? styles.open : ''}`}>
            <button
              onClick={() => handleNavigation(ROUTES.LANDING)}
              className={`${styles.navLink} ${currentPage === 'landing' ? styles.active : ''}`}
              aria-label={t('marketing.nav.home')}
              aria-current={currentPage === 'landing' ? 'page' : undefined}>
              🏠 {t('marketing.nav.home')}
            </button>

            <button
              onClick={() => handleNavigation(ROUTES.FEATURES)}
              className={`${styles.navLink} ${currentPage === 'features' ? styles.active : ''}`}
              aria-current={currentPage === 'features' ? 'page' : undefined}>
              ⚡ {t('marketing.nav.features')}
            </button>

            <button
              onClick={() => handleNavigation(ROUTES.PRICING)}
              className={`${styles.navLink} ${currentPage === 'pricing' ? styles.active : ''}`}
              aria-current={currentPage === 'pricing' ? 'page' : undefined}>
              💎 {t('marketing.nav.pricing')}
            </button>

            <button
              onClick={() => handleNavigation(ROUTES.DEMO)}
              className={`${styles.navLink} ${currentPage === 'demo' ? styles.active : ''}`}
              aria-current={currentPage === 'demo' ? 'page' : undefined}>
              🎮 {t('marketing.nav.demo')}
            </button>

            <button
              onClick={() => handleNavigation(ROUTES.NOUS)}
              className={`${styles.navLink} ${currentPage === 'nous' ? styles.active : ''}`}
              aria-current={currentPage === 'nous' ? 'page' : undefined}>
              👋 {t('marketing.nav.nous')}
            </button>

            <LanguageSwitcher style={{ color: 'inherit' }} />

            <button
              onClick={() => handleNavigation(ROUTES.LOGIN)}
              className={styles.loginButton}
              aria-label={t('marketing.nav.login')}>
              {t('marketing.nav.login')}
            </button>

            <button
              onClick={() => handleNavigation(ROUTES.REGISTER)}
              className={styles.ctaButton}
              aria-label={t('marketing.nav.start')}>
              {t('marketing.nav.start')} ✨
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay pour fermer le menu mobile en cliquant à l'extérieur */}
      <div
        className={`${styles.overlay} ${mobileMenuOpen ? styles.visible : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />
    </>
  );
}

export default Navbar;
