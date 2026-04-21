/**
 * Client Form Modal (Create/Edit)
 */

import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '@/shared/components';

export const ClientForm = ({ client, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    companyName: client?.companyName || '',
    contactName: client?.contactName || '',
    email: client?.email || '',
    phone: client?.phone || '',
    sector: client?.sector || '',
    address: client?.address || '',
    status: client?.status || 'Prospect',
    notes: client?.notes || ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const statusOptions = [
    { value: 'Prospect', label: '🟡 Prospect' },
    { value: 'Active', label: '🟢 Actif' },
    { value: 'Inactive', label: '🔴 Inactif' }
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={client ? 'Modifier le client' : 'Nouveau client'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nom de l'entreprise *"
          value={formData.companyName}
          onChange={(e) => handleChange('companyName', e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Contact principal *"
            value={formData.contactName}
            onChange={(e) => handleChange('contactName', e.target.value)}
            required
          />
          <Select
            label="Statut"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            options={statusOptions}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
          <Input
            label="Téléphone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>
        <Input
          label="Secteur d'activité"
          value={formData.sector}
          onChange={(e) => handleChange('sector', e.target.value)}
        />
        <Input
          label="Adresse"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
          />
        </div>
        <div className="flex gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
          <Button type="submit">{client ? 'Modifier' : 'Créer'}</Button>
        </div>
      </form>
    </Modal>
  );
};
