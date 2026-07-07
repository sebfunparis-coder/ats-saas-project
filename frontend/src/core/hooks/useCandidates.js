import { useData } from '../contexts/DataContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { useConfirm } from '../contexts/ConfirmContext';

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
    loading,
  } = useData();

  const { addNotification } = useNotifications();
  const { confirm } = useConfirm();

  /**
   * Ajouter un candidat avec notification
   * 🔥 ASYNC - Appelle l'API backend
   */
  const createCandidate = async (candidateData) => {
    try {
      const newCandidate = await addCandidate(candidateData);
      // T-389 (point 2) : addCandidate() (DataContext.jsx) journalise déjà
      // via track() en interne — addHistoryItem() ici était redondant.

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
      await updateCandidate(id, updates);
      // T-389 (point 2) : voir note dans createCandidate ci-dessus.

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

      if (await confirm(`Supprimer le candidat "${candidate.name}" ?`, { title: 'Supprimer le candidat' })) {
        await deleteCandidate(id);
        // T-389 (point 2) : voir note dans createCandidate ci-dessus.

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
    loading: loading.candidates,
    addCandidate: createCandidate,
    updateCandidate: editCandidate,
    deleteCandidate: removeCandidate,
    getCandidateById,
    getCandidatesByStatus,
    getFavoriteCandidates,
    toggleFavorite,
  };
}
