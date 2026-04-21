/**
 * 🌐 API Client
 *
 * Client Axios configuré pour l'API ATS Ultimate
 */

import axios from 'axios';

// Base URL de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Créer instance Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes
});

// ===== INTERCEPTEURS =====

/**
 * Intercepteur de requête
 * Ajoute le token JWT à chaque requête
 */
api.interceptors.request.use(
  (config) => {
    // Récupérer le token du localStorage (essayer les deux clés pour compatibilité)
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');

    // Log détaillé pour debug
    console.log('🔍 [API Interceptor] Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

    // Ajouter le token à l'header Authorization si disponible
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ [API Interceptor] Authorization header added');
    } else {
      console.warn('⚠️ [API Interceptor] NO TOKEN - Request will be sent without auth');
    }

    // Log de la requête en développement
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', config.method.toUpperCase(), config.url);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Intercepteur de réponse
 * Gère les erreurs globalement
 */
api.interceptors.response.use(
  (response) => {
    // Log de la réponse en développement
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', response.config.url, response.data);
    }

    return response;
  },
  (error) => {
    // Log de l'erreur
    console.error('❌ API Error:', error.response?.data || error.message);

    // Gestion des erreurs spécifiques
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token invalide ou expiré
          console.warn('⚠️ Token invalide ou expiré. Redirection vers login...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Rediriger vers la page de login (à faire dans le composant)
          window.location.href = '/';
          break;

        case 403:
          // Permissions insuffisantes
          console.warn('⚠️ Permissions insuffisantes');
          break;

        case 404:
          // Ressource non trouvée
          console.warn('⚠️ Ressource non trouvée');
          break;

        case 429:
          // Rate limit dépassé
          console.warn('⚠️ Trop de requêtes. Veuillez patienter.');
          break;

        case 500:
          // Erreur serveur
          console.error('❌ Erreur serveur');
          break;

        default:
          console.error('❌ Erreur API:', data.message || 'Une erreur est survenue');
      }
    } else if (error.request) {
      // La requête a été envoyée mais pas de réponse
      console.error('❌ Pas de réponse du serveur. Vérifiez votre connexion.');
    } else {
      // Erreur lors de la configuration de la requête
      console.error('❌ Erreur de configuration:', error.message);
    }

    return Promise.reject(error);
  }
);

// ===== HELPERS =====

/**
 * Gestion des erreurs API
 * @param {Error} error - Erreur Axios
 * @returns {string} Message d'erreur formaté
 */
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.data?.errors) {
    // express-validator errors
    return error.response.data.errors.map(err => err.msg).join(', ');
  }

  if (error.message) {
    return error.message;
  }

  return 'Une erreur est survenue';
};

/**
 * Vérifier si l'utilisateur est authentifié
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Récupérer l'utilisateur depuis le localStorage
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Déconnexion (supprime token et user)
 */
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export default api;
