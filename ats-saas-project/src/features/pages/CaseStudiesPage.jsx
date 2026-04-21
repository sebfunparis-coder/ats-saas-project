import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { Navbar, Footer } from '@/shared/components/Marketing';
import { SEO } from '@/shared/components/SEO';
import styles from './CaseStudiesPage.module.css';

/**
 * Page Cas Clients - Success stories et témoignages clients
 * Secteurs : Tech, Cabinet, PME, Retail, Santé, Finance
 */
export function CaseStudiesPage() {
  const navigate = useNavigate();
  const [activeSector, setActiveSector] = useState('all');

  const sectors = [
    { id: 'all', label: '🌟 Tous les secteurs', count: 8 },
    { id: 'tech', label: '💻 Tech & Startups', count: 3 },
    { id: 'cabinet', label: '👔 Cabinets RH', count: 2 },
    { id: 'pme', label: '🏢 PME', count: 2 },
    { id: 'retail', label: '🛍️ Retail', count: 1 }
  ];

  const caseStudies = [
    // TECH & STARTUPS
    {
      id: 1,
      company: 'TechCorp',
      sector: 'tech',
      logo: '🚀',
      size: '150-200 employés',
      location: 'Paris, France',
      industry: 'SaaS B2B',
      challenge: 'Volume énorme de candidatures (500+ par offre) impossible à gérer manuellement',
      solution: 'Scoring IA + Pipeline automatisé + Intégration LinkedIn',
      results: [
        { metric: '-75%', label: 'Temps de présélection' },
        { metric: '3x', label: 'Plus de candidats qualifiés' },
        { metric: '15 jours', label: 'Délai de recrutement' }
      ],
      quote: 'ATS Ultimate a transformé notre recrutement. L\'IA filtre automatiquement les meilleurs profils, on gagne un temps fou !',
      author: 'Sophie Martin',
      role: 'Head of Talent Acquisition',
      featured: true,
      color: '#667EEA'
    },
    {
      id: 2,
      company: 'DataMinds AI',
      sector: 'tech',
      logo: '🤖',
      size: '50-100 employés',
      location: 'Lyon, France',
      industry: 'Intelligence Artificielle',
      challenge: 'Recruter des profils techniques rares (Data Scientists, ML Engineers)',
      solution: 'CVthèque intelligente + Sourcing automatisé + Scoring compétences',
      results: [
        { metric: '+200%', label: 'Vivier de talents' },
        { metric: '92%', label: 'Taux de matching' },
        { metric: '12 jours', label: 'Time-to-hire' }
      ],
      quote: 'La CVthèque IA nous a permis de constituer un vivier de 500+ profils tech qualifiés. On recrute 2x plus vite.',
      author: 'Marc Durand',
      role: 'CTO & Co-founder',
      featured: false,
      color: '#10B981'
    },
    {
      id: 3,
      company: 'FinTech Solutions',
      sector: 'tech',
      logo: '💳',
      size: '80-120 employés',
      location: 'Nantes, France',
      industry: 'FinTech',
      challenge: 'Process de recrutement trop long (45+ jours) à cause des validations multiples',
      solution: 'Pipeline Kanban + Workflow automatisé + Calendrier synchronisé',
      results: [
        { metric: '-60%', label: 'Cycle de recrutement' },
        { metric: '18 jours', label: 'Délai moyen' },
        { metric: '95%', label: 'Satisfaction candidats' }
      ],
      quote: 'Le pipeline Kanban a fluidifié nos process. Tous les stakeholders suivent en temps réel, c\'est génial !',
      author: 'Caroline Petit',
      role: 'HR Manager',
      featured: false,
      color: '#F59E0B'
    },

    // CABINETS RH
    {
      id: 4,
      company: 'Executive Search Partners',
      sector: 'cabinet',
      logo: '👔',
      size: '10-20 consultants',
      location: 'Paris, France',
      industry: 'Cabinet de recrutement',
      challenge: 'Gérer 50+ missions simultanées avec CVthèque partagée entre consultants',
      solution: 'Multi-missions + CVthèque centralisée + Collaboration équipe',
      results: [
        { metric: '+40%', label: 'Placements par mois' },
        { metric: '5000+', label: 'CV dans la CVthèque' },
        { metric: '2h/jour', label: 'Temps économisé' }
      ],
      quote: 'Indispensable pour un cabinet ! La CVthèque partagée et le multi-missions sont des game-changers.',
      author: 'Jean Lefebvre',
      role: 'Directeur Associé',
      featured: true,
      color: '#8B5CF6'
    },
    {
      id: 5,
      company: 'TalentFinders',
      sector: 'cabinet',
      logo: '🎯',
      size: '5-10 consultants',
      location: 'Bordeaux, France',
      industry: 'Cabinet RH spécialisé',
      challenge: 'Difficulté à tracker les candidatures et éviter les doublons entre consultants',
      solution: 'CRM candidats + Anti-doublons + Historique complet',
      results: [
        { metric: '100%', label: 'Traçabilité' },
        { metric: '0', label: 'Doublon candidat' },
        { metric: '+35%', label: 'Productivité' }
      ],
      quote: 'Plus aucun doublon, historique complet de chaque candidat. On a enfin un vrai CRM RH !',
      author: 'Isabelle Moreau',
      role: 'Fondatrice',
      featured: false,
      color: '#EC4899'
    },

    // PME
    {
      id: 6,
      company: 'Manufacture Française',
      sector: 'pme',
      logo: '🏭',
      size: '200-300 employés',
      location: 'Lille, France',
      industry: 'Industrie',
      challenge: 'Recruter des profils opérationnels en masse (ouvriers, techniciens)',
      solution: 'Multidiffusion job boards + Recrutement mobile + Emails automatisés',
      results: [
        { metric: '+150%', label: 'Volume candidatures' },
        { metric: '48h', label: 'Réponse candidat' },
        { metric: '10 offres', label: 'Gérées simultanément' }
      ],
      quote: 'La multidiffusion sur Indeed + Pôle Emploi nous fait gagner un temps précieux. Volume x2 en 1 mois !',
      author: 'Pierre Rousseau',
      role: 'DRH',
      featured: false,
      color: '#06B6D4'
    },
    {
      id: 7,
      company: 'Services & Co',
      sector: 'pme',
      logo: '🔧',
      size: '50-80 employés',
      location: 'Toulouse, France',
      industry: 'Services aux entreprises',
      challenge: 'Pas de RH dédié, le dirigeant gérait tout manuellement (Excel + emails)',
      solution: 'ATS clé en main + Onboarding 1h + Support réactif',
      results: [
        { metric: '90%', label: 'Temps économisé' },
        { metric: '1 seul', label: 'Outil centralisé' },
        { metric: '0€', label: 'Formation nécessaire' }
      ],
      quote: 'Enfin un outil simple et puissant ! Plus besoin d\'Excel, tout est centralisé. Prise en main immédiate.',
      author: 'Lucie Bernard',
      role: 'Dirigeante',
      featured: false,
      color: '#F43F5E'
    },

    // RETAIL
    {
      id: 8,
      company: 'FashionRetail Group',
      sector: 'retail',
      logo: '👗',
      size: '500+ employés',
      location: 'Marseille, France',
      industry: 'Retail Mode',
      challenge: 'Recrutement saisonnier massif (100+ vendeurs/an) avec fort turnover',
      solution: 'Campagnes de recrutement + Vivier de talents + Réembauche rapide',
      results: [
        { metric: '100+', label: 'Recrutements saisonniers' },
        { metric: '-50%', label: 'Coût par embauche' },
        { metric: '7 jours', label: 'Délai moyen' }
      ],
      quote: 'Le vivier de talents nous permet de réembaucher nos saisonniers en 1 clic. Gestion des pics simplifiée !',
      author: 'Nathalie Girard',
      role: 'Directrice RH',
      featured: true,
      color: '#EF4444'
    }
  ];

  // Filtrage par secteur
  const filteredCases = caseStudies.filter(caseStudy => {
    return activeSector === 'all' || caseStudy.sector === activeSector;
  });

  const featuredCases = filteredCases.filter(c => c.featured);
  const regularCases = filteredCases.filter(c => !c.featured);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': 'Cas Clients ATS Ultimate',
    'description': 'Success stories et témoignages clients',
    'url': 'https://ats-ultimate.com/case-studies'
  };

  return (
    <div>
      <SEO
        title="Cas Clients - ATS Ultimate"
        description="Découvrez comment TechCorp, Executive Search Partners et +50 entreprises ont transformé leur recrutement avec ATS Ultimate. Success stories et ROI mesurable."
        url="https://ats-ultimate.com/case-studies"
        structuredData={structuredData}
      />

      <Navbar />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>🏆 Ils Recrutent avec ATS Ultimate</h1>
          <p className={styles.subtitle}>
            Découvrez comment <strong>+50 entreprises</strong> ont transformé leur recrutement
            <br />
            avec des résultats mesurables et un ROI prouvé
          </p>

          {/* Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>+50</div>
              <div className={styles.statLabel}>Entreprises clientes</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>-65%</div>
              <div className={styles.statLabel}>Temps de recrutement</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>4.8/5</div>
              <div className={styles.statLabel}>Satisfaction moyenne</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>10 000+</div>
              <div className={styles.statLabel}>Recrutements réalisés</div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.sectors}>
            {sectors.map(sector => (
              <button
                key={sector.id}
                className={`${styles.sectorButton} ${activeSector === sector.id ? styles.active : ''}`}
                onClick={() => setActiveSector(sector.id)}>
                {sector.label} ({sector.count})
              </button>
            ))}
          </div>
        </div>

        {/* Featured Cases */}
        {featuredCases.length > 0 && (
          <div className={styles.featuredSection}>
            <h2 className={styles.sectionTitle}>⭐ Success Stories à la une</h2>
            <div className={styles.featuredGrid}>
              {featuredCases.map(caseStudy => (
                <div
                  key={caseStudy.id}
                  className={styles.featuredCase}
                  style={{ borderLeftColor: caseStudy.color }}>
                  <div className={styles.featuredBadge}>Success Story</div>

                  <div className={styles.caseHeader}>
                    <div className={styles.caseLogo}>{caseStudy.logo}</div>
                    <div className={styles.caseInfo}>
                      <h3 className={styles.caseName}>{caseStudy.company}</h3>
                      <div className={styles.caseMeta}>
                        <span>📍 {caseStudy.location}</span>
                        <span>👥 {caseStudy.size}</span>
                        <span>🏢 {caseStudy.industry}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.caseSection}>
                    <h4 className={styles.caseSubtitle}>❗ Problématique</h4>
                    <p className={styles.caseText}>{caseStudy.challenge}</p>
                  </div>

                  <div className={styles.caseSection}>
                    <h4 className={styles.caseSubtitle}>✅ Solution</h4>
                    <p className={styles.caseText}>{caseStudy.solution}</p>
                  </div>

                  <div className={styles.resultsGrid}>
                    {caseStudy.results.map((result, i) => (
                      <div key={i} className={styles.resultCard}>
                        <div className={styles.resultMetric} style={{ color: caseStudy.color }}>
                          {result.metric}
                        </div>
                        <div className={styles.resultLabel}>{result.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.quote}>
                    <div className={styles.quoteText}>"{caseStudy.quote}"</div>
                    <div className={styles.quoteAuthor}>
                      <strong>{caseStudy.author}</strong>, {caseStudy.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Cases */}
        {regularCases.length > 0 && (
          <div className={styles.casesSection}>
            {featuredCases.length > 0 && (
              <h2 className={styles.sectionTitle}>📊 Autres Success Stories</h2>
            )}
            <div className={styles.casesGrid}>
              {regularCases.map(caseStudy => (
                <div
                  key={caseStudy.id}
                  className={styles.caseCard}
                  style={{ borderTopColor: caseStudy.color }}>

                  <div className={styles.caseHeader}>
                    <div className={styles.caseLogo}>{caseStudy.logo}</div>
                    <div className={styles.caseInfo}>
                      <h3 className={styles.caseName}>{caseStudy.company}</h3>
                      <div className={styles.caseMeta}>
                        <span>{caseStudy.industry}</span>
                        <span>{caseStudy.size}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.caseChallenge}>
                    <strong>Défi :</strong> {caseStudy.challenge}
                  </div>

                  <div className={styles.resultsCompact}>
                    {caseStudy.results.map((result, i) => (
                      <div key={i} className={styles.resultCompact}>
                        <span className={styles.resultMetricCompact} style={{ color: caseStudy.color }}>
                          {result.metric}
                        </span>
                        <span className={styles.resultLabelCompact}>{result.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.quoteCompact}>
                    "{caseStudy.quote}"
                  </div>
                  <div className={styles.quoteAuthorCompact}>
                    — {caseStudy.author}, {caseStudy.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className={styles.ctaSection}>
          <h2>🚀 Prêt à transformer votre recrutement ?</h2>
          <p>
            Rejoignez +50 entreprises qui recrutent déjà 10x plus vite avec ATS Ultimate.
            <br />
            Essai gratuit 14 jours, sans carte bancaire.
          </p>
          <div className={styles.ctaButtons}>
            <button
              className={styles.ctaPrimary}
              onClick={() => navigate(ROUTES.PRICING)}>
              🎯 Voir les tarifs
            </button>
            <button
              className={styles.ctaSecondary}
              onClick={() => navigate(ROUTES.CONTACT)}>
              💬 Demander une démo
            </button>
          </div>
        </div>
      </div>

      <Footer variant="light" />
    </div>
  );
}

export default CaseStudiesPage;
