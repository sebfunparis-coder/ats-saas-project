import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';

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
    addHistoryItem,
  } = useData();

  const { addNotification } = useUI();

  /**
   * Créer une nouvelle candidature
   * 🔥 ASYNC - Appelle l'API backend
   */
  const createApplication = async (applicationData) => {
    try {
      const newApplication = await addApplication(applicationData);

      addHistoryItem({
        action: 'Candidature ajoutée',
        relatedTo: { type: 'application', id: newApplication.id, name: newApplication.candidateName },
        user: 'Admin',
        details: `Nouvelle candidature: ${newApplication.candidateName} pour ${newApplication.missionTitle}`,
        icon: '📝',
      });

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
  const changeStatus = (id, newStatus) => {
    const application = applications.find(a => a.id === id);
    updateApplication(id, { status: newStatus });

    if (application) {
      addNotification({
        type: 'info',
        message: `"${application.candidateName}" → ${newStatus}`,
      });
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

      if (window.confirm(`Êtes-vous sûr de vouloir supprimer cette candidature ?`)) {
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
