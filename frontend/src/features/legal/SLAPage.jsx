import React from 'react';
import { LegalPage, Section, P, H3, UL, LegalTable } from './LegalPage';

/**
 * Service Level Agreement (SLA) — T-282
 * Définit les engagements de disponibilité, les temps de réponse du support
 * et les procédures d'incident. Contractuellement intégré à l'abonnement.
 */
export function SLAPage() {
  return (
    <LegalPage
      title="Service Level Agreement (SLA)"
      updated="1er juillet 2026"
      notice="Ce SLA définit les engagements de qualité de service de GETWORK. Il fait partie intégrante du contrat d'abonnement. Les crédits de service prévus en cas de non-respect constituent l'unique recours de l'Abonné pour les incidents de disponibilité."
      path="/sla"
    >
      <Section title="1. Définitions">
        <UL items={[
          '« Disponibilité » : capacité des Utilisateurs à se connecter au Service et à exécuter les opérations CRUD de base (lecture/écriture de missions, candidats, candidatures) depuis un réseau internet fonctionnel.',
          '« Indisponibilité » : impossibilité pour tous les Utilisateurs d\'un Abonné d\'accéder au Service pendant plus de 5 minutes consécutives, constatée par notre monitoring.',
          '« Incident Critique » : indisponibilité totale du Service ou perte de données confirmée.',
          '« Incident Haute Priorité » : fonctionnalité majeure inutilisable (ex : pipeline, CVthèque) sans contournement possible.',
          '« Incident Moyenne Priorité » : fonctionnalité dégradée avec contournement disponible.',
          '« Maintenance planifiée » : fenêtre de maintenance annoncée au moins 48h à l\'avance — exclue du calcul de disponibilité.',
          '« Heures ouvrées » : 9h–18h CET/CEST, du lundi au vendredi (hors jours fériés français).',
        ]} />
      </Section>

      <Section title="2. Engagement de disponibilité">
        <LegalTable
          headers={['Plan', 'Objectif d\'uptime', 'Fenêtre de mesure']}
          rows={[
            ['Starter', '99,5 %', 'Par mois calendaire'],
            ['Professional', '99,5 %', 'Par mois calendaire'],
            ['Enterprise', '99,9 %', 'Par mois calendaire (SLA renforcé)'],
          ]}
        />
        <P>Un uptime de 99,5 % représente un maximum de <strong>3h 39min d'indisponibilité</strong> par mois calendaire (hors maintenance planifiée).</P>
        <P>La disponibilité est mesurée par des sondes externes indépendantes toutes les 60 secondes depuis 3 régions géographiques (Europe, Amérique du Nord, Asie-Pacifique). Le statut en temps réel est disponible sur <a href="https://status.ats-ultimate.com" style={{ color: '#667EEA' }}>status.ats-ultimate.com</a>.</P>
      </Section>

      <Section title="3. Temps de réponse du support">
        <LegalTable
          headers={['Priorité', 'Définition', 'Starter', 'Professional', 'Enterprise']}
          rows={[
            ['Critique (P1)', 'Service totalement inaccessible ou perte de données', '4h (24h/7j)', '2h (24h/7j)', '1h (24h/7j)'],
            ['Haute (P2)', 'Fonctionnalité majeure indisponible', '8h ouvrées', '4h ouvrées', '2h ouvrées'],
            ['Moyenne (P3)', 'Fonctionnalité dégradée', '24h ouvrées', '12h ouvrées', '8h ouvrées'],
            ['Basse (P4)', 'Question, amélioration, conseil', '48h ouvrées', '24h ouvrées', '8h ouvrées'],
          ]}
        />
        <P>Le temps de réponse désigne la prise en charge de l'incident (accusé de réception + diagnostic initial), pas nécessairement la résolution.</P>
        <H3>Canaux de support</H3>
        <UL items={[
          'Starter : email uniquement (contact@ats-ultimate.com) + documentation en ligne',
          'Professional : email + chat en ligne (Crisp) pendant les heures ouvrées',
          'Enterprise : email + chat + canal Slack dédié + account manager nommé',
        ]} />
      </Section>

      <Section title="4. Crédits de service en cas de non-respect">
        <P>Si la disponibilité mensuelle mesurée est inférieure à l'objectif contractuel, l'Abonné bénéficie automatiquement des crédits suivants, sur demande formulée dans les 30 jours suivant la fin du mois concerné :</P>
        <LegalTable
          headers={['Disponibilité mensuelle constatée', 'Crédit accordé (% de la facture mensuelle)']}
          rows={[
            ['99,0 % – 99,49 %', '10 %'],
            ['95,0 % – 98,99 %', '25 %'],
            ['< 95,0 %', '50 %'],
          ]}
        />
        <P>Les crédits sont appliqués sur la prochaine facture mensuelle. Ils ne sont pas remboursables en espèces et ne peuvent excéder 50 % d'une facture mensuelle. Les crédits ne sont pas cumulables avec d'autres formes de compensation.</P>
        <H3>Exclusions</H3>
        <P>Les indisponibilités suivantes ne donnent lieu à aucun crédit :</P>
        <UL items={[
          'Maintenance planifiée annoncée au moins 48h à l\'avance',
          'Incidents dus à la connexion internet de l\'Abonné ou à ses équipements',
          'Attaques DDoS d\'une ampleur exceptionnelle (force majeure)',
          'Incidents dus à des tiers (problèmes DNS, CDN tiers, etc.)',
        ]} />
      </Section>

      <Section title="5. Procédure de gestion des incidents">
        <H3>5.1 Détection et notification</H3>
        <P>Notre monitoring automatique détecte les incidents 24h/24. Dès détection d'un incident P1 ou P2, une notification est publiée sur <a href="https://status.ats-ultimate.com" style={{ color: '#667EEA' }}>status.ats-ultimate.com</a> et envoyée par email à l'administrateur principal du compte.</P>
        <H3>5.2 Communication pendant l'incident</H3>
        <P>Des mises à jour sont publiées sur la page de statut toutes les 30 minutes pour les incidents P1, et toutes les 2 heures pour les incidents P2.</P>
        <H3>5.3 Post-mortem</H3>
        <P>Pour tout incident P1 ayant causé plus de 30 minutes d'indisponibilité, un rapport post-mortem détaillé (cause racine, chronologie, actions correctives) est publié dans les 5 jours ouvrés.</P>
      </Section>

      <Section title="6. Objectifs de performance (hors SLA contractuel)">
        <P>À titre informatif, ATS Ultimate vise les performances suivantes (non contractuelles) :</P>
        <LegalTable
          headers={['Métrique', 'Objectif']}
          rows={[
            ['Temps de réponse API (p95)', '< 300 ms'],
            ['Temps de chargement des pages (LCP)', '< 2,5 s'],
            ['Time to First Byte (TTFB)', '< 200 ms'],
            ['RTO (Recovery Time Objective)', '< 4 heures'],
            ['RPO (Recovery Point Objective)', '< 24 heures'],
          ]}
        />
      </Section>

      <Section title="7. Rétention des données et sauvegardes">
        <UL items={[
          'Sauvegardes automatiques quotidiennes avec rétention de 30 jours (Supabase)',
          'Possibilité de restauration à un point précis dans le temps (PITR) sur demande — Enterprise uniquement',
          'Les sauvegardes sont stockées dans une région AWS distincte de la région primaire',
        ]} />
      </Section>
    </LegalPage>
  );
}

export default SLAPage;
