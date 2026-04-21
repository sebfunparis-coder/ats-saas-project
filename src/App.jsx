/**
 * 🚀 App Component
 *
 * Point d'entrée principal de l'application avec routing
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, DataProvider, UIProvider, FiltersProvider } from '@/core/contexts';

// Pages
import { LandingPage } from '@/features/landing/LandingPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { MissionsPage } from '@/features/missions/MissionsPage';
import { CandidatesPage } from '@/features/candidates/CandidatesPage';
import { PipelinePage } from '@/features/pipeline/PipelinePage';
import { CVThequePage } from '@/features/cvtheque/CVThequePage';
import { CalendarPage } from '@/features/calendar/CalendarPage';
import { TeamPage } from '@/features/team/TeamPage';
import { ClientsPage } from '@/features/clients/ClientsPage';
import { AdminPage } from '@/features/admin/AdminPage';
import { SuperAdminPage } from '@/features/superadmin/SuperAdminPage';

// Layout
import { AppLayout } from '@/shared/components';

// Protected Route Component
import { ProtectedRoute } from './features/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <UIProvider>
            <FiltersProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<LoginPage />} />

                {/* Protected App Routes */}
                <Route
                  path="/app/*"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Routes>
                          <Route index element={<Navigate to="/app/dashboard" replace />} />
                          <Route path="dashboard" element={<DashboardPage />} />

                          {/* Missions */}
                          <Route path="missions" element={<MissionsPage />} />
                          {/* Candidates */}
                          <Route path="candidates" element={<CandidatesPage />} />
                          {/* CVtheque */}
                          <Route path="cvtheque" element={<CVThequePage />} />
                          {/* Pipeline */}
                          <Route path="pipeline" element={<PipelinePage />} />
                          {/* Calendar */}
                          <Route path="calendar" element={<CalendarPage />} />
                          {/* Team */}
                          <Route path="team" element={<TeamPage />} />
                          {/* Clients */}
                          <Route path="clients" element={<ClientsPage />} />
                          {/* Admin */}
                          <Route path="admin" element={<AdminPage />} />
                          {/* SuperAdmin */}
                          <Route path="superadmin" element={<SuperAdminPage />} />
                        </Routes>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </FiltersProvider>
          </UIProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

/**
 * Placeholder Page Component
 */
const PlaceholderPage = ({ title }) => {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600 mb-8">Cette page est en cours de développement</p>
      <div className="text-6xl mb-4">🚧</div>
      <p className="text-sm text-gray-500">
        Les fonctionnalités de cette section seront bientôt disponibles
      </p>
    </div>
  );
};

/**
 * 404 Not Found Page
 */
const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <p className="text-2xl text-gray-600 mb-8">Page non trouvée</p>
        <a href="/" className="text-blue-600 hover:underline">
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
};

export default App;
