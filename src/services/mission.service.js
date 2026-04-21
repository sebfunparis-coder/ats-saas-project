/**
 * 💼 Mission Service
 *
 * Service pour la gestion des missions
 */

import api from './api';

const missionService = {
  /**
   * Récupérer toutes les missions
   * @param {Object} params - Paramètres de requête (filters, pagination, sort)
   * @returns {Promise<Object>} Missions + pagination
   */
  async getAll(params = {}) {
    const response = await api.get('/missions', { params });
    return response.data;
  },

  /**
   * Récupérer une mission par ID
   * @param {string} id - ID de la mission
   * @returns {Promise<Object>} Mission data
   */
  async getById(id) {
    const response = await api.get(`/missions/${id}`);
    return response.data;
  },

  /**
   * Créer une nouvelle mission
   * @param {Object} data - Données de la mission
   * @returns {Promise<Object>} Created mission
   */
  async create(data) {
    const response = await api.post('/missions', data);
    return response.data;
  },

  /**
   * Mettre à jour une mission
   * @param {string} id - ID de la mission
   * @param {Object} data - Données à mettre à jour
   * @returns {Promise<Object>} Updated mission
   */
  async update(id, data) {
    const response = await api.put(`/missions/${id}`, data);
    return response.data;
  },

  /**
   * Supprimer une mission
   * @param {string} id - ID de la mission
   * @returns {Promise<Object>}
   */
  async delete(id) {
    const response = await api.delete(`/missions/${id}`);
    return response.data;
  },

  /**
   * Publier une mission (draft → active)
   * @param {string} id - ID de la mission
   * @returns {Promise<Object>}
   */
  async publish(id) {
    const response = await api.post(`/missions/${id}/publish`);
    return response.data;
  },

  /**
   * Fermer une mission
   * @param {string} id - ID de la mission
   * @returns {Promise<Object>}
   */
  async close(id) {
    const response = await api.post(`/missions/${id}/close`);
    return response.data;
  },

  /**
   * Mettre en pause une mission
   * @param {string} id - ID de la mission
   * @returns {Promise<Object>}
   */
  async pause(id) {
    const response = await api.post(`/missions/${id}/pause`);
    return response.data;
  },

  /**
   * Reprendre une mission en pause
   * @param {string} id - ID de la mission
   * @returns {Promise<Object>}
   */
  async resume(id) {
    const response = await api.post(`/missions/${id}/resume`);
    return response.data;
  },

  /**
   * Récupérer les candidatures d'une mission
   * @param {string} id - ID de la mission
   * @param {Object} params - Paramètres de requête
   * @returns {Promise<Object>} Applications
   */
  async getApplications(id, params = {}) {
    const response = await api.get(`/missions/${id}/applications`, { params });
    return response.data;
  },

  /**
   * Récupérer les statistiques des missions
   * @returns {Promise<Object>} Stats
   */
  async getStats() {
    const response = await api.get('/missions/stats');
    return response.data;
  }
};

export default missionService;
