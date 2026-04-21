/**
 * 👑 SuperAdmin Page
 *
 * Gestion globale multi-tenant pour super administrateurs
 */

import React, { useState } from 'react';
import { useAuth, useData } from '@/core/contexts';
import { Card, Button } from '@/shared/components';
import { formatDate, formatNumber } from '@/core/utils/formatters';

export const SuperAdminPage = () => {
  const { user, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('companies');

  // Redirect if not superadmin
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
            <p className="text-gray-600">Seuls les super administrateurs peuvent accéder à cette page</p>
          </div>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'companies', label: '🏢 Entreprises', count: 24 },
    { id: 'users', label: '👥 Utilisateurs', count: 156 },
    { id: 'analytics', label: '📊 Analytiques', count: null },
    { id: 'system', label: '⚙️ Système', count: null }
  ];

  const mockCompanies = [
    { id: 1, name: 'TechCorp Solutions', plan: 'Pro', users: 12, status: 'active', createdAt: '2024-01-15' },
    { id: 2, name: 'Digital Innovations', plan: 'Enterprise', users: 45, status: 'active', createdAt: '2024-01-10' },
    { id: 3, name: 'StartUp Lab', plan: 'Starter', users: 3, status: 'trial', createdAt: '2024-02-01' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            👑 Super Administration
          </h1>
          <p className="text-gray-600">Gestion globale de la plateforme</p>
        </div>
        <div className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
          <span className="font-semibold">SuperAdmin</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-3xl font-bold text-blue-600">24</div>
          <div className="text-sm text-blue-900 mt-1">Entreprises</div>
        </Card>
        <Card className="text-center bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-3xl font-bold text-green-600">156</div>
          <div className="text-sm text-green-900 mt-1">Utilisateurs</div>
        </Card>
        <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="text-3xl font-bold text-purple-600">1,847</div>
          <div className="text-sm text-purple-900 mt-1">Missions</div>
        </Card>
        <Card className="text-center bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="text-3xl font-bold text-orange-600">8,945</div>
          <div className="text-sm text-orange-900 mt-1">Candidats</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'companies' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Entreprise</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Plan</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Utilisateurs</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Créée le</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockCompanies.map(company => (
                  <tr key={company.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{company.name}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {company.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{company.users}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {company.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{formatDate(company.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <Button size="sm" variant="ghost">Gérer</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Croissance des inscriptions">
            <div className="h-64 flex items-center justify-center text-gray-400">
              📈 Graphique à implémenter
            </div>
          </Card>
          <Card title="Utilisation par plan">
            <div className="h-64 flex items-center justify-center text-gray-400">
              📊 Graphique à implémenter
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="État du système">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                <span className="font-medium">API Server</span>
                <span className="text-green-600 font-semibold">✅ En ligne</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                <span className="font-medium">Base de données</span>
                <span className="text-green-600 font-semibold">✅ En ligne</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                <span className="font-medium">Service Email</span>
                <span className="text-yellow-600 font-semibold">⚠️ Lent</span>
              </div>
            </div>
          </Card>

          <Card title="Actions système">
            <div className="space-y-2">
              <Button variant="secondary" className="w-full">🔄 Vider le cache</Button>
              <Button variant="secondary" className="w-full">📋 Voir les logs</Button>
              <Button variant="secondary" className="w-full">📊 Générer un rapport</Button>
              <Button variant="danger" className="w-full">🔴 Mode maintenance</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
