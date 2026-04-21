import React, { useState, useRef } from 'react';
import { useAuth } from '@/core/contexts/AuthContext';
import { useData } from '@/core/contexts/DataContext';
import { useNotifications } from '@/core/contexts/NotificationsContext';

/**
 * AdminPage - Page d'administration pour les entreprises clientes
 *
 * Sections :
 * 1. Paramètres entreprise (logo, nom, secteur, etc.)
 * 2. Gestion utilisateurs (membres de l'équipe)
 * 3. Facturation (plan, paiement, factures)
 * 4. Paramètres système (notifications, préférences)
 */
export default function AdminPage() {
  const { user } = useAuth();
  const { companies, updateCompany, team, addTeamMember, updateTeamMember, deleteTeamMember, candidates, missions } = useData();
  const { success, error } = useNotifications();

  // Récupérer l'entreprise de l'utilisateur connecté
  const currentCompany = companies.find(c => c.id === user?.companyId) || companies[0];

  const [activeTab, setActiveTab] = useState('company');
  const [editMode, setEditMode] = useState(false);

  // États pour l'édition
  const [companyForm, setCompanyForm] = useState({
    name: currentCompany?.name || '',
    industry: currentCompany?.industry || '',
    email: currentCompany?.email || '',
    notes: currentCompany?.notes || ''
  });

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', role: 'Recruteur', password: '' });
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState(null);
  const [newPassword, setNewPassword] = useState({ password: '', confirm: '' });
  const [selectedUserPermissions, setSelectedUserPermissions] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  const ROLES = ['Admin', 'Manager', 'Recruteur', 'Consultant', 'Lecteur'];
  const ALL_PERMISSIONS = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'clients', label: 'Clients', icon: '🏢' },
    { key: 'missions', label: 'Missions', icon: '💼' },
    { key: 'candidates', label: 'Candidats', icon: '👥' },
    { key: 'pipeline', label: 'Pipeline', icon: '📋' },
    { key: 'calendar', label: 'Agenda', icon: '📅' },
    { key: 'cvtheque', label: 'CVthèque', icon: '🔍' },
    { key: 'team', label: 'Équipe', icon: '👨‍👩‍👧‍👦' },
    { key: 'admin', label: 'Admin', icon: '⚙️' },
    { key: 'export', label: 'Export données', icon: '📤' },
    { key: 'import', label: 'Import données', icon: '📥' },
    { key: 'reports', label: 'Rapports', icon: '📈' },
  ];

  const ROLE_DEFAULT_PERMISSIONS = {
    Admin:      ['dashboard','clients','missions','candidates','pipeline','calendar','cvtheque','team','admin','export','import','reports'],
    Manager:    ['dashboard','clients','missions','candidates','pipeline','calendar','cvtheque','team','export','reports'],
    Recruteur:  ['dashboard','missions','candidates','pipeline','calendar','cvtheque','export'],
    Consultant: ['dashboard','candidates','cvtheque'],
    Lecteur:    ['dashboard'],
  };

  const openEditUser = (member) => {
    setEditingUser(member);
    setEditUserForm({
      firstName: member.firstName || member.name?.split(' ')[0] || '',
      lastName: member.lastName || member.name?.split(' ')[1] || '',
      email: member.email || '',
      role: member.role || 'Recruteur',
      phone: member.phone || '',
      active: member.active !== false,
    });
    setShowEditUserModal(true);
  };

  const handleSaveEditUser = () => {
    if (!editUserForm.firstName || !editUserForm.email) {
      error('Champs requis', 'Prénom et email sont obligatoires');
      return;
    }
    updateTeamMember(editingUser.id, {
      ...editUserForm,
      name: `${editUserForm.firstName} ${editUserForm.lastName}`.trim(),
      status: editUserForm.active ? 'active' : 'inactive',
    });
    success('Profil mis à jour', `${editUserForm.firstName} a été mis à jour avec succès`);
    setShowEditUserModal(false);
    setEditingUser(null);
  };

  const handleResetPassword = () => {
    if (!newPassword.password || newPassword.password.length < 8) {
      error('Mot de passe invalide', 'Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (newPassword.password !== newPassword.confirm) {
      error('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    success('Mot de passe réinitialisé', `Le mot de passe de ${passwordTarget?.name} a été modifié`);
    setShowPasswordModal(false);
    setNewPassword({ password: '', confirm: '' });
    setPasswordTarget(null);
  };

  const toggleUserActive = (member) => {
    const newStatus = member.active === false ? true : false;
    updateTeamMember(member.id, { active: newStatus, status: newStatus ? 'active' : 'inactive' });
    success(
      newStatus ? 'Accès activé' : 'Accès suspendu',
      `${member.name} peut ${newStatus ? 'maintenant' : 'ne peut plus'} se connecter`
    );
  };

  const openPermissions = (member) => {
    const perms = member.permissions?.includes('all')
      ? ROLE_DEFAULT_PERMISSIONS[member.role] || ROLE_DEFAULT_PERMISSIONS.Recruteur
      : member.permissions || ROLE_DEFAULT_PERMISSIONS[member.role] || [];
    setSelectedUserPermissions({ ...member, currentPerms: [...perms] });
    setShowPermissionsModal(true);
  };

  const togglePermission = (key) => {
    setSelectedUserPermissions(prev => {
      const perms = prev.currentPerms.includes(key)
        ? prev.currentPerms.filter(p => p !== key)
        : [...prev.currentPerms, key];
      return { ...prev, currentPerms: perms };
    });
  };

  const handleSavePermissions = () => {
    updateTeamMember(selectedUserPermissions.id, { permissions: selectedUserPermissions.currentPerms });
    success('Permissions sauvegardées', `Les droits de ${selectedUserPermissions.name} ont été mis à jour`);
    setShowPermissionsModal(false);
  };

  // Tabs configuration
  const tabs = [
    { id: 'company', label: 'Entreprise', icon: '🏢' },
    { id: 'users', label: 'Utilisateurs', icon: '👥' },
    { id: 'billing', label: 'Facturation', icon: '💳' },
    { id: 'settings', label: 'Paramètres', icon: '⚙️' }
  ];

  // Handlers
  const handleSaveCompany = () => {
    if (currentCompany) {
      updateCompany(currentCompany.id, companyForm);
      success('Entreprise mise à jour', 'Les informations ont été enregistrées avec succès');
      setEditMode(false);
    }
  };

  const handleAddUser = () => {
    if (!newUser.firstName || !newUser.email || !newUser.password) {
      error('Champs requis', 'Prénom, email et mot de passe sont obligatoires');
      return;
    }
    if (newUser.password.length < 8) {
      error('Mot de passe trop court', 'Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    const fullName = `${newUser.firstName} ${newUser.lastName}`.trim();
    addTeamMember({
      name: fullName,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone || '',
      role: newUser.role,
      companyId: currentCompany.id,
      status: 'active',
      active: true,
      permissions: ROLE_DEFAULT_PERMISSIONS[newUser.role] || [],
      joinDate: new Date().toISOString().split('T')[0]
    });

    success('Membre ajouté', `${fullName} a été ajouté à l'équipe avec le rôle ${newUser.role}`);
    setShowAddUserModal(false);
    setNewUser({ firstName: '', lastName: '', email: '', role: 'Recruteur', password: '' });
  };

  const handleDeleteUser = (userId) => {
    const member = team.find(m => m.id === userId);
    if (window.confirm(`Supprimer ${member?.name} de l'équipe ?`)) {
      deleteTeamMember(userId);
      success('Utilisateur supprimé', `${member?.name} a été retiré de l'équipe`);
    }
  };

  const handleChangePlan = (newPlan) => {
    if (currentCompany) {
      updateCompany(currentCompany.id, { plan: newPlan });
      success('Plan modifié', `Votre plan a été changé vers ${newPlan}`);
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'company':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937' }}>
                Informations de l'entreprise
              </h2>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  ✏️ Modifier
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setCompanyForm({
                        name: currentCompany?.name || '',
                        industry: currentCompany?.industry || '',
                        email: currentCompany?.email || '',
                        notes: currentCompany?.notes || ''
                      });
                    }}
                    style={{
                      background: '#E5E7EB',
                      color: '#374151',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveCompany}
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    💾 Enregistrer
                  </button>
                </div>
              )}
            </div>

            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    disabled={!editMode}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '15px',
                      background: editMode ? 'white' : '#F9FAFB'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Secteur d'activité
                  </label>
                  <input
                    type="text"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                    disabled={!editMode}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '15px',
                      background: editMode ? 'white' : '#F9FAFB'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Email de contact
                  </label>
                  <input
                    type="email"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    disabled={!editMode}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '15px',
                      background: editMode ? 'white' : '#F9FAFB'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Statut
                  </label>
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: currentCompany?.status === 'active' ? '#D1FAE5' : '#FEF3C7',
                    color: currentCompany?.status === 'active' ? '#065F46' : '#92400E',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>
                    {currentCompany?.status === 'active' ? '✅ Actif' : '⏳ En attente'}
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Notes
                  </label>
                  <textarea
                    value={companyForm.notes}
                    onChange={(e) => setCompanyForm({ ...companyForm, notes: e.target.value })}
                    disabled={!editMode}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '15px',
                      background: editMode ? 'white' : '#F9FAFB',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Stats entreprise */}
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1F2937' }}>
                Statistiques
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                {[
                  { label: 'Utilisateurs', value: team.filter(t => t.companyId === currentCompany?.id).length, icon: '👥', color: '#667EEA' },
                  { label: 'Candidats', value: candidates?.length || 0, icon: '👤', color: '#10B981' },
                  { label: 'Missions', value: missions?.length || 0, icon: '💼', color: '#F59E0B' },
                  { label: 'Health Score', value: `${currentCompany?.health || 0}%`, icon: '📊', color: '#EC4899' }
                ].map((stat, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '12px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>{stat.icon}</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: stat.color, marginBottom: '5px' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6B7280' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'users':
        const companyMembers = team.filter(m => m.companyId === currentCompany?.id);
        const inputStyle = {
          width: '100%', padding: '10px 12px', borderRadius: '8px',
          border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box'
        };
        const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#374151' };
        const btnPrimary = {
          background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
          color: 'white', padding: '10px 18px', borderRadius: '8px',
          border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px'
        };

        return (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', margin: 0 }}>
                  👥 Gestion de l'équipe
                </h2>
                <p style={{ color: '#6B7280', marginTop: '6px', fontSize: '14px' }}>
                  {companyMembers.length} membre{companyMembers.length > 1 ? 's' : ''} • Gérez profils, accès et permissions
                </p>
              </div>
              <button onClick={() => setShowAddUserModal(true)} style={btnPrimary}>
                ➕ Ajouter un membre
              </button>
            </div>

            {/* Légende rôles */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {ROLES.map(r => (
                <span key={r} style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                  background: r === 'Admin' ? '#EDE9FE' : r === 'Manager' ? '#DBEAFE' : r === 'Recruteur' ? '#D1FAE5' : '#F3F4F6',
                  color: r === 'Admin' ? '#6D28D9' : r === 'Manager' ? '#1D4ED8' : r === 'Recruteur' ? '#065F46' : '#374151'
                }}>
                  {r}
                </span>
              ))}
            </div>

            {/* Liste membres */}
            <div style={{ display: 'grid', gap: '16px' }}>
              {companyMembers.map((member) => {
                const isActive = member.active !== false && member.status !== 'inactive';
                const initials = (member.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const roleColor = member.role === 'Admin' ? '#6D28D9' : member.role === 'Manager' ? '#1D4ED8' : member.role === 'Recruteur' ? '#065F46' : '#374151';
                const roleBg = member.role === 'Admin' ? '#EDE9FE' : member.role === 'Manager' ? '#DBEAFE' : member.role === 'Recruteur' ? '#D1FAE5' : '#F3F4F6';
                return (
                  <div key={member.id} style={{
                    background: 'white', borderRadius: '16px', padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: `2px solid ${isActive ? '#E5E7EB' : '#FEE2E2'}`,
                    opacity: isActive ? 1 : 0.75
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      {/* Profil */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '56px', height: '56px', borderRadius: '50%',
                          background: isActive ? 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' : '#9CA3AF',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '20px', fontWeight: '700', color: 'white', flexShrink: 0
                        }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '17px', fontWeight: '700', color: '#1F2937' }}>{member.name}</span>
                            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: roleBg, color: roleColor }}>
                              {member.role}
                            </span>
                            <span style={{
                              padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                              background: isActive ? '#D1FAE5' : '#FEE2E2',
                              color: isActive ? '#065F46' : '#991B1B'
                            }}>
                              {isActive ? '● Actif' : '● Suspendu'}
                            </span>
                          </div>
                          <div style={{ fontSize: '14px', color: '#6B7280' }}>📧 {member.email}</div>
                          {member.phone && <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>📞 {member.phone}</div>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => openEditUser(member)}
                          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '13px', color: '#374151' }}
                        >
                          ✏️ Profil
                        </button>
                        <button
                          onClick={() => { setPasswordTarget(member); setShowPasswordModal(true); }}
                          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '13px', color: '#374151' }}
                        >
                          🔑 Accès
                        </button>
                        <button
                          onClick={() => openPermissions(member)}
                          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #667EEA', background: '#EEF2FF', cursor: 'pointer', fontWeight: '600', fontSize: '13px', color: '#667EEA' }}
                        >
                          🛡️ Permissions
                        </button>
                        <button
                          onClick={() => toggleUserActive(member)}
                          style={{
                            padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                            background: isActive ? '#FEF3C7' : '#D1FAE5',
                            color: isActive ? '#92400E' : '#065F46'
                          }}
                        >
                          {isActive ? '⏸️ Suspendre' : '▶️ Réactiver'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(member.id)}
                          style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: '#FEE2E2', color: '#991B1B', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Permissions résumé */}
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
                      <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600', marginRight: '10px' }}>ACCÈS :</span>
                      <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px' }}>
                        {ALL_PERMISSIONS.filter(p => {
                          const perms = member.permissions?.includes('all')
                            ? ROLE_DEFAULT_PERMISSIONS[member.role] || []
                            : member.permissions || [];
                          return perms.includes(p.key);
                        }).map(p => (
                          <span key={p.key} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: '#F3F4F6', color: '#374151' }}>
                            {p.icon} {p.label}
                          </span>
                        ))}
                        {(!member.permissions || member.permissions.length === 0) && (
                          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Aucune permission définie</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {companyMembers.length === 0 && (
                <div style={{ background: 'white', padding: '60px', borderRadius: '16px', textAlign: 'center', color: '#6B7280' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Aucun membre pour le moment</div>
                  <div>Cliquez sur "Ajouter un membre" pour commencer</div>
                </div>
              )}
            </div>

            {/* ===== MODAL AJOUTER ===== */}
            {showAddUserModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '36px', maxWidth: '520px', width: '90%', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>➕ Ajouter un membre</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Prénom *</label>
                      <input style={inputStyle} placeholder="Jean" value={newUser.firstName} onChange={e => setNewUser({ ...newUser, firstName: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Nom *</label>
                      <input style={inputStyle} placeholder="Dupont" value={newUser.lastName} onChange={e => setNewUser({ ...newUser, lastName: e.target.value })} />
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                      <label style={labelStyle}>Email *</label>
                      <input style={inputStyle} type="email" placeholder="jean@entreprise.com" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Rôle *</label>
                      <select style={inputStyle} value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                        {ROLES.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Téléphone</label>
                      <input style={inputStyle} placeholder="0612345678" value={newUser.phone || ''} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} />
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                      <label style={labelStyle}>Mot de passe provisoire *</label>
                      <input style={inputStyle} type="password" placeholder="Min. 8 caractères" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ background: '#EEF2FF', borderRadius: '10px', padding: '12px', marginTop: '16px', fontSize: '13px', color: '#4338CA' }}>
                    🛡️ Les permissions seront celles du rôle <strong>{newUser.role}</strong> par défaut. Vous pourrez les personnaliser ensuite.
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button onClick={() => { setShowAddUserModal(false); setNewUser({ firstName: '', lastName: '', email: '', role: 'Recruteur', password: '' }); }} style={{ flex: 1, background: '#F3F4F6', color: '#374151', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Annuler</button>
                    <button onClick={handleAddUser} style={{ flex: 2, ...btnPrimary, padding: '12px' }}>✅ Créer le compte</button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== MODAL EDITER PROFIL ===== */}
            {showEditUserModal && editingUser && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '36px', maxWidth: '520px', width: '90%', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>✏️ Modifier le profil</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Prénom *</label>
                      <input style={inputStyle} value={editUserForm.firstName} onChange={e => setEditUserForm({ ...editUserForm, firstName: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Nom</label>
                      <input style={inputStyle} value={editUserForm.lastName} onChange={e => setEditUserForm({ ...editUserForm, lastName: e.target.value })} />
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                      <label style={labelStyle}>Email de connexion *</label>
                      <input style={inputStyle} type="email" value={editUserForm.email} onChange={e => setEditUserForm({ ...editUserForm, email: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Rôle</label>
                      <select style={inputStyle} value={editUserForm.role} onChange={e => setEditUserForm({ ...editUserForm, role: e.target.value })}>
                        {ROLES.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Téléphone</label>
                      <input style={inputStyle} value={editUserForm.phone} onChange={e => setEditUserForm({ ...editUserForm, phone: e.target.value })} />
                    </div>
                    <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F9FAFB', borderRadius: '10px', padding: '14px 16px' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>Accès au compte</div>
                        <div style={{ fontSize: '13px', color: '#6B7280' }}>L'utilisateur peut se connecter</div>
                      </div>
                      <div
                        onClick={() => setEditUserForm({ ...editUserForm, active: !editUserForm.active })}
                        style={{ width: '50px', height: '28px', borderRadius: '14px', background: editUserForm.active ? '#667EEA' : '#D1D5DB', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
                      >
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: editUserForm.active ? '25px' : '3px', transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button onClick={() => setShowEditUserModal(false)} style={{ flex: 1, background: '#F3F4F6', color: '#374151', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Annuler</button>
                    <button onClick={handleSaveEditUser} style={{ flex: 2, ...btnPrimary, padding: '12px' }}>💾 Enregistrer</button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== MODAL MOT DE PASSE ===== */}
            {showPasswordModal && passwordTarget && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '36px', maxWidth: '440px', width: '90%', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>🔑 Réinitialiser l'accès</h3>
                  <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>Compte de <strong>{passwordTarget.name}</strong></p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Nouveau mot de passe *</label>
                      <input style={inputStyle} type="password" placeholder="Min. 8 caractères" value={newPassword.password} onChange={e => setNewPassword({ ...newPassword, password: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Confirmer le mot de passe *</label>
                      <input style={inputStyle} type="password" placeholder="Répétez le mot de passe" value={newPassword.confirm} onChange={e => setNewPassword({ ...newPassword, confirm: e.target.value })} />
                      {newPassword.confirm && newPassword.password !== newPassword.confirm && (
                        <div style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>⚠️ Les mots de passe ne correspondent pas</div>
                      )}
                    </div>
                  </div>
                  <div style={{ background: '#FEF3C7', borderRadius: '10px', padding: '12px', marginTop: '16px', fontSize: '13px', color: '#92400E' }}>
                    ⚠️ L'utilisateur devra utiliser ce nouveau mot de passe à sa prochaine connexion.
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button onClick={() => { setShowPasswordModal(false); setNewPassword({ password: '', confirm: '' }); }} style={{ flex: 1, background: '#F3F4F6', color: '#374151', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Annuler</button>
                    <button onClick={handleResetPassword} style={{ flex: 2, ...btnPrimary, padding: '12px' }}>🔑 Réinitialiser</button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== MODAL PERMISSIONS ===== */}
            {showPermissionsModal && selectedUserPermissions && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '36px', maxWidth: '560px', width: '90%', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>🛡️ Permissions</h3>
                  <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>Compte de <strong>{selectedUserPermissions.name}</strong> — Rôle : {selectedUserPermissions.role}</p>

                  {/* Shortcuts par rôle */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#9CA3AF', marginBottom: '8px' }}>APPLIQUER LES PERMISSIONS DU RÔLE :</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {ROLES.map(r => (
                        <button key={r} onClick={() => setSelectedUserPermissions(prev => ({ ...prev, currentPerms: [...ROLE_DEFAULT_PERMISSIONS[r]] }))}
                          style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {ALL_PERMISSIONS.map(p => {
                      const active = selectedUserPermissions.currentPerms.includes(p.key);
                      return (
                        <div key={p.key} onClick={() => togglePermission(p.key)} style={{
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                          border: `2px solid ${active ? '#667EEA' : '#E5E7EB'}`,
                          background: active ? '#EEF2FF' : '#F9FAFB',
                          transition: 'all 0.2s'
                        }}>
                          <span style={{ fontSize: '22px' }}>{p.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: active ? '#4338CA' : '#374151' }}>{p.label}</div>
                          </div>
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${active ? '#667EEA' : '#D1D5DB'}`,
                            background: active ? '#667EEA' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', fontWeight: '700'
                          }}>
                            {active ? '✓' : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button onClick={() => setShowPermissionsModal(false)} style={{ flex: 1, background: '#F3F4F6', color: '#374151', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Annuler</button>
                    <button onClick={handleSavePermissions} style={{ flex: 2, ...btnPrimary, padding: '12px' }}>💾 Sauvegarder</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'billing':
        return (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '30px', color: '#1F2937' }}>
              Facturation & Abonnement
            </h2>

            {/* Plan actuel */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '30px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Plan actuel</h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#667EEA', marginBottom: '5px' }}>
                    {currentCompany?.plan}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', marginBottom: '10px' }}>
                    {currentCompany?.mrr || '€0'} / mois
                  </div>
                  <div style={{ fontSize: '14px', color: '#6B7280' }}>
                    Prochain paiement : {currentCompany?.nextBilling}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6B7280' }}>
                    Moyen de paiement : {currentCompany?.paymentMethod}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => window.open('https://stripe.com/dashboard', '_blank')}
                    style={{
                      background: '#E5E7EB',
                      color: '#374151',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    💳 Gérer paiement
                  </button>
                  <button
                    onClick={() => {
                      const newPlan = prompt('Nouveau plan (Starter, Professional, Enterprise) :', currentCompany?.plan);
                      if (newPlan) handleChangePlan(newPlan);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    🔄 Changer de plan
                  </button>
                </div>
              </div>
            </div>

            {/* Plans disponibles */}
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Plans disponibles</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {[
                { name: 'Starter', price: '€99', features: ['5 utilisateurs', '50 candidats', 'Support email'], color: '#10B981' },
                { name: 'Professional', price: '€299', features: ['15 utilisateurs', '200 candidats', 'Support prioritaire', 'Analytics'], color: '#667EEA' },
                { name: 'Enterprise', price: '€999', features: ['Utilisateurs illimités', 'Candidats illimités', 'Support 24/7', 'API', 'Personnalisation'], color: '#F59E0B' }
              ].map((plan) => (
                <div
                  key={plan.name}
                  style={{
                    background: 'white',
                    padding: '25px',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: currentCompany?.plan === plan.name ? `3px solid ${plan.color}` : '3px solid transparent'
                  }}
                >
                  <div style={{ fontSize: '20px', fontWeight: '700', color: plan.color, marginBottom: '10px' }}>
                    {plan.name}
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '15px' }}>
                    {plan.price}<span style={{ fontSize: '16px', fontWeight: '400', color: '#6B7280' }}>/mois</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '20px' }}>
                    {plan.features.map((feature, i) => (
                      <li key={i} style={{ padding: '8px 0', color: '#374151', fontSize: '14px' }}>
                        ✓ {feature}
                      </li>
                    ))}
                  </ul>
                  {currentCompany?.plan === plan.name ? (
                    <div style={{
                      background: '#D1FAE5',
                      color: '#065F46',
                      padding: '10px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      ✓ Plan actuel
                    </div>
                  ) : (
                    <button
                      onClick={() => handleChangePlan(plan.name)}
                      style={{
                        width: '100%',
                        background: `linear-gradient(135deg, ${plan.color} 0%, ${plan.color}dd 100%)`,
                        color: 'white',
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Choisir ce plan
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Historique factures */}
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Historique des factures</h3>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                {[
                  { date: '01/02/2026', amount: '€6,500', status: 'Payée', invoice: '#INV-2026-02' },
                  { date: '01/01/2026', amount: '€6,500', status: 'Payée', invoice: '#INV-2026-01' },
                  { date: '01/12/2025', amount: '€6,500', status: 'Payée', invoice: '#INV-2025-12' }
                ].map((invoice, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '15px',
                      borderBottom: i < 2 ? '1px solid #E5E7EB' : 'none'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{invoice.invoice}</div>
                      <div style={{ fontSize: '14px', color: '#6B7280' }}>{invoice.date}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700' }}>{invoice.amount}</div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#D1FAE5',
                        color: '#065F46',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        {invoice.status}
                      </div>
                      <button
                        onClick={() => alert(`Téléchargement de ${invoice.invoice}`)}
                        style={{
                          background: '#E5E7EB',
                          color: '#374151',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px'
                        }}
                      >
                        📥 Télécharger
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '30px', color: '#1F2937' }}>
              Paramètres système
            </h2>

            {/* Notifications */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Notifications</h3>

              {[
                { label: 'Notifications email', description: 'Recevoir des emails pour les événements importants', enabled: true },
                { label: 'Notifications candidats', description: 'Alertes lors de nouvelles candidatures', enabled: true },
                { label: 'Notifications missions', description: 'Alertes lors de nouvelles missions', enabled: false },
                { label: 'Rapport hebdomadaire', description: 'Recevoir un résumé chaque semaine', enabled: true }
              ].map((setting, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px 0',
                    borderBottom: i < 3 ? '1px solid #E5E7EB' : 'none'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{setting.label}</div>
                    <div style={{ fontSize: '14px', color: '#6B7280' }}>{setting.description}</div>
                  </div>
                  <div style={{
                    width: '50px',
                    height: '28px',
                    borderRadius: '14px',
                    background: setting.enabled ? '#10B981' : '#D1D5DB',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'white',
                      position: 'absolute',
                      top: '2px',
                      left: setting.enabled ? '24px' : '2px',
                      transition: 'left 0.3s'
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Préférences */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Préférences</h3>

              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Langue</label>
                  <select style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '15px'
                  }}>
                    <option>Français</option>
                    <option>English</option>
                    <option>Español</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Fuseau horaire</label>
                  <select style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '15px'
                  }}>
                    <option>Europe/Paris (UTC+1)</option>
                    <option>America/New_York (UTC-5)</option>
                    <option>Asia/Tokyo (UTC+9)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Format de date</label>
                  <select style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '15px'
                  }}>
                    <option>JJ/MM/AAAA</option>
                    <option>MM/JJ/AAAA</option>
                    <option>AAAA-MM-JJ</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Zone dangereuse */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '2px solid #FEE2E2'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: '#DC2626' }}>
                Zone dangereuse
              </h3>
              <p style={{ color: '#6B7280', marginBottom: '20px' }}>
                Actions irréversibles. Veuillez procéder avec précaution.
              </p>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  onClick={() => {
                    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
                      success('Paramètres réinitialisés', 'Tous les paramètres ont été restaurés');
                    }
                  }}
                  style={{
                    background: '#FEF3C7',
                    color: '#92400E',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #F59E0B',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  ⚠️ Réinitialiser paramètres
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('ATTENTION : Cette action est IRRÉVERSIBLE. Supprimer le compte ?')) {
                      error('Action non autorisée', 'Contactez le support pour supprimer votre compte');
                    }
                  }}
                  style={{
                    background: '#FEE2E2',
                    color: '#991B1B',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #DC2626',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  🗑️ Supprimer le compte
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667EEA15 0%, #764BA215 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1F2937', marginBottom: '10px' }}>
            ⚙️ Administration
          </h1>
          <p style={{ color: '#6B7280', fontSize: '16px' }}>
            Gérez les paramètres de votre entreprise et de votre équipe
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '10px',
          marginBottom: '30px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          gap: '10px'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '15px',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6B7280',
                transition: 'all 0.3s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
}
