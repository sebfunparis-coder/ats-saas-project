import { useData } from '../contexts/DataContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { useConfirm } from '../contexts/ConfirmContext';

/**
 * Hook pour gérer les candidatures (applications)
 *
 * @example
 * const { applications, addApplication, updateApplication, changeStatus } = useApplications();
 */
export function useApplications() {
  const {
    applications,
    addApplication,
    updateApplication,
    deleteApplication,
    loading,
  } = useData();

  const { addNotification } = useNotifications();
  const { confirm } = useConfirm();

  /**
   * Créer une nouvelle candidature
   * 🔥 ASYNC - Appelle l'API backend
   */
  const createApplication = async (applicationData) => {
    try {
      const newApplication = await addApplication(applicationData);
      // T-389 (point 2) : addApplication() (DataContext.jsx) journalise déjà
      // via track() en interne — addHistoryItem() ici était redondant.

      addNotification({
        type: 'success',
        message: `Candidature de "${newApplication.candidateName}" créée`,
      });

      return newApplication;
    } catch (error) {
      addNotification({
        type: 'error',
        message: `Erreur lors de la création: ${error.message}`,
      });
      throw error;
    }
  };

  /**
   * Changer le statut d'une candidature (pour le Kanban)
   * 🔥 ASYNC - Appelle l'API backend
   */
  const changeStatus = async (id, newStatus) => {
    const application = applications.find(a => a.id === id);
    try {
      await updateApplication(id, { status: newStatus });
      if (application) {
        addNotification({
          type: 'info',
          message: `"${application.candidateName}" → ${newStatus}`,
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: `Erreur lors du changement de statut: ${error.message}`,
      });
      throw error;
    }
  };

  /**
   * Supprimer une candidature
   * 🔥 ASYNC - Appelle l'API backend
   */
  const removeApplication = async (id) => {
    try {
      const application = applications.find(a => a.id === id);

      if (!application) return;

      if (await confirm('Supprimer cette candidature ?', { title: 'Supprimer la candidature' })) {
        await deleteApplication(id);

        addNotification({
          type: 'info',
          message: 'Candidature supprimée',
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
   * Obtenir une candidature par ID
   */
  const getApplicationById = (id) => {
    return applications.find(a => a.id === id);
  };

  /**
   * Obtenir les candidatures par statut
   */
  const getApplicationsByStatus = (status) => {
    return applications.filter(a => a.status === status);
  };

  /**
   * Obtenir les candidatures pour une mission
   */
  const getApplicationsByMission = (missionTitle) => {
    return applications.filter(a => a.missionTitle === missionTitle);
  };

  /**
   * Obtenir les candidatures pour un candidat
   */
  const getApplicationsByCandidate = (candidateName) => {
    return applications.filter(a => a.candidateName === candidateName);
  };

  return {
    applications,
    loading: loading.applications,
    addApplication: createApplication,
    updateApplication,
    deleteApplication: removeApplication,
    changeStatus,
    getApplicationById,
    getApplicationsByStatus,
    getApplicationsByMission,
    getApplicationsByCandidate,
  };
}
