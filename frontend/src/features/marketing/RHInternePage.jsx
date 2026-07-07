import React from 'react';
import { VerticalLandingPage } from './VerticalLandingPage';

const CONTENT = {
  seo: {
    title: 'ATS pour Équipes RH Internes — Recrutez sans chaos | ATS Ultimate',
    description: 'Logiciel ATS pour équipes RH internes. Centralisez toutes vos offres, candidatures et processus de recrutement. Collaborez avec les managers. Sans engagement.',
    url: 'https://ats-ultimate.com/rh-interne',
  },
  segment: { label: 'équipes RH internes', customerCount: '300' },
  hero: {
    badge: '🏗️ Spécial RH Interne',
    gradient: 'linear-gradient(135deg, #065F46 0%, #047857 40%, #059669 70%, #10B981 100%)',
    title: 'Recrutez plus vite, sans <em>perdre les bonnes candidatures</em>',
    subtitle: 'Un ATS pensé pour les équipes RH internes qui jonglent entre plusieurs postes, managers et processus de validation. Tout au même endroit.',
  },
  pains: {
    title: 'Vos galères de recruteur RH',
    subtitle: 'Le recrutement interne a ses propres contraintes — ATS Ultimate les connaît.',
    items: [
      { icon: '📧', title: 'Emails et CV éparpillés', text: 'Les CVs arrivent par email, LinkedIn, jobboards. Sans centralisation, vous perdez des candidats prometteurs dans votre boîte mail.' },
      { icon: '👥', title: 'Managers à coordonner', text: 'Faire valider les candidatures par les managers opérationnels sans outil de collaboration entraîne des aller-retours sans fin par email.' },
      { icon: '📊', title: 'Aucune visibilité globale', text: 'La direction vous demande combien de postes sont ouverts, en cours, combien de candidats en attente. Impossible à répondre rapidement.' },
      { icon: '⚖️', title: 'Conformité RGPD', text: 'Gérer le consentement des candidats, les délais de conservation des CVs et le droit à l\'oubli manuellement est un risque juridique permanent.' },
    ],
  },
  stats: [
    { value: '-45%', label: 'Temps de recrutement (TTH)' },
    { value: '100%', label: 'Conformité RGPD automatique' },
    { value: '2 jours', label: 'Pour collaborer avec vos managers' },
    { value: '0 CV', label: 'Perdu dans les emails' },
  ],
  features: {
    title: 'Fonctionnalités taillées pour le RH interne',
    subtitle: 'Chaque feature a été conçue en écoutant des DRH et chargés de recrutement.',
    items: [
      {
        tag: 'Centralisation multi-sources',
        title: 'Un seul endroit pour toutes vos candidatures',
        text: 'Connectez vos jobboards, importez des CVs par email ou CSV. Toutes les candidatures arrivent dans votre pipeline, classées et dédoublonnées automatiquement.',
        checks: ['Import CV multi-formats (PDF, Word)', 'Parsing automatique par IA', 'Détection de doublons', 'Historique complet du candidat'],
        mockIcon: '📥',
      },
      {
        tag: 'Collaboration managers',
        title: 'Impliquez vos managers sans les noyer',
        text: 'Partagez des profils avec les managers opérationnels via un lien sécurisé. Ils donnent leur avis sans avoir à créer un compte.',
        checks: ['Lien de partage sécurisé (7 jours)', 'Grille d\'évaluation structurée', 'Workflow d\'approbation', 'Notifications par email'],
        mockIcon: '🤝',
      },
      {
        tag: 'Analytics & reporting',
        title: 'Prouvez votre impact en chiffres',
        text: 'Dashboards temps réel : time-to-hire, sources de candidats, taux de conversion par étape, coût par recrutement. Prêt à présenter en CODIR.',
        checks: ['Tableau de bord temps réel', 'Rapport exportable PDF', 'Funnel de conversion', 'Comparaison inter-périodes'],
        mockIcon: '📈',
      },
    ],
  },
  testimonials: {
    title: 'Des équipes RH qui respirent enfin',
    subtitle: 'Ils ont arrêté de courir après les candidatures.',
    items: [
      { quote: 'Avant on perdait des candidats dans les emails. Maintenant tout est dans le pipeline, les managers voient l\'avancement en temps réel.', name: 'Sophie Bertrand', role: 'DRH, Groupe Manufacture (800 pers.)', avatar: '👩‍💼', metric: 'TTH réduit de 32 → 18 jours' },
      { quote: 'La conformité RGPD était notre hantise. Avec ATS Ultimate c\'est géré automatiquement — consentements, purge, exports.', name: 'Thomas Renard', role: 'HRBP, Société Dupont Industries', avatar: '👨‍💼', metric: '100% des candidats sous consentement' },
      { quote: 'Je présente maintenant des analytics à la direction sans passer une heure à compiler des Excel. Ça change tout.', name: 'Anaïs Picard', role: 'Chargée de recrutement, TechStartup Paris', avatar: '👩', metric: '-70% de temps sur les reportings' },
    ],
  },
};

export function RHInternePage() {
  return <VerticalLandingPage {...CONTENT} />;
}

export default RHInternePage;
