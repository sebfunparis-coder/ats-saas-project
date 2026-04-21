/**
 * 🏢 Clients Page
 *
 * Gestion des clients entreprises
 */

import React, { useState, useMemo } from 'react';
import { useData, useUI } from '@/core/contexts';
import { Card, Button, Input, Select } from '@/shared/components';
import { formatDate, formatPhone } from '@/core/utils/formatters';
import { ClientDetail } from './components/ClientDetail';
import { ClientForm } from './components/ClientForm';

export const ClientsPage = () => {
  const { clients, addClient, updateClient, deleteClient } = useData();
  const { showNotification } = useUI();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Filter clients
  const filteredClients = useMemo(() => {
    let result = [...clients];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(client =>
        client.companyName?.toLowerCase().includes(search) ||
        client.contactName?.toLowerCase().includes(search) ||
        client.email?.toLowerCase().includes(search) ||
        client.sector?.toLowerCase().includes(search)
      );
    }

    if (statusFilter) {
      result = result.filter(client => client.status === statusFilter);
    }

    return result.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [clients, searchTerm, statusFilter]);

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'Active', label: '🟢 Actif' },
    { value: 'Prospect', label: '🟡 Prospect' },
    { value: 'Inactive', label: '🔴 Inactif' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      Active: 'bg-green-100 text-green-800',
      Prospect: 'bg-yellow-100 text-yellow-800',
      Inactive: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleSave = (data) => {
    if (editingClient) {
      updateClient(editingClient._id, data);
      showNotification('Client modifié avec succès', 'success');
      setEditingClient(null);
    } else {
      addClient(data);
      showNotification('Client ajouté avec succès', 'success');
      setIsCreating(false);
    }
  };

  const handleDelete = (client) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${client.companyName} ?`)) {
      deleteClient(client._id);
      showNotification('Client supprimé', 'success');
      setSelectedClient(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏢 Clients
          </h1>
          <p className="text-gray-600">
            {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''}
            {clients.length !== filteredClients.length && ` (sur ${clients.length} au total)`}
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          icon="➕"
        >
          Nouveau client
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="🔍"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{clients.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total clients</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {clients.filter(c => c.status === 'Active').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Actifs</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-yellow-600">
            {clients.filter(c => c.status === 'Prospect').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Prospects</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {clients.filter(c => {
              const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
              return new Date(c.createdAt) >= lastMonth;
            }).length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Nouveaux (30j)</div>
        </Card>
      </div>

      {/* Clients Table */}
      {filteredClients.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun client trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              {clients.length === 0
                ? 'Commencez par ajouter votre premier client'
                : 'Aucun client ne correspond à vos critères'}
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Entreprise</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Secteur</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Créé le</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr
                    key={client._id || client.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedClient(client)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {client.companyName?.[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {client.companyName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {client.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{client.contactName}</div>
                      <div className="text-sm text-gray-600">{formatPhone(client.phone)}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {client.sector || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {formatDate(client.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditingClient(client)}
                        >
                          ✏️
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(client)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Client Detail Modal */}
      {selectedClient && !editingClient && (
        <ClientDetail
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onEdit={() => {
            setEditingClient(selectedClient);
            setSelectedClient(null);
          }}
          onDelete={handleDelete}
        />
      )}

      {/* Client Form Modal (Create/Edit) */}
      {(isCreating || editingClient) && (
        <ClientForm
          client={editingClient}
          onSave={handleSave}
          onCancel={() => {
            setIsCreating(false);
            setEditingClient(null);
          }}
        />
      )}
    </div>
  );
};
