import React from 'react';
import { LegalPage, Section, P, H3, UL, Warn, LegalTable } from './LegalPage';

/**
 * Conditions Générales d'Utilisation — T-279
 * Rédigé selon le droit français (Code de la consommation, RGPD, Loi LCEN).
 * ⚠️ Ce document est un modèle complet à faire valider par un avocat avant
 * mise en production commerciale.
 */
export function CGU() {
  return (
    <LegalPage
      title="Conditions Générales d'Utilisation"
      updated="1er juillet 2026"
      notice="Les présentes CGU constituent un contrat juridiquement contraignant entre vous (l'Utilisateur) et GETWORK. En créant un compte ou en utilisant le Service, vous acceptez sans réserve l'ensemble des dispositions ci-dessous."
      path="/cgu"
    >
      <Section title="1. Définitions">
        <P>Au sens des présentes CGU, les termes suivants désignent :</P>
        <UL items={[
          '« Éditeur » : GETWORK, entrepreneur individuel (micro-entreprise) exploitant le site ATS Ultimate, SIRET 524 304 714 00032, immatriculé 524 304 714 R.C.S. Paris, dont le siège est situé 60 rue François 1er, 75008 Paris.',
          '« Service » : la plateforme SaaS de suivi des candidatures (ATS) accessible à l\'adresse ats-ultimate.com et par API, incluant toutes les fonctionnalités documentées.',
          '« Utilisateur » : toute personne physique (recruteur, RH, manager) agissant pour le compte d\'un Abonné et utilisant le Service.',
          '« Abonné » : la personne morale (entreprise, cabinet, agence) titulaire du compte et signataire du contrat d\'abonnement.',
          '« Candidat » : toute personne physique dont les données sont traitées dans le Service à des fins de recrutement.',
          '« Données personnelles » : au sens du RGPD (UE) 2016/679, toute information permettant d\'identifier directement ou indirectement une personne physique.',
          '« Contenu » : l\'ensemble des informations, données, textes, fichiers (CV, lettres de motivation, etc.) téléversés ou générés par les Utilisateurs dans le Service.',
        ]} />
      </Section>

      <Section title="2. Objet et champ d'application">
        <P>Les présentes CGU ont pour objet de définir les droits et obligations des parties dans le cadre de la mise à disposition et de l'utilisation du Service.</P>
        <P>Elles s'appliquent, sans restriction ni réserve, à tous les Utilisateurs du Service, quelle que soit la formule d'abonnement souscrite. Elles prévalent sur toute condition générale ou particulière non expressément agréée par l'Éditeur.</P>
        <P>Les Conditions Générales de Vente (CGV) et, le cas échéant, le Data Processing Agreement (DPA) constituent, avec les présentes CGU, l'ensemble contractuel régissant la relation entre l'Éditeur et l'Abonné.</P>
      </Section>

      <Section title="3. Accès au Service et création de compte">
        <H3>3.1 Eligibilité</H3>
        <P>Le Service est exclusivement réservé aux professionnels (B2B). L'Abonné doit être une personne morale régulièrement constituée et l'Utilisateur doit agir dans le cadre de son activité professionnelle. L'accès au Service est interdit aux mineurs de moins de 18 ans.</P>
        <H3>3.2 Inscription et compte</H3>
        <P>La création d'un compte nécessite de fournir des informations exactes, complètes et à jour. L'Utilisateur est seul responsable de la confidentialité de ses identifiants. Tout accès au Service avec ses identifiants est présumé être effectué par l'Utilisateur. En cas de perte ou de compromission, l'Utilisateur doit immédiatement notifier l'Éditeur via contact@ats-ultimate.com.</P>
        <H3>3.3 Accès multi-utilisateurs</H3>
        <P>L'Abonné peut créer plusieurs comptes Utilisateurs dans la limite du quota associé à son plan. Il est responsable du respect des présentes CGU par l'ensemble des Utilisateurs de son compte.</P>
      </Section>

      <Section title="4. Description du Service">
        <P>ATS Ultimate est une plateforme SaaS de gestion du recrutement comprenant notamment :</P>
        <UL items={[
          'Gestion des missions et offres d\'emploi avec workflow de validation',
          'CVthèque avec recherche sémantique et scoring IA',
          'Pipeline Kanban de suivi des candidatures',
          'Portail carrières public personnalisable',
          'Formulaire de candidature multi-étapes configurable',
          'Grille d\'évaluation structurée et partage sécurisé avec managers',
          'Analytics recrutement (funnel de conversion, time-to-hire, sources)',
          'Outils de conformité RGPD (consentement, droit à l\'oubli, export ZIP)',
          'Calendrier et gestion des entretiens',
        ]} />
        <P>L'Éditeur se réserve le droit de faire évoluer le Service (ajout ou suppression de fonctionnalités) avec un préavis de 30 jours pour les suppressions substantielles, notifié par email.</P>
      </Section>

      <Section title="5. Obligations de l'Utilisateur">
        <H3>5.1 Utilisation conforme</H3>
        <P>L'Utilisateur s'engage à utiliser le Service exclusivement à des fins de recrutement légitimes et conformément au droit applicable. Il est notamment interdit :</P>
        <UL items={[
          'd\'utiliser le Service à des fins discriminatoires (critères protégés par l\'Article L. 1132-1 du Code du travail : origine, sexe, âge, handicap, etc.)',
          'de collecter ou traiter des données sans base légale valable au sens du RGPD',
          'de partager ses identifiants de connexion avec des tiers non autorisés',
          'de tenter de contourner les mesures de sécurité du Service',
          'de scraper, extraire ou copier les données du Service par des moyens automatisés',
          'd\'introduire des virus, chevaux de Troie ou tout autre code malveillant',
          'd\'utiliser le Service pour le compte d\'un concurrent de l\'Éditeur à des fins d\'espionnage commercial',
        ]} />
        <H3>5.2 Responsabilité sur le Contenu</H3>
        <P>L'Abonné est seul responsable du Contenu téléversé ou créé dans le Service. Il garantit disposer de toutes les autorisations nécessaires pour le traitement des données des Candidats (base légale RGPD, information préalable, durée de conservation).</P>
        <Warn>L'utilisation de critères de sélection discriminatoires (âge, sexe, origine, état de santé, situation de famille…) dans le Service constitue une infraction pénale passible de 3 ans d'emprisonnement et 45 000 € d'amende (Article 225-1 du Code pénal). L'Éditeur se réserve le droit de signaler tout usage suspect aux autorités compétentes.</Warn>
      </Section>

      <Section title="6. Propriété intellectuelle">
        <H3>6.1 Droits de l'Éditeur</H3>
        <P>Le Service, son architecture, son code source, ses bases de données, ses interfaces et toute documentation associée sont la propriété exclusive de l'Éditeur et sont protégés par les lois françaises et internationales sur la propriété intellectuelle. L'Abonné bénéficie d'une licence d'utilisation personnelle, non exclusive, non transférable et limitée à la durée de l'abonnement.</P>
        <H3>6.2 Droits de l'Abonné sur son Contenu</H3>
        <P>L'Abonné conserve l'intégralité des droits sur le Contenu qu'il téléverse ou crée dans le Service. Il concède à l'Éditeur une licence mondiale, non exclusive, pour héberger, stocker, reproduire et afficher ce Contenu dans le seul but de fournir le Service. Cette licence prend fin à la résiliation du contrat.</P>
        <H3>6.3 Données anonymisées</H3>
        <P>L'Éditeur se réserve le droit d'utiliser des données strictement anonymisées et agrégées (sans possibilité d'identification des personnes) pour améliorer le Service, produire des statistiques sectorielles et entraîner ses modèles d'IA.</P>
      </Section>

      <Section title="7. Protection des données personnelles">
        <P>Dans le cadre du Service, l'Éditeur agit en qualité de <strong>sous-traitant</strong> pour les données des Candidats traitées par l'Abonné (responsable de traitement), conformément à l'Article 28 du RGPD. Les modalités de ce traitement sont définies dans le Data Processing Agreement (DPA) disponible à l'adresse <a href="/dpa" style={{ color: '#667EEA' }}>ats-ultimate.com/dpa</a>.</P>
        <P>Pour les données des Utilisateurs (prénom, nom, email professionnel, logs de connexion), l'Éditeur agit en qualité de responsable de traitement. Ces traitements sont décrits dans la <a href="/politique-confidentialite" style={{ color: '#667EEA' }}>Politique de confidentialité</a>.</P>
        <P>Les données sont hébergées exclusivement dans l'Union Européenne (Supabase / AWS Frankfurt). Aucun transfert hors UE n'est effectué sans garanties appropriées (clauses contractuelles types).</P>
      </Section>

      <Section title="8. Disponibilité du Service et SLA">
        <P>L'Éditeur s'engage à maintenir le Service disponible avec un objectif d'uptime de <strong>99,5 %</strong> par mois calendaire (hors maintenance planifiée et force majeure). Les temps de réponse du support sont détaillés dans le <a href="/sla" style={{ color: '#667EEA' }}>Service Level Agreement</a>.</P>
        <P>Les maintenances programmées sont notifiées par email au moins 48 heures à l'avance et réalisées autant que possible en dehors des heures de bureau (18h–7h CET, week-ends).</P>
        <P>En cas d'indisponibilité dépassant les seuils SLA, les crédits de service applicables sont définis dans le SLA et constituent l'unique recours de l'Abonné pour ce type d'incident.</P>
      </Section>

      <Section title="9. Limitation de responsabilité">
        <H3>9.1 Responsabilité de l'Éditeur</H3>
        <P>La responsabilité de l'Éditeur est limitée, en tout état de cause, aux dommages directs prouvés, dans la limite des sommes effectivement payées par l'Abonné au cours des <strong>3 (trois) derniers mois</strong> précédant l'événement générateur.</P>
        <P>L'Éditeur ne saurait être tenu responsable des dommages indirects, prévisibles ou non (perte de chiffre d'affaires, perte de données, manque à gagner, atteinte à la réputation) résultant de l'utilisation ou de l'impossibilité d'utiliser le Service.</P>
        <H3>9.2 Force majeure</H3>
        <P>L'Éditeur est exonéré de toute responsabilité en cas de force majeure au sens de l'Article 1218 du Code civil (catastrophe naturelle, acte de piratage externe, défaillance des fournisseurs d'infrastructure, pandémie, décision gouvernementale, etc.).</P>
        <H3>9.3 Responsabilité de l'Abonné</H3>
        <P>L'Abonné est seul responsable des conséquences juridiques et financières résultant d'une utilisation du Service non conforme aux présentes CGU ou au droit applicable, notamment en matière de droit du travail, de non-discrimination et de protection des données.</P>
      </Section>

      <Section title="10. Durée, résiliation et suspension">
        <H3>10.1 Durée</H3>
        <P>Le contrat est conclu pour une durée indéterminée à compter de la souscription. Les abonnements mensuels sont tacitement reconduits chaque mois ; les abonnements annuels sont tacitement reconduits chaque année.</P>
        <H3>10.2 Résiliation par l'Abonné</H3>
        <P>L'Abonné peut résilier son abonnement à tout moment depuis l'interface d'administration ou par email à contact@ats-ultimate.com. La résiliation prend effet à la fin de la période en cours. Aucun remboursement prorata temporis n'est effectué pour les abonnements mensuels déjà facturés.</P>
        <H3>10.3 Résiliation par l'Éditeur</H3>
        <P>L'Éditeur peut résilier le contrat de plein droit, sans préavis ni indemnité, en cas de : (i) non-paiement persistant après mise en demeure de 15 jours, (ii) violation grave des présentes CGU (usage discriminatoire, atteinte à la sécurité), (iii) décision judiciaire.</P>
        <H3>10.4 Effets de la résiliation</H3>
        <P>À la date de résiliation, l'accès au Service est immédiatement révoqué. Les données sont exportables pendant une période de 30 jours suivant la résiliation, puis supprimées définitivement de nos serveurs dans un délai de 90 jours.</P>
      </Section>

      <Section title="11. Modifications des CGU">
        <P>L'Éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les modifications substantielles sont notifiées par email avec un préavis de <strong>30 jours</strong>. La poursuite de l'utilisation du Service après ce délai vaut acceptation des nouvelles CGU. En cas de refus des nouvelles CGU, l'Abonné peut résilier son contrat sans frais dans le délai de préavis.</P>
      </Section>

      <Section title="12. Droit applicable et juridiction">
        <P>Les présentes CGU sont soumises au droit français. En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut d'accord dans un délai de 30 jours, le litige sera soumis à la compétence exclusive des tribunaux de Paris, nonobstant pluralité de défendeurs ou appel en garantie.</P>
        <P>Conformément à l'Article L. 616-1 du Code de la consommation (si applicable), l'Abonné peut recourir à un médiateur. L'Éditeur a désigné : <em>[Nom du médiateur — à compléter avant mise en production commerciale]</em>.</P>
      </Section>

      <Section title="13. Dispositions diverses">
        <P>Si une clause des présentes CGU est déclarée nulle ou inapplicable par une juridiction compétente, elle est réputée non écrite et les autres clauses demeurent en vigueur. Le fait pour l'Éditeur de ne pas se prévaloir d'un manquement de l'Abonné ne saurait être interprété comme une renonciation à se prévaloir ultérieurement de ce manquement.</P>
        <P>Pour toute question relative aux présentes CGU : <a href="mailto:legal@ats-ultimate.com" style={{ color: '#667EEA' }}>legal@ats-ultimate.com</a></P>
      </Section>
    </LegalPage>
  );
}

export default CGU;
