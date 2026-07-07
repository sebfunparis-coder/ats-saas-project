import { useEffect, useRef, useCallback } from 'react';

const SSE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '/api');

/**
 * Hook SSE — connexion Server-Sent Events au backend Express.
 * Le token JWT est passé en query string car EventSource ne supporte pas les headers.
 *
 * @param {string|null} token - JWT token de l'utilisateur
 * @param {(event: {type: string, data: object}) => void} onEvent - callback pour chaque événement
 */
export function useSSE(token, onEvent) {
  const esRef = useRef(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (!token) return;
    if (esRef.current) {
      esRef.current.close();
    }

    const url = `${SSE_URL}/sse/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener('connected', (e) => {
      try {
        const data = JSON.parse(e.data);
        onEventRef.current?.({ type: 'connected', data });
      } catch {}
    });

    es.addEventListener('message', (e) => {
      try {
        const data = JSON.parse(e.data);
        onEventRef.current?.({ type: data.type || 'message', data });
      } catch {}
    });

    // Écouter les types d'événements métier courants
    ['mission_updated', 'candidate_added', 'application_moved', 'notification'].forEach((eventType) => {
      es.addEventListener(eventType, (e) => {
        try {
          onEventRef.current?.({ type: eventType, data: JSON.parse(e.data) });
        } catch {}
      });
    });

    es.onerror = () => {
      es.close();
      esRef.current = null;
      // Reconnexion après 5s si le token est encore valide
      setTimeout(() => {
        if (token) connect();
      }, 5000);
    };
  }, [token]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, [connect]);
}

export default useSSE;
