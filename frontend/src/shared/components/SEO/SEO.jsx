import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Component - Gestion centralisée des meta tags
 *
 * @param {Object} props
 * @param {string} props.title - Titre de la page
 * @param {string} props.description - Description de la page
 * @param {string} props.image - URL de l'image Open Graph
 * @param {string} props.url - URL canonique de la page
 * @param {string} props.type - Type de page (website, article, etc.)
 * @param {Object} props.structuredData - Données structurées JSON-LD
 */
export function SEO({
  title = 'ATS Ultimate - Recrutez 10x plus vite avec l\'IA',
  description = 'Plateforme ATS #1 en France. Intelligence artificielle, Pipeline Kanban, CVthèque intelligente. Automatisez votre recrutement. Sans engagement.',
  image = 'https://ats-ultimate.com/og-image.png',
  url = 'https://ats-ultimate.com',
  type = 'website',
  structuredData = null
}) {
  const fullTitle = title.includes('ATS Ultimate') ? title : `${title} | ATS Ultimate`;

  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'ATS Ultimate',
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'Web',
    'offers': {
      '@type': 'Offer',
      'price': '99',
      'priceCurrency': 'EUR',
      'priceValidUntil': '2026-12-31'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'reviewCount': '247'
    },
    'description': description
  };

  const jsonLd = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Titre */}
      <title>{fullTitle}</title>
      <meta property="og:title" content={fullTitle} />
      <meta name="twitter:title" content={fullTitle} />

      {/* Description */}
      <meta name="description" content={description} />
      <meta property="og:description" content={description} />
      <meta name="twitter:description" content={description} />

      {/* URL Canonique */}
      <link rel="canonical" href={url} />
      <meta property="og:url" content={url} />

      {/* Type */}
      <meta property="og:type" content={type} />

      {/* Image */}
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={image} />

      {/* Autres meta tags */}
      <meta property="og:site_name" content="ATS Ultimate" />
      <meta property="og:locale" content="fr_FR" />
      <meta name="twitter:site" content="@atsultimate" />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
}

export default SEO;
