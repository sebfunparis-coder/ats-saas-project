import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { Navbar, PricingCard, Footer } from '@/shared/components/Marketing';
import { ToggleSwitch } from '@/shared/components/UI';
import { SEO } from '@/shared/components/SEO';
import { PLAN_PRICING } from '@/config/constants';
import styles from './PricingPage.module.css';

const formatPrice = (n) => n.toFixed(2).replace('.', ',');

/**
 * Page Pricing - Présentation des tarifs
 * Utilise CSS Modules pour un design responsive et maintenable
 * Toggle mensuel/annuel (annuel affiché par défaut) avec économies affichées
 * SEO optimisé avec structured data
 */
export function PricingPage() {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(true);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': 'ATS Ultimate',
    'offers': [
      { '@type': 'Offer', 'name': 'Ultimate Solo', 'price': PLAN_PRICING.solo.monthly.toFixed(2), 'priceCurrency': 'EUR', 'priceValidUntil': '2026-12-31' },
      { '@type': 'Offer', 'name': 'Ultimate Manager', 'price': PLAN_PRICING.team_3.monthly.toFixed(2), 'priceCurrency': 'EUR', 'priceValidUntil': '2026-12-31' },
      { '@type': 'Offer', 'name': 'Ultimate Director', 'price': PLAN_PRICING.team_6.monthly.toFixed(2), 'priceCurrency': 'EUR', 'priceValidUntil': '2026-12-31' },
    ]
  };

  const getPrice = (planKey) => {
    const pricing = PLAN_PRICING[planKey];
    const value = isYearly ? pricing.annualMonthly : pricing.monthly;
    return `${formatPrice(value)}€`;
  };

  const getSavings = (planKey) => {
    if (!isYearly) return null;
    const { annualTotal } = PLAN_PRICING[planKey];
    return `Facturé ${formatPrice(annualTotal)}€/an`;
  };

  const plans = [
    {
      key: 'solo',
      name: 'Ultimate Solo',
      savings: getSavings('solo'),
      popular: false,
      features: [
        '✓ Missions, candidats et pipeline illimités',
        '✓ Pipeline Kanban 6 colonnes',
        '✓ CVthèque intelligente + recherche',
        '✓ Calendrier et gestion clients',
        '✓ Portail carrières public',
        '✓ Analytics complets',
        '✓ RGPD : consentements + export',
        '✓ 1 utilisateur',
        '✓ Support email'
      ]
    },
    {
      key: 'team_3',
      name: 'Ultimate Manager',
      savings: getSavings('team_3'),
      popular: true,
      features: [
        '✓ Missions, candidats et pipeline illimités',
        '✓ Pipeline Kanban 6 colonnes',
        '✓ CVthèque intelligente + recherche',
        '✓ Calendrier et gestion clients',
        '✓ Portail carrières public',
        '✓ Analytics complets',
        '✓ RGPD : consentements + export',
        '✓ Onglet Équipe — jusqu\'à 3 recruteurs',
        '✓ Assignation missions et candidats',
        '✓ Rôles et permissions par recruteur',
        '✓ Vue globale de la company',
        '✓ Charge de travail par recruteur',
        '✓ Support prioritaire'
      ]
    },
    {
      key: 'team_6',
      name: 'Ultimate Director',
      savings: getSavings('team_6'),
      popular: false,
      features: [
        '✓ Missions, candidats et pipeline illimités',
        '✓ Pipeline Kanban 6 colonnes',
        '✓ CVthèque intelligente + recherche',
        '✓ Calendrier et gestion clients',
        '✓ Portail carrières public',
        '✓ Analytics complets',
        '✓ RGPD : consentements + export',
        '✓ Onglet Équipe — jusqu\'à 6 recruteurs',
        '✓ Assignation missions et candidats',
        '✓ Rôles et permissions par recruteur',
        '✓ Vue globale de la company',
        '✓ Charge de travail par recruteur',
        '✓ Support prioritaire',
        '✓ Idéal cabinet de recrutement / agence',
        '✓ Account manager dédié'
      ]
    }
  ];

  return (
    <div>
      <SEO
        title="Tarifs - ATS Ultimate"
        description="Tarifs transparents pour ATS Ultimate. Ultimate Solo à 29,90€/mois, Ultimate Manager à partir de 69,90€/mois. Économisez avec l'engagement annuel."
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
                  ✨ Économisez avec l'engagement annuel
                </span>
              )}
            </div>
          </div>

          {/* Plans Grid */}
          <div className={styles.plansGrid}>
            {plans.map((plan) => (
              <PricingCard
                key={plan.key}
                name={plan.name}
                savings={plan.savings}
                popular={plan.popular}
                features={plan.features}
                ctaText={`Formule à ${getPrice(plan.key)}/mois`}
                onCTAClick={() => {
                  // T-299 — Stripe Checkout si VITE_STRIPE_*_PRICE_ID configuré
                  // sinon redirige vers /register avec le plan pré-sélectionné
                  const stripeKeyByPlan = {
                    solo: import.meta.env.VITE_STRIPE_SOLO_PRICE_ID,
                    team_3: import.meta.env.VITE_STRIPE_TEAM3_PRICE_ID,
                    team_6: import.meta.env.VITE_STRIPE_TEAM6_PRICE_ID,
                  };
                  const stripeKey = stripeKeyByPlan[plan.key];
                  if (stripeKey) {
                    window.location.href = `https://buy.stripe.com/${stripeKey}`;
                  } else {
                    navigate(`${ROUTES.REGISTER}?plan=${plan.key}`);
                  }
                }}
                variant="dark"
              />
            ))}
          </div>

          {/* CTA — demande de démo (pas d'essai gratuit, offres payantes uniquement) */}
          <div className={styles.ctaSection}>
            <p className={styles.ctaText}>
              🎥 Vous préférez voir la plateforme en action avant de vous engager ?
            </p>
            <button
              onClick={() => navigate(`${ROUTES.CONTACT}?sujet=demo`)}
              className={styles.ctaButton}
              aria-label="Demander une démo"
            >
              🎥 Demander une démo
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
