import React, { useState, useMemo } from 'react';
import PageContainer from '@/shared/components/Layout/PageContainer';
import Button from '@/shared/components/Button/Button';
import Input from '@/shared/components/Form/Input';
import Select from '@/shared/components/Form/Select';
import MissionList from './components/MissionList';
import MissionDetail from './components/MissionDetail';
import MissionForm from './components/MissionForm';
import MatchingModal from './components/MatchingModal';
import { useMissions } from '@/core/hooks/useMissions';
import { useUI } from '@/core/contexts/UIContext';
import { filterAndSort } from '@/core/utils/filters';

/**
 * Page de gestion des missions
 * CRUD complet avec filtres et recherche
 */
export function MissionsPage() {
  const { missions, addMission, updateMission, deleteMission } = useMissions();
  const { showNotification } = useUI();

  // États locaux
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  // États des modales
  const [selectedMission, setSelectedMission] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [matchingMission, setMatchingMission] = useState(null);
  const [missionToEdit, setMissionToEdit] = useState(null);

  // Filtrage et tri des missions
  const filteredMissions = useMemo(() => {
    let filtered = missions;

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter((mission) => mission.status === statusFilter);
    }

    // Recherche
    if (searchQuery.trim()) {
      filtered = filterAndSort(filtered, {
        search: searchQuery,
        searchFields: ['title', 'client', 'location', 'skills'],
      });
    }

    // Tri
    const sortOptions = {
      date_desc: { field: 'id', order: 'desc' },
      date_asc: { field: 'id', order: 'asc' },
      title: { field: 'title', order: 'asc' },
      client: { field: 'client', order: 'asc' },
    };

    const sortConfig = sortOptions[sortBy];
    if (sortConfig) {
      filtered = filterAndSort(filtered, {
        sortBy: sortConfig.field,
        sortOrder: sortConfig.order,
      });
    }

    return filtered;
  }, [missions, searchQuery, statusFilter, sortBy]);

  // Gestionnaires d'événements
  const handleMissionClick = (mission) => {
    setSelectedMission(mission);
    setIsDetailOpen(true);
  };

  const handleCreateClick = () => {
    setMissionToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (mission) => {
    setMissionToEdit(mission);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (mission) => {
    if (window.confirm(`Supprimer la mission "${mission.title}" ?`)) {
      try {
        await deleteMission(mission.id);
        setIsDetailOpen(false);
        showNotification('Mission supprimée avec succès', 'success');
      } catch (error) {
        console.error('Erreur suppression:', error);
        // L'erreur est déjà gérée dans useMissions
      }
    }
  };

  const handleFormSubmit = async (missionData) => {
    // 🚀 Fermeture optimiste : fermer immédiatement la modal
    const isEditing = !!missionToEdit;
    setIsFormOpen(false);
    setMissionToEdit(null);

    // Appel API en arrière-plan
    try {
      if (isEditing) {
        // Édition
        await updateMission(missionToEdit.id, missionData);
        showNotification('Mission mise à jour avec succès', 'success');
      } else {
        // Création
        await addMission(missionData);
        showNotification('Mission créée avec succès', 'success');
      }
    } catch (error) {
      console.error('Erreur formulaire:', error);
      // L'erreur est déjà gérée dans useMissions
    }
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
    setSelectedMission(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setMissionToEdit(null);
  };

  // Statistiques rapides
  const stats = useMemo(() => {
    return {
      total: missions.length,
      open: missions.filter((m) => m.status === 'open').length,
      closed: missions.filter((m) => m.status === 'closed').length,
      onHold: missions.filter((m) => m.status === 'on_hold').length,
    };
  }, [missions]);

  const filtersContainerStyles = {
    display: 'flex',
    gap: '16px',
    marginBottom: '32px',
    flexWrap: 'wrap',
    alignItems: 'center',
  };

  const searchInputStyles = {
    flex: 1,
    minWidth: '300px',
  };

  const selectStyles = {
    minWidth: '180px',
  };

  const statsContainerStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  };

  const statCardStyles = {
    padding: '20px',
    background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
    borderRadius: '16px',
    border: '2px solid #E5E7EB',
    textAlign: 'center',
  };

  const statValueStyles = {
    fontSize: '36px',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '4px',
  };

  const statLabelStyles = {
    fontSize: '13px',
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  return (
    <PageContainer
      title="Missions"
      subtitle={`Gérez vos ${missions.length} missions`}
      actions={
        <Button variant="primary" onClick={handleCreateClick}>
          ➕ Nouvelle Mission
        </Button>
      }
    >
      {/* Statistiques */}
      <div style={statsContainerStyles}>
        <div style={statCardStyles}>
          <div style={statValueStyles}>{stats.total}</div>
          <div style={statLabelStyles}>📊 Total</div>
        </div>
        <div style={statCardStyles}>
          <div style={{ ...statValueStyles, background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {stats.open}
          </div>
          <div style={statLabelStyles}>✅ Ouvertes</div>
        </div>
        <div style={statCardStyles}>
          <div style={{ ...statValueStyles, background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {stats.closed}
          </div>
          <div style={statLabelStyles}>🔒 Fermées</div>
        </div>
        <div style={statCardStyles}>
          <div style={{ ...statValueStyles, background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {stats.onHold}
          </div>
          <div style={statLabelStyles}>⏸️ En attente</div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div style={filtersContainerStyles}>
        <div style={searchInputStyles}>
          <Input
            type="search"
            placeholder="🔍 Rechercher par titre, client, localisation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={selectStyles}>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">📋 Tous les statuts</option>
            <option value="open">✅ Ouvertes</option>
            <option value="closed">🔒 Fermées</option>
            <option value="on_hold">⏸️ En attente</option>
          </Select>
        </div>

        <div style={selectStyles}>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date_desc">📅 Plus récentes</option>
            <option value="date_asc">📅 Plus anciennes</option>
            <option value="title">🔤 Titre (A-Z)</option>
            <option value="client">🏢 Client (A-Z)</option>
          </Select>
        </div>
      </div>

      {/* Liste des missions */}
      <MissionList
        missions={filteredMissions}
        onMissionClick={handleMissionClick}
        emptyMessage={
          searchQuery || statusFilter !== 'all'
            ? 'Aucune mission ne correspond à vos critères'
            : 'Aucune mission pour le moment. Créez-en une !'
        }
      />

      {/* Modal de détail */}
      <MissionDetail
        mission={selectedMission}
        isOpen={isDetailOpen}
        onClose={handleDetailClose}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onMatch={(m) => { setMatchingMission(m); setIsDetailOpen(false); }}
      />

      {/* Modal matching IA */}
      <MatchingModal
        mission={matchingMission}
        isOpen={!!matchingMission}
        onClose={() => setMatchingMission(null)}
      />

      {/* Modal de formulaire */}
      <MissionForm
        mission={missionToEdit}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />
    </PageContainer>
  );
}

export default MissionsPage;
