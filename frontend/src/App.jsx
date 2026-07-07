import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/core/lib/queryClient';
import { AuthProvider } from '@/core/contexts/AuthContext';
import { ConfirmProvider } from '@/core/contexts/ConfirmContext';
import { DataProvider } from '@/core/contexts/DataContext';
import { UIProvider } from '@/core/contexts/UIContext';
import { FiltersProvider } from '@/core/contexts/FiltersContext';
import { NotificationsProvider } from '@/core/contexts/NotificationsContext';
import { ROUTES } from '@/config/routes';
import AppLayout from '@/shared/components/Layout/AppLayout';
import Toast from '@/shared/components/Feedback/Toast';
import CookieConsentBanner from '@/shared/components/CookieConsent/CookieConsentBanner';
import { initGA4 } from '@/core/utils/analytics';
import { hasAnalyticsConsent, COOKIE_CONSENT_UPDATED_EVENT } from '@/core/utils/cookieConsent';
import { initAllThirdParty, initLinkedInInsightTag, initMetaPixel } from '@/core/utils/thirdPartyScripts';

// Pages (lazy loading pour performance)
const LandingPage = React.lazy(() => import('@/features/landing/LandingPage'));
const FeaturesPage = React.lazy(() => import('@/features/landing/FeaturesPage'));
const PricingPage = React.lazy(() => import('@/features/landing/PricingPage'));
const LoginPage = React.lazy(() => import('@/features/auth/LoginPage'));
const ResendVerificationPage = React.lazy(() => import('@/features/auth/ResendVerificationPage'));
const MfaChallengePage = React.lazy(() => import('@/features/auth/MfaChallengePage'));
const RegisterPage = React.lazy(() => import('@/features/auth/RegisterPage'));
const PlanSelectionPage = React.lazy(() => import('@/features/auth/PlanSelectionPage'));
const PaymentPage = React.lazy(() => import('@/features/auth/PaymentPage'));
const ConfirmationPage = React.lazy(() => import('@/features/auth/ConfirmationPage'));
const AdminLoginPage = React.lazy(() => import('@/features/superadmin/AdminLoginPage'));

// Pages marketing (site vitrine public)
const FAQPage = React.lazy(() => import('@/features/legal/FAQPage'));
const IntegrationsPage = React.lazy(() => import('@/features/marketing/IntegrationsPage'));
const BlogPage = React.lazy(() => import('@/features/marketing/BlogPage'));
const CaseStudiesPage = React.lazy(() => import('@/features/marketing/CaseStudiesPage'));
const DemoPage = React.lazy(() => import('@/features/marketing/DemoPage'));
const AgencesInterimPage = React.lazy(() => import('@/features/marketing/AgencesInterimPage'));
const RHInternePage = React.lazy(() => import('@/features/marketing/RHInternePage'));
const CabinetsRecrutementPage = React.lazy(() => import('@/features/marketing/CabinetsRecrutementPage'));
const ComparatifPage = React.lazy(() => import('@/features/marketing/ComparatifPage'));
const AProposPage = React.lazy(() => import('@/features/marketing/APropos'));
const NousPage = React.lazy(() => import('@/features/marketing/Nous'));
const ContactPage = React.lazy(() => import('@/features/marketing/Contact'));
const AidePage = React.lazy(() => import('@/features/marketing/Aide'));

// Pages légales
const MentionsLegalesPage = React.lazy(() => import('@/features/legal/MentionsLegales'));
const PolitiqueConfidentialitePage = React.lazy(() => import('@/features/legal/PolitiqueConfidentialite'));
const CGUPage = React.lazy(() => import('@/features/legal/CGU'));
const PolitiqueCookiesPage = React.lazy(() => import('@/features/legal/PolitiqueCookies'));
const CGVPage = React.lazy(() => import('@/features/legal/CGVPage'));
const DPAPage = React.lazy(() => import('@/features/legal/DPAPage'));
const SLAPage = React.lazy(() => import('@/features/legal/SLAPage'));
const RegistreRGPD = React.lazy(() => import('@/features/legal/RegistreRGPD'));
const NonDiscriminationPage = React.lazy(() => import('@/features/legal/NonDiscriminationPage'));
const ChangelogPage = React.lazy(() => import('@/features/marketing/ChangelogPage'));
const StatusPage = React.lazy(() => import('@/features/marketing/StatusPage'));

