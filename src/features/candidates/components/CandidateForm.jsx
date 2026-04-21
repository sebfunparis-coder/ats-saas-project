/**
 * 📝 Candidate Form Component
 *
 * Formulaire de création/édition de candidat
 */

import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Select } from '@/shared/components';
import { validateCandidate } from '@/core/utils/validators';
import { CANDIDATE_STATUS, SECTORS, EXPERIENCE_LEVELS } from '@/config/constants';

export const CandidateForm = ({
  candidate = null,
  isOpen,
  onClose,
  onSubmit
}) => {
  const isEditMode = !!candidate;

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    sector: '',
    location: '',
    skills: '',
    status: 'new',
    rating: 0,
    available: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with candidate data in edit mode
  useEffect(() => {
    if (candidate) {
      setFormData({
        firstName: candidate.firstName || '',
        lastName: candidate.lastName || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        position: candidate.position || '',
        experience: candidate.experience || '',
        sector: candidate.sector || '',
        location: candidate.location || '',
        skills: Array.isArray(candidate.skills) ? candidate.skills.join(', ') : '',
        status: candidate.status || 'new',
        rating: candidate.rating || 0,
        available: candidate.available !== undefined ? candidate.available : true
      });
    } else {
      // Reset form for new candidate
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        sector: '',
        location: '',
        skills: '',
        status: 'new',
        rating: 0,
        available: true
      });
    }
    setErrors({});
  }, [candidate, isOpen]);

  // Handle field change
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data
    const dataToSubmit = {
      ...formData,
      skills: formData.skills
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      rating: parseFloat(formData.rating) || 0
    };

    // Validate
    const validation = validateCandidate(dataToSubmit);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Submit
    setIsSubmitting(true);
    try {
      await onSubmit(dataToSubmit);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: 'Erreur lors de l\'enregistrement' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Options
  const statusOptions = Object.entries(CANDIDATE_STATUS).map(([key, value]) => ({
    value,
    label: key.charAt(0) + key.slice(1).toLowerCase()
  }));

  const sectorOptions = SECTORS.map(sector => ({ value: sector, label: sector }));
  const experienceOptions = EXPERIENCE_LEVELS.map(exp => ({ value: exp, label: exp }));
  const ratingOptions = [0, 1, 2, 3, 4, 5].map(r => ({ value: r, label: r === 0 ? 'Non noté' : `${r}/5` }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          {isEditMode ? '✏️ Modifier le candidat' : '➕ Nouveau candidat'}
        </ModalHeader>

        <ModalBody>
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.submit}
            </div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Jean"
                  error={errors.firstName}
                  disabled={isSubmitting}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Dupont"
                  error={errors.lastName}
                  disabled={isSubmitting}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="jean.dupont@email.com"
                  error={errors.email}
                  disabled={isSubmitting}
                  icon="📧"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  error={errors.phone}
                  disabled={isSubmitting}
                  icon="📞"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poste recherché <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                placeholder="Développeur Full Stack"
                error={errors.position}
                disabled={isSubmitting}
                icon="💼"
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position}</p>
              )}
            </div>

            {/* Experience & Sector */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expérience
                </label>
                <Select
                  value={formData.experience}
                  onChange={(e) => handleChange('experience', e.target.value)}
                  options={experienceOptions}
                  placeholder="Sélectionner..."
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secteur
                </label>
                <Select
                  value={formData.sector}
                  onChange={(e) => handleChange('sector', e.target.value)}
                  options={sectorOptions}
                  placeholder="Sélectionner..."
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Localisation
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Paris, France"
                disabled={isSubmitting}
                icon="📍"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compétences
              </label>
              <Input
                value={formData.skills}
                onChange={(e) => handleChange('skills', e.target.value)}
                placeholder="React, Node.js, TypeScript (séparées par des virgules)"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                Séparez les compétences par des virgules
              </p>
            </div>

            {/* Status & Rating */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <Select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  options={statusOptions}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <Select
                  value={formData.rating}
                  onChange={(e) => handleChange('rating', e.target.value)}
                  options={ratingOptions}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Available */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => handleChange('available', e.target.checked)}
                disabled={isSubmitting}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="available" className="ml-2 text-sm font-medium text-gray-700">
                Disponible immédiatement
              </label>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            icon={isSubmitting ? '⏳' : isEditMode ? '💾' : '➕'}
          >
            {isSubmitting ? 'Enregistrement...' : isEditMode ? 'Enregistrer' : 'Créer'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
