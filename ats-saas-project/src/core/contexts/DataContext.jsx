import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAPIMissions, useAPICandidates, useAPIApplications, useAPIUsers } from '../hooks/useAPIData';

/**
 * Context des données métier
 * Gère toutes les données de l'application (missions, candidats, clients, etc.)
 * 🔥 CONNECTÉ À L'API BACKEND
 */

const DataContext = createContext(null);

// Données initiales de démonstration
const INITIAL_MISSIONS = [
  { id: 1, title: 'Développeur Full Stack Senior', client: 'TechCorp', location: 'Paris', salary: '50k-70k€', status: 'open', skills: ['React', 'Node.js', 'TypeScript'], description: 'Rejoignez une équipe passionnée', emoji: '💻', color: '#667EEA', links: [], documents: [{ name: 'job_description.pdf', size: '245 KB' }], notes: '', startDate: '2026-03-01', urgency: 'urgent', address: { street: '45 Av. des Champs-Élysées', city: 'Paris', zipCode: '75008' }, workMode: 'hybride', contractType: 'CDI', weeklyHours: '39 heures', contactClient: { name: 'Marie Dubois', phone: '+33140506070', email: 'marie.dubois@techcorp.com' }, progress: 60 },
  { id: 2, title: 'Product Manager', client: 'FinanceHub', location: 'Remote', salary: '60k-80k€', status: 'open', skills: ['Product', 'Agile'], description: 'Pilotez la vision produit', emoji: '🎯', color: '#FF6B9D', links: [], documents: [{ name: 'product_requirements.docx', size: '180 KB' }], notes: 'Urgent - Démarrage ASAP', startDate: '2026-02-15', urgency: 'tres urgent', address: { street: '', city: 'Remote', zipCode: '' }, workMode: 'total remote', contractType: 'CDI', weeklyHours: '35 heures', contactClient: { name: 'Jean Martin', phone: '+33145678901', email: 'jean.martin@financehub.com' }, progress: 30 },
  { id: 3, title: 'Lead DevOps Engineer', client: 'TechCorp', location: 'Paris', salary: '60k-75k€', status: 'open', skills: ['Kubernetes', 'AWS', 'CI/CD'], description: 'Pilotez l\'infrastructure cloud', emoji: '⚙️', color: '#10B981', links: [], documents: [], notes: 'Priorité haute', startDate: '2026-03-15', urgency: 'normal', address: { street: '45 Av. des Champs-Élysées', city: 'Paris', zipCode: '75008' }, workMode: 'hybride', contractType: 'CDI', weeklyHours: '39 heures', contactClient: { name: 'Thomas Bernard', phone: '+33698765432', email: 't.bernard@techcorp.com' }, progress: 25 },
  { id: 4, title: 'UX Designer Senior', client: 'TechCorp', location: 'Paris', salary: '45k-55k€', status: 'open', skills: ['Figma', 'User Research', 'Design System'], description: 'Créez des expériences utilisateur exceptionnelles', emoji: '🎨', color: '#8B5CF6', links: [], documents: [], notes: '', startDate: '2026-04-01', urgency: 'normal', address: { street: '45 Av. des Champs-Élysées', city: 'Paris', zipCode: '75008' }, workMode: 'présentiel', contractType: 'CDI', weeklyHours: '35 heures', contactClient: { name: 'Julie Moreau', phone: '+33655443322', email: 'j.moreau@techcorp.com' }, progress: 10 },
  { id: 5, title: 'Data Engineer', client: 'TechCorp', location: 'Paris', salary: '52k-65k€', status: 'filled', skills: ['Python', 'Spark', 'SQL'], description: 'Mission pourvue avec succès', emoji: '📊', color: '#F59E0B', links: [], documents: [{ name: 'contrat_signe.pdf', size: '120 KB' }], notes: 'Recrutement réussi - Alice Martin placée', startDate: '2025-10-01', urgency: 'normal', address: { street: '45 Av. des Champs-Élysées', city: 'Paris', zipCode: '75008' }, workMode: 'hybride', contractType: 'CDI', weeklyHours: '39 heures', contactClient: { name: 'Marie Dubois', phone: '+33612345678', email: 'marie.dubois@techcorp.com' }, progress: 100, closedAt: '2025-12-15' },
  { id: 6, title: 'Scrum Master', client: 'TechCorp', location: 'Paris', salary: '48k-58k€', status: 'filled', skills: ['Scrum', 'Agile', 'Jira'], description: 'Mission clôturée', emoji: '🔄', color: '#06B6D4', links: [], documents: [], notes: 'Bob Dupont intégré en novembre', startDate: '2025-07-01', urgency: 'normal', address: { street: '45 Av. des Champs-Élysées', city: 'Paris', zipCode: '75008' }, workMode: 'hybride', contractType: 'CDI', weeklyHours: '39 heures', contactClient: { name: 'Marie Dubois', phone: '+33612345678', email: 'marie.dubois@techcorp.com' }, progress: 100, closedAt: '2025-11-01' },
  { id: 7, title: 'Analyste Financier Senior', client: 'FinanceHub', location: 'Paris', salary: '55k-70k€', status: 'filled', skills: ['Excel', 'VBA', 'Bloomberg'], description: 'Mission pourvue', emoji: '💹', color: '#10B981', links: [], documents: [], notes: 'Recrutement réussi', startDate: '2025-09-01', urgency: 'normal', address: { street: '12 Rue de la Bourse', city: 'Paris', zipCode: '75002' }, workMode: 'présentiel', contractType: 'CDI', weeklyHours: '39 heures', contactClient: { name: 'Jean Martin', phone: '+33645678901', email: 'j.martin@financehub.com' }, progress: 100, closedAt: '2025-11-30' },
  { id: 8, title: 'Médecin Chercheur', client: 'InnoHealth', location: 'Bordeaux', salary: '70k-90k€', status: 'open', skills: ['Recherche clinique', 'Biologie', 'R&D'], description: 'Rejoignez une startup biotech innovante', emoji: '🔬', color: '#8B5CF6', links: [], documents: [{ name: 'cahier_charges.pdf', size: '340 KB' }], notes: 'Profil très rare - délai court', startDate: '2026-03-01', urgency: 'tres urgent', address: { street: '15 Cours du Médoc', city: 'Bordeaux', zipCode: '33000' }, workMode: 'présentiel', contractType: 'CDI', weeklyHours: '39 heures', contactClient: { name: 'Dr. Claire Vidal', phone: '+33634567890', email: 'c.vidal@innohealth.eu' }, progress: 15 },
];

