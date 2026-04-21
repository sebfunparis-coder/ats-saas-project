/**
 * 📄 Candidate Service
 *
 * Service pour la gestion des candidats
 */

import api from './api';

const candidateService = {
  /**
   * Récupérer tous les candidats
   * @param {Object} params - Paramètres de requête (filters, pagination, sort)
   * @returns {Promise<Object>} Candidates + pagination
   */
  async getAll(params = {}) {
    const response = await api.get('/candidates', { params });
    return response.data;
  },

  /**
   * Récupérer un candidat par ID
   * @param {string} id - ID du candidat
   * @returns {Promise<Object>} Candidate data
   */
  async getById(id) {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
  },

  /**
   * Créer un nouveau candidat
   * @param {Object} data - Données du candidat
   * @returns {Promise<Object>} Created candidate
   */
  async create(data) {
    const response = await api.post('/candidates', data);
    return response.data;
  },

  /**
   * Mettre à jour un candidat
   * @param {string} id - ID du candidat
   * @param {Object} data - Données à mettre à jour
   * @returns {Promise<Object>} Updated candidate
   */
  async update(id, data) {
    const response = await api.put(`/candidates/${id}`, data);
    return response.data;
  },

  /**
   * Supprimer un candidat
   * @param {string} id - ID du candidat
   * @returns {Promise<Object>}
   */
  async delete(id) {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
  },

  /**
   * Mettre à jour le statut d'un candidat
   * @param {string} id - ID du candidat
   * @param {string} status - Nouveau statut
   * @returns {Promise<Object>}
   */
  async updateStatus(id, status) {
    const response = await api.put(`/candidates/${id}/status`, { status });
    return response.data;
  },

  /**
   * Noter un candidat (0-5 étoiles)
   * @param {string} id - ID du candidat
   * @param {number} rating - Note (0-5)
   * @returns {Promise<Object>}
   */
  async rate(id, rating) {
    const response = await api.put(`/candidates/${id}/rating`, { rating });
    return response.data;
  },

  /**
   * Récupérer les candidatures d'un candidat
   * @param {string} id - ID du candidat
   * @param {Object} params - Paramètres de requête
   * @returns {Promise<Object>} Applications
   */
  async getApplications(id, params = {}) {
    const response = await api.get(`/candidates/${id}/applications`, { params });
    return response.data;
  },

  /**
   * Importer plusieurs candidats (CSV/JSON)
   * @param {Array} candidates - Tableau de candidats
   * @returns {Promise<Object>} Import results
   */
  async import(candidates) {
    const response = await api.post('/candidates/import', { candidates });
    return response.data;
  },

  /**
   * Récupérer les statistiques des candidats
   * @returns {Promise<Object>} Stats
   */
  async getStats() {
    const response = await api.get('/candidates/stats');
    return response.data;
  }
};

export default candidateService;
