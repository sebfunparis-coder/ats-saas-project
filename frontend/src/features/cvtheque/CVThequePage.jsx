import React, { useState, useMemo } from 'react';
import PageContainer from '@/shared/components/Layout/PageContainer';
import Input from '@/shared/components/Form/Input';
import CVThequeFilters from './components/CVThequeFilters';
import CVThequeGrid from './components/CVThequeGrid';
import CandidateMapView from './components/CandidateMapView';
import CandidateDetail from '@/features/candidates/components/CandidateDetail';
import CandidateForm from '@/features/candidates/components/CandidateForm';
import { useCandidates } from '@/core/hooks/useCandidates';
import { useConfirm } from '@/core/contexts/ConfirmContext';
import { useDebounce } from '@/core/hooks/useDebounce';
import StatsCard, { StatsGrid } from '@/shared/components/StatsCard/StatsCard';

// Boolean search parser: "React AND (Paris OR Remote) NOT Junior"
function parseBooleanQuery(text) {
  if (!text.trim()) return null;
  // Tokenise: keywords AND OR NOT ( )
  const tokens = text.match(/\bAND\b|\bOR\b|\bNOT\b|[()"]|"[^"]*"|\S+/g) || [];
  // Build chips for display
  const chips = tokens.map(t => {
    const up = t.toUpperCase();
    if (up === 'AND') return { token: t, type: 'AND' };
    if (up === 'OR') return { token: t, type: 'OR' };
    if (up === 'NOT') return { token: t, type: 'NOT' };
    if (t === '(' || t === ')') return { token: t, type: 'PAREN' };
    return { token: t.replace(/"/g, ''), type: 'TERM' };
  });

  // T-394 : quand l'expression générée est syntaxiquement invalide (ex.
  // termes non séparés par AND/OR explicite — "React Python"), `new Function`
  // lève une SyntaxError, catchée silencieusement, et le repli bascule en
  // logique OU simple sans jamais prévenir l'utilisateur — qui croit alors
  // avoir fait une recherche booléenne précise alors que ce n'est pas le cas.
  // La validité syntaxique ne dépend que de la structure des tokens (AND/OR/
  // NOT/parenthèses), jamais du contenu d'un candidat précis — vérifiable une
  // seule fois ici plutôt que redondamment à chaque candidat dans matchCandidate.
  let usedFallback = false;
  try {
    const dummyExpr = tokens.map(t => {
      const up = t.toUpperCase();
      if (up === 'AND') return '&&';
      if (up === 'OR') return '||';
      if (up === 'NOT') return '!';
      if (t === '(' || t === ')') return t;
      return 'true';
    }).join(' ');
    // eslint-disable-next-line no-new-func
    new Function(`return ${dummyExpr}`)();
  } catch {
    usedFallback = true;
  }

  // Evaluate against a candidate haystack string
  const matchCandidate = (candidate) => {
    const haystack = `${candidate.name} ${candidate.position} ${candidate.metier || ''} ${candidate.sector || ''} ${(candidate.skills || []).join(' ')} ${candidate.location || ''}`.toLowerCase();
    if (usedFallback) {
      const allTerms = tokens.filter(t => !['AND','OR','NOT','(',')'].includes(t.toUpperCase()));
      return allTerms.some(t => haystack.includes(t.replace(/"/g, '').toLowerCase()));
    }
    // Build a JS-evaluable expression (safe: only string-match operations)
    const expr = tokens.map(t => {
      const up = t.toUpperCase();
      if (up === 'AND') return '&&';
      if (up === 'OR') return '||';
      if (up === 'NOT') return '!';
      if (t === '(' || t === ')') return t;
      const clean = t.replace(/"/g, '').toLowerCase();
      return haystack.includes(clean) ? 'true' : 'false';
    }).join(' ');

    // eslint-disable-next-line no-new-func
    return new Function(`return ${expr}`)();
  };

  return { chips, matchCandidate, usedFallback };
}

// Simple rule-based natural language parser
function parseSemanticQuery(text) {
  if (!text.trim()) return null;
  const lower = text.toLowerCase();
  const parsed = { skills: [], minExperience: null, location: null, remote: false, terms: [] };

  // Experience levels
  if (/\bsenior\b/.test(lower)) parsed.minExperience = 5;
  else if (/\bjunior\b/.test(lower)) { parsed.minExperience = 0; parsed.maxExperience = 2; }
  else if (/\b(confirm[eé]|mid)\b/.test(lower)) { parsed.minExperience = 3; parsed.maxExperience = 6; }
  const expMatch = lower.match(/(\d+)\s*(?:ans?|années?)\s*(?:d'?(?:expérience|exp))/);
  if (expMatch) parsed.minExperience = parseInt(expMatch[1]);

  // Remote/télétravail
  if (/\b(remote|t[eé]l[eé]travail|full.?remote)\b/.test(lower)) parsed.remote = true;

  // French cities
  const cityRe = /\b(paris|lyon|bordeaux|marseille|toulouse|nantes|lille|strasbourg|rennes|montpellier|nice|grenoble)\b/i;
  const cityMatch = text.match(cityRe);
  if (cityMatch) parsed.location = cityMatch[1];

  // Tech skills
  const TECH = ['react', 'vue', 'angular', 'javascript', 'typescript', 'node', 'python', 'java', 'php', 'ruby', 'swift', 'kotlin', 'go', 'rust', 'css', 'html', 'sql', 'mongodb', 'postgres', 'mysql', 'aws', 'docker', 'kubernetes', 'figma', 'ux', 'ui', 'devops', 'machine learning', 'data science', 'ios', 'android', 'flutter', 'react native'];
  TECH.forEach(t => { if (lower.includes(t)) parsed.skills.push(t); });

  // Remaining terms (not matched above)
  const leftover = text
    .replace(/(senior|junior|confirm[eé]|mid|remote|t[eé]l[eé]travail|full[- ]?remote)/gi, '')
    .replace(cityRe, '')
    .replace(expMatch ? expMatch[0] : '', '')
    .replace(new RegExp(`\\b(${TECH.join('|')})\\b`, 'gi'), '')
    .trim();
  if (leftover) parsed.terms = leftover.split(/\s+/).filter(w => w.length > 2);

  return parsed;
}

/**
 * Page CVthèque - Base de données candidates avec filtres avancés + recherche optimisée
 */
export function CVThequePage() {
  const { candidates, loading: candidatesLoading, toggleFavorite, editCandidate, removeCandidate } = useCandidates();
  const { confirm } = useConfirm();

  // États locaux
  const [searchQuery, setSearchQuery] = useState('');
  const [semanticQuery, setSemanticQuery] = useState('');
  const debouncedSemantic = useDebounce(semanticQuery, 400);
  const [booleanQuery, setBooleanQuery] = useState('');
  const debouncedBoolean = useDebounce(booleanQuery, 400);
  const booleanParsed = useMemo(() => parseBooleanQuery(debouncedBoolean), [debouncedBoolean]);

  // 🔥 Debounce de la recherche (300ms) - Optimisation performance
  const debouncedSearch = useDebounce(searchQuery, 300);

  const semanticParsed = useMemo(() => parseSemanticQuery(debouncedSemantic), [debouncedSemantic]);

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

  // Modal + vue
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  // T-371 : le bouton "Modifier" du détail candidat ne faisait rien (TODO
  // jamais complété) — même formulaire que CandidatesPage.jsx.
  const [candidateToEdit, setCandidateToEdit] = useState(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  // Recherches sauvegardées
  const SAVED_KEY = 'ats_cvtheque_saved_searches';
  const [savedSearches, setSavedSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); } catch { return []; }
  });

  const handleSaveSearch = () => {
    const name = window.prompt('Nom de cette recherche :');
    if (!name) return;
    const newSaved = [...savedSearches, { name, filters, searchQuery, semanticQuery, createdAt: new Date().toISOString() }];
    setSavedSearches(newSaved);
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(newSaved)); } catch {}
  };

  const handleLoadSearch = (saved) => {
    setFilters(saved.filters);
    setSearchQuery(saved.searchQuery || '');
    setSemanticQuery(saved.semanticQuery || '');
  };

  const handleDeleteSearch = (idx) => {
    const newSaved = savedSearches.filter((_, i) => i !== idx);
    setSavedSearches(newSaved);
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(newSaved)); } catch {}
  };

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

    // Recherche sémantique
    if (semanticParsed) {
      const { skills, minExperience, maxExperience, location, remote, terms } = semanticParsed;
      if (skills.length > 0) {
        filtered = filtered.filter(c => {
          const cSkills = (c.skills || []).map(s => s.toLowerCase());
          return skills.some(s => cSkills.some(cs => cs.includes(s)));
        });
      }
      if (minExperience !== null) filtered = filtered.filter(c => Number(c.experience) >= minExperience);
      if (maxExperience !== undefined) filtered = filtered.filter(c => Number(c.experience) <= maxExperience);
      if (location) filtered = filtered.filter(c => c.location?.toLowerCase().includes(location.toLowerCase()));
      if (remote) filtered = filtered.filter(c => {
        const av = (c.availability || '').toLowerCase();
        return av.includes('remote') || av.includes('télétravail') || av.includes('teletravail');
      });
      if (terms.length > 0) {
        filtered = filtered.filter(c => terms.some(t => {
          const haystack = `${c.name} ${c.position} ${c.metier} ${c.sector} ${(c.skills || []).join(' ')}`.toLowerCase();
          return haystack.includes(t.toLowerCase());
        }));
      }
    }

    // Boolean search filter
    if (booleanParsed) {
      filtered = filtered.filter(c => booleanParsed.matchCandidate(c));
    }

    return filtered;
  }, [candidates, debouncedSearch, filters, semanticParsed, booleanParsed]);

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
    setSemanticQuery('');
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

  const stats = {
    total: candidates.length,
    active: candidates.filter((c) => c.status === 'active').length,
    passive: candidates.filter((c) => c.status === 'passive').length,
    archived: candidates.filter((c) => c.status === 'archived').length,
    favorites: candidates.filter((c) => c.favorite).length,
    withCv: candidates.filter((c) => !!c.resume).length,
  };

  return (
    <PageContainer
      title="CVthèque"
      subtitle="Base de données intelligente de candidats"
    >
      {/* Statistiques */}
      <StatsGrid>
        <StatsCard icon="👥" label="Total" value={stats.total} color="#667EEA" />
        <StatsCard icon="✅" label="Actifs" value={stats.active} color="#10B981" />
        <StatsCard icon="💤" label="Passifs" value={stats.passive} color="#F59E0B" />
        <StatsCard icon="🗄️" label="Archivés" value={stats.archived} color="#6B7280" />
        <StatsCard icon="⭐" label="Favoris" value={stats.favorites} color="#FF6B9D" />
        <StatsCard icon="📄" label="Avec CV" value={stats.withCv} color="#3B82F6" />
      </StatsGrid>

      <div style={layoutStyles}>
        {/* Filtres à gauche */}
        <CVThequeFilters
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
        />

        {/* Contenu principal à droite */}
        <div style={mainContentStyles}>
          {/* Recherche sémantique */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder='🔮 Recherche sémantique — ex: "dev React senior Paris remote"'
                value={semanticQuery}
                onChange={e => setSemanticQuery(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '12px 16px', border: '2px solid #667EEA',
                  borderRadius: '12px', fontSize: '14px', color: '#1F2937',
                  outline: 'none', fontFamily: 'inherit',
                  background: 'linear-gradient(135deg, #EEF2FF 0%, white 100%)',
                }}
              />
            </div>
            {semanticParsed && (semanticParsed.skills.length > 0 || semanticParsed.minExperience !== null || semanticParsed.location || semanticParsed.remote || semanticParsed.terms.length > 0) && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase' }}>Critères :</span>
                {semanticParsed.skills.map(s => (
                  <span key={s} style={{ padding: '2px 8px', background: '#EFF6FF', color: '#3B82F6', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>⚡ {s}</span>
                ))}
                {semanticParsed.minExperience !== null && (
                  <span style={{ padding: '2px 8px', background: '#F5F3FF', color: '#7C3AED', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>💼 ≥{semanticParsed.minExperience} ans</span>
                )}
                {semanticParsed.location && (
                  <span style={{ padding: '2px 8px', background: '#ECFDF5', color: '#10B981', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>📍 {semanticParsed.location}</span>
                )}
                {semanticParsed.remote && (
                  <span style={{ padding: '2px 8px', background: '#FEF3C7', color: '#D97706', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>🏠 Remote</span>
                )}
                {semanticParsed.terms.map(t => (
                  <span key={t} style={{ padding: '2px 8px', background: '#F3F4F6', color: '#6B7280', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>"{t}"</span>
                ))}
              </div>
            )}
          </div>

          {/* Recherche boolean */}
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              placeholder='⚙️ Recherche boolean — ex: "React AND (Paris OR Remote) NOT Junior"'
              value={booleanQuery}
              onChange={e => setBooleanQuery(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '12px 16px', border: '2px solid #10B981',
                borderRadius: '12px', fontSize: '14px', color: '#1F2937',
                outline: 'none', fontFamily: 'inherit',
                background: 'linear-gradient(135deg, #ECFDF510 0%, white 100%)',
              }}
            />
            {booleanParsed && booleanParsed.chips.length > 0 && (
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', marginRight: '4px' }}>Expression :</span>
                {booleanParsed.chips.map((chip, i) => {
                  const styles = {
                    AND: { background: '#EFF6FF', color: '#3B82F6', fontWeight: '900' },
                    OR:  { background: '#ECFDF5', color: '#10B981', fontWeight: '900' },
                    NOT: { background: '#FEF2F2', color: '#EF4444', fontWeight: '900' },
                    PAREN: { background: '#F3F4F6', color: '#374151', fontWeight: '700' },
                    TERM: { background: '#F5F3FF', color: '#7C3AED', fontWeight: '700' },
                  };
                  const s = styles[chip.type] || styles.TERM;
                  return (
                    <span key={i} style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', ...s }}>
                      {chip.token}
                    </span>
                  );
                })}
                <button
                  onClick={() => setBooleanQuery('')}
                  style={{ marginLeft: '4px', padding: '2px 8px', background: '#F3F4F6', border: 'none', borderRadius: '20px', fontSize: '11px', cursor: 'pointer', color: '#6B7280' }}
                >
                  ✕ effacer
                </button>
              </div>
            )}
            {/* T-394 : expression syntaxiquement invalide (ex. termes non séparés
                par AND/OR) — le repli en mode OU simple était auparavant silencieux */}
            {booleanParsed?.usedFallback && (
              <div style={{ marginTop: '6px', padding: '6px 10px', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px', fontSize: '12px', color: '#92400E', fontWeight: '600' }}>
                ⚠️ Expression non reconnue (opérateur AND/OR manquant entre certains termes) — recherche interprétée en mode OU simple (au moins un terme présent).
              </div>
            )}
          </div>

          {/* Recherche classique */}
          <div style={searchContainerStyles}>
            <Input
              type="search"
              placeholder="🔍 Rechercher par nom, poste, compétences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Recherches sauvegardées */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: savedSearches.length > 0 ? '8px' : 0 }}>
              <button
                onClick={handleSaveSearch}
                style={{
                  padding: '6px 14px', border: '1.5px solid #10B981', borderRadius: '8px',
                  background: 'white', color: '#10B981', cursor: 'pointer',
                  fontSize: '12px', fontWeight: '700',
                }}
              >
                💾 Sauvegarder cette recherche
              </button>
            </div>
            {savedSearches.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {savedSearches.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '4px 6px', background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: '8px' }}>
                    <button
                      onClick={() => handleLoadSearch(s)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: '#065F46', padding: '0 4px' }}
                    >
                      🔖 {s.name}
                    </button>
                    <button
                      onClick={() => handleDeleteSearch(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#6B7280', padding: '0 2px' }}
                      title="Supprimer"
                      aria-label="Supprimer la recherche sauvegardée"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Compteur de résultats */}
          <div style={resultsCountStyles}>
            {filteredCandidates.length} candidat{filteredCandidates.length > 1 ? 's' : ''} trouvé{filteredCandidates.length > 1 ? 's' : ''}
          </div>

          {/* Toggle vue */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {[{ mode: 'grid', label: '⊞ Grille' }, { mode: 'map', label: '🗺️ Carte' }].map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                  cursor: 'pointer',
                  border: `1.5px solid ${viewMode === mode ? '#667EEA' : '#E5E7EB'}`,
                  background: viewMode === mode ? '#EEF2FF' : 'white',
                  color: viewMode === mode ? '#667EEA' : '#6B7280',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Contenu selon la vue */}
          {viewMode === 'grid' ? (
            <CVThequeGrid
              candidates={filteredCandidates}
              onCandidateClick={handleCandidateClick}
              loading={candidatesLoading}
            />
          ) : (
            <CandidateMapView candidates={filteredCandidates} />
          )}
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
          setCandidateToEdit(candidate);
          setIsDetailOpen(false);
          setIsEditFormOpen(true);
        }}
        onDelete={async (candidate) => {
          if (await confirm(`Supprimer ${candidate.name} ?`, { title: 'Supprimer le candidat' })) {
            removeCandidate(candidate.id);
            setIsDetailOpen(false);
          }
        }}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Modal d'édition (T-371) */}
      <CandidateForm
        candidate={candidateToEdit}
        isOpen={isEditFormOpen}
        onClose={() => {
          setIsEditFormOpen(false);
          setCandidateToEdit(null);
        }}
        onSubmit={async (candidateData) => {
          const editId = candidateToEdit?.id;
          setIsEditFormOpen(false);
          setCandidateToEdit(null);
          try {
            await editCandidate(editId, candidateData);
          } catch (error) {
            console.error('Erreur édition candidat (CVthèque):', error);
          }
        }}
      />
    </PageContainer>
  );
}

export default CVThequePage;
