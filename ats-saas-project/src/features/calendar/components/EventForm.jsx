import React, { useState, useEffect } from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Button from '@/shared/components/Button/Button';
import Input from '@/shared/components/Form/Input';
import Select from '@/shared/components/Form/Select';
import Textarea from '@/shared/components/Form/Textarea';
import FormField from '@/shared/components/Form/FormField';
import { validateEvent } from '@/core/utils/validators';
import { useNotifications } from '@/core/contexts/NotificationsContext';

/**
 * Formulaire de création/édition d'événement avec validation
 */
export function EventForm({ event = null, isOpen, onClose, onSubmit }) {
  const isEditing = !!event;
  const { error: showError, success: showSuccess } = useNotifications();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    type: 'meeting',
    location: '',
    participants: '',
    candidateId: '',
    missionId: '',
    reminder: '30',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date || '',
        time: event.time || '',
        duration: event.duration || '60',
        type: event.type || 'meeting',
        location: event.location || '',
        participants: event.participants || '',
        candidateId: event.candidateId || '',
        missionId: event.missionId || '',
        reminder: event.reminder || '30',
        notes: event.notes || '',
      });
    } else {
      // Valeurs par défaut pour nouveau
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      setFormData({
        title: '',
        description: '',
        date: dateStr,
        time: timeStr,
        duration: '60',
        type: 'meeting',
        location: '',
        participants: '',
        candidateId: '',
        missionId: '',
        reminder: '30',
        notes: '',
      });
    }
    setErrors({});
  }, [event, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const eventToValidate = {
      ...formData,
    };

    const validation = validateEvent(eventToValidate);

    if (!validation.isValid) {
      const newErrors = {};
      validation.errors.forEach(errorMsg => {
        if (errorMsg.includes('titre')) newErrors.title = errorMsg;
        else if (errorMsg.includes('date')) newErrors.date = errorMsg;
        else if (errorMsg.includes('heure')) newErrors.time = errorMsg;
        else if (errorMsg.includes('type')) newErrors.type = errorMsg;
      });
      setErrors(newErrors);
      showError('Formulaire invalide', `${validation.errors.length} erreur(s) détectée(s)`);
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const eventData = {
      ...(event?.id ? { id: event.id } : {}),
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: formData.date,
      time: formData.time,
      duration: parseInt(formData.duration) || 60,
      type: formData.type,
      location: formData.location.trim(),
      participants: formData.participants.trim(),
      candidateId: formData.candidateId || null,
      missionId: formData.missionId || null,
      reminder: parseInt(formData.reminder) || 30,
      notes: formData.notes.trim(),
      status: event?.status || 'scheduled',
      createdAt: event?.createdAt || new Date().toISOString(),
    };

    onSubmit(eventData);
    showSuccess(
      isEditing ? 'Événement modifié' : 'Événement créé',
      `${eventData.title} a été ${isEditing ? 'modifié' : 'créé'} avec succès`
    );
  };

  const twoColumnsStyles = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  };

  const sectionTitleStyles = {
    fontSize: '14px',
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '16px',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '2px solid #E5E7EB',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>
        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1F2937' }}>
          {isEditing ? '✏️ Modifier l\'événement' : '➕ Nouvel événement'}
        </h2>
      </Modal.Header>

      <Modal.Body>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          <div>
            <h3 style={sectionTitleStyles}>📋 Informations Principales</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <FormField label="Titre *" error={errors.title}>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Entretien avec Alice Martin"
                />
              </FormField>

              <FormField label="Description">
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description de l'événement..."
                  rows={3}
                />
              </FormField>

              <div style={twoColumnsStyles}>
                <FormField label="Date *" error={errors.date}>
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </FormField>

                <FormField label="Heure *" error={errors.time}>
                  <Input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                  />
                </FormField>
              </div>

              <div style={twoColumnsStyles}>
                <FormField label="Durée (minutes)">
                  <Input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="15"
                    step="15"
                  />
                </FormField>

                <FormField label="Type *" error={errors.type}>
                  <Select name="type" value={formData.type} onChange={handleChange}>
                    <option value="interview">👥 Entretien</option>
                    <option value="meeting">📅 Réunion</option>
                    <option value="call">📞 Appel</option>
                    <option value="email">📧 Email</option>
                    <option value="deadline">⏰ Échéance</option>
                    <option value="other">📌 Autre</option>
                  </Select>
                </FormField>
              </div>
            </div>
          </div>

          <div>
            <h3 style={sectionTitleStyles}>📍 Détails</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <FormField label="Lieu">
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ex: Salle de réunion A, Visio (Teams), etc."
                />
              </FormField>

              <FormField label="Participants">
                <Input
                  name="participants"
                  value={formData.participants}
                  onChange={handleChange}
                  placeholder="Ex: Alice Martin, Jean Dupont"
                />
              </FormField>

              <FormField label="Rappel (minutes avant)">
                <Select name="reminder" value={formData.reminder} onChange={handleChange}>
                  <option value="0">Aucun rappel</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 heure</option>
                  <option value="1440">1 jour</option>
                </Select>
              </FormField>

              <FormField label="Notes">
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Notes privées..."
                  rows={3}
                />
              </FormField>
            </div>
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEditing ? '✅ Enregistrer' : '➕ Créer'}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default EventForm;
