import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationsContext = createContext(null);

// Compteur module-level : deux notifications déclenchées dans la même milliseconde
// (ex. deux toasts synchrones) auraient sinon le même id, provoquant des clés React
// dupliquées dans Toast.jsx (warning "Encountered two children with the same key").
let notifIdCounter = 0;

const LOG_KEY = 'ats_notification_log';
const MAX_LOG = 50;
const PUSH_PERM_KEY = 'ats_push_permission';

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [notifLog, setNotifLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); } catch { return []; }
  });
  const [pushPermission, setPushPermission] = useState(() => {
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission;
  });

  const requestPushPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'unsupported';
    if (Notification.permission === 'granted') { setPushPermission('granted'); return 'granted'; }
    const result = await Notification.requestPermission();
    setPushPermission(result);
    return result;
  }, []);

  const sendBrowserPush = useCallback((title, body, type) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    try {
      new Notification(`${icons[type] || ''} ${title}`.trim(), { body: body || '', tag: 'ats-notif' });
    } catch {}
  }, []);

  const addToLog = useCallback((notif) => {
    setNotifLog(prev => {
      const next = [notif, ...prev].slice(0, MAX_LOG);
      localStorage.setItem(LOG_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const markLogRead = useCallback((id) => {
    setNotifLog(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem(LOG_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const markAllLogRead = useCallback(() => {
    setNotifLog(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem(LOG_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearLog = useCallback(() => {
    setNotifLog([]);
    localStorage.removeItem(LOG_KEY);
  }, []);

  const addNotification = useCallback((notification) => {
    const newNotif = {
      id: `${Date.now()}-${++notifIdCounter}`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'info',
      ...notification
    };

    setNotifications(prev => [newNotif, ...prev]);
    addToLog(newNotif);

    if (newNotif.type === 'error' || newNotif.type === 'warning' || newNotif.type === 'success') {
      sendBrowserPush(newNotif.title || newNotif.message, newNotif.message, newNotif.type);
    }

    setTimeout(() => removeNotification(newNotif.id), 5000);
    return newNotif.id;
  }, [addToLog, sendBrowserPush]);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => { setNotifications([]); }, []);

  const success = useCallback((title, message) => addNotification({ title, message, type: 'success' }), [addNotification]);
  const error = useCallback((title, message) => addNotification({ title, message, type: 'error' }), [addNotification]);
  const warning = useCallback((title, message) => addNotification({ title, message, type: 'warning' }), [addNotification]);
  const info = useCallback((title, message) => addNotification({ title, message, type: 'info' }), [addNotification]);
  const showNotification = useCallback((message, type = 'info') => addNotification({ title: message, type }), [addNotification]);

  const value = {
    notifications,
    addNotification,
    showNotification,
    markAsRead,
    removeNotification,
    clearAll,
    unreadCount: notifications.filter(n => !n.read).length,
    notifLog,
    markLogRead,
    markAllLogRead,
    clearLog,
    unreadLogCount: notifLog.filter(n => !n.read).length,
    pushPermission,
    requestPushPermission,
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

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error('useNotifications doit être utilisé dans un NotificationsProvider');
  return context;
}

export default NotificationsContext;
