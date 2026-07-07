import React from 'react';
import { LegalPage, Section, P, H3, UL, LegalTable, Warn } from './LegalPage';

/**
 * Registre des traitements RGPD — T-286
 * Document obligatoire en vertu de l'Article 30 du RGPD.
 * ATS Ultimate agit en qualité de responsable de traitement pour les données
 * de ses Abonnés/Utilisateurs, et de sous-traitant pour les données des Candidats.
 * Ce registre couvre les traitements pour lesquels ATS Ultimate est responsable.
 */
export function RegistreRGPD() {
  return (
    <LegalPage
      title="Registre des traitements RGPD"
      updated="1er juillet 2026"
      notice="Document Article 30 RGPD. GETWORK tient ce registre à jour et le met à la disposition de la CNIL sur demande. Il est également accessible aux Abonnés qui souhaitent en disposer pour leur propre conformité."
      path="/registre-rgpd"
    >
      <Section title="Responsable des traitements">
        <LegalTable
          headers={['Champ', 'Valeur']}
          rows={[
            ['Nom commercial', 'GETWORK (exploitant le site ATS Ultimate)'],
            ['Forme juridique', 'Entrepreneur individuel (micro-entreprise)'],
            ['SIRET', '524 304 714 00032'],
            ['Entrepreneur individuel', 'Sébastien (GETWORK)'],
            ['DPO (Délégué à la Protection des Données)', 'dpo@ats-ultimate.com'],
            ['Adresse', '60 rue François 1er, 75008 Paris, France'],
          ]}
        />
      </Section>

      <Section title="Traitement n°1 — Gestion des comptes Abonnés">
        <LegalTable
          headers={['Élément', 'Détail']}
          rows={[
            ['Finalité', 'Création et gestion des comptes entreprises, facturation, support client'],
            ['Base légale', 'Exécution du contrat (Art. 6(1)(b) RGPD)'],
            ['Catégories de personnes', 'Représentants légaux et administrateurs des entreprises Abonnées'],
            ['Données traitées', 'Nom, prénom, email professionnel, téléphone, nom de l\'entreprise, SIRET, adresse'],
            ['Durée de conservation', '5 ans après la fin du contrat (obligations comptables)'],
            ['Destinataires', 'Équipe commerciale et support ATS Ultimate ; Stripe (facturation) ; comptable'],
            ['Transferts hors UE', 'Aucun'],
          ]}
        />
      </Section>

      <Section title="Traitement n°2 — Gestion des Utilisateurs du Service">
        <LegalTable
          headers={['Élément', 'Détail']}
          rows={[
            ['Finalité', 'Accès authentifié au Service, journalisation des actions, sécurité'],
            ['Base légale', 'Exécution du contrat (Art. 6(1)(b)) + Intérêt légitime sécurité (Art. 6(1)(f))'],
            ['Catégories de personnes', 'Recruteurs, RH, managers ayant un accès au Service'],
            ['Données traitées', 'Nom, prénom, email professionnel, rôle, logs de connexion (IP, date, heure)'],
            ['Durée de conservation', '3 ans après la dernière connexion ; logs : 90 jours'],
            ['Destinataires', 'Supabase (hébergement auth) ; Sentry (erreurs, anonymisé)'],
            ['Transferts hors UE', 'Aucun (données EU Frankfurt)'],
          ]}
        />
      </Section>

      <Section title="Traitement n°3 — Prospection commerciale">
        <LegalTable
          headers={['Élément', 'Détail']}
          rows={[
            ['Finalité', 'Envoi d\'emails commerciaux, suivi des leads, contenu marketing'],
            ['Base légale', 'Intérêt légitime (Art. 6(1)(f)) pour les professionnels ; Consentement pour les particuliers'],
            ['Catégories de personnes', 'Prospects professionnels (RH, DRH, dirigeants)'],
            ['Données traitées', 'Email professionnel, nom, entreprise, secteur, interactions marketing'],
            ['Durée de conservation', '3 ans après dernier contact ou exercice du droit d\'opposition'],
            ['Destinataires', 'Équipe commerciale ; outil CRM (Formspree/HubSpot si configuré)'],
            ['Transferts hors UE', 'HubSpot : États-Unis (SCC + Privacy Shield successor)'],
          ]}
        />
      </Section>

      <Section title="Traitement n°4 — Analytics et amélioration du Service">
        <LegalTable
          headers={['Élément', 'Détail']}
          rows={[
            ['Finalité', 'Mesure d\'audience, amélioration du Service, détection d\'erreurs'],
            ['Base légale', 'Consentement (cookies analytics — Art. 6(1)(a)) ; Intérêt légitime (monitoring technique)'],
            ['Catégories de personnes', 'Visiteurs du site et Utilisateurs du Service'],
            ['Données traitées', 'Pages vues, interactions, durée de session, IP anonymisée, type d\'appareil'],
            ['Durée de conservation', '13 mois (Google Analytics) ; 30 jours (logs Sentry anonymisés)'],
            ['Destinataires', 'Google Ireland (GA4, si consentement) ; Sentry (erreurs, anonymisé)'],
            ['Transferts hors UE', 'Google : Irlande (UE) avec possible accès US (SCC)'],
          ]}
        />
      </Section>

      <Section title="Traitement n°5 — Hébergement et sous-traitance des données Candidats">
        <Warn>
          Pour ce traitement, GETWORK agit en qualité de <strong>sous-traitant</strong> pour le compte de chaque Abonné (responsable de traitement). Les obligations réciproques sont définies dans le DPA disponible à <a href="/dpa" style={{ color: '#7C3AED' }}>ats-ultimate.com/dpa</a>. Ce traitement ne fait pas partie du présent registre "responsable de traitement" — chaque Abonné tient son propre registre pour les traitements de données Candidats.
        </Warn>
        <P>Les mesures de sécurité mises en œuvre pour ce traitement de sous-traitance sont décrites dans le DPA (Article 3.3).</P>
      </Section>

      <Section title="Droits des personnes concernées">
        <P>Les personnes concernées par les traitements pour lesquels ATS Ultimate est responsable (Abonnés, Utilisateurs, prospects) peuvent exercer leurs droits :</P>
        <UL items={[
          'Droit d\'accès (Art. 15 RGPD) : accès à l\'ensemble des données traitées',
          'Droit de rectification (Art. 16) : correction des données inexactes',
          'Droit à l\'effacement (Art. 17) : suppression des données sous réserve d\'obligations légales',
          'Droit à la portabilité (Art. 20) : export des données dans un format standard',
          'Droit d\'opposition (Art. 21) : opposition à la prospection commerciale',
          'Droit de limitation (Art. 18) : restriction temporaire du traitement pendant un litige',
        ]} />
        <P>Demandes à adresser à : <a href="mailto:dpo@ats-ultimate.com" style={{ color: '#667EEA' }}>dpo@ats-ultimate.com</a> — Délai de réponse : 1 mois (extensible à 3 mois pour les demandes complexes).</P>
        <P>Droit de réclamation auprès de la CNIL : <a href="https://www.cnil.fr/fr/plaintes" style={{ color: '#667EEA' }} target="_blank" rel="noopener noreferrer">www.cnil.fr/fr/plaintes</a></P>
      </Section>

      <Section title="Mesures de sécurité générales (Art. 30(1)(g) RGPD)">
        <UL items={[
          'Hébergement exclusif dans l\'Union Européenne (AWS Frankfurt, région eu-central-1)',
          'Chiffrement en transit (TLS 1.3) et au repos (AES-256)',
          'Isolation multi-tenant par Row Level Security (RLS)',
          'Authentification forte (2FA TOTP) pour les accès admin',
          'Accès aux données de production limité et journalisé',
          'Revue de code sécurisé et tests d\'intrusion annuels',
          'Formation RGPD de l\'ensemble des collaborateurs',
          'Contrats de sous-traitance conformes Art. 28 RGPD avec tous les prestataires',
        ]} />
      </Section>
    </LegalPage>
  );
}

export default RegistreRGPD;
