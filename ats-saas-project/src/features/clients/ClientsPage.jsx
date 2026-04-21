import React, { useState } from 'react';
import { useClients } from '@/core/hooks/useClients';
import { useMissions } from '@/core/hooks/useMissions';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import { useDebounce } from '@/core/hooks/useDebounce';
import ClientForm from './components/ClientForm';

/**
 * Page Clients - Gestion complète des clients avec CRUD
 */
export function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const { missions } = useMissions();
  const { success, error: showError } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  // 🔥 Debounce de la recherche (300ms)
  const debouncedSearch = useDebounce(searchQuery, 300);

  // 🔥 Gestion des clients
  const handleCreateClient = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setIsFormOpen(true);
    setSelectedClient(null);
  };

  const handleSubmitClient = async (clientData) => {
    // 🚀 Fermeture optimiste : fermer immédiatement la modal
    const isEditing = !!editingClient;
    const editId = editingClient?.id;
    setIsFormOpen(false);
    setEditingClient(null);

    // Appel API en arrière-plan
    try {
      if (isEditing) {
        await updateClient(editId, clientData);
        success('Client modifié', `${clientData.name} a été mis à jour avec succès`);
      } else {
        await addClient(clientData);
        success('Client créé', `${clientData.name} a été ajouté avec succès`);
      }
    } catch (error) {
      console.error('Erreur formulaire client:', error);
      showError('Erreur', error.message);
    }
  };

  const handleDeleteClient = async (client) => {
    if (window.confirm(`Supprimer ${client.name} ?`)) {
      try {
        await deleteClient(client.id);
        success('Client supprimé', `${client.name} a été supprimé avec succès`);
        setSelectedClient(null);
      } catch (error) {
        console.error('Erreur suppression client:', error);
        showError('Erreur', error.message);
      }
    }
  };

  // Filtrer les clients selon la recherche (avec debounce)
  const filteredClients = clients.filter(client =>
    !debouncedSearch ||
    client.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    client.industry.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    client.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const stats = [
    { icon: '🏢', label: 'Total Clients', value: clients.length, color: '#667EEA' },
    { icon: '✅', label: 'Actifs', value: clients.filter(c => c.status === 'active').length, color: '#10B981' },
    { icon: '💼', label: 'Missions Totales', value: clients.reduce((sum, c) => sum + c.missions, 0), color: '#F59E0B' },
    { icon: '📊', label: 'Prospects', value: clients.filter(c => c.status === 'prospect').length, color: '#8B5CF6' },
  ];

  return (
    <div style={{ padding: '50px', background: 'linear-gradient(180deg, #ffffff 0%, #fef5ff 50%, #f3e7ff 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '12px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🏢 Clients
            </h1>
            <p style={{ fontSize: '18px', color: '#6B7280' }}>Gestion complète de votre portefeuille clients</p>
          </div>
          <button
            onClick={handleCreateClient}
            style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)', transition: 'all 0.3s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            ➕ Nouveau Client
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

        {/* Recherche */}
        <div style={{ marginBottom: '32px' }}>
          <input
            type="text"
            placeholder="🔍 Rechercher un client (nom, industrie, email)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 20px',
              border: '2px solid #E5E7EB',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '500',
              outline: 'none',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#667EEA'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
          />
        </div>

        {/* Liste Clients */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          {filteredClients.map(client => (
            <div
              key={client.id}
              onClick={() => setSelectedClient(client)}
              style={{
                padding: '36px',
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = client.color;
                e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
              }}>

              <div style={{ fontSize: '64px', marginBottom: '16px' }}>{client.emoji}</div>

              <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#1F2937' }}>{client.name}</h3>

              <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px', fontWeight: '600' }}>{client.industry}</p>

              <div style={{ padding: '16px', background: 'linear-gradient(135deg, #fef5ff 0%, #f3e7ff 100%)', borderRadius: '12px', marginBottom: '16px' }}>
                <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '8px' }}>📧 {client.email}</p>
                <p style={{ color: '#6B7280', fontSize: '14px' }}>💼 {client.missions} missions actives</p>
              </div>

              <div style={{
                display: 'inline-block',
                padding: '6px 16px',
                background: client.status === 'active' ? '#10B981' : client.status === 'prospect' ? '#F59E0B' : '#6B7280',
                color: 'white',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                {client.status === 'active' ? '✓ Actif' : client.status === 'prospect' ? '🎯 Prospect' : 'Inactif'}
              </div>
            </div>
          ))}
        </div>

        {/* Message si aucun résultat */}
        {filteredClients.length === 0 && (
          <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '80px', marginBottom: '24px', opacity: 0.5 }}>🔍</div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#6B7280', marginBottom: '12px' }}>Aucun client trouvé</h3>
            <p style={{ fontSize: '16px', color: '#9CA3AF' }}>Essayez de modifier vos critères de recherche</p>
          </div>
        )}

        {/* Modal Détail Client */}
        {selectedClient && (
          <div
            onClick={() => setSelectedClient(null)}
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
                maxWidth: '860px',
                width: '100%',
                maxHeight: '92vh',
                overflowY: 'auto',
                boxShadow: '0 40px 100px rgba(0,0,0,0.25)'
              }}>

              {/* Header Banner */}
              <div style={{
                background: `linear-gradient(135deg, ${selectedClient.color || '#667EEA'}22 0%, ${selectedClient.color || '#667EEA'}44 100%)`,
                borderRadius: '24px 24px 0 0',
                padding: '36px 40px 28px',
                borderBottom: `3px solid ${selectedClient.color || '#667EEA'}33`,
                position: 'relative'
              }}>
                <button
                  onClick={() => setSelectedClient(null)}
                  style={{ position: 'absolute', top: '20px', right: '20px', width: '36px', height: '36px', background: 'rgba(0,0,0,0.15)', color: '#1F2937', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ fontSize: '72px', lineHeight: 1 }}>{selectedClient.emoji || '🏢'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '30px', fontWeight: '900', color: '#1F2937', margin: 0 }}>{selectedClient.name}</h2>
                      <span style={{
                        padding: '5px 14px',
                        background: selectedClient.status === 'active' ? '#10B981' : selectedClient.status === 'prospect' ? '#F59E0B' : '#6B7280',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '700'
                      }}>
                        {selectedClient.status === 'active' ? '✓ Actif' : selectedClient.status === 'prospect' ? '🎯 Prospect' : 'Inactif'}
                      </span>
                    </div>
                    <p style={{ fontSize: '16px', color: '#6B7280', fontWeight: '600', margin: 0 }}>
                      🏭 {selectedClient.industry}
                      {selectedClient.size && <span style={{ marginLeft: '16px' }}>👥 {selectedClient.size}</span>}
                      {selectedClient.revenue && <span style={{ marginLeft: '16px' }}>💰 CA {selectedClient.revenue}</span>}
                    </p>
                    {selectedClient.siret && (
                      <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '6px', fontWeight: '500' }}>
                        SIRET : {selectedClient.siret}
                      </p>
                    )}
                  </div>
                  {/* KPI Missions */}
                  <div style={{ textAlign: 'center', background: 'white', borderRadius: '16px', padding: '16px 24px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '36px', fontWeight: '900', color: selectedClient.color || '#667EEA' }}>{selectedClient.missions || 0}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase' }}>Missions actives</div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '32px 40px', display: 'grid', gap: '24px' }}>

                {/* Grille 2 colonnes */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                  {/* Coordonnées entreprise */}
                  <div style={{ background: '#F9FAFB', borderRadius: '16px', padding: '22px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>📞 Coordonnées</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {selectedClient.email && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>Email principal</div>
                          <a href={`mailto:${selectedClient.email}`} style={{ fontSize: '15px', fontWeight: '700', color: '#667EEA', textDecoration: 'none' }}>
                            📧 {selectedClient.email}
                          </a>
                        </div>
                      )}
                      {selectedClient.phone && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>Téléphone principal</div>
                          <a href={`tel:${selectedClient.phone}`} style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937', textDecoration: 'none' }}>
                            📱 {selectedClient.phone}
                          </a>
                        </div>
                      )}
                      {selectedClient.website && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>Site web</div>
                          <a href={selectedClient.website} target="_blank" rel="noreferrer" style={{ fontSize: '14px', fontWeight: '600', color: '#667EEA', textDecoration: 'none', wordBreak: 'break-all' }}>
                            🌐 {selectedClient.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Adresse */}
                  <div style={{ background: '#F9FAFB', borderRadius: '16px', padding: '22px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>📍 Localisation</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {selectedClient.address && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>Adresse</div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937' }}>{selectedClient.address}</div>
                        </div>
                      )}
                      {(selectedClient.zipCode || selectedClient.city) && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>Ville</div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937' }}>
                            {selectedClient.zipCode} {selectedClient.city}
                          </div>
                        </div>
                      )}
                      {selectedClient.country && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>Pays</div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937' }}>🇫🇷 {selectedClient.country}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dates */}
                  <div style={{ background: '#F9FAFB', borderRadius: '16px', padding: '22px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>📅 Historique</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {selectedClient.createdAt && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>Client depuis</div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#10B981' }}>
                            🗓️ {new Date(selectedClient.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                      )}
                      {selectedClient.lastContact && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>Dernier contact</div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937' }}>
                            📞 {new Date(selectedClient.lastContact).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Infos entreprise */}
                  <div style={{ background: '#F9FAFB', borderRadius: '16px', padding: '22px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>🏢 Entreprise</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {selectedClient.size && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>Effectif</div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937' }}>👥 {selectedClient.size}</div>
                        </div>
                      )}
                      {selectedClient.revenue && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>Chiffre d'affaires</div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#10B981' }}>💰 {selectedClient.revenue}</div>
                        </div>
                      )}
                      {selectedClient.siret && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>SIRET</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937', fontFamily: 'monospace' }}>{selectedClient.siret}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contacts */}
                {(() => {
                  const contactsList = selectedClient.contacts && selectedClient.contacts.length > 0
                    ? selectedClient.contacts
                    : selectedClient.contact
                      ? [{ name: selectedClient.contact, role: selectedClient.position || '', email: '', phone: '' }]
                      : [];
                  return contactsList.length > 0 ? (
                    <div style={{ background: '#F0F4FF', borderRadius: '16px', padding: '22px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                        👥 Contacts ({contactsList.length})
                      </h4>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {contactsList.map((c, i) => (
                          <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            {/* Avatar initiales */}
                            <div style={{
                              width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                              background: `linear-gradient(135deg, ${selectedClient.color || '#667EEA'} 0%, ${selectedClient.color || '#764BA2'}99 100%)`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontWeight: '800', fontSize: '16px'
                            }}>
                              {c.name ? c.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
                            </div>
                            <div style={{ flex: 1, minWidth: '120px' }}>
                              <div style={{ fontWeight: '800', fontSize: '15px', color: '#1F2937' }}>{c.name || '—'}</div>
                              {c.role && <div style={{ fontSize: '12px', color: '#667EEA', fontWeight: '700', marginTop: '2px' }}>{c.role}</div>}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              {c.email && (
                                <a href={`mailto:${c.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#EEF2FF', borderRadius: '8px', color: '#667EEA', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = '#667EEA'; e.currentTarget.style.color = 'white'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.color = '#667EEA'; }}>
                                  📧 {c.email}
                                </a>
                              )}
                              {c.phone && (
                                <a href={`tel:${c.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#F0FFF4', borderRadius: '8px', color: '#10B981', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.color = 'white'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = '#F0FFF4'; e.currentTarget.style.color = '#10B981'; }}>
                                  📱 {c.phone}
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Missions */}
                {(() => {
                  const clientMissions = missions.filter(m =>
                    m.client && selectedClient.name &&
                    (m.client.toLowerCase().includes(selectedClient.name.split(' ')[0].toLowerCase()) ||
                     selectedClient.name.toLowerCase().includes(m.client.toLowerCase()))
                  );
                  const activeMissions = clientMissions.filter(m => m.status === 'open' || m.status === 'in_progress');
                  const pastMissions = clientMissions.filter(m => m.status === 'filled' || m.status === 'closed' || m.status === 'cancelled');
                  if (clientMissions.length === 0) return null;

                  const statusConfig = {
                    open: { label: 'En cours', bg: '#DCFCE7', color: '#16A34A', dot: '#22C55E' },
                    in_progress: { label: 'En cours', bg: '#DCFCE7', color: '#16A34A', dot: '#22C55E' },
                    filled: { label: 'Pourvue', bg: '#DBEAFE', color: '#1D4ED8', dot: '#3B82F6' },
                    closed: { label: 'Clôturée', bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF' },
                    cancelled: { label: 'Annulée', bg: '#FEE2E2', color: '#DC2626', dot: '#EF4444' },
                  };

                  const MissionRow = ({ mission }) => {
                    const cfg = statusConfig[mission.status] || statusConfig.closed;
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                        <span style={{ fontSize: '28px', flexShrink: 0 }}>{mission.emoji || '💼'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '800', fontSize: '15px', color: '#1F2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mission.title}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '3px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {mission.location && <span>📍 {mission.location}</span>}
                            {mission.contractType && <span>📄 {mission.contractType}</span>}
                            {mission.salary && <span>💰 {mission.salary}</span>}
                            {mission.startDate && <span>🗓️ {new Date(mission.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: cfg.bg, color: cfg.color, borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
                            {cfg.label}
                          </span>
                          {typeof mission.progress === 'number' && mission.status === 'open' && (
                            <div style={{ width: '80px', height: '5px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${mission.progress}%`, background: 'linear-gradient(90deg, #667EEA, #10B981)', borderRadius: '3px' }} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  };

                  return (
                    <div style={{ background: '#F8FAFF', borderRadius: '16px', padding: '22px', border: '1px solid #E0E7FF' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                          💼 Missions ({clientMissions.length})
                        </h4>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {activeMissions.length > 0 && (
                            <span style={{ padding: '3px 10px', background: '#DCFCE7', color: '#16A34A', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                              {activeMissions.length} active{activeMissions.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {pastMissions.length > 0 && (
                            <span style={{ padding: '3px 10px', background: '#DBEAFE', color: '#1D4ED8', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                              {pastMissions.length} pourvue{pastMissions.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {activeMissions.length > 0 && (
                        <div style={{ marginBottom: pastMissions.length > 0 ? '16px' : 0 }}>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>▶ En cours</div>
                          <div style={{ display: 'grid', gap: '8px' }}>
                            {activeMissions.map(m => <MissionRow key={m.id} mission={m} />)}
                          </div>
                        </div>
                      )}

                      {pastMissions.length > 0 && (
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>✓ Historique</div>
                          <div style={{ display: 'grid', gap: '8px' }}>
                            {pastMissions.map(m => <MissionRow key={m.id} mission={m} />)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Liens */}
                {selectedClient.links && selectedClient.links.length > 0 && (
                  <div style={{ background: '#F0F4FF', borderRadius: '16px', padding: '22px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>🔗 Liens</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {selectedClient.links.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 18px',
                            background: 'white',
                            border: '2px solid #667EEA33',
                            borderRadius: '10px',
                            color: '#667EEA',
                            fontWeight: '700',
                            fontSize: '14px',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#667EEA'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#667EEA'; }}>
                          🔗 {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {selectedClient.documents && selectedClient.documents.length > 0 && (
                  <div style={{ background: '#FFF8F0', borderRadius: '16px', padding: '22px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>📎 Documents</h4>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {selectedClient.documents.map((doc, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'white', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                          <span style={{ fontSize: '24px' }}>
                            {doc.name.endsWith('.pdf') ? '📄' : doc.name.endsWith('.docx') ? '📝' : doc.name.endsWith('.pptx') ? '📊' : '📁'}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>{doc.name}</div>
                            {doc.size && <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{doc.size}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedClient.notes && (
                  <div style={{ background: '#F0FFF4', borderRadius: '16px', padding: '22px', border: '1px solid #A7F3D0' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>📝 Notes internes</h4>
                    <p style={{ fontSize: '15px', color: '#1F2937', lineHeight: '1.7', margin: 0, fontStyle: 'italic' }}>
                      "{selectedClient.notes}"
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', paddingTop: '8px' }}>
                  <button
                    onClick={() => {
                      window.location.href = `mailto:${selectedClient.email}`;
                      success('Email ouvert', `Messagerie ouverte pour ${selectedClient.email}`);
                    }}
                    style={{ padding: '16px', background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', transition: 'all 0.3s', boxShadow: '0 4px 16px rgba(102,126,234,0.4)' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    📧 Contacter
                  </button>
                  <button
                    onClick={() => handleEditClient(selectedClient)}
                    style={{ padding: '16px', background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', transition: 'all 0.3s', boxShadow: '0 4px 16px rgba(245,158,11,0.4)' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteClient(selectedClient)}
                    style={{ padding: '16px', background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', transition: 'all 0.3s', boxShadow: '0 4px 16px rgba(239,68,68,0.4)' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire de gestion des clients */}
        <ClientForm
          client={editingClient}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingClient(null);
          }}
          onSubmit={handleSubmitClient}
        />
      </div>
    </div>
  );
}

export default ClientsPage;
