/**
 * Google Analytics 4 - Utility Functions
 * Event tracking, page views, conversions
 */

import { ANALYTICS_CONFIG, isAnalyticsEnabled } from '@/config/analytics';
import { hasAnalyticsConsent } from '@/core/utils/cookieConsent';

/**
 * Initialize Google Analytics 4
 * Reads MEASUREMENT_ID from config by default; accepts override for testing.
 * Bloqué tant que l'utilisateur n'a pas donné son consentement cookies (RGPD).
 * @param {string} [measurementId] - GA4 Measurement ID (defaults to config value)
 */
export function initGA4(measurementId = ANALYTICS_CONFIG.MEASUREMENT_ID) {
  if (!isAnalyticsEnabled() || typeof window === 'undefined' || !measurementId) return;
  if (!hasAnalyticsConsent()) return;
  if (window.gtag) return; // déjà initialisé

  // Load gtag.js script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', measurementId, {
    page_path: window.location.pathname,
    send_page_view: true,
  });

  console.log(`✅ Google Analytics 4 initialized: ${measurementId}`);
}

/**
 * Track page view
 * @param {string} path - Page path
 * @param {string} title - Page title
 */
export function trackPageView(path, title) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });

  console.log(`📊 Page view tracked: ${path}`);
}

/**
 * Track custom event
 * @param {string} eventName - Event name
 * @param {object} params - Event parameters
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', eventName, params);

  console.log(`📊 Event tracked: ${eventName}`, params);
}

/**
 * Track button click
 * @param {string} buttonName - Button identifier
 * @param {string} location - Where button was clicked
 */
export function trackButtonClick(buttonName, location = '') {
  trackEvent('button_click', {
    button_name: buttonName,
    location: location,
  });
}

/**
 * Track CTA click
 * @param {string} ctaText - CTA text
 * @param {string} destination - Where CTA leads
 */
export function trackCTAClick(ctaText, destination = '') {
  trackEvent('cta_click', {
    cta_text: ctaText,
    destination: destination,
  });
}

/**
 * Track form submission
 * @param {string} formName - Form identifier
 * @param {boolean} success - Submission success
 */
export function trackFormSubmit(formName, success = true) {
  trackEvent('form_submit', {
    form_name: formName,
    success: success,
  });
}

/**
 * Track newsletter signup
 * @param {string} location - Where signup occurred
 */
export function trackNewsletterSignup(location = 'blog') {
  trackEvent('newsletter_signup', {
    method: 'email',
    location: location,
  });
}

/**
 * Track search
 * @param {string} searchTerm - What user searched for
 * @param {number} resultsCount - Number of results
 * @param {string} searchType - Type of search (blog, integrations, etc.)
 */
export function trackSearch(searchTerm, resultsCount = 0, searchType = 'general') {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
    search_type: searchType,
  });
}

/**
 * Track filter usage
 * @param {string} filterType - Type of filter
 * @param {string} filterValue - Selected value
 * @param {string} location - Page where filter was used
 */
export function trackFilter(filterType, filterValue, location = '') {
  trackEvent('filter_used', {
    filter_type: filterType,
    filter_value: filterValue,
    location: location,
  });
}

/**
 * Track pricing toggle (monthly/yearly)
 * @param {boolean} isYearly - Is yearly selected
 */
export function trackPricingToggle(isYearly) {
  trackEvent('pricing_toggle', {
    billing_period: isYearly ? 'yearly' : 'monthly',
  });
}

/**
 * Track pricing plan selection
 * @param {string} planName - Plan name (Starter, Professional, etc.)
 * @param {number} price - Plan price
 * @param {string} billingPeriod - monthly or yearly
 */
export function trackPlanSelect(planName, price, billingPeriod = 'monthly') {
  trackEvent('select_item', {
    item_id: planName.toLowerCase(),
    item_name: planName,
    item_category: 'pricing_plan',
    price: price,
    currency: 'EUR',
    billing_period: billingPeriod,
  });
}

/**
 * Track "Démarrer maintenant" (inscription) clicks
 * @param {string} planName - Plan name
 * @param {string} location - Where clicked
 */
export function trackTrialStart(planName, location = '') {
  trackEvent('begin_trial', {
    plan_name: planName,
    location: location,
    trial_duration: '14_days',
  });
}

/**
 * Track blog article view
 * @param {string} articleTitle - Article title
 * @param {string} category - Article category
 * @param {string} author - Article author
 */
