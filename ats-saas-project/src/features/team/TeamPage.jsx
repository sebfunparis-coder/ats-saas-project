import React, { useState } from 'react';
import { useAuth } from '@/core/contexts/AuthContext';
import { useData } from '@/core/contexts/DataContext';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import TeamMemberForm from './components/TeamMemberForm';

/**
 * Page Team - Gestion complète de l'équipe avec permissions
 */
export function TeamPage() {
  const { user } = useAuth();
  const { team: allTeam, addTeamMember, updateTeamMember, deleteTeamMember } = useData();
  const { success, error: showError } = useNotifications();
  const [selectedMember, setSelectedMember] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Filtrer les membres pour ne montrer que ceux de l'entreprise de l'utilisateur connecté
  const team = allTeam.filter(member => member.companyId === user?.companyId);

  // 🔥 Gestion des membres
  const handleCreateMember = () => {
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleSubmitMember = (memberData) => {
    if (editingMember) {
      updateTeamMember(memberData);
    } else {
      // Ajouter le companyId de l'utilisateur connecté au nouveau membre
      addTeamMember({
        ...memberData,
        companyId: user?.companyId
      });
    }
    setIsFormOpen(false);
    setEditingMember(null);
  };

  const handleToggleActive = (member) => {
    updateTeamMember({
      ...member,
      active: !member.active
    });
    success(
      member.active ? 'Membre désactivé' : 'Membre activé',
      `${member.name} a été ${member.active ? 'désactivé' : 'activé'}`
    );
  };

  const handleDeleteMember = (member) => {
    if (window.confirm(`Supprimer ${member.name} de l'équipe ?`)) {
      deleteTeamMember(member.id);
      success('Membre supprimé', `${member.name} a été retiré de l'équipe`);
      if (selectedMember?.id === member.id) {
        setSelectedMember(null);
      }
    }
  };

  const stats = [
    { icon: '👥', label: 'Membres Totaux', value: team.length, color: '#667EEA' },
    { icon: '✅', label: 'Actifs', value: team.filter(m => m.active).length, color: '#10B981' },
    { icon: '💼', label: 'Missions Totales', value: team.reduce((sum, m) => sum + (m.stats?.missions || 0), 0), color: '#F59E0B' },
    { icon: '🎯', label: 'Placements', value: team.reduce((sum, m) => sum + (m.stats?.placements || 0), 0), color: '#8B5CF6' },
  ];

  return (
    <div style={{ padding: '50px', background: 'linear-gradient(180deg, #ffffff 0%, #fef5ff 50%, #f3e7ff 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '12px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              👨‍👩‍👧‍👦 Équipe
            </h1>
            <p style={{ fontSize: '18px', color: '#6B7280' }}>Gestion complète avec rôles & permissions</p>
          </div>
          <button
            onClick={handleCreateMember}
            style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)', transition: 'all 0.3s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            ➕ Nouveau Membre
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{
                padding: '28px',
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = stat.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'transparent';
              }}>
              <div style={{ fontSize: '44px', marginBottom: '14px' }}>{stat.icon}</div>
              <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>{stat.label}</div>
              <div style={{ fontSize: '36px', fontWeight: '900', background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}99 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Liste Membres */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          {team.map(member => (
            <div
              key={member.id}
              onClick={() => setSelectedMember(member)}
              style={{
                padding: '32px',
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                border: '2px solid transparent',
                opacity: member.active ? 1 : 0.6
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = member.color;
                e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
              }}>

              <div style={{ display: 'flex', alignItems: 'start', gap: '20px', marginBottom: '24px' }}>
                <div style={{ width: '80px', height: '80px', background: `linear-gradient(135deg, ${member.color} 0%, ${member.color}99 100%)`, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', flexShrink: 0 }}>
                  {member.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {member.name}
                    {!member.active && <span style={{ padding: '4px 10px', background: '#EF4444', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>Inactif</span>}
                  </h3>
                  <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '8px', fontWeight: '600' }}>{member.role}</p>
                  <p style={{ color: '#9CA3AF', fontSize: '13px' }}>📧 {member.email}</p>
                  <p style={{ color: '#9CA3AF', fontSize: '13px' }}>📱 {member.phone}</p>
                </div>
              </div>

              {/* Stats individuelles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '16px', background: '#F9FAFB', borderRadius: '12px', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: member.color }}>{member.stats?.missions || 0}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Missions</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: member.color }}>{member.stats?.placements || 0}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Placements</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: member.color }}>{member.stats?.revenue || '0€'}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Revenue</div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditMember(member);
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#667EEA',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#5568D3'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#667EEA'}>
                  ✏️ Modifier
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleActive(member);
                  }}
                  style={{
                    padding: '8px 16px',
                    background: member.active ? '#F59E0B' : '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}>
                  {member.active ? '⏸️ Désactiver' : '▶️ Activer'}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMember(member);
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#DC2626'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#EF4444'}>
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Détail Membre */}
        {selectedMember && (
          <div
            onClick={() => setSelectedMember(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              backdropFilter: 'blur(10px)',
              padding: '20px'
            }}>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '24px',
                maxWidth: '900px',
                width: '100%',
                padding: '40px',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'start' }}>
                  <div style={{ width: '100px', height: '100px', background: `linear-gradient(135deg, ${selectedMember.color} 0%, ${selectedMember.color}99 100%)`, borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px' }}>
                    {selectedMember.avatar}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '32px', fontWeight: '900', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
                      {selectedMember.name}
                    </h3>
                    <p style={{ fontSize: '18px', color: '#6B7280', fontWeight: '700', marginBottom: '8px' }}>{selectedMember.role}</p>
                    <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Embauché le {selectedMember.hireDate}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  style={{ padding: '10px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '18px', width: '40px', height: '40px', fontWeight: '700' }}>
                  ✕
                </button>
              </div>

              {/* Statistiques Globales */}
              <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#1F2937' }}>📊 Statistiques Globales</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Missions</div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: selectedMember.color }}>{selectedMember.stats.missions}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Placements</div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#10B981' }}>{selectedMember.stats.placements}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Revenue généré</div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#F59E0B' }}>{selectedMember.stats.revenue}</div>
                  </div>
                </div>
              </div>

              {/* Activité */}
              <div style={{ background: '#EFF6FF', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#1F2937' }}>📈 Activité</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Dernière connexion</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937' }}>{selectedMember.activity?.lastLogin || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Candidats contactés</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#667EEA' }}>{selectedMember.activity?.candidatesContacted ?? '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Entretiens planifiés</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#10B981' }}>{selectedMember.activity?.interviewsScheduled ?? '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Temps de réponse moyen</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#F59E0B' }}>{selectedMember.activity?.avgResponseTime || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div style={{ background: '#F0FDF4', padding: '24px', borderRadius: '16px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#1F2937' }}>🎯 Performance</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Objectif mensuel</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937' }}>{selectedMember.performance?.monthlyAchieved ?? '—'} / {selectedMember.performance?.monthlyGoal ?? '—'} placements</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Taux de conversion</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#10B981' }}>{selectedMember.performance?.conversionRate || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Satisfaction clients</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#F59E0B' }}>⭐ {selectedMember.performance?.satisfaction ?? '—'}/5</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Heures cette semaine</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#8B5CF6' }}>{selectedMember.activity?.weeklyHours ?? '—'}h</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire de gestion des membres */}
        <TeamMemberForm
          member={editingMember}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingMember(null);
          }}
          onSubmit={handleSubmitMember}
        />
      </div>
    </div>
  );
}

export default TeamPage;
