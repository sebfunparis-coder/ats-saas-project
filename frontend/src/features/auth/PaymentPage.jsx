import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

// Paiement réel Stripe — pré-branché, inactif tant que ces variables ne sont
// pas renseignées (aucun compte Stripe au moment de l'écriture de ce code).
// Dès qu'un compte Stripe existe : créer 3 Payment Links (un par plan), régler
// leur redirection "après paiement" vers cette même URL /register/confirm
// (Stripe Payment Links permet de configurer cette redirection directement
// dans le dashboard, avec {CHECKOUT_SESSION_ID} en template si besoin), puis
// coller les 3 identifiants ci-dessous dans .env — le paiement réel s'active
// automatiquement, sans autre changement de code.
const STRIPE_PAYMENT_LINKS = {
  solo: import.meta.env.VITE_STRIPE_SOLO_PRICE_ID,
  team_3: import.meta.env.VITE_STRIPE_TEAM3_PRICE_ID,
  team_6: import.meta.env.VITE_STRIPE_TEAM6_PRICE_ID,
};

export function PaymentPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const planData = sessionStorage.getItem('selectedPlan');
    if (!planData) {
      navigate(ROUTES.REGISTER_PLAN);
      return;
    }
    setSelectedPlan(JSON.parse(planData));
  }, [navigate]);

  const stripeLink = selectedPlan ? STRIPE_PAYMENT_LINKS[selectedPlan.id] : null;

  const handleStripePayment = () => {
    setIsProcessing(true);
    const registrationData = sessionStorage.getItem('registrationData');
    const email = registrationData ? JSON.parse(registrationData).email : '';
    const url = `https://buy.stripe.com/${stripeLink}${email ? `?prefilled_email=${encodeURIComponent(email)}&client_reference_id=${encodeURIComponent(email)}` : ''}`;
    window.location.href = url;
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);

    // Mode test uniquement — aucun débit réel. Actif tant qu'aucun compte
    // Stripe n'est configuré (voir STRIPE_PAYMENT_LINKS ci-dessus).
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsProcessing(false);

    // Rediriger vers la confirmation
    navigate(ROUTES.REGISTER_CONFIRM);
  };

  if (!selectedPlan) return null;

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
      padding: '60px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '50px',
        maxWidth: '700px',
        width: '100%',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💳</div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>
            Paiement sécurisé
          </h1>
          <p style={{ fontSize: '15px', color: '#6B7280' }}>
            Sans engagement • Annulation à tout moment
          </p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: step === 3
                  ? 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)'
                  : '#E5E7EB'
              }}
            />
          ))}
        </div>

        {/* Plan Summary */}
        <div style={{
          background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
          padding: '24px',
          borderRadius: '16px',
          marginBottom: '32px',
          border: '2px solid #E5E7EB'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1F2937', marginBottom: '4px' }}>
                Plan {selectedPlan.name}
              </h3>
              <p style={{ fontSize: '14px', color: '#6B7280' }}>
                Facturation mensuelle
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '32px', fontWeight: '900', color: selectedPlan.color }}>
                {selectedPlan.price}€
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>
                par mois
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#10B98115',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#10B981',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            ✅ Facturation immédiate • Annulation à tout moment
          </div>
        </div>

        {/* Payment Method */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#1F2937' }}>
            Méthode de paiement
          </h3>

          {stripeLink ? (
            <div style={{ padding: '20px', border: '3px solid #635BFF', borderRadius: '12px', background: '#635BFF0A' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>
                💳 Paiement sécurisé par Stripe
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>
                Vous serez redirigé vers la page de paiement sécurisée Stripe. Carte bancaire réellement débitée.
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px', border: '2px dashed #FBBF24', borderRadius: '12px', background: '#FFFBEB' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#92400E', marginBottom: '4px' }}>
                🧪 Mode test — aucun paiement réel
              </div>
              <div style={{ fontSize: '13px', color: '#92400E' }}>
                Le paiement par carte n'est pas encore configuré (Stripe non branché). Ce compte sera créé sans qu'aucune carte ne soit débitée.
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate(ROUTES.REGISTER_PLAN)}
            style={{
              padding: '14px 28px',
              background: '#F3F4F6',
              color: '#6B7280',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            ← Retour
          </button>

          <button
            onClick={stripeLink ? handleStripePayment : handleSimulatePayment}
            disabled={isProcessing}
            style={{
              flex: 1,
              padding: '16px',
              background: isProcessing
                ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
                : 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
            }}
          >
            {isProcessing ? '⏳ Traitement en cours...' : stripeLink ? '💳 Payer avec Stripe →' : '🧪 Valider (mode test) et créer mon compte'}
          </button>
        </div>

        {/* Security Notice */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#F9FAFB',
          borderRadius: '12px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#6B7280'
        }}>
          🔒 Paiement 100% sécurisé • Cryptage SSL • Données protégées
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