const INITIAL_CANDIDATES = [
  { id: 1, name: 'Alice Martin', email: 'alice@email.com', phone: '+33612345678', position: 'Senior Developer', skills: ['React', 'Node.js', 'TypeScript', 'AWS'], status: 'active', location: 'Paris', experience: 6, avatar: '👩‍💻', color: '#FF6B9D', links: [{ label: 'LinkedIn', url: 'https://linkedin.com/in/alice-martin' }, { label: 'Portfolio', url: 'https://alicemartin.dev' }], documents: [{ name: 'CV_Alice_Martin.pdf', size: '320 KB' }, { name: 'Lettre_motivation.pdf', size: '145 KB' }], notes: 'Excellente candidate, très motivée', department: '75', metier: 'Développeur Full Stack', sector: 'Tech & IT', dateAdded: '2026-01-15', tags: [1, 4], salary: '55k€', availability: '1 mois', source: 'LinkedIn', lastActivity: '2026-02-05', favorite: true },
  { id: 2, name: 'Bob Dupont', email: 'bob@email.com', phone: '+33623456789', position: 'Full Stack Developer', skills: ['Vue.js', 'Python', 'Docker'], status: 'active', location: 'Lyon', experience: 4, avatar: '👨‍💼', color: '#4ECDC4', links: [{ label: 'GitHub', url: 'https://github.com/bobdupont' }], documents: [{ name: 'CV_Bob_Dupont.pdf', size: '280 KB' }], notes: 'Compétences solides en backend', department: '69', metier: 'Développeur Back-end', sector: 'Tech & IT', dateAdded: '2026-01-20', tags: [3], salary: '48k€', availability: 'Immédiate', source: 'Site carrière', lastActivity: '2026-02-04', favorite: false },
  { id: 3, name: 'Claire Bernard', email: 'claire@email.com', phone: '+33634567890', position: 'Product Owner', skills: ['Scrum', 'Agile', 'User Research'], status: 'passive', location: 'Remote', experience: 7, avatar: '👩‍🎓', color: '#A78BFA', links: [{ label: 'LinkedIn', url: 'https://linkedin.com/in/claire-bernard' }], documents: [{ name: 'CV_Claire_Bernard.pdf', size: '295 KB' }, { name: 'Certifications.pdf', size: '520 KB' }], notes: 'Profil senior, expérience internationale', department: '75', metier: 'Product Owner', sector: 'Tech & IT', dateAdded: '2026-02-01', tags: [2], salary: '65k€', availability: '2 mois', source: 'Cooptation', lastActivity: '2026-02-06', favorite: true },
  { id: 4, name: 'David Rousseau', email: 'david@email.com', phone: '+33645678901', position: 'Data Scientist', skills: ['Python', 'Machine Learning', 'SQL'], status: 'active', location: 'Bordeaux', experience: 5, avatar: '👨‍🔬', color: '#8B5CF6', links: [], documents: [{ name: 'CV_David.pdf', size: '310 KB' }], notes: 'Expert en ML', department: '33', metier: 'Data Scientist', sector: 'Tech & IT', dateAdded: '2026-01-25', tags: [1], salary: '52k€', availability: '3 semaines', source: 'Indeed', lastActivity: '2026-02-03', favorite: false },
  { id: 5, name: 'Emma Leroy', email: 'emma.l@email.com', phone: '+33656789012', position: 'UX Designer', skills: ['Figma', 'User Research', 'Prototyping'], status: 'active', location: 'Paris', experience: 3, avatar: '👩‍🎨', color: '#EC4899', links: [{ label: 'Portfolio', url: 'https://emmaleroy.design' }], documents: [{ name: 'CV_Emma.pdf', size: '340 KB' }, { name: 'Portfolio.pdf', size: '2.1 MB' }], notes: 'Créative et rigoureuse', department: '75', metier: 'UX Designer', sector: 'Création & Design', dateAdded: '2026-02-03', tags: [4], salary: '42k€', availability: 'Immédiate', source: 'Behance', lastActivity: '2026-02-06', favorite: true },
  { id: 6, name: 'François Martin', email: 'francois@email.com', phone: '+33667890123', position: 'DevOps Engineer', skills: ['Kubernetes', 'AWS', 'CI/CD'], status: 'active', location: 'Nantes', experience: 6, avatar: '👨‍💻', color: '#10B981', links: [{ label: 'LinkedIn', url: 'https://linkedin.com/in/francois-martin' }], documents: [{ name: 'CV_Francois.pdf', size: '290 KB' }], notes: 'Expertise cloud', department: '44', metier: 'DevOps Engineer', sector: 'Tech & IT', dateAdded: '2026-01-18', tags: [], salary: '58k€', availability: '1 mois', source: 'Recommandation', lastActivity: '2026-02-02', favorite: false },
  { id: 7, name: 'Julie Petit', email: 'julie@email.com', phone: '+33678901234', position: 'Marketing Manager', skills: ['SEO', 'Content', 'Analytics'], status: 'passive', location: 'Marseille', experience: 8, avatar: '👩‍💼', color: '#F59E0B', links: [], documents: [{ name: 'CV_Julie.pdf', size: '270 KB' }], notes: 'Forte expérience marketing digital', department: '13', metier: 'Marketing Manager', sector: 'Marketing & Communication', dateAdded: '2026-01-22', tags: [3], salary: '50k€', availability: '2 mois', source: 'Apec', lastActivity: '2026-01-30', favorite: false }
];

const INITIAL_CLIENTS = [
  {
    id: 1, name: 'TechCorp SAS', industry: 'Technology', email: 'contact@techcorp.com', status: 'active', missions: 3, emoji: '🚀', color: '#667EEA',
    phone: '+33 1 40 50 60 70', website: 'https://www.techcorp.com',
    address: '45 Avenue des Champs-Élysées', city: 'Paris', zipCode: '75008', country: 'France',
    contacts: [
      { name: 'Marie Dubois', role: 'DRH', email: 'marie.dubois@techcorp.com', phone: '+33 6 12 34 56 78' },
      { name: 'Thomas Bernard', role: 'CEO', email: 't.bernard@techcorp.com', phone: '+33 6 98 76 54 32' },
      { name: 'Julie Moreau', role: 'Responsable recrutement', email: 'j.moreau@techcorp.com', phone: '+33 6 55 44 33 22' },
    ],
    siret: '123 456 789 00042', size: '250-500 salariés', revenue: '€45M',
    createdAt: '2023-03-15', lastContact: '2026-02-17',
    links: [{ label: 'Site web', url: 'https://techcorp.com' }, { label: 'LinkedIn', url: 'https://linkedin.com/company/techcorp' }],
    documents: [{ name: 'Contrat_cadre.pdf', size: '450 KB' }, { name: 'Presentation_entreprise.pptx', size: '2.1 MB' }],
    notes: 'Client premium depuis 2023. Partenaire stratégique. Très bon taux d\'engagement et fidélité exemplaire.'
  },
  {
    id: 2, name: 'FinanceHub SA', industry: 'Finance', email: 'rh@financehub.com', status: 'active', missions: 2, emoji: '💰', color: '#F59E0B',
    phone: '+33 1 45 67 89 01', website: 'https://www.financehub.com',
    address: '12 Rue de la Bourse', city: 'Paris', zipCode: '75002', country: 'France',
    contacts: [
      { name: 'Jean Martin', role: 'Directeur RH', email: 'j.martin@financehub.com', phone: '+33 6 45 67 89 01' },
      { name: 'Isabelle Renard', role: 'DAF', email: 'i.renard@financehub.com', phone: '+33 6 23 45 67 89' },
    ],
    siret: '987 654 321 00012', size: '50-100 salariés', revenue: '€12M',
    createdAt: '2025-11-01', lastContact: '2026-02-10',
    links: [{ label: 'Site web', url: 'https://financehub.com' }],
    documents: [{ name: 'NDA.pdf', size: '180 KB' }],
    notes: 'Nouveau client - fort potentiel. Objectif : développer le partenariat sur 2026.'
  },
  {
    id: 3, name: 'RetailMax Group', industry: 'Retail', email: 'recrutement@retailmax.fr', status: 'prospect', missions: 0, emoji: '🛍️', color: '#10B981',
    phone: '+33 4 78 90 12 34', website: 'https://www.retailmax.fr',
    address: '8 Place Bellecour', city: 'Lyon', zipCode: '69002', country: 'France',
    contacts: [
      { name: 'Sophie Lambert', role: 'Responsable RH', email: 's.lambert@retailmax.fr', phone: '+33 6 78 90 12 34' },
    ],
    siret: '456 123 789 00067', size: '1000+ salariés', revenue: '€120M',
    createdAt: '2026-01-20', lastContact: '2026-03-05',
    links: [{ label: 'Site web', url: 'https://retailmax.fr' }, { label: 'LinkedIn', url: 'https://linkedin.com/company/retailmax' }],
    documents: [{ name: 'Proposition_commerciale.pdf', size: '890 KB' }],
    notes: 'Prospect chaud. RDV de démo prévu. Potentiel 5-8 missions/an.'
  },
  {
    id: 4, name: 'InnoHealth SAS', industry: 'Santé & Biotech', email: 'hr@innohealth.eu', status: 'active', missions: 1, emoji: '🏥', color: '#8B5CF6',
    phone: '+33 5 56 78 90 12', website: 'https://www.innohealth.eu',
    address: '15 Cours du Médoc', city: 'Bordeaux', zipCode: '33000', country: 'France',
    contacts: [
      { name: 'Pierre Moreau', role: 'CEO', email: 'p.moreau@innohealth.eu', phone: '+33 6 56 78 90 12' },
      { name: 'Dr. Claire Vidal', role: 'Directrice R&D', email: 'c.vidal@innohealth.eu', phone: '+33 6 34 56 78 90' },
    ],
    siret: '321 789 456 00089', size: '20-50 salariés', revenue: '€8M',
    createdAt: '2025-06-10', lastContact: '2026-02-28',
    links: [{ label: 'Site web', url: 'https://innohealth.eu' }],
    documents: [{ name: 'Contrat_mission.pdf', size: '320 KB' }, { name: 'Cahier_des_charges.docx', size: '245 KB' }],
    notes: 'Startup en forte croissance. Profils très spécialisés (médecins, chercheurs). Attention aux délais courts.'
  }
];

