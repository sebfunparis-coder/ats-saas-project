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
  return `€${Math.round(amount).toLocaleString('fr-FR')}`;
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
 * Calcule les statistiques par plan
 * @param {Array} companies - Liste des entreprises
 * @returns {Object} - Stats par plan
 */
export const calculatePlanStats = (companies = []) => {
  const plans = ['Starter', 'Professional', 'Enterprise'];
  const planPrices = {
    'Starter': 99,
    'Professional': 299,
    'Enterprise': 6500
  };

  return plans.map(planName => {
    const companiesInPlan = companies.filter(c => c.plan === planName && c.status === 'active');
    const count = companiesInPlan.length;
    const price = planPrices[planName];
    const mrr = count * price;
    const arr = mrr * 12;

    return {
      plan: planName,
      count,
      price: formatCurrency(price),
      mrr: formatCurrency(mrr),
      arr: formatCurrency(arr),
      mrrValue: mrr,
      arrValue: arr
    };
  });
};

/**
 * Calcule le health score d'une entreprise
 * @param {Object} company - Entreprise
 * @param {Array} allCandidates - Tous les candidats
 * @param {Array} allMissions - Toutes les missions
 * @returns {number} - Score entre 0 et 100
 */
export const calculateCompanyHealth = (company, allCandidates = [], allMissions = []) => {
  let score = 0;

  // Statut actif = +30 points
  if (company.status === 'active') score += 30;
  else if (company.status === 'trial') score += 15;

  // Activité récente = +20 points
  if (company.lastLogin) {
    const lastLogin = new Date(company.lastLogin);
    const daysSinceLogin = (new Date() - lastLogin) / (1000 * 60 * 60 * 24);

    if (daysSinceLogin <= 1) score += 20;
    else if (daysSinceLogin <= 7) score += 15;
    else if (daysSinceLogin <= 30) score += 10;
  }

  // Nombre d'utilisateurs = +20 points
  const userCount = company.users?.length || 0;
  if (userCount >= 10) score += 20;
  else if (userCount >= 5) score += 15;
  else if (userCount >= 1) score += 10;

  // Candidats = +15 points
  const candidateCount = company.candidateIds?.length || 0;
  if (candidateCount >= 50) score += 15;
  else if (candidateCount >= 20) score += 10;
  else if (candidateCount >= 5) score += 5;

  // Missions = +15 points
  const missionCount = company.missionIds?.length || 0;
  if (missionCount >= 10) score += 15;
  else if (missionCount >= 5) score += 10;
  else if (missionCount >= 1) score += 5;

  return Math.min(100, Math.max(0, score));
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
  calculatePlanStats,
  calculateCompanyHealth,
  getEngagementLevel,
  calculateCampaignStats,
  calculatePromoStats,
  calculateSupportStats
};
