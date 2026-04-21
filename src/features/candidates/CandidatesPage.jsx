/**
 * 👥 Candidates Page
 *
 * Page principale de gestion des candidats
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useCandidates } from '@/core/hooks';
import { useUI, useFilters } from '@/core/contexts';
import { Button, Input, Select, StatsCard } from '@/shared/components';
import { CandidateList } from './components/CandidateList';
import { CandidateForm } from './components/CandidateForm';
import { CandidateDetail } from './components/CandidateDetail';
import { ImportCSV } from './components/ImportCSV';
import { exportData } from '@/core/utils/exporters';
import { CANDIDATE_STATUS, SECTORS, DEPARTMENTS, EXPERIENCE_LEVELS } from '@/config/constants';

export const CandidatesPage = () => {
  const { candidates, fetchCandidates, createCandidate, updateCandidate, deleteCandidate } = useCandidates();
  const { loadingStates, showNotification } = useUI();
  const { candidateFilters, updateCandidateFilters, resetCandidateFilters, viewPreferences, updateViewPreference, toggleSortOrder } = useFilters();

  // Local state
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const total = candidates.length;
    const qualified = candidates.filter(c => c.status === 'qualified').length;
    const available = candidates.filter(c => c.available).length;
    const avgRating = candidates.length > 0
      ? (candidates.reduce((sum, c) => sum + (c.rating || 0), 0) / candidates.length).toFixed(1)
      : 0;
    return { total, qualified, available, avgRating };
  }, [candidates]);

  // Handlers
  const handleView = (candidate) => {
    setCurrentCandidate(candidate);
    setIsDetailOpen(true);
  };

  const handleEdit = (candidate) => {
    setCurrentCandidate(candidate);
    setIsFormOpen(true);
  };

  const handleDelete = async (candidate) => {
    if (confirm(`Supprimer ${candidate.firstName} ${candidate.lastName} ?`)) {
      await deleteCandidate(candidate._id || candidate.id);
      setIsDetailOpen(false);
    }
  };

  const handleCreate = () => {
    setCurrentCandidate(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data) => {
    if (currentCandidate) {
      // Update
      await updateCandidate(currentCandidate._id || currentCandidate.id, data);
    } else {
      // Create
      await createCandidate(data);
      // Reset filters to show the newly created candidate
      resetCandidateFilters();
    }
    setIsFormOpen(false);
    setCurrentCandidate(null);
  };

  const handleRate = async (candidate, rating) => {
    await updateCandidate(candidate._id || candidate.id, { rating });
  };

  const handleImport = async (candidates) => {
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const candidateData of candidates) {
        try {
          await createCandidate(candidateData);
          successCount++;
        } catch (error) {
          console.error('Error importing candidate:', error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        showNotification({
          type: 'success',
          message: `${successCount} candidat(s) importé(s) avec succès${errorCount > 0 ? ` (${errorCount} erreur(s))` : ''}`
        });
      }

      if (errorCount > 0 && successCount === 0) {
        showNotification({
          type: 'error',
          message: `Erreur lors de l'importation de ${errorCount} candidat(s)`
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      showNotification({
        type: 'error',
        message: 'Erreur lors de l\'importation'
      });
    }
  };

  const handleExport = () => {
    try {
      exportData('candidates', candidates, 'csv');
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleToggleView = () => {
    const newView = viewPreferences.candidatesView === 'grid' ? 'list' : 'grid';
    updateViewPreference('candidatesView', newView);
  };

  const handleSelectCandidate = (candidate) => {
    const candidateId = candidate._id || candidate.id;
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      }
      return [...prev, candidateId];
    });
  };

  const handleSelectAll = () => {
    const allIds = candidates.map(c => c._id || c.id);
    setSelectedCandidates(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedCandidates([]);
  };

  const handleBulkDelete = async () => {
    if (confirm(`Supprimer ${selectedCandidates.length} candidat(s) sélectionné(s) ?`)) {
      for (const id of selectedCandidates) {
        await deleteCandidate(id);
      }
      setSelectedCandidates([]);
      setSelectionMode(false);
    }
  };

  const statusOptions = Object.entries(CANDIDATE_STATUS).map(([key, value]) => ({
    value,
    label: key.charAt(0) + key.slice(1).toLowerCase()
  }));

  const sectorOptions = SECTORS.map(sector => ({ value: sector, label: sector }));
  const departmentOptions = DEPARTMENTS.map(dept => ({ value: dept, label: dept }));
  const experienceOptions = EXPERIENCE_LEVELS.map(exp => ({ value: exp, label: exp }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidats</h1>
        <p className="text-gray-600">Gérez votre vivier de talents</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard title="Total Candidats" value={stats.total} icon="👥" color="blue" />
        <StatsCard title="Qualifiés" value={stats.qualified} icon="✅" color="green" />
        <StatsCard title="Disponibles" value={stats.available} icon="🟢" color="purple" />
        <StatsCard title="Note Moyenne" value={stats.avgRating} icon="⭐" color="orange" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Rechercher..."
            value={candidateFilters.search}
            onChange={(e) => updateCandidateFilters({ search: e.target.value })}
            icon="🔍"
          />
          <Select placeholder="Tous les statuts" value={candidateFilters.status} onChange={(e) => updateCandidateFilters({ status: e.target.value })} options={statusOptions} />
          <Select placeholder="Tous les secteurs" value={candidateFilters.sector} onChange={(e) => updateCandidateFilters({ sector: e.target.value })} options={sectorOptions} />
          <Select placeholder="Expérience" value={candidateFilters.experience} onChange={(e) => updateCandidateFilters({ experience: e.target.value })} options={experienceOptions} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <Button onClick={handleCreate} icon="➕">Nouveau candidat</Button>
          <Button variant="secondary" onClick={() => setIsImportOpen(true)} icon="📥">Importer CSV</Button>
          <Button variant="secondary" onClick={handleExport} icon="📤" disabled={candidates.length === 0}>Exporter</Button>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setSelectionMode(!selectionMode)} icon={selectionMode ? '❌' : '☑️'}>
            {selectionMode ? 'Annuler sélection' : 'Sélectionner'}
          </Button>
          <Button variant="ghost" onClick={() => toggleSortOrder('candidates', 'createdAt')} icon="🔄">Trier</Button>
          <Button variant="ghost" onClick={handleToggleView} icon={viewPreferences.candidatesView === 'grid' ? '📋' : '📊'}>
            {viewPreferences.candidatesView === 'grid' ? 'Liste' : 'Grille'}
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectionMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedCandidates.length} candidat(s) sélectionné(s)
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={handleSelectAll}>
                Tout sélectionner
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDeselectAll}>
                Tout désélectionner
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="danger"
              onClick={handleBulkDelete}
              disabled={selectedCandidates.length === 0}
              icon="🗑️"
            >
              Supprimer ({selectedCandidates.length})
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <CandidateList
        candidates={candidates}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loadingStates.candidates}
        selectable={selectionMode}
        selectedCandidates={selectedCandidates}
        onSelect={handleSelectCandidate}
      />

      {/* Modals */}
      <CandidateForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setCurrentCandidate(null);
        }}
        onSubmit={handleFormSubmit}
        candidate={currentCandidate}
      />

      <CandidateDetail
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setCurrentCandidate(null);
        }}
        candidate={currentCandidate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRate={handleRate}
      />

      <ImportCSV
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
};
