import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/core/contexts/AuthContext';
import { useData } from '@/core/contexts/DataContext';
import { ROUTES } from '@/config/routes';
import { authAPI } from '@/core/services/api.service';

export function ConfirmationPage() {
  const navigate = useNavigate();
  const { registerAndLogin } = useAuth();
  const { addCompany, addTeamMember } = useData();
  const [accountData, setAccountData] = useState(null);
  const [isCreating, setIsCreating] = useState(true);

  useEffect(() => {
    createAccount();
  }, []);

  const createAccount = async () => {
    // Récupérer les données d'inscription
    const registrationData = sessionStorage.getItem('registrationData');
    const selectedPlan = sessionStorage.getItem('selectedPlan');

    if (!registrationData || !selectedPlan) {
      navigate(ROUTES.REGISTER);
      return;
    }

    const userData = JSON.parse(registrationData);
    const planData = JSON.parse(selectedPlan);

    console.log('🔵 [ConfirmationPage] Starting account creation...');
    console.log('🔵 [ConfirmationPage] User data:', userData);
    console.log('🔵 [ConfirmationPage] Plan data:', planData);

    try {
      // 🆕 APPEL API BACKEND - Création réelle du compte
      const backendResponse = await authAPI.register({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        company: userData.company,
        phone: userData.phone || '',
        role: 'Admin',
        plan: planData.name
      });

      console.log('✅ [ConfirmationPage] Backend registration successful:', backendResponse);

      // Vérifier que le token est bien reçu et sauvegardé
      const savedToken = localStorage.getItem('token');
      const savedAuthToken = localStorage.getItem('authToken');
      console.log('✅ [ConfirmationPage] Token saved:', savedToken ? `${savedToken.substring(0, 20)}...` : 'FAILED');
      console.log('✅ [ConfirmationPage] AuthToken saved:', savedAuthToken ? `${savedAuthToken.substring(0, 20)}...` : 'FAILED');

      if (!savedToken && !savedAuthToken) {
        console.error('❌ [ConfirmationPage] NO TOKEN SAVED! This will cause 401 errors.');
        throw new Error('Token not saved after registration');
      }

    } catch (error) {
      console.error('❌ [ConfirmationPage] Backend registration failed:', error);
      // En cas d'erreur backend, afficher un message et retourner à la page d'inscription
      alert('Erreur lors de la création du compte: ' + error.message);
      navigate(ROUTES.REGISTER);
      return;
    }

    // Calculer le MRR en fonction du plan
    const planPrices = {
      'Starter': '€99',
      'Pro': '€199',
      'Enterprise': '€499'
    };

    // 1. Créer l'entreprise dans le système
    const newCompany = addCompany({
      name: userData.company,
      industry: 'Non spécifié', // L'utilisateur pourra le modifier plus tard
      email: userData.email,
      plan: planData.name,
      status: 'active', // Statut actif après paiement réussi
      mrr: planPrices[planData.name] || '€0',
      joinDate: new Date().toISOString().split('T')[0],
      nextBilling: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentMethod: 'Carte bancaire',
      users: [], // Sera rempli après ajout du membre
      candidateIds: [],
      missionIds: [],
      health: 100,
      engagement: 'high',
      lastLogin: new Date().toISOString(),
      contacts: [
        {
          name: `${userData.firstName} ${userData.lastName}`,
          role: 'Admin',
          email: userData.email,
          phone: userData.phone || ''
        }
      ],
      links: [],
      documents: [],
      notes: `Compte créé le ${new Date().toLocaleDateString('fr-FR')} - Période d'essai de 14 jours`
    });

    // 2. Ajouter le membre à l'équipe
    const newTeamMember = addTeamMember({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: 'Admin', // Créateur du compte = Admin
      companyId: newCompany.id,
      avatar: '👤', // Avatar par défaut
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString(),
      active: true, // Membre actif dès la création
      permissions: ['all'], // Admin a toutes les permissions
      stats: {
        candidatesAdded: 0,
        missionsCreated: 0,
        interviewsScheduled: 0,
        placements: 0,
        revenue: '€0'
      },
      activity: {
        lastLogin: 'À l\'instant',
        candidatesContacted: 0,
        interviewsScheduled: 0,
        avgResponseTime: 'N/A'
      },
      performance: {
        monthlyAchieved: 0,
        monthlyGoal: 10,
        conversionRate: '0%',
        satisfaction: 5,
        hoursThisWeek: 0
      }
    });

    // 3. Préparer les données du compte pour l'affichage
    const newAccount = {
      id: newTeamMember.id,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      company: userData.company,
      companyId: newCompany.id,
      phone: userData.phone || '',
      role: 'Admin',
      plan: planData.name,
      createdAt: new Date().toISOString(),
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    };

    // 🆕 SAUVEGARDER L'UTILISATEUR DANS LOCALSTORAGE pour AuthContext
    // AuthContext cherche 'ats_user' au démarrage (voir AuthContext.jsx ligne 57)
    const userForAuthContext = {
      id: newAccount.id,
      email: newAccount.email,
      firstName: newAccount.firstName,
      lastName: newAccount.lastName,
      company: newAccount.company,
      companyId: newAccount.companyId,
      phone: newAccount.phone,
      role: newAccount.role,
      plan: newAccount.plan
    };
    localStorage.setItem('ats_user', JSON.stringify(userForAuthContext));
    console.log('✅ [ConfirmationPage] User saved to localStorage for AuthContext');

    setAccountData(newAccount);
    setIsCreating(false);

    // Nettoyer le sessionStorage
    sessionStorage.removeItem('registrationData');
    sessionStorage.removeItem('selectedPlan');
  };

  const handleLogin = () => {
    if (!accountData) return;

    // Enregistrement et connexion automatique avec le compte créé
    const result = registerAndLogin(accountData);

    if (result.success) {
      navigate(ROUTES.DASHBOARD);
    }
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
              Conservez ces identifiants en lieu sûr. Vous en aurez besoin pour vous connecter.
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
            Période d'essai gratuite jusqu'au {new Date(accountData.trialEndsAt).toLocaleDateString('fr-FR')}
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
          🚀 Accéder à mon compte maintenant
        </button>

        <div style={{
          textAlign: 'center',
          fontSize: '13px',
          color: '#9CA3AF'
        }}>
          Un email de confirmation a été envoyé à votre adresse
        </div>
      </div>
    </div>
  );
}

export default ConfirmationPage;
