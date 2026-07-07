/**
 * Google Analytics Configuration
 *
 * Pour activer Google Analytics :
 * 1. Créer un compte GA4 sur https://analytics.google.com
 * 2. Créer une propriété GA4
 * 3. Obtenir le Measurement ID (format : G-XXXXXXXXXX)
 * 4. Remplacer MEASUREMENT_ID ci-dessous
 * 5. Décommenter ENABLED: true
 */

// T-296 — GA4 configuré via VITE_GA_MEASUREMENT_ID (ajouter dans .env de production)
export const ANALYTICS_CONFIG = {
  MEASUREMENT_ID: import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX',
  ENABLED: !!import.meta.env.VITE_GA_MEASUREMENT_ID,
  DEBUG: import.meta.env.DEV,

  // Tracking automatique
  AUTO_TRACK: {
    pageViews: true,        // Track page views automatiquement
    scrollDepth: true,      // Track scroll depth (25%, 50%, 75%, 100%)
    engagementTime: true,   // Track temps passé sur page
    outboundLinks: true,    // Track clicks sur liens externes
  },

  // Événements personnalisés à tracker
  EVENTS: {
    // Pricing
    PRICING_TOGGLE: 'pricing_toggle',
    PLAN_SELECT: 'select_item',
    TRIAL_START: 'begin_trial',

    // Content
    ARTICLE_VIEW: 'article_view',
    CASE_STUDY_VIEW: 'case_study_view',
    INTEGRATION_CLICK: 'integration_click',
    FAQ_CLICK: 'faq_click',

    // Actions
    CTA_CLICK: 'cta_click',
    BUTTON_CLICK: 'button_click',
    SEARCH: 'search',
    FILTER_USED: 'filter_used',

    // Conversions
    NEWSLETTER_SIGNUP: 'newsletter_signup',
    DEMO_REQUEST: 'demo_request',
    CONTACT_SUBMIT: 'contact_submit',
    FORM_SUBMIT: 'form_submit',

    // Media
    VIDEO_PLAY: 'video_play',
    FILE_DOWNLOAD: 'file_download',

    // Social
    SOCIAL_SHARE: 'share',

    // Errors
    ERROR: 'exception',
  },

  // Conversion IDs (optionnel - pour Google Ads)
  CONVERSIONS: {
    TRIAL_SIGNUP: 'AW-XXXXXXXXX/XXXXXXXXX', // TODO: Remplacer si Google Ads
    DEMO_REQUEST: 'AW-XXXXXXXXX/XXXXXXXXX',
    PURCHASE: 'AW-XXXXXXXXX/XXXXXXXXX',
  },
};

/**
 * Vérifie si analytics est activé
 */
export function isAnalyticsEnabled() {
  return ANALYTICS_CONFIG.ENABLED && ANALYTICS_CONFIG.MEASUREMENT_ID !== 'G-XXXXXXXXXX';
}

/**
 * Vérifie si debug mode est activé
 */
export function isDebugMode() {
  return ANALYTICS_CONFIG.DEBUG;
}

export default ANALYTICS_CONFIG;
