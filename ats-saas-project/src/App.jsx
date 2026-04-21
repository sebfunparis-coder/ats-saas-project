import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/core/contexts/AuthContext';
import { DataProvider } from '@/core/contexts/DataContext';
import { UIProvider } from '@/core/contexts/UIContext';
import { FiltersProvider } from '@/core/contexts/FiltersContext';
import { NotificationsProvider } from '@/core/contexts/NotificationsContext';
import { ROUTES } from '@/config/routes';
import AppLayout from '@/shared/components/Layout/AppLayout';
import Toast from '@/shared/components/Feedback/Toast';

// Pages (lazy loading pour performance)
const LandingPage = React.lazy(() => import('@/features/landing/LandingPage'));
const FeaturesPage = React.lazy(() => import('@/features/landing/FeaturesPage'));
const PricingPage = React.lazy(() => import('@/features/landing/PricingPage'));
const LoginPage = React.lazy(() => import('@/features/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('@/features/auth/RegisterPage'));
const PlanSelectionPage = React.lazy(() => import('@/features/auth/PlanSelectionPage'));
const PaymentPage = React.lazy(() => import('@/features/auth/PaymentPage'));
const ConfirmationPage = React.lazy(() => import('@/features/auth/ConfirmationPage'));
const AdminLoginPage = React.lazy(() => import('@/features/superadmin/AdminLoginPage'));

// Pages pratiques
const FAQPage = React.lazy(() => import('@/features/legal/FAQPage'));
const IntegrationsPage = React.lazy(() => import('@/features/pages/IntegrationsPage'));
const BlogPage = React.lazy(() => import('@/features/pages/BlogPage'));
const CaseStudiesPage = React.lazy(() => import('@/features/pages/CaseStudiesPage'));
const DemoPage = React.lazy(() => import('@/features/pages/DemoPage'));
const AProposPage = React.lazy(() => import('@/features/pages/APropos'));
const ContactPage = React.lazy(() => import('@/features/pages/Contact'));
const AidePage = React.lazy(() => import('@/features/pages/Aide'));

// Pages légales
const MentionsLegalesPage = React.lazy(() => import('@/features/legal/MentionsLegales'));
const PolitiqueConfidentialitePage = React.lazy(() => import('@/features/legal/PolitiqueConfidentialite'));
const CGUPage = React.lazy(() => import('@/features/legal/CGU'));
const PolitiqueCookiesPage = React.lazy(() => import('@/features/legal/PolitiqueCookies'));

// Pages app
const MissionsPage = React.lazy(() => import('@/features/missions/MissionsPage'));
const CandidatesPage = React.lazy(() => import('@/features/candidates/CandidatesPage'));
const PipelinePage = React.lazy(() => import('@/features/pipeline/PipelinePage'));
const CVThequePage = React.lazy(() => import('@/features/cvtheque/CVThequePage'));
const ClientsPage = React.lazy(() => import('@/features/clients/ClientsPage'));
const CalendarPage = React.lazy(() => import('@/features/calendar/CalendarPage'));
const TeamPage = React.lazy(() => import('@/features/team/TeamPage'));
const TasksPage = React.lazy(() => import('@/features/tasks/TasksPage'));
const HistoryPage = React.lazy(() => import('@/features/pages/HistoryPage'));
const AdminPage = React.lazy(() => import('@/features/admin/AdminPage'));
const SuperAdminPage = React.lazy(() => import('@/features/superadmin/SuperAdminPageFunctional'));
const DashboardPage = React.lazy(() => import('@/features/dashboard/DashboardPage'));

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
    path: '/superadmin',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <SuperAdminPage />
      </React.Suspense>
    ),
  },
]);

/**
 * App Component
 * Point d'entrée principal avec tous les Providers
 */
function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <DataProvider>
          <UIProvider>
            <FiltersProvider>
              <Toast />
              <RouterProvider router={router} />
            </FiltersProvider>
          </UIProvider>
        </DataProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;