export function trackArticleView(articleTitle, category = '', author = '') {
  trackEvent('article_view', {
    article_title: articleTitle,
    article_category: category,
    article_author: author,
  });
}

/**
 * Track case study view
 * @param {string} companyName - Company name
 * @param {string} sector - Company sector
 */
export function trackCaseStudyView(companyName, sector = '') {
  trackEvent('case_study_view', {
    company_name: companyName,
    sector: sector,
  });
}

/**
 * Track integration view/click
 * @param {string} integrationName - Integration name
 * @param {string} category - Integration category
 */
export function trackIntegrationClick(integrationName, category = '') {
  trackEvent('integration_click', {
    integration_name: integrationName,
    integration_category: category,
  });
}

/**
 * Track FAQ interaction
 * @param {string} question - FAQ question
 * @param {string} category - FAQ category
 */
export function trackFAQClick(question, category = '') {
  trackEvent('faq_click', {
    question: question,
    category: category,
  });
}

/**
 * Track demo request
 * @param {string} source - Where demo was requested
 */
export function trackDemoRequest(source = '') {
  trackEvent('demo_request', {
    source: source,
  });
}

/**
 * Track contact form submission
 * @param {string} reason - Contact reason
 */
export function trackContactSubmit(reason = 'general') {
  trackEvent('contact_submit', {
    reason: reason,
  });
}

/**
 * Track file download
 * @param {string} fileName - File name
 * @param {string} fileType - File type (pdf, csv, etc.)
 */
export function trackDownload(fileName, fileType = '') {
  trackEvent('file_download', {
    file_name: fileName,
    file_type: fileType,
  });
}

/**
 * Track video play
 * @param {string} videoTitle - Video title
 * @param {string} location - Where video was played
 */
export function trackVideoPlay(videoTitle, location = '') {
  trackEvent('video_play', {
    video_title: videoTitle,
    location: location,
  });
}

/**
 * Track outbound link click
 * @param {string} url - External URL
 * @param {string} linkText - Link text
 */
export function trackOutboundLink(url, linkText = '') {
  trackEvent('click', {
    event_category: 'outbound',
    event_label: url,
    link_text: linkText,
  });
}

/**
 * Track social share
 * @param {string} platform - Social platform (twitter, linkedin, etc.)
 * @param {string} contentType - Type of content shared
 * @param {string} contentId - Content identifier
 */
export function trackSocialShare(platform, contentType = '', contentId = '') {
  trackEvent('share', {
    method: platform,
    content_type: contentType,
    item_id: contentId,
  });
}

/**
 * Track scroll depth
 * @param {number} percentage - Scroll percentage (25, 50, 75, 100)
 */
export function trackScrollDepth(percentage) {
  trackEvent('scroll', {
    percent_scrolled: percentage,
  });
}

/**
 * Track user engagement time
 * @param {string} pagePath - Page path
 * @param {number} timeSeconds - Time spent in seconds
 */
export function trackEngagementTime(pagePath, timeSeconds) {
  trackEvent('user_engagement', {
    engagement_time_msec: timeSeconds * 1000,
    page_path: pagePath,
  });
}

/**
 * Track error/exception
 * @param {string} errorMessage - Error description
 * @param {boolean} fatal - Is fatal error
 */
export function trackError(errorMessage, fatal = false) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'exception', {
    description: errorMessage,
    fatal: fatal,
  });
}

/**
 * Set user properties
 * @param {object} properties - User properties
 */
export function setUserProperties(properties = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('set', 'user_properties', properties);
}

/**
 * Track conversion
 * @param {string} conversionId - Conversion ID
 * @param {object} params - Conversion parameters
 */
export function trackConversion(conversionId, params = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'conversion', {
    send_to: conversionId,
    ...params,
  });
}

// Export all functions
export default {
  initGA4,
  trackPageView,
  trackEvent,
  trackButtonClick,
  trackCTAClick,
  trackFormSubmit,
  trackNewsletterSignup,
  trackSearch,
  trackFilter,
  trackPricingToggle,
  trackPlanSelect,
  trackTrialStart,
  trackArticleView,
  trackCaseStudyView,
  trackIntegrationClick,
  trackFAQClick,
  trackDemoRequest,
  trackContactSubmit,
  trackDownload,
  trackVideoPlay,
  trackOutboundLink,
  trackSocialShare,
  trackScrollDepth,
  trackEngagementTime,
  trackError,
  setUserProperties,
  trackConversion,
};
