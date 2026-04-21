import React, { useState } from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Button from '@/shared/components/Button/Button';
import Input from '@/shared/components/Form/Input';
import Select from '@/shared/components/Form/Select';
import FormField from '@/shared/components/Form/FormField';

/**
 * Modal création/édition campagne marketing
 */
export function CampaignFormModal({ campaign, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState(campaign || {
    name: '',
    type: 'Promo',
    status: 'scheduled',
    budget: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.budget || !formData.startDate) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires');
      return;
    }

    const campaignData = {
      ...formData,
      id: campaign?.id || Date.now(),
      spent: campaign?.spent || '€0',
      leads: campaign?.leads || 0,
      conversions: campaign?.conversions || 0,
      roi: campaign?.roi || '0%'
    };

    onSave(campaignData);
    alert(`✅ Campagne "${formData.name}" ${campaign ? 'mise à jour' : 'créée'} avec succès !`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>
        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1F2937' }}>
          📣 {campaign ? 'Éditer' : 'Nouvelle'} Campagne Marketing
        </h2>
      </Modal.Header>

      <Modal.Body>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <FormField label="Nom de la campagne *" required>
            <Input
              placeholder="Ex: Offre Printemps 2026"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <FormField label="Type de campagne *" required>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                <option value="Promo">Promotion</option>
                <option value="Paid Ads">Publicité Payante</option>
                <option value="Email">Email Marketing</option>
                <option value="Event">Événement</option>
                <option value="Content">Content Marketing</option>
                <option value="Social">Réseaux Sociaux</option>
              </Select>
            </FormField>

            <FormField label="Statut *" required>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="scheduled">📅 Planifiée</option>
                <option value="active">🟢 Active</option>
                <option value="paused">⏸️ En pause</option>
                <option value="completed">✅ Terminée</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Budget *" required>
            <Input
              type="text"
              placeholder="Ex: €5,000"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <FormField label="Date de début *" required>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </FormField>

            <FormField label="Date de fin *" required>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Description">
            <textarea
              placeholder="Décrivez votre campagne, objectifs, audience cible..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </FormField>

          {campaign && (
            <div style={{ padding: '20px', background: '#F9FAFB', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1F2937', marginBottom: '12px' }}>📊 Performances Actuelles</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Dépensé', value: campaign.spent },
                  { label: 'Leads', value: campaign.leads },
                  { label: 'Conversions', value: campaign.conversions },
                  { label: 'ROI', value: campaign.roi }
                ].map((stat, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#667EEA', marginBottom: '4px' }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {campaign ? '💾 Sauvegarder' : '✨ Créer Campagne'}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default CampaignFormModal;
