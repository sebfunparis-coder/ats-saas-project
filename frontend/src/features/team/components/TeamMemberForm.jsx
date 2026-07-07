import React, { useState, useEffect } from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Button from '@/shared/components/Button/Button';
import Input from '@/shared/components/Form/Input';
import Select from '@/shared/components/Form/Select';
import FormField from '@/shared/components/Form/FormField';
import { validateTeamMember } from '@/core/utils/validators';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import { useIsMobile } from '@/core/hooks/useIsMobile';

/**
 * Formulaire de création/édition de membre d'équipe avec gestion des permissions
 */
export function TeamMemberForm({ member = null, isOpen, onClose, onSubmit }) {
  const isEditing = !!member;
  const { error: showError, success: showSuccess } = useNotifications();
  const isMobile = useIsMobile();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Recruteur',
    department: '',
    avatar: '👤',
    color: '#667EEA',
    active: true,
  });

  const [errors, setErrors] = useState({});

  // Définition des rôles et permissions.
  // T-323 : ces `permissions` (team_members.role, valeurs FR) sont un système
  // d'affichage informatif uniquement — elles ne sont lues nulle part pour
  // bloquer une action ou filtrer un affichage. L'isolation réellement
  // appliquée pour un Équipier (profiles.role='recruiter'/'viewer') passe par
  // missions.allowedRecruiters et applications."assignedTo" (RLS Supabase,
  // migration 016), pas par cette liste. Ne pas présenter ces cases à cocher
  // comme une garantie de sécurité au client.
  const roles = [
    {
      value: 'Admin',
      label: 'Admin',
      description: 'Accès complet - Peut tout gérer',
      permissions: ['all'],
      icon: '👑'
    },
    {
      value: 'Manager',
      label: 'Manager',
      description: 'Gestion équipe et reporting',
      permissions: ['view_all', 'manage_team', 'view_reports', 'manage_missions', 'manage_candidates'],
      icon: '📊'
    },
    {
      value: 'Recruteur',
      label: 'Recruteur',
      description: 'Gestion missions et candidats',
      permissions: ['view_own', 'manage_own_missions', 'manage_candidates', 'schedule_interviews'],
      icon: '💼'
    },
    {
      value: 'Consultant',
      label: 'Consultant',
      description: 'Consultation seulement',
      permissions: ['view_own', 'view_candidates'],
      icon: '👁️'
    }
  ];

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim(),
        email: member.email || '',
        phone: member.phone || '',
        role: member.role || 'Recruteur',
        department: member.department || '',
        avatar: member.avatar || '👤',
        color: member.color || '#667EEA',
        active: member.active !== undefined ? member.active : true,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'Recruteur',
        department: '',
        avatar: '👤',
        color: '#667EEA',
        active: true,
      });
    }
    setErrors({});
  }, [member, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const memberToValidate = {
      ...formData,
    };

    const validation = validateTeamMember(memberToValidate);

    if (!validation.isValid) {
      const newErrors = {};
      validation.errors.forEach(errorMsg => {
        if (errorMsg.includes('nom')) newErrors.name = errorMsg;
        else if (errorMsg.includes('email') || errorMsg.includes('Email')) newErrors.email = errorMsg;
        else if (errorMsg.includes('rôle')) newErrors.role = errorMsg;
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

    const selectedRole = roles.find(r => r.value === formData.role);

    // Séparer le nom complet en firstName et lastName
    const nameParts = formData.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const memberData = {
      ...(member?.id ? { id: member.id } : {}),
      firstName,
      lastName,
      name: formData.name.trim(), // Garder aussi name pour compatibilité
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      role: formData.role,
      department: formData.department.trim(),
      avatar: formData.avatar,
      color: formData.color,
      active: formData.active,
      permissions: selectedRole?.permissions || [],
      joinDate: member?.joinDate || new Date().toISOString().split('T')[0],
      // "missions"/"placements" reflètent la charge de travail réelle,
      // recalculée depuis les candidatures (voir TeamPage.jsx → workload,
      // T-250) — ce ne sont que les valeurs initiales à la création.
      stats: member?.stats || {
        candidatesAdded: 0,
        missions: 0,
        placements: 0,
      },
    };

    onSubmit(memberData);
    showSuccess(
      isEditing ? 'Membre modifié' : 'Membre ajouté',
      `${memberData.name} a été ${isEditing ? 'modifié' : 'ajouté'} avec succès`
    );
  };

  const selectedRole = roles.find(r => r.value === formData.role);

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

  const permissionBadgeStyles = {
    display: 'inline-block',
    padding: '6px 12px',
    background: '#E0E7FF',
    color: '#4338CA',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    margin: '4px',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>
        {isEditing ? '✏️ Modifier le membre' : '➕ Nouveau membre'}
      </Modal.Header>

      <Modal.Body>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          <div>
            <h3 style={sectionTitleStyles}>👤 Informations Personnelles</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <FormField label="Nom complet *" error={errors.name}>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Jean Dupont"
                />
              </FormField>

              <div style={twoColumnsStyles}>
                <FormField label="Email *" error={errors.email}>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Ex: jean@entreprise.com"
                  />
                </FormField>

                <FormField label="Téléphone">
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ex: +33612345678"
                  />
                </FormField>
              </div>

              <div style={twoColumnsStyles}>
                <FormField label="Avatar">
                  <Input
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="👤"
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

          <div>
            <h3 style={sectionTitleStyles}>💼 Rôle & Permissions</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <FormField label="Rôle *" error={errors.role}>
                <Select name="role" value={formData.role} onChange={handleChange}>
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.icon} {role.label} - {role.description}
                    </option>
                  ))}
                </Select>
              </FormField>

              {/* Affichage des permissions du rôle sélectionné */}
              {selectedRole && (
                <div style={{
                  padding: '16px',
                  background: '#F9FAFB',
                  borderRadius: '12px',
                  border: '2px solid #E5E7EB'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937', marginBottom: '12px' }}>
                    🔐 Permissions de ce rôle :
                  </div>
                  <div>
                    {selectedRole.permissions.map((perm, idx) => (
                      <span key={idx} style={permissionBadgeStyles}>
                        {perm === 'all' && '✨ Accès complet'}
                        {perm === 'view_all' && '👁️ Voir tout'}
                        {perm === 'view_own' && '👁️ Voir ses missions'}
                        {perm === 'manage_team' && '👥 Gérer équipe'}
                        {perm === 'view_reports' && '📊 Voir rapports'}
                        {perm === 'manage_missions' && '💼 Gérer missions'}
                        {perm === 'manage_own_missions' && '💼 Gérer ses missions'}
                        {perm === 'manage_candidates' && '👤 Gérer candidats'}
                        {perm === 'view_candidates' && '👁️ Voir candidats'}
                        {perm === 'schedule_interviews' && '📅 Planifier entretiens'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <FormField label="Département">
                <Input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Ex: Recrutement Tech"
                />
              </FormField>

              <FormField label="Statut">
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>
                    Membre actif
                  </span>
                </label>
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

export default TeamMemberForm;
