import React, { useState, useEffect } from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Button from '@/shared/components/Button/Button';
import Input from '@/shared/components/Form/Input';
import Select from '@/shared/components/Form/Select';
import Textarea from '@/shared/components/Form/Textarea';
import FormField from '@/shared/components/Form/FormField';
import { validateClient } from '@/core/utils/validators';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import {
  sectionStyle, sectionTitleStyle,
  iconBoxStyle, modalHeaderInner, modalHeaderTitle,
  modalFooterStyle, primaryBtnStyle, secondaryBtnStyle,
} from '@/shared/styles/modalStyles';

/**
 * Formulaire de création/édition de client avec validation
 */
const EMPTY_CONTACT = { name: '', role: '', email: '', phone: '' };

export function ClientForm({ client = null, isOpen, onClose, onSubmit }) {
  const isEditing = !!client;
  const { error: showError, success: showSuccess } = useNotifications();
  const isMobile = useIsMobile();

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip_code: '',
    country: 'France',
    website: '',
    status: 'prospect',
    emoji: '🏢',
    color: '#F59E0B',
    notes: '',
    siret: '',
    size: '',
  });

  const [contacts, setContacts] = useState([{ ...EMPTY_CONTACT }]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        industry: client.industry || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        city: client.city || '',
        zip_code: client.zip_code || '',
        country: client.country || 'France',
        website: client.website || '',
        status: client.status || 'prospect',
        emoji: client.emoji || '🏢',
        color: client.color || '#F59E0B',
        notes: client.notes || '',
        siret: client.siret || '',
        size: client.size || '',
      });
      // Charger les contacts existants (ou créer 1 depuis les anciens champs)
      if (client.contacts && client.contacts.length > 0) {
        setContacts(client.contacts.map(c => ({ name: c.name || '', role: c.role || '', email: c.email || '', phone: c.phone || '' })));
      } else if (client.contact) {
        setContacts([{ name: client.contact, role: client.position || '', email: '', phone: '' }]);
      } else {
        setContacts([{ ...EMPTY_CONTACT }]);
      }
    } else {
      setFormData({
        name: '',
        industry: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zip_code: '',
        country: 'France',
        website: '',
        status: 'prospect',
        emoji: '🏢',
        color: '#F59E0B',
        notes: '',
        siret: '',
        size: '',
      });
      setContacts([{ ...EMPTY_CONTACT }]);
    }
    setErrors({});
  }, [client, isOpen]);

  const handleContactChange = (index, field, value) => {
    setContacts(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const addContact = () => {
    setContacts(prev => [...prev, { ...EMPTY_CONTACT }]);
  };

  const removeContact = (index) => {
    if (contacts.length === 1) return; // garder au moins 1
    setContacts(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const clientToValidate = {
      ...formData,
    };

    const validation = validateClient(clientToValidate);

    if (!validation.isValid) {
      const newErrors = {};
      validation.errors.forEach(errorMsg => {
        if (errorMsg.includes('nom')) newErrors.name = errorMsg;
        else if (errorMsg.includes('email') || errorMsg.includes('Email')) newErrors.email = errorMsg;
        else if (errorMsg.includes('industrie') || errorMsg.includes('activité')) newErrors.industry = errorMsg;
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

    const clientData = {
      ...(client?.id ? { id: client.id } : {}),
      name: formData.name.trim(),
      industry: formData.industry.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      zip_code: formData.zip_code.trim(),
      country: formData.country,
      website: formData.website.trim(),
      siret: formData.siret.trim(),
      size: formData.size,
      contacts: contacts.filter(c => c.name.trim()),
      // compatibilité avec anciens champs (premier contact)
      contact: contacts[0]?.name?.trim() || '',
      position: contacts[0]?.role?.trim() || '',
      status: formData.status,
      emoji: formData.emoji,
      color: formData.color,
      notes: formData.notes.trim(),
      missions: client?.missions || 0,
      createdAt: client?.createdAt || new Date().toISOString(),
      lastContact: client?.lastContact || null,
      // T-333 : `revenue` est une colonne TEXT libre (ex. "150k€", lue via
      // parseInt() ailleurs) — initialiser avec un nombre créait une incohérence
      // de type dès la création d'un client.
      revenue: client?.revenue || '',
      contracts: client?.contracts || [],
    };

    onSubmit(clientData);
    showSuccess(
      isEditing ? 'Client modifié' : 'Client créé',
      `${clientData.name} a été ${isEditing ? 'modifié' : 'créé'} avec succès`
    );
  };

  const twoColumnsStyles = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: '16px',
  };

  const sectionTitleStyles = sectionTitleStyle('#64748B');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>
        <div style={modalHeaderInner}>
          <div style={iconBoxStyle(formData.color || '#F59E0B')}>{formData.emoji || '🏢'}</div>
          <div>
            <h2 style={modalHeaderTitle}>
              {isEditing ? 'Modifier le client' : 'Nouveau client'}
            </h2>
            <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>
              {isEditing ? `Édition de ${formData.name}` : 'Renseignez les informations du client'}
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div style={{ ...sectionStyle(), marginBottom: '0' }}>
            <h3 style={sectionTitleStyles}>🏢 Informations Entreprise</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <FormField label="Nom de l'entreprise *" error={errors.name}>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: TechCorp Solutions"
                />
              </FormField>

              <div style={twoColumnsStyles}>
                <FormField label="Secteur d'activité *" error={errors.industry}>
                  <Input
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="Ex: Tech & IT"
                  />
                </FormField>

                <FormField label="Statut">
                  <Select name="status" value={formData.status} onChange={handleChange}>
                    <option value="prospect">🎯 Prospect</option>
                    <option value="active">✅ Client Actif</option>
                    <option value="inactive">⏸️ Inactif</option>
                    <option value="lost">❌ Perdu</option>
                  </Select>
                </FormField>
              </div>

              <div style={twoColumnsStyles}>
                <FormField label="SIRET">
                  <Input
                    name="siret"
                    value={formData.siret}
                    onChange={handleChange}
                    placeholder="Ex: 123 456 789 00012"
                  />
                </FormField>

                <FormField label="Taille de l'entreprise">
                  <Select name="size" value={formData.size} onChange={handleChange}>
                    <option value="">Non renseigné</option>
                    <option value="1-10">1-10 salariés</option>
                    <option value="11-50">11-50 salariés</option>
                    <option value="51-200">51-200 salariés</option>
                    <option value="201-500">201-500 salariés</option>
                    <option value="500+">500+ salariés</option>
                  </Select>
                </FormField>
              </div>

              <div style={twoColumnsStyles}>
                <FormField label="Emoji">
                  <Input
                    name="emoji"
                    value={formData.emoji}
                    onChange={handleChange}
                    placeholder="🏢"
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

          <div style={{ ...sectionStyle(), marginBottom: '0' }}>
            <h3 style={sectionTitleStyles}>📞 Coordonnées entreprise</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={twoColumnsStyles}>
                <FormField label="Email principal *" error={errors.email}>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Ex: contact@techcorp.com"
                  />
                </FormField>

                <FormField label="Téléphone principal">
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ex: +33123456789"
                  />
                </FormField>
              </div>

              <FormField label="Site web">
                <Input
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Ex: https://www.techcorp.com"
                />
              </FormField>
            </div>
          </div>
          <div style={{ ...sectionStyle(), marginBottom: '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ ...sectionTitleStyles, marginBottom: 0 }}>👥 Contacts ({contacts.length})</h3>
              <button
                type="button"
                onClick={addContact}
                style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                ➕ Ajouter un contact
              </button>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              {contacts.map((contact, index) => (
                <div
                  key={index}
                  style={{ background: '#F9FAFB', borderRadius: '12px', padding: '16px', border: '2px solid #E5E7EB', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#6B7280' }}>
                      👤 Contact {index + 1}
                    </span>
                    {contacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContact(index)}
                        style={{ padding: '4px 10px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
                        ✕ Supprimer
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                    <FormField label="Nom complet">
                      <Input
                        value={contact.name}
                        onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                        placeholder="Ex: Marie Dupont"
                      />
                    </FormField>
                    <FormField label="Poste / Rôle">
                      <Input
                        value={contact.role}
                        onChange={(e) => handleContactChange(index, 'role', e.target.value)}
                        placeholder="Ex: DRH, CEO, DAF..."
                      />
                    </FormField>
                    <FormField label="Email">
                      <Input
                        type="email"
                        value={contact.email}
                        onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                        placeholder="Ex: marie@techcorp.com"
                      />
                    </FormField>
                    <FormField label="Téléphone">
                      <Input
                        value={contact.phone}
                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                        placeholder="Ex: +33612345678"
                      />
                    </FormField>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...sectionStyle(), marginBottom: '0' }}>
            <h3 style={sectionTitleStyles}>📍 Adresse</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <FormField label="Adresse">
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Ex: 123 Avenue des Champs-Élysées"
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
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleChange}
                    placeholder="Ex: 75008"
                  />
                </FormField>
              </div>

              <FormField label="Pays">
                <Select name="country" value={formData.country} onChange={handleChange}>
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                  <option value="Suisse">Suisse</option>
                  <option value="Luxembourg">Luxembourg</option>
                  <option value="Canada">Canada</option>
                  <option value="Autre">Autre</option>
                </Select>
              </FormField>
            </div>
          </div>

          <div style={{ ...sectionStyle(), marginBottom: '0' }}>
            <h3 style={sectionTitleStyles}>📝 Notes</h3>
            <FormField label="Notes internes">
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notes privées sur ce client..."
                rows={4}
              />
            </FormField>
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

export default ClientForm;
