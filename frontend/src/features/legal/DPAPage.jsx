import React from 'react';
import { LegalPage, Section, P, H3, UL, LegalTable, Notice } from './LegalPage';

/**
 * Data Processing Agreement — T-281
 * Accord de sous-traitance des données personnelles obligatoire sous RGPD
 * Article 28. Ce document formalise la relation responsable/sous-traitant entre
 * l'Abonné (responsable de traitement) et GETWORK (sous-traitant).
 */
export function DPAPage() {
  return (
    <LegalPage
      title="Data Processing Agreement (DPA)"
      updated="1er juillet 2026"
      notice="Ce document constitue l'Accord de Traitement des Données au sens de l'Article 28 du RGPD (UE) 2016/679. Il est automatiquement intégré au contrat d'abonnement ATS Ultimate dès l'inscription. Il peut être téléchargé et signé électroniquement depuis les paramètres admin."
      path="/dpa"
    >
      <Section title="1. Contexte et qualification des parties">
        <P>Dans le cadre de l'utilisation du Service ATS Ultimate :</P>
        <UL items={[
          'L\'<strong>Abonné</strong> (ci-après le « Responsable du traitement ») collecte et traite des données personnelles de Candidats à des fins de recrutement. Il détermine les finalités et les moyens de ces traitements.',
          'GETWORK (ci-après le « Sous-traitant »), entrepreneur individuel exploitant le site ATS Ultimate, fournit les outils techniques permettant à l\'Abonné de réaliser ces traitements, sans jamais les initier pour son propre compte.',
        ]} />
        <P>Cette qualification est conforme à l'Article 4, paragraphes 7 et 8, du RGPD. Le présent DPA fixe les obligations du Sous-traitant vis-à-vis du Responsable du traitement.</P>
      </Section>

      <Section title="2. Objet et durée du traitement">
        <H3>2.1 Objet</H3>
        <P>Le Sous-traitant traite les données personnelles suivantes pour le compte du Responsable du traitement :</P>
        <LegalTable
          headers={['Catégorie de données', 'Exemples', 'Finalité']}
          rows={[
            ['Identité Candidat', 'Nom, prénom, email, téléphone', 'Identification dans le pipeline recrutement'],
            ['Données professionnelles', 'CV, lettres de motivation, compétences, expériences', 'Évaluation de la candidature'],
            ['Données d\'évaluation', 'Notes d\'entretien, scores IA, grille d\'évaluation', 'Aide à la décision de recrutement'],
            ['Données de candidature', 'Statut, historique des étapes, réponses aux questions de pré-sélection', 'Suivi du processus de recrutement'],
            ['Données sensibles (si collectées par l\'Abonné)', 'Situation de handicap (RQTH uniquement si bases légales applicables)', 'Adaptation du processus de recrutement'],
          ]}
        />
        <H3>2.2 Durée</H3>
        <P>Le traitement dure pendant toute la durée du contrat d'abonnement, augmentée de 30 jours après la résiliation (délai d'export). À l'issue de ce délai, les données sont supprimées définitivement selon la procédure décrite à l'Article 7.</P>
      </Section>

      <Section title="3. Obligations du Sous-traitant (GETWORK)">
        <H3>3.1 Traitement sur instruction documentée</H3>
        <P>Le Sous-traitant ne traite les données qu'<strong>uniquement sur instruction documentée</strong> du Responsable du traitement, sauf obligation légale contraire. Il informe immédiatement le Responsable s'il estime qu'une instruction constitue une violation du RGPD.</P>
        <H3>3.2 Confidentialité</H3>
        <P>Le Sous-traitant garantit que les personnes autorisées à traiter les données (ingénieurs, support) sont soumises à une obligation contractuelle de confidentialité et reçoivent une formation RGPD appropriée. L'accès aux données de production est strictement limité et audité.</P>
        <H3>3.3 Sécurité technique et organisationnelle</H3>
        <P>Conformément à l'Article 32 du RGPD, le Sous-traitant met en œuvre les mesures suivantes :</P>
        <UL items={[
          'Chiffrement des données en transit (TLS 1.3) et au repos (AES-256, géré par Supabase/AWS)',
          'Isolation multi-tenant par Row Level Security (RLS) Postgres — les données de chaque Abonné sont inaccessibles aux autres',
          'Authentification forte (2FA TOTP disponible) et gestion des sessions sécurisée',
          'Sauvegardes automatiques quotidiennes avec rétention de 30 jours',
          'Journaux d\'accès aux données de production conservés 90 jours',
          'Tests d\'intrusion annuels et programme de bug bounty',
          'Plan de continuité et de reprise d\'activité (RTO < 4h, RPO < 24h)',
        ]} />
        <H3>3.4 Notification des violations</H3>
        <P>En cas de violation de données personnelles, le Sous-traitant notifie le Responsable du traitement dans un délai de <strong>72 heures</strong> après en avoir pris connaissance, par email à l'adresse administrateur du compte, avec toutes les informations disponibles (nature, catégories de données, nombre de personnes concernées, mesures prises).</P>
        <H3>3.5 Assistance au Responsable</H3>
        <P>Le Sous-traitant assiste le Responsable du traitement pour répondre aux obligations suivantes :</P>
        <UL items={[
          'Exercice des droits des personnes concernées (accès, rectification, effacement, portabilité) : via les outils disponibles dans l\'interface admin et l\'API',
          'Analyses d\'impact (DPIA) : fourniture de documentation technique sur demande',
          'Notification à la CNIL : transmission des informations pertinentes dans les délais',
        ]} />
      </Section>

      <Section title="4. Sous-traitants ultérieurs">
        <P>Le Sous-traitant fait appel aux sous-traitants ultérieurs suivants :</P>
        <LegalTable
          headers={['Sous-traitant', 'Pays', 'Rôle', 'Garanties']}
          rows={[
            ['Supabase Inc.', 'UE (AWS Frankfurt eu-central-1)', 'Hébergement base de données Postgres, authentification', 'RGPD conforme, DPA disponible, SCC'],
            ['Amazon Web Services (AWS)', 'UE (Frankfurt)', 'Infrastructure cloud sous-jacente à Supabase', 'RGPD conforme, BCR, SCC'],
            ['Stripe Inc.', 'UE (Dublin)', 'Paiement en ligne (aucune donnée candidat)', 'PCI-DSS L1, RGPD conforme'],
            ['Sentry (Functional Software)', 'UE (Frankfurt)', 'Monitoring erreurs (données anonymisées)', 'RGPD conforme, SCC'],
          ]}
        />
        <P>Le Responsable du traitement autorise le recours aux sous-traitants listés ci-dessus. Tout ajout de nouveau sous-traitant est notifié avec un préavis de 30 jours. Le Responsable dispose d'un droit d'objection motivé.</P>
      </Section>

      <Section title="5. Transferts hors UE">
        <P>Tous les données personnelles de Candidats sont hébergées <strong>exclusivement dans l'Union Européenne</strong> (AWS Frankfurt). Aucun transfert de données vers des pays tiers n'est effectué sans garanties appropriées (clauses contractuelles types de la Commission européenne).</P>
        <P>L'utilisation de services en mode SaaS impliquant des accès ponctuels depuis des équipes support (États-Unis pour Supabase) est encadrée par des clauses contractuelles types et des accès limités au support technique, sans stockage permanent hors UE.</P>
      </Section>

      <Section title="6. Audit et conformité">
        <P>Le Responsable du traitement dispose du droit de réaliser ou faire réaliser un audit de conformité du Sous-traitant, avec un préavis de 30 jours et sous réserve de signature d'un accord de confidentialité. Le Sous-traitant peut satisfaire à cette obligation en fournissant les certifications et rapports d'audit disponibles (SOC 2, ISO 27001 de ses sous-traitants ultérieurs).</P>
      </Section>

      <Section title="7. Sort des données à la fin du contrat">
        <P>À la fin du contrat d'abonnement :</P>
        <UL items={[
          'Pendant 30 jours : les données restent accessibles en lecture seule pour permettre l\'export.',
          'Après 30 jours : les données sont supprimées de manière sécurisée et irréversible de toutes les couches de stockage (base de données, sauvegardes incluses dans les 90 jours suivant la dernière sauvegarde contenant ces données).',
          'Sur demande : un certificat de suppression peut être fourni dans un délai de 10 jours ouvrés.',
        ]} />
      </Section>

      <Section title="8. Contact DPO et réclamations">
        <P>Pour toute question relative à ce DPA ou à la protection des données :</P>
        <UL items={[
          'Email DPO : dpo@ats-ultimate.com',
          'Adresse postale : GETWORK, 60 rue François 1er, 75008 Paris, France',
          'Autorité de contrôle compétente : CNIL (www.cnil.fr) — 3 Place de Fontenoy, 75007 Paris',
        ]} />
        <Notice>
          Pour télécharger ce DPA au format PDF signable électroniquement, rendez-vous dans <strong>Paramètres Admin → RGPD → Télécharger le DPA</strong>. La signature numérique de ce document par l'Abonné est recommandée pour les entreprises soumises à des obligations de documentation renforcées (audit, certification ISO 27001, etc.).
        </Notice>
      </Section>
    </LegalPage>
  );
}

export default DPAPage;
