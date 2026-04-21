import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

/**
 * Page Conditions Générales d'Utilisation
 */
export function CGU() {
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
        <button onClick={() => navigate(ROUTES.LANDING)} style={{ marginBottom: '32px', padding: '12px 24px', background: '#EEF2FF', color: '#667EEA', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
          ← Retour à l'accueil
        </button>

        <h1 style={titleStyles}>Conditions Générales d'Utilisation</h1>
        <p style={{ ...textStyles, color: '#9CA3AF', marginBottom: '48px' }}>
          Dernière mise à jour : 18 février 2026
        </p>

        <div style={{ padding: '20px', background: '#EEF2FF', borderRadius: '12px', border: '2px solid #667EEA', marginBottom: '32px' }}>
          <p style={{ ...textStyles, margin: 0, color: '#667EEA', fontWeight: '600' }}>
            📋 Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme ATS Ultimate. En utilisant notre service, vous acceptez ces conditions.
          </p>
        </div>

        <h2 style={sectionTitleStyles}>1. Objet</h2>
        <p style={textStyles}>
          Les présentes CGU ont pour objet de définir les conditions et modalités dans lesquelles ATS Ultimate SAS met à disposition des utilisateurs sa plateforme de recrutement (« le Service »).
        </p>

        <h2 style={sectionTitleStyles}>2. Accès au Service</h2>
        <p style={textStyles}>
          Le Service est accessible :
        </p>
        <ul style={{ ...textStyles, paddingLeft: '24px' }}>
          <li>À toute personne physique disposant de la pleine capacité juridique</li>
          <li>À toute personne morale agissant par l'intermédiaire d'un représentant légal</li>
          <li>Après création d'un compte utilisateur</li>
          <li>Sous réserve de l'acceptation des présentes CGU</li>
        </ul>

        <h2 style={sectionTitleStyles}>3. Création et gestion du compte</h2>
        <h3 style={{ fontSize: '20px', fontWeight: '700', marginTop: '24px', marginBottom: '12px', color: '#1F2937' }}>
          3.1 Inscription
        </h3>
        <p style={textStyles}>
          Pour créer un compte, vous devez fournir des informations exactes, complètes et à jour. Vous vous engagez à mettre à jour vos informations en cas de changement.
        </p>

        <h3 style={{ fontSize: '20px', fontWeight: '700', marginTop: '24px', marginBottom: '12px', color: '#1F2937' }}>
          3.2 Identifiants
        </h3>
        <p style={textStyles}>
          Vous êtes responsable de la confidentialité de vos identifiants de connexion. Toute utilisation de votre compte est présumée émaner de vous.
        </p>

        <h3 style={{ fontSize: '20px', fontWeight: '700', marginTop: '24px', marginBottom: '12px', color: '#1F2937' }}>
          3.3 Suspension et résiliation
        </h3>
        <p style={textStyles}>
          ATS Ultimate se réserve le droit de suspendre ou résilier votre compte en cas de :
        </p>
        <ul style={{ ...textStyles, paddingLeft: '24px' }}>
          <li>Non-respect des présentes CGU</li>
          <li>Utilisation frauduleuse du Service</li>
          <li>Non-paiement des sommes dues</li>
          <li>Inactivité prolongée (plus de 12 mois)</li>
        </ul>

        <h2 style={sectionTitleStyles}>4. Description du Service</h2>
        <p style={textStyles}>
          ATS Ultimate fournit une plateforme SaaS de gestion du recrutement comprenant :
        </p>
        <ul style={{ ...textStyles, paddingLeft: '24px' }}>
          <li>✅ Gestion des candidatures et pipeline de recrutement</li>
          <li>✅ CVthèque et base de données candidats</li>
          <li>✅ Scoring automatique par intelligence artificielle</li>
          <li>✅ Calendrier et planification d'entretiens</li>
          <li>✅ Collaboration d'équipe</li>
          <li>✅ Rapports et analyses</li>
        </ul>

        <h2 style={sectionTitleStyles}>5. Obligations de l'utilisateur</h2>
        <p style={textStyles}>
          En utilisant le Service, vous vous engagez à :
        </p>
        <ul style={{ ...textStyles, paddingLeft: '24px' }}>
          <li>Utiliser le Service conformément aux lois en vigueur</li>
          <li>Ne pas porter atteinte aux droits de tiers</li>
          <li>Ne pas diffuser de contenu illégal, diffamatoire ou inapproprié</li>
          <li>Ne pas tenter de contourner les mesures de sécurité</li>
          <li>Ne pas utiliser le Service à des fins commerciales non autorisées</li>
          <li>Respecter les droits de propriété intellectuelle</li>
          <li>Informer les candidats du traitement de leurs données (RGPD)</li>
        </ul>

        <h2 style={sectionTitleStyles}>6. Propriété intellectuelle</h2>
        <p style={textStyles}>
          L'ensemble des éléments de la plateforme (logiciel, design, contenus, marques, logos) sont la propriété exclusive de ATS Ultimate SAS et sont protégés par le droit d'auteur.
        </p>
        <p style={textStyles}>
          L'utilisation du Service ne vous confère aucun droit de propriété sur ces éléments.
        </p>

        <h2 style={sectionTitleStyles}>7. Données et confidentialité</h2>
        <p style={textStyles}>
          Vos données personnelles sont traitées conformément à notre <button onClick={() => navigate('/politique-confidentialite')} style={{ color: '#667EEA', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: 0 }}>Politique de Confidentialité</button>.
        </p>
        <p style={textStyles}>
          Vous êtes responsable du traitement des données des candidats et devez respecter le RGPD.
        </p>

        <h2 style={sectionTitleStyles}>8. Disponibilité du Service</h2>
        <p style={textStyles}>
          ATS Ultimate s'engage à fournir le Service avec un taux de disponibilité de 99,5% hors maintenance programmée.
        </p>
        <p style={textStyles}>
          Les maintenances programmées seront annoncées au moins 48 heures à l'avance.
        </p>

        <h2 style={sectionTitleStyles}>9. Limitation de responsabilité</h2>
        <p style={textStyles}>
          ATS Ultimate ne pourra être tenu responsable :
        </p>
        <ul style={{ ...textStyles, paddingLeft: '24px' }}>
          <li>De l'utilisation du Service par l'utilisateur</li>
          <li>Des décisions de recrutement prises sur la base des informations fournies</li>
          <li>De la perte de données due à un cas de force majeure</li>
          <li>Des interruptions de service indépendantes de notre volonté</li>
        </ul>

        <h2 style={sectionTitleStyles}>10. Modifications des CGU</h2>
        <p style={textStyles}>
          ATS Ultimate se réserve le droit de modifier les présentes CGU à tout moment. Les modifications prendront effet dès leur publication.
        </p>
        <p style={textStyles}>
          Vous serez informé par email des modifications importantes.
        </p>

        <h2 style={sectionTitleStyles}>11. Droit applicable et juridiction</h2>
        <p style={textStyles}>
          Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux de Paris seront seuls compétents.
        </p>

        <div style={{ marginTop: '64px', padding: '24px', background: '#EEF2FF', borderRadius: '16px', borderLeft: '4px solid #667EEA' }}>
          <p style={{ ...textStyles, margin: 0, color: '#667EEA', fontWeight: '600' }}>
            📧 Pour toute question : contact@ats-ultimate.com
          </p>
        </div>
      </div>
    </div>
  );
}

export default CGU;
