/**
 * 🔍 CVTheque Filters Component
 *
 * Filtres très avancés pour la CVthèque
 */

import React, { useState } from 'react';
import { Input, Select, Button, Checkbox } from '@/shared/components';
import {
  CANDIDATE_STATUS,
  SECTORS,
  DEPARTMENTS,
  EXPERIENCE_LEVELS,
  CONTRACT_TYPES
} from '@/config/constants';

export const CVThequeFilters = ({
  filters,
  onFiltersChange,
  onReset
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleChange = (field, value) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    handleChange('skills', skills);
  };

  const handleReset = () => {
    if (onReset) onReset();
  };

  // Options
  const statusOptions = Object.entries(CANDIDATE_STATUS).map(([key, value]) => ({
    value,
    label: key.charAt(0) + key.slice(1).toLowerCase()
  }));

  const sectorOptions = SECTORS.map(s => ({ value: s, label: s }));
  const experienceOptions = EXPERIENCE_LEVELS.map(e => ({ value: e, label: e }));
  const departmentOptions = DEPARTMENTS.map(d => ({ value: d, label: d }));
  const contractOptions = CONTRACT_TYPES.map(c => ({ value: c, label: c }));

  const availabilityOptions = [
    { value: 'Immédiate', label: 'Immédiate' },
    { value: '1 mois', label: '1 mois' },
    { value: '2 mois', label: '2 mois' },
    { value: '3 mois+', label: '3 mois+' }
  ];

  const ratingOptions = [
    { value: '', label: 'Toutes les notes' },
    { value: '5', label: '⭐⭐⭐⭐⭐ (5)' },
    { value: '4', label: '⭐⭐⭐⭐ (4+)' },
    { value: '3', label: '⭐⭐⭐ (3+)' },
    { value: '2', label: '⭐⭐ (2+)' },
    { value: '1', label: '⭐ (1+)' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          🔍 Filtres de recherche
        </h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            icon="🔄"
          >
            Réinitialiser
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            icon={isAdvancedOpen ? '📐' : '📐'}
          >
            {isAdvancedOpen ? 'Filtres simples' : 'Filtres avancés'}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recherche
            </label>
            <Input
              placeholder="Nom, email, poste, compétences..."
              value={filters.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
              icon="🔍"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <Select
              placeholder="Tous les statuts"
              value={filters.status || ''}
              onChange={(e) => handleChange('status', e.target.value)}
              options={statusOptions}
            />
          </div>

          {/* Sector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secteur
            </label>
            <Select
              placeholder="Tous les secteurs"
              value={filters.sector || ''}
              onChange={(e) => handleChange('sector', e.target.value)}
              options={sectorOptions}
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {isAdvancedOpen && (
          <div className="pt-4 border-t border-gray-200 space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau d'expérience
                </label>
                <Select
                  placeholder="Tous les niveaux"
                  value={filters.experienceLevel || ''}
                  onChange={(e) => handleChange('experienceLevel', e.target.value)}
                  options={experienceOptions}
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Département
                </label>
                <Select
                  placeholder="Tous les départements"
                  value={filters.department || ''}
                  onChange={(e) => handleChange('department', e.target.value)}
                  options={departmentOptions}
                />
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disponibilité
                </label>
                <Select
                  placeholder="Toutes"
                  value={filters.availability || ''}
                  onChange={(e) => handleChange('availability', e.target.value)}
                  options={availabilityOptions}
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note minimum
                </label>
                <Select
                  value={filters.minRating || ''}
                  onChange={(e) => handleChange('minRating', e.target.value)}
                  options={ratingOptions}
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Skills */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compétences recherchées
                </label>
                <Input
                  placeholder="React, Node.js, TypeScript (séparées par virgules)"
                  value={filters.skills ? filters.skills.join(', ') : ''}
                  onChange={handleSkillsChange}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Recherche les candidats ayant au moins une de ces compétences
                </p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localisation
                </label>
                <Input
                  placeholder="Paris, Lyon, Remote..."
                  value={filters.location || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                  icon="📍"
                />
              </div>
            </div>

            {/* Row 3 - Experience range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Années d'expérience (min)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  placeholder="0"
                  value={filters.minExperience || ''}
                  onChange={(e) => handleChange('minExperience', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Années d'expérience (max)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  placeholder="50"
                  value={filters.maxExperience || ''}
                  onChange={(e) => handleChange('maxExperience', e.target.value)}
                />
              </div>
            </div>

            {/* Row 4 - Contract preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Types de contrat recherchés
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {contractOptions.map(contract => (
                  <div key={contract.value} className="flex items-center">
                    <Checkbox
                      checked={(filters.contractPreferences || []).includes(contract.value)}
                      onChange={(e) => {
                        const current = filters.contractPreferences || [];
                        const newPrefs = e.target.checked
                          ? [...current, contract.value]
                          : current.filter(c => c !== contract.value);
                        handleChange('contractPreferences', newPrefs);
                      }}
                      label={contract.label}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Row 5 - Checkboxes */}
            <div className="flex flex-wrap gap-4">
              <Checkbox
                checked={filters.availableOnly || false}
                onChange={(e) => handleChange('availableOnly', e.target.checked)}
                label="Disponibles uniquement"
              />
              <Checkbox
                checked={filters.withCV || false}
                onChange={(e) => handleChange('withCV', e.target.checked)}
                label="Avec CV"
              />
              <Checkbox
                checked={filters.withLinkedIn || false}
                onChange={(e) => handleChange('withLinkedIn', e.target.checked)}
                label="Avec LinkedIn"
              />
              <Checkbox
                checked={filters.recentlyAdded || false}
                onChange={(e) => handleChange('recentlyAdded', e.target.checked)}
                label="Ajoutés récemment (30j)"
              />
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Count */}
      {Object.keys(filters).filter(k => filters[k] && filters[k] !== '').length > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 text-sm text-blue-900">
          <span className="font-medium">
            {Object.keys(filters).filter(k => filters[k] && filters[k] !== '').length} filtre(s) actif(s)
          </span>
        </div>
      )}
    </div>
  );
};
