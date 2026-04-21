import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';

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
    addHistoryItem,
  } = useData();

  const { addNotification } = useUI();

  /**
   * Ajouter une mission avec notification
   * 🔥 ASYNC - Appelle l'API backend
   */
  const createMission = async (missionData) => {
    try {
      const newMission = await addMission(missionData);

      addHistoryItem({
        action: 'Mission créée',
        relatedTo: { type: 'mission', id: newMission.id, name: newMission.title },
        user: 'Admin',
        details: `Nouvelle mission: ${newMission.title}`,
        icon: '💼',
      });

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
      const mission = missions.find(m => m.id === id);

      await updateMission(id, updates);

      addHistoryItem({
        action: 'Mission modifiée',
        relatedTo: { type: 'mission', id, name: mission?.title || 'Mission' },
        user: 'Admin',
        details: 'Informations mises à jour',
        icon: '✏️',
      });

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

      if (window.confirm(`Êtes-vous sûr de vouloir supprimer la mission "${mission.title}" ?`)) {
        await deleteMission(id);

        addHistoryItem({
          action: 'Mission supprimée',
          relatedTo: { type: 'mission', id, name: mission.title },
          user: 'Admin',
          details: `Mission ${mission.title} supprimée`,
          icon: '🗑️',
        });

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
    addMission: createMission,
    updateMission: editMission,
    deleteMission: removeMission,
    getMissionById,
    getMissionsByStatus,
    getMissionsByClient,
  };
}