const INITIAL_APPLICATIONS = [
  // Colonne "Reçus"
  { id: 1, candidateId: 2, candidateName: 'Bob Dupont', candidateAvatar: '👨‍💼', missionTitle: 'Développeur Full Stack Senior', missionId: 1, clientName: 'TechCorp SAS', status: 'received', score: 65, links: [], documents: [{ name: 'CV_Bob_Dupont.pdf', size: '280 KB' }], notes: 'À évaluer rapidement', dateApplied: '2026-03-14' },
  { id: 2, candidateId: 6, candidateName: 'François Martin', candidateAvatar: '👨‍💻', missionTitle: 'Lead DevOps Engineer', missionId: 3, clientName: 'TechCorp SAS', status: 'received', score: 78, links: [], documents: [{ name: 'CV_Francois.pdf', size: '290 KB' }], notes: 'Profil DevOps solide', dateApplied: '2026-03-15' },
  // Colonne "Présélection"
  { id: 3, candidateId: 1, candidateName: 'Alice Martin', candidateAvatar: '👩‍💻', missionTitle: 'Développeur Full Stack Senior', missionId: 1, clientName: 'TechCorp SAS', status: 'screening', score: 87, links: [{ label: 'LinkedIn', url: 'https://linkedin.com/in/alice-martin' }], documents: [{ name: 'CV_Alice_Martin.pdf', size: '320 KB' }, { name: 'Test_technique.pdf', size: '1.2 MB' }], notes: 'Très bon profil technique – Score IA 87%', dateApplied: '2026-03-10' },
  { id: 4, candidateId: 5, candidateName: 'Emma Leroy', candidateAvatar: '👩‍🎨', missionTitle: 'UX Designer Senior', missionId: 4, clientName: 'TechCorp SAS', status: 'screening', score: 81, links: [{ label: 'Portfolio', url: 'https://emmaleroy.design' }], documents: [{ name: 'CV_Emma.pdf', size: '340 KB' }], notes: 'Portfolio impressionnant', dateApplied: '2026-03-12' },
  // Colonne "Entretien 1"
  { id: 5, candidateId: 3, candidateName: 'Claire Bernard', candidateAvatar: '👩‍🎓', missionTitle: 'Product Manager', missionId: 2, clientName: 'FinanceHub SA', status: 'interview_1', score: 92, links: [{ label: 'Calendly', url: 'https://calendly.com/claire-bernard' }], documents: [{ name: 'CV_Claire_Bernard.pdf', size: '295 KB' }, { name: 'Portfolio_projets.pdf', size: '3.5 MB' }], notes: 'Candidate exceptionnelle – 1er tour passé avec succès', dateApplied: '2026-03-05' },
  { id: 6, candidateId: 4, candidateName: 'David Rousseau', candidateAvatar: '👨‍🔬', missionTitle: 'Médecin Chercheur', missionId: 8, clientName: 'InnoHealth SAS', status: 'interview_1', score: 74, links: [], documents: [{ name: 'CV_David.pdf', size: '310 KB' }], notes: 'Profil scientifique solide – entretien en cours de calage', dateApplied: '2026-03-11' },
  // Colonne "Entretien 2 / Offre"
  { id: 7, candidateId: 7, candidateName: 'Julie Petit', candidateAvatar: '👩‍💼', missionTitle: 'Product Manager', missionId: 2, clientName: 'FinanceHub SA', status: 'offer', score: 88, links: [], documents: [{ name: 'CV_Julie.pdf', size: '270 KB' }], notes: 'Offre envoyée – en attente de réponse', dateApplied: '2026-02-28' },
];

const INITIAL_EVENTS = [
  // Mars 2026 - en cours / à venir
  { id: 1, title: 'Entretien Alice Martin – Full Stack', date: '2026-03-18', time: '14:00', type: 'interview', relatedTo: { type: 'candidate', id: 1, name: 'Alice Martin' }, location: 'Visio Zoom', description: 'Entretien technique pour le poste Développeur Full Stack Senior chez TechCorp', status: 'scheduled', color: '#667EEA' },
  { id: 2, title: 'Réunion TechCorp – Bilan recrutement', date: '2026-03-20', time: '10:00', type: 'meeting', relatedTo: { type: 'client', id: 1, name: 'TechCorp SAS' }, location: '45 Av. des Champs-Élysées, Paris', description: 'Point mensuel recrutement – 3 missions ouvertes à discuter', status: 'scheduled', color: '#F59E0B' },
  { id: 3, title: 'Entretien Claire Bernard – PM', date: '2026-03-19', time: '11:00', type: 'interview', relatedTo: { type: 'candidate', id: 3, name: 'Claire Bernard' }, location: 'Visio Teams', description: 'Entretien 2ème tour pour Product Manager chez FinanceHub', status: 'scheduled', color: '#8B5CF6' },
  { id: 4, title: 'Appel FinanceHub – Validation profil', date: '2026-03-21', time: '15:30', type: 'call', relatedTo: { type: 'client', id: 2, name: 'FinanceHub SA' }, location: 'Téléphone', description: 'Validation du profil Claire Bernard par Jean Martin', status: 'scheduled', color: '#10B981' },
  { id: 5, title: 'Entretien David Rousseau – Data', date: '2026-03-25', time: '09:30', type: 'interview', relatedTo: { type: 'candidate', id: 4, name: 'David Rousseau' }, location: 'Bureau Lyon', description: 'Entretien Data Scientist pour une mission InnoHealth', status: 'scheduled', color: '#EC4899' },
  { id: 6, title: 'Réunion InnoHealth – Briefing mission', date: '2026-03-26', time: '14:00', type: 'meeting', relatedTo: { type: 'client', id: 4, name: 'InnoHealth SAS' }, location: '15 Cours du Médoc, Bordeaux', description: 'Briefing mission Médecin Chercheur avec Dr. Claire Vidal', status: 'scheduled', color: '#8B5CF6' },
  // Passés (completés)
  { id: 7, title: 'Appel Claire Bernard – Présélection', date: '2026-03-05', time: '15:30', type: 'call', relatedTo: { type: 'candidate', id: 3, name: 'Claire Bernard' }, location: 'Téléphone', description: 'Appel de présélection – profil retenu', status: 'completed', color: '#10B981' },
  { id: 8, title: 'Entretien Alice Martin – 1er tour', date: '2026-03-10', time: '14:00', type: 'interview', relatedTo: { type: 'candidate', id: 1, name: 'Alice Martin' }, location: 'Visio Zoom', description: 'Premier entretien – très positif, passage au tour 2', status: 'completed', color: '#667EEA' },
];

