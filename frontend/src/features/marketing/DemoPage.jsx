import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { Navbar, Footer } from '@/shared/components/Marketing';
import { SEO } from '@/shared/components/SEO';
import styles from './DemoPage.module.css';

const MISSIONS = [
  { id: 1, title: 'Développeur React Senior', contract: 'CDI', location: 'Paris', salary: '55-70k€', status: 'open', applicants: 24, date: '12 juin 2026', urgent: true },
  { id: 2, title: 'Product Manager', contract: 'CDI', location: 'Lyon', salary: '50-65k€', status: 'open', applicants: 18, date: '8 juin 2026', urgent: false },
  { id: 3, title: 'DevOps Engineer', contract: 'CDI', location: 'Remote', salary: '60-75k€', status: 'open', applicants: 11, date: '5 juin 2026', urgent: true },
  { id: 4, title: 'UX Designer', contract: 'CDD', location: 'Bordeaux', salary: '40-50k€', status: 'draft', applicants: 0, date: '2 juin 2026', urgent: false },
  { id: 5, title: 'Data Scientist', contract: 'CDI', location: 'Paris', salary: '55-68k€', status: 'filled', applicants: 31, date: '28 mai 2026', urgent: false },
  { id: 6, title: 'Tech Lead Backend', contract: 'CDI', location: 'Paris', salary: '70-85k€', status: 'open', applicants: 9, date: '20 mai 2026', urgent: false },
];

const CANDIDATES = [
  { id: 1, name: 'Sophie Martin', initials: 'SM', role: 'Développeur React', skills: ['React', 'TypeScript', 'Node.js'], score: 94, source: 'LinkedIn', status: 'entretien', days: 5 },
  { id: 2, name: 'Thomas Dubois', initials: 'TD', role: 'Product Manager', skills: ['Agile', 'Figma', 'Jira'], score: 88, source: 'Indeed', status: 'preselection', days: 8 },
  { id: 3, name: 'Marie Laurent', initials: 'ML', role: 'UX Designer', skills: ['Figma', 'UX Research', 'CSS'], score: 85, source: 'Référence', status: 'test', days: 3 },
  { id: 4, name: 'Pierre Rousseau', initials: 'PR', role: 'DevOps Engineer', skills: ['Docker', 'Kubernetes', 'AWS'], score: 91, source: 'LinkedIn', status: 'entretien', days: 6 },
  { id: 5, name: 'Claire Fontaine', initials: 'CF', role: 'Data Scientist', skills: ['Python', 'ML', 'SQL'], score: 87, source: 'Glassdoor', status: 'nouveau', days: 1 },
  { id: 6, name: 'Antoine Leroy', initials: 'AL', role: 'Tech Lead', skills: ['Go', 'Kafka', 'Postgres'], score: 97, source: 'LinkedIn', status: 'offre', days: 12 },
];

const PIPELINE_COLUMNS = [
  { key: 'nouveau', label: 'Nouveau', color: '#3B82F6', bg: '#EFF6FF', count: 5 },
  { key: 'preselection', label: 'Présélectionné', color: '#8B5CF6', bg: '#F5F3FF', count: 3 },
  { key: 'entretien', label: 'Entretien', color: '#F59E0B', bg: '#FFFBEB', count: 4 },
  { key: 'test', label: 'Test technique', color: '#10B981', bg: '#ECFDF5', count: 2 },
  { key: 'offre', label: 'Offre envoyée', color: '#EC4899', bg: '#FDF2F8', count: 2 },
  { key: 'embauche', label: 'Embauché', color: '#059669', bg: '#D1FAE5', count: 1 },
];

const PIPELINE_CARDS = {
  nouveau: [
    { id: 1, name: 'Claire Fontaine', role: 'Data Scientist', score: 87, tag: 'Candidature spontanée' },
    { id: 2, name: 'Luc Garnier', role: 'Développeur Vue.js', score: 82, tag: 'Indeed' },
  ],
  preselection: [
    { id: 3, name: 'Thomas Dubois', role: 'Product Manager', score: 88, tag: 'Profil validé' },
  ],
  entretien: [
    { id: 4, name: 'Sophie Martin', role: 'Développeur React', score: 94, tag: '22 juin 14h' },
    { id: 5, name: 'Pierre Rousseau', role: 'DevOps Engineer', score: 91, tag: '23 juin 10h' },
  ],
  test: [
    { id: 6, name: 'Marie Laurent', role: 'UX Designer', score: 85, tag: 'Rendu dans 2j' },
  ],
  offre: [
    { id: 7, name: 'Karim Bensalem', role: 'Tech Lead', score: 93, tag: 'En attente réponse' },
  ],
  embauche: [
    { id: 8, name: 'Antoine Leroy', role: 'Tech Lead Backend', score: 97, tag: 'Démarrage 1er juillet' },
  ],
};