// Pages app
const MissionsPage = React.lazy(() => import('@/features/missions/MissionsPage'));
const CandidatesPage = React.lazy(() => import('@/features/candidates/CandidatesPage'));
const PipelinePage = React.lazy(() => import('@/features/pipeline/PipelinePage'));
const CVThequePage = React.lazy(() => import('@/features/cvtheque/CVThequePage'));
const ClientsPage = React.lazy(() => import('@/features/clients/ClientsPage'));
const CalendarPage = React.lazy(() => import('@/features/calendar/CalendarPage'));
const TeamPage = React.lazy(() => import('@/features/team/TeamPage'));
const TasksPage = React.lazy(() => import('@/features/tasks/TasksPage'));
const HistoryPage = React.lazy(() => import('@/features/history/HistoryPage'));
const AdminPage = React.lazy(() => import('@/features/admin/AdminPage'));
const SuperAdminPage = React.lazy(() => import('@/features/superadmin/SuperAdminPageFunctional'));
const DashboardPage = React.lazy(() => import('@/features/dashboard/DashboardPage'));
const AnalyticsPage = React.lazy(() => import('@/features/analytics/AnalyticsPage'));
const CareersPage = React.lazy(() => import('@/features/careers/CareersPage'));
const JobDetailPage = React.lazy(() => import('@/features/careers/JobDetailPage'));
const TrackingPage = React.lazy(() => import('@/features/tracking/TrackingPage'));
const EmailImportPage = React.lazy(() => import('@/features/candidates/EmailImportPage'));
const RGPDPage = React.lazy(() => import('@/features/admin/RGPDPage'));
const JobSharePage = React.lazy(() => import('@/features/missions/JobSharePage'));
const SharedCandidatePage = React.lazy(() => import('@/features/careers/SharedCandidatePage'));
const SurveyPage = React.lazy(() => import('@/features/careers/SurveyPage'));
const InviteAcceptPage = React.lazy(() => import('@/features/team/InviteAcceptPage'));
const AvailabilityPage = React.lazy(() => import('@/features/calendar/AvailabilityPage'));
const ClientPortalPage = React.lazy(() => import('@/features/clients/ClientPortalPage'));

/**
 * Composant de chargement réutilisable
 */
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '24px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    color: 'white'
  }}>
    ✨ Chargement...
  </div>
);

/**
 * Router configuration
 * Toutes les routes de l'application sont définies ici
 */
