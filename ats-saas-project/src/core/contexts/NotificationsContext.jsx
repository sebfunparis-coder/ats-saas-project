import React, { createContext, useContext, useState } from 'react';

/**
 * Context pour les notifications
 * Gère les notifications toast en temps réel
 */

const NotificationsContext = createContext(null);

/**
 * Provider du contexte de notifications
 */
export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  /**
   * Ajoute une notification
   * @param {Object} notification - { title, message, type: 'success'|'error'|'warning'|'info' }
   */
  const addNotification = (notification) => {
    const newNotif = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      type: 'info', // success, error, warning, info
      ...notification
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Auto-remove après 5 secondes
    setTimeout(() => {
      removeNotification(newNotif.id);
    }, 5000);

    return newNotif.id;
  };

  /**
   * Marque une notification comme lue
   */
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  /**
   * Supprime une notification
   */
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  /**
   * Supprime toutes les notifications
   */
  const clearAll = () => {
    setNotifications([]);
  };

  /**
   * Helpers pour types spécifiques
   */
  const success = (title, message) => {
    return addNotification({ title, message, type: 'success' });
  };

  const error = (title, message) => {
    return addNotification({ title, message, type: 'error' });
  };

  const warning = (title, message) => {
    return addNotification({ title, message, type: 'warning' });
  };

  const info = (title, message) => {
    return addNotification({ title, message, type: 'info' });
  };

  const value = {
    notifications,
    addNotification,
    markAsRead,
    removeNotification,
    clearAll,
    // Helpers
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

/**
 * Hook pour utiliser les notifications
 */
export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error('useNotifications doit être utilisé dans un NotificationsProvider');
  }

  return context;
}

export default NotificationsContext;
