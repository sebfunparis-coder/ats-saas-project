import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

/**
 * Page Admin Login - Accès SuperAdmin
 */
export function AdminLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (password === 'admin2026') {
      // SuperAdmin authentification réussie
      navigate('/superadmin');
    } else {
      alert('❌ Mot de passe incorrect');
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh' }}>
      {/* NavBar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '16px 0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate(ROUTES.LANDING)}>
            <div style={{ fontSize: '32px' }}>✨</div>
            <div style={{ fontSize: '22px', fontWeight: '800', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ATS Ultimate</div>
          </div>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <button onClick={() => navigate(ROUTES.LANDING)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#4B5563' }}>
              🏠 Accueil
            </button>
            <button onClick={() => navigate('/features')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#4B5563' }}>
              ⚡ Features
            </button>
            <button onClick={() => navigate('/pricing')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#4B5563' }}>
              💎 Tarifs
            </button>
            <button onClick={() => navigate('/admin-login')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#667EEA' }}>
              👑 Admin
            </button>
            <button onClick={() => navigate(ROUTES.LOGIN)} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)' }}>
              Essayer ✨
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Admin */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)', paddingTop: '100px', position: 'relative', overflow: 'hidden' }}>
        {/* Background Pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '2px',
                height: '100%',
                background: 'linear-gradient(180deg, transparent 0%, #667EEA 50%, transparent 100%)',
                left: `${i * 5}%`,
                animation: `pulse ${2 + i * 0.1}s ease-in-out infinite`
              }}></div>
          ))}
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.1; }
            50% { opacity: 0.3; }
          }
        `}</style>

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 60px', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '80px', alignItems: 'center' }}>

            {/* Colonne gauche - Infos */}
            <div>
              <div style={{ display: 'inline-block', padding: '8px 20px', background: 'rgba(102, 126, 234, 0.2)', borderRadius: '20px', marginBottom: '24px', border: '1px solid rgba(102, 126, 234, 0.3)' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#667EEA' }}>👑 ESPACE RÉSERVÉ</span>
              </div>

              <h1 style={{ fontSize: '64px', fontWeight: '900', marginBottom: '24px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
                SuperAdmin<br />Dashboard
              </h1>

              <p style={{ fontSize: '22px', color: '#94A3B8', marginBottom: '40px', lineHeight: 1.6 }}>
                Accès complet au panneau de contrôle de la plateforme. Gestion des utilisateurs, analytics, logs système et configuration.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                {[
                  ['👥', 'Gestion Utilisateurs', 'Accès complet aux comptes et données'],
                  ['📊', 'Analytics Avancées', 'Statistiques et métriques détaillées'],
                  ['📜', 'Logs Système', 'Historique complet des événements'],
                  ['⚙️', 'Configuration', 'Paramètres de la plateforme']
                ].map(([icon, title, desc], i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', padding: '20px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '16px', border: '1px solid rgba(100, 116, 139, 0.2)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ fontSize: '32px' }}>{icon}</div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>{title}</div>
                      <div style={{ fontSize: '14px', color: '#94A3B8' }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '20px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '16px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                <div style={{ fontSize: '14px', color: '#FCD34D', fontWeight: '700', marginBottom: '8px' }}>⚠️ Accès Sécurisé</div>
                <div style={{ fontSize: '13px', color: '#FDE68A' }}>Cette page est réservée aux administrateurs système. Toutes les actions sont tracées et enregistrées.</div>
              </div>
            </div>

            {/* Colonne droite - Formulaire de connexion */}
            <div style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', padding: '60px', borderRadius: '32px', border: '2px solid #334155', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ fontSize: '80px', marginBottom: '20px' }}>👑</div>
                <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>Connexion Admin</h2>
                <p style={{ fontSize: '15px', color: '#94A3B8' }}>Entrez vos identifiants administrateur</p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#94A3B8', marginBottom: '10px', textTransform: 'uppercase' }}>
                  Identifiant
                </label>
                <input
                  type="text"
                  placeholder="admin"
                  defaultValue="admin"
                  style={{ width: '100%', padding: '16px', background: '#0F172A', border: '2px solid #334155', borderRadius: '12px', color: 'white', fontSize: '16px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#94A3B8', marginBottom: '10px', textTransform: 'uppercase' }}>
                  Mot de passe
                </label>
                <input
                  type="password"
                  placeholder="Mot de passe administrateur"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  style={{ width: '100%', padding: '16px', background: '#0F172A', border: '2px solid #334155', borderRadius: '12px', color: 'white', fontSize: '16px', outline: 'none' }}
                  autoFocus
                />
              </div>

              <button
                onClick={handleLogin}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '17px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                🔓 Accéder au Dashboard
              </button>

              <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ fontSize: '12px', color: '#6EE7B7', fontWeight: '700', marginBottom: '8px' }}>💡 Identifiants de test</div>
                <div style={{ fontSize: '13px', color: '#A7F3D0', fontFamily: 'monospace' }}>
                  Identifiant: <strong>admin</strong><br />
                  Mot de passe: <strong>admin2026</strong>
                </div>
              </div>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <button
                  onClick={() => navigate(ROUTES.LANDING)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}>
                  ← Retour à l'accueil
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminLoginPage;
