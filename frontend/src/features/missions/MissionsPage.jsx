import React, { useState, useMemo, useEffect, useRef } from 'react';
import PageContainer from '@/shared/components/Layout/PageContainer';
import Button from '@/shared/components/Button/Button';
import Input from '@/shared/components/Form/Input';
import Select from '@/shared/components/Form/Select';
import MissionList from './components/MissionList';
import StatsCard, { StatsGrid } from '@/shared/components/StatsCard/StatsCard';
import MissionDetail from './components/MissionDetail';
import MissionForm from './components/MissionForm';
import MatchingModal from './components/MatchingModal';
import { useMissions } from '@/core/hooks/useMissions';
import { useCandidates } from '@/core/hooks/useCandidates';
import { useConfirm } from '@/core/contexts/ConfirmContext';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import { filterAndSort } from '@/core/utils/filters';
import { exportMissions, generateFilename } from '@/core/utils/exporters';

const _getLocale = () => { const l = localStorage.getItem('ats_language') || 'fr'; return l.startsWith('en') ? 'en-GB' : 'fr-FR'; };

/**
 * Page de gestion des missions
 * CRUD complet avec filtres et recherche
 */
export function MissionsPage() {
  const { missions, loading: missionsLoading, addMission, updateMission, deleteMission } = useMissions();
  const { confirm } = useConfirm();
  const { candidates } = useCandidates();
  const { showNotification } = useNotifications();

  // États locaux
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  // États des modales
  const [selectedMission, setSelectedMission] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [matchingMission, setMatchingMission] = useState(null);

  // Templates
  const TEMPLATES_KEY = 'ats_mission_templates';
  const [templates, setTemplates] = useState(() => { try { return JSON.parse(localStorage.getItem('ats_mission_templates') || '[]'); } catch { return []; } });
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const handleSaveAsTemplate = (mission) => {
    const tpl = { ...mission, id: Date.now(), isTemplate: true, savedAt: new Date().toISOString(), title: mission.title };
    const next = [tpl, ...templates];
    setTemplates(next);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next));
    showNotification(`Modèle "${tpl.title}" sauvegardé`, 'success');
  };
  const handleDeleteTemplate = (tplId) => {
    const next = templates.filter(t => t.id !== tplId);
    setTemplates(next);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next));
  };
  const handleCreateFromTemplate = (tpl) => {
    setMissionToEdit({ ...tpl, id: undefined, title: `(Modèle) ${tpl.title}`, status: 'draft', dateAdded: new Date().toISOString().slice(0, 10) });
    setTemplatesOpen(false);
    setIsFormOpen(true);
  };
  const [missionToEdit, setMissionToEdit] = useState(null);

  // Détection des missions expirées (ouvertes + inactives > 60 jours)
  const staleMissions = useMemo(() => {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 60);
    return missions.filter(m => {
      if (m.status !== 'open') return false;
      const date = new Date(m.dateAdded || m.createdDate || m.startDate || '2020-01-01');
      return date < threshold;
    });
  }, [missions]);

  const alertShown = useRef(false);
  useEffect(() => {
    if (!alertShown.current && staleMissions.length > 0) {
      alertShown.current = true;
      showNotification(
        `⚠️ ${staleMissions.length} mission${staleMissions.length > 1 ? 's' : ''} ouverte${staleMissions.length > 1 ? 's' : ''} sans activité depuis plus de 60 jours`,
        'warning'
      );
    }
  }, [staleMissions, showNotification]);

  const staleIds = useMemo(() => new Set(staleMissions.map(m => m.id)), [staleMissions]);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const handleArchiveStale = async () => {
    for (const m of staleMissions) {
      try { await updateMission(m.id, { ...m, status: 'closed' }); } catch {}
    }
    setArchiveModalOpen(false);
    showNotification(`${staleMissions.length} mission(s) archivée(s)`, 'info');
  };

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
    if (await confirm(`Supprimer la mission "${mission.title}" ?`, { title: 'Supprimer la mission' })) {
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
        // Alertes disponibilite : notifier si des candidats open-to-opportunities correspondent
        const mSkills = (missionData.skills || []).map(s => s.toLowerCase());
        const openCandidates = candidates.filter(c => c.openToOpportunities);
        const matching = openCandidates.filter(c => {
          if (!mSkills.length) return true;
          const cSkills = (c.skills || []).map(s => s.toLowerCase());
          return mSkills.some(s => cSkills.some(cs => cs.includes(s) || s.includes(cs)));
        });
        if (matching.length > 0) {
          showNotification('[Alerte] ' + matching.length + ' candidat(s) ouvert(s) aux opportunites correspondent a cette mission !', 'info');
        }
        showNotification('Mission créée avec succès', 'success');
      }
    } catch (error) {
      console.error('Erreur formulaire:', error);
      // L'erreur est déjà gérée dans useMissions
    }
  };

  const handleDuplicateClick = async (mission) => {
    const copy = {
      ...mission,
      id: undefined,
      title: `Copie de ${mission.title}`,
      status: 'draft',
      dateAdded: new Date().toISOString().split('T')[0],
      createdDate: new Date().toISOString().split('T')[0],
    };
    delete copy.id;
    try {
      await addMission(copy);
      setIsDetailOpen(false);
      showNotification(`Mission dupliquée : "${copy.title}"`, 'success');
    } catch (error) {
      console.error('Erreur duplication:', error);
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
      pending: missions.filter((m) => m.status === 'pending_approval').length,
      filled: missions.filter((m) => m.status === 'filled').length,
      paused: missions.filter((m) => m.status === 'paused').length,
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

  return (
    <PageContainer
      title="Missions"
      subtitle={`Gérez vos ${missions.length} missions`}
      actions={
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              if (filteredMissions.length === 0) { showNotification('Aucune mission à exporter', 'warning'); return; }
              exportMissions(filteredMissions, generateFilename('missions', 'csv'));
              showNotification(`${filteredMissions.length} mission(s) exportée(s)`, 'success');
            }}
            style={{ padding: '10px 18px', border: '1.5px solid #10B981', borderRadius: '10px', background: 'white', color: '#10B981', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
            title={`Exporter ${filteredMissions.length} mission(s) en CSV`}
          >
            📤 Exporter CSV
          </button>
          <Button variant="primary" onClick={handleCreateClick}>
            ➕ Nouvelle Mission
          </Button>
        </div>
      }
    >

      {/* Statistiques */}
      <StatsGrid>
        <StatsCard icon="📊" label="Total" value={stats.total} color="#667EEA" />
        <StatsCard icon="✅" label="Ouvertes" value={stats.open} color="#10B981" />
        <StatsCard icon="🔒" label="Fermées" value={stats.closed} color="#EF4444" />
        <StatsCard icon="🕐" label="À valider" value={stats.pending} color="#3B82F6" />
        <StatsCard icon="🎯" label="Pourvues" value={stats.filled} color="#8B5CF6" />
        <StatsCard icon="⏸️" label="En pause" value={stats.paused} color="#F59E0B" />
      </StatsGrid>

      {/* Bannière archivage automatique */}
      {staleMissions.length > 0 && (
        <div style={{ padding:'14px 18px', background:'#FFF7ED', borderRadius:'12px', border:'1px solid #FED7AA', display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px', flexWrap:'wrap' }}>
          <span style={{ fontSize:'20px' }}>🚨</span>
          <div style={{ flex:1 }}>
            <span style={{ fontSize:'13px', fontWeight:'700', color:'#92400E' }}>{staleMissions.length} mission{staleMissions.length > 1 ? 's' : ''} inactive{staleMissions.length > 1 ? 's' : ''} depuis plus de 60 jours</span>
            <span style={{ fontSize:'12px', color:'#B45309', marginLeft:'8px' }}>Voulez-vous les archiver ?</span>
          </div>
          <button onClick={() => setArchiveModalOpen(true)} style={{ padding:'7px 16px', background:'#F59E0B', color:'white', border:'none', borderRadius:'8px', fontWeight:'700', fontSize:'12px', cursor:'pointer' }}>Archiver tout</button>
        </div>
      )}
      {archiveModalOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'white', borderRadius:'20px', padding:'28px', width:'440px' }}>
            <h3 style={{ margin:'0 0 16px', fontWeight:'800', color:'#1F2937' }}>📦 Archiver {staleMissions.length} mission{staleMissions.length > 1 ? 's' : ''} ?</h3>
            <p style={{ fontSize:'14px', color:'#6B7280', marginBottom:'16px' }}>Ces missions seront passées en statut "Fermé" :</p>
            {staleMissions.map(m => <div key={m.id} style={{ padding:'8px 12px', background:'#F9FAFB', borderRadius:'8px', marginBottom:'6px', fontSize:'13px', fontWeight:'600', color:'#374151' }}>📁 {m.title}</div>)}
            <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
              <button onClick={() => setArchiveModalOpen(false)} style={{ flex:1, padding:'11px', background:'#F3F4F6', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'600' }}>Annuler</button>
              <button onClick={handleArchiveStale} style={{ flex:1, padding:'11px', background:'#F59E0B', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'700' }}>✅ Confirmer l'archivage</button>
            </div>
          </div>
        </div>
      )}
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
            <option value="filled">🎯 Pourvues</option>
            <option value="paused">⏸️ En pause</option>
            <option value="pending_approval">🕐 En attente de validation</option>
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
        staleIds={staleIds}
        loading={missionsLoading}
        emptyMessage={
          searchQuery || statusFilter !== 'all'
            ? 'Aucune mission ne correspond à vos critères'
            : "Aucune mission pour l'instant"
        }
        emptyDescription={
          searchQuery || statusFilter !== 'all'
            ? "Essayez d'élargir vos filtres."
            : 'Créez votre première mission pour commencer à recruter.'
        }
        emptyAction={
          searchQuery || statusFilter !== 'all' ? undefined : { label: '+ Créer une mission', onClick: () => setIsFormOpen(true) }
        }
      />

      {/* Modal de détail */}
      <MissionDetail
        mission={selectedMission}
        isOpen={isDetailOpen}
        onClose={handleDetailClose}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onDuplicate={handleDuplicateClick}
        onSaveAsTemplate={handleSaveAsTemplate}
        onMatch={(m) => { setMatchingMission(m); setIsDetailOpen(false); }}
        onRefresh={() => { handleDetailClose(); }}
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

      {/* Modal Templates */}
      {templatesOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ background:'white', borderRadius:'20px', padding:'28px', width:'560px', maxWidth:'100%', maxHeight:'80vh', display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h3 style={{ margin:0, fontWeight:'800', color:'#1F2937', fontSize:'18px' }}>📋 Modèles de missions</h3>
              <button onClick={() => setTemplatesOpen(false)} aria-label="Fermer les modèles de missions" style={{ background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'#6B7280' }}>✕</button>
            </div>
            {templates.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px', color:'#9CA3AF' }}>
                <div style={{ fontSize:'40px', marginBottom:'12px' }}>📋</div>
                <p style={{ margin:0 }}>Aucun modèle sauvegardé.<br/>Ouvrez une mission et cliquez "Sauvegarder comme modèle".</p>
              </div>
            ) : (
              <div style={{ overflowY:'auto', display:'flex', flexDirection:'column', gap:'10px' }}>
                {templates.map(tpl => (
                  <div key={tpl.id} style={{ padding:'14px 16px', border:'1.5px solid #E5E7EB', borderRadius:'12px', display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:'700', color:'#1F2937', fontSize:'14px' }}>{tpl.title}</div>
                      <div style={{ fontSize:'12px', color:'#9CA3AF' }}>Sauvegardé le {new Date(tpl.savedAt).toLocaleDateString(_getLocale())} · {tpl.type_contrat || ''} {tpl.location ? `· ${tpl.location}` : ''}</div>
                    </div>
                    <button onClick={() => handleCreateFromTemplate(tpl)} style={{ padding:'7px 14px', background:'#667EEA', color:'white', border:'none', borderRadius:'8px', fontWeight:'700', fontSize:'12px', cursor:'pointer', whiteSpace:'nowrap' }}>Utiliser →</button>
                    <button onClick={() => handleDeleteTemplate(tpl.id)} aria-label={`Supprimer le modèle ${tpl.title}`} style={{ padding:'7px 10px', background:'#FEF2F2', color:'#EF4444', border:'1px solid #FECACA', borderRadius:'8px', fontSize:'12px', cursor:'pointer' }}>🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}    </PageContainer>
  );
}

export default MissionsPage;





