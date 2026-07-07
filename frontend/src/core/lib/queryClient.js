import { QueryClient } from '@tanstack/react-query';

// Instance unique au niveau module (pas dans un composant) pour ne pas en
// recréer une nouvelle à chaque remount StrictMode — le cache doit survivre
// au double-mount dev de React.StrictMode (main.jsx).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
      // Resynchronise depuis Supabase quand l'onglet redevient actif/reconnecte
      // (T-258 — "synchronisation en arrière-plan"), sans polling permanent.
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      // Pas de retry auto sur les mutations : un insert (create) n'est pas
      // idempotent — retenter automatiquement après un timeout réseau risque
      // de dupliquer la ligne si l'écriture a en fait réussi côté serveur.
      // Les retries automatiques de T-258 s'appliquent aux lectures (idempotentes).
      retry: 0,
    },
  },
});

export default queryClient;
