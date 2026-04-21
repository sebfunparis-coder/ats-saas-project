/**
 * useAnalytics Hook - React Hook for Google Analytics tracking
 */

import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import * as analytics from '@/core/utils/analytics';

/**
 * Hook pour tracking analytics dans les composants React
 * @returns {object} Analytics tracking functions
 */
export function useAnalytics() {
  const location = useLocation();

  // Track page view on route change
  useEffect(() => {
    const pageTitle = document.title;
    analytics.trackPageView(location.pathname, pageTitle);
  }, [location]);

  // Wrap analytics functions with useCallback for stability
  const trackEvent = useCallback((eventName, params) => {
    analytics.trackEvent(eventName, params);
  }, []);

  const trackButtonClick = useCallback((buttonName, locationStr) => {
    analytics.trackButtonClick(buttonName, locationStr);
  }, []);

  const trackCTAClick = useCallback((ctaText, destination) => {
    analytics.trackCTAClick(ctaText, destination);
  }, []);

  const trackFormSubmit = useCallback((formName, success) => {
    analytics.trackFormSubmit(formName, success);
  }, []);

  const trackNewsletterSignup = useCallback((locationStr) => {
    analytics.trackNewsletterSignup(locationStr);
  }, []);

  const trackSearch = useCallback((searchTerm, resultsCount, searchType) => {
    analytics.trackSearch(searchTerm, resultsCount, searchType);
  }, []);

  const trackFilter = useCallback((filterType, filterValue, locationStr) => {
    analytics.trackFilter(filterType, filterValue, locationStr);
  }, []);

  const trackPricingToggle = useCallback((isYearly) => {
    analytics.trackPricingToggle(isYearly);
  }, []);

  const trackPlanSelect = useCallback((planName, price, billingPeriod) => {
    analytics.trackPlanSelect(planName, price, billingPeriod);
  }, []);

  const trackTrialStart = useCallback((planName, locationStr) => {
    analytics.trackTrialStart(planName, locationStr);
  }, []);

  const trackArticleView = useCallback((articleTitle, category, author) => {
    analytics.trackArticleView(articleTitle, category, author);
  }, []);

  const trackCaseStudyView = useCallback((companyName, sector) => {
    analytics.trackCaseStudyView(companyName, sector);
  }, []);

  const trackIntegrationClick = useCallback((integrationName, category) => {
    analytics.trackIntegrationClick(integrationName, category);
  }, []);

  const trackFAQClick = useCallback((question, category) => {
    analytics.trackFAQClick(question, category);
  }, []);

  const trackDemoRequest = useCallback((source) => {
    analytics.trackDemoRequest(source);
  }, []);

  const trackContactSubmit = useCallback((reason) => {
    analytics.trackContactSubmit(reason);
  }, []);

  const trackDownload = useCallback((fileName, fileType) => {
    analytics.trackDownload(fileName, fileType);
  }, []);

  const trackVideoPlay = useCallback((videoTitle, locationStr) => {
    analytics.trackVideoPlay(videoTitle, locationStr);
  }, []);

  const trackOutboundLink = useCallback((url, linkText) => {
    analytics.trackOutboundLink(url, linkText);
  }, []);

  const trackSocialShare = useCallback((platform, contentType, contentId) => {
    analytics.trackSocialShare(platform, contentType, contentId);
  }, []);

  const trackScrollDepth = useCallback((percentage) => {
    analytics.trackScrollDepth(percentage);
  }, []);

  const trackError = useCallback((errorMessage, fatal) => {
    analytics.trackError(errorMessage, fatal);
  }, []);

  return {
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
    trackError,
  };
}

/**
 * Hook pour tracking scroll depth automatiquement
 */
export function useScrollTracking() {
  useEffect(() => {
    const trackedDepths = new Set();
    const depths = [25, 50, 75, 100];

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;

      depths.forEach(depth => {
        if (scrolled >= depth && !trackedDepths.has(depth)) {
          analytics.trackScrollDepth(depth);
          trackedDepths.add(depth);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

/**
 * Hook pour tracking engagement time
 * @param {string} pageName - Nom de la page
 */
export function useEngagementTracking(pageName) {
  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const endTime = Date.now();
      const timeSpent = Math.floor((endTime - startTime) / 1000);

      // Only track if user spent more than 5 seconds
      if (timeSpent > 5) {
        analytics.trackEngagementTime(pageName, timeSpent);
      }
    };
  }, [pageName]);
}

export default useAnalytics;
