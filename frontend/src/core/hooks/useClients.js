import { useData } from '../contexts/DataContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { useConfirm } from '../contexts/ConfirmContext';

/**
 * Hook pour gérer les clients
 *
 * @example
 * const { clients, addClient, updateClient, deleteClient } = useClients();
 */
export function useClients() {
  const {
    clients,
    addClient,
    updateClient,
    deleteClient,
    loading,
  } = useData();

  const { addNotification } = useNotifications();
  const { confirm } = useConfirm();

  /**
   * Ajouter un client avec notification
   * 🔥 ASYNC - Appelle l'API backend
   */
  const createClient = async (clientData) => {
    try {
      const newClient = await addClient(clientData);
      // T-389 (point 2) : addClient() (DataContext.jsx) journalise déjà via
      // track() en interne — addHistoryItem() ici était redondant.

      addNotification({
        type: 'success',
        message: `Client "${newClient.name}" ajouté avec succès`,
      });

      return newClient;
    } catch (error) {
      addNotification({
        type: 'error',
        message: `Erreur lors de l'ajout: ${error.message}`,
      });
      throw error;
    }
  };

  /**
   * Mettre à jour un client
   * 🔥 ASYNC - Appelle l'API backend
   */
  const editClient = async (id, updates) => {
    try {
      await updateClient(id, updates);
      // T-389 (point 2) : voir note dans createClient ci-dessus.

      addNotification({
        type: 'success',
        message: 'Client mis à jour',
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
   * Supprimer un client
   * 🔥 ASYNC - Appelle l'API backend
   */
  const removeClient = async (id) => {
    try {
      const client = clients.find(c => c.id === id);

      if (!client) return;

      if (await confirm(`Supprimer le client "${client.name}" ?`, { title: 'Supprimer le client' })) {
        await deleteClient(id);
        // T-389 (point 2) : voir note dans createClient ci-dessus.

        addNotification({
          type: 'info',
          message: `Client "${client.name}" supprimé`,
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
   * Obtenir un client par ID
   */
  const getClientById = (id) => {
    return clients.find(c => c.id === id);
  };

  /**
   * Obtenir les clients actifs
   */
  const getActiveClients = () => {
    return clients.filter(c => c.status === 'active');
  };

  return {
    clients,
    // T-389 (point 4) : n'exposait pas `loading`, contrairement aux 3 hooks
    // jumeaux (useMissions/useCandidates/useApplications) qui suivent le
    // même pattern — un composant consommant useClients() ne pouvait donc
    // jamais afficher un skeleton de chargement (T-259) faute de signal.
    loading: loading.clients,
    addClient: createClient,
    updateClient: editClient,
    deleteClient: removeClient,
    getClientById,
    getActiveClients,
  };
}
