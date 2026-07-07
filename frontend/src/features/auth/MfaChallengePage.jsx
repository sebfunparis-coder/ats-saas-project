import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/core/contexts/AuthContext';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import { ROUTES } from '@/config/routes';
import { supabase } from '@/services/supabase';

// T-428 : même correctif que LoginPage.jsx — sans ce check direct, un
// SuperAdmin protégé par 2FA atterrissait sur /app/dashboard après le
// challenge, pas sur /superadmin.
async function resolvePostLoginRoute(userId) {
  const { data: profileRow } = await supabase.from('profiles').select('role').eq('id', userId).single();
  return profileRow?.role === 'superadmin' ? ROUTES.SUPERADMIN : ROUTES.DASHBOARD;
}

/**
 * Page de vérification 2FA lors du login
 * Affichée quand AuthContext.login() renvoie code === 'MFA_REQUIRED'
 * Propose soit un code TOTP, soit un code de récupération (perte de l'appareil)
 */
export function MfaChallengePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { confirmMfaLogin, recoverWithBackupCode } = useAuth();
  const { info } = useNotifications();

  const { factorId, email } = location.state || {};

  const [mode, setMode] = useState('totp'); // totp | recovery
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!email) {
    navigate(ROUTES.LOGIN);
    return null;
  }

  const handleSubmitTotp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await confirmMfaLogin(factorId, code.trim());
    if (result.success) {
      navigate(await resolvePostLoginRoute(result.user.id));
    } else {
      setError(result.error || 'Code invalide');
      setIsLoading(false);
    }
  };

  const handleSubmitRecovery = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await recoverWithBackupCode(email, password, code.trim());
    if (result.success) {
      if (!result.factorRemoved) {
        info('Accès récupéré', "Le 2FA reste activé sur ce compte. Rendez-vous dans Sécurité pour le reconfigurer ou le désactiver.");
      }
      navigate(await resolvePostLoginRoute(result.user.id));
    } else {
      setError(result.error || 'Code de récupération invalide');
      setIsLoading(false);
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
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔐</div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1F2937', marginBottom: '8px' }}>
            Vérification en 2 étapes
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>
            {mode === 'totp'
              ? "Entrez le code à 6 chiffres généré par votre application d'authentification."
              : "Entrez un de vos codes de récupération à usage unique pour retrouver l'accès à votre compte. Vous pourrez ensuite gérer votre 2FA depuis l'onglet Sécurité."}
          </p>
        </div>

        {error && (
          <div role="alert" aria-live="assertive" style={{
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

        {mode === 'totp' ? (
          <form onSubmit={handleSubmitTotp}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                Code à 6 chiffres
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '24px',
                  letterSpacing: '6px',
                  textAlign: 'center',
                  fontWeight: '700',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || code.length < 6}
              style={{
                width: '100%',
                padding: '16px',
                background: isLoading || code.length < 6
                  ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
                  : 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginBottom: '16px'
              }}
            >
              {isLoading ? '⏳ Vérification...' : '✅ Vérifier'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitRecovery}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
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
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                Code de récupération
              </label>
              <input
                type="text"
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ex: a1b2c3d4e5"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontFamily: 'monospace',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !password || !code}
              style={{
                width: '100%',
                padding: '16px',
                background: isLoading || !password || !code
                  ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
                  : 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginBottom: '16px'
              }}
            >
              {isLoading ? '⏳ Vérification...' : '🔓 Récupérer mon accès'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => { setMode(mode === 'totp' ? 'recovery' : 'totp'); setError(''); setCode(''); }}
            style={{ background: 'none', border: 'none', color: '#667EEA', fontSize: '13px', fontWeight: '700', cursor: 'pointer', marginBottom: '12px', display: 'block', width: '100%' }}
          >
            {mode === 'totp' ? "Je n'ai plus accès à mon application d'authentification" : '← Revenir au code à 6 chiffres'}
          </button>
          <button
            onClick={() => navigate(ROUTES.LOGIN)}
            style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            ← Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}

export default MfaChallengePage;
