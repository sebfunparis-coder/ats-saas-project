/**
 * ⚙️ Plans Configuration
 *
 * Définit les limites et fonctionnalités de chaque plan d'abonnement.
 * Modifier ce fichier suffit pour ajuster les limites — aucun redéploiement du contrôleur nécessaire.
 */

export const PLANS = {
  Starter: {
    maxUsers: 3,
    maxMissions: 10,
    maxCandidates: 100,
    maxStorageMb: 500,
    features: {
      audit: false,
      advancedFilters: false,
      apiAccess: false,
      customEmailTemplates: false
    }
  },

  Pro: {
    maxUsers: 10,
    maxMissions: 50,
    maxCandidates: 500,
    maxStorageMb: 5000,
    features: {
      audit: true,
      advancedFilters: true,
      apiAccess: false,
      customEmailTemplates: true
    }
  },

  Enterprise: {
    maxUsers: 999,
    maxMissions: 999,
    maxCandidates: 9999,
    maxStorageMb: 50000,
    features: {
      audit: true,
      advancedFilters: true,
      apiAccess: true,
      customEmailTemplates: true
    }
  }
};

/**
 * Retourne les limites du plan donné, avec fallback sur Starter si le plan est inconnu.
 * @param {string} plan
 * @returns {{ maxUsers: number, maxMissions: number, maxCandidates: number, maxStorageMb: number, features: Object }}
 */
export const getPlanLimits = (plan) => {
  return PLANS[plan] ?? PLANS.Starter;
};

export const VALID_PLANS = Object.keys(PLANS);
