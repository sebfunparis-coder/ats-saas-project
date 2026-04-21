import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';

/**
 * Hook pour gérer les candidats
 *
 * @example
 * const { candidates, addCandidate, updateCandidate, deleteCandidate } = useCandidates();
 */
export function useCandidates() {
  const {
    candidates,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    addHistoryItem,
  } = useData();

  const { addNotification } = useUI();

  /**
   * Ajouter un candidat avec notification
   * 🔥 ASYNC - Appelle l'API backend
   */
  const createCandidate = async (candidateData) => {
    try {
      const newCandidate = await addCandidate(candidateData);

      addHistoryItem({
        action: 'Candidat ajouté',
        relatedTo: { type: 'candidate', id: newCandidate.id, name: newCandidate.name },
        user: 'Admin',
        details: `Nouveau candidat: ${newCandidate.name}`,
        icon: '👤',
      });

      addNotification({
        type: 'success',
        message: `Candidat "${newCandidate.name}" ajouté avec succès`,
      });

      return newCandidate;
    } catch (error) {
      addNotification({
        type: 'error',
        message: `Erreur lors de l'ajout: ${error.message}`,
      });
      throw error;
    }
  };

  /**
   * Mettre à jour un candidat
   * 🔥 ASYNC - Appelle l'API backend
   */
  const editCandidate = async (id, updates) => {
    try {
      const candidate = candidates.find(c => c.id === id);

      await updateCandidate(id, updates);

      addHistoryItem({
        action: 'Candidat modifié',
        relatedTo: { type: 'candidate', id, name: candidate?.name || 'Candidat' },
        user: 'Admin',
        details: 'Informations mises à jour',
        icon: '✏️',
      });

      addNotification({
        type: 'success',
        message: 'Candidat mis à jour',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: `Erreur lors de la mise à jour: ${error.message}`,
      });
      throw error;
    }
  };

  /**
   * Supprimer un candidat
   * 🔥 ASYNC - Appelle l'API backend
   */
  const removeCandidate = async (id) => {
    try {
      const candidate = candidates.find(c => c.id === id);

      if (!candidate) return;

      if (window.confirm(`Êtes-vous sûr de vouloir supprimer le candidat "${candidate.name}" ?`)) {
        await deleteCandidate(id);

        addHistoryItem({
          action: 'Candidat supprimé',
          relatedTo: { type: 'candidate', id, name: candidate.name },
          user: 'Admin',
          details: `Candidat ${candidate.name} supprimé`,
          icon: '🗑️',
        });

        addNotification({
          type: 'info',
          message: `Candidat "${candidate.name}" supprimé`,
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: `Erreur lors de la suppression: ${error.message}`,
      });
      throw error;
    }
  };

  /**
   * Obtenir un candidat par ID
   */
  const getCandidateById = (id) => {
    return candidates.find(c => c.id === id);
  };

  /**
   * Obtenir les candidats par statut
   */
  const getCandidatesByStatus = (status) => {
    return candidates.filter(c => c.status === status);
  };

  /**
   * Obtenir les candidats favoris
   */
  const getFavoriteCandidates = () => {
    return candidates.filter(c => c.favorite === true);
  };

  /**
   * Basculer le statut favori
   * 🔥 ASYNC - Appelle l'API backend
   */
  const toggleFavorite = async (id) => {
    try {
      const candidate = candidates.find(c => c.id === id);
      if (candidate) {
        await updateCandidate(id, { favorite: !candidate.favorite });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: `Erreur lors de la mise à jour: ${error.message}`,
      });
      throw error;
    }
  };

  return {
    candidates,
    addCandidate: createCandidate,
    updateCandidate: editCandidate,
    deleteCandidate: removeCandidate,
    getCandidateById,
    getCandidatesByStatus,
    getFavoriteCandidates,
    toggleFavorite,
  };
}
