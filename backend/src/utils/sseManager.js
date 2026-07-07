/**
 * SSE Connection Manager
 *
 * Stocke les connexions SSE actives par companyId pour le broadcasting multi-tenant.
 * En mémoire uniquement — pour un déploiement multi-instance, remplacer par Redis pub/sub.
 */

// companyId (string) → Set<Express Response>
const clients = new Map();

export const addClient = (companyId, res) => {
  const key = String(companyId);
  if (!clients.has(key)) clients.set(key, new Set());
  clients.get(key).add(res);
};

export const removeClient = (companyId, res) => {
  const key = String(companyId);
  clients.get(key)?.delete(res);
  if (clients.get(key)?.size === 0) clients.delete(key);
};

/**
 * Émet un event SSE à tous les clients connectés pour une company.
 * @param {string} companyId
 * @param {string} event  — nom de l'event (ex: 'application:status')
 * @param {object} data   — payload JSON
 */
export const broadcast = (companyId, event, data) => {
  const key = String(companyId);
  const companyClients = clients.get(key);
  if (!companyClients || companyClients.size === 0) return;

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of companyClients) {
    try {
      res.write(payload);
    } catch {
      // Client disconnected without triggering close — remove silently
      companyClients.delete(res);
    }
  }
};

export const getClientCount = () => {
  let total = 0;
  for (const set of clients.values()) total += set.size;
  return total;
};
