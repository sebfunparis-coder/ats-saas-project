import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/core/contexts/AuthContext';
import { ROUTES } from '@/config/routes';

/**
 * Page de renvoi du lien de vérification email
 * Accessible sans être connecté (un compte non vérifié ne peut pas se connecter)
 */
export function ResendVerificationPage() {
  const navigate = useNavigate();
  const { resendVerificationEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [status, setStatus] = useState('idle'); // idle | loading | sent | error
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    setError('');

    const result = await resendVerificationEmail(email);

    if (result.success) {
      setStatus('sent');
    } else {
      setStatus('error');
      setError(result.error || "Échec de l'envoi. Réessayez plus tard.");
    }
  };

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '60px',
        maxWidth: '480px',
        width: '90%',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>✉️</div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1F2937', marginBottom: '8px' }}>
            Renvoyer le lien de vérification
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>
            Saisissez votre email pour recevoir un nouveau lien de confirmation.
          </p>
        </div>

        {status === 'sent' ? (
          <div style={{
            padding: '20px',
            background: '#D1FAE5',
            color: '#065F46',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            ✅ Si un compte non vérifié existe pour cet email, un nouveau lien vient d'être envoyé. Consultez votre boîte mail.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {status === 'error' && (
              <div style={{
                padding: '12px 16px',
                background: '#FEE2E2',
                color: '#DC2626',
                borderRadius: '12px',
                marginBottom: '20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                ❌ {error}
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '700',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre-email@exemple.com"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                width: '100%',
                padding: '16px',
                background: status === 'loading'
                  ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
                  : 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                marginBottom: '16px'
              }}
            >
              {status === 'loading' ? '⏳ Envoi...' : '📩 Envoyer le lien'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => navigate(ROUTES.LOGIN)}
            style={{
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ← Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResendVerificationPage;
