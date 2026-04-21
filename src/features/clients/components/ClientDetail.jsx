/**
 * Client Detail Modal
 */

import React from 'react';
import { Modal, Button } from '@/shared/components';
import { formatDate, formatPhone } from '@/core/utils/formatters';

export const ClientDetail = ({ client, onClose, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    const colors = {
      Active: 'bg-green-100 text-green-800',
      Prospect: 'bg-yellow-100 text-yellow-800',
      Inactive: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Détails du client"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-2xl">
            {client.companyName?.[0]}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{client.companyName}</h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
              {client.status}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact principal</label>
            <p className="text-gray-900">{client.contactName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{client.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <p className="text-gray-900">{formatPhone(client.phone)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
            <p className="text-gray-900">{client.sector || '-'}</p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <p className="text-gray-900">{client.address || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client depuis</label>
            <p className="text-gray-900">{formatDate(client.createdAt, 'long')}</p>
          </div>
        </div>

        {client.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <p className="text-gray-700 bg-gray-50 p-3 rounded">{client.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="secondary" onClick={onEdit}>Modifier</Button>
          <Button variant="danger" onClick={() => onDelete(client)}>Supprimer</Button>
          <div className="flex-1"></div>
          <Button variant="ghost" onClick={onClose}>Fermer</Button>
        </div>
      </div>
    </Modal>
  );
};
