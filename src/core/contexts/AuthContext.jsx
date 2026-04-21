/**
 * 🔐 Auth Context
 *
 * Gère l'état d'authentification de l'application
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services';
import { STORAGE_KEYS } from '@/config/constants';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        console.log('🔍 [AuthContext] Initializing auth from localStorage...');
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        // Essayer les deux clés pour compatibilité
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('authToken');

        console.log('🔍 [AuthContext] Token found:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
        console.log('🔍 [AuthContext] User found:', storedUser ? JSON.parse(storedUser) : 'NO USER');

        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          setIsSuperAdmin(parsedUser.role === 'superadmin');
          console.log('✅ [AuthContext] User authenticated:', parsedUser.email);
        } else {
          console.log('⚠️ [AuthContext] No valid auth found - user needs to login');
        }
      } catch (error) {
        console.error('❌ [AuthContext] Error initializing auth:', error);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);

      if (result.success) {
        const userData = result.data.user;
        setUser(userData);
        setIsAuthenticated(true);
        setIsSuperAdmin(userData.role === 'superadmin');
        return { success: true, user: userData };
      }

      return { success: false, error: result.message };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Erreur de connexion' };
    }
  };

  /**
   * Register new user
   * @param {object} data - Registration data
   */
  const register = async (data) => {
    try {
      const result = await authService.register(data);

      if (result.success) {
        const userData = result.data.user;
        setUser(userData);
        setIsAuthenticated(true);
        setIsSuperAdmin(userData.role === 'superadmin');
        return { success: true, user: userData };
      }

      return { success: false, error: result.message };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message || 'Erreur d\'inscription' };
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsSuperAdmin(false);
    }
  };

  /**
   * Update user profile
   * @param {object} data - Profile data
   */
  const updateProfile = async (data) => {
    try {
      const result = await authService.updateProfile(data);

      if (result.success) {
        const updatedUser = result.data.user;
        setUser(updatedUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      }

      return { success: false, error: result.message };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message || 'Erreur de mise à jour' };
    }
  };

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   */
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const result = await authService.changePassword(currentPassword, newPassword);

      if (result.success) {
        return { success: true };
      }

      return { success: false, error: result.message };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: error.message || 'Erreur de changement de mot de passe' };
    }
  };

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean}
   */
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  /**
   * Check if user has one of the roles
   * @param {array} roles - Roles to check
   * @returns {boolean}
   */
  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value = {
    // State
    user,
    isAuthenticated,
    isLoading,
    isSuperAdmin,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,

    // Helpers
    hasRole,
    hasAnyRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
