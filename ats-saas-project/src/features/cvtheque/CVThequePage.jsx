import React, { useState, useMemo } from 'react';
import PageContainer from '@/shared/components/Layout/PageContainer';
import Input from '@/shared/components/Form/Input';
import CVThequeFilters from './components/CVThequeFilters';
import CVThequeGrid from './components/CVThequeGrid';
import CandidateDetail from '@/features/candidates/components/CandidateDetail';
import { useCandidates } from '@/core/hooks/useCandidates';
import { useDebounce } from '@/core/hooks/useDebounce';

/**
 * Page CVthèque - Base de données candidates avec filtres avancés + recherche optimisée
 */
export function CVThequePage() {
  const { candidates, toggleFavorite, editCandidate, removeCandidate } = useCandidates();

  // États locaux
  const [searchQuery, setSearchQuery] = useState('');

  // 🔥 Debounce de la recherche (300ms) - Optimisation performance
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [filters, setFilters] = useState({
    metier: '',
    sector: '',
    department: '',
    minExperience: '',
    source: '',
    availability: '',
    dateAdded: '',
    tags: [],
    favoritesOnly: false,
  });

  // Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filtrage avancé avec debounce sur la recherche
  const filteredCandidates = useMemo(() => {
    let filtered = candidates;

    // Recherche textuelle (avec debounce pour optimiser les performances)
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(query) ||
          candidate.position.toLowerCase().includes(query) ||
          candidate.email.toLowerCase().includes(query) ||
          (candidate.skills && candidate.skills.some((skill) => skill.toLowerCase().includes(query)))
      );
    }

    // Filtre métier
    if (filters.metier) {
      filtered = filtered.filter((c) => c.metier === filters.metier);
    }

    // Filtre secteur
    if (filters.sector) {
      filtered = filtered.filter((c) => c.sector === filters.sector);
    }

    // Filtre département
    if (filters.department) {
      filtered = filtered.filter((c) => c.department === filters.department);
    }

    // Filtre expérience minimale
    if (filters.minExperience) {
      const minExp = parseInt(filters.minExperience);
      filtered = filtered.filter((c) => c.experience >= minExp);
    }

    // Filtre source
    if (filters.source) {
      filtered = filtered.filter((c) => c.source === filters.source);
    }

    // Filtre disponibilité
    if (filters.availability) {
      filtered = filtered.filter((c) => c.availability === filters.availability);
    }

    // Filtre date d'ajout
    if (filters.dateAdded) {
      const now = new Date();
      const filterDate = (dateString) => {
        if (!dateString) return false;
        const candidateDate = new Date(dateString);

        switch (filters.dateAdded) {
          case 'today':
            return candidateDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return candidateDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return candidateDate >= monthAgo;
          case '3months':
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            return candidateDate >= threeMonthsAgo;
          case '6months':
            const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
            return candidateDate >= sixMonthsAgo;
          case 'year':
            const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            return candidateDate >= yearAgo;
          default:
            return true;
        }
      };

      filtered = filtered.filter((c) => filterDate(c.dateAdded));
    }

    // Filtre tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((c) => {
        const candidateTags = c.tags || [];
        return filters.tags.some(tagId => candidateTags.includes(tagId));
      });
    }

    // Filtre favoris
    if (filters.favoritesOnly) {
      filtered = filtered.filter((c) => c.favorite);
    }

    return filtered;
  }, [candidates, debouncedSearch, filters]); // 🔥 Utilise debouncedSearch au lieu de searchQuery

  const handleCandidateClick = (candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailOpen(true);
  };

  const handleResetFilters = () => {
    setFilters({
      metier: '',
      sector: '',
      department: '',
      minExperience: '',
      source: '',
      availability: '',
      dateAdded: '',
      tags: [],
      favoritesOnly: false,
    });
    setSearchQuery('');
  };

  const handleToggleFavorite = (candidate) => {
    toggleFavorite(candidate.id);
    if (selectedCandidate?.id === candidate.id) {
      setSelectedCandidate({ ...candidate, favorite: !candidate.favorite });
    }
  };

  const layoutStyles = {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: '32px',
    alignItems: 'start',
  };

  const mainContentStyles = {
    minWidth: 0,
  };

  const searchContainerStyles = {
    marginBottom: '24px',
  };

  const resultsCountStyles = {
    fontSize: '16px',
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: '24px',
  };

  return (
    <PageContainer
      title="CVthèque"
      subtitle="Base de données intelligente de candidats"
    >
      <div style={layoutStyles}>
        {/* Filtres à gauche */}
        <CVThequeFilters
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
        />

        {/* Contenu principal à droite */}
        <div style={mainContentStyles}>
          {/* Recherche */}
          <div style={searchContainerStyles}>
            <Input
              type="search"
              placeholder="🔍 Rechercher par nom, poste, compétences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Compteur de résultats */}
          <div style={resultsCountStyles}>
            {filteredCandidates.length} candidat{filteredCandidates.length > 1 ? 's' : ''} trouvé{filteredCandidates.length > 1 ? 's' : ''}
          </div>

          {/* Grille de candidats */}
          <CVThequeGrid
            candidates={filteredCandidates}
            onCandidateClick={handleCandidateClick}
          />
        </div>
      </div>

      {/* Modal de détail */}
      <CandidateDetail
        candidate={selectedCandidate}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedCandidate(null);
        }}
        onEdit={(candidate) => {
          // TODO: Ouvrir formulaire d'édition
          console.log('Edit candidate:', candidate);
        }}
        onDelete={(candidate) => {
          if (window.confirm(`Supprimer ${candidate.name} ?`)) {
            removeCandidate(candidate.id);
            setIsDetailOpen(false);
          }
        }}
        onToggleFavorite={handleToggleFavorite}
      />
    </PageContainer>
  );
}

export default CVThequePage;
