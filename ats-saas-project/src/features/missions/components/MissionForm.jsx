import React, { useState, useEffect } from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Button from '@/shared/components/Button/Button';
import Input from '@/shared/components/Form/Input';
import Select from '@/shared/components/Form/Select';
import Textarea from '@/shared/components/Form/Textarea';
import FormField from '@/shared/components/Form/FormField';

/**
 * Formulaire de création/édition de mission
 *
 * @example
 * <MissionForm
 *   mission={mission}
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   onSubmit={handleSubmit}
 * />
 */
export function MissionForm({ mission = null, isOpen, onClose, onSubmit }) {
  const isEditing = !!mission;

  const [formData, setFormData] = useState({
    title: '',
    client: '',
    location: '',
    salary: '',
    status: 'open',
    skills: '',
    description: '',
    emoji: '💼',
    color: '#667EEA',
    notes: '',
    startDate: '',
    urgency: '',
    street: '',
    city: '',
    zipCode: '',
    workMode: 'hybride',
    contractType: 'CDI',
    weeklyHours: '35 heures',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    progress: 0,
  });

  const [errors, setErrors] = useState({});

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (mission) {
      setFormData({
        title: mission.title || '',
        client: mission.client || '',
        location: mission.location || '',
        salary: mission.salary || '',
        status: mission.status || 'open',
        skills: Array.isArray(mission.skills) ? mission.skills.join(', ') : '',
        description: mission.description || '',
        emoji: mission.emoji || '💼',
        color: mission.color || '#667EEA',
        notes: mission.notes || '',
        startDate: mission.startDate || '',
        urgency: mission.urgency || '',
        street: mission.address?.street || '',
        city: mission.address?.city || '',
        zipCode: mission.address?.zipCode || '',
        workMode: mission.workMode || 'hybride',
        contractType: mission.contractType || 'CDI',
        weeklyHours: mission.weeklyHours || '35 heures',
        contactName: mission.contactClient?.name || '',
        contactPhone: mission.contactClient?.phone || '',
        contactEmail: mission.contactClient?.email || '',
        progress: mission.progress || 0,
      });
    } else {
      // Réinitialiser en mode création
      setFormData({
        title: '',
        client: '',
        location: '',
        salary: '',
        status: 'open',
        skills: '',
        description: '',
        emoji: '💼',
        color: '#667EEA',
        notes: '',
        startDate: '',
        urgency: '',
        street: '',
        city: '',
        zipCode: '',
        workMode: 'hybride',
        contractType: 'CDI',
        weeklyHours: '35 heures',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        progress: 0,
      });
    }
    setErrors({});
  }, [mission, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.client.trim()) newErrors.client = 'Le client est requis';
    if (!formData.location.trim()) newErrors.location = 'La localisation est requise';
    if (!formData.salary.trim()) newErrors.salary = 'Le salaire est requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    // Empêcher le comportement par défaut si c'est un événement de formulaire
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!validate()) {
      return;
    }

    // Transformer les données pour correspondre au format attendu
    const missionData = {
      ...(mission?.id ? { id: mission.id } : {}),
      title: formData.title,
      client: formData.client,
      location: formData.location,
      salary: formData.salary,
      status: formData.status,
      skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      description: formData.description,
      emoji: formData.emoji,
      color: formData.color,
      notes: formData.notes,
      startDate: formData.startDate,
      urgency: formData.urgency,
      address: {
        street: formData.street,
        city: formData.city,
        zipCode: formData.zipCode,
      },
      workMode: formData.workMode,
      contractType: formData.contractType,
      weeklyHours: formData.weeklyHours,
      contactClient: {
        name: formData.contactName,
        phone: formData.contactPhone,
        email: formData.contactEmail,
      },
      progress: parseInt(formData.progress) || 0,
      links: mission?.links || [],
      documents: mission?.documents || [],
    };

    onSubmit(missionData);
  };

  const formStyles = {
    display: 'grid',
    gap: '20px',
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
          {isEditing ? '✏️ Modifier la mission' : '➕ Nouvelle mission'}
        </h2>
      </Modal.Header>

      <Modal.Body>
        <form onSubmit={handleSubmit} style={formStyles}>
          {/* Informations principales */}
          <div>
            <h3 style={sectionTitleStyles}>📋 Informations Générales</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <FormField label="Titre de la mission *" error={errors.title}>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Développeur Full Stack Senior"
                />
              </FormField>

              <div style={twoColumnsStyles}>
                <FormField label="Client *" error={errors.client}>
                  <Input
                    name="client"
                    value={formData.client}
                    onChange={handleChange}
                    placeholder="Ex: TechCorp"
                  />
                </FormField>

                <FormField label="Localisation *" error={errors.location}>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Ex: Paris"
                  />
                </FormField>
              </div>

              <div style={twoColumnsStyles}>
                <FormField label="Salaire *" error={errors.salary}>
                  <Input
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="Ex: 50k-70k€"
                  />
                </FormField>

                <FormField label="Statut">
                  <Select name="status" value={formData.status} onChange={handleChange}>
                    <option value="open">Ouverte</option>
                    <option value="closed">Fermée</option>
                    <option value="on_hold">En attente</option>
                  </Select>
                </FormField>
              </div>

              <div style={twoColumnsStyles}>
                <FormField label="Date de début">
                  <Input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </FormField>

                <FormField label="Urgence">
                  <Select name="urgency" value={formData.urgency} onChange={handleChange}>
                    <option value="">Normale</option>
                    <option value="urgent">Urgent</option>
                    <option value="tres urgent">Très urgent</option>
                  </Select>
                </FormField>
              </div>

              <div style={twoColumnsStyles}>
                <FormField label="Emoji">
                  <Input
                    name="emoji"
                    value={formData.emoji}
                    onChange={handleChange}
                    placeholder="💼"
                    maxLength={2}
                  />
                </FormField>

                <FormField label="Couleur">
                  <Input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Détails du contrat */}
          <div>
            <h3 style={sectionTitleStyles}>💼 Détails du Contrat</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={twoColumnsStyles}>
                <FormField label="Type de contrat">
                  <Select name="contractType" value={formData.contractType} onChange={handleChange}>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Stage">Stage</option>
                    <option value="Alternance">Alternance</option>
                  </Select>
                </FormField>

                <FormField label="Mode de travail">
                  <Select name="workMode" value={formData.workMode} onChange={handleChange}>
                    <option value="sur site">Sur site</option>
                    <option value="hybride">Hybride</option>
                    <option value="total remote">100% Remote</option>
                  </Select>
                </FormField>
              </div>

              <FormField label="Horaires hebdomadaires">
                <Input
                  name="weeklyHours"
                  value={formData.weeklyHours}
                  onChange={handleChange}
                  placeholder="Ex: 35 heures"
                />
              </FormField>
            </div>
          </div>

          {/* Adresse */}
          <div>
            <h3 style={sectionTitleStyles}>📍 Adresse</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <FormField label="Rue">
                <Input
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Ex: 45 Avenue des Champs-Élysées"
                />
              </FormField>

              <div style={twoColumnsStyles}>
                <FormField label="Ville">
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Ex: Paris"
                  />
                </FormField>

                <FormField label="Code postal">
                  <Input
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="Ex: 75008"
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Contact client */}
          <div>
            <h3 style={sectionTitleStyles}>👤 Contact Client</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <FormField label="Nom du contact">
                <Input
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="Ex: Marie Dubois"
                />
              </FormField>

              <div style={twoColumnsStyles}>
                <FormField label="Téléphone">
                  <Input
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="Ex: +33140506070"
                  />
                </FormField>

                <FormField label="Email">
                  <Input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="Ex: contact@client.com"
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Description et compétences */}
          <div>
            <h3 style={sectionTitleStyles}>📝 Description</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <FormField label="Compétences requises (séparées par des virgules)">
                <Textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="Ex: React, Node.js, TypeScript, AWS"
                  rows={2}
                />
              </FormField>

              <FormField label="Description de la mission">
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez la mission..."
                  rows={4}
                />
              </FormField>

              <FormField label="Notes internes">
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Notes privées (non visibles par le client)"
                  rows={3}
                />
              </FormField>
            </div>
          </div>

          {/* Progression */}
          {isEditing && (
            <div>
              <h3 style={sectionTitleStyles}>📊 Progression</h3>
              <FormField label={`Avancement : ${formData.progress}%`}>
                <Input
                  type="range"
                  name="progress"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={handleChange}
                />
              </FormField>
            </div>
          )}
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

export default MissionForm;
