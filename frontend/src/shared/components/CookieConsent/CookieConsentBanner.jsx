import React, { useEffect, useState } from 'react';
import {
  getCookieConsent,
  saveCookieConsent,
  COOKIE_CONSENT_OPEN_EVENT,
} from '@/core/utils/cookieConsent';

/**
 * Bannière de consentement cookies (RGPD/CNIL).
 * - Affichée tant qu'aucun choix valide (< 13 mois) n'est enregistré.
 * - Réouvrable à tout moment via l'événement COOKIE_CONSENT_OPEN_EVENT
 *   (déclenché depuis le Footer et la page Politique Cookies).
 */
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    const existing = getCookieConsent();
    if (!existing) {
      setVisible(true);
    } else {
      setPrefs({ analytics: existing.analytics, marketing: existing.marketing });
    }

    const handleOpen = () => {
      const current = getCookieConsent();
      setPrefs({ analytics: current?.analytics || false, marketing: current?.marketing || false });
      setShowDetails(true);
      setVisible(true);
    };
    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, handleOpen);
  }, []);

  if (!visible) return null;

  const close = () => {
    setVisible(false);
    setShowDetails(false);
  };

  const acceptAll = () => {
    saveCookieConsent({ analytics: true, marketing: true });
    close();
  };

  const rejectAll = () => {
    saveCookieConsent({ analytics: false, marketing: false });
    close();
  };

  const savePrefs = () => {
    saveCookieConsent(prefs);
    close();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Préférences cookies"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        background: '#0F172A',
        color: 'white',
        borderTop: '2px solid rgba(255,255,255,0.1)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.4)',
        padding: '20px 24px',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 360px' }}>
            <div style={{ fontWeight: '800', fontSize: '15px', marginBottom: '6px' }}>
              🍪 Respect de votre vie privée
            </div>
            <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: '1.5' }}>
              Nous utilisons des cookies strictement nécessaires au fonctionnement du site, ainsi que des cookies
              analytiques et marketing optionnels (soumis à votre consentement). Vous pouvez accepter, refuser ou
              personnaliser votre choix à tout moment.{' '}
              <a href="/politique-cookies" style={{ color: '#60A5FA', textDecoration: 'underline' }}>
                En savoir plus
              </a>
            </div>

            {showDetails && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', opacity: 0.7 }}>
                  <input type="checkbox" checked disabled />
                  <span>
                    <strong>Nécessaires</strong> — session, authentification, sécurité (toujours actifs)
                  </span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={prefs.analytics}
                    onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
                  />
                  <span>
                    <strong>Analytiques</strong> — Google Analytics (mesure d'audience)
                  </span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={prefs.marketing}
                    onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
                  />
                  <span>
                    <strong>Marketing</strong> — remarketing publicitaire (Google Ads, Facebook Pixel)
                  </span>
                </label>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {!showDetails && (
              <button
                onClick={() => setShowDetails(true)}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                }}
              >
                Personnaliser
              </button>
            )}
            {showDetails && (
              <button
                onClick={savePrefs}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                }}
              >
                Enregistrer mes choix
              </button>
            )}
            <button
              onClick={rejectAll}
              style={{
                padding: '10px 16px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '13px',
              }}
            >
              Tout refuser
            </button>
            <button
              onClick={acceptAll}
              style={{
                padding: '10px 18px',
                // Lighthouse (2026-07-06) : #10B981 sur blanc ne passait pas le
                // contraste WCAG AA (~2.56:1, il faut 4.5:1 pour du texte de
                // cette taille) — vert plus foncé, même teinte, ratio ~5.5:1.
                background: '#047857',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '800',
                fontSize: '13px',
              }}
            >
              Tout accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieConsentBanner;
