import React, { createContext, useContext, useState } from 'react';

/**
 * Context de l'interface utilisateur
 * Gère l'état de l'UI (modals, notifications, darkMode, selectedItems, etc.)
 */

const UIContext = createContext(null);

/**
 * Provider du contexte UI
 */
export function UIProvider({ children }) {
  // État des modales
  const [selectedItem, setSelectedItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedItem, setEditedItem] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', message: 'Alice Martin ajoutée', date: new Date().toISOString(), read: false },
    { id: 2, type: 'warning', message: 'Entretien Bob dans 2h', date: new Date().toISOString(), read: false },
    { id: 3, type: 'info', message: 'Mission Product Manager mise à jour', date: new Date(Date.now() - 86400000).toISOString(), read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Menus déroulants
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Mode sombre
  const [darkMode, setDarkMode] = useState(false);

  // Mode d'affichage (grid ou liste)
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'

  // Tri
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' ou 'desc'

  /**
   * Ouvrir une modal de détail/édition
   */
  const openDetailModal = (item) => {
    setSelectedItem(item);
    setEditMode(false);
    setEditedItem(null);
  };

  /**
   * Fermer la modal de détail
   */
  const closeDetailModal = () => {
    setSelectedItem(null);
    setEditMode(false);
    setEditedItem(null);
  };

  /**
   * Activer le mode édition
   */
  const enableEditMode = () => {
    if (selectedItem) {
      setEditMode(true);
      setEditedItem({ ...selectedItem });
    }
  };

  /**
   * Désactiver le mode édition
   */
  const disableEditMode = () => {
    setEditMode(false);
    setEditedItem(null);
  };

  /**
   * Sauvegarder les modifications (callback externe)
   */
  const saveEdit = (callback) => {
    if (editedItem && callback) {
      callback(editedItem);
      closeDetailModal();
    }
  };

  /**
   * Ajouter une notification
   */
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      date: new Date().toISOString(),
      read: false,
      ...notification,
    };

    setNotifications([newNotification, ...notifications]);

    // Auto-supprimer après 5 secondes si type success
    if (notification.type === 'success') {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }
  };

  /**
   * Marquer une notification comme lue
   */
  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  /**
   * Marquer toutes les notifications comme lues
   */
  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  /**
   * Supprimer une notification
   */
  const removeNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  /**
   * Supprimer toutes les notifications lues
   */
  const clearReadNotifications = () => {
    setNotifications(notifications.filter(n => !n.read));
  };

  /**
   * Toggle du mode sombre
   */
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('ats_darkMode', newMode.toString());

    // Appliquer la classe au body
    if (newMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  /**
   * Changer le mode d'affichage
   */
  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  /**
   * Changer le tri
   */
  const changeSorting = (field) => {
    if (sortBy === field) {
      // Inverser l'ordre si même champ
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Nouveau champ, par défaut ascendant
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const value = {
    // Modal de détail
    selectedItem,
    setSelectedItem,
    editMode,
    setEditMode,
    editedItem,
    setEditedItem,
    openDetailModal,
    closeDetailModal,
    enableEditMode,
    disableEditMode,
    saveEdit,

    // Modal d'ajout utilisateur
    showAddUserModal,
    setShowAddUserModal,

    // Notifications
    notifications,
    setNotifications,
    showNotifications,
    setShowNotifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearReadNotifications,
    unreadCount: notifications.filter(n => !n.read).length,

    // Menus
    showQuickAdd,
    setShowQuickAdd,
    showExportMenu,
    setShowExportMenu,

    // Mode sombre
    darkMode,
    setDarkMode,
    toggleDarkMode,

    // Mode d'affichage
    viewMode,
    setViewMode,
    toggleViewMode,

    // Tri
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    changeSorting,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

/**
 * Hook pour utiliser le contexte UI
 */
export function useUI() {
  const context = useContext(UIContext);

  if (!context) {
    throw new Error('useUI doit être utilisé dans un UIProvider');
  }

  return context;
}

export default UIContext;
