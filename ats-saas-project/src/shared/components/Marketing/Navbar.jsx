import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Déterminer la page active automatiquement si non fournie
  const getCurrentPage = () => {
    if (activePage !== 'landing') return activePage;

    const path = location.pathname;
    if (path === ROUTES.FEATURES) return 'features';
    if (path === ROUTES.PRICING) return 'pricing';
    if (path === ROUTES.DEMO) return 'demo';
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
          <div
            className={styles.logoContainer}
            onClick={() => handleNavigation(ROUTES.LANDING)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigation(ROUTES.LANDING)}
            aria-label="Retour à l'accueil">
            <div className={styles.logoIcon}>✨</div>
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
              aria-label="Accueil"
              aria-current={currentPage === 'landing' ? 'page' : undefined}>
              🏠 Accueil
            </button>

            <button
              onClick={() => handleNavigation(ROUTES.FEATURES)}
              className={`${styles.navLink} ${currentPage === 'features' ? styles.active : ''}`}
              aria-label="Fonctionnalités"
              aria-current={currentPage === 'features' ? 'page' : undefined}>
              ⚡ Features
            </button>

            <button
              onClick={() => handleNavigation(ROUTES.PRICING)}
              className={`${styles.navLink} ${currentPage === 'pricing' ? styles.active : ''}`}
              aria-label="Tarifs"
              aria-current={currentPage === 'pricing' ? 'page' : undefined}>
              💎 Tarifs
            </button>

            <button
              onClick={() => handleNavigation(ROUTES.DEMO)}
              className={`${styles.navLink} ${currentPage === 'demo' ? styles.active : ''}`}
              aria-label="Démo interactive"
              aria-current={currentPage === 'demo' ? 'page' : undefined}>
              🎮 Démo
            </button>

            <button
              onClick={() => handleNavigation(ROUTES.LOGIN)}
              className={styles.ctaButton}
              aria-label="Essayer gratuitement">
              Essayer ✨
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
