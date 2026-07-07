import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { PLAN_PRICING } from '@/config/constants';

const fmt = (n) => n.toFixed(2).replace('.', ',');

const PLANS = [
  {
    id: 'solo',
    name: 'Solo',
    price: fmt(PLAN_PRICING.solo.monthly),
    annualNote: `ou ${fmt(PLAN_PRICING.solo.annualMonthly)}€/mois avec engagement annuel`,
    period: 'mois',
    color: '#667EEA',
    features: [
      '✅ Missions, candidats et pipeline illimités',
      '✅ CVthèque intelligente',
      '✅ Calendrier et gestion clients',
      '✅ Analytics complets',
      '✅ 1 utilisateur',
      '❌ Onglet Équipe'
    ]
  },
  {
    id: 'team_3',
    name: 'Manager · 3 postes',
    price: fmt(PLAN_PRICING.team_3.monthly),
    annualNote: `ou ${fmt(PLAN_PRICING.team_3.annualMonthly)}€/mois avec engagement annuel`,
    period: 'mois',
    color: '#10B981',
    features: [
      '✅ Tout le plan Solo',
      '✅ Onglet Équipe — jusqu\'à 3 recruteurs',
      '✅ Assignation missions et candidats',
      '✅ Rôles et permissions par recruteur',
      '✅ Support prioritaire'
    ]
  },
  {
    id: 'team_6',
    name: 'Manager · 6 postes',
    price: fmt(PLAN_PRICING.team_6.monthly),
    annualNote: `ou ${fmt(PLAN_PRICING.team_6.annualMonthly)}€/mois avec engagement annuel`,
    period: 'mois',
    color: '#F59E0B',
    popular: true,
    features: [
      '✅ Tout le plan Manager 3 postes',
      '✅ Jusqu\'à 6 recruteurs',
      '✅ Idéal cabinet de recrutement / agence',
      '✅ Account manager dédié'
    ]
  }
];

export function PlanSelectionPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('team_6');

  const handleContinue = () => {
    // Sauvegarder le plan sélectionné
    const planData = PLANS.find(p => p.id === selectedPlan);
    sessionStorage.setItem('selectedPlan', JSON.stringify(planData));

    // Redirection vers le paiement
    navigate(ROUTES.REGISTER_PAYMENT);
  };

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
      padding: '60px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '2px',
              height: '100%',
              background: 'linear-gradient(180deg, transparent 0%, white 50%, transparent 100%)',
              left: `${i * 8}%`,
              animation: `pulse ${2 + i * 0.1}s ease-in-out infinite`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px', color: 'white' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '12px' }}>
            Choisissez votre plan
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.9 }}>
            Sans engagement • Annulation à tout moment
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          maxWidth: '400px',
          margin: '0 auto 50px'
        }}>
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: step <= 2
                  ? 'white'
                  : 'rgba(255, 255, 255, 0.3)'
              }}
            />
          ))}
        </div>

        {/* Plans Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                cursor: 'pointer',
                border: selectedPlan === plan.id ? `4px solid ${plan.color}` : '4px solid transparent',
                transform: selectedPlan === plan.id ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.3s',
                boxShadow: selectedPlan === plan.id
                  ? `0 20px 40px rgba(0, 0, 0, 0.2)`
                  : '0 8px 20px rgba(0, 0, 0, 0.1)',
                position: 'relative'
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
                }}>
                  ⭐ Plus populaire
                </div>
              )}

              <h3 style={{
                fontSize: '24px',
                fontWeight: '900',
                color: plan.color,
                marginBottom: '12px'
              }}>
                {plan.name}
              </h3>

              <div style={{ marginBottom: '24px' }}>
                <span style={{
                  fontSize: '48px',
                  fontWeight: '900',
                  color: '#1F2937'
                }}>
                  {plan.price}€
                </span>
                <span style={{
                  fontSize: '18px',
                  color: '#6B7280',
                  fontWeight: '600'
                }}>
                  /{plan.period}
                </span>
                <div style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: '600', marginTop: '4px' }}>
                  {plan.annualNote}
                </div>
              </div>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} style={{
                    padding: '10px 0',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: feature.startsWith('❌') ? '#9CA3AF' : '#1F2937'
                  }}>
                    {feature}
                  </li>
                ))}
              </ul>

              {selectedPlan === plan.id && (
                <div style={{
                  marginTop: '20px',
                  padding: '12px',
                  background: `${plan.color}15`,
                  borderRadius: '12px',
                  textAlign: 'center',
                  color: plan.color,
                  fontWeight: '700',
                  fontSize: '14px'
                }}>
                  ✓ Plan sélectionné
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <button
            onClick={() => navigate(ROUTES.REGISTER)}
            style={{
              padding: '14px 28px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '2px solid white',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            ← Retour
          </button>

          <button
            onClick={handleContinue}
            style={{
              padding: '16px 48px',
              background: 'white',
              color: '#667EEA',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s'
            }}
          >
            Continuer vers le paiement →
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlanSelectionPage;
