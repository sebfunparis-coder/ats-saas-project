import React, { useState, useEffect, useCallback } from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Button from '@/shared/components/Button/Button';
import Input from '@/shared/components/Form/Input';
import Select from '@/shared/components/Form/Select';
import Textarea from '@/shared/components/Form/Textarea';
import FormField from '@/shared/components/Form/FormField';
import { validateEvent } from '@/core/utils/validators';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import { useIsMobile } from '@/core/hooks/useIsMobile';

/**
 * Formulaire de création/édition d'événement avec validation
 */
export function EventForm({ event = null, isOpen, onClose, onSubmit }) {
  const isEditing = !!event;
  const isMobile = useIsMobile();
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
    emailReminder: false,
    notes: '',
    visioUrl: '',
  });

  const [errors, setErrors] = useState({});
  const [visioCopied, setVisioCopied] = useState(false);

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
        emailReminder: event.emailReminder || false,
        notes: event.notes || '',
        visioUrl: event.visioUrl || '',
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
        emailReminder: false,
        notes: '',
        visioUrl: '',
      });
    }
    setErrors({});
  }, [event, isOpen]);

  const generateVisioLink = (provider) => {
    const title = encodeURIComponent(formData.title || 'Entretien');
    const dur = parseInt(formData.duration) || 60;
    let url;
    if (provider === 'meet') {
      const date = formData.date ? formData.date.replace(/-/g, '') : '';
      const time = formData.time ? formData.time.replace(':', '') : '1000';
      url = date
        ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&duration=${dur}&details=Entretien+ATS`
        : 'https://meet.google.com/new';
    } else {
      url = `https://zoom.us/meeting?topic=${title}&duration=${dur}`;
    }
    setFormData(prev => ({ ...prev, visioUrl: url }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));

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
        // T-367 : le message réel est "Type d'événement invalide" (T majuscule) —
        // .includes('type') en minuscule ne matchait jamais, le champ fautif
        // n'était donc jamais mis en évidence à l'utilisateur.
        else if (errorMsg.includes('Type')) newErrors.type = errorMsg;
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
      emailReminder: formData.emailReminder,
      notes: formData.notes.trim(),
      visioUrl: formData.visioUrl || '',
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
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
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
        {isEditing ? '✏️ Modifier l\'événement' : '➕ Nouvel événement'}
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

              {formData.type === 'interview' && (
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 16px', background: '#EFF6FF',
                    borderRadius: '8px', border: '1px solid #BFDBFE',
                  }}>
                    <input
                      type="checkbox"
                      id="emailReminder"
                      name="emailReminder"
                      checked={formData.emailReminder}
                      onChange={handleChange}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#3B82F6' }}
                    />
                    <label htmlFor="emailReminder" style={{ cursor: 'pointer', flex: 1 }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1D4ED8' }}>
                        📧 Rappel email automatique
                      </span>
                      <span style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                        Envoyer un email de rappel au candidat 24h avant l'entretien
                      </span>
                    </label>
                  </div>
                  <div style={{ padding: '14px 16px', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#166534', marginBottom: '10px' }}>🎥 Lien visioconférence</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: formData.visioUrl ? '10px' : '0' }}>
                      <button type="button" onClick={() => generateVisioLink('meet')}
                        style={{ padding: '7px 14px', borderRadius: '7px', border: '1px solid #4285F4', background: 'white', color: '#4285F4', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
                        📹 Google Meet
                      </button>
                      <button type="button" onClick={() => generateVisioLink('zoom')}
                        style={{ padding: '7px 14px', borderRadius: '7px', border: '1px solid #2D8CFF', background: 'white', color: '#2D8CFF', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
                        🎥 Zoom
                      </button>
                    </div>
                    {formData.visioUrl && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                        <a href={formData.visioUrl} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '12px', color: '#2563EB', textDecoration: 'underline', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {formData.visioUrl}
                        </a>
                        <button type="button" onClick={() => { navigator.clipboard.writeText(formData.visioUrl); setVisioCopied(true); setTimeout(() => setVisioCopied(false), 2000); }}
                          style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', background: visioCopied ? '#ECFDF5' : 'white', color: visioCopied ? '#10B981' : '#6B7280', cursor: 'pointer', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                          {visioCopied ? '✓ Copié' : 'Copier'}
                        </button>
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, visioUrl: '' }))}
                          aria-label="Effacer le lien de visioconférence"
                          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#EF4444', cursor: 'pointer', fontSize: '11px', flexShrink: 0 }}>
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

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
