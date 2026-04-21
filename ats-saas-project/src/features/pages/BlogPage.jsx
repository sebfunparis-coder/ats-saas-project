import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { Navbar, Footer } from '@/shared/components/Marketing';
import { SEO } from '@/shared/components/SEO';
import styles from './BlogPage.module.css';

/**
 * Page Blog - Articles sur le recrutement, l'IA, et les RH
 * Catégories : Tous, Recrutement, IA, RH, Guides, Actualités
 */
export function BlogPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: '📚 Tous les articles', count: 12 },
    { id: 'recrutement', label: '💼 Recrutement', count: 4 },
    { id: 'ia', label: '🤖 Intelligence Artificielle', count: 3 },
    { id: 'rh', label: '👥 Ressources Humaines', count: 2 },
    { id: 'guides', label: '📖 Guides Pratiques', count: 2 },
    { id: 'actualites', label: '📰 Actualités', count: 1 }
  ];

  const articles = [
    // RECRUTEMENT
    {
      id: 1,
      title: '10 astuces pour attirer les meilleurs talents en 2026',
      category: 'recrutement',
      excerpt: 'Découvrez les stratégies gagnantes pour attirer et recruter les meilleurs profils dans un marché ultra-compétitif.',
      author: 'Marie Dubois',
      date: '2026-02-15',
      readTime: '8 min',
      image: '📊',
      featured: true
    },
    {
      id: 2,
      title: 'Comment réduire de 50% votre temps de recrutement',
      category: 'recrutement',
      excerpt: 'Les techniques et outils modernes pour accélérer drastiquement vos processus de recrutement sans sacrifier la qualité.',
      author: 'Thomas Martin',
      date: '2026-02-10',
      readTime: '6 min',
      image: '⚡',
      featured: false
    },
    {
      id: 3,
      title: 'Le recrutement mobile : pourquoi c\'est incontournable',
      category: 'recrutement',
      excerpt: '72% des candidats utilisent leur smartphone pour chercher un emploi. Adaptez-vous ou perdez des talents.',
      author: 'Sophie Laurent',
      date: '2026-02-05',
      readTime: '5 min',
      image: '📱',
      featured: false
    },
    {
      id: 4,
      title: 'Onboarding digital : guide complet 2026',
      category: 'recrutement',
      excerpt: 'Automatisez et optimisez l\'intégration de vos nouvelles recrues avec les meilleures pratiques du moment.',
      author: 'Pierre Rousseau',
      date: '2026-01-28',
      readTime: '10 min',
      image: '🚀',
      featured: false
    },

    // INTELLIGENCE ARTIFICIELLE
    {
      id: 5,
      title: 'L\'IA dans le recrutement : mythes vs réalité',
      category: 'ia',
      excerpt: 'Démêlons le vrai du faux : ce que l\'IA peut vraiment faire pour votre recrutement et ce qui relève du fantasme.',
      author: 'Dr. Antoine Leroy',
      date: '2026-02-12',
      readTime: '12 min',
      image: '🤖',
      featured: true
    },
    {
      id: 6,
      title: 'Comment fonctionne le scoring IA des CV ?',
      category: 'ia',
      excerpt: 'Plongez dans les algorithmes de matching CV-offre et comprenez comment l\'IA analyse les candidatures.',
      author: 'Claire Fontaine',
      date: '2026-02-08',
      readTime: '9 min',
      image: '🧠',
      featured: false
    },
    {
      id: 7,
      title: 'Éthique et IA : recruter sans discriminer',
      category: 'ia',
      excerpt: 'Les biais algorithmiques existent. Voici comment les identifier, les mesurer et les éliminer de vos process.',
      author: 'Dr. Antoine Leroy',
      date: '2026-01-25',
      readTime: '11 min',
      image: '⚖️',
      featured: false
    },

    // RESSOURCES HUMAINES
    {
      id: 8,
      title: 'Marque employeur : 7 stratégies qui marchent',
      category: 'rh',
      excerpt: 'Construisez une marque employeur attractive qui fait venir les talents à vous plutôt que l\'inverse.',
      author: 'Isabelle Moreau',
      date: '2026-02-06',
      readTime: '7 min',
      image: '🌟',
      featured: false
    },
    {
      id: 9,
      title: 'Télétravail et recrutement : les nouvelles règles',
      category: 'rh',
      excerpt: 'Comment adapter vos processus de recrutement à l\'ère du travail hybride et des équipes distribuées.',
      author: 'Marc Benoit',
      date: '2026-01-30',
      readTime: '8 min',
      image: '🏡',
      featured: false
    },

    // GUIDES PRATIQUES
    {
      id: 10,
      title: 'Guide : Créer une fiche de poste parfaite',
      category: 'guides',
      excerpt: 'Template et conseils pour rédiger des offres d\'emploi qui attirent 3x plus de candidats qualifiés.',
      author: 'Sophie Laurent',
      date: '2026-02-03',
      readTime: '15 min',
      image: '📝',
      featured: false
    },
    {
      id: 11,
      title: 'Checklist : Mener un entretien d\'embauche efficace',
      category: 'guides',
      excerpt: 'Les 25 questions à poser et la méthodologie pour évaluer objectivement vos candidats.',
      author: 'Thomas Martin',
      date: '2026-01-20',
      readTime: '13 min',
      image: '✅',
      featured: false
    },

    // ACTUALITÉS
    {
      id: 12,
      title: 'ATS Ultimate lance l\'intégration Pôle Emploi',
      category: 'actualites',
      excerpt: 'Publiez vos offres automatiquement sur Pôle Emploi et importez les candidatures en 1 clic. Disponible maintenant.',
      author: 'Équipe ATS Ultimate',
      date: '2026-02-14',
      readTime: '3 min',
      image: '🎉',
      featured: true
    }
  ];

  // Filtrage
  const filteredArticles = articles.filter(article => {
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Articles featured
  const featuredArticles = filteredArticles.filter(a => a.featured);
  const regularArticles = filteredArticles.filter(a => !a.featured);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    'name': 'ATS Ultimate Blog',
    'description': 'Articles sur le recrutement, l\'IA et les RH',
    'url': 'https://ats-ultimate.com/blog',
    'blogPost': filteredArticles.slice(0, 5).map(article => ({
      '@type': 'BlogPosting',
      'headline': article.title,
      'description': article.excerpt,
      'author': {
        '@type': 'Person',
        'name': article.author
      },
      'datePublished': article.date,
      'timeRequired': article.readTime
    }))
  };

  const handleArticleClick = (articleId) => {
    // TODO: Navigation vers article détaillé
    console.log('Navigate to article:', articleId);
  };

  return (
    <div>
      <SEO
        title="Blog - ATS Ultimate"
        description="Conseils, guides et actualités sur le recrutement, l'intelligence artificielle et les ressources humaines. Expertise RH et tech."
        url="https://ats-ultimate.com/blog"
        structuredData={structuredData}
      />

      <Navbar />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>📚 Blog ATS Ultimate</h1>
          <p className={styles.subtitle}>
            Conseils, guides et actualités pour <strong>recruter mieux</strong> et <strong>plus vite</strong>
          </p>

          {/* Search */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="🔍 Rechercher un article..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categories */}
          <div className={styles.categories}>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`${styles.categoryButton} ${activeCategory === cat.id ? styles.active : ''}`}
                onClick={() => setActiveCategory(cat.id)}>
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && activeCategory === 'all' && searchQuery === '' && (
          <div className={styles.featuredSection}>
            <h2 className={styles.sectionTitle}>⭐ Articles à la une</h2>
            <div className={styles.featuredGrid}>
              {featuredArticles.map(article => (
                <div
                  key={article.id}
                  className={styles.featuredCard}
                  onClick={() => handleArticleClick(article.id)}>
                  <div className={styles.featuredBadge}>À la une</div>
                  <div className={styles.featuredImage}>{article.image}</div>
                  <div className={styles.featuredContent}>
                    <div className={styles.featuredCategory}>
                      {categories.find(c => c.id === article.category)?.label}
                    </div>
                    <h3 className={styles.featuredTitle}>{article.title}</h3>
                    <p className={styles.featuredExcerpt}>{article.excerpt}</p>
                    <div className={styles.featuredMeta}>
                      <span className={styles.author}>👤 {article.author}</span>
                      <span className={styles.date}>📅 {new Date(article.date).toLocaleDateString('fr-FR')}</span>
                      <span className={styles.readTime}>⏱️ {article.readTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Articles Grid */}
        {regularArticles.length > 0 && (
          <div className={styles.articlesSection}>
            {(featuredArticles.length > 0 && activeCategory === 'all' && searchQuery === '') && (
              <h2 className={styles.sectionTitle}>📖 Tous les articles</h2>
            )}
            <div className={styles.articlesGrid}>
              {regularArticles.map(article => (
                <div
                  key={article.id}
                  className={styles.articleCard}
                  onClick={() => handleArticleClick(article.id)}>
                  <div className={styles.articleImage}>{article.image}</div>
                  <div className={styles.articleContent}>
                    <div className={styles.articleCategory}>
                      {categories.find(c => c.id === article.category)?.label}
                    </div>
                    <h3 className={styles.articleTitle}>{article.title}</h3>
                    <p className={styles.articleExcerpt}>{article.excerpt}</p>
                    <div className={styles.articleMeta}>
                      <span className={styles.author}>👤 {article.author}</span>
                      <span className={styles.readTime}>⏱️ {article.readTime}</span>
                    </div>
                    <div className={styles.articleDate}>
                      📅 {new Date(article.date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <h3>Aucun article trouvé</h3>
            <p>Essayez avec d'autres mots-clés ou catégories</p>
            <button
              className={styles.resetButton}
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}>
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className={styles.newsletterCTA}>
          <h2>📬 Recevez nos meilleurs articles par email</h2>
          <p>
            Rejoignez 5000+ professionnels RH qui reçoivent chaque semaine nos conseils exclusifs.
            <br />
            Gratuit, sans spam, désinscription en 1 clic.
          </p>
          <div className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="votre.email@entreprise.com"
              className={styles.newsletterInput}
            />
            <button className={styles.newsletterButton}>
              S'abonner
            </button>
          </div>
          <p className={styles.newsletterDisclaimer}>
            🔒 Vos données sont protégées. Conforme RGPD.
          </p>
        </div>
      </div>

      <Footer variant="light" />
    </div>
  );
}

export default BlogPage;
