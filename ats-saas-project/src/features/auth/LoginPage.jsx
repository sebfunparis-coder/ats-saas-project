import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/core/contexts/AuthContext';
import { ROUTES } from '@/config/routes';

/**
 * Page de connexion utilisateur
 * Permet aux utilisateurs de se connecter à l'application ATS
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validation simple
      if (!email || !password) {
        setError('Veuillez remplir tous les champs');
        setIsLoading(false);
        return;
      }

      // Simule un délai d'API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Connexion avec le contexte Auth
      const result = login(email, password);

      if (result.success) {
        // Connexion réussie - redirection vers le dashboard
        navigate(ROUTES.DASHBOARD);
      } else {
        // Connexion échouée
        setError(result.error || 'Email ou mot de passe incorrect');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@techcorp.com');
    setPassword('demo123');
    setError('');
  };

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.1
      }}>
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

      {/* Login Card */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        background: 'white',
        borderRadius: '24px',
        padding: '60px',
        maxWidth: '480px',
        width: '90%',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <div
            onClick={() => navigate(ROUTES.LANDING)}
            style={{
              cursor: 'pointer',
              display: 'inline-block'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✨</div>
            <div style={{
              fontSize: '28px',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px'
            }}>
              ATS Ultimate
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6B7280',
              fontWeight: '500'
            }}>
              Connectez-vous à votre compte
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px 16px',
            background: '#FEE2E2',
            color: '#DC2626',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
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
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                outline: 'none',
                transition: 'all 0.3s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#667EEA'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '700',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                outline: 'none',
                transition: 'all 0.3s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#667EEA'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px',
              background: isLoading
                ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
                : 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s',
              marginBottom: '16px'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isLoading ? '⏳ Connexion...' : '🚀 Se connecter'}
          </button>

          {/* Demo Login Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            style={{
              width: '100%',
              padding: '14px',
              background: '#F9FAFB',
              color: '#4B5563',
              border: '2px solid #E5E7EB',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F3F4F6';
              e.currentTarget.style.borderColor = '#D1D5DB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F9FAFB';
              e.currentTarget.style.borderColor = '#E5E7EB';
            }}
          >
            ✨ Utiliser le compte démo
          </button>
        </form>

        {/* Footer Links */}
        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #E5E7EB',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#6B7280',
            marginBottom: '16px'
          }}>
            Pas encore de compte ?
          </p>
          <button
            onClick={() => navigate(ROUTES.REGISTER)}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
          >
            ✨ Créer votre compte gratuitement
          </button>
        </div>

        {/* Back to home */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center'
        }}>
          <button
            onClick={() => navigate(ROUTES.LANDING)}
            style={{
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