const router = createBrowserRouter([
  {
    path: ROUTES.LANDING,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <LandingPage />
      </React.Suspense>
    ),
  },
  {
    path: '/features',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <FeaturesPage />
      </React.Suspense>
    ),
  },
  {
    path: '/pricing',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <PricingPage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.INTEGRATIONS,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <IntegrationsPage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.BLOG,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <BlogPage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.CASE_STUDIES,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <CaseStudiesPage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.DEMO,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <DemoPage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.AGENCES_INTERIM,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <AgencesInterimPage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.RH_INTERNE,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <RHInternePage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.CABINETS_RECRUTEMENT,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <CabinetsRecrutementPage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.COMPARATIF,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <ComparatifPage />
      </React.Suspense>
    ),
  },
  // Pages pratiques
  {
    path: ROUTES.FAQ,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <FAQPage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.A_PROPOS,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <AProposPage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.NOUS,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <NousPage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.CONTACT,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <ContactPage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.AIDE,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <AidePage />
      </React.Suspense>
    ),
  },
  // Pages légales
  {
    path: ROUTES.MENTIONS_LEGALES,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <MentionsLegalesPage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.POLITIQUE_CONFIDENTIALITE,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <PolitiqueConfidentialitePage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.CGU,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <CGUPage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.POLITIQUE_COOKIES,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <PolitiqueCookiesPage />
      </React.Suspense>
    ),
  },
  { path: ROUTES.CGV, element: <React.Suspense fallback={<LoadingFallback />}><CGVPage /></React.Suspense> },
  { path: ROUTES.DPA, element: <React.Suspense fallback={<LoadingFallback />}><DPAPage /></React.Suspense> },
  { path: ROUTES.SLA, element: <React.Suspense fallback={<LoadingFallback />}><SLAPage /></React.Suspense> },
  { path: ROUTES.REGISTRE_RGPD, element: <React.Suspense fallback={<LoadingFallback />}><RegistreRGPD /></React.Suspense> },
  { path: ROUTES.NON_DISCRIMINATION, element: <React.Suspense fallback={<LoadingFallback />}><NonDiscriminationPage /></React.Suspense> },
  { path: ROUTES.CHANGELOG, element: <React.Suspense fallback={<LoadingFallback />}><ChangelogPage /></React.Suspense> },
  { path: ROUTES.STATUS, element: <React.Suspense fallback={<LoadingFallback />}><StatusPage /></React.Suspense> },
  {
    path: '/admin-login',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <AdminLoginPage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.LOGIN,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <LoginPage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.RESEND_VERIFICATION,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <ResendVerificationPage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.MFA_CHALLENGE,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <MfaChallengePage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.REGISTER,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <RegisterPage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.REGISTER_PLAN,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <PlanSelectionPage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.REGISTER_PAYMENT,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <PaymentPage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.REGISTER_CONFIRM,
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <ConfirmationPage />
      </React.Suspense>
    ),
  },
  {
    path: ROUTES.DASHBOARD,
    element: (
      <AppLayout>
        <React.Suspense fallback={<LoadingFallback />}>
          <DashboardPage />
        </React.Suspense>
      </AppLayout>
    ),
  },
  {
    path: ROUTES.MISSIONS,
    element: (
      <AppLayout>
        <React.Suspense fallback={<LoadingFallback />}>
          <MissionsPage />
        </React.Suspense>
      </AppLayout>
    ),
  },
  {
    path: ROUTES.CANDIDATES,
    element: (
      <AppLayout>
        <React.Suspense fallback={<LoadingFallback />}>
          <CandidatesPage />
        </React.Suspense>
      </AppLayout>
    ),
  },
  {
    path: ROUTES.PIPELINE,
    element: (
      <AppLayout>
        <React.Suspense fallback={<LoadingFallback />}>
          <PipelinePage />
        </React.Suspense>
      </AppLayout>
    ),
  },
  {
    path: ROUTES.CVTHEQUE,
    element: (
      <AppLayout>
        <React.Suspense fallback={<LoadingFallback />}>
          <CVThequePage />
        </React.Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/app/clients',
    element: (
      <AppLayout>
        <React.Suspense fallback={<LoadingFallback />}>
          <ClientsPage />
        </React.Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/app/calendar',
    element: (
      <AppLayout>
        <React.Suspense fallback={<LoadingFallback />}>
          <CalendarPage />
        </React.Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/app/team',
    element: (
      <AppLayout>
        <React.Suspense fallback={<LoadingFallback />}>
          <TeamPage />
        </React.Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/app/tasks',
    element: (
      <AppLayout>
        <React.Suspense fallback={<LoadingFallback />}>
          <TasksPage />
        </React.Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/app/history',
    element: (
      <AppLayout>
        <React.Suspense fallback={<LoadingFallback />}>
          <HistoryPage />
        </React.Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/app/admin',
    element: (
      <AppLayout>
        <React.Suspense fallback={<LoadingFallback />}>
          <AdminPage />
        </React.Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/app/analytics',
    element: (
      <AppLayout>
        <React.Suspense fallback={<LoadingFallback />}>
          <AnalyticsPage />
        </React.Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/jobs/:id',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <JobSharePage />
      </React.Suspense>
    ),
  },
  {
    path: '/app/rgpd',
    element: (
      <AppLayout>
        <React.Suspense fallback={<LoadingFallback />}>
          <RGPDPage />
        </React.Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/app/candidates/email-import',
    element: (
      <AppLayout>
        <React.Suspense fallback={<LoadingFallback />}>
          <EmailImportPage />
        </React.Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/track/:token',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <TrackingPage />
      </React.Suspense>
    ),
  },
  {
    path: '/client-portal/:token',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <ClientPortalPage />
      </React.Suspense>
    ),
  },
  {
    path: '/availability/:token',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <AvailabilityPage />
      </React.Suspense>
    ),
  },
  {
    path: '/careers/:slug',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <CareersPage />
      </React.Suspense>
    ),
  },
  {
    path: '/careers/:slug/job/:jobId',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <JobDetailPage />
      </React.Suspense>
    ),
  },
  {
    path: '/share/:token',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <SharedCandidatePage />
      </React.Suspense>
    ),
  },
  {
    // T-337 : route manquante — le lien "Envoyer questionnaire satisfaction"
    // pointait vers /survey/:token sans qu'aucune route ne l'accueille (404 garanti).
    path: '/survey/:token',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <SurveyPage />
      </React.Suspense>
    ),
  },
  {
    // T-336 : route manquante — le lien "Inviter un équipier" (AdminPage) pointait
    // vers /invite/:token sans qu'aucune route ne l'accueille (404 garanti).
    path: '/invite/:token',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <InviteAcceptPage />
      </React.Suspense>
    ),
  },
  {
    path: '/superadmin',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <SuperAdminPage />
      </React.Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'linear-gradient(135deg, #667EEA15 0%, #764BA215 100%)',
        fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '40px',
      }}>
        <div style={{ fontSize: '80px', marginBottom: '24px' }}>🔍</div>
        <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#1F2937', marginBottom: '12px' }}>404</h1>
        <p style={{ fontSize: '20px', color: '#6B7280', marginBottom: '32px' }}>
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <a href="/" style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '15px' }}>
            Retour à l&apos;accueil
          </a>
          <a href="/app/dashboard" style={{ padding: '14px 28px', background: 'white', color: '#667EEA', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '15px', border: '2px solid #667EEA' }}>
            Dashboard
          </a>
        </div>
      </div>
    ),
  },
]);

