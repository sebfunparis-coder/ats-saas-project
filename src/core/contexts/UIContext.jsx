/**
 * 🎨 UI Context
 *
 * Gère l'état de l'interface utilisateur (modales, notifications, dark mode, etc.)
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { STORAGE_KEYS } from '@/config/constants';

const UIContext = createContext(null);

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
};

export const UIProvider = ({ children }) => {
  // ===== DARK MODE =====
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    return stored === 'true';
  });

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(newValue));
      return newValue;
    });
  }, []);

  // ===== MODALS =====
  const [modals, setModals] = useState({
    // Missions
    missionDetail: { isOpen: false, data: null },
    missionForm: { isOpen: false, data: null },

    // Candidates
    candidateDetail: { isOpen: false, data: null },
    candidateForm: { isOpen: false, data: null },
    candidateImport: { isOpen: false },

    // Applications
    applicationDetail: { isOpen: false, data: null },
    applicationForm: { isOpen: false, data: null },

    // Clients
    clientDetail: { isOpen: false, data: null },
    clientForm: { isOpen: false, data: null },

    // Events
    eventForm: { isOpen: false, data: null },

    // Team
    teamMemberForm: { isOpen: false, data: null },

    // Generic
    confirmDialog: { isOpen: false, data: null },
    exportDialog: { isOpen: false, data: null }
  });

  /**
   * Open modal
   */
  const openModal = useCallback((modalName, data = null) => {
    setModals(prev => ({
      ...prev,
      [modalName]: { isOpen: true, data }
    }));
  }, []);

  /**
   * Close modal
   */
  const closeModal = useCallback((modalName) => {
    setModals(prev => ({
      ...prev,
      [modalName]: { isOpen: false, data: null }
    }));
  }, []);

  /**
   * Close all modals
   */
  const closeAllModals = useCallback(() => {
    setModals(prev => {
      const updated = {};
      Object.keys(prev).forEach(key => {
        updated[key] = { isOpen: false, data: null };
      });
      return updated;
    });
  }, []);

  // ===== NOTIFICATIONS =====
  const [notifications, setNotifications] = useState([]);

  /**
   * Show notification
   */
  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };

    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        dismissNotification(id);
      }, duration);
    }

    return id;
  }, []);

  /**
   * Dismiss notification
   */
  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  /**
   * Show success notification
   */
  const showSuccess = useCallback((message, duration = 3000) => {
    return showNotification(message, 'success', duration);
  }, [showNotification]);

  /**
   * Show error notification
   */
  const showError = useCallback((message, duration = 5000) => {
    return showNotification(message, 'error', duration);
  }, [showNotification]);

  /**
   * Show warning notification
   */
  const showWarning = useCallback((message, duration = 4000) => {
    return showNotification(message, 'warning', duration);
  }, [showNotification]);

  /**
   * Show info notification
   */
  const showInfo = useCallback((message, duration = 3000) => {
    return showNotification(message, 'info', duration);
  }, [showNotification]);

  // ===== SIDEBAR =====
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // ===== SELECTED ITEMS =====
  const [selectedItems, setSelectedItems] = useState({
    missions: [],
    candidates: [],
    applications: [],
    clients: []
  });

  /**
   * Select item
   */
  const selectItem = useCallback((type, id) => {
    setSelectedItems(prev => ({
      ...prev,
      [type]: [...prev[type], id]
    }));
  }, []);

  /**
   * Deselect item
   */
  const deselectItem = useCallback((type, id) => {
    setSelectedItems(prev => ({
      ...prev,
      [type]: prev[type].filter(itemId => itemId !== id)
    }));
  }, []);

  /**
   * Toggle item selection
   */
  const toggleItemSelection = useCallback((type, id) => {
    setSelectedItems(prev => {
      const isSelected = prev[type].includes(id);
      return {
        ...prev,
        [type]: isSelected
          ? prev[type].filter(itemId => itemId !== id)
          : [...prev[type], id]
      };
    });
  }, []);

  /**
   * Select all items
   */
  const selectAllItems = useCallback((type, ids) => {
    setSelectedItems(prev => ({
      ...prev,
      [type]: ids
    }));
  }, []);

  /**
   * Clear selection
   */
  const clearSelection = useCallback((type) => {
    setSelectedItems(prev => ({
      ...prev,
      [type]: []
    }));
  }, []);

  /**
   * Clear all selections
   */
  const clearAllSelections = useCallback(() => {
    setSelectedItems({
      missions: [],
      candidates: [],
      applications: [],
      clients: []
    });
  }, []);

  // ===== LOADING OVERLAY =====
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const showGlobalLoading = useCallback((message = 'Chargement...') => {
    setLoadingMessage(message);
    setIsGlobalLoading(true);
  }, []);

  const hideGlobalLoading = useCallback(() => {
    setIsGlobalLoading(false);
    setLoadingMessage('');
  }, []);

  const value = {
    // Dark Mode
    darkMode,
    toggleDarkMode,

    // Modals
    modals,
    openModal,
    closeModal,
    closeAllModals,

    // Notifications
    notifications,
    showNotification,
    dismissNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,

    // Sidebar
    sidebarCollapsed,
    toggleSidebar,
    setSidebarCollapsed,

    // Selected Items
    selectedItems,
    selectItem,
    deselectItem,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
    clearAllSelections,

    // Global Loading
    isGlobalLoading,
    loadingMessage,
    showGlobalLoading,
    hideGlobalLoading
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
