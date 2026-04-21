/**
 * ⚙️ Admin Page
 *
 * Paramètres et administration de l'entreprise
 */

import React, { useState } from 'react';
import { useAuth, useData } from '@/core/contexts';
import { Card, Button, Input, Select } from '@/shared/components';

export const AdminPage = () => {
  const { user } = useAuth();
  const { company } = useData();
  const [activeTab, setActiveTab] = useState('company');

  const tabs = [
    { id: 'company', label: '🏢 Entreprise', icon: '🏢' },
    { id: 'billing', label: '💳 Facturation', icon: '💳' },
    { id: 'integrations', label: '🔌 Intégrations', icon: '🔌' },
    { id: 'security', label: '🔐 Sécurité', icon: '🔐' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ⚙️ Administration
        </h1>
        <p className="text-gray-600">Gérez les paramètres de votre entreprise</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'company' && (
        <Card title="Informations de l'entreprise">
          <form className="space-y-4">
            <Input label="Nom de l'entreprise" defaultValue={company?.name || user?.companyName} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Email de contact" type="email" defaultValue={company?.email || user?.email} />
              <Input label="Téléphone" type="tel" defaultValue={company?.phone} />
            </div>
            <Input label="Adresse" defaultValue={company?.address} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Code postal" defaultValue={company?.postalCode} />
              <Input label="Ville" defaultValue={company?.city} />
            </div>
            <Select
              label="Secteur d'activité"
              options={[
                { value: 'tech', label: 'Technologie' },
                { value: 'finance', label: 'Finance' },
                { value: 'healthcare', label: 'Santé' },
                { value: 'retail', label: 'Commerce' }
              ]}
              defaultValue={company?.sector}
            />
            <div className="pt-4">
              <Button>Enregistrer les modifications</Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-6">
          <Card title="Plan actuel">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{company?.plan || 'Starter'}</h3>
                <p className="text-gray-600">Facturation mensuelle</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">49€</div>
                <div className="text-sm text-gray-600">par mois</div>
              </div>
            </div>
            <Button variant="secondary">Changer de plan</Button>
          </Card>

          <Card title="Historique de facturation">
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">Facture #{2024000 + i}</div>
                    <div className="text-sm text-gray-600">01/{i}/2024</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">49,00 €</span>
                    <Button size="sm" variant="ghost">Télécharger</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: 'LinkedIn', icon: '💼', connected: true },
            { name: 'Gmail', icon: '📧', connected: false },
            { name: 'Slack', icon: '💬', connected: false },
            { name: 'Zapier', icon: '⚡', connected: false }
          ].map(integration => (
            <Card key={integration.name}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{integration.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                    <p className="text-sm text-gray-600">
                      {integration.connected ? '✅ Connecté' : '⚪ Non connecté'}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant={integration.connected ? 'danger' : 'primary'}>
                  {integration.connected ? 'Déconnecter' : 'Connecter'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card title="Authentification">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">Authentification à deux facteurs (2FA)</div>
                  <div className="text-sm text-gray-600">Sécurisez votre compte avec 2FA</div>
                </div>
                <Button size="sm">Activer</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">Sessions actives</div>
                  <div className="text-sm text-gray-600">2 appareils connectés</div>
                </div>
                <Button size="sm" variant="secondary">Gérer</Button>
              </div>
            </div>
          </Card>

          <Card title="Sécurité des données">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">Export des données</div>
                  <div className="text-sm text-gray-600">Téléchargez toutes vos données</div>
                </div>
                <Button size="sm" variant="secondary">Exporter</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">Suppression du compte</div>
                  <div className="text-sm text-gray-600">Supprimer définitivement votre compte</div>
                </div>
                <Button size="sm" variant="danger">Supprimer</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
