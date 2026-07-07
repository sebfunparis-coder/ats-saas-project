function getLocale() {
  const lang = (typeof localStorage !== 'undefined' ? localStorage.getItem('ats_language') : null) || 'fr';
  return lang.startsWith('en') ? 'en-GB' : 'fr-FR';
}
/**
 * Fonctions utilitaires pour les calculs financiers et statistiques
 */

/**
 * Parse MRR string vers nombre
 * @param {string|number} mrrString - "€6,500" ou 6500
 * @returns {number} - 6500
 */
export const parseMRR = (mrrString) => {
  if (typeof mrrString === 'number') return mrrString;
  if (!mrrString) return 0;

  // Supprimer €, espaces, virgules et parser
  const cleaned = String(mrrString).replace(/[€,\s]/g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Format nombre vers currency
 * @param {number} amount - 6500
 * @returns {string} - "€6,500"
 */
export const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return '€0';
  return `€${Math.round(amount).toLocaleString(getLocale())}`;
};

/**
 * Parse percentage string vers nombre
 * @param {string} percentString - "18.5%"
 * @returns {number} - 18.5
 */
export const parsePercentage = (percentString) => {
  if (typeof percentString === 'number') return percentString;
  if (!percentString) return 0;

  const cleaned = String(percentString).replace(/%/g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Format nombre vers percentage
 * @param {number} value - 18.5
 * @returns {string} - "18.5%"
 */
export const formatPercentage = (value) => {
  if (!value || isNaN(value)) return '0%';
  return `${value.toFixed(1)}%`;
};

/**
 * Calcule les statistiques globales de la plateforme
 * @param {Array} companies - Liste des entreprises
 * @param {Array} candidates - Liste des candidats
 * @param {Array} missions - Liste des missions
 * @param {Array} applications - Liste des candidatures
 * @returns {Object} - Statistiques calculées
 */
export const calculatePlatformStats = (companies = [], candidates = [], missions = [], applications = []) => {
  // Filtrer les entreprises par statut
  const activeCompanies = companies.filter(c => c.status === 'active');
  const trialCompanies = companies.filter(c => c.status === 'trial');
  const suspendedCompanies = companies.filter(c => c.status === 'suspended');

  // Calculer MRR total (seulement entreprises actives)
  const totalMRR = activeCompanies.reduce((sum, c) => sum + parseMRR(c.mrr), 0);
  const totalARR = totalMRR * 12;

  // Calculer nombre total d'utilisateurs
  const totalUsers = companies.reduce((sum, c) => sum + (c.users?.length || 0), 0);

  // Calculer missions actives
  const activeMissions = missions.filter(m => m.status === 'open');

  // Calculer signups ce mois
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const signupsThisMonth = companies.filter(c => {
    if (!c.joinDate) return false;
    const joinDate = new Date(c.joinDate);
    return joinDate.getMonth() === thisMonth && joinDate.getFullYear() === thisYear;
  }).length;

  // Calculer churn rate (entreprises qui ont quitté ce mois)
  const churnedThisMonth = companies.filter(c => {
    if (c.status !== 'cancelled' && c.status !== 'suspended') return false;
    if (!c.cancelledDate && !c.suspendedDate) return false;

    const cancelDate = new Date(c.cancelledDate || c.suspendedDate);
    return cancelDate.getMonth() === thisMonth && cancelDate.getFullYear() === thisYear;
  }).length;

  const churnRate = companies.length > 0
    ? (churnedThisMonth / companies.length) * 100
    : 0;

  // Calculer taux de conversion (trial → active)
  const totalWithStatus = activeCompanies.length + trialCompanies.length;
  const conversionRate = totalWithStatus > 0
    ? (activeCompanies.length / totalWithStatus) * 100
    : 0;

  // Calculer nombre de candidats par entreprise
  const candidatesCount = companies.reduce((sum, c) => {
    return sum + (c.candidateIds?.length || 0);
  }, 0);

  return {
    // Entreprises
    totalCompanies: companies.length,
    activeCompanies: activeCompanies.length,
    trialCompanies: trialCompanies.length,
    suspendedCompanies: suspendedCompanies.length,

    // Utilisateurs
    totalUsers,

    // Candidats et Missions
    totalCandidates: candidates.length,
    totalMissions: missions.length,
    activeMissions: activeMissions.length,

    // Financier
    mrr: formatCurrency(totalMRR),
    arr: formatCurrency(totalARR),
    totalMRRValue: totalMRR, // Valeur numérique pour calculs
    totalARRValue: totalARR,

    // KPIs
    conversionRate: formatPercentage(conversionRate),
    churnRate: formatPercentage(churnRate),
    conversionRateValue: conversionRate,
    churnRateValue: churnRate,

    // Croissance
    signupsThisMonth,
    churnedThisMonth,
  };
};

/**
 * Détermine le niveau d'engagement
 * @param {number} healthScore - Score de santé
 * @returns {string} - 'high', 'medium', 'low'
 */
export const getEngagementLevel = (healthScore) => {
  if (healthScore >= 80) return 'high';
  if (healthScore >= 50) return 'medium';
  return 'low';
};

/**
 * Calcule les statistiques de campagne marketing
 * @param {Array} campaigns - Liste des campagnes
 * @returns {Object} - Stats agrégées
 */
export const calculateCampaignStats = (campaigns = []) => {
  const activeCampaigns = campaigns.filter(c => c.status === 'active');

  const totalBudget = campaigns.reduce((sum, c) => sum + parseMRR(c.budget), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + parseMRR(c.spent), 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + (c.leads || 0), 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);

  const conversionRate = totalLeads > 0
    ? (totalConversions / totalLeads) * 100
    : 0;

  return {
    total: campaigns.length,
    active: activeCampaigns.length,
    totalBudget: formatCurrency(totalBudget),
    totalSpent: formatCurrency(totalSpent),
    totalLeads,
    totalConversions,
    conversionRate: formatPercentage(conversionRate)
  };
};

/**
 * Calcule les revenus générés par les codes promo
 * @param {Array} promoCodes - Liste des codes promo
 * @returns {Object} - Stats des promos
 */
export const calculatePromoStats = (promoCodes = []) => {
  const activeCodes = promoCodes.filter(p => p.status === 'active');

  const totalUses = promoCodes.reduce((sum, p) => sum + (p.uses || 0), 0);
  const totalRevenue = promoCodes.reduce((sum, p) => sum + parseMRR(p.revenue), 0);

  return {
    total: promoCodes.length,
    active: activeCodes.length,
    totalUses,
    totalRevenue: formatCurrency(totalRevenue)
  };
};

/**
 * Calcule les statistiques de support
 * @param {Array} tickets - Liste des tickets
 * @returns {Object} - Stats support
 */
export const calculateSupportStats = (tickets = []) => {
  const openTickets = tickets.filter(t => t.status === 'open');
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved');
  const highPriorityTickets = tickets.filter(t => t.priority === 'high');

  const resolutionRate = tickets.length > 0
    ? (resolvedTickets.length / tickets.length) * 100
    : 0;

  return {
    total: tickets.length,
    open: openTickets.length,
    inProgress: inProgressTickets.length,
    resolved: resolvedTickets.length,
    highPriority: highPriorityTickets.length,
    resolutionRate: formatPercentage(resolutionRate)
  };
};

export default {
  parseMRR,
  formatCurrency,
  parsePercentage,
  formatPercentage,
  calculatePlatformStats,
  getEngagementLevel,
  calculateCampaignStats,
  calculatePromoStats,
  calculateSupportStats
};
