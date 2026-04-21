import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

/**
 * Page Politique de Cookies
 */
export function PolitiqueCookies() {
  const navigate = useNavigate();

  const containerStyles = { minHeight: '100vh', background: 'linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%)', padding: '120px 40px 80px' };
  const maxWidthStyles = { maxWidth: '900px', margin: '0 auto', background: 'white', padding: '60px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' };
  const titleStyles = { fontSize: '48px', fontWeight: '900', marginBottom: '12px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };
  const sectionTitleStyles = { fontSize: '28px', fontWeight: '800', marginTop: '48px', marginBottom: '20px', color: '#1F2937' };
  const textStyles = { fontSize: '16px', lineHeight: '1.8', color: '#4B5563', marginBottom: '16px' };

  return (
    <div style={containerStyles}>
      <div style={maxWidthStyles}>
        <button onClick={() => navigate(ROUTES.LANDING)} style={{ marginBottom: '32px', padding: '12px 24px', background: '#EEF2FF', color: '#667EEA', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
          ← Retour à l'accueil
        </button>

        <h1 style={titleStyles}>Politique de Cookies</h1>
        <p style={{ ...textStyles, color: '#9CA3AF', marginBottom: '48px' }}>Dernière mise à jour : 18 février 2026</p>

        <div style={{ padding: '20px', background: '#FEF3C7', borderRadius: '12px', border: '2px solid #FCD34D', marginBottom: '32px' }}>
          <p style={{ ...textStyles, margin: 0, color: '#92400E', fontWeight: '600' }}>
            🍪 Cette page explique comment nous utilisons les cookies et technologies similaires sur notre site web.
          </p>
        </div>

        <h2 style={sectionTitleStyles}>1. Qu'est-ce qu'un cookie ?</h2>
        <p style={textStyles}>
          Un cookie est un petit fichier texte déposé sur votre ordinateur, tablette ou smartphone lors de la visite d'un site web.
        </p>

        <h2 style={sectionTitleStyles}>2. Types de cookies utilisés</h2>

        <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '12px', marginTop: '20px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#1F2937' }}>🔐 Cookies strictement nécessaires</h3>
          <p style={{ ...textStyles, margin: 0 }}>
            Ces cookies sont indispensables au fonctionnement du site :<br/>
            • Session utilisateur<br/>
            • Authentification<br/>
            • Sécurité<br/>
            <strong>Durée :</strong> Session ou 30 jours
          </p>
        </div>

        <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#1F2937' }}>📊 Cookies analytiques</h3>
          <p style={{ ...textStyles, margin: 0 }}>
            Pour comprendre comment vous utilisez le site :<br/>
            • Google Analytics (anonymisé)<br/>
            • Statistiques de visite<br/>
            <strong>Durée :</strong> 13 mois
          </p>
        </div>

        <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#1F2937' }}>🎯 Cookies marketing (optionnels)</h3>
          <p style={{ ...textStyles, margin: 0 }}>
            Pour personnaliser les publicités :<br/>
            • Remarketing Google Ads<br/>
            • Facebook Pixel<br/>
            <strong>Durée :</strong> 6 mois
          </p>
        </div>

        <h2 style={sectionTitleStyles}>3. Gérer vos cookies</h2>
        <p style={textStyles}>
          Vous pouvez gérer vos préférences de cookies à tout moment via les paramètres de votre navigateur :
        </p>
        <ul style={{ ...textStyles, paddingLeft: '24px' }}>
          <li><strong>Chrome</strong> : Paramètres → Confidentialité et sécurité → Cookies</li>
          <li><strong>Firefox</strong> : Options → Vie privée et sécurité</li>
          <li><strong>Safari</strong> : Préférences → Confidentialité</li>
          <li><strong>Edge</strong> : Paramètres → Cookies et autorisations</li>
        </ul>

        <h2 style={sectionTitleStyles}>4. Contact</h2>
        <p style={textStyles}>
          Pour toute question : <strong>dpo@ats-ultimate.com</strong>
        </p>
      </div>
    </div>
  );
}

export default PolitiqueCookies;
