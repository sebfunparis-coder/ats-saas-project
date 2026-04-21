import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { Navbar, PricingCard, Footer } from '@/shared/components/Marketing';
import { ToggleSwitch } from '@/shared/components/UI';
import { SEO } from '@/shared/components/SEO';
import styles from './PricingPage.module.css';

/**
 * Page Pricing - Présentation des tarifs
 * Utilise CSS Modules pour un design responsive et maintenable
 * Toggle mensuel/annuel avec économies affichées
 * SEO optimisé avec structured data
 */
export function PricingPage() {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': 'ATS Ultimate',
    'offers': [
      {
        '@type': 'Offer',
        'name': 'Starter',
        'price': '99',
        'priceCurrency': 'EUR',
        'priceValidUntil': '2026-12-31'
      },
      {
        '@type': 'Offer',
        'name': 'Professional',
        'price': '299',
        'priceCurrency': 'EUR',
        'priceValidUntil': '2026-12-31'
      }
    ]
  };

  // Prix mensuels de base
  const basePrices = {
    starter: 99,
    professional: 299,
    enterprise: null // Sur mesure
  };

  // Calcul prix avec réduction annuelle (-20%)
  const getPrice = (planType) => {
    const basePrice = basePrices[planType];
    if (!basePrice) return 'Sur mesure';

    if (isYearly) {
      const yearlyPrice = Math.round(basePrice * 12 * 0.8); // -20% sur l'année
      const monthlyEquivalent = Math.round(yearlyPrice / 12);
      return `${monthlyEquivalent}€`;
    }
    return `${basePrice}€`;
  };

  const getPeriod = () => {
    return isYearly ? '/mois (facturé annuellement)' : '/mois';
  };

  const getSavings = (planType) => {
    const basePrice = basePrices[planType];
    if (!basePrice || !isYearly) return null;

    const yearlySavings = Math.round(basePrice * 12 * 0.2); // 20% d'économie
    return `Économisez ${yearlySavings}€/an`;
  };

  const plans = [
    {
      name: 'Starter',
      price: getPrice('starter'),
      period: getPeriod(),
      savings: getSavings('starter'),
      popular: false,
      features: [
        '✓ 10 missions actives',
        '✓ 100 candidats',
        '✓ Pipeline Kanban',
        '✓ CVthèque basique',
        '✓ Support email'
      ]
    },
    {
      name: 'Professional',
      price: getPrice('professional'),
      period: getPeriod(),
      savings: getSavings('professional'),
      popular: true,
      features: [
        '✓ Missions illimitées',
        '✓ Candidats illimités',
        '✓ IA Scoring avancé',
        '✓ Analytics complets',
        '✓ Intégrations',
        '✓ Support prioritaire'
      ]
    },
    {
      name: 'Enterprise',
      price: 'Sur mesure',
      period: '',
      savings: null,
      popular: false,
      features: [
        '✓ Tout Professional',
        '✓ API complète',
        '✓ SSO/SAML',
        '✓ SLA garanti',
        '✓ Account manager dédié',
        '✓ Formation équipe'
      ]
    }
  ];

  return (
    <div>
      <SEO
        title="Tarifs - ATS Ultimate"
        description="Tarifs transparents pour ATS Ultimate. Starter à 99€/mois, Professional à 299€/mois. Économisez 20% avec la facturation annuelle. Essai gratuit 14 jours."
        url="https://ats-ultimate.com/pricing"
        structuredData={structuredData}
      />

      {/* NavBar */}
      <Navbar activePage="pricing" />

      {/* Content */}
      <section className={styles.mainSection}>
        <div className={styles.container}>

          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>💎 Tarifs Transparents</h1>
            <p className={styles.subtitle}>Choisissez la formule parfaite pour votre équipe</p>

            {/* Toggle Mensuel/Annuel */}
            <div className={styles.toggleContainer}>
              <ToggleSwitch
                checked={isYearly}
                onChange={setIsYearly}
                leftLabel="Mensuel"
                rightLabel="Annuel"
                size="large"
              />
              {isYearly && (
                <span className={styles.savingsBadge}>
                  ✨ Économisez 20%
                </span>
              )}
            </div>
          </div>

          {/* Plans Grid */}
          <div className={styles.plansGrid}>
            {plans.map((plan, i) => (
              <PricingCard
                key={i}
                name={plan.name}
                price={plan.price}
                period={plan.period}
                savings={plan.savings}
                popular={plan.popular}
                features={plan.features}
                ctaText="Commencer"
                variant="dark"
              />
            ))}
          </div>

          {/* CTA */}
          <div className={styles.ctaSection}>
            <p className={styles.ctaText}>
              💡 Besoin d'un devis personnalisé ? Contactez notre équipe commerciale
            </p>
            <button
              onClick={() => navigate(ROUTES.CONTACT)}
              className={styles.ctaButton}
              aria-label="Contacter l'équipe commerciale"
            >
              💬 Nous Contacter
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}

export default PricingPage;
