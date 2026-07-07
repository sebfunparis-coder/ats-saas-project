import React, { createContext, useContext, useState } from 'react';

/**
 * Context de l'interface utilisateur
 * Gère l'état de l'UI (modals, notifications, selectedItems, etc.)
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

  // Menus déroulants
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

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

    // Menus
    showQuickAdd,
    setShowQuickAdd,
    showExportMenu,
    setShowExportMenu,

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
