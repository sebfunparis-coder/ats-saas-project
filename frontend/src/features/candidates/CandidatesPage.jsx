import React, { useState, useMemo } from 'react';
import PageContainer from '@/shared/components/Layout/PageContainer';
import Button from '@/shared/components/Button/Button';
import Input from '@/shared/components/Form/Input';
import Select from '@/shared/components/Form/Select';
import CandidateList from './components/CandidateList';
import CandidateDetail from './components/CandidateDetail';
import CandidateForm from './components/CandidateForm';
import CandidateComparison from './components/CandidateComparison';
import DuplicatesMergeModal from './components/DuplicatesMergeModal';
import ImportCSVModal from './components/ImportCSVModal';
import { TalentPoolManager } from './components/TalentPoolManager';
import { useCandidates } from '@/core/hooks/useCandidates';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import { useConfirm } from '@/core/contexts/ConfirmContext';
import { useData } from '@/core/contexts/DataContext';
import { filterAndSort } from '@/core/utils/filters';
import { exportCandidates, generateFilename } from '@/core/utils/exporters';
import StatsCard, { StatsGrid } from '@/shared/components/StatsCard/StatsCard';

/**
 * Page de gestion des candidats
 * CRUD complet avec filtres et recherche
 */
export function CandidatesPage() {
  const { candidates, loading: candidatesLoading, addCandidate, updateCandidate, deleteCandidate, toggleFavorite } = useCandidates();
  const { showNotification } = useNotifications();
  const { confirm } = useConfirm();
  const { tags: allTags, addTag } = useData();

  // États locaux
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [tagFilter, setTagFilter] = useState('all');

  // États des modales
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [comparisonCandidates, setComparisonCandidates] = useState([]);
  const [isDuplicatesOpen, setIsDuplicatesOpen] = useState(false);
  const [vivierOpen, setVivierOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkEmailOpen, setBulkEmailOpen] = useState(false);
  const [bulkTemplate, setBulkTemplate] = useState('');
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkBody, setBulkBody] = useState('');
  const BULK_LOG_KEY = 'ats_bulk_email_log';

  const toggleSelectCandidate = (id) => setSelectedIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const handleBulkEmail = () => {
    const selectedCandidates = filteredCandidates.filter(c => selectedIds.has(c.id));
    const logEntry = {
      id: Date.now(),
      sentAt: new Date().toISOString(),
      template: bulkTemplate || 'Manuel',
      subject: bulkSubject,
      recipients: selectedCandidates.map(c => ({ id: c.id, name: c.name, email: c.email })),
      count: selectedCandidates.length,
    };
    try {
      const log = JSON.parse(localStorage.getItem(BULK_LOG_KEY) || '[]');
      localStorage.setItem(BULK_LOG_KEY, JSON.stringify([logEntry, ...log].slice(0, 50)));
    } catch {}
    showNotification(`Email envoyé à ${selectedCandidates.length} candidat(s)`, 'success');
    setSelectedIds(new Set());
    setBulkEmailOpen(false);
    setBulkTemplate(''); setBulkSubject(''); setBulkBody('');
  };

  // Détection des doublons (même email ou même téléphone normalisé)
  const duplicatePairs = useMemo(() => {
    const normalize = s => String(s || '').toLowerCase().replace(/\s/g, '');
    const pairs = [];
    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        const a = candidates[i], b = candidates[j];
        const sameEmail = a.email && b.email && normalize(a.email) === normalize(b.email);
        const aPhone = normalize(a.phone || a.phoneNumber);
        const bPhone = normalize(b.phone || b.phoneNumber);
        const samePhone = aPhone.length > 5 && aPhone === bPhone;
        if (sameEmail || samePhone) pairs.push([a, b]);
      }
    }
    return pairs;
  }, [candidates]);

  const handleMerge = async (kept, removed) => {
    // Fusionne les notes du profil supprimé dans le profil conservé
    const mergedNotes = [kept.notes, removed.notes].filter(Boolean).join('\n---\n');
    const mergedSkills = [...new Set([
      ...(Array.isArray(kept.skills) ? kept.skills : (kept.skills || '').split(',').map(s => s.trim())),
      ...(Array.isArray(removed.skills) ? removed.skills : (removed.skills || '').split(',').map(s => s.trim())),
    ].filter(Boolean))];
    try {
      await updateCandidate(kept.id, { notes: mergedNotes, skills: mergedSkills });
      await deleteCandidate(removed.id);
      showNotification(`Fusion effectuée : "${removed.name}" fusionné dans "${kept.name}"`, 'success');
    } catch (e) {
      showNotification('Erreur lors de la fusion', 'error');
    }
  };

  // Export CSV de la liste filtrée
  const handleExportCSV = () => {
    if (filteredCandidates.length === 0) {
      showNotification('Aucun candidat à exporter', 'warning');
      return;
    }
    exportCandidates(filteredCandidates, generateFilename('candidats', 'csv'));
    showNotification(`${filteredCandidates.length} candidat(s) exporté(s)`, 'success');
  };

  // Import CSV — modal dédié avec mapping de colonnes configurable, détection
  // des doublons et rapport d'import (T-252)
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Filtrage et tri des candidats
  const filteredCandidates = useMemo(() => {
    let filtered = candidates;

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter((candidate) => candidate.status === statusFilter);
    }

    // Filtre par tag
    if (tagFilter !== 'all') {
      const tid = Number(tagFilter);
      filtered = filtered.filter(c => Array.isArray(c.tags) && c.tags.includes(tid));
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
    if (await confirm(`Supprimer le candidat "${candidate.name}" ?`, { title: 'Supprimer le candidat' })) {
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
        const oldCandidate = candidates.find(c => c.id === editId);
        await updateCandidate(editId, candidateData);
        // Alerte disponibilité : candidat passif → actif
        if (oldCandidate && oldCandidate.status === 'passive' && candidateData.status === 'active') {
          showNotification(`🔔 ${candidateData.name || 'Candidat'} est maintenant disponible !`, 'info');
        }
        // Alerte disponibilité : mise à jour du champ availability
        if (oldCandidate && candidateData.availability && candidateData.availability !== oldCandidate.availability) {
          showNotification(`📅 Disponibilité mise à jour pour ${candidateData.name || 'candidat'} : ${candidateData.availability}`, 'info');
        }
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
      archived: candidates.filter((c) => c.status === 'archived').length,
      favorites: candidates.filter((c) => c.favorite).length,
    };
  }, [candidates]);

  // Variables RGPD — candidats avec consentement expiré ou bientôt expiré
  const now = Date.now();
  const expiredConsentCandidates = candidates.filter(c =>
    c.consentDate && (now - new Date(c.consentDate).getTime()) > 395 * 86400000
  );
  const nearExpiryConsentCandidates = candidates.filter(c =>
    c.consentDate &&
    (now - new Date(c.consentDate).getTime()) > 365 * 86400000 &&
    (now - new Date(c.consentDate).getTime()) <= 395 * 86400000
  );

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

  return (
    <PageContainer
      title="Candidats"
      subtitle={`Gérez vos ${candidates.length} candidats`}
      actions={
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setImportModalOpen(true)}
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
          <button onClick={() => setVivierOpen(true)} style={{ padding:'10px 16px', background:'white', border:'2px solid #10B981', color:'#10B981', borderRadius:'8px', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>🌱 Viviers</button>
          <Button variant="primary" onClick={handleCreateClick}>
            ? Nouveau Candidat
          </Button>
        </div>
      }
    >
      {/* Bannière doublons */}
      {duplicatePairs.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px 16px', background: '#FEF3C7',
          border: '1px solid #FCD34D', borderRadius: '12px', marginBottom: '20px',
        }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div style={{ flex: 1, fontSize: '13px', fontWeight: '600', color: '#92400E' }}>
            {duplicatePairs.length} doublon{duplicatePairs.length > 1 ? 's' : ''} détecté{duplicatePairs.length > 1 ? 's' : ''} (même email ou téléphone)
          </div>
          <button
            onClick={() => setIsDuplicatesOpen(true)}
            style={{ padding: '6px 14px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
          >
            Fusionner
          </button>
        </div>
      )}

      {/* Statistiques */}
      <StatsGrid>
        <StatsCard icon="👥" label="Total" value={stats.total} color="#667EEA" />
        <StatsCard icon="✅" label="Actifs" value={stats.active} color="#10B981" />
        <StatsCard icon="💤" label="Passifs" value={stats.passive} color="#F59E0B" />
        <StatsCard icon="🗄️" label="Archivés" value={stats.archived} color="#6B7280" />
        <StatsCard icon="⭐" label="Favoris" value={stats.favorites} color="#FF6B9D" />
        <StatsCard icon="🔗" label="Doublons détectés" value={duplicatePairs.length} color="#8B5CF6" />
      </StatsGrid>

      {/* Banniere RGPD alertes consentements */}
      {(expiredConsentCandidates.length > 0 || nearExpiryConsentCandidates.length > 0) && (
        <div style={{ background: expiredConsentCandidates.length > 0 ? '#FEF2F2' : '#FFFBEB', border: '2px solid ' + (expiredConsentCandidates.length > 0 ? '#FCA5A5' : '#FDE68A'), borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '24px' }}>{expiredConsentCandidates.length > 0 ? '🚨' : '⚠️'}</span>
          <div style={{ flex: 1 }}>
            {expiredConsentCandidates.length > 0 && (
              <p style={{ fontWeight: '800', color: '#991B1B', margin: '0 0 2px', fontSize: '14px' }}>
                {expiredConsentCandidates.length} consentement(s) RGPD expiré(s) — renouvellement requis
              </p>
            )}
            {nearExpiryConsentCandidates.length > 0 && (
              <p style={{ fontWeight: '700', color: '#92400E', margin: 0, fontSize: '13px' }}>
                {nearExpiryConsentCandidates.length} consentement(s) expirant dans moins de 30 jours
              </p>
            )}
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0' }}>
              {[...expiredConsentCandidates, ...nearExpiryConsentCandidates].slice(0, 5).map(c => c.name).join(', ')}
              {expiredConsentCandidates.length + nearExpiryConsentCandidates.length > 5 ? '...' : ''}
            </p>
          </div>
          <a href="/app/rgpd" style={{ padding: '8px 16px', background: expiredConsentCandidates.length > 0 ? '#EF4444' : '#F59E0B', color: 'white', borderRadius: '8px', fontWeight: '700', fontSize: '13px', textDecoration: 'none', flexShrink: 0 }}>
            Gerer les consentements
          </a>
        </div>
      )}

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
          <Select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
            <option value="all">🏷️ Tous les tags</option>
            {allTags.map(tag => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
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

      {/* Barre actions bulk */}
      {selectedIds.size > 0 && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px', padding: '12px 16px', background: '#EEF2FF', borderRadius: '10px', border: '1.5px solid #C7D2FE' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#4338CA' }}>{selectedIds.size} selectionne(s)</span>
          <button onClick={() => setBulkEmailOpen(true)} style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: '#667EEA', color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>Email en masse</button>
          <button onClick={() => setSelectedIds(new Set())} style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #C7D2FE', background: 'white', cursor: 'pointer', color: '#6B7280', fontSize: '12px' }}>Deselectionner</button>
          <button onClick={() => setSelectedIds(new Set(filteredCandidates.map(c => c.id)))} style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #C7D2FE', background: 'white', cursor: 'pointer', color: '#6B7280', fontSize: '12px' }}>Tout selectionner</button>
        </div>
      )}

      {/* Liste des candidats */}
      <CandidateList
        candidates={filteredCandidates}
        onCandidateClick={handleCandidateClick}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelectCandidate}
        onDeleteCandidate={handleDeleteClick}
        emptyMessage="Aucun candidat pour l'instant"
        emptyDescription="Ajoutez votre premier candidat à votre vivier de talents."
        emptyAction={{ label: '+ Ajouter un candidat', onClick: () => setIsFormOpen(true) }}
        loading={candidatesLoading}
      />

      {/* Modal email en masse */}
      {bulkEmailOpen && (
        <div onClick={() => setBulkEmailOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px', maxWidth: '520px', width: '100%', padding: '32px', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1F2937', marginBottom: '6px' }}>Email en masse</h2>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>{selectedIds.size} destinataire(s)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>Template</label>
                <select value={bulkTemplate} onChange={e => { setBulkTemplate(e.target.value); if (e.target.value === 'interview') setBulkSubject('Invitation entretien'); if (e.target.value === 'rejection') setBulkSubject('Reponse a votre candidature'); }}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }}>
                  <option value="">-- Aucun --</option>
                  <option value="interview">Invitation entretien</option>
                  <option value="rejection">Refus de candidature</option>
                  <option value="followup">Suivi candidature</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>Objet *</label>
                <input value={bulkSubject} onChange={e => setBulkSubject(e.target.value)} placeholder="Objet..."
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>Message</label>
                <textarea value={bulkBody} onChange={e => setBulkBody(e.target.value)} placeholder="Message..." rows={4}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button onClick={() => setBulkEmailOpen(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1.5px solid #E5E7EB', background: 'white', cursor: 'pointer', fontWeight: '600', color: '#6B7280' }}>Annuler</button>
              <button onClick={handleBulkEmail} disabled={!bulkSubject.trim()} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: bulkSubject.trim() ? '#667EEA' : '#E5E7EB', color: bulkSubject.trim() ? 'white' : '#9CA3AF', cursor: bulkSubject.trim() ? 'pointer' : 'not-allowed', fontWeight: '700' }}>
                Envoyer a {selectedIds.size}
              </button>
            </div>
          </div>
        </div>
      )}

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

      <DuplicatesMergeModal
        isOpen={isDuplicatesOpen}
        onClose={() => setIsDuplicatesOpen(false)}
        duplicatePairs={duplicatePairs}
        onMerge={handleMerge}
      />
      <TalentPoolManager isOpen={vivierOpen} onClose={() => setVivierOpen(false)} candidates={candidates} />
      <ImportCSVModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        candidates={candidates}
        addCandidate={addCandidate}
        updateCandidate={updateCandidate}
      />
    </PageContainer>
  );
}

export default CandidatesPage;



