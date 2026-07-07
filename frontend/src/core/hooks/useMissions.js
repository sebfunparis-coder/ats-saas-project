import { useData } from '../contexts/DataContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { useConfirm } from '../contexts/ConfirmContext';

/**
 * Hook pour gérer les missions
 * Simplifie l'accès aux données et fonctions CRUD
 *
 * @example
 * const { missions, addMission, updateMission, deleteMission } = useMissions();
 */
export function useMissions() {
  const {
    missions,
    addMission,
    updateMission,
    deleteMission,
    loading,
  } = useData();

  const { addNotification } = useNotifications();
  const { confirm } = useConfirm();

  /**
   * Ajouter une mission avec notification
   * 🔥 ASYNC - Appelle l'API backend
   */
  const createMission = async (missionData) => {
    try {
      const newMission = await addMission(missionData);
      // T-389 (point 2) : addMission() (DataContext.jsx) journalise déjà via
      // track() en interne — l'appel addHistoryItem() ici était redondant et
      // produisait 2 entrées d'historique pour une seule création.

      addNotification({
        type: 'success',
        message: `Mission "${newMission.title}" créée avec succès`,
      });

      return newMission;
    } catch (error) {
      addNotification({
        type: 'error',
        message: `Erreur lors de la création: ${error.message}`,
      });
      throw error;
    }
  };

  /**
   * Mettre à jour une mission avec notification
   * 🔥 ASYNC - Appelle l'API backend
   */
  const editMission = async (id, updates) => {
    try {
      await updateMission(id, updates);
      // T-389 (point 2) : voir note dans createMission ci-dessus.

      addNotification({
        type: 'success',
        message: 'Mission mise à jour',
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
   * Supprimer une mission avec confirmation
   * 🔥 ASYNC - Appelle l'API backend
   */
  const removeMission = async (id) => {
    try {
      const mission = missions.find(m => m.id === id);

      if (!mission) return;

      if (await confirm(`Supprimer la mission "${mission.title}" ?`, { title: 'Supprimer la mission' })) {
        await deleteMission(id);
        // T-389 (point 2) : voir note dans createMission ci-dessus.

        addNotification({
          type: 'info',
          message: `Mission "${mission.title}" supprimée`,
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
   * Obtenir une mission par ID
   */
  const getMissionById = (id) => {
    return missions.find(m => m.id === id);
  };

  /**
   * Obtenir les missions par statut
   */
  const getMissionsByStatus = (status) => {
    return missions.filter(m => m.status === status);
  };

  /**
   * Obtenir les missions par client
   */
  const getMissionsByClient = (clientName) => {
    return missions.filter(m => m.client === clientName);
  };

  return {
    missions,
    loading: loading.missions,
    addMission: createMission,
    updateMission: editMission,
    deleteMission: removeMission,
    getMissionById,
    getMissionsByStatus,
    getMissionsByClient,
  };
}
