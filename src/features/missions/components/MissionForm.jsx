/**
 * 📝 Mission Form Component
 *
 * Formulaire de création/édition d'une mission
 */

import React, { useState, useEffect } from 'react';
import { Input, Select, Button } from '@/shared/components';
import { validateMission } from '@/core/utils/validators';
import {
  CONTRACT_TYPES,
  REMOTE_OPTIONS,
  REMOTE_LABELS,
  SECTORS,
  DEPARTMENTS
} from '@/config/constants';

/**
 * @param {object} props
 * @param {object} props.initialData - Initial mission data (for edit mode)
 * @param {Function} props.onSubmit - Submit handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {boolean} props.loading - Loading state
 */
export const MissionForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    contract: '',
    location: '',
    department: '',
    remote: '',
    sector: '',
    description: '',
    requirements: '',
    minSalary: '',
    maxSalary: '',
    benefits: ''
  });

  const [errors, setErrors] = useState({});

  // Populate form with initial data in edit mode
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        company: initialData.company || '',
        contract: initialData.contract || '',
        location: initialData.location || '',
        department: initialData.department || '',
        remote: initialData.remote || '',
        sector: initialData.sector || '',
        description: initialData.description || '',
        requirements: initialData.requirements || '',
        minSalary: initialData.minSalary || '',
        maxSalary: initialData.maxSalary || '',
        benefits: initialData.benefits || ''
      });
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate
    const validation = validateMission(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Submit
    onSubmit(formData);
  };

  const contractOptions = Object.values(CONTRACT_TYPES).map(type => ({
    value: type,
    label: type
  }));

  const remoteOptions = Object.entries(REMOTE_LABELS).map(([value, label]) => ({
    value,
    label
  }));

  const sectorOptions = SECTORS.map(sector => ({
    value: sector,
    label: sector
  }));

  const departmentOptions = DEPARTMENTS.map(dept => ({
    value: dept,
    label: dept
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <Input
        label="Titre du poste"
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        placeholder="Ex: Développeur Full Stack"
        error={errors.title}
        required
        icon="💼"
      />

      {/* Company */}
      <Input
        label="Entreprise"
        value={formData.company}
        onChange={(e) => handleChange('company', e.target.value)}
        placeholder="Ex: Tech Corp"
        error={errors.company}
        required
        icon="🏢"
      />

      {/* Contract Type */}
      <Select
        label="Type de contrat"
        value={formData.contract}
        onChange={(e) => handleChange('contract', e.target.value)}
        options={contractOptions}
        error={errors.contract}
        required
      />

      {/* Location & Department */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Localisation"
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="Ex: Paris"
          error={errors.location}
          required
          icon="📍"
        />

        <Select
          label="Département"
          value={formData.department}
          onChange={(e) => handleChange('department', e.target.value)}
          options={departmentOptions}
        />
      </div>

      {/* Remote & Sector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Mode de travail"
          value={formData.remote}
          onChange={(e) => handleChange('remote', e.target.value)}
          options={remoteOptions}
        />

        <Select
          label="Secteur"
          value={formData.sector}
          onChange={(e) => handleChange('sector', e.target.value)}
          options={sectorOptions}
        />
      </div>

      {/* Salary Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Salaire minimum (€/an)"
          type="number"
          value={formData.minSalary}
          onChange={(e) => handleChange('minSalary', e.target.value)}
          placeholder="Ex: 35000"
          icon="💰"
        />

        <Input
          label="Salaire maximum (€/an)"
          type="number"
          value={formData.maxSalary}
          onChange={(e) => handleChange('maxSalary', e.target.value)}
          placeholder="Ex: 45000"
          icon="💰"
        />
      </div>

      {errors.salary && (
        <p className="text-sm text-red-500">{errors.salary}</p>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description du poste <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Décrivez le poste, les responsabilités, l'environnement de travail..."
          rows={5}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Compétences requises
        </label>
        <textarea
          value={formData.requirements}
          onChange={(e) => handleChange('requirements', e.target.value)}
          placeholder="Listez les compétences techniques et soft skills requises..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Benefits */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Avantages
        </label>
        <textarea
          value={formData.benefits}
          onChange={(e) => handleChange('benefits', e.target.value)}
          placeholder="RTT, télétravail, tickets restaurant, mutuelle..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          loading={loading}
          icon={isEditMode ? '✏️' : '➕'}
        >
          {isEditMode ? 'Mettre à jour' : 'Créer la mission'}
        </Button>
      </div>
    </form>
  );
};