const INITIAL_HISTORY = [
  // Mars 2026 – récent
  { id: 1, date: '2026-03-17', time: '09:00', action: 'Entretien planifié', relatedTo: { type: 'candidate', id: 1, name: 'Alice Martin' }, user: 'Marie Dubois', details: 'Entretien 2ème tour Full Stack prévu le 18/03 à 14h', icon: '📅' },
  { id: 2, date: '2026-03-17', time: '08:30', action: 'Réunion planifiée', relatedTo: { type: 'client', id: 1, name: 'TechCorp SAS' }, user: 'Thomas Petit', details: 'Bilan recrutement mensuel le 20/03 à 10h', icon: '🤝' },
  { id: 3, date: '2026-03-16', time: '16:20', action: 'CV reçu', relatedTo: { type: 'candidate', id: 5, name: 'Emma Leroy' }, user: 'Thomas Petit', details: 'Candidature spontanée UX Designer reçue via Portfolio', icon: '📨' },
  { id: 4, date: '2026-03-15', time: '14:10', action: 'Mission créée', relatedTo: { type: 'mission', id: 3, name: 'Lead DevOps Engineer' }, user: 'Marie Dubois', details: 'Ouverture poste DevOps pour TechCorp', icon: '💼' },
  { id: 5, date: '2026-03-14', time: '11:45', action: 'Candidat présélectionné', relatedTo: { type: 'candidate', id: 3, name: 'Claire Bernard' }, user: 'Marie Dubois', details: 'Profil PM retenu – Score IA : 92% – Passage entretien 2', icon: '✓' },
  { id: 6, date: '2026-03-13', time: '10:00', action: 'Nouveau client', relatedTo: { type: 'client', id: 4, name: 'InnoHealth SAS' }, user: 'Thomas Petit', details: 'Contrat mission signé – Médecin Chercheur R&D', icon: '🎉' },
  { id: 7, date: '2026-03-12', time: '15:30', action: 'Entretien réalisé', relatedTo: { type: 'candidate', id: 1, name: 'Alice Martin' }, user: 'Marie Dubois', details: '1er tour Full Stack – Résultat très positif', icon: '✅' },
  { id: 8, date: '2026-03-10', time: '09:15', action: 'Mission mise à jour', relatedTo: { type: 'mission', id: 1, name: 'Développeur Full Stack Senior' }, user: 'Thomas Petit', details: 'Progression 60% – 2 candidats en cours', icon: '📊' },
  { id: 9, date: '2026-03-05', time: '14:00', action: 'Appel de présélection', relatedTo: { type: 'candidate', id: 3, name: 'Claire Bernard' }, user: 'Marie Dubois', details: 'Appel 30min – Motivation confirmée, disponible sous 2 mois', icon: '📞' },
  { id: 10, date: '2026-03-01', time: '11:00', action: 'Mission créée', relatedTo: { type: 'mission', id: 4, name: 'UX Designer Senior' }, user: 'Thomas Petit', details: 'Ouverture poste UX Designer – TechCorp', icon: '💼' },
];

const INITIAL_TAGS = [
  { id: 1, name: 'Urgent', color: '#EF4444' },
  { id: 2, name: 'VIP', color: '#F59E0B' },
  { id: 3, name: 'À rappeler', color: '#3B82F6' },
  { id: 4, name: 'Top profil', color: '#10B981' }
];

const INITIAL_COMPANIES = [
  {
    id: 1,
    // Infos entreprise
    name: 'TechCorp France',
    industry: 'Technology',
    email: 'contact@techcorp.com',

    // Abonnement
    plan: 'Enterprise',
    status: 'active', // active | trial | suspended | cancelled
    mrr: '€6,500',
    joinDate: '2024-01-15',
    nextBilling: '2026-03-01',
    paymentMethod: 'Carte bancaire',

    // Utilisateurs et données liées
    users: [1, 2], // IDs des users (à mapper avec DEMO_USERS)
    candidateIds: [1, 2, 3, 4], // Candidats de cette entreprise
    missionIds: [1], // Missions de cette entreprise

    // Métriques
    health: 95,
    engagement: 'high',
    lastLogin: '2026-02-17 09:23',

    // Contacts
    contacts: [
      { name: 'Marie Dubois', role: 'Admin', email: 'marie@techcorp.com', phone: '+33140506070' }
    ],

    // Liens et docs
    links: [{ label: 'Site web', url: 'https://techcorp.com' }, { label: 'LinkedIn', url: 'https://linkedin.com/company/techcorp' }],
    documents: [{ name: 'Contrat_cadre.pdf', size: '450 KB' }],
    notes: 'Client premium depuis 2023. Excellent taux d\'engagement.'
  },
  {
    id: 2,
    name: 'Digital Consulting',
    industry: 'Consulting',
    email: 'contact@digitalconsulting.fr',

    plan: 'Professional',
    status: 'active',
    mrr: '€299',
    joinDate: '2024-03-22',
    nextBilling: '2026-03-15',
    paymentMethod: 'Virement',

    users: [3],
    candidateIds: [5, 6],
    missionIds: [2],

    health: 88,
    engagement: 'medium',
    lastLogin: '2026-02-17 08:45',

    contacts: [
      { name: 'Jean Martin', role: 'RH Manager', email: 'jean@digitalconsulting.fr', phone: '+33145678901' }
    ],

    links: [{ label: 'Site web', url: 'https://digitalconsulting.fr' }],
    documents: [{ name: 'NDA.pdf', size: '180 KB' }],
    notes: 'Bon client, croissance régulière.'
  },
  {
    id: 3,
    name: 'StartupLab',
    industry: 'Startup',
    email: 'hello@startuplab.io',

    plan: 'Starter',
    status: 'trial',
    mrr: '€0',
    joinDate: '2026-02-01',
    nextBilling: '2026-02-28',
    paymentMethod: 'Trial',

    users: [1],
    candidateIds: [7],
    missionIds: [],

    health: 72,
    engagement: 'low',
    lastLogin: '2026-02-16 18:30',

    contacts: [
      { name: 'Sophie Laurent', role: 'Founder', email: 'sophie@startuplab.io', phone: '+33156789012' }
    ],

    links: [],
    documents: [],
    notes: 'En trial - fort potentiel de conversion.'
  }
];

const INITIAL_TEAM = [
  {
    id: 1,
    firstName: 'Marie',
    lastName: 'Dubois',
    name: 'Marie Dubois',
    email: 'demo@techcorp.com',
    phone: '+33 6 12 34 56 78',
    role: 'Admin',
    companyId: 1,
    avatar: '👩‍💼',
    color: '#667EEA',
    active: true,
    hireDate: '15 janvier 2024',
    joinDate: '2024-01-15',
    lastActive: '2026-03-17 14:23',
    permissions: ['all'],
    stats: {
      missions: 8,
      candidatesAdded: 12,
      interviewsScheduled: 24,
      placements: 5,
      revenue: '€45,000'
    },
    activity: {
      lastLogin: '2026-03-17 14:23',
      candidatesContacted: 32,
      interviewsScheduled: 24,
      avgResponseTime: '2h 30min',
      weeklyHours: 38
    },
    performance: {
      monthlyAchieved: 3,
      monthlyGoal: 5,
      conversionRate: '22%',
      satisfaction: 4.8,
    }
  },
  {
    id: 2,
    firstName: 'Thomas',
    lastName: 'Petit',
    name: 'Thomas Petit',
    email: 'thomas@techcorp.com',
    phone: '+33 6 98 76 54 32',
    role: 'Recruteur Senior',
    companyId: 1,
    avatar: '👨‍💻',
    color: '#10B981',
    active: true,
    hireDate: '10 juin 2024',
    joinDate: '2024-06-10',
    lastActive: '2026-03-17 11:45',
    permissions: ['candidates', 'missions'],
    stats: {
      missions: 5,
      candidatesAdded: 8,
      interviewsScheduled: 15,
      placements: 3,
      revenue: '€28,000'
    },
    activity: {
      lastLogin: '2026-03-17 11:45',
      candidatesContacted: 18,
      interviewsScheduled: 15,
      avgResponseTime: '3h 15min',
      weeklyHours: 35
    },
    performance: {
      monthlyAchieved: 2,
      monthlyGoal: 4,
      conversionRate: '18%',
      satisfaction: 4.5,
    }
  },
  {
    id: 3,
    firstName: 'Sophie',
    lastName: 'Laurent',
    name: 'Sophie Laurent',
    email: 'hr@financehub.com',
    phone: '+33 6 55 44 33 22',
    role: 'Admin',
    companyId: 3,
    avatar: '👩‍🎓',
    color: '#F59E0B',
    active: true,
    hireDate: '22 mars 2024',
    joinDate: '2024-03-22',
    lastActive: '2026-03-16 16:30',
    permissions: ['all'],
    stats: {
      missions: 3,
      candidatesAdded: 6,
      interviewsScheduled: 10,
      placements: 2,
      revenue: '€18,500'
    },
    activity: {
      lastLogin: '2026-03-16 16:30',
      candidatesContacted: 14,
      interviewsScheduled: 10,
      avgResponseTime: '4h 00min',
      weeklyHours: 32
    },
    performance: {
      monthlyAchieved: 1,
      monthlyGoal: 3,
      conversionRate: '15%',
      satisfaction: 4.6,
    }
  }
];

