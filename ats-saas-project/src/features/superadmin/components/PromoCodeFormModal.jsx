import React, { useState } from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Button from '@/shared/components/Button/Button';
import Input from '@/shared/components/Form/Input';
import Select from '@/shared/components/Form/Select';
import FormField from '@/shared/components/Form/FormField';

/**
 * Modal création code promo
 */
export function PromoCodeFormModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    type: 'Pourcentage',
    limit: 100,
    expires: '',
    description: ''
  });

  const generateCode = () => {
    const codes = ['SPRING', 'SUMMER', 'WINTER', 'FALL', 'LAUNCH', 'PROMO', 'SAVE', 'WELCOME'];
    const randomCode = codes[Math.floor(Math.random() * codes.length)] + new Date().getFullYear();
    setFormData({ ...formData, code: randomCode });
  };

  const handleSubmit = () => {
    if (!formData.code || !formData.discount || !formData.expires) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires');
      return;
    }

    const promoData = {
      ...formData,
      id: Date.now(),
      uses: 0,
      revenue: '€0',
      status: 'active'
    };

    onSave(promoData);
    alert(`✅ Code promo "${formData.code}" créé avec succès !\n\n🎟️ Code: ${formData.code}\n💰 Réduction: ${formData.discount}\n📅 Expire: ${formData.expires}\n🎯 Limite: ${formData.limit} utilisations`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <Modal.Header onClose={onClose}>
        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1F2937' }}>
          🎟️ Créer Code Promo
        </h2>
      </Modal.Header>

      <Modal.Body>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <FormField label="Code Promo *" required>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                placeholder="Ex: SPRING2026"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                style={{ flex: 1 }}
              />
              <button
                onClick={generateCode}
                style={{
                  padding: '0 20px',
                  background: '#667EEA',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '14px',
                  whiteSpace: 'nowrap'
                }}>
                🎲 Générer
              </button>
            </div>
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <FormField label="Réduction *" required>
              <Input
                placeholder="Ex: 30%, €500, -50%"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              />
            </FormField>

            <FormField label="Type *" required>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                <option value="Pourcentage">% Pourcentage</option>
                <option value="Fixe">💰 Montant Fixe</option>
                <option value="3 mois">📅 Durée</option>
                <option value="Trial">⏳ Trial Étendu</option>
              </Select>
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <FormField label="Limite d'utilisations *" required>
              <Input
                type="number"
                min="1"
                placeholder="Ex: 100"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) || 0 })}
              />
            </FormField>

            <FormField label="Date d'expiration *" required>
              <Input
                type="date"
                value={formData.expires}
                onChange={(e) => setFormData({ ...formData, expires: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Description">
            <textarea
              placeholder="Conditions d'utilisation, restrictions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
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

          {/* Preview */}
          {formData.code && formData.discount && (
            <div style={{ padding: '20px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', opacity: 0.9 }}>Aperçu du Code</div>
              <div style={{ fontSize: '32px', fontWeight: '900', fontFamily: 'monospace', letterSpacing: '2px', marginBottom: '8px' }}>
                {formData.code}
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700' }}>
                {formData.discount} de réduction
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
            ✨ Créer Code Promo
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default PromoCodeFormModal;
