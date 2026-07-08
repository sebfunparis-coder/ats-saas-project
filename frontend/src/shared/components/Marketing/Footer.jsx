import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { openCookiePreferences } from '@/core/utils/cookieConsent';
import { LinkedInIcon, XIcon, FacebookIcon, InstagramIcon } from './SocialIcons';
import styles from './Footer.module.css';

/**
 * Footer Marketing - Composant réutilisable pour toutes les pages publiques
 * Version responsive : 4 colonnes → 2 colonnes → 1 colonne
 *
 * @param {Object} props
 * @param {string} props.variant - Variante du footer ('dark' | 'light')
 */
export function Footer({ variant = 'dark' }) {
  const navigate = useNavigate();

  // T-433 : remplace les emojis approximatifs (🔵/🐦/📘/📸, sans rapport
  // visuel avec les vraies marques) par les logos officiels — 🐦 pour
  // "Twitter" était en plus visuellement obsolète depuis le rebranding en X
  // (2023). Liens toujours génériques (pages d'accueil des plateformes) tant
  // qu'aucun vrai compte n'existe pour ce projet.
  const socialLinks = [
    [<LinkedInIcon />, 'LinkedIn', 'https://linkedin.com'],
    [<XIcon />, 'X', 'https://x.com'],
    [<FacebookIcon />, 'Facebook', 'https://facebook.com'],
    [<InstagramIcon />, 'Instagram', 'https://instagram.com']
  ];

  const productLinks = [
    ['⚡ Fonctionnalités', ROUTES.FEATURES],
    ['💎 Tarifs', ROUTES.PRICING],
    ['🔌 Intégrations', '/integrations'],
    ['🚀 Nouveautés', '/changelog']
  ];

  const companyLinks = [
    ['👋 Nous', ROUTES.NOUS],
    ['🏢 À propos', ROUTES.A_PROPOS],
    ['📧 Contact', ROUTES.CONTACT],
    ['❓ FAQ', ROUTES.FAQ],
    ['📋 Changelog', ROUTES.CHANGELOG],
    ['🟢 Statut', ROUTES.STATUS],
    ['🆘 Centre d\'aide', ROUTES.AIDE],
    // T-427 : pointait vers /admin-login, une page dépréciée (T-317) qui
    // redirige INCONDITIONNELLEMENT vers /login — même un SuperAdmin déjà
    // connecté n'atteignait jamais /superadmin en cliquant ce lien. La garde
    // de la route /superadmin (SuperAdminPageFunctional.jsx, redirige vers
    // /login si !isSuperAdmin) suffit déjà comme protection ; pointer
    // directement dessus laisse un SuperAdmin déjà authentifié y accéder.
    ['⚙️ SuperAdmin', ROUTES.SUPERADMIN]
  ];

  const legalLinks = [
    ['📄 Mentions légales', ROUTES.MENTIONS_LEGALES],
    ['🔒 Confidentialité', ROUTES.POLITIQUE_CONFIDENTIALITE],
    ['📋 CGU', ROUTES.CGU],
    ['📑 CGV', ROUTES.CGV],
    ['🤝 DPA', ROUTES.DPA],
    ['⚡ SLA', ROUTES.SLA],
    ['🍪 Cookies', ROUTES.POLITIQUE_COOKIES],
    ['⚖️ Non-discrimination', ROUTES.NON_DISCRIMINATION],
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <footer className={`${styles.footer} ${styles[variant]}`}>
      <div className={styles.container}>
        <div className={styles.grid}>

          {/* Colonne 1 : À propos */}
          <div className={styles.logoSection}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>✨</div>
              <div className={styles.logoText}>ATS Ultimate</div>
            </div>
            <p className={styles.description}>
              La plateforme de recrutement #1 en France. Recrutez 10x plus vite grâce à l'intelligence artificielle.
            </p>
            <div className={styles.socialContainer}>
              {socialLinks.map(([icon, name, url], i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Suivez-nous sur ${name}`}
                  className={styles.socialIcon}
                  title={name}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Colonne 2 : Produit */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Produit</h3>
            <div className={styles.linksList}>
              {productLinks.map(([label, href], i) => (
                <a
                  key={i}
                  href={href}
                  onClick={(e) => handleLinkClick(e, href)}
                  className={styles.link}
                  aria-label={label}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Colonne 3 : Entreprise */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Entreprise</h3>
            <div className={styles.linksList}>
              {companyLinks.map(([label, href], i) => (
                <a
                  key={i}
                  href={href}
                  onClick={(e) => handleLinkClick(e, href)}
                  className={styles.link}
                  aria-label={label}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Colonne 4 : Légal */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Légal</h3>
            <div className={styles.linksList}>
              {legalLinks.map(([label, href], i) => (
                <a
                  key={i}
                  href={href}
                  onClick={(e) => handleLinkClick(e, href)}
                  className={styles.link}
                  aria-label={label}>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2026 ATS Ultimate. Tous droits réservés. Fait avec ❤️ en France
          </p>
          <div className={styles.legalLinks}>
            <a
              href={ROUTES.MENTIONS_LEGALES}
              onClick={(e) => handleLinkClick(e, ROUTES.MENTIONS_LEGALES)}
              className={styles.legalLink}>
              Mentions légales
            </a>
            <a
              href={ROUTES.POLITIQUE_CONFIDENTIALITE}
              onClick={(e) => handleLinkClick(e, ROUTES.POLITIQUE_CONFIDENTIALITE)}
              className={styles.legalLink}>
              Confidentialité
            </a>
            <a
              href={ROUTES.POLITIQUE_COOKIES}
              onClick={(e) => handleLinkClick(e, ROUTES.POLITIQUE_COOKIES)}
              className={styles.legalLink}>
              Cookies
            </a>
            <button
              type="button"
              onClick={openCookiePreferences}
              className={styles.legalLink}
              style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', padding: 0 }}>
              Gérer mes cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
