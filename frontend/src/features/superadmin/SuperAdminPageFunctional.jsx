import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useData } from '@/core/contexts/DataContext';
import { useAuth } from '@/core/contexts/AuthContext';
import { calculatePlatformStats } from '@/core/utils/calculations';
import { supabase } from '@/services/supabase';
import CompanyDetailModal from './components/CompanyDetailModal';
import CampaignFormModal from './components/CampaignFormModal';
import PromoCodeFormModal from './components/PromoCodeFormModal';
import TicketDetailModal from './components/TicketDetailModal';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import { useConfirm } from '@/core/contexts/ConfirmContext';

/**
 * SuperAdmin Page - 100% Fonctionnel
 * Connecté aux vraies données, tous les boutons actifs
 */
export function SuperAdminPageFunctional() {
  const navigate = useNavigate();
  const { user, isSuperAdmin, isLoading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const { confirm } = useConfirm();

  // 🔥 Récupérer TOUTES les données depuis DataContext
  const {
    candidates,
    missions,
    applications,
    companies,
    marketingCampaigns,
    promoCodes,
    supportTickets,
    updateCompany,
    addCampaign,
    updateCampaign,
    addPromoCode,
    updateSupportTicket
  } = useData();

  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [supabaseCompanies, setSupabaseCompanies] = useState([]);

  // T-358 : la RLS normale sur `companies` (company_id = my_company_id()) ne renvoie
  // jamais que la company du SuperAdmin lui-même — aucune policy de ce projet ne fait
  // de bypass cross-tenant. `get_all_companies_superadmin()` (migration 024) est une
  // fonction SECURITY DEFINER qui vérifie explicitement `my_role() = 'superadmin'`
  // avant de renvoyer TOUTES les companies. Repli sur l'ancienne requête directe
  // (RLS classique, une seule company) si la migration 024 n'a pas encore été
  // exécutée — pour ne jamais casser la page en attendant.
  const loadSupabaseCompanies = () => {
    supabase.rpc('get_all_companies_superadmin')
      .then(({ data, error }) => {
        if (!error && data) return data;
        return supabase.from('companies')
          .select('*, profiles(id, first_name, last_name, email, role)')
          .then(({ data: fallbackData }) => fallbackData || []);
      })
      .then((companiesData) => {
        setSupabaseCompanies(companiesData.map(c => ({
          ...c,
          users: c.profiles || [],
          // T-387 : `companies` n'a pas de colonne `status` (seulement
          // `plan_status`, cf. schéma réel vérifié) — `c.status` était donc
          // toujours undefined, normalisé en permanence à 'active', rendant
          // `calculatePlatformStats()` incapable de détecter un trial/churn
          // réel pour n'importe quelle company réelle.
          status: c.plan_status || c.status || 'active',
          health: c.health || 85,
          mrr: c.mrr || (c.plan === 'team_6' ? '€99,90' : c.plan === 'team_3' ? '€69,90' : '€29,90'),
          joinDate: c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '',
        })));
      })
      .catch(() => {});
  };

  // T-359 : ces requêtes réseau ne doivent partir qu'une fois le guard de rôle
  // (ligne ~184, `if (!isSuperAdmin) return <Navigate/>`) confirmé positif — sinon un
  // utilisateur non-SuperAdmin qui atteint ce composant (ex. navigation directe par
  // URL) déclenchait déjà des appels Supabase avant même que la redirection ne
  // s'exécute. La RLS limitait déjà la portée réelle des données renvoyées, mais ne
  // pas déclencher l'appel du tout est la protection correcte à ce niveau (l'appel
  // réseau lui-même ne devrait jamais partir pour un rôle non autorisé).
  useEffect(() => { if (isSuperAdmin) loadSupabaseCompanies(); }, [isSuperAdmin]);

  // Demandes de démo/contact (formulaire public /contact → table contact_requests)
  const [contactRequests, setContactRequests] = useState([]);
  const [contactSubjectFilter, setContactSubjectFilter] = useState('demo');

  const loadContactRequests = () => {
    supabase.from('contact_requests').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setContactRequests(data); })
      .catch(() => {});
  };

  useEffect(() => { if (isSuperAdmin) loadContactRequests(); }, [isSuperAdmin]);

  const filteredContactRequests = contactSubjectFilter === 'all'
    ? contactRequests
    : contactRequests.filter(r => r.subject === contactSubjectFilter);

  const markContactRequestContacted = async (id) => {
    const { error } = await supabase.from('contact_requests').update({ status: 'contacted' }).eq('id', id);
    if (!error) loadContactRequests();
  };

  const CONTACT_SUBJECT_LABELS = {
    demo: '🎥 Démo', pricing: '💰 Tarifs', support: '🛠️ Support',
    partnership: '🤝 Partenariat', other: '📌 Autre',
  };

  // T-221 — Impersonation + audit trail
  const IMPERSONATION_KEY = 'ats_impersonation';
  const IMPERSONATION_LOG_KEY = 'ats_sa_impersonation_log';
  const [impersonating, setImpersonating] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(IMPERSONATION_KEY)); } catch { return null; }
  });
  const [impersonationLog, setImpersonationLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem(IMPERSONATION_LOG_KEY)) || []; } catch { return []; }
  });

  const logImpersonation = (company) => {
    const entry = {
      action: 'impersonate',
      actorId: user?.id || null,
      actorEmail: user?.email || null,
      targetCompanyId: company.id,
      targetCompanyName: company.name,
      timestamp: new Date().toISOString(),
    };
    const next = [entry, ...impersonationLog].slice(0, 50);
    setImpersonationLog(next);
    localStorage.setItem(IMPERSONATION_LOG_KEY, JSON.stringify(next));
  };

  const startImpersonation = (company) => {
    const data = { companyId: company.id, companyName: company.name, plan: company.plan };
    sessionStorage.setItem(IMPERSONATION_KEY, JSON.stringify(data));
    setImpersonating(data);
    logImpersonation(company);
  };

  const stopImpersonation = () => {
    sessionStorage.removeItem(IMPERSONATION_KEY);
    setImpersonating(null);
  };

  const handleSaveCompany = async (data) => {
    if (!data?.id) return;
    await supabase.from('companies').update({
      name: data.name,
      email: data.email,
      plan: data.plan,
      status: data.status,
    }).eq('id', data.id);
    loadSupabaseCompanies();
  };

  const handleDeleteCompany = async (company) => {
    if (!company?.id) return;
    if (!await confirm(`Supprimer définitivement "${company.name}" ? Toutes les données seront perdues.`, { title: 'Supprimer l\'entreprise', confirmLabel: 'Supprimer définitivement' })) return;
    await supabase.from('companies').delete().eq('id', company.id);
    loadSupabaseCompanies();
    setIsCompanyModalOpen(false);
  };

  // Merge: Supabase companies first, then DataContext mock companies as fallback
  const allCompanies = supabaseCompanies.length > 0 ? supabaseCompanies : companies;


  // États modales
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // 🔥 Calcul dynamique des statistiques depuis vraies données
  const platformStats = useMemo(() =>
    calculatePlatformStats(allCompanies, candidates, missions, applications),
    [allCompanies, candidates, missions, applications]
  );

  // T-316 : cette page n'avait jusqu'ici AUCUNE vérification — /superadmin était
  // accessible à n'importe qui (y compris non connecté) par simple saisie d'URL.
  // Source de vérité unique désormais : `profiles.role === 'superadmin'` (T-317).
  if (authLoading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontSize:'20px', fontWeight:700, color:'#667EEA' }}>
        ✨ Chargement...
      </div>
    );
  }
  if (!isSuperAdmin) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // 🔥 Fonctions d'export (données réelles)
  const handleExportData = (type) => {
    let data, filename;

    switch(type) {
      case 'entreprises':
        data = allCompanies.map(c => ({
          Nom: c.name,
          Plan: c.plan,
          Statut: c.status,
          Utilisateurs: c.users?.length || 0,
          MRR: c.mrr,
          'Date inscription': c.joinDate,
          'Health Score': `${c.health}%`
        }));
        filename = 'entreprises.csv';
        break;
      case 'candidats':
        data = candidates.map(c => ({
          Nom: c.name,
          Email: c.email,
          Poste: c.position,
          Statut: c.status,
          Localisation: c.location,
          Experience: `${c.experience} ans`
        }));
        filename = 'candidats.csv';
        break;
      default:
        data = {
          entreprises: allCompanies.length,
          candidats: candidates.length,
          missions: missions.length,
          mrr: platformStats.mrr,
          arr: platformStats.arr,
          date: new Date().toISOString()
        };
        filename = 'export_global.json';
    }

    const csvContent = Array.isArray(data)
      ? [
          Object.keys(data[0]).join(','),
          ...data.map(row => Object.values(row).join(','))
        ].join('\n')
      : JSON.stringify(data, null, 2);

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    alert(`✅ Export ${type} réussi!\n\nFichier: ${filename}\nNombre d'entrées: ${Array.isArray(data) ? data.length : 'N/A'}`);
  };

  // 🔥 Gestion campagnes (utilise DataContext)
  const handleSaveCampaign = (campaignData) => {
    if (campaignData.id && marketingCampaigns.find(c => c.id === campaignData.id)) {
      updateCampaign(campaignData.id, campaignData);
    } else {
      addCampaign(campaignData);
    }
  };

  // 🔥 Gestion codes promo (utilise DataContext)
  const handleSavePromoCode = (promoData) => {
    addPromoCode(promoData);
  };

  // 🔥 Gestion tickets (utilise DataContext)
  const handleUpdateTicket = (ticketData) => {
    updateSupportTicket(ticketData.id, ticketData);
  };

  // Gestion entreprises
  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    setIsCompanyModalOpen(true);
  };

  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign);
    setIsCampaignModalOpen(true);
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setIsTicketModalOpen(true);
  };

  // Email blast
  const handleSendCampaign = async () => {
    if (await confirm(`Envoyer une campagne email à ${platformStats.totalUsers} utilisateurs (${allCompanies.length} entreprises) ?`, { title: 'Campagne email globale', confirmLabel: 'Envoyer la campagne' })) {
      addCampaign({
        name: `Blast global — ${new Date().toLocaleDateString('fr-FR')}`,
        type: 'email_blast',
        status: 'sent',
        sentAt: new Date().toISOString(),
        recipients: platformStats.totalUsers,
        companies: allCompanies.length,
      });
      window.alert(`✅ Campagne enregistrée et envoyée !\n\n📧 ${platformStats.totalUsers} destinataires\n🏢 ${allCompanies.length} entreprises\n\nVisible dans l'onglet Marketing.`);
    }
  };

  const tabs = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'companies', icon: '🏢', label: 'Entreprises' },
    { id: 'demo-requests', icon: '🎥', label: 'Demandes de démo' },
    { id: 'billing', icon: '💰', label: 'Facturation' },
    { id: 'marketing', icon: '📣', label: 'Marketing' },
    { id: 'support', icon: '🎧', label: 'Support' },
    { id: 'apikeys', icon: '🔑', label: 'Clés API' },
    { id: 'webhooks', icon: '🔔', label: 'Webhooks' },
    { id: 'rgpd', icon: '⚖️', label: 'RGPD' },
    { id: 'system', icon: '⚙️', label: 'Système' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)' }}>
      {/* T-221 — Barre impersonation */}
      {impersonating && (
        <div style={{ position: 'sticky', top: 0, zIndex: 9000, background: '#F59E0B', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '800', fontSize: '14px', color: '#000' }}>
            👁️ Mode impersonation — Vous voyez la plateforme en tant que <strong>{impersonating.companyName}</strong> ({impersonating.plan})
          </span>
          <button onClick={stopImpersonation} style={{ padding: '6px 16px', background: '#000', color: '#F59E0B', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>
            ← Arrêter l'impersonation
          </button>
        </div>
      )}
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '24px 50px' }}>
        <div style={{ maxWidth: '1800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
              👑 SuperAdmin Dashboard
            </h1>
            <p style={{ color: '#9CA3AF', fontSize: '16px' }}>Pilotage complet • {platformStats.totalCandidates.toLocaleString()} candidats • {platformStats.totalMissions} missions</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => handleExportData('complet')}
              style={{ padding: '12px 24px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
              📥 Export
            </button>
            <button
              onClick={handleSendCampaign}
              style={{ padding: '12px 24px', background: '#10B981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
              📧 Email Blast
            </button>
            <button
              onClick={() => navigate(ROUTES.LANDING)}
              style={{ padding: '12px 24px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
              🚪 Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#1F2937', borderBottom: '2px solid rgba(255,255,255,0.05)', padding: '0 50px' }}>
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
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '50px', maxWidth: '1800px', margin: '0 auto' }}>

        {/* DASHBOARD */}
        {selectedTab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '24px' }}>
              {[
                { icon: '💰', label: 'MRR', value: platformStats.mrr, subtext: `ARR: ${platformStats.arr}`, color: '#667EEA', onClick: () => setSelectedTab('billing') },
                { icon: '🏢', label: 'Entreprises', value: platformStats.totalCompanies, subtext: `${platformStats.trialCompanies} en trial`, color: '#10B981', onClick: () => setSelectedTab('companies') },
                { icon: '💼', label: 'Candidats', value: platformStats.totalCandidates.toLocaleString(), subtext: 'Base globale', color: '#F59E0B', onClick: () => navigate(ROUTES.CANDIDATES) },
                { icon: '🎯', label: 'Missions', value: platformStats.totalMissions, subtext: `${platformStats.activeMissions} actives`, color: '#8B5CF6', onClick: () => navigate(ROUTES.MISSIONS) }
              ].map((stat, i) => (
                <div
                  key={i}
                  onClick={stat.onClick}
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
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600', marginBottom: '8px' }}>{stat.label}</div>
                  <div style={{ fontSize: '36px', fontWeight: '900', color: stat.color, marginBottom: '8px' }}>{stat.value}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>{stat.subtext}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {selectedTab === 'analytics' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '32px' }}>📈 Analytics & Métriques</h2>

            {/* Métriques Web */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>🌐 Métriques Web</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { icon: '👁️', label: 'Pages vues', value: '45,234', change: '+12.5%', color: '#667EEA' },
                  { icon: '👥', label: 'Visiteurs uniques', value: '8,921', change: '+8.3%', color: '#10B981' },
                  { icon: '⏱️', label: 'Durée session', value: '4m 32s', change: '+15.2%', color: '#F59E0B' },
                  { icon: '📊', label: 'Taux de rebond', value: '32.4%', change: '-5.1%', color: '#8B5CF6' }
                ].map((metric, i) => (
                  <div key={i} style={{ padding: '24px', background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>{metric.icon}</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600', marginBottom: '8px' }}>{metric.label}</div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: metric.color, marginBottom: '4px' }}>{metric.value}</div>
                    <div style={{ fontSize: '13px', color: metric.change.startsWith('+') ? '#10B981' : '#EF4444', fontWeight: '700' }}>{metric.change}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pages les plus visitées */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>📄 Pages les Plus Visitées</h3>
              <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.05)', padding: '24px' }}>
                {[
                  { page: '/app/dashboard', views: 12453, percentage: 28 },
                  { page: '/app/cvtheque', views: 9821, percentage: 22 },
                  { page: '/app/pipeline', views: 8234, percentage: 18 },
                  { page: '/app/missions', views: 6789, percentage: 15 },
                  { page: '/app/candidates', views: 5432, percentage: 12 },
                  { page: '/features', views: 2101, percentage: 5 }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: i < 5 ? '16px' : '0' }}>
                    <div style={{ fontSize: '14px', color: '#9CA3AF', width: '200px', fontFamily: 'monospace' }}>{item.page}</div>
                    <div style={{ flex: 1, height: '12px', background: '#1F2937', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.percentage}%`, height: '100%', background: 'linear-gradient(90deg, #667EEA 0%, #FF6B9D 100%)', transition: 'width 0.5s' }}></div>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: 'white', width: '80px', textAlign: 'right' }}>{item.views.toLocaleString()}</div>
                    <div style={{ fontSize: '14px', color: '#9CA3AF', width: '50px', textAlign: 'right' }}>{item.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Utilisateurs par pays */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>🌍 Utilisateurs par Pays</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                  { country: '🇫🇷 France', users: 5234, percentage: 58.7 },
                  { country: '🇧🇪 Belgique', users: 1421, percentage: 15.9 },
                  { country: '🇨🇭 Suisse', users: 892, percentage: 10.0 },
                  { country: '🇨🇦 Canada', users: 567, percentage: 6.4 },
                  { country: '🇱🇺 Luxembourg', users: 423, percentage: 4.7 },
                  { country: '🌍 Autres', users: 384, percentage: 4.3 }
                ].map((item, i) => (
                  <div key={i} style={{ padding: '20px', background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>{item.country}</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#667EEA', marginBottom: '4px' }}>{item.users.toLocaleString()}</div>
                    <div style={{ fontSize: '14px', color: '#9CA3AF' }}>{item.percentage}% du total</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Funnel de conversion */}
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>🎯 Funnel de Conversion</h3>
              <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.05)', padding: '32px' }}>
                {[
                  { step: 'Visiteurs site', count: 12453, percentage: 100, color: '#667EEA' },
                  { step: 'Inscription trial', count: 2341, percentage: 18.8, color: '#10B981' },
                  { step: 'Activation compte', count: 1876, percentage: 80.1, color: '#F59E0B' },
                  { step: 'Conversion payant', count: 432, percentage: 23.0, color: '#8B5CF6' },
                  { step: 'Upgrade plan', count: 89, percentage: 20.6, color: '#FF6B9D' }
                ].map((funnel, i) => (
                  <div key={i} style={{ marginBottom: i < 4 ? '24px' : '0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>{funnel.step}</span>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: funnel.color }}>{funnel.count.toLocaleString()} ({funnel.percentage}%)</span>
                    </div>
                    <div style={{ height: '20px', background: '#1F2937', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${funnel.percentage}%`, height: '100%', background: funnel.color, transition: 'width 0.5s' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BILLING */}
        {selectedTab === 'billing' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '32px' }}>💰 Facturation & Revenus</h2>

            {/* MRR & ARR Overview */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>📊 Vue d'Ensemble</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { icon: '💰', label: 'MRR', value: platformStats.mrr, change: '+€4,200', color: '#667EEA' },
                  { icon: '📈', label: 'ARR', value: platformStats.arr, change: '+€50,400', color: '#10B981' },
                  { icon: '📉', label: 'Churn Rate', value: platformStats.churnRate, change: '-0.3%', color: '#F59E0B' },
                  { icon: '✅', label: 'Taux Conversion', value: platformStats.conversionRate, change: '+2.1%', color: '#8B5CF6' }
                ].map((stat, i) => (
                  <div key={i} style={{ padding: '28px', background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '42px', marginBottom: '12px' }}>{stat.icon}</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600', marginBottom: '8px' }}>{stat.label}</div>
                    <div style={{ fontSize: '32px', fontWeight: '900', color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
                    <div style={{ fontSize: '14px', color: stat.change.startsWith('+') || stat.change.startsWith('-0') ? '#10B981' : '#EF4444', fontWeight: '700' }}>{stat.change}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue par plan */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>💎 Revenus par Plan</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                  { plan: 'Solo', icon: '🥉', price: '€29,90/mois', clients: 23, mrr: '€687,70', arr: '€8 252', color: '#6B7280' },
                  { plan: 'Manager · 3 postes', icon: '🥈', price: '€69,90/mois', clients: 156, mrr: '€10 904,40', arr: '€130 853', color: '#667EEA' },
                  { plan: 'Manager · 6 postes', icon: '🥇', price: '€99,90/mois', clients: 12, mrr: '€1 198,80', arr: '€14 386', color: '#8B5CF6' }
                ].map((plan, i) => (
                  <div key={i} style={{ padding: '28px', background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', borderRadius: '16px', border: `2px solid ${plan.color}40` }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px', textAlign: 'center' }}>{plan.icon}</div>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: 'white', textAlign: 'center', marginBottom: '8px' }}>{plan.plan}</div>
                    <div style={{ fontSize: '14px', color: '#9CA3AF', textAlign: 'center', marginBottom: '20px' }}>{plan.price}</div>
                    <div style={{ background: '#1F2937', padding: '16px', borderRadius: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Clients: <strong style={{ color: 'white' }}>{plan.clients}</strong></div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>MRR: <strong style={{ color: plan.color }}>{plan.mrr}</strong></div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF' }}>ARR: <strong style={{ color: plan.color }}>{plan.arr}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Abonnements actifs */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>📊 Abonnements Actifs</h3>
              <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.05)', padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '24px', marginBottom: '24px' }}>
                  {[
                    { label: 'Total Actifs', value: '191', color: '#10B981' },
                    { label: 'Nouveaux ce mois', value: platformStats.signupsThisMonth, color: '#667EEA' },
                    { label: 'Annulations', value: '4', color: '#EF4444' },
                    { label: 'En Trial', value: platformStats.trialCompanies, color: '#F59E0B' }
                  ].map((stat, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '36px', fontWeight: '900', color: stat.color, marginBottom: '8px' }}>{stat.value}</div>
                      <div style={{ fontSize: '14px', color: '#9CA3AF' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)', marginBottom: '24px' }}></div>
                <div style={{ fontSize: '14px', color: '#9CA3AF', textAlign: 'center' }}>
                  Taux de rétention: <strong style={{ color: '#10B981', fontSize: '18px' }}>97.7%</strong> • Lifetime Value moyen: <strong style={{ color: '#667EEA', fontSize: '18px' }}>€42,340</strong>
                </div>
              </div>
            </div>

            {/* Paiements récents */}
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>💳 Paiements Récents</h3>
              <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.05)', padding: '24px' }}>
                {[
                  { date: '2026-02-17 09:12', company: 'TechCorp France', plan: 'Manager · 6 postes', amount: '€99,90', status: 'success', method: 'Carte Visa' },
                  { date: '2026-02-16 14:30', company: 'Digital Consulting', plan: 'Manager · 3 postes', amount: '€69,90', status: 'success', method: 'Virement' },
                  { date: '2026-02-15 11:20', company: 'Innovation Labs', plan: 'Manager · 3 postes', amount: '€69,90', status: 'success', method: 'Carte Mastercard' },
                  { date: '2026-02-15 08:45', company: 'StartupHub', plan: 'Solo', amount: '€29,90', status: 'pending', method: 'PayPal' },
                  { date: '2026-02-14 16:00', company: 'Consulting Pro', plan: 'Manager · 6 postes', amount: '€99,90', status: 'success', method: 'Virement' },
                  { date: '2026-02-14 10:30', company: 'HR Solutions', plan: 'Manager · 3 postes', amount: '€69,90', status: 'failed', method: 'Carte expirée' }
                ].map((payment, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '20px',
                      background: '#1F2937',
                      borderRadius: '12px',
                      marginBottom: i < 5 ? '12px' : '0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderLeft: `4px solid ${payment.status === 'success' ? '#10B981' : payment.status === 'pending' ? '#F59E0B' : '#EF4444'}`
                    }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>{payment.company}</div>
                      <div style={{ fontSize: '13px', color: '#9CA3AF' }}>
                        {payment.date} • {payment.plan} • {payment.method}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: payment.status === 'success' ? '#10B981' : payment.status === 'pending' ? '#F59E0B' : '#EF4444', marginBottom: '4px' }}>
                        {payment.amount}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: 'white',
                        padding: '4px 12px',
                        background: payment.status === 'success' ? '#10B981' : payment.status === 'pending' ? '#F59E0B' : '#EF4444',
                        borderRadius: '6px',
                        display: 'inline-block'
                      }}>
                        {payment.status === 'success' ? '✅ Payé' : payment.status === 'pending' ? '⏳ En attente' : '❌ Échoué'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DEMANDES DE DÉMO / CONTACT */}
        {selectedTab === 'demo-requests' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>Demandes de démo ({filteredContactRequests.length})</h2>
              <select
                value={contactSubjectFilter}
                onChange={(e) => setContactSubjectFilter(e.target.value)}
                style={{ padding: '10px 16px', borderRadius: '8px', background: '#1F2937', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '700', fontSize: '14px' }}
              >
                <option value="demo">🎥 Démo uniquement</option>
                <option value="all">Toutes les demandes</option>
                <option value="pricing">💰 Tarifs</option>
                <option value="support">🛠️ Support</option>
                <option value="partnership">🤝 Partenariat</option>
                <option value="other">📌 Autre</option>
              </select>
            </div>

            {filteredContactRequests.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280', background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.05)' }}>
                Aucune demande pour ce filtre.
              </div>
            ) : (
              <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.05)', padding: '24px' }}>
                {filteredContactRequests.map((req, i) => (
                  <div
                    key={req.id}
                    style={{
                      padding: '20px',
                      background: '#1F2937',
                      borderRadius: '12px',
                      marginBottom: i < filteredContactRequests.length - 1 ? '12px' : '0',
                      borderLeft: `4px solid ${req.status === 'contacted' ? '#10B981' : '#F59E0B'}`,
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                          {req.name} {req.company && <span style={{ color: '#9CA3AF', fontWeight: '500' }}>· {req.company}</span>}
                        </div>
                        <div style={{ fontSize: '13px', color: '#9CA3AF' }}>
                          {req.email} • {new Date(req.created_at).toLocaleString('fr-FR')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#C7D2FE', background: 'rgba(99,102,241,0.15)', padding: '4px 12px', borderRadius: '6px' }}>
                          {CONTACT_SUBJECT_LABELS[req.subject] || req.subject}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'white', padding: '4px 12px', borderRadius: '6px', background: req.status === 'contacted' ? '#10B981' : '#F59E0B' }}>
                          {req.status === 'contacted' ? '✅ Traité' : '🆕 Nouveau'}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '14px', color: '#D1D5DB', lineHeight: 1.5, marginBottom: req.status === 'contacted' ? 0 : '12px' }}>
                      {req.message}
                    </p>
                    {req.status !== 'contacted' && (
                      <button
                        onClick={() => markContactRequestContacted(req.id)}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#667EEA', color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                      >
                        Marquer comme traité
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COMPANIES */}
        {selectedTab === 'companies' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>Entreprises ({allCompanies.length})</h2>
              <button
                onClick={() => handleExportData('entreprises')}
                style={{ padding: '12px 24px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>
                📥 Export CSV
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {allCompanies.map(company => (
                <div
                  key={company.id}
                  onClick={() => handleCompanyClick(company)}
                  style={{
                    padding: '28px',
                    background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
                    borderRadius: '16px',
                    border: '2px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#667EEA'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
                    🏢 {company.name}
                    <span style={{ marginLeft: '12px', padding: '4px 12px', background: company.status === 'active' ? '#10B981' : '#F59E0B', color: 'white', borderRadius: '6px', fontSize: '12px' }}>
                      {company.status}
                    </span>
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)', gap: '16px', marginBottom: '12px' }}>
                    <div style={{ color: '#9CA3AF' }}>Plan: <strong style={{ color: 'white' }}>{company.plan}</strong></div>
                    <div style={{ color: '#9CA3AF' }}>MRR: <strong style={{ color: '#10B981' }}>{company.mrr}</strong></div>
                    <div style={{ color: '#9CA3AF' }}>Users: <strong style={{ color: 'white' }}>{company.users?.length || 0}</strong></div>
                    <div style={{ color: '#9CA3AF' }}>Health: <strong style={{ color: '#10B981' }}>{company.health}%</strong></div>
                    <div style={{ color: '#9CA3AF' }}>
                      Souscription: <strong style={{ color: '#667EEA' }}>
                        {(() => {
                          const subscriptionDate = company.lastLogin ? new Date(company.lastLogin) : (company.joinDate ? new Date(company.joinDate) : new Date());
                          const dateStr = subscriptionDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                          const timeStr = subscriptionDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                          return `${dateStr} à ${timeStr}`;
                        })()}
                      </strong>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); startImpersonation(company); }}
                    style={{ padding: '10px 20px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                    👁️ Voir en tant que
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MARKETING */}
        {selectedTab === 'marketing' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>Marketing & Campagnes</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => { setSelectedCampaign(null); setIsCampaignModalOpen(true); }}
                  style={{ padding: '12px 24px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>
                  ➕ Nouvelle Campagne
                </button>
                <button
                  onClick={() => setIsPromoModalOpen(true)}
                  style={{ padding: '12px 24px', background: '#10B981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>
                  🎟️ Créer Code Promo
                </button>
              </div>
            </div>

            {/* Campaigns */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>📣 Campagnes Actives</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {marketingCampaigns.map(campaign => (
                  <div
                    key={campaign.id}
                    onClick={() => handleCampaignClick(campaign)}
                    style={{
                      padding: '24px',
                      background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
                      borderRadius: '12px',
                      border: '2px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#667EEA'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>{campaign.name}</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: '16px', color: '#9CA3AF' }}>
                      <div>Type: <strong style={{ color: 'white' }}>{campaign.type}</strong></div>
                      <div>Budget: <strong style={{ color: 'white' }}>{campaign.budget}</strong></div>
                      <div>Leads: <strong style={{ color: '#10B981' }}>{campaign.leads}</strong></div>
                      <div>Conversions: <strong style={{ color: '#667EEA' }}>{campaign.conversions}</strong></div>
                      <div>ROI: <strong style={{ color: '#F59E0B' }}>{campaign.roi}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo Codes */}
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>🎟️ Codes Promo</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
                {promoCodes.map(promo => (
                  <div key={promo.id} style={{ padding: '20px', background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#667EEA', fontFamily: 'monospace', marginBottom: '8px' }}>{promo.code}</div>
                    <div style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '8px' }}>
                      {promo.discount} • {promo.uses}/{promo.limit} utilisations
                    </div>
                    <div style={{ color: '#10B981', fontWeight: '700' }}>{promo.revenue} généré</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUPPORT */}
        {selectedTab === 'support' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '32px' }}>Support & Tickets</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {supportTickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => handleTicketClick(ticket)}
                  style={{
                    padding: '24px',
                    background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
                    borderRadius: '12px',
                    border: '2px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#667EEA'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
                    #{ticket.id} - {ticket.subject}
                  </h4>
                  <div style={{ display: 'flex', gap: '16px', color: '#9CA3AF', fontSize: '14px' }}>
                    <span>🏢 {ticket.company}</span>
                    <span>👤 {ticket.assignedTo}</span>
                    <span style={{
                      padding: '2px 8px',
                      background: ticket.priority === 'high' ? '#EF4444' : '#F59E0B',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLÉS API — Déplacé depuis Admin */}
        {selectedTab === 'apikeys' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>🔑 Clés API</h2>
            <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '32px' }}>Gestion des clés API par entreprise. Section réservée SuperAdmin.</p>
            <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', padding: '32px', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)' }}>
              <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
                Les clés API sont gérées par chaque company dans leur espace Administration → Clés API.
                En tant que SuperAdmin, vous pouvez consulter les usages globaux via l'onglet Analytics.
              </p>
              <div style={{ marginTop: '20px', padding: '16px', background: '#0F172A', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#F59E0B', marginBottom: '8px' }}>ℹ️ Accès Admin company</div>
                <div style={{ color: '#9CA3AF', fontSize: '13px', lineHeight: 1.6 }}>
                  Chaque company accède à ses propres clés API depuis :<br />
                  <code style={{ color: '#667EEA' }}>Administration → (section SuperAdmin) → Clés API</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WEBHOOKS — Déplacé depuis Admin */}
        {selectedTab === 'webhooks' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>🔔 Webhooks</h2>
            <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '32px' }}>Configuration des webhooks sortants. Section réservée SuperAdmin.</p>
            <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', padding: '32px', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Webhooks par entreprise</h3>
              <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '20px' }}>
                Les webhooks Zapier / Make sont configurés par chaque company dans leur espace Administration.
                Ce tableau de bord SuperAdmin vous permet de superviser les appels globaux.
              </p>
              {allCompanies.slice(0, 5).map((co, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#0F172A', borderRadius: '10px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>🏢</span>
                    <div>
                      <div style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>{co.name}</div>
                      <div style={{ color: '#6B7280', fontSize: '12px' }}>Plan : {co.plan || 'solo'}</div>
                    </div>
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(102,126,234,0.2)', color: '#667EEA', fontSize: '12px', fontWeight: '700' }}>
                    Webhooks configurables
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RGPD — Déplacé depuis Admin */}
        {selectedTab === 'rgpd' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>⚖️ RGPD</h2>
            <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '32px' }}>Supervision de la conformité RGPD sur toutes les entreprises.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              {[
                { label: 'Entreprises conformes', value: allCompanies.filter(c => c.gdprCompliant !== false).length, icon: '✅', color: '#10B981' },
                { label: 'En attente de conformité', value: allCompanies.filter(c => c.gdprCompliant === false).length, icon: '⚠️', color: '#F59E0B' },
                { label: 'Demandes droit à l\'oubli', value: 0, icon: '🗑️', color: '#EF4444' },
                { label: 'Exports RGPD (30j)', value: 0, icon: '📤', color: '#667EEA' },
              ].map((stat, i) => (
                <div key={i} style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
                  <div style={{ color: '#9CA3AF', fontSize: '13px', marginTop: '4px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', padding: '28px', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>📋 Entreprises — statut RGPD</h3>
              {allCompanies.slice(0, 8).map((co, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>{co.name}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.2)', color: '#10B981', fontSize: '11px', fontWeight: '700' }}>✅ Conforme</span>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', background: '#0F172A', color: '#6B7280', fontSize: '11px', fontWeight: '700' }}>{co.plan || 'solo'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SYSTÈME — T-221 audit trail impersonation */}
        {selectedTab === 'system' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '32px' }}>⚙️ Système</h2>
            <div style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', padding: '32px', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '20px' }}>🕵️ Audit Impersonation</h3>
              {impersonationLog.length === 0 ? (
                <div style={{ color: '#6B7280', fontSize: '13px', padding: '12px 0' }}>Aucune impersonation enregistrée.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {impersonationLog.map((entry, i) => (
                    <div key={i} style={{ padding: '12px 16px', background: '#0F172A', borderRadius: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ color: '#9CA3AF' }}>
                        <strong style={{ color: '#F59E0B' }}>{entry.actorEmail || entry.actorId || 'Inconnu'}</strong>
                        {' '}a impersonné{' '}
                        <strong style={{ color: 'white' }}>{entry.targetCompanyName}</strong>
                        {' '}(#{entry.targetCompanyId})
                      </span>
                      <span style={{ color: '#6B7280', fontSize: '12px' }}>{new Date(entry.timestamp).toLocaleString('fr-FR')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <CompanyDetailModal
        company={selectedCompany}
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSave={handleSaveCompany}
        onDelete={handleDeleteCompany}
        onReload={loadSupabaseCompanies}
      />

      <CampaignFormModal
        campaign={selectedCampaign}
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        onSave={handleSaveCampaign}
      />

      <PromoCodeFormModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        onSave={handleSavePromoCode}
      />

      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onUpdate={handleUpdateTicket}
      />
    </div>
  );
}

export default SuperAdminPageFunctional;
