import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/core/contexts/AuthContext';
import { ROUTES } from '@/config/routes';

export function ConfirmationPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [accountData, setAccountData] = useState(null);
  const [isCreating, setIsCreating] = useState(true);
  const hasRun = useRef(false);

  // Vérification synchrone dès le montage
  useEffect(() => {
    const registrationData = sessionStorage.getItem('registrationData');
    const selectedPlan = sessionStorage.getItem('selectedPlan');
    if (!registrationData || !selectedPlan) {
      navigate(ROUTES.REGISTER, { replace: true });
      return;
    }
    if (hasRun.current) return;
    hasRun.current = true;
    createAccount();
  }, []);

  const createAccount = async () => {
    const registrationData = sessionStorage.getItem('registrationData');
    const selectedPlan = sessionStorage.getItem('selectedPlan');
    if (!registrationData || !selectedPlan) return;

    const userData = JSON.parse(registrationData);
    const planData = JSON.parse(selectedPlan);

    try {
      const result = await register({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        companyName: userData.company,
        phone: userData.phone || null,
        plan: planData.id,
      });

      if (!result.success) throw new Error(result.error || 'Erreur inscription');

      sessionStorage.removeItem('registrationData');
      sessionStorage.removeItem('selectedPlan');

      setAccountData({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        company: userData.company,
        plan: planData.name,
      });
      setIsCreating(false);

    } catch (error) {
      alert('Erreur : ' + error.message);
      navigate(ROUTES.REGISTER);
    }
  };

  const handleLogin = () => {
    navigate(ROUTES.LOGIN);
  };

  if (isCreating) {
    return (
      <div style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '60px',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            border: '4px solid #E5E7EB',
            borderTopColor: '#667EEA',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '900',
            color: '#1F2937',
            marginBottom: '12px'
          }}>
            Création de votre compte...
          </h2>
          <p style={{ fontSize: '15px', color: '#6B7280' }}>
            Veuillez patienter quelques instants
          </p>
        </div>
      </div>
    );
  }

  if (!accountData) return null;

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      padding: '60px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Confetti Animation */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              background: ['#FF6B9D', '#667EEA', '#F59E0B', '#10B981'][i % 4],
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.6
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.9;
          }
        }
      `}</style>

      <div style={{
        position: 'relative',
        zIndex: 1,
        background: 'white',
        borderRadius: '24px',
        padding: '60px',
        maxWidth: '650px',
        width: '100%',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Success Icon */}
        <div style={{
          width: '100px',
          height: '100px',
          margin: '0 auto 32px',
          background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          animation: 'scaleIn 0.5s ease-out'
        }}>
          ✓
        </div>

        <style>{`
          @keyframes scaleIn {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>

        {/* Success Message */}
        <h1 style={{
          fontSize: '36px',
          fontWeight: '900',
          textAlign: 'center',
          marginBottom: '12px',
          background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Félicitations ! 🎉
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#6B7280',
          textAlign: 'center',
          marginBottom: '40px',
          fontWeight: '500'
        }}>
          Votre compte a été créé avec succès
        </p>

        {/* Account Info Card */}
        <div style={{
          background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
          padding: '32px',
          borderRadius: '16px',
          marginBottom: '32px',
          border: '2px solid #E5E7EB'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '800',
            color: '#1F2937',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            Vos informations de connexion
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '13px',
              color: '#6B7280',
              fontWeight: '600',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Email
            </div>
            <div style={{
              padding: '14px 16px',
              background: 'white',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '700',
              color: '#1F2937',
              border: '2px solid #E5E7EB'
            }}>
              {accountData.email}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '13px',
              color: '#6B7280',
              fontWeight: '600',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Mot de passe
            </div>
            <div style={{
              padding: '14px 16px',
              background: 'white',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '700',
              color: '#1F2937',
              border: '2px solid #E5E7EB',
              fontFamily: 'monospace'
            }}>
              {accountData.password}
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: '#FBBF2415',
            borderRadius: '10px',
            border: '2px solid #FBBF24',
            marginTop: '20px'
          }}>
            <div style={{ fontSize: '13px', color: '#92400E', fontWeight: '600', marginBottom: '4px' }}>
              ⚠️ Important
            </div>
            <div style={{ fontSize: '13px', color: '#92400E' }}>
              Conservez ces identifiants en lieu sûr. Confirmez votre email avant de pouvoir vous connecter.
            </div>
          </div>
        </div>

        {/* Plan Info */}
        <div style={{
          background: 'linear-gradient(135deg, #667EEA15 0%, #FF6B9D15 100%)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '32px',
          textAlign: 'center',
          border: '2px dashed #667EEA'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#667EEA', marginBottom: '4px' }}>
            Plan {accountData.plan}
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>
            Abonnement actif dès aujourd'hui • Sans engagement
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '18px',
            background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s',
            marginBottom: '16px'
          }}
        >
          ✉️ Aller à la page de connexion
        </button>

        <div style={{
          textAlign: 'center',
          fontSize: '13px',
          color: '#9CA3AF'
        }}>
          Un email de confirmation a été envoyé à {accountData.email}. Cliquez sur le lien reçu avant de vous connecter.
        </div>
      </div>
    </div>
  );
}

export default ConfirmationPage;
