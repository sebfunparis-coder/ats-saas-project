import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { Navbar, Footer } from '@/shared/components/Marketing';
import { SEO } from '@/shared/components/SEO';
import styles from './IntegrationsPage.module.css';

/**
 * Page Intégrations - Showcase des 30+ connecteurs
 * Catégories : Job Boards, Email, Calendrier, Communication, CRM, Productivité
 */
export function IntegrationsPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: '🌟 Toutes', count: 32 },
    { id: 'jobboards', label: '💼 Job Boards', count: 8 },
    { id: 'email', label: '✉️ Email', count: 4 },
    { id: 'calendar', label: '📅 Calendrier', count: 3 },
    { id: 'communication', label: '💬 Communication', count: 5 },
    { id: 'crm', label: '🎯 CRM', count: 6 },
    { id: 'productivity', label: '⚡ Productivité', count: 6 }
  ];

  const integrations = [
    // JOB BOARDS
    { name: 'LinkedIn', category: 'jobboards', logo: '🔵', description: 'Publiez vos offres et importez des candidats LinkedIn', popular: true },
    { name: 'Indeed', category: 'jobboards', logo: '🔷', description: 'Diffusion automatique sur le #1 mondial des job boards', popular: true },
    { name: 'Pôle Emploi', category: 'jobboards', logo: '🇫🇷', description: 'Publication directe sur Pôle Emploi France', popular: true },
    { name: 'Monster', category: 'jobboards', logo: '👾', description: 'Intégration avec Monster pour maximiser votre portée' },
    { name: 'Glassdoor', category: 'jobboards', logo: '🏢', description: 'Publiez et gérez votre marque employeur' },
    { name: 'Welcome to the Jungle', category: 'jobboards', logo: '🌴', description: 'Intégration complète avec WTTJ' },
    { name: 'RemixJobs', category: 'jobboards', logo: '🎵', description: 'Job board tech français' },
    { name: 'APEC', category: 'jobboards', logo: '👔', description: 'Cadres et jeunes diplômés' },

    // EMAIL
    { name: 'Gmail', category: 'email', logo: '📧', description: 'Synchronisation bidirectionnelle emails Gmail', popular: true },
    { name: 'Outlook', category: 'email', logo: '📨', description: 'Intégration Microsoft Outlook/Office 365', popular: true },
    { name: 'SendGrid', category: 'email', logo: '📬', description: 'Envoi d\'emails en masse avec tracking' },
    { name: 'Mailchimp', category: 'email', logo: '🐵', description: 'Campagnes email automatisées' },

    // CALENDAR
    { name: 'Google Calendar', category: 'calendar', logo: '📅', description: 'Synchronisation automatique des entretiens', popular: true },
    { name: 'Outlook Calendar', category: 'calendar', logo: '🗓️', description: 'Intégration Microsoft Calendar' },
    { name: 'Calendly', category: 'calendar', logo: '🕐', description: 'Planification automatique des entretiens' },

    // COMMUNICATION
    { name: 'Slack', category: 'communication', logo: '💬', description: 'Notifications temps réel dans Slack', popular: true },
    { name: 'Microsoft Teams', category: 'communication', logo: '👥', description: 'Collaboration équipe via Teams', popular: true },
    { name: 'Discord', category: 'communication', logo: '🎮', description: 'Notifications Discord pour équipes tech' },
    { name: 'WhatsApp Business', category: 'communication', logo: '💚', description: 'Communication candidats via WhatsApp' },
    { name: 'Zoom', category: 'communication', logo: '🎥', description: 'Visioconférences entretiens intégrées' },

    // CRM
    { name: 'Salesforce', category: 'crm', logo: '☁️', description: 'Synchronisation bidirectionnelle Salesforce', popular: true },
    { name: 'HubSpot', category: 'crm', logo: '🟠', description: 'Intégration CRM HubSpot complète' },
    { name: 'Pipedrive', category: 'crm', logo: '🔵', description: 'Pipeline de vente synchronisé' },
    { name: 'Zoho CRM', category: 'crm', logo: '🔶', description: 'Gestion relation client Zoho' },
    { name: 'Monday.com', category: 'crm', logo: '🎨', description: 'Workflow management Monday' },
    { name: 'Airtable', category: 'crm', logo: '📊', description: 'Base de données flexible' },

    // PRODUCTIVITY
    { name: 'Zapier', category: 'productivity', logo: '⚡', description: 'Automatisation avec 5000+ apps', popular: true },
    { name: 'Make (Integromat)', category: 'productivity', logo: '🔄', description: 'Scénarios d\'automatisation avancés' },
    { name: 'Notion', category: 'productivity', logo: '📝', description: 'Documentation et knowledge base' },
    { name: 'Trello', category: 'productivity', logo: '📋', description: 'Gestion de tâches visuelles' },
    { name: 'Asana', category: 'productivity', logo: '🎯', description: 'Project management intégré' },
    { name: 'Google Drive', category: 'productivity', logo: '📁', description: 'Stockage et partage de documents' }
  ];

  // Filtrage
  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = activeCategory === 'all' || integration.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'ATS Ultimate',
    'featureList': integrations.slice(0, 10).map(i => i.name).join(', ')
  };

  return (
    <div>
      <SEO
        title="Intégrations - ATS Ultimate"
        description="Plus de 30 intégrations natives : LinkedIn, Indeed, Gmail, Slack, Salesforce, Zapier et bien plus. Connectez ATS Ultimate à tous vos outils préférés."
        url="https://ats-ultimate.com/integrations"
        structuredData={structuredData}
      />

      <Navbar />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>🔌 Intégrations Natives</h1>
          <p className={styles.subtitle}>
            Connectez ATS Ultimate à plus de <strong>30 outils</strong> que vous utilisez déjà
          </p>

          {/* Search */}
          <div className={styles.searchContainer}>
            <label htmlFor="integration-search" className="sr-only">
              Rechercher une intégration
            </label>
            <input
              id="integration-search"
              type="search"
              placeholder="🔍 Rechercher une intégration..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Rechercher parmi les intégrations disponibles"
            />
          </div>

          {/* Categories */}
          <div className={styles.categories} role="group" aria-label="Filtrer par catégorie">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`${styles.categoryButton} ${activeCategory === cat.id ? styles.active : ''}`}
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={activeCategory === cat.id}
                aria-label={`Filtrer par ${cat.label} - ${cat.count} intégrations`}>
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* Integrations Grid */}
        <div
          className={styles.grid}
          role="list"
          aria-label={`${filteredIntegrations.length} intégrations disponibles`}>
          {filteredIntegrations.map((integration, i) => (
            <article
              key={i}
              className={`${styles.integrationCard} ${integration.popular ? styles.popular : ''}`}
              role="listitem"
              aria-label={`Intégration ${integration.name}`}>
              {integration.popular && (
                <div className={styles.popularBadge} aria-label="Intégration populaire">⭐ Populaire</div>
              )}
              <div className={styles.logo} aria-hidden="true">{integration.logo}</div>
              <h3 className={styles.name}>{integration.name}</h3>
              <p className={styles.description}>{integration.description}</p>
              <button
                className={styles.connectButton}
                aria-label={`Connecter l'intégration ${integration.name}`}>
                🔗 Connecter
              </button>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredIntegrations.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <h3>Aucune intégration trouvée</h3>
            <p>Essayez avec d'autres mots-clés</p>
            <button
              className={styles.resetButton}
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              aria-label="Réinitialiser les filtres de recherche">
              Réinitialiser
            </button>
          </div>
        )}

        {/* CTA API */}
        <div className={styles.apiCTA}>
          <h2>🚀 Besoin d'une intégration sur mesure ?</h2>
          <p>
            Notre API REST complète vous permet de connecter ATS Ultimate à n'importe quel outil.
            <br />
            Documentation complète, webhooks, authentification OAuth 2.0.
          </p>
          <button
            className={styles.ctaButton}
            onClick={() => navigate(ROUTES.CONTACT)}>
            📚 Accéder à la documentation API
          </button>
        </div>
      </div>

      <Footer variant="light" />
    </div>
  );
}

export default IntegrationsPage;
