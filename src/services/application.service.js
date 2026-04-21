/**
 * 📋 Application Service
 *
 * Service pour la gestion des candidatures (Pipeline Kanban)
 */

import api from './api';

const applicationService = {
  /**
   * Récupérer toutes les candidatures
   * @param {Object} params - Paramètres de requête (filters, pagination, sort)
   * @returns {Promise<Object>} Applications + pagination
   */
  async getAll(params = {}) {
    const response = await api.get('/applications', { params });
    return response.data;
  },

  /**
   * Récupérer une candidature par ID
   * @param {string} id - ID de la candidature
   * @returns {Promise<Object>} Application data
   */
  async getById(id) {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  /**
   * Créer une nouvelle candidature
   * @param {Object} data - Données de la candidature
   * @returns {Promise<Object>} Created application
   */
  async create(data) {
    const response = await api.post('/applications', data);
    return response.data;
  },

  /**
   * Mettre à jour une candidature
   * @param {string} id - ID de la candidature
   * @param {Object} data - Données à mettre à jour
   * @returns {Promise<Object>} Updated application
   */
  async update(id, data) {
    const response = await api.put(`/applications/${id}`, data);
    return response.data;
  },

  /**
   * Supprimer une candidature
   * @param {string} id - ID de la candidature
   * @returns {Promise<Object>}
   */
  async delete(id) {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },

  /**
   * Mettre à jour le statut d'une candidature (Kanban drag & drop)
   * @param {string} id - ID de la candidature
   * @param {string} status - Nouveau statut (applied, screening, interview, offer, hired, rejected)
   * @returns {Promise<Object>}
   */
  async updateStatus(id, status) {
    const response = await api.put(`/applications/${id}/status`, { status });
    return response.data;
  },

  /**
   * Rejeter une candidature
   * @param {string} id - ID de la candidature
   * @param {string} reason - Raison du rejet
   * @returns {Promise<Object>}
   */
  async reject(id, reason) {
    const response = await api.post(`/applications/${id}/reject`, { reason });
    return response.data;
  },

  /**
   * Embaucher un candidat
   * @param {string} id - ID de la candidature
   * @returns {Promise<Object>}
   */
  async hire(id) {
    const response = await api.post(`/applications/${id}/hire`);
    return response.data;
  },

  /**
   * Faire une offre à un candidat
   * @param {string} id - ID de la candidature
   * @returns {Promise<Object>}
   */
  async makeOffer(id) {
    const response = await api.post(`/applications/${id}/offer`);
    return response.data;
  },

  /**
   * Ajouter un entretien à une candidature
   * @param {string} id - ID de la candidature
   * @param {Object} interviewData - Données de l'entretien
   * @returns {Promise<Object>}
   */
  async addInterview(id, interviewData) {
    const response = await api.post(`/applications/${id}/interview`, interviewData);
    return response.data;
  },

  /**
   * Mettre à jour un entretien
   * @param {string} applicationId - ID de la candidature
   * @param {string} interviewId - ID de l'entretien
   * @param {Object} data - Données à mettre à jour
   * @returns {Promise<Object>}
   */
  async updateInterview(applicationId, interviewId, data) {
    const response = await api.put(`/applications/${applicationId}/interview/${interviewId}`, data);
    return response.data;
  },

  /**
   * Récupérer les données du Pipeline Kanban (groupées par statut)
   * @param {Object} params - Paramètres de requête (missionId optionnel)
   * @returns {Promise<Object>} Pipeline data + stats
   */
  async getPipeline(params = {}) {
    const response = await api.get('/applications/pipeline', { params });
    return response.data;
  },

  /**
   * Récupérer les statistiques des candidatures
   * @returns {Promise<Object>} Stats
   */
  async getStats() {
    const response = await api.get('/applications/stats');
    return response.data;
  }
};

export default applicationService;
