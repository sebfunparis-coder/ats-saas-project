import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

export function PaymentPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('test');
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  useEffect(() => {
    const planData = sessionStorage.getItem('selectedPlan');
    if (!planData) {
      navigate(ROUTES.REGISTER_PLAN);
      return;
    }
    setSelectedPlan(JSON.parse(planData));
  }, [navigate]);

  const handleSimulatePayment = async () => {
    setIsProcessing(true);

    // Simuler le traitement du paiement
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsProcessing(false);

    // Rediriger vers la confirmation
    navigate(ROUTES.REGISTER_CONFIRM);
  };

  const handleCardPayment = async () => {
    // Validation basique
    if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
      alert('Veuillez remplir tous les champs de la carte');
      return;
    }

    setIsProcessing(true);

    // Simuler le traitement
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsProcessing(false);
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
            14 jours d'essai gratuit • Annulation à tout moment
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
            🎉 Gratuit pendant 14 jours • Première facturation le {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#1F2937' }}>
            Méthode de paiement
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Test Mode */}
            <div
              onClick={() => setPaymentMethod('test')}
              style={{
                padding: '20px',
                border: paymentMethod === 'test' ? '3px solid #10B981' : '2px solid #E5E7EB',
                borderRadius: '12px',
                cursor: 'pointer',
                background: paymentMethod === 'test' ? '#10B98110' : 'white',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>
                    🧪 Mode Test (Recommandé)
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>
                    Simuler le paiement sans entrer de vraies informations
                  </div>
                </div>
                {paymentMethod === 'test' && (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '700'
                  }}>
                    ✓
                  </div>
                )}
              </div>
            </div>

            {/* Card Payment */}
            <div
              onClick={() => setPaymentMethod('card')}
              style={{
                padding: '20px',
                border: paymentMethod === 'card' ? '3px solid #667EEA' : '2px solid #E5E7EB',
                borderRadius: '12px',
                cursor: 'pointer',
                background: paymentMethod === 'card' ? '#667EEA10' : 'white',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>
                    💳 Carte bancaire
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>
                    Visa, Mastercard, American Express
                  </div>
                </div>
                {paymentMethod === 'card' && (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#667EEA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '700'
                  }}>
                    ✓
                  </div>
                )}
              </div>

              {/* Card Form (shown only when selected) */}
              {paymentMethod === 'card' && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #E5E7EB' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                      Numéro de carte
                    </label>
                    <input
                      type="text"
                      value={cardData.number}
                      onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '15px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                      Nom sur la carte
                    </label>
                    <input
                      type="text"
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                      placeholder="JEAN DUPONT"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '15px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                        Expiration
                      </label>
                      <input
                        type="text"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                        placeholder="MM/YY"
                        maxLength="5"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '15px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                        placeholder="123"
                        maxLength="4"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '15px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
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
            onClick={paymentMethod === 'test' ? handleSimulatePayment : handleCardPayment}
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
            {isProcessing ? '⏳ Traitement en cours...' : '🚀 Valider et créer mon compte'}
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