// Les routes sont un tableau plat (pas de layout racine partagé), donc pas de
// <ScrollRestoration /> possible via un élément de route commun. On s'abonne
// directement au router : à chaque navigation vers une nouvelle page, on
// remonte en haut (sinon la page suivante hérite du scroll de la précédente).
let lastPathname = window.location.pathname;
router.subscribe((state) => {
  if (state.location.pathname !== lastPathname) {
    lastPathname = state.location.pathname;
    window.scrollTo(0, 0);
  }
});

/**
 * App Component
 * Point d'entrée principal avec tous les Providers
 */
function App() {
  // T-222 — Init GA4 uniquement si consentement déjà donné, et dès qu'il l'est en live.
  React.useEffect(() => {
    // T-294/296/297 — Init Crisp (sans gate), GA4 + pixels marketing (sous consentement)
    initAllThirdParty();
    if (hasAnalyticsConsent()) initGA4();

    const onConsentUpdated = () => {
      if (hasAnalyticsConsent()) initGA4();
      initLinkedInInsightTag();
      initMetaPixel();
    };
    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdated);
    return () => window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdated);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationsProvider>
          <ConfirmProvider>
            <DataProvider>
              <UIProvider>
                <FiltersProvider>
                  <Toast />
                  <CookieConsentBanner />
                  <RouterProvider router={router} />
                </FiltersProvider>
              </UIProvider>
            </DataProvider>
          </ConfirmProvider>
        </NotificationsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
