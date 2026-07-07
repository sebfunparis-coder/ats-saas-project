import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LegalPage, Section, P, H3, UL, Notice } from './LegalPage';

/**
 * Page Politique de Confidentialité (RGPD)
 */
export function PolitiqueConfidentialite() {
  const navigate = useNavigate();

  return (
    <LegalPage
      title="Politique de Confidentialité"
      updated="18 février 2026"
      notice="🔒 Chez ATS Ultimate, la protection de vos données personnelles est notre priorité absolue. Cette politique explique comment nous collectons, utilisons et protégeons vos informations. Conforme au RGPD (Règlement Général sur la Protection des Données)."
      path="/politique-confidentialite"
    >
      <Section title="1. Responsable du traitement des données">
        <P>Le responsable du traitement des données personnelles est :</P>
        <P>
          <strong>GETWORK</strong> (entrepreneur individuel, exploitant le site ATS Ultimate)<br />
          60 rue François 1er<br />
          75008 Paris, France<br />
          Email : dpo@ats-ultimate.com<br />
          Téléphone : [NUMÉRO RÉEL À COMPLÉTER]
        </P>
      </Section>

      <Section title="2. Données personnelles collectées">
        <P>Dans le cadre de l'utilisation de notre plateforme ATS, nous collectons les données suivantes :</P>

        <H3>2.1 Données d'inscription</H3>
        <UL items={[
          'Nom et prénom',
          'Adresse email professionnelle',
          'Numéro de téléphone',
          'Nom de l\'entreprise',
          'Fonction dans l\'entreprise',
        ]} />

        <H3>2.2 Données d'utilisation</H3>
        <UL items={[
          'Adresse IP',
          'Données de connexion (date, heure)',
          'Type de navigateur et système d\'exploitation',
          'Pages consultées et actions effectuées',
          'Durée de session',
        ]} />

        <H3>2.3 Données des candidats</H3>
        <UL items={[
          'CV et lettres de motivation (téléchargés par les recruteurs)',
          'Informations professionnelles (expérience, compétences)',
          'Coordonnées (email, téléphone)',
          'Notes et évaluations (ajoutées par les recruteurs)',
        ]} />
      </Section>

      <Section title="3. Finalités du traitement">
        <P>Nous utilisons vos données personnelles pour les finalités suivantes :</P>
        <UL items={[
          <><strong>Fourniture du service</strong> : Permettre l'utilisation de la plateforme ATS</>,
          <><strong>Gestion des comptes</strong> : Créer et gérer votre compte utilisateur</>,
          <><strong>Communication</strong> : Vous envoyer des informations sur le service, des mises à jour</>,
          <><strong>Support client</strong> : Répondre à vos demandes d'assistance</>,
          <><strong>Amélioration du service</strong> : Analyser l'utilisation pour améliorer nos fonctionnalités</>,
          <><strong>Sécurité</strong> : Prévenir la fraude et garantir la sécurité de la plateforme</>,
          <><strong>Obligations légales</strong> : Respecter nos obligations légales et réglementaires</>,
        ]} />
      </Section>

      <Section title="4. Base légale du traitement">
        <P>Le traitement de vos données personnelles repose sur les bases légales suivantes :</P>
        <UL items={[
          <><strong>Exécution du contrat</strong> : Pour fournir le service ATS souscrit</>,
          <><strong>Consentement</strong> : Pour l'envoi de communications marketing (révocable à tout moment)</>,
          <><strong>Intérêt légitime</strong> : Pour améliorer nos services et assurer la sécurité</>,
          <><strong>Obligation légale</strong> : Pour respecter nos obligations comptables et fiscales</>,
        ]} />
      </Section>

      <Section title="5. Durée de conservation">
        <P>Vos données personnelles sont conservées pendant les durées suivantes :</P>
        <UL items={[
          <><strong>Données de compte actif</strong> : Pendant toute la durée du contrat + 1 an</>,
          <><strong>Données de candidats</strong> : Maximum 2 ans après la dernière activité</>,
          <><strong>Données de facturation</strong> : 10 ans (obligation légale comptable)</>,
          <><strong>Cookies</strong> : Maximum 13 mois</>,
          <><strong>Logs de connexion</strong> : 1 an</>,
        ]} />
      </Section>

      <Section title="6. Destinataires des données">
        <P>Vos données personnelles sont accessibles :</P>
        <UL items={[
          <><strong>Personnel autorisé</strong> : Équipes techniques et support client</>,
          <><strong>Hébergeur</strong> : Supabase Inc. (Infrastructure AWS Frankfurt — eu-central-1)</>,
          <><strong>Processeurs de paiement</strong> : Stripe (pour les transactions sécurisées)</>,
          <><strong>Outils d'analyse</strong> : Google Analytics (avec anonymisation IP)</>,
          <><strong>Services de communication</strong> : Mailchimp, SendGrid (emails transactionnels)</>,
        ]} />
        <P><strong>Important :</strong> Nous ne vendons jamais vos données à des tiers.</P>
      </Section>

      <Section title="7. Vos droits (RGPD)">
        <P>Conformément au RGPD, vous disposez des droits suivants :</P>
        <UL items={[
          <><strong>✅ Droit d'accès</strong> — Vous pouvez demander une copie de toutes les données personnelles que nous détenons sur vous.</>,
          <><strong>✏️ Droit de rectification</strong> — Vous pouvez demander la correction de données inexactes ou incomplètes.</>,
          <><strong>🗑️ Droit à l'effacement</strong> ("droit à l'oubli") — Vous pouvez demander la suppression de vos données (sous réserve de nos obligations légales).</>,
          <><strong>⏸️ Droit à la limitation</strong> — Vous pouvez demander la limitation du traitement de vos données dans certains cas.</>,
          <><strong>🚫 Droit d'opposition</strong> — Vous pouvez vous opposer au traitement de vos données à des fins de marketing direct.</>,
          <><strong>📦 Droit à la portabilité</strong> — Vous pouvez recevoir vos données dans un format structuré et les transférer à un autre responsable.</>,
        ]} />
      </Section>

      <Section title="8. Exercer vos droits">
        <P>Pour exercer vos droits, vous pouvez :</P>
        <UL items={[
          <>Envoyer un email à : <strong>dpo@ats-ultimate.com</strong></>,
          'Écrire à : GETWORK, 60 rue François 1er, 75008 Paris',
          'Utiliser le formulaire de contact sur notre site',
        ]} />
        <P>Nous nous engageons à répondre dans un délai maximum de <strong>30 jours</strong>.</P>
      </Section>

      <Section title="9. Sécurité des données">
        <P>Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :</P>
        <UL items={[
          '✅ Chiffrement SSL/TLS pour toutes les communications',
          '✅ Authentification à deux facteurs (2FA) disponible',
          '✅ Hébergement sécurisé dans l\'Union Européenne (Supabase / AWS Frankfurt)',
          '✅ Sauvegardes quotidiennes chiffrées',
          '✅ Accès limité aux données (principe du moindre privilège)',
          '✅ Monitoring et détection des intrusions',
          '✅ Audits de sécurité réguliers',
        ]} />
      </Section>

      <Section title="10. Transferts internationaux">
        <P>Vos données sont hébergées en France et au sein de l'Union Européenne. Dans certains cas, elles peuvent être transférées vers des pays tiers (ex : USA pour certains outils d'analyse).</P>
        <P>Ces transferts sont encadrés par des garanties appropriées (Clauses Contractuelles Types de la Commission Européenne).</P>
      </Section>

      <Section title="11. Cookies et technologies similaires">
        <P>
          Notre site utilise des cookies pour améliorer votre expérience. Pour plus d'informations, consultez notre <button onClick={() => navigate('/politique-cookies')} style={{ color: '#667EEA', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', padding: 0 }}>Politique de Cookies</button>.
        </P>
      </Section>

      <Section title="12. Modifications de la politique">
        <P>Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications prendront effet dès leur publication sur cette page.</P>
        <P>Nous vous encourageons à consulter régulièrement cette page pour rester informé de nos pratiques.</P>
      </Section>

      <Section title="13. Réclamation auprès de la CNIL">
        <P>Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) :</P>
        <P>
          <strong>CNIL</strong><br />
          3 Place de Fontenoy<br />
          TSA 80715<br />
          75334 Paris Cedex 07<br />
          Téléphone : 01 53 73 22 22<br />
          Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: '#667EEA' }}>www.cnil.fr</a>
        </P>
      </Section>

      <Section title="14. Contact">
        <P>Pour toute question concernant cette politique de confidentialité ou le traitement de vos données personnelles :</P>
        <Notice>
          📧 Email : dpo@ats-ultimate.com<br />
          📞 Téléphone : [NUMÉRO RÉEL À COMPLÉTER]<br />
          📍 Adresse : GETWORK, 60 rue François 1er, 75008 Paris, France
        </Notice>
      </Section>
    </LegalPage>
  );
}

export default PolitiqueConfidentialite;
