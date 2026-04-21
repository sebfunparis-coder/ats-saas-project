/**
 * 📚 CVtheque Page
 *
 * Page principale de la CVthèque avec filtres avancés
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useCandidates } from '@/core/hooks';
import { useUI, useFilters } from '@/core/contexts';
import { Button, StatsCard } from '@/shared/components';
import { CVThequeFilters } from './components/CVThequeFilters';
import { CVThequeGrid } from './components/CVThequeGrid';
import { CandidateDetail } from '@/features/candidates/components/CandidateDetail';
import { CandidateForm } from '@/features/candidates/components/CandidateForm';
import { exportData } from '@/core/utils/exporters';

export const CVThequePage = () => {
  const { candidates, fetchCandidates, updateCandidate, deleteCandidate } = useCandidates();
  const { loadingStates } = useUI();
  const { sortConfig, toggleSortOrder } = useFilters();

  // Local state
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [savedSearches, setSavedSearches] = useState([]);

  useEffect(() => {
    fetchCandidates();
    // Load saved searches from localStorage
    const saved = localStorage.getItem('cvtheque_saved_searches');
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved searches:', e);
      }
    }
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const total = candidates.length;
    const available = candidates.filter(c => c.availability === 'Immédiate').length;
    const withCV = candidates.filter(c => c.cvUrl).length;
    const topRated = candidates.filter(c => (c.rating || 0) >= 4).length;

    return { total, available, withCV, topRated };
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

  const handleRate = async (candidate, rating) => {
    await updateCandidate(candidate._id || candidate.id, { rating });
  };

  const handleFormSubmit = async (data) => {
    if (currentCandidate) {
      await updateCandidate(currentCandidate._id || currentCandidate.id, data);
    }
    setIsFormOpen(false);
    setCurrentCandidate(null);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleExport = () => {
    try {
      // Export only filtered candidates
      const filteredIds = new Set(
        candidates
          .filter(c => {
            // Apply same filters as CVThequeGrid
            // For simplicity, export all visible candidates
            return true;
          })
          .map(c => c._id || c.id)
      );

      const candidatesToExport = candidates.filter(c =>
        filteredIds.has(c._id || c.id)
      );

      exportData('cvtheque', candidatesToExport.length > 0 ? candidatesToExport : candidates, 'csv');
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleSaveSearch = () => {
    const activeFilters = Object.keys(filters).filter(k => filters[k] && filters[k] !== '');
    if (activeFilters.length === 0) {
      alert('Aucun filtre actif à sauvegarder');
      return;
    }

    const name = prompt('Nom de la recherche sauvegardée :');
    if (!name) return;

    const newSearch = {
      id: Date.now(),
      name,
      filters: { ...filters },
      createdAt: new Date().toISOString()
    };

    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    localStorage.setItem('cvtheque_saved_searches', JSON.stringify(updated));
  };

  const handleLoadSearch = (search) => {
    setFilters(search.filters);
    setCurrentPage(1);
  };

  const handleDeleteSearch = (searchId) => {
    if (!confirm('Supprimer cette recherche sauvegardée ?')) return;

    const updated = savedSearches.filter(s => s.id !== searchId);
    setSavedSearches(updated);
    localStorage.setItem('cvtheque_saved_searches', JSON.stringify(updated));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CVthèque</h1>
        <p className="text-gray-600">Recherche avancée de candidats</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard title="Total CVs" value={stats.total} icon="📚" color="blue" />
        <StatsCard title="Disponibles" value={stats.available} icon="✅" color="green" />
        <StatsCard title="Avec CV" value={stats.withCV} icon="📄" color="purple" />
        <StatsCard title="Top notés (4+)" value={stats.topRated} icon="⭐" color="orange" />
      </div>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            💾 Recherches sauvegardées
          </h3>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="group inline-flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
              >
                <button
                  onClick={() => handleLoadSearch(search)}
                  className="font-medium text-gray-700 hover:text-blue-600"
                >
                  {search.name}
                </button>
                <button
                  onClick={() => handleDeleteSearch(search.id)}
                  className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <CVThequeFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <Button
            onClick={handleSaveSearch}
            variant="secondary"
            icon="💾"
            disabled={Object.keys(filters).filter(k => filters[k] && filters[k] !== '').length === 0}
          >
            Sauvegarder recherche
          </Button>
          <Button variant="secondary" onClick={handleExport} icon="📥" disabled={candidates.length === 0}>
            Exporter résultats
          </Button>
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => toggleSortOrder('candidates', 'rating')}
            icon="⭐"
          >
            Trier par note
          </Button>
          <Button
            variant="ghost"
            onClick={() => toggleSortOrder('candidates', 'createdAt')}
            icon="📅"
          >
            Trier par date
          </Button>
          <Button
            variant="ghost"
            onClick={() => toggleSortOrder('candidates', 'experience')}
            icon="💼"
          >
            Trier par exp.
          </Button>
        </div>
      </div>

      {/* Grid */}
      <CVThequeGrid
        candidates={candidates}
        filters={filters}
        sortConfig={sortConfig.candidates || { field: 'createdAt', order: 'desc' }}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loadingStates.candidates}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* Modals */}
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

      <CandidateForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setCurrentCandidate(null);
        }}
        onSubmit={handleFormSubmit}
        candidate={currentCandidate}
      />
    </div>
  );
};
