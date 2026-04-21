import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';

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
    addHistoryItem,
  } = useData();

  const { addNotification } = useUI();

  /**
   * Ajouter un client avec notification
   * 🔥 ASYNC - Appelle l'API backend
   */
  const createClient = async (clientData) => {
    try {
      const newClient = await addClient(clientData);

      addHistoryItem({
        action: 'Client ajouté',
        relatedTo: { type: 'client', id: newClient.id, name: newClient.name },
        user: 'Admin',
        details: `Nouveau client: ${newClient.name}`,
        icon: '🏢',
      });

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
      const client = clients.find(c => c.id === id);

      await updateClient(id, updates);

      addHistoryItem({
        action: 'Client modifié',
        relatedTo: { type: 'client', id, name: client?.name || 'Client' },
        user: 'Admin',
        details: 'Informations mises à jour',
        icon: '✏️',
      });

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

      if (window.confirm(`Êtes-vous sûr de vouloir supprimer le client "${client.name}" ?`)) {
        await deleteClient(id);

        addHistoryItem({
          action: 'Client supprimé',
          relatedTo: { type: 'client', id, name: client.name },
          user: 'Admin',
          details: `Client ${client.name} supprimé`,
          icon: '🗑️',
        });

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
    addClient: createClient,
    updateClient: editClient,
    deleteClient: removeClient,
    getClientById,
    getActiveClients,
  };
}