const INITIAL_CAMPAIGNS = [
  {
    id: 1,
    name: 'Offre Printemps 2026',
    type: 'Promo',
    status: 'active',
    budget: '€5,000',
    spent: '€3,200',
    leads: 142,
    conversions: 8,
    roi: '240%',
    startDate: '2026-02-01',
    endDate: '2026-03-31',
    description: 'Campagne de promotion pour le printemps avec réduction de 30%'
  },
  {
    id: 2,
    name: 'LinkedIn Ads B2B',
    type: 'Paid Ads',
    status: 'active',
    budget: '€3,000',
    spent: '€2,800',
    leads: 89,
    conversions: 4,
    roi: '180%',
    startDate: '2026-01-15',
    endDate: '2026-02-28',
    description: 'Publicités ciblées sur LinkedIn pour attirer les entreprises tech'
  },
  {
    id: 3,
    name: 'Email Nurturing',
    type: 'Email',
    status: 'active',
    budget: '€500',
    spent: '€320',
    leads: 234,
    conversions: 12,
    roi: '420%',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    description: 'Séquence d\'emails automatisée pour convertir les prospects'
  }
];

const INITIAL_PROMO_CODES = [
  {
    id: 1,
    code: 'SPRING2026',
    discount: '30%',
    type: 'Pourcentage',
    uses: 23,
    limit: 100,
    revenue: '€12,400',
    status: 'active',
    expires: '2026-03-31',
    description: 'Promotion de printemps - 30% de réduction sur le premier mois'
  },
  {
    id: 2,
    code: 'FIRST3MONTHS',
    discount: '-50%',
    type: '3 mois',
    uses: 8,
    limit: 50,
    revenue: '€4,200',
    status: 'active',
    expires: '2026-12-31',
    description: 'Offre de lancement - 50% de réduction pendant 3 mois'
  }
];

const INITIAL_SUPPORT_TICKETS = [
  {
    id: 1,
    company: 'TechCorp France',
    companyId: 1,
    subject: 'Problème export candidats',
    priority: 'high',
    status: 'open',
    assignedTo: 'Marie',
    created: '2026-02-17 08:30',
    updated: '2026-02-17 09:15',
    description: 'Impossible d\'exporter les candidats au format CSV'
  },
  {
    id: 2,
    company: 'Digital Consulting',
    companyId: 2,
    subject: 'Question facturation',
    priority: 'medium',
    status: 'in_progress',
    assignedTo: 'Jean',
    created: '2026-02-16 14:20',
    updated: '2026-02-17 10:00',
    description: 'Question sur le changement de plan et la facturation au prorata'
  },
  {
    id: 3,
    company: 'StartupLab',
    companyId: 3,
    subject: 'Demande upgrade plan',
    priority: 'low',
    status: 'resolved',
    assignedTo: 'Sophie',
    created: '2026-02-15 11:00',
    updated: '2026-02-16 16:30',
    description: 'Souhaite passer du plan Starter au plan Professional'
  }
];

const EVALUATION_CRITERIA = [
  { id: 'technical', name: 'Compétences techniques' },
  { id: 'communication', name: 'Communication' },
  { id: 'motivation', name: 'Motivation' },
  { id: 'culture', name: 'Fit culturel' },
  { id: 'experience', name: 'Expérience' },
];

const INITIAL_EVALUATIONS = [
  {
    id: 1,
    applicationId: 1,
    candidateId: 1,
    candidateName: 'Alice Martin',
    missionTitle: 'Développeur Full Stack Senior',
    date: '2026-02-10',
    stage: 'interview_1',
    evaluatorName: 'Marie Dubois',
    criteria: [
      { id: 'technical',      name: 'Compétences techniques', score: 5, notes: 'Excellente maîtrise React/Node.js' },
      { id: 'communication',  name: 'Communication',          score: 4, notes: 'S\'exprime clairement' },
      { id: 'motivation',     name: 'Motivation',             score: 5, notes: 'Très motivée, projet bien préparé' },
      { id: 'culture',        name: 'Fit culturel',           score: 4, notes: 'Valeurs alignées' },
      { id: 'experience',     name: 'Expérience',             score: 4, notes: '6 ans, expériences pertinentes' },
    ],
    globalScore: 88,
    notes: 'Candidature excellente. Recommande passage en entretien 2.',
    recommendation: 'go',
  }
];

const INITIAL_TASKS = [
  {
    id: 1,
    title: 'Rappeler Alice Martin',
    description: 'Confirmer disponibilité pour entretien technique',
    dueDate: '2026-03-20',
    priority: 'high',
    status: 'pending',
    relatedTo: { type: 'candidate', id: 1, name: 'Alice Martin' },
    createdAt: '2026-03-17',
    assignedTo: 'Marie Dubois',
  },
  {
    id: 2,
    title: 'Envoyer offre à Bob Dupont',
    description: 'Préparer et envoyer la proposition contractuelle',
    dueDate: '2026-03-22',
    priority: 'medium',
    status: 'pending',
    relatedTo: { type: 'candidate', id: 2, name: 'Bob Dupont' },
    createdAt: '2026-03-17',
    assignedTo: 'Thomas Petit',
  },
  {
    id: 3,
    title: 'Réunion bilan TechCorp',
    description: 'Point mensuel sur les missions en cours',
    dueDate: '2026-03-25',
    priority: 'medium',
    status: 'pending',
    relatedTo: { type: 'client', id: 1, name: 'TechCorp SAS' },
    createdAt: '2026-03-16',
    assignedTo: 'Marie Dubois',
  },
];

// Options dynamiques pour les formulaires candidats
const INITIAL_CANDIDATE_STATUSES = ['active', 'passive', 'hired'];
const INITIAL_CANDIDATE_SOURCES = ['LinkedIn', 'Site carrière', 'Indeed', 'Apec', 'Cooptation', 'Recommandation', 'Behance', 'Autre'];
const INITIAL_CANDIDATE_SECTORS = ['Tech & IT', 'Marketing & Communication', 'Création & Design', 'Finance & Comptabilité', 'RH & Recrutement', 'Autre'];

/**
 * Provider du contexte de données
 * 🔥 Connecté à l'API backend pour missions, candidates, applications, users
 */