const RECENT_ACTIVITY = [
  { icon: '🎉', text: 'Antoine Leroy a accepté l\'offre pour Tech Lead Backend', time: 'Il y a 1h' },
  { icon: '📩', text: 'Nouvelle candidature — Luc Garnier pour Développeur Vue.js', time: 'Il y a 3h' },
  { icon: '📅', text: 'Entretien planifié avec Sophie Martin le 22 juin à 14h', time: 'Il y a 5h' },
  { icon: '✅', text: 'Marie Laurent a soumis son test technique UX', time: 'Hier' },
  { icon: '🚀', text: 'Mission "Tech Lead Backend" publiée sur LinkedIn', time: 'Hier' },
];

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard', key: 'dashboard' },
  { icon: '📋', label: 'Missions', key: 'missions' },
  { icon: '👥', label: 'Candidats', key: 'candidats' },
  { icon: '🎯', label: 'Pipeline', key: 'pipeline' },
  { icon: '👨‍👩‍👧‍👦', label: 'Équipe', key: 'equipe' },
  { icon: '📁', label: 'CVthèque', key: 'cvtheque', disabled: true },
  { icon: '📅', label: 'Calendrier', key: 'calendar', disabled: true },
  { icon: '📈', label: 'Analytiques', key: 'analytics' },
];

const TEAM_MEMBERS = [
  { id: 1, initials: 'JM', name: 'Julie Moreau', role: 'Lead Recruiter', missions: 5, candidates: 42, status: 'disponible' },
  { id: 2, initials: 'KH', name: 'Karim Haddad', role: 'Recruteur', missions: 3, candidates: 28, status: 'entretien' },
  { id: 3, initials: 'EP', name: 'Emma Petit', role: 'Recruteuse', missions: 4, candidates: 35, status: 'disponible' },
  { id: 4, initials: 'NB', name: 'Nicolas Blanc', role: 'Recruteur junior', missions: 2, candidates: 15, status: 'conges' },
];

const TEAM_STATUS = {
  disponible: { label: 'Disponible', bg: '#ECFDF5', color: '#065F46' },
  entretien:  { label: 'En entretien', bg: '#FFFBEB', color: '#92400E' },
  conges:     { label: 'En congés', bg: '#F3F4F6', color: '#4B5563' },
};

const STATUS_CONFIG = {
  open:   { label: 'Ouverte',  bg: '#D1FAE5', color: '#065F46' },
  draft:  { label: 'Brouillon', bg: '#F3F4F6', color: '#4B5563' },
  filled: { label: 'Pourvue',  bg: '#E0E7FF', color: '#3730A3' },
};

const CANDIDATE_STATUS = {
  nouveau:      { label: 'Nouveau',      bg: '#EFF6FF', color: '#1D4ED8' },
  preselection: { label: 'Présélectionné', bg: '#F5F3FF', color: '#6D28D9' },
  entretien:    { label: 'Entretien',    bg: '#FFFBEB', color: '#92400E' },
  test:         { label: 'Test tech.',   bg: '#ECFDF5', color: '#065F46' },
  offre:        { label: 'Offre',        bg: '#FDF2F8', color: '#9D174D' },
};

