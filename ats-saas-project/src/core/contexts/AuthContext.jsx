import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Context d'authentification
 * Gère l'état de connexion, l'utilisateur actuel, et les permissions
 */

const AuthContext = createContext(null);

// Données de démo (à remplacer par une vraie API)
const DEMO_USERS = [
  {
    id: 1,
    email: 'demo@techcorp.com',
    password: 'demo123',
    firstName: 'Marie',
    lastName: 'Dubois',
    company: 'TechCorp',
    companyId: 1,
    role: 'Recruteur',
    plan: 'Pro',
  },
  {
    id: 2,
    email: 'contact@startupx.io',
    password: 'startup2026',
    firstName: 'Pierre',
    lastName: 'Martin',
    company: 'StartupX',
    companyId: 2,
    role: 'Manager',
    plan: 'Enterprise',
  },
  {
    id: 3,
    email: 'hr@financehub.com',
    password: 'finance456',
    firstName: 'Sophie',
    lastName: 'Laurent',
    company: 'FinanceHub',
    companyId: 3,
    role: 'Admin',
    plan: 'Starter',
  },
];

const SUPERADMIN_PASSWORD = 'admin2026';

/**
 * Provider du contexte d'authentification
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem('ats_user');
    const savedSuperAdmin = localStorage.getItem('ats_superadmin');

    if (savedUser) {
      try {
        let userData = JSON.parse(savedUser);
        // Migration : si companyId absent, on le récupère depuis DEMO_USERS
        if (!userData.companyId) {
          const demoMatch = DEMO_USERS.find(u => u.email === userData.email);
          if (demoMatch) {
            userData = { ...userData, companyId: demoMatch.companyId };
            localStorage.setItem('ats_user', JSON.stringify(userData));
          }
        }
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        localStorage.removeItem('ats_user');
      }
    }

    if (savedSuperAdmin === 'true') {
      setIsSuperAdmin(true);
    }

    setIsLoading(false);
  }, []);

  /**
   * Connexion utilisateur standard
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {object} { success, error, user }
   */
  const login = (email, password) => {
    const foundUser = DEMO_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      // Créer une copie sans le mot de passe
      const { password: _, ...userWithoutPassword } = foundUser;

      setUser(userWithoutPassword);
      setIsLoggedIn(true);

      // Sauvegarder dans localStorage
      localStorage.setItem('ats_user', JSON.stringify(userWithoutPassword));

      return {
        success: true,
        user: userWithoutPassword,
      };
    }

    return {
      success: false,
      error: 'Email ou mot de passe incorrect',
    };
  };

  /**
   * Déconnexion utilisateur
   */
  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setIsSuperAdmin(false);

    localStorage.removeItem('ats_user');
    localStorage.removeItem('ats_superadmin');
  };

  /**
   * Connexion SuperAdmin
   * @param {string} password - Mot de passe SuperAdmin
   * @returns {object} { success, error }
   */
  const loginSuperAdmin = (password) => {
    if (password === SUPERADMIN_PASSWORD) {
      setIsSuperAdmin(true);
      localStorage.setItem('ats_superadmin', 'true');

      return { success: true };
    }

    return {
      success: false,
      error: 'Mot de passe SuperAdmin incorrect',
    };
  };

  /**
   * Déconnexion SuperAdmin (garde la session user normale)
   */
  const logoutSuperAdmin = () => {
    setIsSuperAdmin(false);
    localStorage.removeItem('ats_superadmin');
  };

  /**
   * Connexion automatique pour la démo (sans mot de passe)
   */
  const loginDemo = () => {
    const demoUser = { ...DEMO_USERS[0] };
    const { password: _, ...userWithoutPassword } = demoUser;

    setUser(userWithoutPassword);
    setIsLoggedIn(true);
    localStorage.setItem('ats_user', JSON.stringify(userWithoutPassword));

    return { success: true, user: userWithoutPassword };
  };

  /**
   * Mise à jour du profil utilisateur
   * @param {object} updates - Champs à mettre à jour
   */
  const updateProfile = (updates) => {
    if (!user) return { success: false, error: 'Non connecté' };

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('ats_user', JSON.stringify(updatedUser));

    return { success: true, user: updatedUser };
  };

  /**
   * Enregistrement d'un nouveau compte et connexion automatique
   * @param {object} accountData - Données du compte créé
   */
  const registerAndLogin = (accountData) => {
    // Créer l'objet utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = accountData;

    setUser(userWithoutPassword);
    setIsLoggedIn(true);
    localStorage.setItem('ats_user', JSON.stringify(userWithoutPassword));

    return {
      success: true,
      user: userWithoutPassword,
    };
  };

  const value = {
    // État
    user,
    isLoggedIn,
    isSuperAdmin,
    isLoading,

    // Méthodes
    login,
    logout,
    loginSuperAdmin,
    logoutSuperAdmin,
    loginDemo,
    updateProfile,
    registerAndLogin,

    // Données de démo (pour affichage des identifiants)
    demoUsers: DEMO_USERS.map(({ password, ...u }) => u),
    superAdminPassword: SUPERADMIN_PASSWORD,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook pour utiliser le contexte d'authentification
 * @returns {object} Contexte d'authentification
 *
 * @example
 * const { user, isLoggedIn, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }

  return context;
}

export default AuthContext;