export function DataProvider({ children }) {
  // 🔥 HOOKS API pour les données backend
  const {
    missions: apiMissions,
    loading: missionsLoading,
    error: missionsError,
    reload: reloadMissions,
    createMission: apiCreateMission,
    updateMission: apiUpdateMission,
    deleteMission: apiDeleteMission,
  } = useAPIMissions();

  const {
    candidates: apiCandidates,
    loading: candidatesLoading,
    error: candidatesError,
    reload: reloadCandidates,
    createCandidate: apiCreateCandidate,
    updateCandidate: apiUpdateCandidate,
    deleteCandidate: apiDeleteCandidate,
  } = useAPICandidates();

  const {
    applications: apiApplications,
    loading: applicationsLoading,
    error: applicationsError,
    reload: reloadApplications,
    createApplication: apiCreateApplication,
    updateApplicationStatus: apiUpdateApplicationStatus,
    deleteApplication: apiDeleteApplication,
  } = useAPIApplications();

  const {
    users: apiUsers,
    loading: usersLoading,
    error: usersError,
    reload: reloadUsers,
    updateUser: apiUpdateUser,
    updateUserRole: apiUpdateUserRole,
    deleteUser: apiDeleteUser,
  } = useAPIUsers();

  // 🔥 Version des données - incrémenter pour forcer le reset des données locales
  const DATA_VERSION = '2026-03-17-v6';

  // 🔥 Charger les données depuis localStorage au démarrage
  const loadFromStorage = () => {
    try {
      const savedData = localStorage.getItem('ats_data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Si version différente → on ignore et on repart sur les INITIAL data
        if (parsed.dataVersion !== DATA_VERSION) {
          console.info('🔄 [DataContext] Nouvelle version de données - réinitialisation');
          localStorage.removeItem('ats_data');
          return null;
        }
        return parsed;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
    return null;
  };

  const saved = loadFromStorage();

  // 🔥 États pour les entités BACKEND (fallback sur données initiales si API vide)
  const missions = (apiMissions && apiMissions.length > 0) ? apiMissions : INITIAL_MISSIONS;
  const setMissions = () => {};
  const candidates = (apiCandidates && apiCandidates.length > 0) ? apiCandidates : INITIAL_CANDIDATES;
  const setCandidates = () => {};
  // Applications en state local pour permettre le drag & drop sans backend
  const [applications, setApplications] = useState(saved?.applications || INITIAL_APPLICATIONS);

  // 🔥 États pour les entités LOCAL ONLY (pas encore de backend)
  const [clients, setClients] = useState(saved?.clients || INITIAL_CLIENTS);
  const [events, setEvents] = useState(saved?.events || INITIAL_EVENTS);
  const [history, setHistory] = useState(saved?.history || INITIAL_HISTORY);
  const [tags, setTags] = useState(saved?.tags || INITIAL_TAGS);
  const [companies, setCompanies] = useState(saved?.companies || INITIAL_COMPANIES);
  const [team, setTeam] = useState(saved?.team || INITIAL_TEAM);
  const [marketingCampaigns, setMarketingCampaigns] = useState(saved?.marketingCampaigns || INITIAL_CAMPAIGNS);
  const [promoCodes, setPromoCodes] = useState(saved?.promoCodes || INITIAL_PROMO_CODES);
  const [supportTickets, setSupportTickets] = useState(saved?.supportTickets || INITIAL_SUPPORT_TICKETS);

  // 🔥 Options dynamiques pour les formulaires (avec sauvegarde)
  const [candidateStatuses, setCandidateStatuses] = useState(saved?.candidateStatuses || INITIAL_CANDIDATE_STATUSES);
  const [candidateSources, setCandidateSources] = useState(saved?.candidateSources || INITIAL_CANDIDATE_SOURCES);
  const [candidateSectors, setCandidateSectors] = useState(saved?.candidateSectors || INITIAL_CANDIDATE_SECTORS);
  const [evaluations, setEvaluations] = useState(saved?.evaluations || INITIAL_EVALUATIONS);
  const [tasks, setTasks] = useState(saved?.tasks || INITIAL_TASKS);

  // 🔥 Sauvegarder automatiquement dans localStorage
  useEffect(() => {
    try {
      const dataToSave = {
        dataVersion: DATA_VERSION,
        applications,
        clients,
        events,
        history,
        tags,
        companies,
        team,
        marketingCampaigns,
        promoCodes,
        supportTickets,
        candidateStatuses,
        candidateSources,
        candidateSectors,
        evaluations,
        tasks,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('ats_data', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error);
    }
  }, [applications, clients, events, history, tags, companies, team, marketingCampaigns, promoCodes, supportTickets, candidateStatuses, candidateSources, candidateSectors, evaluations, tasks]);

  // 🔥 Helper pour auto-tracking avec before/after
  const track = (action, relatedTo, details, icon, before = null, after = null) => {
    const newItem = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      action,
      relatedTo,
      user: 'Admin',
      details,
      icon,
      before,
      after,
    };
    setHistory(prev => [newItem, ...prev]);
  };

  // 🔥 Fonctions CRUD pour Missions (CONNECTÉES À L'API)
  const addMission = async (mission) => {
    try {
      const newMission = await apiCreateMission(mission);

      // 🔥 Auto-track
      track(
        'Mission créée',
        { type: 'mission', id: newMission.id, name: newMission.title },
        `${newMission.title} - ${newMission.client}`,
        '💼'
      );

      return newMission;
    } catch (error) {
      console.error('Erreur création mission:', error);
      throw error;
    }
  };

  const updateMission = async (id, updates) => {
    try {
      const mission = missions.find(m => m.id === id);
      await apiUpdateMission(id, updates);

      // 🔥 Auto-track
      if (mission) {
        track(
          'Mission modifiée',
          { type: 'mission', id, name: mission.title },
          `Mise à jour de ${mission.title}`,
          '✏️'
        );
      }
    } catch (error) {
      console.error('Erreur mise à jour mission:', error);
      throw error;
    }
  };

  const deleteMission = async (id) => {
    try {
      const mission = missions.find(m => m.id === id);
      await apiDeleteMission(id);

      // 🔥 Auto-track
      if (mission) {
        track(
          'Mission supprimée',
          { type: 'mission', id, name: mission.title },
          `Suppression de ${mission.title}`,
          '🗑️'
        );
      }
    } catch (error) {
      console.error('Erreur suppression mission:', error);
      throw error;
    }
  };

  // 🔥 Fonctions CRUD pour Candidats (CONNECTÉES À L'API)
  const addCandidate = async (candidate) => {
    try {
      const newCandidate = await apiCreateCandidate(candidate);

      // 🔥 Auto-track
      track(
        'Candidat ajouté',
        { type: 'candidate', id: newCandidate.id, name: newCandidate.name },
        `${newCandidate.name} - ${newCandidate.position}`,
        '👤'
      );

      return newCandidate;
    } catch (error) {
      console.error('Erreur création candidat:', error);
      throw error;
    }
  };

  const updateCandidate = async (id, updates) => {
    try {
      const candidate = candidates.find(c => c.id === id);
      await apiUpdateCandidate(id, updates);

      // 🔥 Auto-track
      if (candidate) {
        track(
          'Candidat modifié',
          { type: 'candidate', id, name: candidate.name },
          `Mise à jour de ${candidate.name}`,
          '✏️'
        );
      }
    } catch (error) {
      console.error('Erreur mise à jour candidat:', error);
      throw error;
    }
  };

  const deleteCandidate = async (id) => {
    try {
      const candidate = candidates.find(c => c.id === id);
      await apiDeleteCandidate(id);

      // 🔥 Auto-track
      if (candidate) {
        track(
          'Candidat supprimé',
          { type: 'candidate', id, name: candidate.name },
          `Suppression de ${candidate.name}`,
          '🗑️'
        );
      }
    } catch (error) {
      console.error('Erreur suppression candidat:', error);
      throw error;
    }
  };

  // Fonctions CRUD pour Clients (avec auto-tracking)
  const addClient = (client) => {
    const newClient = { id: Date.now(), ...client };
    setClients([...clients, newClient]);

    // 🔥 Auto-track
    track(
      'Client ajouté',
      { type: 'client', id: newClient.id, name: newClient.name },
      `${newClient.name} - ${newClient.industry}`,
      '🏢'
    );

    return newClient;
  };

  const updateClient = (id, updates) => {
    const client = clients.find(c => c.id === id);
    setClients(clients.map(c => c.id === id ? { ...c, ...updates } : c));

    // 🔥 Auto-track with before/after
    if (client) {
      const before = {};
      const after = {};
      Object.keys(updates).forEach((k) => {
        if (client[k] !== updates[k]) { before[k] = client[k]; after[k] = updates[k]; }
      });
      track(
        'Client modifié',
        { type: 'client', id, name: client.name },
        `Mise à jour de ${client.name}`,
        '✏️',
        Object.keys(before).length ? before : null,
        Object.keys(after).length  ? after  : null
      );
    }
  };

  const deleteClient = (id) => {
    const client = clients.find(c => c.id === id);
    setClients(clients.filter(c => c.id !== id));

    // 🔥 Auto-track
    if (client) {
      track(
        'Client supprimé',
        { type: 'client', id, name: client.name },
        `Suppression de ${client.name}`,
        '🗑️'
      );
    }
  };

  // 🔥 Fonctions CRUD pour Applications (CONNECTÉES À L'API)
  const addApplication = (application) => {
    const newApplication = { id: Date.now(), ...application };
    setApplications(prev => [...prev, newApplication]);

    track(
      'Candidature créée',
      { type: 'application', id: newApplication.id, name: newApplication.candidateName },
      `${newApplication.candidateName} → ${newApplication.missionTitle}`,
      '📨'
    );

    return newApplication;
  };

  const updateApplication = (id, updates) => {
    const application = applications.find(a => a.id === id);
    setApplications(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));

    if (application) {
      const statusText = updates.status ? ` - Statut: ${updates.status}` : '';
      const before = updates.status ? { status: application.status } : null;
      const after  = updates.status ? { status: updates.status }      : null;
      track(
        'Candidature modifiée',
        { type: 'application', id, name: application.candidateName },
        `${application.candidateName} → ${application.missionTitle}${statusText}`,
        '✏️',
        before,
        after
      );
    }
  };

  const deleteApplication = (id) => {
    const application = applications.find(a => a.id === id);
    setApplications(prev => prev.filter(a => a.id !== id));

    if (application) {
      track(
        'Candidature supprimée',
        { type: 'application', id, name: application.candidateName },
        `${application.candidateName} → ${application.missionTitle}`,
        '🗑️'
      );
    }
  };

  // Fonctions CRUD pour Events (avec auto-tracking)
  const addEvent = (event) => {
    const newEvent = { id: Date.now(), ...event };
    setEvents([...events, newEvent]);

    // 🔥 Auto-track
    track(
      'Événement créé',
      { type: 'event', id: newEvent.id, name: newEvent.title },
      `${newEvent.title} - ${newEvent.date} à ${newEvent.time}`,
      '📅'
    );

    return newEvent;
  };

  const updateEvent = (id, updates) => {
    const event = events.find(e => e.id === id);
    setEvents(events.map(e => e.id === id ? { ...e, ...updates } : e));

    // 🔥 Auto-track
    if (event) {
      track(
        'Événement modifié',
        { type: 'event', id, name: event.title },
        `Mise à jour de ${event.title}`,
        '✏️'
      );
    }
  };

  const deleteEvent = (id) => {
    const event = events.find(e => e.id === id);
    setEvents(events.filter(e => e.id !== id));

    // 🔥 Auto-track
    if (event) {
      track(
        'Événement supprimé',
        { type: 'event', id, name: event.title },
        `Suppression de ${event.title}`,
        '🗑️'
      );
    }
  };

  // Fonctions pour History
  const addHistoryItem = (item) => {
    const newItem = { id: Date.now(), date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), ...item };
    setHistory([newItem, ...history]);
  };

  // Fonctions pour Tags
  const addTag = (tag) => {
    const newTag = { id: Date.now(), ...tag };
    setTags([...tags, newTag]);
    return newTag;
  };

  const updateTag = (id, updates) => {
    setTags(tags.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTag = (id) => {
    setTags(tags.filter(t => t.id !== id));
  };

  // Fonctions CRUD pour Companies (avec auto-tracking)
  const addCompany = (company) => {
    const newCompany = { id: Date.now(), ...company };
    setCompanies([...companies, newCompany]);

    // 🔥 Auto-track
    track(
      'Entreprise créée',
      { type: 'company', id: newCompany.id, name: newCompany.name },
      `${newCompany.name} - Plan ${newCompany.plan}`,
      '🏢'
    );

    return newCompany;
  };

  const updateCompany = (id, updates) => {
    const company = companies.find(c => c.id === id);
    setCompanies(companies.map(c => c.id === id ? { ...c, ...updates } : c));

    // 🔥 Auto-track
    if (company) {
      const statusText = updates.status ? ` - Statut: ${updates.status}` : '';
      track(
        'Entreprise modifiée',
        { type: 'company', id, name: company.name },
        `Mise à jour de ${company.name}${statusText}`,
        '✏️'
      );
    }
  };

  const deleteCompany = (id) => {
    const company = companies.find(c => c.id === id);
    setCompanies(companies.filter(c => c.id !== id));

    // 🔥 Auto-track
    if (company) {
      track(
        'Entreprise supprimée',
        { type: 'company', id, name: company.name },
        `Suppression de ${company.name}`,
        '🗑️'
      );
    }
  };

  // Fonctions CRUD pour Team (avec auto-tracking)
  const addTeamMember = (member) => {
    const newMember = { id: Date.now(), ...member };
    setTeam([...team, newMember]);

    // 🔥 Auto-track
    track(
      'Membre ajouté',
      { type: 'team', id: newMember.id, name: newMember.name },
      `${newMember.name} - ${newMember.role}`,
      '👥'
    );

    return newMember;
  };

  const updateTeamMember = (id, updates) => {
    const member = team.find(m => m.id === id);
    setTeam(team.map(m => m.id === id ? { ...m, ...updates } : m));

    // 🔥 Auto-track
    if (member) {
      track(
        'Membre modifié',
        { type: 'team', id, name: member.name },
        `Mise à jour de ${member.name}`,
        '✏️'
      );
    }
  };

  const deleteTeamMember = (id) => {
    const member = team.find(m => m.id === id);
    setTeam(team.filter(m => m.id !== id));

    // 🔥 Auto-track
    if (member) {
      track(
        'Membre supprimé',
        { type: 'team', id, name: member.name },
        `Suppression de ${member.name}`,
        '🗑️'
      );
    }
  };

  // Fonctions CRUD pour Marketing Campaigns (avec auto-tracking)
  const addCampaign = (campaign) => {
    const newCampaign = { id: Date.now(), ...campaign };
    setMarketingCampaigns([...marketingCampaigns, newCampaign]);

    // 🔥 Auto-track
    track(
      'Campagne créée',
      { type: 'campaign', id: newCampaign.id, name: newCampaign.name },
      `${newCampaign.name} - Budget ${newCampaign.budget}`,
      '📢'
    );

    return newCampaign;
  };

  const updateCampaign = (id, updates) => {
    const campaign = marketingCampaigns.find(c => c.id === id);
    setMarketingCampaigns(marketingCampaigns.map(c => c.id === id ? { ...c, ...updates } : c));

    // 🔥 Auto-track
    if (campaign) {
      track(
        'Campagne modifiée',
        { type: 'campaign', id, name: campaign.name },
        `Mise à jour de ${campaign.name}`,
        '✏️'
      );
    }
  };

  const deleteCampaign = (id) => {
    const campaign = marketingCampaigns.find(c => c.id === id);
    setMarketingCampaigns(marketingCampaigns.filter(c => c.id !== id));

    // 🔥 Auto-track
    if (campaign) {
      track(
        'Campagne supprimée',
        { type: 'campaign', id, name: campaign.name },
        `Suppression de ${campaign.name}`,
        '🗑️'
      );
    }
  };

  // Fonctions CRUD pour Promo Codes (avec auto-tracking)
  const addPromoCode = (promoCode) => {
    const newPromoCode = { id: Date.now(), ...promoCode };
    setPromoCodes([...promoCodes, newPromoCode]);

    // 🔥 Auto-track
    track(
      'Code promo créé',
      { type: 'promoCode', id: newPromoCode.id, name: newPromoCode.code },
      `${newPromoCode.code} - ${newPromoCode.discount}`,
      '🎁'
    );

    return newPromoCode;
  };

  const updatePromoCode = (id, updates) => {
    const promoCode = promoCodes.find(p => p.id === id);
    setPromoCodes(promoCodes.map(p => p.id === id ? { ...p, ...updates } : p));

    // 🔥 Auto-track
    if (promoCode) {
      track(
        'Code promo modifié',
        { type: 'promoCode', id, name: promoCode.code },
        `Mise à jour de ${promoCode.code}`,
        '✏️'
      );
    }
  };

  const deletePromoCode = (id) => {
    const promoCode = promoCodes.find(p => p.id === id);
    setPromoCodes(promoCodes.filter(p => p.id !== id));

    // 🔥 Auto-track
    if (promoCode) {
      track(
        'Code promo supprimé',
        { type: 'promoCode', id, name: promoCode.code },
        `Suppression de ${promoCode.code}`,
        '🗑️'
      );
    }
  };

  // Fonctions CRUD pour Support Tickets (avec auto-tracking)
  const addSupportTicket = (ticket) => {
    const newTicket = { id: Date.now(), ...ticket };
    setSupportTickets([...supportTickets, newTicket]);

    // 🔥 Auto-track
    track(
      'Ticket créé',
      { type: 'ticket', id: newTicket.id, name: newTicket.subject },
      `${newTicket.company} - ${newTicket.subject} (${newTicket.priority})`,
      '🎫'
    );

    return newTicket;
  };

  const updateSupportTicket = (id, updates) => {
    const ticket = supportTickets.find(t => t.id === id);
    setSupportTickets(supportTickets.map(t => t.id === id ? { ...t, ...updates } : t));

    // 🔥 Auto-track
    if (ticket) {
      const statusText = updates.status ? ` - Statut: ${updates.status}` : '';
      track(
        'Ticket modifié',
        { type: 'ticket', id, name: ticket.subject },
        `${ticket.company} - ${ticket.subject}${statusText}`,
        '✏️'
      );
    }
  };

  const deleteSupportTicket = (id) => {
    const ticket = supportTickets.find(t => t.id === id);
    setSupportTickets(supportTickets.filter(t => t.id !== id));

    // 🔥 Auto-track
    if (ticket) {
      track(
        'Ticket supprimé',
        { type: 'ticket', id, name: ticket.subject },
        `${ticket.company} - ${ticket.subject}`,
        '🗑️'
      );
    }
  };

  // Détection des doublons candidats
  const checkCandidateDuplicate = (candidate, excludeId = null) => {
    const others = candidates.filter((c) => c.id !== excludeId);
    const emailDup = candidate.email
      ? others.find((c) => c.email?.toLowerCase() === candidate.email.toLowerCase())
      : null;
    const nameDup = candidate.name && candidate.phone
      ? others.find(
          (c) =>
            c.name?.toLowerCase() === candidate.name.toLowerCase() &&
            c.phone?.replace(/\s/g, '') === candidate.phone?.replace(/\s/g, '')
        )
      : null;
    return emailDup ? { type: 'email', existing: emailDup }
         : nameDup  ? { type: 'name_phone', existing: nameDup }
         : null;
  };

  // CRUD Evaluations (Local)
  const addEvaluation = (evaluation) => {
    const newEvaluation = { id: Date.now(), createdAt: new Date().toISOString(), ...evaluation };
    setEvaluations(prev => [...prev, newEvaluation]);
    track(
      'Évaluation créée',
      { type: 'candidate', id: evaluation.candidateId, name: evaluation.candidateName },
      `${evaluation.candidateName} - ${evaluation.missionTitle} : ${evaluation.globalScore}%`,
      '⭐'
    );
    return newEvaluation;
  };

  const updateEvaluation = (id, updates) => {
    setEvaluations(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEvaluation = (id) => {
    setEvaluations(prev => prev.filter(e => e.id !== id));
  };

  // CRUD Tasks (Local)
  const addTask = (task) => {
    const newTask = { id: Date.now(), createdAt: new Date().toISOString().split('T')[0], status: 'pending', ...task };
    setTasks(prev => [...prev, newTask]);
    track(
      'Tâche créée',
      task.relatedTo || { type: 'task', id: newTask.id, name: newTask.title },
      `${newTask.title} - échéance ${newTask.dueDate}`,
      '✅'
    );
    return newTask;
  };

  const updateTask = (id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // 🔥 Fonctions pour gérer les options dynamiques des candidats
  const addCandidateStatus = (status) => {
    if (!candidateStatuses.includes(status)) {
      setCandidateStatuses([...candidateStatuses, status]);
    }
  };

  const addCandidateSource = (source) => {
    if (!candidateSources.includes(source)) {
      setCandidateSources([...candidateSources, source]);
    }
  };

  const addCandidateSector = (sector) => {
    if (!candidateSectors.includes(sector)) {
      setCandidateSectors([...candidateSectors, sector]);
    }
  };

  const value = {
    // 🔥 Données (mixte: API + Local)
    missions, // API backend
    candidates, // API backend
    clients, // Local
    applications, // API backend
    events, // Local
    history, // Local
    tags, // Local
    companies, // Local
    team, // Local
    marketingCampaigns, // Local
    promoCodes, // Local
    supportTickets, // Local

    // 🔥 États de chargement et erreurs (API)
    loading: {
      missions: missionsLoading,
      candidates: candidatesLoading,
      applications: applicationsLoading,
      users: usersLoading,
    },
    errors: {
      missions: missionsError,
      candidates: candidatesError,
      applications: applicationsError,
      users: usersError,
    },
    reload: {
      missions: reloadMissions,
      candidates: reloadCandidates,
      applications: reloadApplications,
      users: reloadUsers,
    },

    // 🔥 Options dynamiques
    candidateStatuses,
    candidateSources,
    candidateSectors,
    addCandidateStatus,
    addCandidateSource,
    addCandidateSector,

    // Setters (pour usage avancé - local uniquement)
    setMissions, // Vide (API géré)
    setCandidates, // Vide (API géré)
    setClients,
    setApplications, // Vide (API géré)
    setEvents,
    setHistory,
    setTags,
    setCompanies,
    setTeam,
    setMarketingCampaigns,
    setPromoCodes,
    setSupportTickets,

    // 🔥 CRUD Missions (API)
    addMission,
    updateMission,
    deleteMission,

    // 🔥 CRUD Candidates (API)
    addCandidate,
    updateCandidate,
    deleteCandidate,

    // CRUD Clients (Local)
    addClient,
    updateClient,
    deleteClient,

    // 🔥 CRUD Applications (API)
    addApplication,
    updateApplication,
    deleteApplication,

    // CRUD Events (Local)
    addEvent,
    updateEvent,
    deleteEvent,

    // History (Local)
    addHistoryItem,

    // Tags (Local)
    addTag,
    updateTag,
    deleteTag,

    // CRUD Companies (Local)
    addCompany,
    updateCompany,
    deleteCompany,

    // CRUD Team (Local)
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,

    // CRUD Marketing Campaigns (Local)
    addCampaign,
    updateCampaign,
    deleteCampaign,

    // CRUD Promo Codes (Local)
    addPromoCode,
    updatePromoCode,
    deletePromoCode,

    // CRUD Support Tickets (Local)
    addSupportTicket,
    updateSupportTicket,
    deleteSupportTicket,

    // Utilitaires
    checkCandidateDuplicate,

    // CRUD Evaluations (Local)
    evaluations,
    setEvaluations,
    addEvaluation,
    updateEvaluation,
    deleteEvaluation,
    evaluationCriteria: EVALUATION_CRITERIA,

    // CRUD Tasks (Local)
    tasks,
    setTasks,
    addTask,
    updateTask,
    deleteTask,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

/**
 * Hook pour utiliser le contexte de données
 */
export function useData() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error('useData doit être utilisé dans un DataProvider');
  }

  return context;
}

export default DataContext;