export function DemoPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [missionFilter, setMissionFilter] = useState('all');

  const filteredMissions = MISSIONS.filter(m =>
    missionFilter === 'all' || m.status === missionFilter
  );

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ATS Ultimate Demo',
    applicationCategory: 'BusinessApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  };

  return (
    <div className={styles.page}>
      <SEO
        title="Démo Interactive — ATS Ultimate"
        description="Testez ATS Ultimate gratuitement. Découvrez le pipeline Kanban 6 colonnes, le scoring IA, la gestion de missions et les analytics en temps réel."
        url="https://ats-ultimate.com/demo"
        structuredData={structuredData}
      />
      <Navbar />

      <div className={styles.hero}>
        <span className={styles.liveBadge}>● Live Demo</span>
        <h1 className={styles.heroTitle}>Voyez l'app en action</h1>
        <p className={styles.heroSub}>
          Vous en avez mare des CVs papier éparpillés et empilé sur votre bureau ? <br />
          Nous avons la solution !
        </p>
        <button
          className={styles.heroBtn}
          onClick={() => navigate(`${ROUTES.CONTACT}?sujet=demo`)}
        >
          🎥 Demander une démo
        </button>
      </div>

      {/* App Shell */}
      <div className={styles.shell}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarLogo}>
            <span className={styles.logoIcon}>⚡</span>
            <span className={styles.logoText}>ATS Ultimate</span>
          </div>
          <nav className={styles.sidebarNav}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                className={`${styles.navItem} ${activeTab === item.key ? styles.navActive : ''} ${item.disabled ? styles.navDisabled : ''}`}
                onClick={() => !item.disabled && setActiveTab(item.key)}
                title={item.disabled ? 'Connectez-vous pour voir ce module' : undefined}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {item.disabled && <span className={styles.lockIcon}>🔒</span>}
              </button>
            ))}
          </nav>
          <div className={styles.sidebarUser}>
            <div className={styles.userAvatar}>AD</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>Admin Démo</div>
              <div className={styles.userRole}>Administrateur</div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className={styles.main}>
          {/* Top bar */}
          <div className={styles.topbar}>
            <div className={styles.topbarTitle}>
              {NAV_ITEMS.find(n => n.key === activeTab)?.icon}{' '}
              {NAV_ITEMS.find(n => n.key === activeTab)?.label}
            </div>
            <div className={styles.topbarActions}>
              <span className={styles.demoTag}>Mode démo</span>
            </div>
          </div>

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className={styles.tabContent}>
              <div className={styles.kpisRow}>
                {[
                  { label: 'Missions actives', value: '12', icon: '📋', change: '+2', up: true },
                  { label: 'Candidats actifs', value: '247', icon: '👥', change: '+34', up: true },
                  { label: 'Entretiens / semaine', value: '8', icon: '📅', change: '+3', up: true },
                  { label: 'Taux conversion', value: '18%', icon: '🎯', change: '+2%', up: true },
                  { label: 'Embauches (mois)', value: '3', icon: '🎉', change: '=0', up: null },
                  { label: 'Délai moyen', value: '21j', icon: '⏱', change: '-3j', up: true },
                ].map((kpi, i) => (
                  <div key={i} className={styles.kpiCard}>
                    <div className={styles.kpiTop}>
                      <span className={styles.kpiIcon}>{kpi.icon}</span>
                      <span className={`${styles.kpiChange} ${kpi.up === true ? styles.up : kpi.up === false ? styles.down : styles.neutral}`}>
                        {kpi.change}
                      </span>
                    </div>
                    <div className={styles.kpiValue}>{kpi.value}</div>
                    <div className={styles.kpiLabel}>{kpi.label}</div>
                  </div>
                ))}
              </div>

              <div className={styles.dashboardBody}>
                <div className={styles.funnelSection}>
                  <h3 className={styles.sectionTitle}>Funnel de recrutement</h3>
                  {[
                    { label: 'Candidatures reçues', count: 247, pct: 100, color: '#3B82F6' },
                    { label: 'Présélectionnés', count: 89, pct: 36, color: '#8B5CF6' },
                    { label: 'Entretiens', count: 43, pct: 17, color: '#F59E0B' },
                    { label: 'Tests techniques', count: 18, pct: 7, color: '#10B981' },
                    { label: 'Offres envoyées', count: 9, pct: 4, color: '#EC4899' },
                    { label: 'Embauchés', count: 3, pct: 1, color: '#059669' },
                  ].map((step, i) => (
                    <div key={i} className={styles.funnelStep}>
                      <div className={styles.funnelLabel}>{step.label}</div>
                      <div className={styles.funnelBarWrap}>
                        <div className={styles.funnelBar} style={{ width: `${step.pct}%`, background: step.color }} />
                      </div>
                      <div className={styles.funnelCount}>{step.count}</div>
                    </div>
                  ))}
                </div>

                <div className={styles.activitySection}>
                  <h3 className={styles.sectionTitle}>Activité récente</h3>
                  <div className={styles.activityList}>
                    {RECENT_ACTIVITY.map((item, i) => (
                      <div key={i} className={styles.activityItem}>
                        <span className={styles.activityIcon}>{item.icon}</span>
                        <div className={styles.activityBody}>
                          <div className={styles.activityText}>{item.text}</div>
                          <div className={styles.activityTime}>{item.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MISSIONS */}
          {activeTab === 'missions' && (
            <div className={styles.tabContent}>
              <div className={styles.tableToolbar}>
                <div className={styles.filterGroup}>
                  {['all', 'open', 'draft', 'filled'].map(f => (
                    <button
                      key={f}
                      className={`${styles.filterBtn} ${missionFilter === f ? styles.filterActive : ''}`}
                      onClick={() => setMissionFilter(f)}
                    >
                      {f === 'all' ? 'Toutes' : STATUS_CONFIG[f]?.label}
                    </button>
                  ))}
                </div>
                <button className={styles.addBtn}>+ Nouvelle mission</button>
              </div>
              <div className={styles.missionGrid}>
                {filteredMissions.map(m => {
                  const s = STATUS_CONFIG[m.status];
                  return (
                    <div key={m.id} className={styles.missionCard}>
                      <div className={styles.missionCardTop}>
                        <div className={styles.missionTitle}>
                          {m.title}
                          {m.urgent && <span className={styles.urgentBadge}>Urgent</span>}
                        </div>
                        <span className={styles.statusBadge} style={{ background: s.bg, color: s.color }}>
                          {s.label}
                        </span>
                      </div>
                      <div className={styles.missionMeta}>
                        <span>📍 {m.location}</span>
                        <span>📄 {m.contract}</span>
                        <span>💰 {m.salary}</span>
                      </div>
                      <div className={styles.missionFooter}>
                        <span className={styles.applicantCount}>👥 {m.applicants} candidats</span>
                        <span className={styles.missionDate}>{m.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CANDIDATS */}
          {activeTab === 'candidats' && (
            <div className={styles.tabContent}>
              <div className={styles.tableToolbar}>
                <div className={styles.searchBar}>
                  <span>🔍</span>
                  <span className={styles.searchPlaceholder}>Rechercher un candidat...</span>
                </div>
                <button className={styles.addBtn}>+ Ajouter un candidat</button>
              </div>
              <div className={styles.candidateGrid}>
                {CANDIDATES.map(c => {
                  const st = CANDIDATE_STATUS[c.status];
                  return (
                    <div key={c.id} className={styles.candidateCard}>
                      <div className={styles.candidateHeader}>
                        <div className={styles.avatar}>{c.initials}</div>
                        <div>
                          <div className={styles.candidateName}>{c.name}</div>
                          <div className={styles.candidateRole}>{c.role}</div>
                        </div>
                        <div className={styles.scoreCircle}>{c.score}</div>
                      </div>
                      <div className={styles.skillsRow}>
                        {c.skills.map(s => (
                          <span key={s} className={styles.skillTag}>{s}</span>
                        ))}
                      </div>
                      <div className={styles.candidateFooter}>
                        <span className={styles.sourceBadge}>via {c.source}</span>
                        <span className={styles.statusBadge} style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PIPELINE */}
          {activeTab === 'pipeline' && (
            <div className={styles.tabContent}>
              <div className={styles.pipelineHint}>
                Glissez-déposez les cartes pour faire avancer vos candidats dans le processus
              </div>
              <div className={styles.kanban}>
                {PIPELINE_COLUMNS.map(col => (
                  <div key={col.key} className={styles.kanbanCol}>
                    <div className={styles.kanbanColHeader} style={{ borderTopColor: col.color }}>
                      <span className={styles.kanbanColLabel}>{col.label}</span>
                      <span className={styles.kanbanColCount} style={{ background: col.color }}>
                        {PIPELINE_CARDS[col.key]?.length ?? 0}
                      </span>
                    </div>
                    <div className={styles.kanbanCards}>
                      {(PIPELINE_CARDS[col.key] || []).map(card => (
                        <div key={card.id} className={styles.kanbanCard}>
                          <div className={styles.kanbanCardHeader}>
                            <div className={styles.kanbanAvatar} style={{ background: col.color }}>
                              {card.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className={styles.kanbanName}>{card.name}</div>
                              <div className={styles.kanbanRole}>{card.role}</div>
                            </div>
                          </div>
                          <div className={styles.kanbanCardFooter}>
                            <span className={styles.kanbanTag}>{card.tag}</span>
                            <span className={styles.kanbanScore} style={{ color: col.color }}>
                              {card.score}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ÉQUIPE */}
          {activeTab === 'equipe' && (
            <div className={styles.tabContent}>
              <div className={styles.tableToolbar}>
                <div className={styles.searchBar}>
                  <span>🔍</span>
                  <span className={styles.searchPlaceholder}>Rechercher un membre de l'équipe...</span>
                </div>
                <button className={styles.addBtn}>+ Inviter un recruteur</button>
              </div>
              <div className={styles.candidateGrid}>
                {TEAM_MEMBERS.map(member => {
                  const st = TEAM_STATUS[member.status];
                  const workloadPct = Math.min(100, Math.round((member.missions / 6) * 100));
                  return (
                    <div key={member.id} className={styles.candidateCard}>
                      <div className={styles.candidateHeader}>
                        <div className={styles.avatar}>{member.initials}</div>
                        <div>
                          <div className={styles.candidateName}>{member.name}</div>
                          <div className={styles.candidateRole}>{member.role}</div>
                        </div>
                      </div>
                      <div className={styles.funnelStep} style={{ gridTemplateColumns: '90px 1fr 30px', marginBottom: '0.75rem' }}>
                        <div className={styles.funnelLabel}>{member.missions} missions</div>
                        <div className={styles.funnelBarWrap}>
                          <div className={styles.funnelBar} style={{ width: `${workloadPct}%`, background: '#667EEA' }} />
                        </div>
                        <div className={styles.funnelCount}>{member.candidates}</div>
                      </div>
                      <div className={styles.candidateFooter}>
                        <span className={styles.sourceBadge}>{member.candidates} candidats gérés</span>
                        <span className={styles.statusBadge} style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className={styles.tabContent}>
              <div className={styles.analyticsGrid}>
                <div className={styles.analyticsCard}>
                  <h3 className={styles.sectionTitle}>Sources de candidatures</h3>
                  {[
                    { source: 'LinkedIn', count: 98, pct: 40, color: '#0077B5' },
                    { source: 'Indeed', count: 61, pct: 25, color: '#2164F3' },
                    { source: 'Glassdoor', count: 37, pct: 15, color: '#0CAA41' },
                    { source: 'Référence interne', count: 30, pct: 12, color: '#8B5CF6' },
                    { source: 'Site carrières', count: 21, pct: 8, color: '#F59E0B' },
                  ].map((s, i) => (
                    <div key={i} className={styles.sourceRow}>
                      <div className={styles.sourceName}>{s.source}</div>
                      <div className={styles.sourceBarWrap}>
                        <div className={styles.sourceBar} style={{ width: `${s.pct}%`, background: s.color }} />
                      </div>
                      <div className={styles.sourceCount}>{s.count}</div>
                    </div>
                  ))}
                </div>

                <div className={styles.analyticsCard}>
                  <h3 className={styles.sectionTitle}>KPIs clés</h3>
                  <div className={styles.analyticsKpis}>
                    {[
                      { label: 'Délai moyen (poste → embauche)', value: '21 jours', icon: '⏱' },
                      { label: 'Taux CV → entretien', value: '17%', icon: '📈' },
                      { label: 'Taux entretien → offre', value: '21%', icon: '🎯' },
                      { label: 'Taux d\'acceptation offre', value: '78%', icon: '✅' },
                      { label: 'Coût moyen par recrutement', value: '1 240€', icon: '💰' },
                    ].map((k, i) => (
                      <div key={i} className={styles.analyticsKpiRow}>
                        <span className={styles.analyticsKpiIcon}>{k.icon}</span>
                        <span className={styles.analyticsKpiLabel}>{k.label}</span>
                        <span className={styles.analyticsKpiValue}>{k.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.analyticsCard}>
                  <h3 className={styles.sectionTitle}>Top missions (candidatures)</h3>
                  {MISSIONS.filter(m => m.status !== 'draft').slice(0, 5).map((m, i) => (
                    <div key={i} className={styles.topMissionRow}>
                      <span className={styles.topMissionRank}>#{i + 1}</span>
                      <span className={styles.topMissionTitle}>{m.title}</span>
                      <span className={styles.topMissionCount}>{m.applicants} candidats</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CTA — demande de démo (pas d'essai gratuit, offres payantes uniquement) */}
      <div className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Prêt à passer à l'étape suivante ?</h2>
          <p className={styles.ctaText}>
            Nos équipes vous présentent la plateforme avec vos propres cas d'usage et répondent à toutes vos questions.
          </p>
          <div className={styles.ctaBtns}>
            <button className={styles.ctaPrimary} onClick={() => navigate(`${ROUTES.CONTACT}?sujet=demo`)}>
              🎥 Demander une démo
            </button>
          </div>
        </div>
      </div>

      <Footer variant="light" />
    </div>
  );
}

export default DemoPage;
