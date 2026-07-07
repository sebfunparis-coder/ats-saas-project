import { useEffect } from 'react';
import { useAuth } from '@/core/contexts/AuthContext';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import { useSSE } from '@/core/hooks/useSSE';

const SSE_EVENT_MESSAGES = {
  mission_updated:    (d) => `Mission mise à jour : ${d.title || ''}`,
  candidate_added:    (d) => `Nouveau candidat : ${d.name || ''}`,
  application_moved:  (d) => `Candidature déplacée vers ${d.status || ''}`,
  notification:       (d) => d.message || 'Nouvelle notification',
};

/**
 * Composant sans rendu qui gère la connexion SSE au backend Express.
 * À monter une seule fois dans AppLayout (quand l'utilisateur est connecté).
 */
export function SSEManager() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Le token JWT est stocké dans localStorage par auth.service.js
  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('token') || localStorage.getItem('authToken'))
    : null;

  // N'activer le SSE que si l'utilisateur est connecté et a un JWT backend
  // (les comptes démo Supabase n'ont pas de JWT Express → on skip)
  const effectiveToken = user && !user._demo ? token : null;

  useSSE(effectiveToken, (event) => {
    if (event.type === 'connected') return; // pas de notification pour la connexion initiale

    const getMessage = SSE_EVENT_MESSAGES[event.type];
    if (!getMessage) return;

    addNotification({
      title: getMessage(event.data),
      type: 'info',
    });
  });

  return null;
}

export default SSEManager;
