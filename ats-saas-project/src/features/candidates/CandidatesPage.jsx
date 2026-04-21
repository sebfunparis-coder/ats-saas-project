import React, { useState, useMemo, useRef } from 'react';
import PageContainer from '@/shared/components/Layout/PageContainer';
import Button from '@/shared/components/Button/Button';
import Input from '@/shared/components/Form/Input';
import Select from '@/shared/components/Form/Select';
import CandidateList from './components/CandidateList';
import CandidateDetail from './components/CandidateDetail';
import CandidateForm from './components/CandidateForm';
import CandidateComparison from './components/CandidateComparison';
import { useCandidates } from '@/core/hooks/useCandidates';
import { useUI } from '@/core/contexts/UIContext';
import { filterAndSort } from '@/core/utils/filters';
import { exportCandidates, generateFilename, importCSV } from '@/core/utils/exporters';

/**
 * Page de gestion des candidats
 * CRUD complet avec filtres et recherche
 */
export function CandidatesPage() {
  const { candidates, addCandidate, updateCandidate, deleteCandidate, toggleFavorite } = useCandidates();
  const { showNotification } = useUI();

  // États locaux
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  // États des modales
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [comparisonCandidates, setComparisonCandidates] = useState([]);

  // Ref pour l'input file (import CSV)
  const importInputRef = useRef(null);

  // Export CSV de la liste filtrée
  const handleExportCSV = () => {
    if (filteredCandidates.length === 0) {
      showNotification('Aucun candidat à exporter', 'warning');
      return;
    }
    exportCandidates(filteredCandidates, generateFilename('candidats', 'csv'));
    showNotification(`${filteredCandidates.length} candidat(s) exporté(s)`, 'success');
  };

  // Import CSV
  const handleImportCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await importCSV(file);
      let count = 0;
      for (const row of rows) {
        if (row['Nom'] || row['name']) {
          await addCandidate({
            name:         row['Nom']          || row['name']         || '',
            email:        row['Email']        || row['email']        || '',
            phone:        row['Téléphone']    || row['phone']        || '',
            position:     row['Poste']        || row['position']     || '',
            location:     row['Localisation'] || row['location']     || '',
            experience:   Number(row['Expérience (années)'] || row['experience'] || 0),
            status:       row['Statut']       || row['status']       || 'active',
            salary:       row['Salaire']      || row['salary']       || '',
            availability: row['Disponibilité']|| row['availability'] || '',
            source:       row['Source']       || row['source']       || 'Import CSV',
            skills: [],
            tags: [],
          });
          count++;
        }
      }
      showNotification(`${count} candidat(s) importé(s) avec succès`, 'success');
    } catch {
      showNotification('Erreur lors de l\'import CSV', 'error');
    }
    // Reset l'input pour permettre un re-import
    e.target.value = '';
  };

  // Filtrage et tri des candidats
  const filteredCandidates = useMemo(() => {
    let filtered = candidates;

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter((candidate) => candidate.status === statusFilter);
    }

    // Recherche
    if (searchQuery.trim()) {
      filtered = filterAndSort(filtered, {
        search: searchQuery,
        searchFields: ['name', 'position', 'email', 'skills', 'location'],
      });
    }

    // Tri
    const sortOptions = {
      date_desc: { field: 'id', order: 'desc' },
      date_asc: { field: 'id', order: 'asc' },
      name: { field: 'name', order: 'asc' },
      experience: { field: 'experience', order: 'desc' },
    };

    const sortConfig = sortOptions[sortBy];
    if (sortConfig) {
      filtered = filterAndSort(filtered, {
        sortBy: sortConfig.field,
        sortOrder: sortConfig.order,
      });
    }

    return filtered;
  }, [candidates, searchQuery, statusFilter, sortBy]);

  // Gestionnaires d'événements
  const handleCandidateClick = (candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailOpen(true);
  };

  const handleCreateClick = () => {
    setCandidateToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (candidate) => {
    setCandidateToEdit(candidate);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (candidate) => {
    if (window.confirm(`Supprimer le candidat "${candidate.name}" ?`)) {
      try {
        await deleteCandidate(candidate.id);
        setIsDetailOpen(false);
        showNotification('Candidat supprimé avec succès', 'success');
      } catch (error) {
        console.error('Erreur suppression:', error);
        // L'erreur est déjà gérée dans useCandidates
      }
    }
  };

  const handleToggleFavorite = async (candidate) => {
    try {
      await toggleFavorite(candidate.id);
      // Mettre à jour le candidat sélectionné si c'est celui-ci
      if (selectedCandidate?.id === candidate.id) {
        setSelectedCandidate({ ...candidate, favorite: !candidate.favorite });
      }
    } catch (error) {
      console.error('Erreur toggle favorite:', error);
      // L'erreur est déjà gérée dans useCandidates
    }
  };

  const handleFormSubmit = async (candidateData) => {
    // 🚀 Fermeture optimiste : fermer immédiatement la modal
    const isEditing = !!candidateToEdit;
    const editId = candidateToEdit?.id;
    setIsFormOpen(false);
    setCandidateToEdit(null);

    // Appel API en arrière-plan
    try {
      if (isEditing) {
        await updateCandidate(editId, candidateData);
        showNotification('Candidat mis à jour avec succès', 'success');
      } else {
        await addCandidate(candidateData);
        showNotification('Candidat créé avec succès', 'success');
      }
    } catch (error) {
      console.error('Erreur formulaire:', error);
      // L'erreur est déjà gérée dans useCandidates
    }
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
    setSelectedCandidate(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setCandidateToEdit(null);
  };

  // Statistiques rapides
  const stats = useMemo(() => {
    return {
      total: candidates.length,
      active: candidates.filter((c) => c.status === 'active').length,
      passive: candidates.filter((c) => c.status === 'passive').length,
      favorites: candidates.filter((c) => c.favorite).length,
    };
  }, [candidates]);

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
      title="Candidats"
      subtitle={`Gérez vos ${candidates.length} candidats`}
      actions={
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Import CSV (input caché) */}
          <input
            ref={importInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleImportCSV}
          />
          <button
            onClick={() => importInputRef.current?.click()}
            style={{
              padding: '10px 18px', border: '1.5px solid #E5E7EB',
              borderRadius: '10px', background: 'white',
              color: '#374151', cursor: 'pointer', fontWeight: '600',
              fontSize: '14px', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#667EEA'; e.currentTarget.style.color = '#667EEA'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; }}
            title="Importer depuis un fichier CSV"
          >
            📥 Importer CSV
          </button>
          <button
            onClick={handleExportCSV}
            style={{
              padding: '10px 18px', border: '1.5px solid #10B981',
              borderRadius: '10px', background: 'white',
              color: '#10B981', cursor: 'pointer', fontWeight: '600',
              fontSize: '14px', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#10B981'; }}
            title={`Exporter ${filteredCandidates.length} candidat(s) en CSV`}
          >
            📤 Exporter CSV ({filteredCandidates.length})
          </button>
          <button
            onClick={() => { setComparisonCandidates(filteredCandidates.slice(0, 2)); setIsComparisonOpen(true); }}
            style={{
              padding: '10px 18px', border: '1.5px solid #8B5CF6',
              borderRadius: '10px', background: 'white',
              color: '#8B5CF6', cursor: 'pointer', fontWeight: '600',
              fontSize: '14px', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#8B5CF6'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#8B5CF6'; }}
            title="Comparer des candidats côte-à-côte"
          >
            ⚖️ Comparer
          </button>
          <Button variant="primary" onClick={handleCreateClick}>
            ➕ Nouveau Candidat
          </Button>
        </div>
      }
    >
      {/* Statistiques */}
      <div style={statsContainerStyles}>
        <div style={statCardStyles}>
          <div style={statValueStyles}>{stats.total}</div>
          <div style={statLabelStyles}>👥 Total</div>
        </div>
        <div style={statCardStyles}>
          <div style={{ ...statValueStyles, background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {stats.active}
          </div>
          <div style={statLabelStyles}>✅ Actifs</div>
        </div>
        <div style={statCardStyles}>
          <div style={{ ...statValueStyles, background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {stats.passive}
          </div>
          <div style={statLabelStyles}>💤 Passifs</div>
        </div>
        <div style={statCardStyles}>
          <div style={{ ...statValueStyles, background: 'linear-gradient(135deg, #FF6B9D 0%, #C471F5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {stats.favorites}
          </div>
          <div style={statLabelStyles}>⭐ Favoris</div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div style={filtersContainerStyles}>
        <div style={searchInputStyles}>
          <Input
            type="search"
            placeholder="🔍 Rechercher par nom, poste, compétences..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={selectStyles}>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">👥 Tous les statuts</option>
            <option value="active">✅ Actifs</option>
            <option value="passive">💤 Passifs</option>
            <option value="hired">🎉 Recrutés</option>
          </Select>
        </div>

        <div style={selectStyles}>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date_desc">📅 Plus récents</option>
            <option value="date_asc">📅 Plus anciens</option>
            <option value="name">🔤 Nom (A-Z)</option>
            <option value="experience">💼 Expérience</option>
          </Select>
        </div>
      </div>

      {/* Liste des candidats */}
      <CandidateList
        candidates={filteredCandidates}
        onCandidateClick={handleCandidateClick}
        emptyMessage={
          searchQuery || statusFilter !== 'all'
            ? 'Aucun candidat ne correspond à vos critères'
            : 'Aucun candidat pour le moment. Créez-en un !'
        }
      />

      {/* Modal de détail */}
      <CandidateDetail
        candidate={selectedCandidate}
        isOpen={isDetailOpen}
        onClose={handleDetailClose}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Modal de formulaire */}
      <CandidateForm
        candidate={candidateToEdit}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />

      {/* Modal de comparaison */}
      <CandidateComparison
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        initialCandidates={comparisonCandidates}
      />
    </PageContainer>
  );
}

export default CandidatesPage;
