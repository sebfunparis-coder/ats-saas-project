import React from 'react';
import FilterPanel from '@/shared/patterns/FilterPanel/FilterPanel';
import Select from '@/shared/components/Form/Select';
import Input from '@/shared/components/Form/Input';
import FormField from '@/shared/components/Form/FormField';
import { useData } from '@/core/contexts/DataContext';

/**
 * Panel de filtres avancés pour la CVthèque
 */
export function CVThequeFilters({ filters, onFilterChange, onReset }) {
  const { tags } = useData();

  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const handleTagToggle = (tagId) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    handleChange('tags', newTags);
  };

  const filterSectionStyles = {
    marginBottom: '20px',
  };

  return (
    <FilterPanel title="Filtres" onReset={onReset}>
      <div style={filterSectionStyles}>
        <FormField label="Métier">
          <Select
            value={filters.metier || ''}
            onChange={(e) => handleChange('metier', e.target.value)}
          >
            <option value="">Tous les métiers</option>
            <option value="Développeur Full Stack">Développeur Full Stack</option>
            <option value="Développeur Back-end">Développeur Back-end</option>
            <option value="Développeur Front-end">Développeur Front-end</option>
            <option value="Product Owner">Product Owner</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="UX Designer">UX Designer</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
            <option value="Marketing Manager">Marketing Manager</option>
          </Select>
        </FormField>
      </div>

      <div style={filterSectionStyles}>
        <FormField label="Secteur">
          <Select
            value={filters.sector || ''}
            onChange={(e) => handleChange('sector', e.target.value)}
          >
            <option value="">Tous les secteurs</option>
            <option value="Tech & IT">Tech & IT</option>
            <option value="Marketing & Communication">Marketing & Communication</option>
            <option value="Création & Design">Création & Design</option>
            <option value="Finance & Comptabilité">Finance & Comptabilité</option>
            <option value="RH & Recrutement">RH & Recrutement</option>
          </Select>
        </FormField>
      </div>

      <div style={filterSectionStyles}>
        <FormField label="Département">
          <Input
            placeholder="Ex: 75, 69, 33..."
            value={filters.department || ''}
            onChange={(e) => handleChange('department', e.target.value)}
          />
        </FormField>
      </div>

      <div style={filterSectionStyles}>
        <FormField label="Expérience minimale (années)">
          <Input
            type="number"
            min="0"
            placeholder="Ex: 3"
            value={filters.minExperience || ''}
            onChange={(e) => handleChange('minExperience', e.target.value)}
          />
        </FormField>
      </div>

      <div style={filterSectionStyles}>
        <FormField label="Source">
          <Select
            value={filters.source || ''}
            onChange={(e) => handleChange('source', e.target.value)}
          >
            <option value="">Toutes les sources</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Site carrière">Site carrière</option>
            <option value="Indeed">Indeed</option>
            <option value="Apec">Apec</option>
            <option value="Cooptation">Cooptation</option>
            <option value="Recommandation">Recommandation</option>
            <option value="Behance">Behance</option>
          </Select>
        </FormField>
      </div>

      <div style={filterSectionStyles}>
        <FormField label="Disponibilité">
          <Select
            value={filters.availability || ''}
            onChange={(e) => handleChange('availability', e.target.value)}
          >
            <option value="">Toutes</option>
            <option value="Immédiate">Immédiate</option>
            <option value="1 mois">1 mois</option>
            <option value="2 mois">2 mois</option>
            <option value="3 semaines">3 semaines</option>
          </Select>
        </FormField>
      </div>

      <div style={filterSectionStyles}>
        <FormField label="Date d'ajout">
          <Select
            value={filters.dateAdded || ''}
            onChange={(e) => handleChange('dateAdded', e.target.value)}
          >
            <option value="">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="3months">3 derniers mois</option>
            <option value="6months">6 derniers mois</option>
            <option value="year">Cette année</option>
          </Select>
        </FormField>
      </div>

      {tags.length > 0 && (
        <div style={filterSectionStyles}>
          <FormField label="Tags">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px',
                    background: (filters.tags || []).includes(tag.id) ? `${tag.color}20` : 'transparent',
                    borderRadius: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={(filters.tags || []).includes(tag.id)}
                    onChange={() => handleTagToggle(tag.id)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span
                    style={{
                      padding: '4px 10px',
                      background: tag.color,
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      flex: 1
                    }}
                  >
                    🏷️ {tag.name}
                  </span>
                </label>
              ))}
            </div>
          </FormField>
        </div>
      )}

      <div style={filterSectionStyles}>
        <FormField label="Favoris uniquement">
          <input
            type="checkbox"
            checked={filters.favoritesOnly || false}
            onChange={(e) => handleChange('favoritesOnly', e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
        </FormField>
      </div>
    </FilterPanel>
  );
}

export default CVThequeFilters;
