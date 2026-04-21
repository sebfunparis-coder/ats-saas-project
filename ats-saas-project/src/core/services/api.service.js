/**
 * 🌐 API Service - Communication avec le Backend
 * Centralisation de tous les appels API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fonction utilitaire pour les requêtes HTTP
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Ajouter le token JWT si présent
  // IMPORTANT: Utiliser 'token' pour correspondre à ce que authAPI.login/register sauvegarde
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');

  console.log('🔍 [API] Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    console.log('✅ [API] Authorization header added');
  } else {
    console.warn('⚠️ [API] NO TOKEN - Request will fail if auth required');
  }

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);

    // Gestion des erreurs HTTP
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      // Si c'est une erreur de validation (400), afficher les détails
      if (response.status === 400 && error.errors && Array.isArray(error.errors)) {
        const validationErrors = error.errors.map(e => e.msg).join(', ');
        console.error('❌ [API] Erreurs de validation:', error.errors);
        throw new Error(`Validation échouée: ${validationErrors}`);
      }

      throw new Error(error.message || `HTTP Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ===== MISSIONS =====

export const missionsAPI = {
  /**
   * Récupérer toutes les missions
   */
  getAll: async () => {
    const response = await fetchAPI('/missions');
    return response.data.missions;
  },

  /**
   * Récupérer une mission par ID
   */
  getById: async (id) => {
    const response = await fetchAPI(`/missions/${id}`);
    return response.data;
  },

  /**
   * Créer une nouvelle mission
   */
  create: async (missionData) => {
    const response = await fetchAPI('/missions', {
      method: 'POST',
      body: JSON.stringify(missionData),
    });
    return response.data;
  },

  /**
   * Mettre à jour une mission
   */
  update: async (id, missionData) => {
    const response = await fetchAPI(`/missions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(missionData),
    });
    return response.data;
  },

  /**
   * Supprimer une mission
   */
  delete: async (id) => {
    const response = await fetchAPI(`/missions/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  },
};

// ===== CANDIDATS =====

export const candidatesAPI = {
  /**
   * Récupérer tous les candidats
   */
  getAll: async () => {
    const response = await fetchAPI('/candidates');
    return response.data.candidates;
  },

  /**
   * Récupérer un candidat par ID
   */
  getById: async (id) => {
    const response = await fetchAPI(`/candidates/${id}`);
    return response.data;
  },

  /**
   * Créer un nouveau candidat
   */
  create: async (candidateData) => {
    const response = await fetchAPI('/candidates', {
      method: 'POST',
      body: JSON.stringify(candidateData),
    });
    return response.data;
  },

  /**
   * Mettre à jour un candidat
   */
  update: async (id, candidateData) => {
    const response = await fetchAPI(`/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(candidateData),
    });
    return response.data;
  },

  /**
   * Supprimer un candidat
   */
  delete: async (id) => {
    const response = await fetchAPI(`/candidates/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  },
};

// ===== CANDIDATURES =====

export const applicationsAPI = {
  /**
   * Récupérer toutes les candidatures
   */
  getAll: async () => {
    const response = await fetchAPI('/applications');
    return response.data.applications;
  },

  /**
   * Récupérer une candidature par ID
   */
  getById: async (id) => {
    const response = await fetchAPI(`/applications/${id}`);
    return response.data;
  },

  /**
   * Créer une nouvelle candidature
   */
  create: async (applicationData) => {
    const response = await fetchAPI('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
    return response.data;
  },

  /**
   * Mettre à jour le statut d'une candidature
   */
  updateStatus: async (id, status) => {
    const response = await fetchAPI(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data;
  },

  /**
   * Supprimer une candidature
   */
  delete: async (id) => {
    const response = await fetchAPI(`/applications/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  },
};

// ===== UTILISATEURS =====

export const usersAPI = {
  /**
   * Récupérer tous les utilisateurs
   */
  getAll: async () => {
    const response = await fetchAPI('/users');
    return response.data.users;
  },

  /**
   * Récupérer un utilisateur par ID
   */
  getById: async (id) => {
    const response = await fetchAPI(`/users/${id}`);
    return response.data;
  },

  /**
   * Mettre à jour un utilisateur
   */
  update: async (id, userData) => {
    const response = await fetchAPI(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response.data;
  },

  /**
   * Changer le rôle d'un utilisateur
   */
  updateRole: async (id, role) => {
    const response = await fetchAPI(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    return response.data;
  },

  /**
   * Supprimer un utilisateur
   */
  delete: async (id) => {
    const response = await fetchAPI(`/users/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  },
};

// ===== AUTHENTIFICATION =====

export const authAPI = {
  /**
   * Connexion
   */
  login: async (email, password) => {
    const response = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    console.log('🔵 [authAPI] Login response:', response);

    // Stocker le token avec LES DEUX clés pour compatibilité maximale
    if (response.data && response.data.token) {
      const token = response.data.token;
      console.log('🔵 [authAPI] Saving token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      localStorage.setItem('token', token);
      localStorage.setItem('authToken', token);

      // Vérifier que le token est bien sauvegardé
      const savedToken = localStorage.getItem('token');
      const savedAuthToken = localStorage.getItem('authToken');
      console.log('✅ [authAPI] Token saved:', savedToken ? `${savedToken.substring(0, 20)}...` : 'FAILED');
      console.log('✅ [authAPI] AuthToken saved:', savedAuthToken ? `${savedAuthToken.substring(0, 20)}...` : 'FAILED');
    }

    return response.data;
  },

  /**
   * Inscription
   */
  register: async (userData) => {
    const response = await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    console.log('🔵 [authAPI] Register response:', response);

    // Stocker le token avec LES DEUX clés pour compatibilité maximale
    if (response.data && response.data.token) {
      const token = response.data.token;
      console.log('🔵 [authAPI] Saving token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      localStorage.setItem('token', token);
      localStorage.setItem('authToken', token);

      // Vérifier que le token est bien sauvegardé
      const savedToken = localStorage.getItem('token');
      const savedAuthToken = localStorage.getItem('authToken');
      console.log('✅ [authAPI] Token saved:', savedToken ? `${savedToken.substring(0, 20)}...` : 'FAILED');
      console.log('✅ [authAPI] AuthToken saved:', savedAuthToken ? `${savedAuthToken.substring(0, 20)}...` : 'FAILED');
    }

    return response.data;
  },

  /**
   * Déconnexion
   */
  logout: async () => {
    const response = await fetchAPI('/auth/logout', {
      method: 'POST',
    });

    // Supprimer le token (les deux clés pour compatibilité)
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');

    return response.data;
  },

  /**
   * Récupérer le profil utilisateur
   */
  getProfile: async () => {
    const response = await fetchAPI('/auth/me');
    return response.data;
  },
};

// ===== HEALTH CHECK =====

export const healthAPI = {
  /**
   * Vérifier que l'API est disponible
   */
  check: async () => {
    try {
      const response = await fetch('http://localhost:5000/health');
      return await response.json();
    } catch (error) {
      console.error('Backend non disponible:', error);
      return { success: false, message: 'Backend inaccessible' };
    }
  },
};

export default {
  missions: missionsAPI,
  candidates: candidatesAPI,
  applications: applicationsAPI,
  users: usersAPI,
  auth: authAPI,
  health: healthAPI,
};
