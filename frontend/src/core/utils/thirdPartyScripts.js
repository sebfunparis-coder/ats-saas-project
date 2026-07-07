/**
 * Intégrations marketing tierces — T-294 (Crisp), T-296 (GA4), T-297 (LinkedIn/Meta).
 *
 * Toutes les intégrations sont conditionnelles au consentement cookies (T-222)
 * et à la présence des variables d'environnement correspondantes.
 *
 * Variables d'environnement requises (.env de production) :
 *   VITE_CRISP_WEBSITE_ID   — Crisp.chat (chat live, gratuit jusqu'à 2 agents)
 *   VITE_GA_MEASUREMENT_ID  — Google Analytics 4
 *   VITE_LINKEDIN_PARTNER_ID — LinkedIn Insight Tag (remarketing B2B)
 *   VITE_META_PIXEL_ID      — Meta Pixel (Facebook/Instagram)
 */

import { hasAnalyticsConsent, hasMarketingConsent } from './cookieConsent';

/**
 * T-294 — Chat live Crisp
 * Gratuit jusqu'à 2 agents : https://crisp.chat
 * Chargé sans gate de consentement (service fonctionnel, pas publicitaire).
 */
export function initCrisp() {
  const websiteId = import.meta.env.VITE_CRISP_WEBSITE_ID;
  if (!websiteId || typeof window === 'undefined') return;
  if (window.$crisp) return;

  window.$crisp = [];
  window.CRISP_WEBSITE_ID = websiteId;

  const script = document.createElement('script');
  script.src = 'https://client.crisp.chat/l.js';
  script.async = true;
  document.head.appendChild(script);
}

/**
 * T-297 — LinkedIn Insight Tag (B2B remarketing)
 * Conditionnel au consentement marketing (T-222).
 */
export function initLinkedInInsightTag() {
  const partnerId = import.meta.env.VITE_LINKEDIN_PARTNER_ID;
  if (!partnerId || typeof window === 'undefined') return;
  if (!hasMarketingConsent()) return;
  if (window._linkedin_data_partner_ids) return;

  window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
  window._linkedin_data_partner_ids.push(partnerId);

  const s = document.getElementsByTagName('script')[0];
  const b = document.createElement('script');
  b.type = 'text/javascript';
  b.async = true;
  b.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
  s.parentNode.insertBefore(b, s);
}

/**
 * T-297 — Meta Pixel (Facebook/Instagram)
 * Conditionnel au consentement marketing (T-222).
 */
export function initMetaPixel() {
  const pixelId = import.meta.env.VITE_META_PIXEL_ID;
  if (!pixelId || typeof window === 'undefined') return;
  if (!hasMarketingConsent()) return;
  if (window.fbq) return;

  /* eslint-disable */
  !function(f,b,e,v,n,t,s){
    if(f.fbq)return; n=f.fbq=function(){ n.callMethod ?
    n.callMethod.apply(n,arguments) : n.queue.push(arguments) };
    if(!f._fbq) f._fbq=n; n.push=n; n.loaded=!0; n.version='2.0';
    n.queue=[]; t=b.createElement(e); t.async=!0;
    t.src=v; s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)
  }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
}

/**
 * Initialise toutes les intégrations selon le consentement courant.
 * Appelé au chargement de l'app et après une mise à jour du consentement.
 */
export function initAllThirdParty() {
  initCrisp();
  if (hasAnalyticsConsent()) {
    // GA4 est géré par analytics.js + App.jsx (déjà branché T-222)
  }
  if (hasMarketingConsent()) {
    initLinkedInInsightTag();
    initMetaPixel();
  }
}
