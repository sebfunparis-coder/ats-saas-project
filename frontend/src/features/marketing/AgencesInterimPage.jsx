import React from 'react';
import { VerticalLandingPage } from './VerticalLandingPage';

const CONTENT = {
  seo: {
    title: 'ATS pour Agences d\'Intérim — Gérez 10x plus de missions | ATS Ultimate',
    description: 'Logiciel ATS conçu pour les agences d\'intérim. Gérez vos candidats intérimaires, vos clients entreprises et vos délégations en un seul outil. Sans engagement.',
    url: 'https://ats-ultimate.com/agences-interim',
  },
  segment: { label: 'agences d\'intérim', customerCount: '150' },
  hero: {
    badge: '🏭 Spécial Agences d\'Intérim',
    gradient: 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 40%, #2563EB 70%, #3B82F6 100%)',
    title: 'Le logiciel ATS fait pour les <em>agences d\'intérim</em>',
    subtitle: 'Gérez vos intérimaires, vos clients entreprises et vos délégations dans un seul outil. Moins d\'administratif, plus de placements.',
  },
  pains: {
    title: 'On connaît vos défis quotidiens',
    subtitle: 'Les outils généralistes ne sont pas pensés pour le rythme des agences d\'intérim.',
    items: [
      { icon: '📁', title: 'CVthèque inexploitée', text: 'Des milliers de profils dans des fichiers Excel ou des logiciels obsolètes, impossible à retrouver rapidement quand une mission urgente arrive.' },
      { icon: '⏱️', title: 'Délais de placement trop longs', text: 'Vos clients attendent une réponse en moins de 24h. Sans outil adapté, matcher le bon intérimaire prend trop de temps.' },
      { icon: '📋', title: 'Conformité et contrats', text: 'Suivi des disponibilités, des qualifications, des restrictions médicales, des contrats de mission — tout en respectant la législation intérim.' },
      { icon: '🔄', title: 'Renouvellements fastidieux', text: 'Gérer les prolongations, les fins de mission et le repositionnement des intérimaires manuellement est chronophage et source d\'erreurs.' },
    ],
  },
  stats: [
    { value: '-60%', label: 'Temps de placement' },
    { value: '3x', label: 'Plus de missions traitées' },
    { value: '98%', label: 'Taux de satisfaction client' },
    { value: '24h', label: 'Délai de prise en main' },
  ],
  features: {
    title: 'Tout ce qu\'il vous faut, sans le superflu',
    subtitle: 'Conçu avec des agences d\'intérim pour correspondre exactement à vos process.',
    items: [
      {
        tag: 'CVthèque intelligente',
        title: 'Retrouvez le bon intérimaire en 30 secondes',
        text: 'Recherche multicritère sur compétences, disponibilités, qualifications, localisation et historique de missions. L\'IA classe les profils par pertinence.',
        checks: ['Filtres par qualification et habilitation', 'Disponibilités en temps réel', 'Historique des délégations', 'Score de matching automatique'],
        mockIcon: '🔍',
      },
      {
        tag: 'Gestion client entreprises',
        title: 'Un CRM intégré pour vos clients',
        text: 'Centralisez les contacts, les contrats cadres, les préférences de profils et l\'historique de chaque client entreprise. Plus aucune information perdue.',
        checks: ['Fiche client complète avec KPIs', 'Suivi des missions en cours', 'Relances automatiques', 'Pipeline de prospection'],
        mockIcon: '🏢',
      },
      {
        tag: 'Pipeline de placement',
        title: 'Kanban adapté au cycle intérim',
        text: 'De la réception d\'une demande client à la confirmation de délégation — visualisez le statut de chaque intérimaire en temps réel.',
        checks: ['Colonnes personnalisables', 'Alertes de délai', 'Suivi multi-missions simultanées', 'Export planning hebdo'],
        mockIcon: '📊',
      },
    ],
  },
  testimonials: {
    title: 'Ils ont accéléré leurs placements',
    subtitle: 'Des agences d\'intérim qui ont transformé leur productivité.',
    items: [
      { quote: 'On a divisé par 3 le temps pour trouver le bon intérimaire. La recherche multicritère est bluffante.', name: 'Marie Leconte', role: 'Directrice agence, TempoPro Lyon', avatar: '👩', metric: 'Temps de placement : 45 min → 15 min' },
      { quote: 'Enfin un outil qui comprend nos contraintes : qualifications, disponibilités et délais ultra-courts.', name: 'Frédéric Morel', role: 'Responsable recrutement, InterimPlus Bordeaux', avatar: '👨', metric: '+40% de missions traitées/mois' },
      { quote: 'Le CRM client intégré change tout. Je sais exactement où en est chaque compte sans jongler entre 3 outils.', name: 'Isabelle Garnier', role: 'Chargée de clientèle, FlexWork Nantes', avatar: '👩‍💼', metric: '0 délégation manquée en 6 mois' },
    ],
  },
};

export function AgencesInterimPage() {
  return <VerticalLandingPage {...CONTENT} />;
}

export default AgencesInterimPage;
