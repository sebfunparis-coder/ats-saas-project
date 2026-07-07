import React from 'react';
import { VerticalLandingPage } from './VerticalLandingPage';

const CONTENT = {
  seo: {
    title: 'ATS pour Cabinets de Recrutement — Placez plus de candidats | ATS Ultimate',
    description: 'Logiciel ATS pour cabinets de recrutement et chasseurs de têtes. Gérez vos missions clients, votre vivier de candidats et vos reportings en un outil. Sans engagement.',
    url: 'https://ats-ultimate.com/cabinets-recrutement',
  },
  segment: { label: 'cabinets de recrutement', customerCount: '200' },
  hero: {
    badge: '🎯 Spécial Cabinets de Recrutement',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 40%, #A78BFA 70%, #C4B5FD 100%)',
    title: 'Placez plus de candidats,<br/><em>fidélisez plus de clients</em>',
    subtitle: 'ATS Ultimate est l\'outil de choix des cabinets de recrutement qui veulent scaler sans recruter plus de consultants.',
  },
  pains: {
    title: 'Les freins que vous connaissez bien',
    subtitle: 'Dans les cabinets, le temps c\'est de l\'argent — et souvent, les outils le font perdre.',
    items: [
      { icon: '💼', title: 'Multi-mandats difficile à gérer', text: 'Suivre 15 missions clients en parallèle, avec chacune ses propres candidats, ses délais et ses priorités, sans perdre le fil.' },
      { icon: '🏆', title: 'Vivier qui se périme vite', text: 'Un profil excellent placé ailleurs dans 3 mois, un contact perdu faute de relance — vos viviers valent de l\'or mais se désactualisent.' },
      { icon: '📋', title: 'Reporting client chronophage', text: 'Préparer un reporting hebdo pour chaque client (candidats vus, en cours, retenus) prend des heures chaque vendredi.' },
      { icon: '🤝', title: 'Collaboration inter-consultants', text: 'Quand un consultant part, son vivier et ses notes partent avec lui. Pas de transmission, des clients frustrés.' },
    ],
  },
  stats: [
    { value: '+35%', label: 'Taux de placement' },
    { value: '5 min', label: 'Pour générer un rapport client' },
    { value: '0', label: 'Note perdue entre consultants' },
    { value: '2x', label: 'Mandats gérés en parallèle' },
  ],
  features: {
    title: 'Votre back-office de placement',
    subtitle: 'D\'un outil conçu avec et pour des consultants en recrutement.',
    items: [
      {
        tag: 'Gestion multi-mandats',
        title: 'Tous vos mandats clients dans un seul pipeline',
        text: 'Créez une mission par mandat client, attachez vos candidats, suivez les étapes du process. Chaque client voit l\'avancement en temps réel via un espace dédié.',
        checks: ['Pipeline Kanban par mission', 'Vue globale tous mandats', 'Alertes de délai', 'Portail client sécurisé (T-249)'],
        mockIcon: '🗂️',
      },
      {
        tag: 'Vivier actif',
        title: 'Un vivier qui se maintient seul',
        text: 'Scoring de fraîcheur des profils, relances automatiques des candidats inactifs, et recherche sémantique pour retrouver le bon profil instantanément.',
        checks: ['Scoring de fraîcheur des profils', 'Tags et segments personnalisés', 'Recherche sémantique IA', 'Import CSV historique'],
        mockIcon: '💎',
      },
      {
        tag: 'Reporting client',
        title: 'Rapports clients en 1 clic',
        text: 'Générez un rapport PDF professionnel pour chaque client : candidats présentés, retenus, refusés, avec les commentaires de l\'entretien structuré.',
        checks: ['Export PDF personnalisable', 'Historique des échanges client', 'Grille d\'évaluation structurée', 'Signature numérique'],
        mockIcon: '📄',
      },
    ],
  },
  testimonials: {
    title: 'Des cabinets qui ont passé la vitesse supérieure',
    subtitle: 'Ils ont augmenté leur chiffre d\'affaires sans augmenter leurs équipes.',
    items: [
      { quote: 'Avant je jonglais entre Excel, Notion et ma boîte mail. Maintenant tout est dans ATS Ultimate. Mes clients voient l\'avancement sans que j\'aie à leur envoyer un email.', name: 'Laurent Petit', role: 'Fondateur, Petit Conseil RH', avatar: '👨', metric: 'CA +45% en 8 mois' },
      { quote: 'Le vivier est le cœur de notre business. La recherche IA retrouve en 10 secondes des profils que j\'aurais mis 30 minutes à identifier.', name: 'Claire Marchand', role: 'Senior Consultant, ExecutivSearch Paris', avatar: '👩', metric: 'Délai de présentation : 5j → 2j' },
      { quote: 'Les rapports clients PDF automatiques ont changé notre image. On passe pour des pros, et surtout on gagne 2 heures par vendredi.', name: 'Karim Slimani', role: 'Gérant, Talent Bridge Toulouse', avatar: '👨‍💼', metric: '-10h/semaine d\'admin' },
    ],
  },
};

export function CabinetsRecrutementPage() {
  return <VerticalLandingPage {...CONTENT} />;
}

export default CabinetsRecrutementPage;
