import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

/**
 * Page Politique de Confidentialité (RGPD)
 */
export function PolitiqueConfidentialite() {
  const navigate = useNavigate();

  const containerStyles = {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%)',
    padding: '120px 40px 80px'
  };

  const maxWidthStyles = {
    maxWidth: '900px',
    margin: '0 auto',
    background: 'white',
    padding: '60px',
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
  };

  const titleStyles = {
    fontSize: '48px',
    fontWeight: '900',
    marginBottom: '12px',
    background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  };

  const sectionTitleStyles = {
    fontSize: '28px',
    fontWeight: '800',
    marginTop: '48px',
    marginBottom: '20px',
    color: '#1F2937'
  };

  const textStyles = {
    fontSize: '16px',
    lineHeight: '1.8',
    color: '#4B5563',
    marginBottom: '16px'
  };

  return (
    <div style={containerStyles}>
      <div style={maxWidthStyles}>
        {/* Bouton retour */}
        <button
          onClick={() => navigate(ROUTES.LANDING)}
          style={{
            marginBottom: '32px',
            padding: '12px 24px',
            background: '#EEF2FF',
            color: '#667EEA',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '14px'
          }}
        >
          ← Retour à l'accueil
        </button>

        <h1 style={titleStyles}>Politique de Confidentialité</h1>
        <p style={{ ...textStyles, color: '#9CA3AF', marginBottom: '48px' }}>
          Conforme au RGPD (Règlement Général sur la Protection des Données)<br/>
          Dernière mise à jour : 18 février 2026
        </p>

        <div style={{ padding: '20px', background: '#FFFBEB', borderRadius: '12px', border: '2px solid #FCD34D', marginBottom: '32px' }}>
          <p style={{ ...textStyles, margin: 0, color: '#92400E', fontWeight: '600' }}>
            🔒 Chez ATS Ultimate, la protection de vos données personnelles est notre priorité absolue. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
          </p>
        </div>

        <h2 style={sectionTitleStyles}>1. Responsable du traitement des données</h2>
        <p style={textStyles}>
          Le responsable du traitement des données personnelles est :
        </p>
        <p style={textStyles}>
          <strong>ATS Ultimate SAS</strong><br/>
          123 Avenue des Champs-Élysées<br/>
          75008 Paris, France<br/>
          Email : dpo@ats-ultimate.com<br/>
          Téléphone : +33 1 40 50 60 70
        </p>

        <h2 style={sectionTitleStyles}>2. Données personnelles collectées</h2>
        <p style={textStyles}>
          Dans le cadre de l'utilisation de notre plateforme ATS, nous collectons les données suivantes :
        </p>

        <h3 style={{ fontSize: '20px', fontWeight: '700', marginTop: '24px', marginBottom: '12px', color: '#1F2937' }}>
          2.1 Données d'inscription
        </h3>
        <ul style={{ ...textStyles, paddingLeft: '24px' }}>
          <li>Nom et prénom</li>
          <li>Adresse email professionnelle</li>
          <li>Numéro de téléphone</li>
          <li>Nom de l'entreprise</li>
          <li>Fonction dans l'entreprise</li>
        </ul>

        <h3 style={{ fontSize: '20px', fontWeight: '700', marginTop: '24px', marginBottom: '12px', color: '#1F2937' }}>
          2.2 Données d'utilisation
        </h3>
        <ul style={{ ...textStyles, paddingLeft: '24px' }}>
          <li>Adresse IP</li>
          <li>Données de connexion (date, heure)</li>
          <li>Type de navigateur et système d'exploitation</li>
          <li>Pages consultées et actions effectuées</li>
          <li>Durée de session</li>
        </ul>

        <h3 style={{ fontSize: '20px', fontWeight: '700', marginTop: '24px', marginBottom: '12px', color: '#1F2937' }}>
          2.3 Données des candidats
        </h3>
        <ul style={{ ...textStyles, paddingLeft: '24px' }}>
          <li>CV et lettres de motivation (téléchargés par les recruteurs)</li>
          <li>Informations professionnelles (expérience, compétences)</li>
          <li>Coordonnées (email, téléphone)</li>
          <li>Notes et évaluations (ajoutées par les recruteurs)</li>
        </ul>

        <h2 style={sectionTitleStyles}>3. Finalités du traitement</h2>
        <p style={textStyles}>
          Nous utilisons vos données personnelles pour les finalités suivantes :
        </p>
        <ul style={{ ...textStyles, paddingLeft: '24px' }}>
          <li><strong>Fourniture du service</strong> : Permettre l'utilisation de la plateforme ATS</li>
          <li><strong>Gestion des comptes</strong> : Créer et gérer votre compte utilisateur</li>
          <li><strong>Communication</strong> : Vous envoyer des informations sur le service, des mises à jour</li>
          <li><strong>Support client</strong> : Répondre à vos demandes d'assistance</li>
          <li><strong>Amélioration du service</strong> : Analyser l'utilisation pour améliorer nos fonctionnalités</li>
          <li><strong>Sécurité</strong> : Prévenir la fraude et garantir la sécurité de la plateforme</li>
          <li><strong>Obligations légales</strong> : Respecter nos obligations légales et réglementaires</li>
        </ul>

        <h2 style={sectionTitleStyles}>4. Base légale du traitement</h2>
        <p style={textStyles}>
          Le traitement de vos données personnelles repose sur les bases légales suivantes :
        </p>
        <ul style={{ ...textStyles, paddingLeft: '24px' }}>
          <li><strong>Exécution du contrat</strong> : Pour fournir le service ATS souscrit</li>
          <li><strong>Consentement</strong> : Pour l'envoi de communications marketing (révocable à tout moment)</li>
          <li><strong>Intérêt légitime</strong> : Pour améliorer nos services et assurer la sécurité</li>
          <li><strong>Obligation légale</strong> : Pour respecter nos obligations comptables et fiscales</li>
        </ul>

        <h2 style={sectionTitleStyles}>5. Durée de conservation</h2>
        <p style={textStyles}>
          Vos données personnelles sont conservées pendant les durées suivantes :
        </p>
        <ul style={{ ...textStyles, paddingLeft: '24px' }}>
          <li><strong>Données de compte actif</strong> : Pendant toute la durée du contrat + 1 an</li>
          <li><strong>Données de candidats</strong> : Maximum 2 ans après la dernière activité</li>
          <li><strong>Données de facturation</strong> : 10 ans (obligation légale comptable)</li>
          <li><strong>Cookies</strong> : Maximum 13 mois</li>
          <li><strong>Logs de connexion</strong> : 1 an</li>
        </ul>

        <h2 style={sectionTitleStyles}>6. Destinataires des données</h2>
        <p style={textStyles}>
          Vos données personnelles sont accessibles :
        </p>
        <ul style={{ ...textStyles, paddingLeft: '24px' }}>
          <li><strong>Personnel autorisé</strong> : Équipes techniques et support client</li>
          <li><strong>Hébergeur</strong> : OVHcloud (France)</li>
          <li><strong>Processeurs de paiement</strong> : Stripe (pour les transactions sécurisées)</li>
          <li><strong>Outils d'analyse</strong> : Google Analytics (avec anonymisation IP)</li>
          <li><strong>Services de communication</strong> : Mailchimp, SendGrid (emails transactionnels)</li>
        </ul>
        <p style={textStyles}>
          <strong>Important :</strong> Nous ne vendons jamais vos données à des tiers.
        </p>

        <h2 style={sectionTitleStyles}>7. Vos droits (RGPD)</h2>
        <p style={textStyles}>
          Conformément au RGPD, vous disposez des droits suivants :
        </p>

        <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '12px', marginTop: '20px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#1F2937' }}>
            ✅ Droit d'accès
          </h3>
          <p style={{ ...textStyles, margin: 0 }}>
            Vous pouvez demander une copie de toutes les données personnelles que nous détenons sur vous.
          </p>
        </div>

        <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#1F2937' }}>
            ✏️ Droit de rectification
          </h3>
          <p style={{ ...textStyles, margin: 0 }}>
            Vous pouvez demander la correction de données inexactes ou incomplètes.
          </p>
        </div>

        <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#1F2937' }}>
            🗑️ Droit à l'effacement ("droit à l'oubli")
          </h3>
          <p style={{ ...textStyles, margin: 0 }}>
            Vous pouvez demander la suppression de vos données (sous réserve de nos obligations légales).
          </p>
        </div>

        <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#1F2937' }}>
            ⏸️ Droit à la limitation
          </h3>
          <p style={{ ...textStyles, margin: 0 }}>
            Vous pouvez demander la limitation du traitement de vos données dans certains cas.
          </p>
        </div>

        <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#1F2937' }}>
            🚫 Droit d'opposition
          </h3>
          <p style={{ ...textStyles, margin: 0 }}>
            Vous pouvez vous opposer au traitement de vos données à des fins de marketing direct.
          </p>
        </div>

        <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#1F2937' }}>
            📦 Droit à la portabilité
          </h3>
          <p style={{ ...textStyles, margin: 0 }}>
            Vous pouvez recevoir vos données dans un format structuré et les transférer à un autre responsable.
          </p>
        </div>

        <h2 style={sectionTitleStyles}>8. Exercer vos droits</h2>
        <p style={textStyles}>
          Pour exercer vos droits, vous pouvez :
        </p>
        <ul style={{ ...textStyles, paddingLeft: '24px' }}>
          <li>Envoyer un email à : <strong>dpo@ats-ultimate.com</strong></li>
          <li>Écrire à : ATS Ultimate SAS, 123 Avenue des Champs-Élysées, 75008 Paris</li>
          <li>Utiliser le formulaire de contact sur notre site</li>
        </ul>
        <p style={textStyles}>
          Nous nous engageons à répondre dans un délai maximum de <strong>30 jours</strong>.
        </p>

        <h2 style={sectionTitleStyles}>9. Sécurité des données</h2>
        <p style={textStyles}>
          Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :
        </p>
        <ul style={{ ...textStyles, paddingLeft: '24px' }}>
          <li>✅ Chiffrement SSL/TLS pour toutes les communications</li>
          <li>✅ Authentification à deux facteurs (2FA) disponible</li>
          <li>✅ Hébergement sécurisé en France (OVHcloud)</li>
          <li>✅ Sauvegardes quotidiennes chiffrées</li>
          <li>✅ Accès limité aux données (principe du moindre privilège)</li>
          <li>✅ Monitoring et détection des intrusions</li>
          <li>✅ Audits de sécurité réguliers</li>
        </ul>

        <h2 style={sectionTitleStyles}>10. Transferts internationaux</h2>
        <p style={textStyles}>
          Vos données sont hébergées en France et au sein de l'Union Européenne. Dans certains cas, elles peuvent être transférées vers des pays tiers (ex : USA pour certains outils d'analyse).
        </p>
        <p style={textStyles}>
          Ces transferts sont encadrés par des garanties appropriées (Clauses Contractuelles Types de la Commission Européenne).
        </p>

        <h2 style={sectionTitleStyles}>11. Cookies et technologies similaires</h2>
        <p style={textStyles}>
          Notre site utilise des cookies pour améliorer votre expérience. Pour plus d'informations, consultez notre <button onClick={() => navigate('/politique-cookies')} style={{ color: '#667EEA', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: 0 }}>Politique de Cookies</button>.
        </p>

        <h2 style={sectionTitleStyles}>12. Modifications de la politique</h2>
        <p style={textStyles}>
          Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications prendront effet dès leur publication sur cette page.
        </p>
        <p style={textStyles}>
          Nous vous encourageons à consulter régulièrement cette page pour rester informé de nos pratiques.
        </p>

        <h2 style={sectionTitleStyles}>13. Réclamation auprès de la CNIL</h2>
        <p style={textStyles}>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) :
        </p>
        <p style={textStyles}>
          <strong>CNIL</strong><br/>
          3 Place de Fontenoy<br/>
          TSA 80715<br/>
          75334 Paris Cedex 07<br/>
          Téléphone : 01 53 73 22 22<br/>
          Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: '#667EEA' }}>www.cnil.fr</a>
        </p>

        <h2 style={sectionTitleStyles}>14. Contact</h2>
        <p style={textStyles}>
          Pour toute question concernant cette politique de confidentialité ou le traitement de vos données personnelles :
        </p>
        <div style={{ padding: '24px', background: '#EEF2FF', borderRadius: '12px', borderLeft: '4px solid #667EEA' }}>
          <p style={{ ...textStyles, margin: 0, color: '#667EEA', fontWeight: '600' }}>
            📧 Email : dpo@ats-ultimate.com<br/>
            📞 Téléphone : +33 1 40 50 60 70<br/>
            📍 Adresse : 123 Avenue des Champs-Élysées, 75008 Paris, France
          </p>
        </div>

        <div style={{ marginTop: '64px', padding: '24px', background: '#DCFCE7', borderRadius: '16px', borderLeft: '4px solid #10B981' }}>
          <p style={{ ...textStyles, margin: 0, color: '#065F46', fontWeight: '600' }}>
            🔒 Votre vie privée nous tient à cœur. Nous nous engageons à protéger vos données et à respecter vos droits conformément au RGPD.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PolitiqueConfidentialite;
