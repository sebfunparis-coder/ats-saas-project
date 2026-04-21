import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { Navbar, Footer } from '@/shared/components/Marketing';
import { SEO } from '@/shared/components/SEO';
import styles from './DemoPage.module.css';

/**
 * Page Démo Interactive - Sandbox avec données fictives
 * Permet aux visiteurs de tester l'interface ATS
 */
export function DemoPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pipeline');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock Data - Dashboard KPIs
  const kpis = [
    { label: 'Candidatures', value: '247', change: '+12%', trend: 'up' },
    { label: 'Entretiens', value: '43', change: '+8%', trend: 'up' },
    { label: 'Offres envoyées', value: '12', change: '+3', trend: 'up' },
    { label: 'Taux conversion', value: '18%', change: '+2%', trend: 'up' }
  ];

  // Mock Data - Pipeline Kanban
  const [pipelineData, setPipelineData] = useState({
    candidatures: [
      { id: 1, name: 'Sophie Martin', poste: 'Développeur React', score: 92 },
      { id: 2, name: 'Thomas Dubois', poste: 'Product Manager', score: 88 },
      { id: 3, name: 'Marie Laurent', poste: 'UX Designer', score: 85 }
    ],
    preselection: [
      { id: 4, name: 'Pierre Rousseau', poste: 'DevOps Engineer', score: 90 },
      { id: 5, name: 'Claire Fontaine', poste: 'Data Scientist', score: 87 }
    ],
    entretien: [
      { id: 6, name: 'Marc Benoit', poste: 'Développeur React', score: 95 },
      { id: 7, name: 'Isabelle Moreau', poste: 'Product Manager', score: 89 }
    ],
    offre: [
      { id: 8, name: 'Antoine Leroy', poste: 'Tech Lead', score: 96 }
    ]
  });

  // Mock Data - Candidats avec filtres
  const candidats = [
    { id: 1, name: 'Sophie Martin', poste: 'Développeur React', status: 'candidature', score: 92, date: '2026-02-15' },
    { id: 2, name: 'Thomas Dubois', poste: 'Product Manager', status: 'candidature', score: 88, date: '2026-02-14' },
    { id: 3, name: 'Marie Laurent', poste: 'UX Designer', status: 'candidature', score: 85, date: '2026-02-14' },
    { id: 4, name: 'Pierre Rousseau', poste: 'DevOps Engineer', status: 'preselection', score: 90, date: '2026-02-13' },
    { id: 5, name: 'Claire Fontaine', poste: 'Data Scientist', status: 'preselection', score: 87, date: '2026-02-12' },
    { id: 6, name: 'Marc Benoit', poste: 'Développeur React', status: 'entretien', score: 95, date: '2026-02-11' },
    { id: 7, name: 'Isabelle Moreau', poste: 'Product Manager', status: 'entretien', score: 89, date: '2026-02-10' },
    { id: 8, name: 'Antoine Leroy', poste: 'Tech Lead', status: 'offre', score: 96, date: '2026-02-09' }
  ];

  const filteredCandidats = candidats.filter(c =>
    filterStatus === 'all' || c.status === filterStatus
  );

  // Drag & Drop handlers (simplifié pour démo)
  const handleDragStart = (e, candidat, column) => {
    e.dataTransfer.setData('candidat', JSON.stringify({ candidat, fromColumn: column }));
  };

  const handleDrop = (e, toColumn) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('candidat'));

    // Simuler déplacement (simplified)
    setPipelineData(prev => {
      const newData = { ...prev };
      const fromColumn = data.fromColumn;

      // Remove from old column
      newData[fromColumn] = newData[fromColumn].filter(c => c.id !== data.candidat.id);

      // Add to new column
      newData[toColumn] = [...newData[toColumn], data.candidat];

      return newData;
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'ATS Ultimate Demo',
    'applicationCategory': 'BusinessApplication',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'EUR'
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(180deg, #FCE7F3 0%, #F3E8FF 50%, #DDD6FE 100%)',
      minHeight: '100vh'
    }}>
      <SEO
        title="Démo Interactive - ATS Ultimate"
        description="Testez ATS Ultimate gratuitement avec notre démo interactive. Découvrez le pipeline Kanban, le scoring IA et la CVthèque intelligente sans créer de compte."
        url="https://ats-ultimate.com/demo"
        structuredData={structuredData}
      />

      <Navbar />

      <div className={styles.container}>
        {/* Header Demo */}
        <div className={styles.demoHeader}>
          <div className={styles.demoBadge}>
            <span className={styles.demoIcon}>🎮</span>
            <span>Mode Démo Interactif</span>
          </div>
          <h1 className={styles.title}>Testez ATS Ultimate en Direct</h1>
          <p className={styles.subtitle}>
            Explorez l'interface avec des <strong>données fictives</strong>.<br />
            Déplacez les candidats, filtrez, testez toutes les fonctionnalités.
          </p>
        </div>

        {/* Dashboard KPIs */}
        <div className={styles.kpisGrid}>
          {kpis.map((kpi, i) => (
            <div key={i} className={styles.kpiCard}>
              <div className={styles.kpiLabel}>{kpi.label}</div>
              <div className={styles.kpiValue}>{kpi.value}</div>
              <div className={`${styles.kpiChange} ${styles[kpi.trend]}`}>
                {kpi.trend === 'up' ? '↗' : '↘'} {kpi.change}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Navigation */}
        <div className={styles.tabs} role="tablist" aria-label="Sections de la démo">
          <button
            role="tab"
            aria-selected={activeTab === 'pipeline'}
            aria-controls="pipeline-panel"
            className={`${styles.tab} ${activeTab === 'pipeline' ? styles.active : ''}`}
            onClick={() => setActiveTab('pipeline')}>
            📊 Pipeline Kanban
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'candidats'}
            aria-controls="candidats-panel"
            className={`${styles.tab} ${activeTab === 'candidats' ? styles.active : ''}`}
            onClick={() => setActiveTab('candidats')}>
            👥 Liste Candidats
          </button>
        </div>

        {/* Pipeline Kanban */}
        {activeTab === 'pipeline' && (
          <div
            id="pipeline-panel"
            role="tabpanel"
            aria-labelledby="pipeline-tab"
            className={styles.pipelineSection}>
            <div className={styles.pipelineHeader}>
              <h2>🎯 Pipeline de Recrutement (Drag & Drop)</h2>
              <p className={styles.pipelineSubtitle}>
                Déplacez les cartes entre les colonnes pour changer le statut
              </p>
            </div>

            <div className={styles.kanbanBoard}>
              {/* Candidatures */}
              <div
                className={styles.kanbanColumn}
                onDrop={(e) => handleDrop(e, 'candidatures')}
                onDragOver={handleDragOver}>
                <div className={styles.columnHeader}>
                  <h3>📥 Candidatures</h3>
                  <span className={styles.columnCount}>{pipelineData.candidatures.length}</span>
                </div>
                <div className={styles.columnCards}>
                  {pipelineData.candidatures.map(candidat => (
                    <div
                      key={candidat.id}
                      className={styles.kanbanCard}
                      draggable
                      onDragStart={(e) => handleDragStart(e, candidat, 'candidatures')}>
                      <div className={styles.cardName}>{candidat.name}</div>
                      <div className={styles.cardPoste}>{candidat.poste}</div>
                      <div className={styles.cardScore}>
                        🤖 Score IA: <strong>{candidat.score}%</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Présélection */}
              <div
                className={styles.kanbanColumn}
                onDrop={(e) => handleDrop(e, 'preselection')}
                onDragOver={handleDragOver}>
                <div className={styles.columnHeader}>
                  <h3>✅ Présélection</h3>
                  <span className={styles.columnCount}>{pipelineData.preselection.length}</span>
                </div>
                <div className={styles.columnCards}>
                  {pipelineData.preselection.map(candidat => (
                    <div
                      key={candidat.id}
                      className={styles.kanbanCard}
                      draggable
                      onDragStart={(e) => handleDragStart(e, candidat, 'preselection')}>
                      <div className={styles.cardName}>{candidat.name}</div>
                      <div className={styles.cardPoste}>{candidat.poste}</div>
                      <div className={styles.cardScore}>
                        🤖 Score IA: <strong>{candidat.score}%</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Entretien */}
              <div
                className={styles.kanbanColumn}
                onDrop={(e) => handleDrop(e, 'entretien')}
                onDragOver={handleDragOver}>
                <div className={styles.columnHeader}>
                  <h3>🎤 Entretien</h3>
                  <span className={styles.columnCount}>{pipelineData.entretien.length}</span>
                </div>
                <div className={styles.columnCards}>
                  {pipelineData.entretien.map(candidat => (
                    <div
                      key={candidat.id}
                      className={styles.kanbanCard}
                      draggable
                      onDragStart={(e) => handleDragStart(e, candidat, 'entretien')}>
                      <div className={styles.cardName}>{candidat.name}</div>
                      <div className={styles.cardPoste}>{candidat.poste}</div>
                      <div className={styles.cardScore}>
                        🤖 Score IA: <strong>{candidat.score}%</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Offre */}
              <div
                className={styles.kanbanColumn}
                onDrop={(e) => handleDrop(e, 'offre')}
                onDragOver={handleDragOver}>
                <div className={styles.columnHeader}>
                  <h3>🎉 Offre</h3>
                  <span className={styles.columnCount}>{pipelineData.offre.length}</span>
                </div>
                <div className={styles.columnCards}>
                  {pipelineData.offre.map(candidat => (
                    <div
                      key={candidat.id}
                      className={styles.kanbanCard}
                      draggable
                      onDragStart={(e) => handleDragStart(e, candidat, 'offre')}>
                      <div className={styles.cardName}>{candidat.name}</div>
                      <div className={styles.cardPoste}>{candidat.poste}</div>
                      <div className={styles.cardScore}>
                        🤖 Score IA: <strong>{candidat.score}%</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liste Candidats */}
        {activeTab === 'candidats' && (
          <div
            id="candidats-panel"
            role="tabpanel"
            aria-labelledby="candidats-tab"
            className={styles.candidatsSection}>
            <div className={styles.candidatsHeader}>
              <h2>👥 Liste des Candidats</h2>

              {/* Filtres */}
              <div className={styles.filters} role="group" aria-label="Filtrer par statut">
                <button
                  className={`${styles.filterButton} ${filterStatus === 'all' ? styles.active : ''}`}
                  onClick={() => setFilterStatus('all')}
                  aria-pressed={filterStatus === 'all'}>
                  Tous ({candidats.length})
                </button>
                <button
                  className={`${styles.filterButton} ${filterStatus === 'candidature' ? styles.active : ''}`}
                  onClick={() => setFilterStatus('candidature')}
                  aria-pressed={filterStatus === 'candidature'}>
                  Candidatures (3)
                </button>
                <button
                  className={`${styles.filterButton} ${filterStatus === 'preselection' ? styles.active : ''}`}
                  onClick={() => setFilterStatus('preselection')}
                  aria-pressed={filterStatus === 'preselection'}>
                  Présélection (2)
                </button>
                <button
                  className={`${styles.filterButton} ${filterStatus === 'entretien' ? styles.active : ''}`}
                  onClick={() => setFilterStatus('entretien')}
                  aria-pressed={filterStatus === 'entretien'}>
                  Entretien (2)
                </button>
                <button
                  className={`${styles.filterButton} ${filterStatus === 'offre' ? styles.active : ''}`}
                  onClick={() => setFilterStatus('offre')}
                  aria-pressed={filterStatus === 'offre'}>
                  Offre (1)
                </button>
              </div>
            </div>

            <div className={styles.candidatsTable}>
              {filteredCandidats.map(candidat => (
                <div key={candidat.id} className={styles.candidatRow}>
                  <div className={styles.candidatInfo}>
                    <div className={styles.candidatName}>{candidat.name}</div>
                    <div className={styles.candidatPoste}>{candidat.poste}</div>
                  </div>
                  <div className={styles.candidatScore}>
                    <div className={styles.scoreLabel}>Score IA</div>
                    <div className={styles.scoreValue}>{candidat.score}%</div>
                  </div>
                  <div className={styles.candidatStatus}>
                    <span className={`${styles.statusBadge} ${styles[candidat.status]}`}>
                      {candidat.status === 'candidature' && '📥 Candidature'}
                      {candidat.status === 'preselection' && '✅ Présélection'}
                      {candidat.status === 'entretien' && '🎤 Entretien'}
                      {candidat.status === 'offre' && '🎉 Offre'}
                    </span>
                  </div>
                  <div className={styles.candidatDate}>{candidat.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Démo Personnalisée */}
        <div className={styles.demoCTA}>
          <h2>🚀 Prêt à Tester avec Vos Vraies Données ?</h2>
          <p>
            Demandez une <strong>démo personnalisée</strong> avec un expert ATS Ultimate.<br />
            Nous configurons votre instance avec vos offres, vos candidats, vos process.
          </p>
          <div className={styles.ctaButtons}>
            <button
              className={styles.ctaPrimary}
              onClick={() => navigate(ROUTES.CONTACT)}
              aria-label="Demander une démonstration personnalisée">
              📞 Demander une Démo Personnalisée
            </button>
            <button
              className={styles.ctaSecondary}
              onClick={() => navigate(ROUTES.PRICING)}
              aria-label="Commencer l'essai gratuit de 14 jours">
              ✨ Essai Gratuit 14 Jours
            </button>
          </div>
          <p className={styles.ctaDisclaimer}>
            Sans carte bancaire • Setup en 5 minutes • Support français
          </p>
        </div>

        {/* Features Highlights */}
        <div className={styles.featuresHighlight}>
          <h3>Ce que vous venez de tester :</h3>
          <div className={styles.highlightGrid}>
            <div className={styles.highlightItem}>
              <div className={styles.highlightIcon}>🤖</div>
              <div className={styles.highlightTitle}>Scoring IA Automatique</div>
              <div className={styles.highlightText}>
                Analyse et score chaque CV en moins de 2 secondes
              </div>
            </div>
            <div className={styles.highlightItem}>
              <div className={styles.highlightIcon}>📊</div>
              <div className={styles.highlightTitle}>Pipeline Kanban</div>
              <div className={styles.highlightText}>
                Drag & drop fluide pour gérer vos candidats
              </div>
            </div>
            <div className={styles.highlightItem}>
              <div className={styles.highlightIcon}>🎯</div>
              <div className={styles.highlightTitle}>Filtres Intelligents</div>
              <div className={styles.highlightText}>
                Trouvez le bon candidat en quelques clics
              </div>
            </div>
            <div className={styles.highlightItem}>
              <div className={styles.highlightIcon}>📈</div>
              <div className={styles.highlightTitle}>Dashboard KPIs</div>
              <div className={styles.highlightText}>
                Suivez vos métriques de recrutement en temps réel
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer variant="light" />
    </div>
  );
}

export default DemoPage;
