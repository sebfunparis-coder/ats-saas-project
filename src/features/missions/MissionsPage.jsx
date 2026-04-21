/**
 * 💼 Missions Page
 *
 * Page principale de gestion des missions
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useMissions } from '@/core/hooks';
import { useUI, useFilters } from '@/core/contexts';
import { Button, Input, Select, Modal, ModalHeader, ModalBody, StatsCard } from '@/shared/components';
import { MissionList } from './components/MissionList';
import { MissionForm } from './components/MissionForm';
import { MissionDetail } from './components/MissionDetail';
import { exportData } from '@/core/utils/exporters';
import {
  MISSION_STATUS,
  CONTRACT_TYPES,
  REMOTE_OPTIONS,
  REMOTE_LABELS,
  SECTORS
} from '@/config/constants';

export const MissionsPage = () => {
  const {
    missions,
    fetchMissions,
    createMission,
    updateMission,
    deleteMission,
    publishMission,
    closeMission
  } = useMissions();

  const { loadingStates } = useUI();
  const {
    missionFilters,
    updateMissionFilters,
    resetMissionFilters,
    viewPreferences,
    updateViewPreference,
    toggleSortOrder
  } = useFilters();

  // Local state for modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Bulk selection state
  const [selectedMissions, setSelectedMissions] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);

  // Fetch missions on mount
  useEffect(() => {
    fetchMissions();
  }, []);

  // ===== HANDLERS =====

  const handleCreate = () => {
    setSelectedMission(null);
    setShowFormModal(true);
  };

  const handleEdit = (mission) => {
    setSelectedMission(mission);
    setShowFormModal(true);
  };

  const handleView = (mission) => {
    setSelectedMission(mission);
    setShowDetailModal(true);
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (selectedMission) {
        // Update existing mission
        await updateMission(selectedMission._id || selectedMission.id, formData);
      } else {
        // Create new mission
        await createMission(formData);
      }
      setShowFormModal(false);
      setSelectedMission(null);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (mission) => {
    await deleteMission(mission._id || mission.id);
  };

  const handlePublish = async (mission) => {
    await publishMission(mission._id || mission.id);
  };

  const handleClose = async (mission) => {
    await closeMission(mission._id || mission.id);
  };

  const handleExport = () => {
    try {
      exportData('missions', missions, 'csv');
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleToggleView = () => {
    const newView = viewPreferences.missionsView === 'grid' ? 'list' : 'grid';
    updateViewPreference('missionsView', newView);
  };

  // ===== BULK ACTIONS =====

  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedMissions([]);
  };

  const handleSelectMission = (mission) => {
    const missionId = mission._id || mission.id;
    setSelectedMissions(prev => {
      if (prev.includes(missionId)) {
        return prev.filter(id => id !== missionId);
      }
      return [...prev, missionId];
    });
  };

  const handleSelectAll = () => {
    if (selectedMissions.length === missions.length) {
      setSelectedMissions([]);
    } else {
      setSelectedMissions(missions.map(m => m._id || m.id));
    }
  };

  const handleBulkPublish = async () => {
    if (confirm(`Publier ${selectedMissions.length} mission(s) ?`)) {
      for (const id of selectedMissions) {
        await publishMission(id);
      }
      setSelectedMissions([]);
      setSelectionMode(false);
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Supprimer ${selectedMissions.length} mission(s) ? Cette action est irréversible.`)) {
      for (const id of selectedMissions) {
        await deleteMission(id);
      }
      setSelectedMissions([]);
      setSelectionMode(false);
    }
  };

  const handleDuplicate = async (mission) => {
    const duplicateData = {
      ...mission,
      title: `${mission.title} (Copie)`,
      status: 'draft'
    };
    delete duplicateData._id;
    delete duplicateData.id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    await createMission(duplicateData);
  };

  // ===== OPTIONS =====

  const statusOptions = Object.entries(MISSION_STATUS).map(([key, value]) => ({
    value,
    label: key.charAt(0) + key.slice(1).toLowerCase()
  }));

  const contractOptions = Object.values(CONTRACT_TYPES).map(type => ({
    value: type,
    label: type
  }));

  const remoteOptions = Object.entries(REMOTE_LABELS).map(([value, label]) => ({
    value,
    label
  }));

  const sectorOptions = SECTORS.map(sector => ({
    value: sector,
    label: sector
  }));

  const isLoading = loadingStates.missions;

  // Calculate statistics
  const stats = useMemo(() => {
    const total = missions.length;
    const active = missions.filter(m => m.status === 'active').length;
    const draft = missions.filter(m => m.status === 'draft').length;
    const closed = missions.filter(m => m.status === 'closed').length;

    return { total, active, draft, closed };
  }, [missions]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Missions</h1>
        <p className="text-gray-600">
          Gérez vos offres d'emploi et suivez vos recrutements
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Missions"
          value={stats.total}
          icon="💼"
          color="blue"
          description="Toutes missions confondues"
        />
        <StatsCard
          title="Missions Actives"
          value={stats.active}
          icon="✅"
          color="green"
          description="Publiées et ouvertes"
        />
        <StatsCard
          title="Brouillons"
          value={stats.draft}
          icon="📝"
          color="orange"
          description="En cours de rédaction"
        />
        <StatsCard
          title="Missions Fermées"
          value={stats.closed}
          icon="🔒"
          color="red"
          description="Terminées ou expirées"
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <Input
            placeholder="Rechercher..."
            value={missionFilters.search}
            onChange={(e) => updateMissionFilters({ search: e.target.value })}
            icon="🔍"
          />

          {/* Status Filter */}
          <Select
            placeholder="Tous les statuts"
            value={missionFilters.status}
            onChange={(e) => updateMissionFilters({ status: e.target.value })}
            options={statusOptions}
          />

          {/* Contract Filter */}
          <Select
            placeholder="Tous les contrats"
            value={missionFilters.contract}
            onChange={(e) => updateMissionFilters({ contract: e.target.value })}
            options={contractOptions}
          />

          {/* Remote Filter */}
          <Select
            placeholder="Mode de travail"
            value={missionFilters.remote}
            onChange={(e) => updateMissionFilters({ remote: e.target.value })}
            options={remoteOptions}
          />
        </div>

        {/* Advanced Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sector Filter */}
          <Select
            placeholder="Tous les secteurs"
            value={missionFilters.sector}
            onChange={(e) => updateMissionFilters({ sector: e.target.value })}
            options={sectorOptions}
          />

          {/* Salary Range */}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Salaire min"
              value={missionFilters.minSalary}
              onChange={(e) => updateMissionFilters({ minSalary: e.target.value })}
              icon="💰"
            />
            <Input
              type="number"
              placeholder="Salaire max"
              value={missionFilters.maxSalary}
              onChange={(e) => updateMissionFilters({ maxSalary: e.target.value })}
              icon="💰"
            />
          </div>

          {/* Reset Filters */}
          <Button
            variant="ghost"
            onClick={resetMissionFilters}
            className="w-full"
          >
            Réinitialiser les filtres
          </Button>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          {!selectionMode ? (
            <>
              <Button onClick={handleCreate} icon="➕">
                Nouvelle mission
              </Button>

              <Button
                variant="secondary"
                onClick={handleExport}
                icon="📥"
                disabled={missions.length === 0}
              >
                Exporter
              </Button>

              <Button
                variant="ghost"
                onClick={handleToggleSelectionMode}
                icon="☑️"
                disabled={missions.length === 0}
              >
                Sélectionner
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={handleToggleSelectionMode}
                icon="✖️"
              >
                Annuler
              </Button>

              <Button
                variant="secondary"
                onClick={handleSelectAll}
                icon="☑️"
              >
                {selectedMissions.length === missions.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </Button>

              {selectedMissions.length > 0 && (
                <>
                  <Button
                    variant="success"
                    onClick={handleBulkPublish}
                    icon="📢"
                  >
                    Publier ({selectedMissions.length})
                  </Button>

                  <Button
                    variant="danger"
                    onClick={handleBulkDelete}
                    icon="🗑️"
                  >
                    Supprimer ({selectedMissions.length})
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        <div className="flex gap-3">
          {/* Sort */}
          <Button
            variant="ghost"
            onClick={() => toggleSortOrder('missions', 'createdAt')}
            icon="🔄"
          >
            Trier
          </Button>

          {/* View Toggle */}
          <Button
            variant="ghost"
            onClick={handleToggleView}
            icon={viewPreferences.missionsView === 'grid' ? '📋' : '📊'}
          >
            {viewPreferences.missionsView === 'grid' ? 'Liste' : 'Grille'}
          </Button>
        </div>
      </div>

      {/* Missions List */}
      <MissionList
        missions={missions}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPublish={handlePublish}
        onClose={handleClose}
        onDuplicate={handleDuplicate}
        loading={isLoading}
        selectable={selectionMode}
        selectedMissions={selectedMissions}
        onSelect={handleSelectMission}
      />

      {/* Form Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedMission(null);
        }}
        size="xl"
      >
        <ModalHeader>
          {selectedMission ? 'Modifier la mission' : 'Créer une nouvelle mission'}
        </ModalHeader>
        <ModalBody>
          <MissionForm
            initialData={selectedMission}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowFormModal(false);
              setSelectedMission(null);
            }}
            loading={formLoading}
          />
        </ModalBody>
      </Modal>

      {/* Detail Modal */}
      <MissionDetail
        mission={selectedMission}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedMission(null);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPublish={handlePublish}
        onCloseMission={handleClose}
      />
    </div>
  );
};
