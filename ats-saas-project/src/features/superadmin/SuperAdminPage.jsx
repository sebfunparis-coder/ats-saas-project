import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

/**
 * Page SuperAdmin - Tableau de bord administration plateforme COMPLET
 * Pilotage, commercialisation, promotion, analytics
 */
export function SuperAdminPage() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('dashboard');

  // Mock data - À remplacer par vrais appels API
  const platformStats = {
    totalCompanies: 47,
    activeCompanies: 45,
    trialCompanies: 2,
    totalUsers: 342,
    activeUsers24h: 287,
    totalCandidates: 12847,
    totalMissions: 1256,
    activeMissions: 845,
    monthlyRevenue: '€124,500',
    yearlyRevenue: '€1,340,000',
    mrr: '€124,500',
    arr: '€1,494,000',
    activeSubscriptions: 45,
    churnRate: '2.3%',
    avgRevenuePerAccount: '€2,766',
    lifetimeValue: '€45,200',
    conversionRate: '18.5%',
    signupsThisMonth: 12,
    trialsToActive: '85%'
  };

  const revenueByPlan = [
    { plan: 'Enterprise', count: 8, revenue: '€52,000', percentage: 42 },
    { plan: 'Professional', count: 25, revenue: '€60,000', percentage: 48 },
    { plan: 'Starter', count: 12, revenue: '€12,500', percentage: 10 }
  ];

  const companies = [
    { id: 1, name: 'TechCorp France', plan: 'Enterprise', users: 25, candidates: 3420, missions: 156, revenue: '€45,000', mrr: '€6,500', status: 'active', joinDate: '2024-01-15', lastLogin: '2026-02-17 09:23', health: 95, engagement: 'high', nextBilling: '2026-03-01', paymentMethod: 'Carte bancaire' },
    { id: 2, name: 'Digital Consulting', plan: 'Professional', users: 12, candidates: 1890, missions: 89, revenue: '€15,000', mrr: '€299', status: 'active', joinDate: '2024-03-22', lastLogin: '2026-02-17 08:45', health: 88, engagement: 'medium', nextBilling: '2026-03-15', paymentMethod: 'Virement' },
    { id: 3, name: 'StartupLab', plan: 'Starter', users: 5, candidates: 450, missions: 34, revenue: '€0', mrr: '€0', status: 'trial', joinDate: '2026-02-01', lastLogin: '2026-02-16 18:30', health: 72, engagement: 'low', nextBilling: '2026-02-28', paymentMethod: 'Trial' },
    { id: 4, name: 'HR Solutions Pro', plan: 'Professional', users: 15, candidates: 2340, missions: 112, revenue: '€18,000', mrr: '€299', status: 'active', joinDate: '2024-06-10', lastLogin: '2026-02-17 10:12', health: 91, engagement: 'high', nextBilling: '2026-02-25', paymentMethod: 'Prélèvement' },
    { id: 5, name: 'Finance Recruitment', plan: 'Enterprise', users: 28, candidates: 4120, missions: 187, revenue: '€52,000', mrr: '€6,500', status: 'active', joinDate: '2023-11-05', lastLogin: '2026-02-17 07:55', health: 97, engagement: 'high', nextBilling: '2026-03-05', paymentMethod: 'Carte bancaire' }
  ];

  const marketingCampaigns = [
    { id: 1, name: 'Offre Printemps 2026', type: 'Promo', status: 'active', budget: '€5,000', spent: '€3,200', leads: 142, conversions: 8, roi: '240%', startDate: '2026-02-01', endDate: '2026-03-31' },
    { id: 2, name: 'LinkedIn Ads B2B', type: 'Paid Ads', status: 'active', budget: '€3,000', spent: '€2,800', leads: 89, conversions: 4, roi: '180%', startDate: '2026-01-15', endDate: '2026-02-28' },
    { id: 3, name: 'Email Nurturing', type: 'Email', status: 'active', budget: '€500', spent: '€320', leads: 234, conversions: 12, roi: '420%', startDate: '2026-01-01', endDate: '2026-12-31' },
    { id: 4, name: 'Webinar Recrutement', type: 'Event', status: 'scheduled', budget: '€2,000', spent: '€0', leads: 0, conversions: 0, roi: '0%', startDate: '2026-03-15', endDate: '2026-03-15' }
  ];

  const promoCodes = [
    { id: 1, code: 'SPRING2026', discount: '30%', type: 'Pourcentage', uses: 23, limit: 100, revenue: '€12,400', status: 'active', expires: '2026-03-31' },
    { id: 2, code: 'FIRST3MONTHS', discount: '-50%', type: '3 mois', uses: 8, limit: 50, revenue: '€4,200', status: 'active', expires: '2026-12-31' },
    { id: 3, code: 'ENTERPRISE500', discount: '€500', type: 'Fixe', uses: 2, limit: 10, revenue: '€11,000', status: 'active', expires: '2026-06-30' }
  ];

  const supportTickets = [
    { id: 1, company: 'TechCorp France', subject: 'Problème export candidats', priority: 'high', status: 'open', assignedTo: 'Marie', created: '2026-02-17 08:30', updated: '2026-02-17 09:15' },
    { id: 2, company: 'Digital Consulting', subject: 'Question facturation', priority: 'medium', status: 'in_progress', assignedTo: 'Jean', created: '2026-02-16 14:20', updated: '2026-02-17 10:00' },
    { id: 3, company: 'StartupLab', subject: 'Demande upgrade plan', priority: 'low', status: 'resolved', assignedTo: 'Sophie', created: '2026-02-15 11:00', updated: '2026-02-16 16:30' }
  ];

  const analytics = {
    pageViews: 45678,
    uniqueVisitors: 12345,
    avgSessionDuration: '4m 32s',
    bounceRate: '32%',
    mostVisitedPages: [
      { page: '/app/candidates', views: 8945, avgTime: '6m 12s' },
      { page: '/app/missions', views: 7234, avgTime: '5m 40s' },
      { page: '/app/pipeline', views: 5678, avgTime: '8m 25s' }
    ],
    usersByCountry: [
      { country: 'France', users: 285, percentage: 83 },
      { country: 'Belgique', users: 34, percentage: 10 },
      { country: 'Suisse', users: 15, percentage: 4 },
      { country: 'Canada', users: 8, percentage: 2 }
    ],
    conversionFunnel: [
      { stage: 'Visites site', count: 5678, percentage: 100 },
      { stage: 'Inscription trial', count: 234, percentage: 4.1 },
      { stage: 'Activation compte', count: 198, percentage: 84.6 },
      { stage: 'Conversion payant', count: 37, percentage: 18.7 }
    ]
  };

  const recentActivity = [
    { type: 'new_company', company: 'StartupLab', message: 'Nouvelle entreprise inscrite (Trial)', time: 'Il y a 2h', icon: '🏢', color: '#10B981' },
    { type: 'upgrade', company: 'Digital Consulting', message: 'Upgrade vers plan Enterprise demandé', time: 'Il y a 5h', icon: '⬆️', color: '#667EEA' },
    { type: 'payment', company: 'TechCorp France', message: 'Paiement reçu: €6,500', time: 'Il y a 8h', icon: '💳', color: '#F59E0B' },
    { type: 'support', company: 'HR Solutions Pro', message: 'Ticket support ouvert', time: 'Il y a 1j', icon: '🎫', color: '#EF4444' },
    { type: 'milestone', company: 'Finance Recruitment', message: '5000 candidats atteints', time: 'Il y a 2j', icon: '🎯', color: '#8B5CF6' }
  ];

  const systemStatus = [
    { metric: 'API Response Time', value: '142ms', status: 'good', icon: '⚡', target: '< 200ms' },
    { metric: 'Database Load', value: '23%', status: 'good', icon: '💾', target: '< 70%' },
    { metric: 'Server Uptime', value: '99.98%', status: 'good', icon: '🖥️', target: '> 99.9%' },
    { metric: 'Active Users (24h)', value: '287', status: 'good', icon: '👥', target: '> 200' },
    { metric: 'Disk Usage', value: '45%', status: 'good', icon: '💿', target: '< 80%' },
    { metric: 'Memory Usage', value: '62%', status: 'warning', icon: '🧠', target: '< 75%' }
  ];

  const tabs = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'companies', icon: '🏢', label: 'Entreprises' },
    { id: 'users', icon: '👥', label: 'Utilisateurs' },
    { id: 'billing', icon: '💰', label: 'Facturation' },
    { id: 'marketing', icon: '📣', label: 'Marketing' },
    { id: 'support', icon: '🎧', label: 'Support' },
    { id: 'system', icon: '⚙️', label: 'Système' }
  ];

  const handleExportData = (type) => {
    alert(`📥 Export ${type} en cours...`);
  };

  const handleSendCampaign = () => {
    alert('📧 Campagne email envoyée à tous les utilisateurs !');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)' }}>
      {/* Header SuperAdmin */}
      <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '24px 50px' }}>
        <div style={{ maxWidth: '1800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
              👑 SuperAdmin Dashboard
            </h1>
            <p style={{ color: '#9CA3AF', fontSize: '16px' }}>Pilotage complet de la plateforme ATS Ultimate</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => handleExportData('complet')}
              style={{ padding: '12px 24px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.3s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#5568D3'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#667EEA'}>
              📥 Export Global
            </button>
            <button
              onClick={() => navigate(ROUTES.LANDING)}
              style={{ padding: '12px 24px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.3s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#DC2626'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#EF4444'}>
              🚪 Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ background: '#1F2937', borderBottom: '2px solid rgba(255,255,255,0.05)', padding: '0 50px', overflowX: 'auto' }}>
        <div style={{ maxWidth: '1800px', margin: '0 auto', display: 'flex', gap: '8px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              style={{
                padding: '16px 28px',
                background: selectedTab === tab.id ? 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)' : 'transparent',
                color: selectedTab === tab.id ? 'white' : '#9CA3AF',
                border: 'none',
                borderBottom: selectedTab === tab.id ? '3px solid #667EEA' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.3s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (selectedTab !== tab.id) e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                if (selectedTab !== tab.id) e.currentTarget.style.color = '#9CA3AF';
              }}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '50px', maxWidth: '1800px', margin: '0 auto' }}>

        {/* DASHBOARD TAB */}
        {selectedTab === 'dashboard' && (
          <div>
            {/* Stats Grid Principal */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
              {[
                { icon: '💰', label: 'MRR', value: platformStats.mrr, subtext: `ARR: ${platformStats.arr}`, color: '#667EEA' },
                { icon: '🏢', label: 'Entreprises', value: platformStats.totalCompanies, subtext: `${platformStats.trialCompanies} en trial`, color: '#10B981' },
                { icon: '👥', label: 'Utilisateurs', value: platformStats.totalUsers, subtext: `${platformStats.activeUsers24h} actifs 24h`, color: '#F59E0B' },
                { icon: '📊', label: 'Taux Conversion', value: platformStats.conversionRate, subtext: `${platformStats.signupsThisMonth} signups ce mois`, color: '#8B5CF6' }
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    padding: '32px',
                    background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
                    borderRadius: '20px',
                    border: '2px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.borderColor = stat.color;
                    e.currentTarget.style.boxShadow = `0 20px 60px ${stat.color}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>{stat.label}</div>
                  <div style={{ fontSize: '36px', fontWeight: '900', background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}99 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>{stat.subtext}</div>
                </div>
              ))}
            </div>

            {/* Revenue by Plan */}
            <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', padding: '32px', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '32px' }}>💎</span>
                Répartition Revenue par Plan
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {revenueByPlan.map((item, i) => (
                  <div key={i} style={{ padding: '20px', background: '#0F172A', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <span style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>{item.plan}</span>
                        <span style={{ marginLeft: '12px', fontSize: '14px', color: '#9CA3AF' }}>({item.count} comptes)</span>
                      </div>
                      <span style={{ fontSize: '24px', fontWeight: '900', color: '#10B981' }}>{item.revenue}</span>
                    </div>
                    <div style={{ width: '100%', height: '12px', background: '#1E293B', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.percentage}%`, height: '100%', background: 'linear-gradient(90deg, #667EEA 0%, #FF6B9D 100%)', transition: 'all 0.5s' }}></div>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '13px', color: '#6B7280', textAlign: 'right' }}>{item.percentage}% du total</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity & Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              {/* Recent Activity */}
              <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', padding: '32px', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '32px' }}>📈</span>
                  Activité Récente
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {recentActivity.map((activity, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '20px',
                        background: '#0F172A',
                        borderRadius: '12px',
                        borderLeft: `4px solid ${activity.color}`,
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(8px)';
                        e.currentTarget.style.background = '#1E293B';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.background = '#0F172A';
                      }}>
                      <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
                        <div style={{ fontSize: '32px' }}>{activity.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>{activity.company}</div>
                          <div style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '8px' }}>{activity.message}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>{activity.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', padding: '32px', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '32px' }}>⚡</span>
                  Métriques Clés
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[
                    { label: 'LTV Moyen', value: platformStats.lifetimeValue, icon: '💎' },
                    { label: 'Churn Rate', value: platformStats.churnRate, icon: '📉' },
                    { label: 'Trial → Payant', value: platformStats.trialsToActive, icon: '🎯' },
                    { label: 'Revenue/Compte', value: platformStats.avgRevenuePerAccount, icon: '💰' }
                  ].map((stat, i) => (
                    <div key={i} style={{ padding: '16px', background: '#0F172A', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600', marginBottom: '4px' }}>{stat.label}</div>
                          <div style={{ fontSize: '20px', fontWeight: '800', color: '#10B981' }}>{stat.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {selectedTab === 'analytics' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '32px' }}>Analytics & Insights</h2>

            {/* Top Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
              {[
                { label: 'Page Views', value: analytics.pageViews.toLocaleString(), icon: '👀', color: '#667EEA' },
                { label: 'Visiteurs Uniques', value: analytics.uniqueVisitors.toLocaleString(), icon: '👥', color: '#10B981' },
                { label: 'Durée Session', value: analytics.avgSessionDuration, icon: '⏱️', color: '#F59E0B' },
                { label: 'Bounce Rate', value: analytics.bounceRate, icon: '↩️', color: '#EF4444' }
              ].map((metric, i) => (
                <div key={i} style={{ padding: '24px', background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{metric.icon}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>{metric.label}</div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: metric.color }}>{metric.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Most Visited Pages */}
              <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', padding: '32px', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '20px' }}>📄 Pages les Plus Visitées</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analytics.mostVisitedPages.map((page, i) => (
                    <div key={i} style={{ padding: '16px', background: '#0F172A', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: 'white', fontWeight: '700' }}>{page.page}</span>
                        <span style={{ color: '#667EEA', fontWeight: '800' }}>{page.views.toLocaleString()} vues</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#9CA3AF' }}>Temps moyen: {page.avgTime}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Users by Country */}
              <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', padding: '32px', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '20px' }}>🌍 Utilisateurs par Pays</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analytics.usersByCountry.map((country, i) => (
                    <div key={i} style={{ padding: '16px', background: '#0F172A', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: 'white', fontWeight: '700' }}>{country.country}</span>
                        <span style={{ color: '#10B981', fontWeight: '800' }}>{country.users} users ({country.percentage}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${country.percentage}%`, height: '100%', background: '#10B981' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Conversion Funnel */}
            <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', padding: '32px', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '24px' }}>🎯 Tunnel de Conversion</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {analytics.conversionFunnel.map((stage, i) => (
                  <div key={i} style={{ padding: '20px', background: '#0F172A', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>{i + 1}. {stage.stage}</span>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <span style={{ fontSize: '18px', fontWeight: '800', color: '#667EEA' }}>{stage.count.toLocaleString()}</span>
                        <span style={{ fontSize: '14px', color: '#10B981', fontWeight: '700' }}>{stage.percentage}%</span>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: '12px', background: '#1E293B', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${stage.percentage}%`, height: '100%', background: 'linear-gradient(90deg, #667EEA 0%, #FF6B9D 100%)' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* COMPANIES TAB */}
        {selectedTab === 'companies' && (
          <div>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>Gestion des Entreprises ({companies.length})</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handleExportData('entreprises')}
                  style={{ padding: '12px 24px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                  📥 Export CSV
                </button>
                <button
                  onClick={() => alert('➕ Nouvelle entreprise')}
                  style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                  ➕ Ajouter Entreprise
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {companies.map(company => (
                <div
                  key={company.id}
                  style={{
                    padding: '28px',
                    background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
                    borderRadius: '16px',
                    border: '2px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = '#667EEA';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(102, 126, 234, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        🏢 {company.name}
                        <span style={{
                          padding: '4px 12px',
                          background: company.status === 'active' ? '#10B981' : '#F59E0B',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700'
                        }}>
                          {company.status === 'active' ? 'Actif' : 'Trial'}
                        </span>
                        <span style={{
                          padding: '4px 12px',
                          background: company.plan === 'Enterprise' ? '#8B5CF6' : company.plan === 'Professional' ? '#667EEA' : '#6B7280',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700'
                        }}>
                          {company.plan}
                        </span>
                      </h3>
                      <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '8px' }}>
                        Inscrit le {company.joinDate} • Dernière connexion: {company.lastLogin}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '80px',
                            height: '8px',
                            background: '#1E293B',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${company.health}%`,
                              height: '100%',
                              background: company.health > 90 ? '#10B981' : company.health > 70 ? '#F59E0B' : '#EF4444'
                            }}></div>
                          </div>
                          <span style={{ fontSize: '13px', color: '#9CA3AF' }}>Health: {company.health}%</span>
                        </div>
                        <span style={{
                          padding: '4px 10px',
                          background: company.engagement === 'high' ? '#10B98120' : company.engagement === 'medium' ? '#F59E0B20' : '#EF444420',
                          color: company.engagement === 'high' ? '#10B981' : company.engagement === 'medium' ? '#F59E0B' : '#EF4444',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700'
                        }}>
                          {company.engagement === 'high' ? '🔥 High' : company.engagement === 'medium' ? '⚡ Medium' : '❄️ Low'} Engagement
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '28px', fontWeight: '900', color: '#10B981', marginBottom: '4px' }}>{company.mrr}/mois</div>
                      <div style={{ fontSize: '14px', color: '#6B7280' }}>Total: {company.revenue}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '20px', background: '#0F172A', borderRadius: '12px', marginBottom: '16px' }}>
                    {[
                      { label: 'Utilisateurs', value: company.users, icon: '👥' },
                      { label: 'Candidats', value: company.candidates, icon: '💼' },
                      { label: 'Missions', value: company.missions, icon: '🎯' },
                      { label: 'Prochaine fact.', value: company.nextBilling.split('-')[2] + '/' + company.nextBilling.split('-')[1], icon: '📅' }
                    ].map((stat, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>{stat.icon}</div>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#667EEA', marginBottom: '4px' }}>{stat.value}</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); alert(`📧 Email envoyé à ${company.name}`); }}
                      style={{ padding: '10px 20px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', flex: 1 }}>
                      📧 Contacter
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); alert(`✏️ Édition ${company.name}`); }}
                      style={{ padding: '10px 20px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', flex: 1 }}>
                      ✏️ Éditer
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); alert(`🔐 Connexion en tant que ${company.name}`); }}
                      style={{ padding: '10px 20px', background: '#8B5CF6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', flex: 1 }}>
                      🔐 Login As
                    </button>
                    {company.status === 'trial' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); alert(`⬆️ Upgrade ${company.name} vers plan payant`); }}
                        style={{ padding: '10px 20px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', flex: 1 }}>
                        ⬆️ Upgrade
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {selectedTab === 'users' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '32px' }}>Gestion des Utilisateurs ({platformStats.totalUsers})</h2>
            <div style={{ padding: '80px', textAlign: 'center', background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '80px', marginBottom: '20px' }}>👥</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '12px' }}>Vue Utilisateurs Complète</div>
              <div style={{ fontSize: '16px', color: '#9CA3AF', marginBottom: '16px' }}>
                Liste détaillée des {platformStats.totalUsers} utilisateurs de la plateforme
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>
                • Recherche & filtres avancés<br/>
                • Gestion des rôles et permissions<br/>
                • Historique des connexions<br/>
                • Export des données utilisateurs
              </div>
              <button
                onClick={() => alert('🚀 Fonctionnalité en développement')}
                style={{ marginTop: '24px', padding: '14px 32px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>
                🔓 Activer Module Complet
              </button>
            </div>
          </div>
        )}

        {/* BILLING TAB */}
        {selectedTab === 'billing' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '32px' }}>Facturation & Abonnements</h2>

            {/* Revenue Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
              {[
                { label: 'MRR', value: platformStats.mrr, change: '+12.5%', icon: '💰', color: '#10B981' },
                { label: 'ARR', value: platformStats.arr, change: '+18.2%', icon: '📊', color: '#667EEA' },
                { label: 'Abonnements Actifs', value: platformStats.activeSubscriptions, change: '+3', icon: '✅', color: '#F59E0B' },
                { label: 'Churn Rate', value: platformStats.churnRate, change: '-0.4%', icon: '📉', color: '#EF4444' }
              ].map((metric, i) => (
                <div key={i} style={{ padding: '24px', background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{metric.icon}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>{metric.label}</div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: metric.color, marginBottom: '4px' }}>{metric.value}</div>
                  <div style={{ fontSize: '13px', color: metric.change.startsWith('+') ? '#10B981' : '#EF4444', fontWeight: '700' }}>
                    {metric.change} vs mois dernier
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Payments */}
            <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', padding: '32px', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '24px' }}>💳 Paiements Récents</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {companies.filter(c => c.status === 'active').slice(0, 5).map((company, i) => (
                  <div key={i} style={{ padding: '20px', background: '#0F172A', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>{company.name}</div>
                      <div style={{ fontSize: '13px', color: '#9CA3AF' }}>{company.paymentMethod} • Prochain paiement: {company.nextBilling}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: '#10B981' }}>{company.mrr}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>{company.plan}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MARKETING TAB */}
        {selectedTab === 'marketing' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '32px' }}>Marketing & Campagnes</h2>

            {/* Campaigns */}
            <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', padding: '32px', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'white' }}>📣 Campagnes Marketing</h3>
                <button
                  onClick={() => alert('➕ Nouvelle campagne')}
                  style={{ padding: '12px 24px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                  ➕ Nouvelle Campagne
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {marketingCampaigns.map((campaign) => (
                  <div key={campaign.id} style={{ padding: '24px', background: '#0F172A', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div>
                        <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {campaign.name}
                          <span style={{
                            padding: '4px 12px',
                            background: campaign.status === 'active' ? '#10B981' : '#F59E0B',
                            color: 'white',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}>
                            {campaign.status === 'active' ? '🟢 Active' : '📅 Planifiée'}
                          </span>
                        </h4>
                        <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
                          {campaign.type} • Du {campaign.startDate} au {campaign.endDate}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '24px', fontWeight: '900', color: '#10B981', marginBottom: '4px' }}>ROI: {campaign.roi}</div>
                        <div style={{ fontSize: '13px', color: '#6B7280' }}>{campaign.conversions} conversions</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                      {[
                        { label: 'Budget', value: campaign.budget },
                        { label: 'Dépensé', value: campaign.spent },
                        { label: 'Leads', value: campaign.leads },
                        { label: 'Conversions', value: campaign.conversions }
                      ].map((stat, i) => (
                        <div key={i} style={{ padding: '12px', background: '#1E293B', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>{stat.label}</div>
                          <div style={{ fontSize: '18px', fontWeight: '800', color: '#667EEA' }}>{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo Codes */}
            <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', padding: '32px', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'white' }}>🎟️ Codes Promo</h3>
                <button
                  onClick={() => alert('➕ Nouveau code promo')}
                  style={{ padding: '12px 24px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                  ➕ Créer Code
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {promoCodes.map((promo) => (
                  <div key={promo.id} style={{ padding: '20px', background: '#0F172A', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: '#667EEA', fontFamily: 'monospace', marginBottom: '8px' }}>
                        {promo.code}
                      </div>
                      <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
                        {promo.discount} • Utilisé {promo.uses}/{promo.limit} fois • Expire: {promo.expires}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: '#10B981' }}>{promo.revenue}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>Revenue généré</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUPPORT TAB */}
        {selectedTab === 'support' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '32px' }}>Support & Tickets</h2>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
              {[
                { label: 'Tickets Ouverts', value: supportTickets.filter(t => t.status === 'open').length, icon: '🎫', color: '#EF4444' },
                { label: 'En Cours', value: supportTickets.filter(t => t.status === 'in_progress').length, icon: '⚙️', color: '#F59E0B' },
                { label: 'Résolus', value: supportTickets.filter(t => t.status === 'resolved').length, icon: '✅', color: '#10B981' },
                { label: 'Temps Réponse Moy.', value: '2h 15m', icon: '⏱️', color: '#667EEA' }
              ].map((stat, i) => (
                <div key={i} style={{ padding: '24px', background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>{stat.label}</div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Tickets List */}
            <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', padding: '32px', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '24px' }}>🎧 Tickets Récents</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {supportTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    style={{
                      padding: '24px',
                      background: '#0F172A',
                      borderRadius: '12px',
                      borderLeft: `4px solid ${ticket.priority === 'high' ? '#EF4444' : ticket.priority === 'medium' ? '#F59E0B' : '#6B7280'}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1E293B'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#0F172A'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div>
                        <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
                          #{ticket.id} - {ticket.subject}
                        </h4>
                        <div style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '8px' }}>
                          🏢 {ticket.company} • Assigné à: {ticket.assignedTo}
                        </div>
                        <div style={{ fontSize: '13px', color: '#6B7280' }}>
                          Créé: {ticket.created} • Mis à jour: {ticket.updated}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                        <span style={{
                          padding: '6px 12px',
                          background: ticket.priority === 'high' ? '#EF4444' : ticket.priority === 'medium' ? '#F59E0B' : '#6B7280',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700'
                        }}>
                          {ticket.priority === 'high' ? '🔴 Urgent' : ticket.priority === 'medium' ? '🟡 Moyen' : '⚪ Bas'}
                        </span>
                        <span style={{
                          padding: '6px 12px',
                          background: ticket.status === 'open' ? '#EF444420' : ticket.status === 'in_progress' ? '#F59E0B20' : '#10B98120',
                          color: ticket.status === 'open' ? '#EF4444' : ticket.status === 'in_progress' ? '#F59E0B' : '#10B981',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700'
                        }}>
                          {ticket.status === 'open' ? 'Ouvert' : ticket.status === 'in_progress' ? 'En cours' : 'Résolu'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SYSTEM TAB */}
        {selectedTab === 'system' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '32px' }}>Configuration Système</h2>

            {/* System Status */}
            <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', padding: '32px', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '24px' }}>🖥️ État du Système</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {systemStatus.map((item, i) => (
                  <div key={i} style={{ padding: '20px', background: '#0F172A', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '32px' }}>{item.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: '600', marginBottom: '4px' }}>{item.metric}</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: item.status === 'good' ? '#10B981' : '#F59E0B' }}>{item.value}</div>
                      </div>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: item.status === 'good' ? '#10B981' : '#F59E0B',
                        boxShadow: `0 0 16px ${item.status === 'good' ? '#10B981' : '#F59E0B'}`
                      }}></div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Cible: {item.target}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
              {/* Logs */}
              <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', padding: '32px', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '20px' }}>📋 Logs Système</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { time: '17/02/2026 14:23', level: 'INFO', message: 'Nouvelle entreprise créée: StartupLab', icon: '✅' },
                    { time: '17/02/2026 11:45', level: 'SUCCESS', message: 'Backup base de données réussi', icon: '💾' },
                    { time: '17/02/2026 09:12', level: 'WARNING', message: 'Utilisation mémoire à 78%', icon: '⚠️' },
                    { time: '16/02/2026 18:30', level: 'INFO', message: 'Mise à jour système déployée v2.4.1', icon: '🚀' },
                    { time: '16/02/2026 15:20', level: 'ERROR', message: 'Échec paiement TempCompany', icon: '❌' }
                  ].map((log, i) => (
                    <div key={i} style={{ padding: '12px', background: '#0F172A', borderRadius: '8px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span>{log.icon}</span>
                        <span style={{ color: '#6B7280' }}>{log.time}</span>
                        <span style={{
                          padding: '2px 8px',
                          background: log.level === 'SUCCESS' ? '#10B981' : log.level === 'WARNING' ? '#F59E0B' : log.level === 'ERROR' ? '#EF4444' : '#667EEA',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          {log.level}
                        </span>
                      </div>
                      <div style={{ color: '#9CA3AF', paddingLeft: '32px' }}>{log.message}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuration */}
              <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', padding: '32px', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '20px' }}>⚙️ Configuration Plateforme</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { label: 'Mode Maintenance', value: 'OFF', type: 'toggle', icon: '🔧' },
                    { label: 'Nouvelles inscriptions', value: 'ON', type: 'toggle', icon: '✅' },
                    { label: 'Backup automatique', value: 'Quotidien 3h', type: 'text', icon: '💾' },
                    { label: 'Région serveur', value: 'EU-West-1 (Paris)', type: 'text', icon: '🌍' },
                    { label: 'Niveau logs', value: 'INFO', type: 'text', icon: '📊' },
                    { label: 'Email notifications', value: 'ON', type: 'toggle', icon: '📧' }
                  ].map((config, i) => (
                    <div key={i} style={{ padding: '16px', background: '#0F172A', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>{config.icon}</span>
                        <span style={{ color: '#9CA3AF', fontSize: '14px', fontWeight: '600' }}>{config.label}</span>
                      </div>
                      <span style={{
                        color: config.value === 'ON' ? '#10B981' : config.value === 'OFF' ? '#EF4444' : 'white',
                        fontSize: '14px',
                        fontWeight: '700'
                      }}>
                        {config.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SuperAdminPage;
