/**
 * Gestion du consentement cookies (RGPD / CNIL)
 * Persistance localStorage, durée de validité 13 mois (395 jours).
 */

const CONSENT_KEY = 'ats_cookie_consent';
const CONSENT_MAX_AGE_MS = 395 * 24 * 60 * 60 * 1000; // 13 mois

export const COOKIE_CONSENT_UPDATED_EVENT = 'ats:cookie-consent-updated';
export const COOKIE_CONSENT_OPEN_EVENT = 'ats:cookie-consent-open';

/**
 * Lit le consentement stocké. Retourne null si absent, corrompu ou expiré (> 13 mois).
 */
export function getCookieConsent() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.timestamp) return null;
    const age = Date.now() - new Date(parsed.timestamp).getTime();
    if (age > CONSENT_MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Enregistre le choix de l'utilisateur et notifie les listeners (gate GA4, etc.)
 * @param {{ analytics: boolean, marketing: boolean }} categories
 */
export function saveCookieConsent({ analytics = false, marketing = false } = {}) {
  const consent = {
    necessary: true,
    analytics: !!analytics,
    marketing: !!marketing,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, { detail: consent }));
  }
  return consent;
}

export function hasAnalyticsConsent() {
  return getCookieConsent()?.analytics === true;
}

export function hasMarketingConsent() {
  return getCookieConsent()?.marketing === true;
}

/**
 * Rouvre le centre de préférences (déclenché depuis le Footer ou la page Politique Cookies).
 */
export function openCookiePreferences() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT));
}
