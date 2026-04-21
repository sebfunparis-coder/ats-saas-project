/**
 * 🔐 Auth Service
 *
 * Service d'authentification
 */

import api, { clearAuth } from './api';

const authService = {
  /**
   * Inscription
   * @param {Object} data - Données d'inscription
   * @returns {Promise<Object>} User + token
   */
  async register(data) {
    const response = await api.post('/auth/register', data);

    console.log('🔵 [AuthService] Register response:', response.data);

    // Sauvegarder token et user dans localStorage
    if (response.data.success) {
      const token = response.data.data.token;
      const user = response.data.data.user;

      console.log('🔵 [AuthService] Saving token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      console.log('🔵 [AuthService] Saving user:', user);

      // Sauvegarder avec les DEUX clés pour compatibilité
      localStorage.setItem('token', token);
      localStorage.setItem('authToken', token);  // Pour compatibilité avec l'ancien système
      localStorage.setItem('user', JSON.stringify(user));

      // Vérifier que le token est bien sauvegardé
      const savedToken = localStorage.getItem('token');
      const savedAuthToken = localStorage.getItem('authToken');
      console.log('✅ [AuthService] Token saved:', savedToken ? `${savedToken.substring(0, 20)}...` : 'FAILED');
      console.log('✅ [AuthService] AuthToken saved:', savedAuthToken ? `${savedAuthToken.substring(0, 20)}...` : 'FAILED');
    } else {
      console.error('❌ [AuthService] Register failed:', response.data.message);
    }

    return response.data;
  },

  /**
   * Connexion
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} User + token
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });

    console.log('🔵 [AuthService] Login response:', response.data);

    // Sauvegarder token et user dans localStorage
    if (response.data.success) {
      const token = response.data.data.token;
      const user = response.data.data.user;

      console.log('🔵 [AuthService] Saving token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      console.log('🔵 [AuthService] Saving user:', user);

      // Sauvegarder avec les DEUX clés pour compatibilité
      localStorage.setItem('token', token);
      localStorage.setItem('authToken', token);  // Pour compatibilité avec l'ancien système
      localStorage.setItem('user', JSON.stringify(user));

      // Vérifier que le token est bien sauvegardé
      const savedToken = localStorage.getItem('token');
      const savedAuthToken = localStorage.getItem('authToken');
      console.log('✅ [AuthService] Token saved:', savedToken ? `${savedToken.substring(0, 20)}...` : 'FAILED');
      console.log('✅ [AuthService] AuthToken saved:', savedAuthToken ? `${savedAuthToken.substring(0, 20)}...` : 'FAILED');
    } else {
      console.error('❌ [AuthService] Login failed:', response.data.message);
    }

    return response.data;
  },

  /**
   * Déconnexion
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Toujours nettoyer le localStorage
      clearAuth();
    }
  },

  /**
   * Récupérer l'utilisateur actuel
   * @returns {Promise<Object>} User data
   */
  async getCurrentUser() {
    const response = await api.get('/auth/me');

    // Mettre à jour user dans localStorage
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }

    return response.data;
  },

  /**
   * Mettre à jour le profil
   * @param {Object} data - Données du profil
   * @returns {Promise<Object>} Updated user
   */
  async updateProfile(data) {
    const response = await api.put('/auth/profile', data);

    // Mettre à jour user dans localStorage
    if (response.data.success) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    return response.data;
  },

  /**
   * Changer le mot de passe
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<Object>}
   */
  async changePassword(currentPassword, newPassword) {
    const response = await api.put('/auth/password', {
      currentPassword,
      newPassword
    });

    return response.data;
  }
};

export default authService;
