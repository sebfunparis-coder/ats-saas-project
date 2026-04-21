import React from 'react';

export default function App() {
  const [view, setView] = React.useState('landing');

  // États pour section Users
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [userEditMode, setUserEditMode] = React.useState(false);
  const [editedUserData, setEditedUserData] = React.useState(null);
  const [userDetailView, setUserDetailView] = React.useState(null);

  // États pour section Candidats
  const [selectedCandidate, setSelectedCandidate] = React.useState(null);
  const [candidateEditMode, setCandidateEditMode] = React.useState(false);
  const [editedCandidateData, setEditedCandidateData] = React.useState(null);
  const [candidateDetailView, setCandidateDetailView] = React.useState(null);

  // États pour section Missions
  const [selectedMission, setSelectedMission] = React.useState(null);
  const [showAddUserModal, setShowAddUserModal] = React.useState(false);
  const [newUserData, setNewUserData] = React.useState({firstName: '', lastName: '', email: '', password: '', role: 'Recruteur', phone: '', company: '', plan: 'Starter'});
  const [missionEditMode, setMissionEditMode] = React.useState(false);
  const [editedMissionData, setEditedMissionData] = React.useState(null);
  const [missionDetailView, setMissionDetailView] = React.useState(null);

  const [loggedIn, setLoggedIn] = React.useState(false);
  const [page, setPage] = React.useState('dashboard');
  const [selectedItem, setSelectedItem] = React.useState(null);
  
  const [missions, setMissions] = React.useState([
    { id: 1, title: 'Développeur Full Stack Senior', client: 'TechCorp', location: 'Paris', salary: '50k-70k€', status: 'open', skills: ['React', 'Node.js', 'TypeScript'], description: 'Rejoignez une équipe passionnée qui développe des solutions innovantes', emoji: '💻', color: '#667EEA', links: [{ label: 'Fiche de poste', url: 'https://techcorp.com/jobs/fullstack' }], documents: [{ name: 'job_description.pdf', size: '245 KB' }], notes: '', startDate: '2026-03-01', urgency: 'urgent', address: { street: '45 Avenue des Champs-Élysées', city: 'Paris', zipCode: '75008' }, workMode: 'hybride', contractType: 'CDI', weeklyHours: '39 heures', contactClient: { name: 'Marie Dubois', phone: '+33140506070', email: 'marie.dubois@techcorp.com' }, progress: 60 },
    { id: 2, title: 'Product Manager', client: 'FinanceHub', location: 'Remote', salary: '60k-80k€', status: 'open', skills: ['Product', 'Agile'], description: 'Pilotez la vision produit avec notre équipe', emoji: '🎯', color: '#FF6B9D', links: [{ label: 'Site entreprise', url: 'https://financehub.com' }], documents: [{ name: 'product_requirements.docx', size: '180 KB' }], notes: 'Urgent - Démarrage ASAP', startDate: '2026-02-15', urgency: 'tres urgent', address: { street: '', city: 'Remote', zipCode: '' }, workMode: 'total remote', contractType: 'CDI', weeklyHours: '35 heures', contactClient: { name: 'Jean Martin', phone: '+33145678901', email: 'jean.martin@financehub.com' }, progress: 30 }
  ]);
  
  const [candidates, setCandidates] = React.useState([
    { id: 1, name: 'Alice Martin', email: 'alice@email.com', phone: '+33612345678', position: 'Senior Developer', skills: ['React', 'Node.js', 'TypeScript', 'AWS'], status: 'active', location: 'Paris', experience: 6, avatar: '👩‍💻', color: '#FF6B9D', links: [{ label: 'LinkedIn', url: 'https://linkedin.com/in/alice-martin' }, { label: 'Portfolio', url: 'https://alicemartin.dev' }], documents: [{ name: 'CV_Alice_Martin.pdf', size: '320 KB' }, { name: 'Lettre_motivation.pdf', size: '145 KB' }], notes: 'Excellente candidate, très motivée', department: '75', metier: 'Développeur Full Stack', sector: 'Tech & IT', dateAdded: '2026-01-15', tags: [1, 4], salary: '55k€', availability: '1 mois', source: 'LinkedIn', lastActivity: '2026-02-05', favorite: true },
    { id: 2, name: 'Bob Dupont', email: 'bob@email.com', phone: '+33623456789', position: 'Full Stack Developer', skills: ['Vue.js', 'Python', 'Docker'], status: 'active', location: 'Lyon', experience: 4, avatar: '👨‍💼', color: '#4ECDC4', links: [{ label: 'GitHub', url: 'https://github.com/bobdupont' }], documents: [{ name: 'CV_Bob_Dupont.pdf', size: '280 KB' }], notes: 'Compétences solides en backend', department: '69', metier: 'Développeur Back-end', sector: 'Tech & IT', dateAdded: '2026-01-20', tags: [3], salary: '48k€', availability: 'Immédiate', source: 'Site carrière', lastActivity: '2026-02-04', favorite: false },
    { id: 3, name: 'Claire Bernard', email: 'claire@email.com', phone: '+33634567890', position: 'Product Owner', skills: ['Scrum', 'Agile', 'User Research'], status: 'passive', location: 'Remote', experience: 7, avatar: '👩‍🎓', color: '#A78BFA', links: [{ label: 'LinkedIn', url: 'https://linkedin.com/in/claire-bernard' }], documents: [{ name: 'CV_Claire_Bernard.pdf', size: '295 KB' }, { name: 'Certifications.pdf', size: '520 KB' }], notes: 'Profil senior, expérience internationale', department: '75', metier: 'Product Owner', sector: 'Tech & IT', dateAdded: '2026-02-01', tags: [2], salary: '65k€', availability: '2 mois', source: 'Cooptation', lastActivity: '2026-02-06', favorite: true },
    { id: 4, name: 'David Rousseau', email: 'david@email.com', phone: '+33645678901', position: 'Data Scientist', skills: ['Python', 'Machine Learning', 'SQL'], status: 'active', location: 'Bordeaux', experience: 5, avatar: '👨‍🔬', color: '#8B5CF6', links: [], documents: [{ name: 'CV_David.pdf', size: '310 KB' }], notes: 'Expert en ML', department: '33', metier: 'Data Scientist', sector: 'Tech & IT', dateAdded: '2026-01-25', tags: [1], salary: '52k€', availability: '3 semaines', source: 'Indeed', lastActivity: '2026-02-03', favorite: false },
    { id: 5, name: 'Emma Leroy', email: 'emma.l@email.com', phone: '+33656789012', position: 'UX Designer', skills: ['Figma', 'User Research', 'Prototyping'], status: 'active', location: 'Paris', experience: 3, avatar: '👩‍🎨', color: '#EC4899', links: [{ label: 'Portfolio', url: 'https://emmaleroy.design' }], documents: [{ name: 'CV_Emma.pdf', size: '340 KB' }, { name: 'Portfolio.pdf', size: '2.1 MB' }], notes: 'Créative et rigoureuse', department: '75', metier: 'UX Designer', sector: 'Création & Design', dateAdded: '2026-02-03', tags: [4], salary: '42k€', availability: 'Immédiate', source: 'Behance', lastActivity: '2026-02-06', favorite: true },
    { id: 6, name: 'François Martin', email: 'francois@email.com', phone: '+33667890123', position: 'DevOps Engineer', skills: ['Kubernetes', 'AWS', 'CI/CD'], status: 'active', location: 'Nantes', experience: 6, avatar: '👨‍💻', color: '#10B981', links: [{ label: 'LinkedIn', url: 'https://linkedin.com/in/francois-martin' }], documents: [{ name: 'CV_Francois.pdf', size: '290 KB' }], notes: 'Expertise cloud', department: '44', metier: 'DevOps Engineer', sector: 'Tech & IT', dateAdded: '2026-01-18', tags: [], salary: '58k€', availability: '1 mois', source: 'Recommandation', lastActivity: '2026-02-02', favorite: false },
    { id: 7, name: 'Julie Petit', email: 'julie@email.com', phone: '+33678901234', position: 'Marketing Manager', skills: ['SEO', 'Content', 'Analytics'], status: 'passive', location: 'Marseille', experience: 8, avatar: '👩‍💼', color: '#F59E0B', links: [], documents: [{ name: 'CV_Julie.pdf', size: '270 KB' }], notes: 'Forte expérience marketing digital', department: '13', metier: 'Marketing Manager', sector: 'Marketing & Communication', dateAdded: '2026-01-22', tags: [3], salary: '50k€', availability: '2 mois', source: 'Apec', lastActivity: '2026-01-30', favorite: false }
  ]);
  
  const [clients, setClients] = React.useState([
    { id: 1, name: 'TechCorp SAS', industry: 'Technology', email: 'contact@techcorp.com', status: 'active', missions: 3, emoji: '🚀', color: '#667EEA', links: [{ label: 'Site web', url: 'https://techcorp.com' }, { label: 'LinkedIn', url: 'https://linkedin.com/company/techcorp' }], documents: [{ name: 'Contrat_cadre.pdf', size: '450 KB' }, { name: 'Presentation_entreprise.pptx', size: '2.1 MB' }], notes: 'Client premium depuis 2023' },
    { id: 2, name: 'FinanceHub SA', industry: 'Finance', email: 'rh@financehub.com', status: 'active', missions: 2, emoji: '💰', color: '#F59E0B', links: [{ label: 'Site web', url: 'https://financehub.com' }], documents: [{ name: 'NDA.pdf', size: '180 KB' }], notes: 'Nouveau client - fort potentiel' }
  ]);
  
  const [applications, setApplications] = React.useState([
    { id: 1, candidateName: 'Alice Martin', candidateAvatar: '👩‍💻', missionTitle: 'Développeur Full Stack Senior', status: 'screening', score: 87, links: [{ label: 'Entretien vidéo', url: 'https://meet.google.com/abc-defg' }], documents: [{ name: 'Test_technique.pdf', size: '1.2 MB' }], notes: 'Très bon profil technique' },
    { id: 2, candidateName: 'Bob Dupont', candidateAvatar: '👨‍💼', missionTitle: 'Développeur Full Stack Senior', status: 'received', score: 65, links: [], documents: [{ name: 'CV_recu.pdf', size: '280 KB' }], notes: 'À évaluer rapidement' },
    { id: 3, candidateName: 'Claire Bernard', candidateAvatar: '👩‍🎓', missionTitle: 'Product Manager', status: 'interview_1', score: 92, links: [{ label: 'Calendly', url: 'https://calendly.com/claire-bernard' }], documents: [{ name: 'Portfolio_projets.pdf', size: '3.5 MB' }], notes: 'Candidate exceptionnelle' }
  ]);

  const [draggedApp, setDraggedApp] = React.useState(null);
  const [editMode, setEditMode] = React.useState(false);
  const [editedItem, setEditedItem] = React.useState(null);

  // AGENDA & HISTORIQUE
  const [events, setEvents] = React.useState([
    { id: 1, title: 'Entretien Alice Martin', date: '2026-02-10', time: '14:00', type: 'interview', relatedTo: { type: 'candidate', id: 1, name: 'Alice Martin' }, location: 'Visio Zoom', description: 'Entretien technique', status: 'scheduled', color: '#667EEA' },
    { id: 2, title: 'Réunion TechCorp', date: '2026-02-12', time: '10:00', type: 'meeting', relatedTo: { type: 'client', id: 1, name: 'TechCorp SAS' }, location: 'Bureau Paris', description: 'Point recrutement mensuel', status: 'scheduled', color: '#F59E0B' },
    { id: 3, title: 'Appel Claire Bernard', date: '2026-02-08', time: '15:30', type: 'call', relatedTo: { type: 'candidate', id: 3, name: 'Claire Bernard' }, location: 'Téléphone', description: 'Suivi candidature', status: 'completed', color: '#10B981' }
  ]);

  const [history, setHistory] = React.useState([
    { id: 1, date: '2026-02-03', time: '09:30', action: 'CV reçu', relatedTo: { type: 'candidate', id: 1, name: 'Alice Martin' }, user: 'Admin', details: 'Candidature reçue via LinkedIn', icon: '📨' },
    { id: 2, date: '2026-02-03', time: '10:15', action: 'Présélection validée', relatedTo: { type: 'candidate', id: 1, name: 'Alice Martin' }, user: 'Admin', details: 'Score IA : 87% - Profil excellent', icon: '✓' },
    { id: 3, date: '2026-02-03', time: '11:00', action: 'Entretien planifié', relatedTo: { type: 'candidate', id: 1, name: 'Alice Martin' }, user: 'Admin', details: 'RDV fixé pour le 10/02 à 14h', icon: '📅' },
    { id: 4, date: '2026-02-02', time: '16:45', action: 'Nouveau client', relatedTo: { type: 'client', id: 2, name: 'FinanceHub SA' }, user: 'Admin', details: 'Contrat cadre signé', icon: '🎉' },
    { id: 5, date: '2026-02-01', time: '14:20', action: 'Mission créée', relatedTo: { type: 'mission', id: 2, name: 'Product Manager' }, user: 'Admin', details: 'Ouverture du poste PM', icon: '💼' }
  ]);

  const [calendarView, setCalendarView] = React.useState('month'); // 'day', 'week', 'month'
  const [currentDate, setCurrentDate] = React.useState(new Date(2026, 1, 3)); // 3 février 2026

  // CVTHÈQUE
  const [cvthequeFilter, setCvthequeFilter] = React.useState('all'); // 'all', 'department', 'metier'
  const [selectedDepartment, setSelectedDepartment] = React.useState('all');
  const [selectedMetier, setSelectedMetier] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterSector, setFilterSector] = React.useState('all');
  const [filterCity, setFilterCity] = React.useState('all');
  const [filterDateAdded, setFilterDateAdded] = React.useState('all');

  // V18 ULTIMATE - NOUVELLES FONCTIONNALITÉS
  const [notifications, setNotifications] = React.useState([
    { id: 1, type: 'success', message: 'Alice Martin ajoutée', date: new Date().toISOString(), read: false },
    { id: 2, type: 'warning', message: 'Entretien Bob dans 2h', date: new Date().toISOString(), read: false },
    { id: 3, type: 'info', message: 'Mission Product Manager mise à jour', date: new Date(Date.now() - 86400000).toISOString(), read: true }
  ]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showQuickAdd, setShowQuickAdd] = React.useState(false);
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);
  const [tags, setTags] = React.useState([
    { id: 1, name: 'Urgent', color: '#EF4444' },
    { id: 2, name: 'VIP', color: '#F59E0B' },
    { id: 3, name: 'À rappeler', color: '#3B82F6' },
    { id: 4, name: 'Top candidat', color: '#10B981' }
  ]);
  const [viewMode, setViewMode] = React.useState('grid');
  const [sortBy, setSortBy] = React.useState('date');

  // ========== SUPER ADMIN ÉTATS ==========
  const [isSuperAdmin, setIsSuperAdmin] = React.useState(false);
  const [superAdminPassword, setSuperAdminPassword] = React.useState('');
  const [showSuperAdminLogin, setShowSuperAdminLogin] = React.useState(false);
  const [superAdminPage, setSuperAdminPage] = React.useState('overview');
  const [selectedCompany, setSelectedCompany] = React.useState(null);
  const [companyEditMode, setCompanyEditMode] = React.useState(false);
  const [editedCompanyData, setEditedCompanyData] = React.useState(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = React.useState(null);
  
  // Base utilisateurs démo
  const [demoUsers, setDemoUsers] = React.useState([
    { id: 1, email: 'demo@techcorp.com', password: 'demo123', company: 'TechCorp SAS', firstName: 'Marie', lastName: 'Dubois', phone: '+33612345678', role: 'RH Manager', plan: 'Pro', signupDate: '2026-01-15 10:30', lastLogin: '2026-02-06 09:15', status: 'active', sessions: 45, totalCandidates: 12, totalMissions: 3, ip: '192.168.1.100', browser: 'Chrome 121', location: 'Paris, France' },
    { id: 2, email: 'contact@startupx.io', password: 'startup2026', company: 'StartupX', firstName: 'Thomas', lastName: 'Bernard', phone: '+33623456789', role: 'CEO', plan: 'Starter', signupDate: '2026-01-20 14:22', lastLogin: '2026-02-05 18:30', status: 'active', sessions: 28, totalCandidates: 8, totalMissions: 2, ip: '82.65.123.45', browser: 'Firefox 122', location: 'Lyon, France' },
    { id: 3, email: 'hr@financehub.com', password: 'finance456', company: 'FinanceHub SA', firstName: 'Sophie', lastName: 'Martin', phone: '+33634567890', role: 'Talent Acquisition', plan: 'Enterprise', signupDate: '2026-01-25 11:05', lastLogin: '2026-02-06 08:45', status: 'active', sessions: 67, totalCandidates: 24, totalMissions: 7, ip: '217.12.98.156', browser: 'Safari 17', location: 'Paris, France' }
  ]);

  const [platformStats] = React.useState({
    totalUsers: 3,
    activeUsers: 3,
    totalSessions: 140,
    totalRevenue: '8180€',
    todayLogins: 12
  });

  const [systemLogs] = React.useState([
    { id: 1, timestamp: '2026-02-06 09:15:23', user: 'demo@techcorp.com', action: 'Connexion réussie', ip: '192.168.1.100', status: 'success' },
    { id: 2, timestamp: '2026-02-06 08:45:12', user: 'hr@financehub.com', action: 'Connexion réussie', ip: '217.12.98.156', status: 'success' },
    { id: 3, timestamp: '2026-02-05 18:30:56', user: 'contact@startupx.io', action: 'Connexion réussie', ip: '82.65.123.45', status: 'success' }
  ]);

  const [siteConfig] = React.useState({
    siteName: 'ATS Ultimate',
    version: 'v22.0.0',
    maintenanceMode: false,
    allowSignups: true
  });

  // Données candidats globaux
  const [globalCandidates] = React.useState([
    { id: 1, name: 'Alexandre Martin', company: 'TechCorp SAS', poste: 'Développeur Full Stack', experience: '5 ans', status: 'En processus', email: 'a.martin@email.com', phone: '+33612345001', localisation: 'Paris', salaire: '55k€', disponibilite: 'Immédiate', source: 'LinkedIn', dateAjout: '2026-01-15', tags: ['React', 'Node.js', 'AWS'], cv: 'alexandre_martin_cv.pdf', notes: 'Excellent profil technique' },
    { id: 2, name: 'Sophie Dubois', company: 'TechCorp SAS', poste: 'Chef de Projet Digital', experience: '8 ans', status: 'Entretien planifié', email: 's.dubois@email.com', phone: '+33612345002', localisation: 'Lyon', salaire: '65k€', disponibilite: '1 mois', source: 'Recommandation', dateAjout: '2026-01-18', tags: ['Agile', 'Scrum', 'Product'], cv: 'sophie_dubois_cv.pdf', notes: 'Forte expérience en gestion de projet' },
    { id: 3, name: 'Thomas Leroy', company: 'TechCorp SAS', poste: 'Data Scientist', experience: '3 ans', status: 'Nouveau', email: 't.leroy@email.com', phone: '+33612345003', localisation: 'Paris', salaire: '50k€', disponibilite: 'Immédiate', source: 'Site carrière', dateAjout: '2026-02-01', tags: ['Python', 'ML', 'TensorFlow'], cv: 'thomas_leroy_cv.pdf', notes: '' },
    { id: 4, name: 'Emma Petit', company: 'StartupX', poste: 'UX Designer', experience: '4 ans', status: 'En processus', email: 'e.petit@email.com', phone: '+33612345004', localisation: 'Marseille', salaire: '48k€', disponibilite: '2 semaines', source: 'Portfolio', dateAjout: '2026-01-22', tags: ['Figma', 'UI/UX', 'Design System'], cv: 'emma_petit_cv.pdf', notes: 'Portfolio impressionnant' },
    { id: 5, name: 'Lucas Bernard', company: 'StartupX', poste: 'DevOps Engineer', experience: '6 ans', status: 'Offre envoyée', email: 'l.bernard@email.com', phone: '+33612345005', localisation: 'Toulouse', salaire: '58k€', disponibilite: '1 mois', source: 'LinkedIn', dateAjout: '2026-01-25', tags: ['Docker', 'K8s', 'CI/CD'], cv: 'lucas_bernard_cv.pdf', notes: 'Expertise DevOps confirmée' },
    { id: 6, name: 'Camille Moreau', company: 'StartupX', poste: 'Marketing Manager', experience: '7 ans', status: 'Entretien planifié', email: 'c.moreau@email.com', phone: '+33612345006', localisation: 'Bordeaux', salaire: '52k€', disponibilite: 'Immédiate', source: 'Indeed', dateAjout: '2026-01-28', tags: ['Growth', 'SEO', 'Content'], cv: 'camille_moreau_cv.pdf', notes: 'Spécialiste growth marketing' },
    { id: 7, name: 'Nicolas Simon', company: 'FinanceHub SA', poste: 'Analyste Financier', experience: '5 ans', status: 'En processus', email: 'n.simon@email.com', phone: '+33612345007', localisation: 'Paris', salaire: '62k€', disponibilite: '3 semaines', source: 'Apec', dateAjout: '2026-01-30', tags: ['Finance', 'Excel', 'Modélisation'], cv: 'nicolas_simon_cv.pdf', notes: 'Profil senior avec certifications' },
    { id: 8, name: 'Julie Laurent', company: 'FinanceHub SA', poste: 'Compliance Officer', experience: '9 ans', status: 'Nouveau', email: 'j.laurent@email.com', phone: '+33612345008', localisation: 'Paris', salaire: '70k€', disponibilite: '2 mois', source: 'Recommandation', dateAjout: '2026-02-02', tags: ['Compliance', 'Réglementation', 'Audit'], cv: 'julie_laurent_cv.pdf', notes: 'Expertise réglementaire bancaire' }
  ]);

  // Données missions globales
  const [globalMissions] = React.useState([
    { id: 1, titre: 'Développeur Full Stack Senior', company: 'TechCorp SAS', localisation: 'Paris', type: 'CDI', salaire: '50-70k€', status: 'Ouverte', urgence: 'Haute', dateCreation: '2026-01-10', dateLimit: '2026-03-15', candidatures: 8, vues: 156, secteur: 'Tech', experience: '5+ ans', teletravail: 'Hybride' },
    { id: 2, titre: 'Chef de Projet Digital', company: 'TechCorp SAS', localisation: 'Lyon', type: 'CDI', salaire: '60-75k€', status: 'Ouverte', urgence: 'Moyenne', dateCreation: '2026-01-12', dateLimit: '2026-03-20', candidatures: 5, vues: 98, secteur: 'Digital', experience: '7+ ans', teletravail: 'Partiel' },
    { id: 3, titre: 'Data Scientist', company: 'TechCorp SAS', localisation: 'Paris', type: 'CDI', salaire: '45-60k€', status: 'En cours', urgence: 'Haute', dateCreation: '2026-01-15', dateLimit: '2026-03-01', candidatures: 12, vues: 234, secteur: 'Data', experience: '3+ ans', teletravail: 'Full remote' },
    { id: 4, titre: 'UX Designer', company: 'StartupX', localisation: 'Marseille', type: 'CDI', salaire: '42-55k€', status: 'Ouverte', urgence: 'Moyenne', dateCreation: '2026-01-18', dateLimit: '2026-03-25', candidatures: 6, vues: 143, secteur: 'Design', experience: '4+ ans', teletravail: 'Hybride' },
    { id: 5, titre: 'DevOps Engineer', company: 'StartupX', localisation: 'Remote', type: 'CDI', salaire: '55-70k€', status: 'En cours', urgence: 'Haute', dateCreation: '2026-01-20', dateLimit: '2026-02-28', candidatures: 9, vues: 187, secteur: 'Tech', experience: '5+ ans', teletravail: 'Full remote' },
    { id: 6, titre: 'Analyste Financier Senior', company: 'FinanceHub SA', localisation: 'Paris', type: 'CDI', salaire: '60-80k€', status: 'Ouverte', urgence: 'Moyenne', dateCreation: '2026-01-22', dateLimit: '2026-03-30', candidatures: 7, vues: 112, secteur: 'Finance', experience: '5+ ans', teletravail: 'Partiel' },
    { id: 7, titre: 'Compliance Officer', company: 'FinanceHub SA', localisation: 'Paris', type: 'CDI', salaire: '65-85k€', status: 'Ouverte', urgence: 'Haute', dateCreation: '2026-01-25', dateLimit: '2026-03-10', candidatures: 4, vues: 89, secteur: 'Finance', experience: '8+ ans', teletravail: 'Sur site' }
  ]);

  // ÉQUIPE
  const [team, setTeam] = React.useState([
    { id: 1, name: 'Sophie Chen', role: 'Recruteur Senior', email: 'sophie.chen@ats.com', phone: '+33612345678', avatar: '👩‍💼', color: '#667EEA', assignedClients: [1], assignedMissions: [1], active: true, hireDate: '2024-01-15', stats: { missions: 12, placements: 8, revenue: '245k€' }, activity: { lastLogin: '2026-02-03 09:30', candidatesContacted: 45, interviewsScheduled: 12, avgResponseTime: '2h', weeklyHours: 38 }, performance: { monthlyGoal: 3, monthlyAchieved: 2, conversionRate: '18%', satisfaction: 4.8 } },
    { id: 2, name: 'Marc Dubois', role: 'Chargé de Recrutement', email: 'marc.dubois@ats.com', phone: '+33623456789', avatar: '👨‍💼', color: '#FF6B9D', assignedClients: [2], assignedMissions: [2], active: true, hireDate: '2024-06-01', stats: { missions: 8, placements: 5, revenue: '180k€' }, activity: { lastLogin: '2026-02-03 08:15', candidatesContacted: 32, interviewsScheduled: 8, avgResponseTime: '3h', weeklyHours: 35 }, performance: { monthlyGoal: 2, monthlyAchieved: 2, conversionRate: '15%', satisfaction: 4.5 } },
    { id: 3, name: 'Emma Rousseau', role: 'Recruteur Junior', email: 'emma.rousseau@ats.com', phone: '+33634567890', avatar: '👩‍🎓', color: '#4ECDC4', assignedClients: [], assignedMissions: [], active: true, hireDate: '2025-09-01', stats: { missions: 3, placements: 1, revenue: '45k€' }, activity: { lastLogin: '2026-02-02 16:45', candidatesContacted: 18, interviewsScheduled: 3, avgResponseTime: '4h', weeklyHours: 40 }, performance: { monthlyGoal: 1, monthlyAchieved: 1, conversionRate: '8%', satisfaction: 4.2 } },
    { id: 4, name: 'Thomas Martin', role: 'Sourceur', email: 'thomas.martin@ats.com', phone: '+33645678901', avatar: '👨‍💻', color: '#F59E0B', assignedClients: [], assignedMissions: [], active: false, hireDate: '2023-03-10', stats: { missions: 15, placements: 10, revenue: '320k€' }, activity: { lastLogin: '2026-01-15 14:20', candidatesContacted: 120, interviewsScheduled: 25, avgResponseTime: '1h', weeklyHours: 0 }, performance: { monthlyGoal: 3, monthlyAchieved: 0, conversionRate: '22%', satisfaction: 4.9 } }
  ]);

  // ADMINISTRATION
  const [settings, setSettings] = React.useState({
    companyName: 'ATS Ultimate',
    companyEmail: 'contact@ats-ultimate.com',
    companyPhone: '+33140506070',
    companyAddress: '123 Avenue des Champs-Élysées, 75008 Paris',
    language: 'Français',
    currency: 'EUR (€)',
    timezone: 'Europe/Paris',
    notifications: { email: true, sms: false, push: true },
    privacy: { dataRetention: '24 mois', encryption: true },
    integrations: [
      { name: 'LinkedIn', status: 'active', icon: '💼' },
      { name: 'Indeed', status: 'inactive', icon: '🔍' },
      { name: 'Google Calendar', status: 'active', icon: '📅' }
    ]
  });

  const NavBar = () => (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '16px 0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setView('landing')}>
          <div style={{ fontSize: '32px' }}>✨</div>
          <div style={{ fontSize: '22px', fontWeight: '800', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ATS Ultimate</div>
        </div>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          {[['landing', '🏠 Accueil'], ['features', '⚡ Features'], ['pricing', '💎 Tarifs'], ['demo', '🎮 Démo'], ['admin', '👑 Admin']].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: view === v ? '700' : '500', color: view === v ? '#667EEA' : '#4B5563' }}>
              {label}
            </button>
          ))}
          <button onClick={() => setView('demo')} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)' }}>
              Essayer ✨
            </button>
        </div>
      </div>
    </nav>
  );

  // LANDING PAGE
  if (view === 'landing') {
    return (
      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <NavBar />
        
        <style>{`
          @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        `}</style>
        
        {/* HERO */}
        <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 25%, #FF6B9D 50%, #C471F5 75%, #667EEA 100%)', backgroundSize: '400% 400%', animation: 'gradient 15s ease infinite', color: 'white', paddingTop: '100px', position: 'relative', overflow: 'hidden' }}>
          {['🚀', '⚡', '💎', '🎯', '✨', '🌟', '💫', '🎨'].map((emoji, i) => (
            <div key={i} style={{ position: 'absolute', fontSize: '60px', opacity: 0.3, animation: `float ${3 + i * 0.5}s ease-in-out infinite`, left: `${10 + i * 12}%`, top: `${20 + (i % 3) * 25}%` }}>{emoji}</div>
          ))}

          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 60px', width: '100%', position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: '900px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'inline-block', padding: '12px 24px', background: 'rgba(255,255,255,0.2)', borderRadius: '50px' }}>
                🎉 Plateforme ATS #1 en France
              </div>
              <h1 style={{ fontSize: '72px', fontWeight: '900', marginBottom: '32px', lineHeight: '1.1', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                Recrutez les meilleurs talents 10x plus vite ⚡
              </h1>
              <p style={{ fontSize: '28px', marginBottom: '48px', opacity: 0.95, lineHeight: '1.6', fontWeight: '500' }}>
                L'intelligence artificielle au service de vos recrutements. Automatisez, optimisez et trouvez le candidat parfait en quelques clics. 🎯
              </p>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '60px' }}>
                <button onClick={() => setView('demo')} style={{ padding: '20px 40px', background: 'white', color: '#667EEA', border: 'none', borderRadius: '16px', cursor: 'pointer', fontWeight: '800', fontSize: '20px', boxShadow: '0 12px 48px rgba(0,0,0,0.3)' }}>
                  🚀 Démarrer Gratuitement
                </button>
                <button onClick={() => setView('features')} style={{ padding: '20px 40px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '3px solid white', borderRadius: '16px', cursor: 'pointer', fontWeight: '700', fontSize: '20px', backdropFilter: 'blur(10px)' }}>
                  📊 Découvrir
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '60px', padding: '40px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '2px solid rgba(255,255,255,0.3)' }}>
                {[['⚡ 10x', 'Plus rapide'], ['🎯 87%', 'Match IA'], ['🌟 500+', 'Clients']].map(([num, label], i) => (
                  <div key={i} style={{ flex: 1, cursor: 'pointer' }} onClick={() => setView('features')}>
                    <div style={{ fontSize: '56px', fontWeight: '900', marginBottom: '8px' }}>{num}</div>
                    <div style={{ fontSize: '20px', fontWeight: '700' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section style={{ padding: '140px 60px', background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 50%, #EFF6FF 100%)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '100px' }}>
              <h2 style={{ fontSize: '56px', fontWeight: '900', marginBottom: '20px', background: 'linear-gradient(135deg, #1F2937 0%, #667EEA 50%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Tout ce dont vous rêviez 🚀
              </h2>
              <p style={{ fontSize: '22px', color: '#6B7280' }}>Une suite complète d'outils puissants</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
              {[
                ['🤖', 'IA Avancée', 'Scoring automatique avec 87% de précision', 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)'],
                ['📊', 'Pipeline Visuel', 'Kanban intuitif avec drag & drop', 'linear-gradient(135deg, #FF6B9D 0%, #FEC7D7 100%)'],
                ['👥', 'CVthèque', 'Base de données intelligente', 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)'],
                ['📅', 'Planning', 'Calendrier intégré automatique', 'linear-gradient(135deg, #A78BFA 0%, #C471F5 100%)'],
                ['✉️', 'Auto-Emails', 'Templates et envois automatiques', 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)'],
                ['📈', 'Analytics', 'Dashboards temps réel', 'linear-gradient(135deg, #10B981 0%, #34D399 100%)']
              ].map(([emoji, title, desc, gradient], i) => (
                <div key={i} style={{ padding: '48px', background: 'white', borderRadius: '24px', textAlign: 'center', cursor: 'pointer', border: '2px solid transparent', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transition: 'all 0.4s' }}
                  onClick={() => setView('features')}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 24px 60px rgba(102, 126, 234, 0.25)'; e.currentTarget.style.borderColor = '#667EEA'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = 'transparent'; }}>
                  <div style={{ width: '100px', height: '100px', margin: '0 auto 24px', background: gradient, borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px', boxShadow: '0 12px 40px rgba(102, 126, 234, 0.3)' }}>
                    {emoji}
                  </div>
                  <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px', color: '#1F2937' }}>{title}</h3>
                  <p style={{ color: '#6B7280', lineHeight: '1.7', fontSize: '16px' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ padding: '140px 60px', background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', color: 'white' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
              <h2 style={{ fontSize: '56px', fontWeight: '900', marginBottom: '20px' }}>Ils nous font confiance 💫</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
              {[
                ['Sarah L.', 'DRH TechCorp', '⭐⭐⭐⭐⭐', 'Temps divisé par 3 ! L\'IA est bluffante 🚀'],
                ['Marc D.', 'CEO Startup', '⭐⭐⭐⭐⭐', 'Interface intuitive, ROI incroyable 💎'],
                ['Julie M.', 'Recruteuse', '⭐⭐⭐⭐⭐', 'Meilleur ATS du marché ! Je recommande ✨']
              ].map(([name, role, stars, text], i) => (
                <div key={i} style={{ padding: '40px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ fontSize: '24px', marginBottom: '16px' }}>{stars}</div>
                  <p style={{ fontSize: '18px', marginBottom: '24px', lineHeight: '1.6', fontStyle: 'italic' }}>"{text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                      {['👩‍💼', '👨‍💻', '👩‍🎤'][i]}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '16px' }}>{name}</div>
                      <div style={{ opacity: 0.7, fontSize: '14px' }}>{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '140px 60px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', color: 'white', textAlign: 'center' }}>
          <h2 style={{ fontSize: '64px', fontWeight: '900', marginBottom: '28px' }}>Prêt à révolutionner ? 🚀</h2>
          <p style={{ fontSize: '24px', marginBottom: '48px', opacity: 0.95 }}>Rejoignez les 500+ entreprises qui recrutent mieux</p>
          <button onClick={() => setView('demo')} style={{ padding: '24px 56px', background: 'white', color: '#667EEA', border: 'none', borderRadius: '16px', cursor: 'pointer', fontWeight: '900', fontSize: '22px', boxShadow: '0 16px 60px rgba(0,0,0,0.3)' }}>
            ✨ Essai Gratuit 14 Jours
          </button>
        </section>

        {/* FOOTER */}
        <footer style={{ padding: '80px 60px 40px', background: 'linear-gradient(180deg, #111827 0%, #000000 100%)', color: 'white', position: 'relative' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '20px' }}>✨ ATS Ultimate</div>
            <p style={{ color: '#9CA3AF', marginBottom: '40px' }}>© 2026 ATS Ultimate. Tous droits réservés.</p>
            <button 
              onClick={() => setShowSuperAdminLogin(true)} 
              style={{ position: 'absolute', bottom: '20px', right: '20px', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', opacity: 0.3, transition: 'all 0.3s' }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.3'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
              👑 Admin
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // FEATURES PAGE
  if (view === 'features') {
    return (
      <div style={{ fontFamily: 'system-ui' }}>
        <NavBar />
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'linear-gradient(180deg, #ffffff 0%, #f3e7ff 50%, #ddd6fe 100%)', padding: '140px 60px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '72px', fontWeight: '900', textAlign: 'center', marginBottom: '32px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ⚡ Fonctionnalités Complètes
            </h1>
            <p style={{ fontSize: '24px', color: '#4B5563', textAlign: 'center', marginBottom: '80px' }}>Découvrez toute la puissance d'ATS Ultimate</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '60px' }}>
              {[
                { icon: '🤖', title: 'Intelligence Artificielle', desc: 'Notre IA analyse et score automatiquement chaque CV avec une précision de 87%' },
                { icon: '📊', title: 'Pipeline Kanban', desc: 'Gérez vos candidatures avec un système de drag & drop intuitif et fluide' },
                { icon: '👥', title: 'CVthèque Centralisée', desc: 'Tous vos talents dans une base de données intelligente et facilement searchable' },
                { icon: '📅', title: 'Calendrier Intégré', desc: 'Planifiez tous vos entretiens avec synchronisation automatique' },
                { icon: '✉️', title: 'Communication Auto', desc: 'Emails personnalisés et automatiques à chaque étape du processus' },
                { icon: '📈', title: 'Analytics Avancés', desc: 'Pilotez votre recrutement avec des dashboards et rapports en temps réel' }
              ].map((feature, i) => (
                <div key={i} style={{ background: 'white', padding: '48px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.3s' }}
                  onClick={() => setView('demo')}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ fontSize: '72px', marginBottom: '24px', textAlign: 'center' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '18px', color: '#6B7280', lineHeight: '1.7' }}>{feature.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '80px' }}>
              <button onClick={() => setView('demo')} style={{ padding: '20px 48px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', fontWeight: '800', fontSize: '20px', boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)' }}>
                🚀 Tester Maintenant
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PRICING PAGE
  if (view === 'pricing') {
    return (
      <div style={{ fontFamily: 'system-ui' }}>
        <NavBar />
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'linear-gradient(180deg, #ddd6fe 0%, #8b5cf6 50%, #4f46e5 100%)', padding: '140px 60px', color: 'white' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '72px', fontWeight: '900', textAlign: 'center', marginBottom: '32px' }}>💎 Tarifs Transparents</h1>
            <p style={{ fontSize: '24px', textAlign: 'center', marginBottom: '80px', opacity: 0.9 }}>Choisissez la formule parfaite</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
              {[
                { name: 'Starter', price: '99€', period: '/mois', popular: false },
                { name: 'Professional', price: '299€', period: '/mois', popular: true },
                { name: 'Enterprise', price: 'Sur mesure', period: '', popular: false }
              ].map((plan, i) => (
                <div key={i} style={{ padding: '40px', background: plan.popular ? 'white' : 'rgba(255,255,255,0.1)', color: plan.popular ? '#1F2937' : 'white', border: plan.popular ? 'none' : '2px solid rgba(255,255,255,0.2)', borderRadius: '20px', position: 'relative', transform: plan.popular ? 'scale(1.05)' : 'scale(1)', boxShadow: plan.popular ? '0 20px 60px rgba(0,0,0,0.3)' : 'none', cursor: 'pointer', transition: 'all 0.3s' }}
                  onClick={() => setView('demo')}
                  onMouseEnter={(e) => e.currentTarget.style.transform = plan.popular ? 'scale(1.08)' : 'scale(1.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = plan.popular ? 'scale(1.05)' : 'scale(1)'}>
                  {plan.popular && (
                    <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', color: 'white', padding: '6px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                      LE PLUS POPULAIRE
                    </div>
                  )}
                  <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>{plan.name}</h3>
                  <div style={{ marginBottom: '32px' }}>
                    <span style={{ fontSize: '48px', fontWeight: 'bold' }}>{plan.price}</span>
                    <span style={{ fontSize: '20px', opacity: 0.7 }}>{plan.period}</span>
                  </div>
                  <button style={{ width: '100%', padding: '16px', background: plan.popular ? 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)' : 'white', color: plan.popular ? 'white' : '#667EEA', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>
                    Commencer
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PAGE ADMIN - CONNEXION SUPERADMIN
  if (view === 'admin') {
    return (
      <div style={{ fontFamily: 'system-ui' }}>
        <NavBar />
        
        {/* Hero Admin */}
        <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)', paddingTop: '100px', position: 'relative', overflow: 'hidden' }}>
          {/* Background Pattern */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
            {[...Array(20)].map((_, i) => (
              <div key={i} style={{ 
                position: 'absolute', 
                width: '2px', 
                height: '100%', 
                background: 'linear-gradient(180deg, transparent 0%, #667EEA 50%, transparent 100%)',
                left: `${i * 5}%`,
                animation: `pulse ${2 + i * 0.1}s ease-in-out infinite`
              }}></div>
            ))}
          </div>

          <style>{`
            @keyframes pulse { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.3; } }
          `}</style>

          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 60px', width: '100%', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '80px', alignItems: 'center' }}>
              
              {/* Colonne gauche - Infos */}
              <div>
                <div style={{ display: 'inline-block', padding: '8px 20px', background: 'rgba(102, 126, 234, 0.2)', borderRadius: '20px', marginBottom: '24px', border: '1px solid rgba(102, 126, 234, 0.3)' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#667EEA' }}>👑 ESPACE RÉSERVÉ</span>
                </div>
                
                <h1 style={{ fontSize: '64px', fontWeight: '900', marginBottom: '24px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
                  SuperAdmin<br/>Dashboard
                </h1>
                
                <p style={{ fontSize: '22px', color: '#94A3B8', marginBottom: '40px', lineHeight: 1.6 }}>
                  Accès complet au panneau de contrôle de la plateforme. Gestion des utilisateurs, analytics, logs système et configuration.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                  {[
                    ['👥', 'Gestion Utilisateurs', 'Accès complet aux comptes et données'],
                    ['📊', 'Analytics Avancées', 'Statistiques et métriques détaillées'],
                    ['📜', 'Logs Système', 'Historique complet des événements'],
                    ['⚙️', 'Configuration', 'Paramètres de la plateforme']
                  ].map(([icon, title, desc], i) => (
                    <div key={i} style={{ display: 'flex', gap: '16px', padding: '20px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '16px', border: '1px solid rgba(100, 116, 139, 0.2)', backdropFilter: 'blur(10px)' }}>
                      <div style={{ fontSize: '32px' }}>{icon}</div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>{title}</div>
                        <div style={{ fontSize: '14px', color: '#94A3B8' }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '20px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '16px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                  <div style={{ fontSize: '14px', color: '#FCD34D', fontWeight: '700', marginBottom: '8px' }}>⚠️ Accès Sécurisé</div>
                  <div style={{ fontSize: '13px', color: '#FDE68A' }}>Cette page est réservée aux administrateurs système. Toutes les actions sont tracées et enregistrées.</div>
                </div>
              </div>

              {/* Colonne droite - Formulaire de connexion */}
              <div style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', padding: '60px', borderRadius: '32px', border: '2px solid #334155', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                  <div style={{ fontSize: '80px', marginBottom: '20px' }}>👑</div>
                  <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>Connexion Admin</h2>
                  <p style={{ fontSize: '15px', color: '#94A3B8' }}>Entrez vos identifiants administrateur</p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#94A3B8', marginBottom: '10px', textTransform: 'uppercase' }}>
                    Identifiant
                  </label>
                  <input 
                    type="text"
                    placeholder="admin"
                    defaultValue="admin"
                    style={{ width: '100%', padding: '16px', background: '#0F172A', border: '2px solid #334155', borderRadius: '12px', color: 'white', fontSize: '16px', outline: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#94A3B8', marginBottom: '10px', textTransform: 'uppercase' }}>
                    Mot de passe
                  </label>
                  <input 
                    type="password"
                    placeholder="Mot de passe administrateur"
                    value={superAdminPassword}
                    onChange={(e) => setSuperAdminPassword(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && superAdminPassword === 'admin2026') {
                        setIsSuperAdmin(true);
                        setView('superadmin');
                      }
                    }}
                    style={{ width: '100%', padding: '16px', background: '#0F172A', border: '2px solid #334155', borderRadius: '12px', color: 'white', fontSize: '16px', outline: 'none' }}
                    autoFocus
                  />
                </div>

                <button 
                  onClick={() => {
                    if (superAdminPassword === 'admin2026') {
                      setIsSuperAdmin(true);
                      setView('superadmin');
                    } else {
                      alert('❌ Mot de passe incorrect');
                    }
                  }}
                  style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '17px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  🔓 Accéder au Dashboard
                </button>

                <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ fontSize: '12px', color: '#6EE7B7', fontWeight: '700', marginBottom: '8px' }}>💡 Identifiants de test</div>
                  <div style={{ fontSize: '13px', color: '#A7F3D0', fontFamily: 'monospace' }}>
                    Identifiant: <strong>admin</strong><br/>
                    Mot de passe: <strong>admin2026</strong>
                  </div>
                </div>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                  <button onClick={() => setView('landing')} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}>
                    ← Retour à l'accueil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // DEMO/LOGIN
  if (view === 'demo' && !loggedIn) {
    return (
      <div style={{ fontFamily: 'system-ui' }}>
        <NavBar />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', paddingTop: '100px' }}>
          <div style={{ background: 'white', padding: '60px', borderRadius: '32px', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', width: '480px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ fontSize: '72px', marginBottom: '16px' }}>✨</div>
              <h1 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '8px' }}>Bienvenue !</h1>
              <p style={{ color: '#6B7280', fontSize: '16px' }}>Accédez à la démo complète</p>
            </div>

            <button onClick={() => { setLoggedIn(true); setView('app'); }} style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: '800', cursor: 'pointer', marginBottom: '24px', boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)' }}>
              🚀 Découvrir la Démo
            </button>

            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #fef5ff 0%, #f3e7ff 100%)', borderRadius: '16px', textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontWeight: '700', marginBottom: '8px', color: '#667eea', fontSize: '15px' }}>✨ Démo Interactive</div>
              <div style={{ color: '#6B7280', fontSize: '14px' }}>Explorez toutes les fonctionnalités</div>
            </div>

            <button onClick={() => setView('landing')} style={{ width: '100%', padding: '14px', background: 'transparent', color: '#667EEA', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '700' }}>
              ← Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // APPLICATION
  if (view === 'app' && loggedIn) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui' }}>
        {/* SIDEBAR */}
        <div style={{ width: '280px', background: 'linear-gradient(180deg, #1F2937 0%, #111827 50%, #000000 100%)', color: 'white', padding: '40px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '48px', cursor: 'pointer' }} onClick={() => { setLoggedIn(false); setView('landing'); }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ fontSize: '32px' }}>✨</div>
              <h1 style={{ fontSize: '22px', fontWeight: '900' }}>ATS Ultimate</h1>
            </div>
            <p style={{ fontSize: '11px', color: '#9CA3AF' }}>Version Démo Interactive</p>
          </div>
          
          <div style={{ flex: 1 }}>
            {[
              ['dashboard', '📊', 'Dashboard'],
              ['missions', '💼', 'Missions'],
              ['candidats', '👥', 'Candidats'],
              ['cvtheque', '📚', 'CVthèque'],
              ['applications', '📄', 'Pipeline'],
              ['clients', '🏢', 'Clients'],
              ['agenda', '📅', 'Agenda'],
              ['equipe', '👨‍👩‍👧‍👦', 'Équipe'],
              ['admin', '⚙️', 'Admin']
            ].map(([id, icon, label]) => (
              <button key={id} onClick={() => setPage(id)} style={{ width: '100%', padding: '14px 18px', background: page === id ? 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)' : 'transparent', color: 'white', border: 'none', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', marginBottom: '8px', fontWeight: page === id ? '700' : '500', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s' }}
                onMouseEnter={(e) => { if (page !== id) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { if (page !== id) e.currentTarget.style.background = 'transparent'; }}>
                <span style={{ fontSize: '20px' }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #374151', paddingTop: '24px' }}>
            <button onClick={() => { setLoggedIn(false); setView('landing'); }} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
              🚪 Retour au Site
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, background: 'linear-gradient(180deg, #ffffff 0%, #fef5ff 50%, #f3e7ff 100%)', padding: '50px', overflowY: 'auto', maxHeight: '100vh' }}>
          
          {/* DASHBOARD */}
          {page === 'dashboard' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                  <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '12px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    📊 Dashboard
                  </h2>
                  <p style={{ fontSize: '18px', color: '#6B7280' }}>Vue d'ensemble complète • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <button onClick={() => alert('Action rapide : Sélectionnez un type (Mission/Candidat/Client/RDV)')} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)' }}>
                  ➕ Action Rapide
                </button>
              </div>

              {/* KPIs Principaux */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                {[
                  ['💼', 'Missions Actives', missions.length, () => setPage('missions'), '#667EEA', '+2 cette semaine'],
                  ['👥', 'Candidats', candidates.length, () => setPage('candidats'), '#FF6B9D', `${candidates.filter(c => c.status === 'active').length} actifs`],
                  ['📄', 'Applications', applications.length, () => setPage('applications'), '#4ECDC4', `Score moyen: ${Math.round(applications.reduce((sum, a) => sum + a.score, 0) / applications.length)}%`],
                  ['🏢', 'Clients Actifs', clients.filter(c => c.status === 'active').length, () => setPage('clients'), '#F59E0B', `${clients.length} total`]
                ].map(([icon, label, value, action, color, subtitle], i) => (
                  <div key={i} onClick={action} style={{ padding: '28px', background: 'white', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.3s', border: '2px solid transparent' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = color; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; }}>
                    <div style={{ fontSize: '44px', marginBottom: '14px' }}>{icon}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontSize: '36px', fontWeight: '900', background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>{value}</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600' }}>{subtitle}</div>
                  </div>
                ))}
              </div>

              {/* Activité Récente & Performance */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '40px' }}>
                {/* Activité Récente */}
                <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    ⚡ Activité Récente
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {history.slice(0, 5).map(h => (
                      <div key={h.id} style={{ padding: '16px', background: 'linear-gradient(135deg, #fef5ff 0%, #ffffff 100%)', borderRadius: '12px', borderLeft: '4px solid #667EEA', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>{h.icon}</span>
                            <span style={{ fontWeight: '700', fontSize: '14px', color: '#1F2937' }}>{h.action}</span>
                          </div>
                          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600' }}>{h.time}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#6B7280', marginLeft: '28px' }}>{h.details}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance ce Mois */}
                <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    📈 Performance ce Mois
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {[
                      { label: 'Taux de conversion', value: 18, color: '#10B981', total: 100 },
                      { label: 'Candidatures reçues', value: 45, color: '#667EEA', total: 60 },
                      { label: 'Entretiens planifiés', value: 12, color: '#F59E0B', total: 15 },
                      { label: 'Placements réussis', value: 8, color: '#FF6B9D', total: 10 }
                    ].map((stat, i) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>{stat.label}</span>
                          <span style={{ fontSize: '14px', fontWeight: '800', color: stat.color }}>{stat.value}/{stat.total}</span>
                        </div>
                        <div style={{ width: '100%', height: '10px', background: '#E5E7EB', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${(stat.value / stat.total) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${stat.color} 0%, ${stat.color}99 100%)`, transition: 'width 0.5s' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prochains Événements */}
              <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  📅 Prochains Événements
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {events.filter(e => e.status === 'scheduled').slice(0, 3).map(event => (
                    <div key={event.id} onClick={() => setSelectedItem(event)} style={{ padding: '20px', background: `linear-gradient(135deg, ${event.color}15 0%, ${event.color}05 100%)`, border: `2px solid ${event.color}`, borderRadius: '16px', cursor: 'pointer', transition: 'all 0.3s' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div style={{ padding: '8px 12px', background: event.color, color: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                          {event.type === 'interview' ? '👔 Entretien' : event.type === 'meeting' ? '🤝 Réunion' : '📞 Appel'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>
                          {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1F2937', marginBottom: '8px' }}>{event.title}</h4>
                      <div style={{ fontSize: '13px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🕐</span>
                        <span>{event.time}</span>
                        <span>•</span>
                        <span>{event.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Recruteurs */}
              <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  🏆 Top Recruteurs du Mois
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {team.filter(t => t.active).sort((a, b) => b.stats.placements - a.stats.placements).slice(0, 3).map((recruiter, index) => (
                    <div key={recruiter.id} style={{ padding: '24px', background: `linear-gradient(135deg, ${recruiter.color}10 0%, ${recruiter.color}05 100%)`, borderRadius: '16px', border: `2px solid ${recruiter.color}`, position: 'relative' }}>
                      {index === 0 && <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '28px' }}>🥇</div>}
                      {index === 1 && <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '28px' }}>🥈</div>}
                      {index === 2 && <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '28px' }}>🥉</div>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '60px', height: '60px', background: `linear-gradient(135deg, ${recruiter.color} 0%, ${recruiter.color}99 100%)`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                          {recruiter.avatar}
                        </div>
                        <div>
                          <div style={{ fontSize: '18px', fontWeight: '800', color: '#1F2937' }}>{recruiter.name}</div>
                          <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>{recruiter.role}</div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        <div style={{ padding: '12px', background: 'white', borderRadius: '10px', textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: '900', color: recruiter.color }}>{recruiter.stats.placements}</div>
                          <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Placements</div>
                        </div>
                        <div style={{ padding: '12px', background: 'white', borderRadius: '10px', textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: '900', color: recruiter.color }}>{recruiter.performance.conversionRate}</div>
                          <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Conversion</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MISSIONS */}
          {page === 'missions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '42px', fontWeight: '900', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  💼 Missions
                </h2>
                <button onClick={() => {
                  const newMission = {
                    id: Date.now(),
                    title: 'Nouvelle Mission',
                    client: 'Client',
                    location: 'Lieu',
                    salary: '0k€',
                    status: 'open',
                    skills: ['Compétence'],
                    description: 'Description de la mission',
                    emoji: '💼',
                    color: '#667EEA',
                    links: [],
                    documents: [],
                    notes: '',
                    startDate: new Date().toISOString().split('T')[0],
                    urgency: 'a venir',
                    address: { street: '', city: '', zipCode: '' },
                    workMode: 'hybride',
                    contractType: 'CDI',
                    weeklyHours: '35 heures',
                    contactClient: { name: '', phone: '', email: '' },
                    progress: 0
                  };
                  setMissions([...missions, newMission]);
                  setSelectedItem(newMission);
                  setEditedItem(newMission);
                  setEditMode(true);
                }} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)' }}>
                  ➕ Nouvelle Mission
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                {missions.map(m => {
                  // Récupérer les recruteurs assignés à cette mission
                  const assignedRecruiters = team.filter(t => t.assignedMissions.includes(m.id));
                  
                  return (
                    <div key={m.id} onClick={() => setSelectedItem(m)} style={{ padding: '32px', background: 'white', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.3s', border: '2px solid transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = m.color; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{m.emoji}</div>
                      <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>{m.title}</h3>
                      <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px' }}>{m.client} • {m.location}</p>
                      <p style={{ color: '#4B5563', marginBottom: '16px', lineHeight: '1.6', fontSize: '15px' }}>{m.description}</p>
                      
                      {/* Skills */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {m.skills.map((s, i) => (
                          <span key={i} style={{ padding: '6px 14px', background: 'linear-gradient(135deg, #fef5ff 0%, #f3e7ff 100%)', color: '#667EEA', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Recruteurs assignés */}
                      {assignedRecruiters.length > 0 && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #F3F4F6' }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', marginBottom: '10px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>👨‍💼</span>
                            Recruteur{assignedRecruiters.length > 1 ? 's' : ''} en charge
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {assignedRecruiters.map(recruiter => (
                              <div key={recruiter.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: `linear-gradient(135deg, ${recruiter.color}15 0%, ${recruiter.color}30 100%)`, border: `2px solid ${recruiter.color}`, borderRadius: '10px' }}>
                                <div style={{ width: '28px', height: '28px', background: `linear-gradient(135deg, ${recruiter.color} 0%, ${recruiter.color}99 100%)`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                                  {recruiter.avatar}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937' }}>
                                  {recruiter.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Message si aucun recruteur */}
                      {assignedRecruiters.length === 0 && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #F3F4F6' }}>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', padding: '8px' }}>
                            ⚠️ Aucun recruteur assigné
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CANDIDATS */}
          {page === 'candidats' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '42px', fontWeight: '900', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  👥 Candidats
                </h2>
                <button onClick={() => {
                  const newCandidate = {
                    id: Date.now(),
                    name: 'Nouveau Candidat',
                    email: 'email@exemple.com',
                    phone: '+33600000000',
                    position: 'Poste',
                    skills: ['Compétence'],
                    status: 'active',
                    location: 'Lieu',
                    experience: 0,
                    avatar: '👤',
                    color: '#4ECDC4',
                    links: [],
                    documents: [],
                    notes: '',
                    department: '75',
                    metier: 'Non défini',
                    sector: 'Non défini',
                    dateAdded: new Date().toISOString().split('T')[0],
                    tags: [],
                    salary: '',
                    availability: '',
                    source: '',
                    lastActivity: new Date().toISOString().split('T')[0],
                    favorite: false
                  };
                  setCandidates([...candidates, newCandidate]);
                  setSelectedItem(newCandidate);
                  setEditedItem(newCandidate);
                  setEditMode(true);
                }} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #FF6B9D 0%, #FEC7D7 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxShadow: '0 6px 20px rgba(255, 107, 157, 0.4)' }}>
                  ➕ Nouveau Candidat
                </button>
              </div>

              <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                {candidates.map((c, idx) => (
                  <div key={c.id} onClick={() => setSelectedItem(c)} style={{ padding: '28px 36px', borderBottom: idx < candidates.length - 1 ? '1px solid #E5E7EB' : 'none', display: 'flex', alignItems: 'center', gap: '24px', cursor: 'pointer', transition: 'all 0.3s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                    <div style={{ width: '64px', height: '64px', background: `linear-gradient(135deg, ${c.color} 0%, ${c.color}99 100%)`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', flexShrink: 0 }}>
                      {c.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px' }}>{c.name}</div>
                      <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '10px' }}>{c.position} • {c.location} • {c.experience} ans</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {c.skills.slice(0, 3).map((s, i) => (
                          <span key={i} style={{ padding: '5px 12px', background: 'linear-gradient(135deg, #fef5ff 0%, #f3e7ff 100%)', color: '#667EEA', borderRadius: '8px', fontSize: '12px', fontWeight: '600' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>
                      ⚡ Actif
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CVTHÈQUE */}
          {page === 'cvtheque' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                  <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '12px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    📚 CVthèque
                  </h2>
                  <p style={{ fontSize: '18px', color: '#6B7280' }}>Base de données de tous les candidats</p>
                </div>
                <div style={{ fontSize: '48px', fontWeight: '900', color: '#667EEA' }}>
                  {candidates.length}
                </div>
              </div>

              {/* Barre de recherche et filtres */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', marginBottom: '32px' }}>
                {/* Recherche */}
                <div style={{ marginBottom: '20px' }}>
                  <input 
                    type="text" 
                    placeholder="🔍 Rechercher par nom, compétence, poste..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '16px 20px', border: '2px solid #E5E7EB', borderRadius: '12px', fontSize: '16px', fontWeight: '500' }}
                  />
                </div>

                {/* Filtres avancés */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: '#1F2937', textTransform: 'uppercase' }}>🔍 Filtres de recherche</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {/* Filtre Métier */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '6px', color: '#6B7280' }}>💼 Métier</label>
                      <select 
                        value={selectedMetier} 
                        onChange={(e) => setSelectedMetier(e.target.value)}
                        style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'white' }}>
                        <option value="all">Tous les métiers</option>
                        {Array.from(new Set(candidates.map(c => c.metier))).sort().map(metier => (
                          <option key={metier} value={metier}>{metier}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filtre Secteur */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '6px', color: '#6B7280' }}>🏭 Secteur</label>
                      <select 
                        value={filterSector} 
                        onChange={(e) => setFilterSector(e.target.value)}
                        style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'white' }}>
                        <option value="all">Tous les secteurs</option>
                        {Array.from(new Set(candidates.map(c => c.sector))).sort().map(sector => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filtre Ville */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '6px', color: '#6B7280' }}>📍 Ville</label>
                      <select 
                        value={filterCity} 
                        onChange={(e) => setFilterCity(e.target.value)}
                        style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'white' }}>
                        <option value="all">Toutes les villes</option>
                        {Array.from(new Set(candidates.map(c => c.location))).sort().map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filtre Département */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '6px', color: '#6B7280' }}>🗺️ Département</label>
                      <select 
                        value={selectedDepartment} 
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'white' }}>
                        <option value="all">Tous les départements</option>
                        {Array.from(new Set(candidates.map(c => c.department))).sort().map(dept => (
                          <option key={dept} value={dept}>Dépt {dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Filtres Tags et Favoris */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: '#1F2937', textTransform: 'uppercase' }}>🏷️ Tags & Favoris</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Favoris */}
                    <button 
                      onClick={() => {
                        if (selectedMetier === 'favorites') setSelectedMetier('all');
                        else setSelectedMetier('favorites');
                      }}
                      style={{ padding: '8px 16px', background: selectedMetier === 'favorites' ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : '#F3F4F6', color: selectedMetier === 'favorites' ? 'white' : '#4B5563', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                      ⭐ Favoris uniquement
                    </button>

                    {/* Tags */}
                    {tags.map(tag => (
                      <button 
                        key={tag.id}
                        onClick={() => {
                          if (filterSector === `tag_${tag.id}`) setFilterSector('all');
                          else setFilterSector(`tag_${tag.id}`);
                        }}
                        style={{ 
                          padding: '8px 16px', 
                          background: filterSector === `tag_${tag.id}` ? tag.color : '#F3F4F6', 
                          color: filterSector === `tag_${tag.id}` ? 'white' : '#4B5563', 
                          border: 'none', 
                          borderRadius: '8px', 
                          cursor: 'pointer', 
                          fontWeight: '700', 
                          fontSize: '13px',
                          transition: 'all 0.2s'
                        }}>
                        {filterSector === `tag_${tag.id}` ? '✓ ' : ''}{tag.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtre par date d'ajout */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: '#1F2937', textTransform: 'uppercase' }}>📅 Période d'ajout</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      ['all', 'Tous'],
                      ['today', 'Aujourd\'hui'],
                      ['week', 'Cette semaine'],
                      ['month', 'Ce mois'],
                      ['3months', '3 derniers mois'],
                      ['6months', '6 derniers mois'],
                      ['year', 'Cette année']
                    ].map(([value, label]) => (
                      <button 
                        key={value} 
                        onClick={() => setFilterDateAdded(value)}
                        style={{ padding: '8px 16px', background: filterDateAdded === value ? 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' : '#F3F4F6', color: filterDateAdded === value ? 'white' : '#4B5563', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', transition: 'all 0.3s' }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bouton réinitialiser */}
                {(searchQuery || selectedMetier !== 'all' || filterSector !== 'all' || filterCity !== 'all' || selectedDepartment !== 'all' || filterDateAdded !== 'all') && (
                  <button onClick={() => {
                    setSearchQuery('');
                    setSelectedMetier('all');
                    setFilterSector('all');
                    setFilterCity('all');
                    setSelectedDepartment('all');
                    setFilterDateAdded('all');
                  }} style={{ padding: '10px 20px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                    🔄 Réinitialiser tous les filtres
                  </button>
                )}

                {/* Compteur résultats */}
                <div style={{ marginTop: '16px', padding: '12px', background: '#EFF6FF', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#667EEA' }}>
                    {candidates.filter(c => {
                      // Recherche texte
                      const matchSearch = !searchQuery || 
                        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        c.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        c.location.toLowerCase().includes(searchQuery.toLowerCase());
                      
                      // Filtre métier OU favoris
                      const matchMetier = selectedMetier === 'all' || 
                                         (selectedMetier === 'favorites' ? c.favorite === true : c.metier === selectedMetier);
                      
                      // Filtre secteur OU tag
                      let matchSector = true;
                      if (filterSector !== 'all') {
                        if (filterSector.startsWith('tag_')) {
                          const tagId = parseInt(filterSector.replace('tag_', ''));
                          matchSector = (c.tags || []).includes(tagId);
                        } else {
                          matchSector = c.sector === filterSector;
                        }
                      }
                      
                      // Filtre ville
                      const matchCity = filterCity === 'all' || c.location === filterCity;
                      
                      // Filtre département
                      const matchDept = selectedDepartment === 'all' || c.department === selectedDepartment;
                      
                      // Filtre date
                      let matchDate = true;
                      if (filterDateAdded !== 'all') {
                        const candidateDate = new Date(c.dateAdded);
                        const today = new Date();
                        const diffTime = today - candidateDate;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (filterDateAdded === 'today') matchDate = diffDays === 0;
                        else if (filterDateAdded === 'week') matchDate = diffDays <= 7;
                        else if (filterDateAdded === 'month') matchDate = diffDays <= 30;
                        else if (filterDateAdded === '3months') matchDate = diffDays <= 90;
                        else if (filterDateAdded === '6months') matchDate = diffDays <= 180;
                        else if (filterDateAdded === 'year') matchDate = diffDays <= 365;
                      }
                      
                      return matchSearch && matchMetier && matchSector && matchCity && matchDept && matchDate;
                    }).length} résultat{candidates.filter(c => {
                      const matchSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.position.toLowerCase().includes(searchQuery.toLowerCase()) || c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) || c.location.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchMetier = selectedMetier === 'all' || c.metier === selectedMetier;
                      const matchSector = filterSector === 'all' || c.sector === filterSector;
                      const matchCity = filterCity === 'all' || c.location === filterCity;
                      const matchDept = selectedDepartment === 'all' || c.department === selectedDepartment;
                      let matchDate = true;
                      if (filterDateAdded !== 'all') {
                        const candidateDate = new Date(c.dateAdded);
                        const today = new Date();
                        const diffDays = Math.ceil((today - candidateDate) / (1000 * 60 * 60 * 24));
                        if (filterDateAdded === 'today') matchDate = diffDays === 0;
                        else if (filterDateAdded === 'week') matchDate = diffDays <= 7;
                        else if (filterDateAdded === 'month') matchDate = diffDays <= 30;
                        else if (filterDateAdded === '3months') matchDate = diffDays <= 90;
                        else if (filterDateAdded === '6months') matchDate = diffDays <= 180;
                        else if (filterDateAdded === 'year') matchDate = diffDays <= 365;
                      }
                      return matchSearch && matchMetier && matchSector && matchCity && matchDept && matchDate;
                    }).length > 1 ? 's' : ''} trouvé{candidates.filter(c => {
                      const matchSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.position.toLowerCase().includes(searchQuery.toLowerCase()) || c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) || c.location.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchMetier = selectedMetier === 'all' || c.metier === selectedMetier;
                      const matchSector = filterSector === 'all' || c.sector === filterSector;
                      const matchCity = filterCity === 'all' || c.location === filterCity;
                      const matchDept = selectedDepartment === 'all' || c.department === selectedDepartment;
                      let matchDate = true;
                      if (filterDateAdded !== 'all') {
                        const candidateDate = new Date(c.dateAdded);
                        const today = new Date();
                        const diffDays = Math.ceil((today - candidateDate) / (1000 * 60 * 60 * 24));
                        if (filterDateAdded === 'today') matchDate = diffDays === 0;
                        else if (filterDateAdded === 'week') matchDate = diffDays <= 7;
                        else if (filterDateAdded === 'month') matchDate = diffDays <= 30;
                        else if (filterDateAdded === '3months') matchDate = diffDays <= 90;
                        else if (filterDateAdded === '6months') matchDate = diffDays <= 180;
                        else if (filterDateAdded === 'year') matchDate = diffDays <= 365;
                      }
                      return matchSearch && matchMetier && matchSector && matchCity && matchDept && matchDate;
                    }).length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Sélecteurs de vue */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  {[
                    ['all', '📋 Tous', '#667EEA'],
                    ['department', '📍 Par Département', '#FF6B9D'],
                    ['metier', '💼 Par Métier', '#10B981']
                  ].map(([view, label, color]) => (
                    <button key={view} onClick={() => { setCvthequeFilter(view); }} style={{ flex: 1, padding: '12px 20px', background: cvthequeFilter === view ? `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` : '#F9FAFB', color: cvthequeFilter === view ? 'white' : '#4B5563', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: cvthequeFilter === view ? `0 6px 20px ${color}40` : 'none', transition: 'all 0.3s' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Affichage selon le filtre */}
              {cvthequeFilter === 'all' && (
                <div>
                  {/* Vue liste simple */}
                  <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                    {candidates
                      .filter(c => {
                        // Recherche texte
                        const matchSearch = !searchQuery || 
                          c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          c.location.toLowerCase().includes(searchQuery.toLowerCase());
                        
                        // Filtre métier
                        const matchMetier = selectedMetier === 'all' || c.metier === selectedMetier;
                        
                        // Filtre secteur
                        const matchSector = filterSector === 'all' || c.sector === filterSector;
                        
                        // Filtre ville
                        const matchCity = filterCity === 'all' || c.location === filterCity;
                        
                        // Filtre département
                        const matchDept = selectedDepartment === 'all' || c.department === selectedDepartment;
                        
                        // Filtre date
                        let matchDate = true;
                        if (filterDateAdded !== 'all') {
                          const candidateDate = new Date(c.dateAdded);
                          const today = new Date();
                          const diffTime = today - candidateDate;
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          if (filterDateAdded === 'today') matchDate = diffDays === 0;
                          else if (filterDateAdded === 'week') matchDate = diffDays <= 7;
                          else if (filterDateAdded === 'month') matchDate = diffDays <= 30;
                          else if (filterDateAdded === '3months') matchDate = diffDays <= 90;
                          else if (filterDateAdded === '6months') matchDate = diffDays <= 180;
                          else if (filterDateAdded === 'year') matchDate = diffDays <= 365;
                        }
                        
                        return matchSearch && matchMetier && matchSector && matchCity && matchDept && matchDate;
                      })
                      .map((c, idx, filteredArray) => (
                        <div key={c.id} onClick={() => setSelectedItem(c)} style={{ padding: '24px 32px', borderBottom: idx < filteredArray.length - 1 ? '1px solid #E5E7EB' : 'none', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'all 0.3s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                          <div style={{ width: '56px', height: '56px', background: `linear-gradient(135deg, ${c.color} 0%, ${c.color}99 100%)`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>
                            {c.avatar}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {c.name}
                              {c.favorite && <span style={{ fontSize: '16px' }}>⭐</span>}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                              {c.position} • {c.location} • {c.experience} ans • Dépt {c.department}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                              {c.tags && c.tags.map(tagId => {
                                const tag = tags.find(t => t.id === tagId);
                                return tag ? (
                                  <span key={tagId} style={{ padding: '4px 10px', background: tag.color, color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                                    {tag.name}
                                  </span>
                                ) : null;
                              })}
                              {c.skills.slice(0, 4).map((s, i) => (
                                <span key={i} style={{ padding: '4px 10px', background: 'linear-gradient(135deg, #fef5ff 0%, #f3e7ff 100%)', color: '#667EEA', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                                  {s}
                                </span>
                              ))}
                              {c.skills.length > 4 && <span style={{ padding: '4px 10px', color: '#6B7280', fontSize: '11px', fontWeight: '600' }}>+{c.skills.length - 4}</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
                              {c.salary && <span>💰 {c.salary}</span>}
                              {c.availability && <span>📅 {c.availability}</span>}
                              {c.source && <span>📍 {c.source}</span>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'end' }}>
                            <span style={{ padding: '6px 16px', background: c.status === 'active' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : '#6B7280', color: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                              {c.status === 'active' ? '✓ Actif' : 'Passif'}
                            </span>
                            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                              {c.documents.length} doc{c.documents.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Vue par département */}
              {cvthequeFilter === 'department' && (
                <div>
                  {Array.from(new Set(candidates.map(c => c.department)))
                    .filter(dept => selectedDepartment === 'all' || dept === selectedDepartment)
                    .map(dept => {
                      const deptCandidates = candidates.filter(c => c.department === dept && (!searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.position.toLowerCase().includes(searchQuery.toLowerCase())));
                      return (
                        <div key={dept} style={{ marginBottom: '32px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', padding: '16px 24px', background: 'linear-gradient(135deg, #FF6B9D 0%, #FEC7D7 100%)', borderRadius: '16px' }}>
                            <span style={{ fontSize: '32px' }}>📍</span>
                            <div>
                              <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'white' }}>Département {dept}</h3>
                              <p style={{ fontSize: '14px', color: 'white', opacity: 0.9 }}>{deptCandidates.length} candidat{deptCandidates.length > 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            {deptCandidates.map(c => (
                              <div key={c.id} onClick={() => setSelectedItem(c)} style={{ padding: '20px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.3s' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                  <div style={{ width: '48px', height: '48px', background: `linear-gradient(135deg, ${c.color} 0%, ${c.color}99 100%)`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                    {c.avatar}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '15px', fontWeight: '800' }}>{c.name}</div>
                                    <div style={{ fontSize: '12px', color: '#6B7280' }}>{c.position}</div>
                                  </div>
                                </div>
                                <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '8px' }}>{c.location} • {c.experience} ans</div>
                                <div style={{ padding: '6px 10px', background: '#FEF3C7', color: '#F59E0B', borderRadius: '6px', fontSize: '11px', fontWeight: '700', display: 'inline-block' }}>
                                  {c.metier}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Vue par métier */}
              {cvthequeFilter === 'metier' && (
                <div>
                  {/* Groupement par secteur d'activité */}
                  {Array.from(new Set(candidates.map(c => c.sector || 'Non défini')))
                    .filter(sector => {
                      // Si aucun secteur sélectionné, on affiche tous
                      // Sinon on filtre par secteur sélectionné
                      return selectedMetier === 'all' || candidates.some(c => c.sector === sector && (selectedMetier === 'all' || c.metier === selectedMetier));
                    })
                    .map(sector => {
                      // Définir icônes et couleurs par secteur
                      const sectorConfig = {
                        'Tech & IT': { icon: '💻', color: '#667EEA' },
                        'IA & Machine Learning': { icon: '🤖', color: '#8B5CF6' },
                        'Cybersécurité': { icon: '🔒', color: '#EF4444' },
                        'Cloud & Infrastructure': { icon: '☁️', color: '#06B6D4' },
                        'Télécommunications': { icon: '📡', color: '#3B82F6' },
                        'EdTech': { icon: '📚', color: '#10B981' },
                        'Gaming': { icon: '🎮', color: '#A855F7' },
                        'Banque': { icon: '🏦', color: '#059669' },
                        'Assurance': { icon: '🛡️', color: '#0891B2' },
                        'FinTech': { icon: '💳', color: '#10B981' },
                        'Investissement': { icon: '📈', color: '#F59E0B' },
                        'Comptabilité': { icon: '🧮', color: '#6366F1' },
                        'Crypto & Blockchain': { icon: '₿', color: '#F97316' },
                        'Santé': { icon: '🏥', color: '#EF4444' },
                        'Pharmaceutique': { icon: '💊', color: '#EC4899' },
                        'Biotechnologie': { icon: '🧬', color: '#8B5CF6' },
                        'MedTech': { icon: '⚕️', color: '#DC2626' },
                        'Dispositifs médicaux': { icon: '🩺', color: '#DB2777' },
                        'Bien-être': { icon: '🧘', color: '#14B8A6' },
                        'Automobile': { icon: '🚗', color: '#6366F1' },
                        'Aéronautique': { icon: '✈️', color: '#3B82F6' },
                        'Agroalimentaire': { icon: '🌾', color: '#84CC16' },
                        'Chimie': { icon: '⚗️', color: '#8B5CF6' },
                        'Énergie': { icon: '⚡', color: '#F59E0B' },
                        'Énergies renouvelables': { icon: '♻️', color: '#10B981' },
                        'BTP & Construction': { icon: '🏗️', color: '#F97316' },
                        'Logistique': { icon: '📦', color: '#0891B2' },
                        'Transport': { icon: '🚛', color: '#6366F1' },
                        'E-commerce': { icon: '🛒', color: '#F59E0B' },
                        'Retail': { icon: '🏪', color: '#EC4899' },
                        'Grande distribution': { icon: '🏬', color: '#EF4444' },
                        'Luxe': { icon: '💎', color: '#A855F7' },
                        'Mode': { icon: '👗', color: '#EC4899' },
                        'Cosmétique': { icon: '💄', color: '#F472B6' },
                        'Création & Design': { icon: '🎨', color: '#EC4899' },
                        'Marketing & Communication': { icon: '📢', color: '#F59E0B' },
                        'Publicité': { icon: '📺', color: '#EF4444' },
                        'Médias': { icon: '📰', color: '#6366F1' },
                        'Audiovisuel': { icon: '🎬', color: '#8B5CF6' },
                        'Édition': { icon: '📖', color: '#0891B2' },
                        'Événementiel': { icon: '🎉', color: '#F59E0B' },
                        'Conseil': { icon: '💼', color: '#6366F1' },
                        'Audit': { icon: '📊', color: '#3B82F6' },
                        'RH & Recrutement': { icon: '👥', color: '#10B981' },
                        'Juridique': { icon: '⚖️', color: '#64748B' },
                        'Formation': { icon: '🎓', color: '#8B5CF6' },
                        'Immobilier': { icon: '🏠', color: '#F97316' },
                        'Hôtellerie': { icon: '🏨', color: '#06B6D4' },
                        'Restauration': { icon: '🍽️', color: '#EF4444' },
                        'Tourisme': { icon: '✈️', color: '#3B82F6' },
                        'Éducation': { icon: '📚', color: '#8B5CF6' },
                        'Recherche': { icon: '🔬', color: '#6366F1' },
                        'Université': { icon: '🎓', color: '#3B82F6' },
                        'Formation professionnelle': { icon: '📖', color: '#10B981' },
                        'Environnement': { icon: '🌍', color: '#10B981' },
                        'Développement durable': { icon: '♻️', color: '#059669' },
                        'ONG': { icon: '🤝', color: '#0891B2' },
                        'Économie sociale': { icon: '💚', color: '#14B8A6' },
                        'Agriculture': { icon: '🌱', color: '#84CC16' },
                        'Sport': { icon: '⚽', color: '#F97316' },
                        'Culture': { icon: '🎭', color: '#A855F7' },
                        'Spectacle': { icon: '🎪', color: '#EC4899' },
                        'Musique': { icon: '🎵', color: '#8B5CF6' },
                        'Administration publique': { icon: '🏛️', color: '#64748B' },
                        'Défense': { icon: '🛡️', color: '#475569' },
                        'Collectivités territoriales': { icon: '🏛️', color: '#6366F1' },
                        'Non défini': { icon: '❓', color: '#9CA3AF' }
                      };
                      
                      const config = sectorConfig[sector] || { icon: '💼', color: '#10B981' };
                      
                      // Grouper les candidats de ce secteur par métier
                      const metiersInSector = Array.from(new Set(
                        candidates.filter(c => c.sector === sector).map(c => c.metier)
                      )).filter(metier => selectedMetier === 'all' || metier === selectedMetier);
                      
                      if (metiersInSector.length === 0) return null;
                      
                      return (
                        <div key={sector} style={{ marginBottom: '40px' }}>
                          {/* En-tête secteur */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '20px 28px', background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%)`, borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                            <span style={{ fontSize: '40px' }}>{config.icon}</span>
                            <div>
                              <h3 style={{ fontSize: '28px', fontWeight: '900', color: 'white', marginBottom: '4px' }}>{sector}</h3>
                              <p style={{ fontSize: '14px', color: 'white', opacity: 0.9 }}>
                                {candidates.filter(c => c.sector === sector && (selectedMetier === 'all' || c.metier === selectedMetier)).length} candidat
                                {candidates.filter(c => c.sector === sector).length > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>

                          {/* Sous-groupes par métier */}
                          {metiersInSector.map(metier => {
                            const metierCandidates = candidates.filter(c => c.sector === sector && c.metier === metier && (!searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.position.toLowerCase().includes(searchQuery.toLowerCase())));
                            const metierIcons = { 
                              'Développement': '💻', 
                              'Product Management': '🎯', 
                              'Data Science': '📊', 
                              'Design': '🎨', 
                              'DevOps': '⚙️', 
                              'Marketing': '📢',
                              'Commercial': '💼',
                              'RH': '👥',
                              'Finance': '💰',
                              'Juridique': '⚖️',
                              'Communication': '📣',
                              'Support Client': '🎧',
                              'Non défini': '❓'
                            };
                            
                            if (metierCandidates.length === 0) return null;
                            
                            return (
                              <div key={metier} style={{ marginBottom: '24px', marginLeft: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', padding: '12px 20px', background: '#F9FAFB', borderRadius: '12px', borderLeft: `4px solid ${config.color}` }}>
                                  <span style={{ fontSize: '24px' }}>{metierIcons[metier] || '💼'}</span>
                                  <div>
                                    <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#1F2937' }}>{metier}</h4>
                                    <p style={{ fontSize: '12px', color: '#6B7280' }}>{metierCandidates.length} profil{metierCandidates.length > 1 ? 's' : ''}</p>
                                  </div>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                  {metierCandidates.map(c => (
                                    <div key={c.id} onClick={() => setSelectedItem(c)} style={{ padding: '20px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.3s', border: '2px solid transparent' }}
                                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = config.color; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{ width: '48px', height: '48px', background: `linear-gradient(135deg, ${c.color} 0%, ${c.color}99 100%)`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                          {c.avatar}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                          <div style={{ fontSize: '15px', fontWeight: '800' }}>{c.name}</div>
                                          <div style={{ fontSize: '12px', color: '#6B7280' }}>{c.position}</div>
                                        </div>
                                      </div>
                                      <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '8px' }}>{c.location} • Dépt {c.department} • {c.experience} ans</div>
                                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {c.skills.slice(0, 3).map((s, i) => (
                                          <span key={i} style={{ padding: '3px 8px', background: '#F3F4F6', color: '#4B5563', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }}>
                                            {s}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* KANBAN */}
          {page === 'applications' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '12px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    📄 Pipeline Candidatures
                  </h2>
                  <p style={{ color: '#6B7280', fontSize: '16px' }}>Glissez-déposez pour changer le statut</p>
                </div>
                <button onClick={() => {
                  const newApplication = {
                    id: Date.now(),
                    candidateName: 'Nouveau Candidat',
                    candidateAvatar: '👤',
                    missionTitle: 'Mission',
                    status: 'received',
                    score: Math.floor(Math.random() * 40) + 60,
                    links: [],
                    documents: [],
                    notes: ''
                  };
                  setApplications([...applications, newApplication]);
                  setSelectedItem(newApplication);
                  setEditedItem(newApplication);
                  setEditMode(true);
                }} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxShadow: '0 6px 20px rgba(78, 205, 196, 0.4)' }}>
                  ➕ Nouvelle Candidature
                </button>
              </div>

              <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
                {[
                  ['received', '📨 Reçues', 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)'],
                  ['screening', '🎯 Présélection', 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)'],
                  ['interview_1', '🎤 Entretien', 'linear-gradient(135deg, #E9D5FF 0%, #D8B4FE 100%)'],
                  ['hired', '🎉 Embauché', 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)']
                ].map(([id, label, bg]) => {
                  const stageApps = applications.filter(a => a.status === id);
                  return (
                    <div key={id} style={{ minWidth: '320px', flexShrink: 0 }} onDragOver={(e) => e.preventDefault()} onDrop={() => { 
                      if (draggedApp) { 
                        setApplications(applications.map(a => a.id === draggedApp.id ? {...a, status: id} : a)); 
                        setDraggedApp(null); 
                      }
                    }}>
                      <div style={{ background: bg, padding: '18px', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1F2937' }}>{label}</h3>
                          <span style={{ background: 'white', padding: '6px 14px', borderRadius: '12px', fontSize: '14px', fontWeight: '800' }}>{stageApps.length}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '400px' }}>
                        {stageApps.map(app => (
                          <div key={app.id} draggable onDragStart={() => setDraggedApp(app)} onClick={() => setSelectedItem(app)} style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', cursor: 'move', border: '2px solid transparent', transition: 'all 0.3s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#667EEA'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.3)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                <div style={{ fontSize: '32px' }}>{app.candidateAvatar}</div>
                                <div>
                                  <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>{app.candidateName}</div>
                                  <div style={{ fontSize: '13px', color: '#6B7280' }}>{app.missionTitle}</div>
                                </div>
                              </div>
                              <span style={{ padding: '6px 12px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', borderRadius: '12px', fontSize: '13px', fontWeight: '800' }}>
                                {app.score}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AGENDA */}
          {page === 'agenda' && (
            <div>
              <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '12px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                📅 Agenda & Historique
              </h2>
              <p style={{ fontSize: '18px', color: '#6B7280', marginBottom: '40px' }}>Gérez vos rendez-vous et suivez l'historique des actions</p>

              {/* Bouton Ajouter événement */}
              <button onClick={() => {
                const newEvent = {
                  id: Date.now(),
                  title: 'Nouveau rendez-vous',
                  date: new Date().toISOString().split('T')[0],
                  time: '09:00',
                  type: 'meeting',
                  relatedTo: { type: '', id: null, name: '' },
                  location: '',
                  description: '',
                  status: 'scheduled',
                  color: '#667EEA',
                  links: [],
                  documents: [],
                  notes: ''
                };
                setEvents([...events, newEvent]);
                setSelectedItem(newEvent);
                setEditedItem(newEvent);
                setEditMode(true);
              }} style={{ marginBottom: '32px', padding: '14px 28px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)' }}>
                ➕ Ajouter un rendez-vous
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* CALENDRIER DES ÉVÉNEMENTS */}
                <div>
                  <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#1F2937' }}>📆 Prochains rendez-vous</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {events.filter(e => e.status === 'scheduled').sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time)).map(event => (
                        <div key={event.id} onClick={() => setSelectedItem(event)} style={{ padding: '20px', background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderRadius: '16px', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.3s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = event.color; e.currentTarget.style.transform = 'translateX(4px)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                          <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
                            <div style={{ minWidth: '80px', padding: '12px', background: event.color, borderRadius: '12px', textAlign: 'center', color: 'white' }}>
                              <div style={{ fontSize: '24px', fontWeight: '900' }}>{new Date(event.date).getDate()}</div>
                              <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                                {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
                              </div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#1F2937' }}>{event.title}</h4>
                                <span style={{ padding: '4px 12px', background: event.color, color: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                                  {event.time}
                                </span>
                              </div>
                              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>{event.description}</p>
                              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6B7280' }}>
                                <span>📍 {event.location}</span>
                                {event.relatedTo?.name && <span>🔗 {event.relatedTo.name}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {events.filter(e => e.status === 'scheduled').length === 0 && (
                        <p style={{ textAlign: 'center', color: '#6B7280', padding: '40px', fontStyle: 'italic' }}>Aucun rendez-vous planifié</p>
                      )}
                    </div>
                  </div>

                  {/* ÉVÉNEMENTS PASSÉS */}
                  <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#1F2937' }}>✓ Rendez-vous passés</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {events.filter(e => e.status === 'completed').sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)).map(event => (
                        <div key={event.id} onClick={() => setSelectedItem(event)} style={{ padding: '16px', background: '#F9FAFB', borderRadius: '12px', cursor: 'pointer', opacity: 0.8, transition: 'all 0.3s' }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>{event.title}</h4>
                              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                                {new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}
                              </p>
                            </div>
                            <span style={{ fontSize: '24px' }}>✓</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* HISTORIQUE DES ACTIONS */}
                <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', height: 'fit-content' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#1F2937' }}>📋 Historique</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '600px', overflowY: 'auto' }}>
                    {history.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)).map(item => (
                      <div key={item.id} style={{ padding: '16px', background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)', borderRadius: '12px', borderLeft: '4px solid #667EEA' }}>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <div style={{ fontSize: '24px', flexShrink: 0 }}>{item.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: '800', color: '#1F2937', marginBottom: '4px' }}>{item.action}</div>
                            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>{item.details}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#9CA3AF' }}>
                              <span>{new Date(item.date).toLocaleDateString('fr-FR')} {item.time}</span>
                              <span>👤 {item.user}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button onClick={() => {
                    const newHistoryItem = {
                      id: Date.now(),
                      date: new Date().toISOString().split('T')[0],
                      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
                      action: 'Nouvelle action',
                      relatedTo: { type: '', id: null, name: '' },
                      user: 'Admin',
                      details: 'Action personnalisée ajoutée',
                      icon: '📝'
                    };
                    setHistory([...history, newHistoryItem]);
                  }} style={{ width: '100%', marginTop: '20px', padding: '12px', background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)' }}>
                    ➕ Ajouter une Action
                  </button>
                </div>
              </div>

              {/* CALENDRIER COMPLET */}
              <div style={{ marginTop: '40px', background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '32px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  📅 Vue Calendrier Globale
                </h3>

                {/* Sélecteur de vue */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', justifyContent: 'center' }}>
                  {[['day', '📆 Vue Journalière'], ['week', '📅 Vue Hebdomadaire'], ['month', '🗓️ Vue Mensuelle']].map(([view, label]) => (
                    <button key={view} onClick={() => setCalendarView(view)} style={{ padding: '12px 28px', background: calendarView === view ? 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' : '#F3F4F6', color: calendarView === view ? 'white' : '#4B5563', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxShadow: calendarView === view ? '0 6px 20px rgba(102, 126, 234, 0.4)' : 'none', transition: 'all 0.3s' }}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Navigation de date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', padding: '20px', background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderRadius: '16px' }}>
                  <button onClick={() => {
                    const newDate = new Date(currentDate);
                    if (calendarView === 'day') newDate.setDate(newDate.getDate() - 1);
                    else if (calendarView === 'week') newDate.setDate(newDate.getDate() - 7);
                    else newDate.setMonth(newDate.getMonth() - 1);
                    setCurrentDate(newDate);
                  }} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)' }}>
                    ← Précédent
                  </button>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#1F2937', textAlign: 'center' }}>
                    {calendarView === 'day' && currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    {calendarView === 'week' && `Semaine ${Math.ceil(currentDate.getDate() / 7)} - ${currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`}
                    {calendarView === 'month' && currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </div>
                  <button onClick={() => {
                    const newDate = new Date(currentDate);
                    if (calendarView === 'day') newDate.setDate(newDate.getDate() + 1);
                    else if (calendarView === 'week') newDate.setDate(newDate.getDate() + 7);
                    else newDate.setMonth(newDate.getMonth() + 1);
                    setCurrentDate(newDate);
                  }} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)' }}>
                    Suivant →
                  </button>
                </div>

                {/* VUE JOURNALIÈRE */}
                {calendarView === 'day' && (
                  <div style={{ border: '2px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      {Array.from({ length: 24 }, (_, hour) => {
                        const dayEvents = events.filter(e => {
                          const eventDate = new Date(e.date);
                          return eventDate.toDateString() === currentDate.toDateString() && parseInt(e.time.split(':')[0]) === hour;
                        });
                        return (
                          <div key={hour} style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', minHeight: '70px', background: hour % 2 === 0 ? 'white' : '#F9FAFB' }}>
                            <div style={{ width: '100px', padding: '16px', fontSize: '16px', fontWeight: '700', color: '#667EEA', borderRight: '3px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
                              {hour.toString().padStart(2, '0')}:00
                            </div>
                            <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {dayEvents.length === 0 ? (
                                <div style={{ color: '#9CA3AF', fontSize: '13px', fontStyle: 'italic' }}>Aucun événement</div>
                              ) : (
                                dayEvents.map(event => (
                                  <div key={event.id} onClick={() => setSelectedItem(event)} style={{ padding: '12px 16px', background: event.color, color: 'white', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'all 0.3s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(8px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                                    <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>{event.time} - {event.title}</div>
                                    <div style={{ fontSize: '12px', opacity: 0.9 }}>📍 {event.location}</div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* VUE HEBDOMADAIRE */}
                {calendarView === 'week' && (
                  <div style={{ overflowX: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px', minWidth: '900px' }}>
                      {Array.from({ length: 7 }, (_, i) => {
                        const day = new Date(currentDate);
                        day.setDate(currentDate.getDate() - currentDate.getDay() + i);
                        const dayEvents = events.filter(e => new Date(e.date).toDateString() === day.toDateString());
                        const isToday = day.toDateString() === new Date().toDateString();
                        return (
                          <div key={i} style={{ border: isToday ? '3px solid #667EEA' : '2px solid #E5E7EB', borderRadius: '16px', padding: '16px', background: isToday ? '#EFF6FF' : 'white', minHeight: '400px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', textAlign: 'center', color: '#667EEA', textTransform: 'uppercase' }}>
                              {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: '900', marginBottom: '16px', textAlign: 'center', color: isToday ? '#667EEA' : '#1F2937' }}>
                              {day.getDate()}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {dayEvents.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '12px', fontStyle: 'italic', marginTop: '20px' }}>Aucun RDV</div>
                              ) : (
                                dayEvents.map(event => (
                                  <div key={event.id} onClick={() => setSelectedItem(event)} style={{ padding: '10px 12px', background: event.color, color: 'white', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.3s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                    <div style={{ fontSize: '13px', fontWeight: '800', marginBottom: '4px' }}>{event.time}</div>
                                    <div style={{ fontSize: '11px' }}>{event.title}</div>
                                    <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.8 }}>📍 {event.location}</div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* VUE MENSUELLE */}
                {calendarView === 'month' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '12px' }}>
                      {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => (
                        <div key={day} style={{ padding: '12px', fontSize: '14px', fontWeight: '800', textAlign: 'center', color: '#667EEA', background: '#F9FAFB', borderRadius: '10px' }}>{day}</div>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                      {Array.from({ length: 42 }, (_, i) => {
                        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                        const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
                        const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - startDay + 1);
                        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                        const isToday = day.toDateString() === new Date().toDateString();
                        const dayEvents = events.filter(e => new Date(e.date).toDateString() === day.toDateString());
                        
                        return (
                          <div key={i} style={{ minHeight: '100px', border: isToday ? '3px solid #667EEA' : '2px solid #E5E7EB', borderRadius: '12px', padding: '8px', background: isToday ? '#EFF6FF' : isCurrentMonth ? 'white' : '#F9FAFB', opacity: isCurrentMonth ? 1 : 0.5 }}>
                            <div style={{ fontSize: '16px', fontWeight: isToday ? '900' : '700', color: isToday ? '#667EEA' : '#4B5563', marginBottom: '8px', textAlign: 'center' }}>
                              {day.getDate()}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {dayEvents.map(event => (
                                <div key={event.id} onClick={() => setSelectedItem(event)} style={{ padding: '4px 6px', background: event.color, color: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                  title={`${event.time} - ${event.title}`}>
                                  {event.time} {event.title}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Info bulle */}
                <div style={{ marginTop: '24px', padding: '16px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>💡</span>
                  <div style={{ fontSize: '14px', color: '#1F2937' }}>
                    <strong>Astuce :</strong> Cliquez sur un événement dans le calendrier pour voir tous ses détails et le modifier.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ÉQUIPE */}
          {page === 'equipe' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '42px', fontWeight: '900', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  👨‍👩‍👧‍👦 Équipe de Recrutement
                </h2>
                <button onClick={() => {
                  const newMember = {
                    id: Date.now(),
                    name: 'Nouveau Recruteur',
                    role: 'Recruteur',
                    email: 'nouveau@ats.com',
                    phone: '+33600000000',
                    avatar: '👤',
                    color: '#667EEA',
                    assignedClients: [],
                    assignedMissions: [],
                    active: true,
                    hireDate: new Date().toISOString().split('T')[0],
                    stats: { missions: 0, placements: 0, revenue: '0€' },
                    activity: { lastLogin: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0].substring(0, 5), candidatesContacted: 0, interviewsScheduled: 0, avgResponseTime: '0h', weeklyHours: 0 },
                    performance: { monthlyGoal: 1, monthlyAchieved: 0, conversionRate: '0%', satisfaction: 0 },
                    links: [],
                    documents: [],
                    notes: ''
                  };
                  setTeam([...team, newMember]);
                  setSelectedItem(newMember);
                  setEditedItem(newMember);
                  setEditMode(true);
                }} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)' }}>
                  ➕ Ajouter un Membre
                </button>
              </div>

              {/* Stats d'équipe */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                {[
                  ['👥', 'Membres actifs', team.filter(t => t.active).length, '#667EEA'],
                  ['💼', 'Missions gérées', team.reduce((acc, t) => acc + t.stats.missions, 0), '#FF6B9D'],
                  ['🎯', 'Placements réussis', team.reduce((acc, t) => acc + t.stats.placements, 0), '#10B981'],
                  ['💰', 'CA généré', team.reduce((acc, t) => acc + parseInt(t.stats.revenue.replace(/[k€]/g, '')), 0) + 'k€', '#F59E0B']
                ].map(([icon, label, value, color], i) => (
                  <div key={i} style={{ padding: '24px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Liste des membres */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                {team.map(member => (
                  <div key={member.id} onClick={() => setSelectedItem(member)} style={{ padding: '32px', background: 'white', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.3s', border: '2px solid transparent', opacity: member.active ? 1 : 0.6 }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = member.color; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; }}>
                    
                    <div style={{ display: 'flex', alignItems: 'start', gap: '20px', marginBottom: '24px' }}>
                      <div style={{ width: '80px', height: '80px', background: `linear-gradient(135deg, ${member.color} 0%, ${member.color}99 100%)`, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', flexShrink: 0 }}>
                        {member.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {member.name}
                          {!member.active && <span style={{ padding: '4px 10px', background: '#EF4444', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>Inactif</span>}
                        </h3>
                        <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '8px' }}>{member.role}</p>
                        <p style={{ color: '#9CA3AF', fontSize: '13px' }}>📧 {member.email}</p>
                        <p style={{ color: '#9CA3AF', fontSize: '13px' }}>📱 {member.phone}</p>
                      </div>
                    </div>

                    {/* Stats individuelles */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px', padding: '16px', background: '#F9FAFB', borderRadius: '12px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: member.color }}>{member.stats.missions}</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>Missions</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: member.color }}>{member.stats.placements}</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>Placements</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: member.color }}>{member.stats.revenue}</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>Revenue</div>
                      </div>
                    </div>

                    {/* Attributions */}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', marginBottom: '12px' }}>📋 Attributions</div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                        <div style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', borderRadius: '8px' }}>
                          <div style={{ fontWeight: '700', color: '#667EEA', marginBottom: '4px' }}>Clients</div>
                          <div style={{ color: '#6B7280' }}>
                            {member.assignedClients.length > 0 ? member.assignedClients.map(id => clients.find(c => c.id === id)?.name).join(', ') : 'Aucun'}
                          </div>
                        </div>
                        <div style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', borderRadius: '8px' }}>
                          <div style={{ fontWeight: '700', color: '#10B981', marginBottom: '4px' }}>Missions</div>
                          <div style={{ color: '#6B7280' }}>
                            {member.assignedMissions.length > 0 ? member.assignedMissions.map(id => missions.find(m => m.id === id)?.title.substring(0, 20)).join(', ') : 'Aucune'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADMINISTRATION */}
          {page === 'admin' && (
            <div>
              <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '12px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ⚙️ Administration
              </h2>
              <p style={{ fontSize: '18px', color: '#6B7280', marginBottom: '40px' }}>Gérez les paramètres de votre plateforme</p>

              {/* Informations Entreprise */}
              <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '32px' }}>🏢</span>
                  Informations Entreprise
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  {[
                    ['Nom de l\'entreprise', settings.companyName, 'companyName'],
                    ['Email', settings.companyEmail, 'companyEmail'],
                    ['Téléphone', settings.companyPhone, 'companyPhone'],
                    ['Adresse', settings.companyAddress, 'companyAddress']
                  ].map(([label, value, key]) => (
                    <div key={key} style={{ padding: '16px', background: '#F9FAFB', borderRadius: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase' }}>{label}</label>
                      <input type="text" value={value} onChange={(e) => setSettings({...settings, [key]: e.target.value})} style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Paramètres Généraux */}
              <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '32px' }}>🌍</span>
                  Paramètres Généraux
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {[
                    ['Langue', settings.language, 'language', ['Français', 'English', 'Español']],
                    ['Devise', settings.currency, 'currency', ['EUR (€)', 'USD ($)', 'GBP (£)']],
                    ['Fuseau horaire', settings.timezone, 'timezone', ['Europe/Paris', 'America/New_York', 'Asia/Tokyo']]
                  ].map(([label, value, key, options]) => (
                    <div key={key} style={{ padding: '16px', background: '#F9FAFB', borderRadius: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase' }}>{label}</label>
                      <select value={value} onChange={(e) => setSettings({...settings, [key]: e.target.value})} style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '32px' }}>🔔</span>
                  Notifications
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {[
                    ['Email', 'email', '📧'],
                    ['SMS', 'sms', '📱'],
                    ['Push', 'push', '🔔']
                  ].map(([label, key, icon]) => (
                    <div key={key} style={{ padding: '20px', background: settings.notifications[key] ? 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)' : '#F9FAFB', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                      onClick={() => setSettings({...settings, notifications: {...settings.notifications, [key]: !settings.notifications[key]}})}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px' }}>{icon}</span>
                        <span style={{ fontSize: '16px', fontWeight: '700' }}>{label}</span>
                      </div>
                      <div style={{ width: '50px', height: '28px', background: settings.notifications[key] ? '#10B981' : '#E5E7EB', borderRadius: '14px', position: 'relative', transition: 'all 0.3s' }}>
                        <div style={{ width: '24px', height: '24px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: settings.notifications[key] ? '24px' : '2px', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Intégrations */}
              <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '32px' }}>🔌</span>
                  Intégrations
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {settings.integrations.map((integration, i) => (
                    <div key={i} style={{ padding: '24px', background: integration.status === 'active' ? 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' : '#F9FAFB', borderRadius: '12px', border: '2px solid', borderColor: integration.status === 'active' ? '#667EEA' : '#E5E7EB' }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>{integration.icon}</div>
                      <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>{integration.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: integration.status === 'active' ? '#10B981' : '#EF4444' }}></div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: integration.status === 'active' ? '#10B981' : '#EF4444' }}>
                          {integration.status === 'active' ? 'Connecté' : 'Déconnecté'}
                        </span>
                      </div>
                      <button onClick={() => {
                        const newIntegrations = [...settings.integrations];
                        newIntegrations[i].status = newIntegrations[i].status === 'active' ? 'inactive' : 'active';
                        setSettings({...settings, integrations: newIntegrations});
                      }} style={{ width: '100%', padding: '10px', background: integration.status === 'active' ? '#EF4444' : '#667EEA', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                        {integration.status === 'active' ? 'Déconnecter' : 'Connecter'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sécurité & Confidentialité */}
              <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '32px' }}>🔒</span>
                  Sécurité & Confidentialité
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  <div style={{ padding: '20px', background: '#F9FAFB', borderRadius: '12px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Rétention des données</label>
                    <select value={settings.privacy.dataRetention} onChange={(e) => setSettings({...settings, privacy: {...settings.privacy, dataRetention: e.target.value}})} style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }}>
                      {['12 mois', '24 mois', '36 mois', 'Illimité'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div style={{ padding: '20px', background: settings.privacy.encryption ? 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)' : '#F9FAFB', borderRadius: '12px', cursor: 'pointer' }}
                    onClick={() => setSettings({...settings, privacy: {...settings.privacy, encryption: !settings.privacy.encryption}})}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Chiffrement des données</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '32px' }}>{settings.privacy.encryption ? '🔐' : '🔓'}</div>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: settings.privacy.encryption ? '#10B981' : '#EF4444' }}>
                        {settings.privacy.encryption ? 'Activé' : 'Désactivé'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bouton de sauvegarde */}
              <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button onClick={() => alert('Paramètres sauvegardés !')} style={{ padding: '16px 48px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '16px', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}>
                  💾 Sauvegarder les Modifications
                </button>
                <button onClick={() => alert('Paramètres réinitialisés')} style={{ padding: '16px 48px', background: '#6B7280', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '16px' }}>
                  🔄 Réinitialiser
                </button>
              </div>
            </div>
          )}

          {/* CLIENTS */}
          {page === 'clients' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '42px', fontWeight: '900', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  🏢 Clients
                </h2>
                <button onClick={() => {
                  const newClient = {
                    id: Date.now(),
                    name: 'Nouveau Client',
                    industry: 'Industrie',
                    email: 'contact@client.com',
                    status: 'active',
                    missions: 0,
                    emoji: '🏢',
                    color: '#F59E0B',
                    links: [],
                    documents: [],
                    notes: ''
                  };
                  setClients([...clients, newClient]);
                  setSelectedItem(newClient);
                  setEditedItem(newClient);
                  setEditMode(true);
                }} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)' }}>
                  ➕ Nouveau Client
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                {clients.map(c => (
                  <div key={c.id} onClick={() => setSelectedItem(c)} style={{ padding: '36px', background: 'white', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.3s', border: '2px solid transparent' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = c.color; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>{c.emoji}</div>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>{c.name}</h3>
                    <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px' }}>{c.industry}</p>
                    <div style={{ padding: '16px', background: 'linear-gradient(135deg, #fef5ff 0%, #f3e7ff 100%)', borderRadius: '12px' }}>
                      <p style={{ color: '#6B7280', fontSize: '14px' }}>📧 {c.email}</p>
                      <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '8px' }}>💼 {c.missions} missions actives</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MODAL ÉDITABLE */}
        {selectedItem && (
          <div onClick={() => { setSelectedItem(null); setEditMode(false); setEditedItem(null); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)', padding: '20px' }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px', maxWidth: '900px', width: '100%', padding: '40px', maxHeight: '90vh', overflowY: 'auto' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '32px', fontWeight: '900', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {selectedItem.name || selectedItem.title}
                </h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => { 
                    setEditMode(!editMode); 
                    if (!editMode) setEditedItem({...selectedItem}); 
                  }} style={{ padding: '10px 20px', background: editMode ? '#F59E0B' : '#667EEA', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                    {editMode ? '📝 Mode édition' : '✏️ Modifier'}
                  </button>
                  <button onClick={() => { setSelectedItem(null); setEditMode(false); }} style={{ padding: '10px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '18px', width: '40px' }}>✕</button>
                </div>
              </div>

              {/* Informations principales */}
              <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#1F2937' }}>📋 Informations</h4>
                {editMode ? (
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {Object.keys(selectedItem).filter(key => !['id', 'links', 'documents', 'notes', 'avatar', 'emoji', 'color', 'candidateAvatar', 'department', 'metier', 'sector', 'tags', 'favorite', 'salary', 'availability', 'source', 'lastActivity', 'dateAdded'].includes(key) && typeof selectedItem[key] !== 'object').map(key => {
                      // Traduction des labels en français
                      const labelsFR = {
                        'name': 'Nom',
                        'email': 'Email',
                        'phone': 'Téléphone',
                        'position': 'Poste',
                        'status': 'Statut',
                        'location': 'Localisation',
                        'experience': 'Expérience (années)',
                        'skills': 'Compétences',
                        'title': 'Titre',
                        'client': 'Client',
                        'salary': 'Salaire',
                        'description': 'Description',
                        'industry': 'Secteur',
                        'missions': 'Missions',
                        'role': 'Rôle',
                        'active': 'Actif',
                        'hireDate': 'Date d\'embauche',
                        'date': 'Date',
                        'time': 'Heure',
                        'type': 'Type',
                        'score': 'Score',
                        'candidateName': 'Nom du candidat',
                        'missionTitle': 'Titre de la mission',
                        'startDate': 'Date de début',
                        'urgency': 'Urgence',
                        'workMode': 'Mode de travail',
                        'contractType': 'Type de contrat',
                        'weeklyHours': 'Heures hebdomadaires',
                        'progress': 'Progression'
                      };
                      const label = labelsFR[key] || key;
                      
                      return (
                        <div key={key}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', color: '#6B7280' }}>{label}</label>
                          <input type="text" value={editedItem?.[key] || ''} onChange={(e) => setEditedItem({...editedItem, [key]: e.target.value})} style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }} />
                        </div>
                      );
                    })}
                    
                    {/* Département - Select uniquement pour candidats */}
                    {(selectedItem.position || selectedItem.experience !== undefined) && (
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', color: '#6B7280' }}>📍 Département</label>
                        <select value={editedItem?.department || '75'} onChange={(e) => setEditedItem({...editedItem, department: e.target.value})} style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'white' }}>
                          <option value="01">01 - Ain</option>
                          <option value="02">02 - Aisne</option>
                          <option value="06">06 - Alpes-Maritimes</option>
                          <option value="13">13 - Bouches-du-Rhône</option>
                          <option value="14">14 - Calvados</option>
                          <option value="31">31 - Haute-Garonne</option>
                          <option value="33">33 - Gironde</option>
                          <option value="34">34 - Hérault</option>
                          <option value="35">35 - Ille-et-Vilaine</option>
                          <option value="38">38 - Isère</option>
                          <option value="44">44 - Loire-Atlantique</option>
                          <option value="59">59 - Nord</option>
                          <option value="62">62 - Pas-de-Calais</option>
                          <option value="67">67 - Bas-Rhin</option>
                          <option value="69">69 - Rhône</option>
                          <option value="75">75 - Paris</option>
                          <option value="76">76 - Seine-Maritime</option>
                          <option value="77">77 - Seine-et-Marne</option>
                          <option value="78">78 - Yvelines</option>
                          <option value="91">91 - Essonne</option>
                          <option value="92">92 - Hauts-de-Seine</option>
                          <option value="93">93 - Seine-Saint-Denis</option>
                          <option value="94">94 - Val-de-Marne</option>
                          <option value="95">95 - Val-d'Oise</option>
                        </select>
                      </div>
                    )}

                    {/* Métier - Select uniquement pour candidats */}
                    {(selectedItem.position || selectedItem.experience !== undefined) && (
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', color: '#6B7280' }}>💼 Métier / Domaine</label>
                        <select value={editedItem?.metier || 'Non défini'} onChange={(e) => setEditedItem({...editedItem, metier: e.target.value})} style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'white' }}>
                          <option value="Non défini">Non défini</option>
                          
                          <optgroup label="🖥️ Tech & IT">
                            <option value="Développeur Front-end">Développeur Front-end</option>
                            <option value="Développeur Back-end">Développeur Back-end</option>
                            <option value="Développeur Full Stack">Développeur Full Stack</option>
                            <option value="Développeur Mobile">Développeur Mobile</option>
                            <option value="Architecte Logiciel">Architecte Logiciel</option>
                            <option value="DevOps Engineer">DevOps Engineer</option>
                            <option value="Data Scientist">Data Scientist</option>
                            <option value="Data Engineer">Data Engineer</option>
                            <option value="Data Analyst">Data Analyst</option>
                            <option value="IA Engineer">IA Engineer</option>
                            <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                            <option value="Ingénieur Cloud">Ingénieur Cloud</option>
                            <option value="Architecte Cloud">Architecte Cloud</option>
                            <option value="Ingénieur Cybersécurité">Ingénieur Cybersécurité</option>
                            <option value="Analyste Cybersécurité">Analyste Cybersécurité</option>
                            <option value="Pentester">Pentester</option>
                            <option value="Product Manager">Product Manager</option>
                            <option value="Product Owner">Product Owner</option>
                            <option value="Scrum Master">Scrum Master</option>
                            <option value="CTO">CTO</option>
                            <option value="Lead Developer">Lead Developer</option>
                            <option value="Tech Lead">Tech Lead</option>
                            <option value="QA Engineer">QA Engineer</option>
                            <option value="Test Automation Engineer">Test Automation Engineer</option>
                          </optgroup>

                          <optgroup label="🎨 Design & UX">
                            <option value="UX Designer">UX Designer</option>
                            <option value="UI Designer">UI Designer</option>
                            <option value="Product Designer">Product Designer</option>
                            <option value="UX Researcher">UX Researcher</option>
                            <option value="Directeur Artistique">Directeur Artistique</option>
                            <option value="Graphiste">Graphiste</option>
                            <option value="Motion Designer">Motion Designer</option>
                            <option value="Designer 3D">Designer 3D</option>
                            <option value="Illustrateur">Illustrateur</option>
                            <option value="Webdesigner">Webdesigner</option>
                          </optgroup>

                          <optgroup label="📢 Marketing & Communication">
                            <option value="Marketing Manager">Marketing Manager</option>
                            <option value="Digital Marketing Manager">Digital Marketing Manager</option>
                            <option value="Growth Hacker">Growth Hacker</option>
                            <option value="SEO Manager">SEO Manager</option>
                            <option value="SEA Manager">SEA Manager</option>
                            <option value="Social Media Manager">Social Media Manager</option>
                            <option value="Content Manager">Content Manager</option>
                            <option value="Community Manager">Community Manager</option>
                            <option value="Brand Manager">Brand Manager</option>
                            <option value="Chargé de Communication">Chargé de Communication</option>
                            <option value="Responsable Communication">Responsable Communication</option>
                            <option value="Chef de Publicité">Chef de Publicité</option>
                            <option value="Media Planner">Media Planner</option>
                            <option value="Traffic Manager">Traffic Manager</option>
                            <option value="CRM Manager">CRM Manager</option>
                            <option value="Email Marketing Manager">Email Marketing Manager</option>
                          </optgroup>

                          <optgroup label="💼 Commercial & Vente">
                            <option value="Commercial">Commercial</option>
                            <option value="Business Developer">Business Developer</option>
                            <option value="Account Manager">Account Manager</option>
                            <option value="Sales Manager">Sales Manager</option>
                            <option value="Directeur Commercial">Directeur Commercial</option>
                            <option value="Ingénieur Commercial">Ingénieur Commercial</option>
                            <option value="Technico-Commercial">Technico-Commercial</option>
                            <option value="Key Account Manager">Key Account Manager</option>
                            <option value="Customer Success Manager">Customer Success Manager</option>
                            <option value="Inside Sales">Inside Sales</option>
                            <option value="Sales Development Representative">Sales Development Representative</option>
                            <option value="Account Executive">Account Executive</option>
                          </optgroup>

                          <optgroup label="👥 RH & Recrutement">
                            <option value="Recruteur">Recruteur</option>
                            <option value="Chargé de Recrutement">Chargé de Recrutement</option>
                            <option value="Talent Acquisition">Talent Acquisition</option>
                            <option value="RH Généraliste">RH Généraliste</option>
                            <option value="Responsable RH">Responsable RH</option>
                            <option value="DRH">DRH</option>
                            <option value="Chargé de Formation">Chargé de Formation</option>
                            <option value="Responsable Formation">Responsable Formation</option>
                            <option value="Gestionnaire Paie">Gestionnaire Paie</option>
                            <option value="Responsable Paie">Responsable Paie</option>
                            <option value="Responsable Relations Sociales">Responsable Relations Sociales</option>
                          </optgroup>

                          <optgroup label="💰 Finance & Comptabilité">
                            <option value="Comptable">Comptable</option>
                            <option value="Chef Comptable">Chef Comptable</option>
                            <option value="Directeur Comptable">Directeur Comptable</option>
                            <option value="DAF">DAF</option>
                            <option value="Contrôleur de Gestion">Contrôleur de Gestion</option>
                            <option value="Contrôleur Financier">Contrôleur Financier</option>
                            <option value="Analyste Financier">Analyste Financier</option>
                            <option value="Trésorier">Trésorier</option>
                            <option value="Credit Manager">Credit Manager</option>
                            <option value="Auditeur">Auditeur</option>
                            <option value="Commissaire aux Comptes">Commissaire aux Comptes</option>
                            <option value="Expert-Comptable">Expert-Comptable</option>
                          </optgroup>

                          <optgroup label="⚖️ Juridique">
                            <option value="Juriste">Juriste</option>
                            <option value="Juriste d'Entreprise">Juriste d'Entreprise</option>
                            <option value="Juriste Contrats">Juriste Contrats</option>
                            <option value="Juriste Social">Juriste Social</option>
                            <option value="Juriste Propriété Intellectuelle">Juriste Propriété Intellectuelle</option>
                            <option value="Directeur Juridique">Directeur Juridique</option>
                            <option value="Avocat">Avocat</option>
                            <option value="Paralegal">Paralegal</option>
                            <option value="Compliance Officer">Compliance Officer</option>
                          </optgroup>

                          <optgroup label="🏗️ Ingénierie & Production">
                            <option value="Ingénieur R&D">Ingénieur R&D</option>
                            <option value="Ingénieur Qualité">Ingénieur Qualité</option>
                            <option value="Ingénieur Méthodes">Ingénieur Méthodes</option>
                            <option value="Ingénieur Production">Ingénieur Production</option>
                            <option value="Responsable Production">Responsable Production</option>
                            <option value="Chef de Projet Industriel">Chef de Projet Industriel</option>
                            <option value="Ingénieur Maintenance">Ingénieur Maintenance</option>
                            <option value="Technicien Maintenance">Technicien Maintenance</option>
                          </optgroup>

                          <optgroup label="📦 Supply Chain & Logistique">
                            <option value="Supply Chain Manager">Supply Chain Manager</option>
                            <option value="Responsable Logistique">Responsable Logistique</option>
                            <option value="Chef de Projet Logistique">Chef de Projet Logistique</option>
                            <option value="Approvisionneur">Approvisionneur</option>
                            <option value="Acheteur">Acheteur</option>
                            <option value="Responsable Achats">Responsable Achats</option>
                            <option value="Gestionnaire de Stock">Gestionnaire de Stock</option>
                            <option value="Cariste">Cariste</option>
                            <option value="Préparateur de Commandes">Préparateur de Commandes</option>
                          </optgroup>

                          <optgroup label="🎧 Support & Service Client">
                            <option value="Support Client">Support Client</option>
                            <option value="Chargé de Support">Chargé de Support</option>
                            <option value="Responsable Support">Responsable Support</option>
                            <option value="Customer Care">Customer Care</option>
                            <option value="SAV">SAV</option>
                            <option value="Technicien Support">Technicien Support</option>
                          </optgroup>

                          <optgroup label="🏥 Santé & Médical">
                            <option value="Médecin">Médecin</option>
                            <option value="Infirmier">Infirmier</option>
                            <option value="Aide-Soignant">Aide-Soignant</option>
                            <option value="Pharmacien">Pharmacien</option>
                            <option value="Préparateur en Pharmacie">Préparateur en Pharmacie</option>
                            <option value="Chercheur Biomédical">Chercheur Biomédical</option>
                            <option value="Ingénieur Biomédical">Ingénieur Biomédical</option>
                            <option value="Responsable Affaires Réglementaires">Responsable Affaires Réglementaires</option>
                          </optgroup>

                          <optgroup label="🎓 Éducation & Formation">
                            <option value="Formateur">Formateur</option>
                            <option value="Enseignant">Enseignant</option>
                            <option value="Professeur">Professeur</option>
                            <option value="Responsable Pédagogique">Responsable Pédagogique</option>
                            <option value="Conseiller en Formation">Conseiller en Formation</option>
                            <option value="Instructional Designer">Instructional Designer</option>
                          </optgroup>

                          <optgroup label="🏨 Hôtellerie & Restauration">
                            <option value="Chef de Cuisine">Chef de Cuisine</option>
                            <option value="Cuisinier">Cuisinier</option>
                            <option value="Serveur">Serveur</option>
                            <option value="Barman">Barman</option>
                            <option value="Réceptionniste">Réceptionniste</option>
                            <option value="Directeur d'Hôtel">Directeur d'Hôtel</option>
                            <option value="Revenue Manager">Revenue Manager</option>
                          </optgroup>

                          <optgroup label="🏠 Immobilier">
                            <option value="Agent Immobilier">Agent Immobilier</option>
                            <option value="Négociateur Immobilier">Négociateur Immobilier</option>
                            <option value="Gestionnaire de Biens">Gestionnaire de Biens</option>
                            <option value="Promoteur Immobilier">Promoteur Immobilier</option>
                            <option value="Asset Manager">Asset Manager</option>
                          </optgroup>

                          <optgroup label="💼 Conseil & Stratégie">
                            <option value="Consultant">Consultant</option>
                            <option value="Consultant en Stratégie">Consultant en Stratégie</option>
                            <option value="Consultant Fonctionnel">Consultant Fonctionnel</option>
                            <option value="Consultant IT">Consultant IT</option>
                            <option value="Consultant RH">Consultant RH</option>
                            <option value="Manager">Manager</option>
                            <option value="Senior Manager">Senior Manager</option>
                            <option value="Partner">Partner</option>
                          </optgroup>

                          <optgroup label="📰 Médias & Journalisme">
                            <option value="Journaliste">Journaliste</option>
                            <option value="Rédacteur">Rédacteur</option>
                            <option value="Rédacteur en Chef">Rédacteur en Chef</option>
                            <option value="Reporter">Reporter</option>
                            <option value="Photographe">Photographe</option>
                            <option value="Vidéaste">Vidéaste</option>
                            <option value="Monteur Vidéo">Monteur Vidéo</option>
                          </optgroup>

                          <optgroup label="🎬 Audiovisuel & Production">
                            <option value="Réalisateur">Réalisateur</option>
                            <option value="Producteur">Producteur</option>
                            <option value="Scénariste">Scénariste</option>
                            <option value="Chef Opérateur">Chef Opérateur</option>
                            <option value="Ingénieur du Son">Ingénieur du Son</option>
                            <option value="Monteur">Monteur</option>
                          </optgroup>

                          <optgroup label="🌍 Environnement & RSE">
                            <option value="Chargé de Mission Environnement">Chargé de Mission Environnement</option>
                            <option value="Responsable RSE">Responsable RSE</option>
                            <option value="Consultant Environnement">Consultant Environnement</option>
                            <option value="Ingénieur Environnement">Ingénieur Environnement</option>
                            <option value="Chargé d'Études Environnement">Chargé d'Études Environnement</option>
                          </optgroup>

                          <optgroup label="🏛️ Administration & Gestion">
                            <option value="Assistant Administratif">Assistant Administratif</option>
                            <option value="Secrétaire">Secrétaire</option>
                            <option value="Office Manager">Office Manager</option>
                            <option value="Responsable Administratif">Responsable Administratif</option>
                            <option value="Directeur Administratif">Directeur Administratif</option>
                          </optgroup>

                          <optgroup label="🚗 Automobile">
                            <option value="Ingénieur Automobile">Ingénieur Automobile</option>
                            <option value="Designer Automobile">Designer Automobile</option>
                            <option value="Technicien Automobile">Technicien Automobile</option>
                            <option value="Mécanicien">Mécanicien</option>
                          </optgroup>

                          <optgroup label="✈️ Aéronautique">
                            <option value="Ingénieur Aéronautique">Ingénieur Aéronautique</option>
                            <option value="Pilote">Pilote</option>
                            <option value="Technicien Aéronautique">Technicien Aéronautique</option>
                            <option value="Contrôleur Aérien">Contrôleur Aérien</option>
                          </optgroup>

                          <optgroup label="⚡ Énergie">
                            <option value="Ingénieur Énergie">Ingénieur Énergie</option>
                            <option value="Chef de Projet Énergie">Chef de Projet Énergie</option>
                            <option value="Technicien Énergies Renouvelables">Technicien Énergies Renouvelables</option>
                          </optgroup>

                          <optgroup label="🏬 Retail & Grande Distribution">
                            <option value="Chef de Rayon">Chef de Rayon</option>
                            <option value="Directeur de Magasin">Directeur de Magasin</option>
                            <option value="Category Manager">Category Manager</option>
                            <option value="Merchandiser">Merchandiser</option>
                            <option value="Vendeur">Vendeur</option>
                            <option value="Caissier">Caissier</option>
                          </optgroup>

                          <optgroup label="⚽ Sport">
                            <option value="Coach Sportif">Coach Sportif</option>
                            <option value="Préparateur Physique">Préparateur Physique</option>
                            <option value="Manager Sportif">Manager Sportif</option>
                            <option value="Éducateur Sportif">Éducateur Sportif</option>
                          </optgroup>

                          <optgroup label="🎭 Culture & Spectacle">
                            <option value="Chargé de Production">Chargé de Production</option>
                            <option value="Régisseur">Régisseur</option>
                            <option value="Technicien du Spectacle">Technicien du Spectacle</option>
                            <option value="Comédien">Comédien</option>
                          </optgroup>

                          <optgroup label="🔬 Recherche & Sciences">
                            <option value="Chercheur">Chercheur</option>
                            <option value="Ingénieur de Recherche">Ingénieur de Recherche</option>
                            <option value="Doctorant">Doctorant</option>
                            <option value="Post-Doctorant">Post-Doctorant</option>
                          </optgroup>

                          <optgroup label="🌾 Agriculture & Agroalimentaire">
                            <option value="Ingénieur Agronome">Ingénieur Agronome</option>
                            <option value="Responsable Qualité Agroalimentaire">Responsable Qualité Agroalimentaire</option>
                            <option value="Technicien Agricole">Technicien Agricole</option>
                          </optgroup>

                          <optgroup label="🏛️ Secteur Public">
                            <option value="Fonctionnaire">Fonctionnaire</option>
                            <option value="Attaché Territorial">Attaché Territorial</option>
                            <option value="Rédacteur Territorial">Rédacteur Territorial</option>
                            <option value="Agent Administratif">Agent Administratif</option>
                          </optgroup>

                          <optgroup label="💎 Luxe">
                            <option value="Conseiller de Vente Luxe">Conseiller de Vente Luxe</option>
                            <option value="Chef de Produit Luxe">Chef de Produit Luxe</option>
                            <option value="Responsable Boutique Luxe">Responsable Boutique Luxe</option>
                          </optgroup>

                          <optgroup label="👔 Mode">
                            <option value="Styliste">Styliste</option>
                            <option value="Modéliste">Modéliste</option>
                            <option value="Acheteur Mode">Acheteur Mode</option>
                            <option value="Responsable Collection">Responsable Collection</option>
                          </optgroup>

                          <optgroup label="📚 Édition">
                            <option value="Éditeur">Éditeur</option>
                            <option value="Correcteur">Correcteur</option>
                            <option value="Iconographe">Iconographe</option>
                            <option value="Maquettiste">Maquettiste</option>
                          </optgroup>
                        </select>
                      </div>
                    )}

                    {/* Secteur d'activité - Select uniquement pour candidats */}
                    {(selectedItem.position || selectedItem.experience !== undefined) && (
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', color: '#6B7280' }}>🏭 Secteur d'activité</label>
                        <select value={editedItem?.sector || 'Non défini'} onChange={(e) => setEditedItem({...editedItem, sector: e.target.value})} style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'white' }}>
                          <option value="Non défini">Non défini</option>
                          <optgroup label="🖥️ Technologie & Innovation">
                            <option value="Tech & IT">Tech & IT</option>
                            <option value="IA & Machine Learning">IA & Machine Learning</option>
                            <option value="Cybersécurité">Cybersécurité</option>
                            <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                            <option value="Télécommunications">Télécommunications</option>
                            <option value="EdTech">EdTech</option>
                            <option value="Gaming">Gaming</option>
                          </optgroup>
                          <optgroup label="💰 Finance & Assurance">
                            <option value="Banque">Banque</option>
                            <option value="Assurance">Assurance</option>
                            <option value="FinTech">FinTech</option>
                            <option value="Investissement">Investissement</option>
                            <option value="Comptabilité">Comptabilité</option>
                            <option value="Crypto & Blockchain">Crypto & Blockchain</option>
                          </optgroup>
                          <optgroup label="🏥 Santé & Bien-être">
                            <option value="Santé">Santé</option>
                            <option value="Pharmaceutique">Pharmaceutique</option>
                            <option value="Biotechnologie">Biotechnologie</option>
                            <option value="MedTech">MedTech</option>
                            <option value="Dispositifs médicaux">Dispositifs médicaux</option>
                            <option value="Bien-être">Bien-être</option>
                          </optgroup>
                          <optgroup label="🏭 Industrie & Manufacturing">
                            <option value="Automobile">Automobile</option>
                            <option value="Aéronautique">Aéronautique</option>
                            <option value="Agroalimentaire">Agroalimentaire</option>
                            <option value="Chimie">Chimie</option>
                            <option value="Énergie">Énergie</option>
                            <option value="Énergies renouvelables">Énergies renouvelables</option>
                            <option value="BTP & Construction">BTP & Construction</option>
                            <option value="Logistique">Logistique</option>
                            <option value="Transport">Transport</option>
                          </optgroup>
                          <optgroup label="🛒 Commerce & Distribution">
                            <option value="E-commerce">E-commerce</option>
                            <option value="Retail">Retail</option>
                            <option value="Grande distribution">Grande distribution</option>
                            <option value="Luxe">Luxe</option>
                            <option value="Mode">Mode</option>
                            <option value="Cosmétique">Cosmétique</option>
                          </optgroup>
                          <optgroup label="🎨 Création & Médias">
                            <option value="Création & Design">Création & Design</option>
                            <option value="Marketing & Communication">Marketing & Communication</option>
                            <option value="Publicité">Publicité</option>
                            <option value="Médias">Médias</option>
                            <option value="Audiovisuel">Audiovisuel</option>
                            <option value="Édition">Édition</option>
                            <option value="Événementiel">Événementiel</option>
                          </optgroup>
                          <optgroup label="🏛️ Services & Conseil">
                            <option value="Conseil">Conseil</option>
                            <option value="Audit">Audit</option>
                            <option value="RH & Recrutement">RH & Recrutement</option>
                            <option value="Juridique">Juridique</option>
                            <option value="Formation">Formation</option>
                            <option value="Immobilier">Immobilier</option>
                            <option value="Hôtellerie">Hôtellerie</option>
                            <option value="Restauration">Restauration</option>
                            <option value="Tourisme">Tourisme</option>
                          </optgroup>
                          <optgroup label="🏫 Éducation & Recherche">
                            <option value="Éducation">Éducation</option>
                            <option value="Recherche">Recherche</option>
                            <option value="Université">Université</option>
                            <option value="Formation professionnelle">Formation professionnelle</option>
                          </optgroup>
                          <optgroup label="🌍 Environnement & Social">
                            <option value="Environnement">Environnement</option>
                            <option value="Développement durable">Développement durable</option>
                            <option value="ONG">ONG</option>
                            <option value="Économie sociale">Économie sociale</option>
                            <option value="Agriculture">Agriculture</option>
                          </optgroup>
                          <optgroup label="🎮 Loisirs & Culture">
                            <option value="Sport">Sport</option>
                            <option value="Culture">Culture</option>
                            <option value="Spectacle">Spectacle</option>
                            <option value="Musique">Musique</option>
                          </optgroup>
                          <optgroup label="🏛️ Secteur public">
                            <option value="Administration publique">Administration publique</option>
                            <option value="Défense">Défense</option>
                            <option value="Collectivités territoriales">Collectivités territoriales</option>
                          </optgroup>
                        </select>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '13px' }}>
                    {Object.entries(selectedItem).filter(([key]) => !['id', 'links', 'documents', 'notes', 'avatar', 'emoji', 'color', 'candidateAvatar', 'department', 'metier', 'sector', 'tags', 'favorite', 'salary', 'availability', 'source', 'lastActivity', 'dateAdded'].includes(key) && typeof selectedItem[key] !== 'object').map(([key, value]) => {
                      // Traduction des labels en français
                      const labelsFR = {
                        'name': 'Nom',
                        'email': 'Email',
                        'phone': 'Téléphone',
                        'position': 'Poste',
                        'status': 'Statut',
                        'location': 'Localisation',
                        'experience': 'Expérience (années)',
                        'skills': 'Compétences',
                        'title': 'Titre',
                        'client': 'Client',
                        'salary': 'Salaire',
                        'description': 'Description',
                        'industry': 'Secteur',
                        'missions': 'Missions',
                        'role': 'Rôle',
                        'active': 'Actif',
                        'hireDate': 'Date d\'embauche',
                        'date': 'Date',
                        'time': 'Heure',
                        'type': 'Type',
                        'score': 'Score',
                        'candidateName': 'Nom du candidat',
                        'missionTitle': 'Titre de la mission',
                        'startDate': 'Date de début',
                        'urgency': 'Urgence',
                        'workMode': 'Mode de travail',
                        'contractType': 'Type de contrat',
                        'weeklyHours': 'Heures hebdomadaires',
                        'progress': 'Progression'
                      };
                      const label = labelsFR[key] || key;
                      
                      return (
                        <div key={key} style={{ padding: '8px', background: 'white', borderRadius: '8px' }}>
                          <span style={{ color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', fontSize: '10px', display: 'block', marginBottom: '4px' }}>{label}</span>
                          <span style={{ color: '#1F2937', fontWeight: '600' }}>{value}</span>
                        </div>
                      );
                    })}
                    
                    {/* Département - Affichage pour candidats */}
                    {selectedItem.department && (
                      <div style={{ padding: '8px', background: 'white', borderRadius: '8px' }}>
                        <span style={{ color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', fontSize: '10px', display: 'block', marginBottom: '4px' }}>📍 Département</span>
                        <span style={{ color: '#1F2937', fontWeight: '600' }}>{selectedItem.department}</span>
                      </div>
                    )}

                    {/* Métier - Affichage pour candidats */}
                    {selectedItem.metier && (
                      <div style={{ padding: '8px', background: 'white', borderRadius: '8px' }}>
                        <span style={{ color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', fontSize: '10px', display: 'block', marginBottom: '4px' }}>💼 Métier</span>
                        <span style={{ color: '#1F2937', fontWeight: '600' }}>{selectedItem.metier}</span>
                      </div>
                    )}

                    {/* Secteur - Affichage pour candidats */}
                    {selectedItem.sector && (
                      <div style={{ padding: '8px', background: 'white', borderRadius: '8px' }}>
                        <span style={{ color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', fontSize: '10px', display: 'block', marginBottom: '4px' }}>🏭 Secteur</span>
                        <span style={{ color: '#1F2937', fontWeight: '600' }}>{selectedItem.sector}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* DÉTAILS MISSION (uniquement pour missions) */}
              {selectedItem.title && selectedItem.client && (
                <div style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    📋 Détails de la Mission
                  </h4>

                  <div style={{ display: 'grid', gap: '20px' }}>
                    {/* Date de début */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#1F2937' }}>📅 Date de début</label>
                      {editMode ? (
                        <input 
                          type="date" 
                          value={editedItem?.startDate || new Date().toISOString().split('T')[0]} 
                          onChange={(e) => setEditedItem({...editedItem, startDate: e.target.value})}
                          style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                        />
                      ) : (
                        <div style={{ padding: '12px', background: 'white', borderRadius: '10px', fontWeight: '700', color: '#1F2937' }}>
                          {new Date(selectedItem.startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      )}
                    </div>

                    {/* Niveau d'urgence */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#1F2937' }}>⚡ Niveau d'urgence</label>
                      {editMode ? (
                        <select 
                          value={editedItem?.urgency || 'a venir'} 
                          onChange={(e) => setEditedItem({...editedItem, urgency: e.target.value})}
                          style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', background: 'white' }}>
                          <option value="tres urgent">🔴 Très urgent</option>
                          <option value="urgent">🟠 Urgent</option>
                          <option value="a venir">🟡 À venir</option>
                          <option value="anticipation">🟢 Anticipation</option>
                        </select>
                      ) : (
                        <div style={{ padding: '12px', background: selectedItem.urgency === 'tres urgent' ? '#FEE2E2' : selectedItem.urgency === 'urgent' ? '#FED7AA' : selectedItem.urgency === 'a venir' ? '#FEF3C7' : '#D1FAE5', borderRadius: '10px', fontWeight: '700', color: '#1F2937', display: 'inline-block' }}>
                          {selectedItem.urgency === 'tres urgent' && '🔴 Très urgent'}
                          {selectedItem.urgency === 'urgent' && '🟠 Urgent'}
                          {selectedItem.urgency === 'a venir' && '🟡 À venir'}
                          {selectedItem.urgency === 'anticipation' && '🟢 Anticipation'}
                        </div>
                      )}
                    </div>

                    {/* Adresse du poste */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#1F2937' }}>📍 Adresse du poste</label>
                      {editMode ? (
                        <div style={{ display: 'grid', gap: '10px' }}>
                          <input 
                            type="text" 
                            placeholder="Rue, numéro, voie..." 
                            value={editedItem?.address?.street || ''} 
                            onChange={(e) => setEditedItem({...editedItem, address: {...(editedItem.address || {}), street: e.target.value}})}
                            style={{ padding: '12px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '13px' }}
                          />
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                            <input 
                              type="text" 
                              placeholder="Ville" 
                              value={editedItem?.address?.city || ''} 
                              onChange={(e) => setEditedItem({...editedItem, address: {...(editedItem.address || {}), city: e.target.value}})}
                              style={{ padding: '12px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '13px' }}
                            />
                            <input 
                              type="text" 
                              placeholder="Code postal" 
                              value={editedItem?.address?.zipCode || ''} 
                              onChange={(e) => setEditedItem({...editedItem, address: {...(editedItem.address || {}), zipCode: e.target.value}})}
                              style={{ padding: '12px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '13px' }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding: '12px', background: 'white', borderRadius: '10px', color: '#1F2937' }}>
                          {selectedItem.address?.street && <div style={{ fontWeight: '600' }}>{selectedItem.address.street}</div>}
                          {(selectedItem.address?.city || selectedItem.address?.zipCode) && (
                            <div style={{ fontWeight: '600', marginTop: '4px' }}>
                              {selectedItem.address?.zipCode} {selectedItem.address?.city}
                            </div>
                          )}
                          {!selectedItem.address?.street && !selectedItem.address?.city && <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Adresse non renseignée</span>}
                        </div>
                      )}
                    </div>

                    {/* Mode de fonctionnement */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#1F2937' }}>🏢 Mode de travail</label>
                        {editMode ? (
                          <select 
                            value={editedItem?.workMode || 'hybride'} 
                            onChange={(e) => setEditedItem({...editedItem, workMode: e.target.value})}
                            style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'white' }}>
                            <option value="presentiel">🏢 Présentiel</option>
                            <option value="hybride">🔄 Hybride</option>
                            <option value="hybride possible">🔄 Hybride possible</option>
                            <option value="total remote">🏠 Total remote</option>
                          </select>
                        ) : (
                          <div style={{ padding: '12px', background: 'white', borderRadius: '10px', fontWeight: '700', color: '#1F2937' }}>
                            {selectedItem.workMode === 'presentiel' && '🏢 Présentiel'}
                            {selectedItem.workMode === 'hybride' && '🔄 Hybride'}
                            {selectedItem.workMode === 'hybride possible' && '🔄 Hybride possible'}
                            {selectedItem.workMode === 'total remote' && '🏠 Total remote'}
                          </div>
                        )}
                      </div>

                      {/* Type de contrat */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#1F2937' }}>📄 Type de contrat</label>
                        {editMode ? (
                          <select 
                            value={editedItem?.contractType || 'CDI'} 
                            onChange={(e) => setEditedItem({...editedItem, contractType: e.target.value})}
                            style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'white' }}>
                            <option value="CDI">CDI</option>
                            <option value="CDD">CDD</option>
                            <option value="Intérim">Intérim</option>
                            <option value="Freelance">Freelance</option>
                            <option value="Stage">Stage</option>
                            <option value="Alternance">Alternance</option>
                          </select>
                        ) : (
                          <div style={{ padding: '12px', background: 'white', borderRadius: '10px', fontWeight: '700', color: '#1F2937' }}>
                            📄 {selectedItem.contractType}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Heures hebdo */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#1F2937' }}>⏰ Heures hebdomadaires</label>
                      {editMode ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <select 
                            value={editedItem?.weeklyHours || '35 heures'} 
                            onChange={(e) => setEditedItem({...editedItem, weeklyHours: e.target.value})}
                            style={{ flex: 1, padding: '12px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'white' }}>
                            <option value="25 heures">25 heures</option>
                            <option value="30 heures">30 heures</option>
                            <option value="35 heures">35 heures</option>
                            <option value="39 heures">39 heures</option>
                            <option value="autre">Autre (saisie libre)</option>
                          </select>
                          {editedItem?.weeklyHours === 'autre' && (
                            <input 
                              type="text" 
                              placeholder="Ex: 42 heures" 
                              onChange={(e) => setEditedItem({...editedItem, weeklyHours: e.target.value})}
                              style={{ flex: 1, padding: '12px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '13px' }}
                            />
                          )}
                        </div>
                      ) : (
                        <div style={{ padding: '12px', background: 'white', borderRadius: '10px', fontWeight: '700', color: '#1F2937' }}>
                          ⏰ {selectedItem.weeklyHours}
                        </div>
                      )}
                    </div>

                    {/* Contact client */}
                    <div style={{ borderTop: '2px dashed #F59E0B', paddingTop: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '12px', color: '#1F2937' }}>👤 Contact client</label>
                      {editMode ? (
                        <div style={{ display: 'grid', gap: '10px' }}>
                          <input 
                            type="text" 
                            placeholder="Nom du contact" 
                            value={editedItem?.contactClient?.name || ''} 
                            onChange={(e) => setEditedItem({...editedItem, contactClient: {...(editedItem.contactClient || {}), name: e.target.value}})}
                            style={{ padding: '12px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '13px' }}
                          />
                          <input 
                            type="tel" 
                            placeholder="Téléphone" 
                            value={editedItem?.contactClient?.phone || ''} 
                            onChange={(e) => setEditedItem({...editedItem, contactClient: {...(editedItem.contactClient || {}), phone: e.target.value}})}
                            style={{ padding: '12px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '13px' }}
                          />
                          <input 
                            type="email" 
                            placeholder="Email" 
                            value={editedItem?.contactClient?.email || ''} 
                            onChange={(e) => setEditedItem({...editedItem, contactClient: {...(editedItem.contactClient || {}), email: e.target.value}})}
                            style={{ padding: '12px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '13px' }}
                          />
                        </div>
                      ) : (
                        <div style={{ padding: '12px', background: 'white', borderRadius: '10px' }}>
                          {selectedItem.contactClient?.name && <div style={{ fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>{selectedItem.contactClient.name}</div>}
                          {selectedItem.contactClient?.phone && <div style={{ fontSize: '13px', color: '#6B7280' }}>📱 {selectedItem.contactClient.phone}</div>}
                          {selectedItem.contactClient?.email && <div style={{ fontSize: '13px', color: '#6B7280' }}>📧 {selectedItem.contactClient.email}</div>}
                          {!selectedItem.contactClient?.name && <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Contact non renseigné</span>}
                        </div>
                      )}
                    </div>

                    {/* État d'avancement */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '12px', color: '#1F2937' }}>📊 État d'avancement - {editMode ? editedItem?.progress || 0 : selectedItem.progress}%</label>
                      {editMode ? (
                        <div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={editedItem?.progress || 0} 
                            onChange={(e) => setEditedItem({...editedItem, progress: parseInt(e.target.value)})}
                            style={{ width: '100%', height: '12px', cursor: 'pointer' }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>
                            <span>0% Début</span>
                            <span>25%</span>
                            <span>50%</span>
                            <span>75%</span>
                            <span>100% Terminé</span>
                          </div>
                        </div>
                      ) : (
                        <div style={{ position: 'relative', height: '32px', background: '#E5E7EB', borderRadius: '16px', overflow: 'hidden' }}>
                          <div style={{ 
                            position: 'absolute', 
                            left: 0, 
                            top: 0, 
                            bottom: 0, 
                            width: `${selectedItem.progress}%`, 
                            background: selectedItem.progress < 25 ? 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)' : 
                                       selectedItem.progress < 50 ? 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)' : 
                                       selectedItem.progress < 75 ? 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)' : 
                                       'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                            transition: 'width 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '800',
                            fontSize: '14px'
                          }}>
                            {selectedItem.progress > 15 && `${selectedItem.progress}%`}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Liens */}
              <div style={{ background: '#EFF6FF', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#1F2937' }}>🔗 Liens</h4>
                  {editMode && (
                    <button onClick={() => {
                      const newLink = { label: 'Nouveau lien', url: 'https://' };
                      setEditedItem({...editedItem, links: [...(editedItem.links || []), newLink]});
                    }} style={{ padding: '6px 12px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>+ Ajouter</button>
                  )}
                </div>
                {editMode ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(editedItem?.links || []).map((link, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px' }}>
                        <input placeholder="Libellé" value={link.label} onChange={(e) => { const newLinks = [...editedItem.links]; newLinks[i].label = e.target.value; setEditedItem({...editedItem, links: newLinks}); }} style={{ flex: 1, padding: '8px', border: '2px solid #E5E7EB', borderRadius: '6px', fontSize: '12px' }} />
                        <input placeholder="URL" value={link.url} onChange={(e) => { const newLinks = [...editedItem.links]; newLinks[i].url = e.target.value; setEditedItem({...editedItem, links: newLinks}); }} style={{ flex: 2, padding: '8px', border: '2px solid #E5E7EB', borderRadius: '6px', fontSize: '12px' }} />
                        <button onClick={() => { const newLinks = editedItem.links.filter((_, idx) => idx !== i); setEditedItem({...editedItem, links: newLinks}); }} style={{ padding: '8px 12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🗑️</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(selectedItem.links && selectedItem.links.length > 0) ? selectedItem.links.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'white', borderRadius: '8px', textDecoration: 'none', color: '#3B82F6', fontWeight: '600', fontSize: '13px' }}>
                        <span>🔗</span>{link.label}
                      </a>
                    )) : <p style={{ color: '#6B7280', fontSize: '13px', fontStyle: 'italic' }}>Aucun lien</p>}
                  </div>
                )}
              </div>

              {/* Documents */}
              <div style={{ background: '#F0FDF4', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#1F2937' }}>📎 Documents</h4>
                  {editMode && (
                    <button onClick={() => {
                      const newDoc = { name: 'nouveau_document.pdf', size: '0 KB' };
                      setEditedItem({...editedItem, documents: [...(editedItem.documents || []), newDoc]});
                    }} style={{ padding: '6px 12px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>+ Ajouter</button>
                  )}
                </div>
                {editMode ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(editedItem?.documents || []).map((doc, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px' }}>
                        <input placeholder="Nom du fichier" value={doc.name} onChange={(e) => { const newDocs = [...editedItem.documents]; newDocs[i].name = e.target.value; setEditedItem({...editedItem, documents: newDocs}); }} style={{ flex: 2, padding: '8px', border: '2px solid #E5E7EB', borderRadius: '6px', fontSize: '12px' }} />
                        <input placeholder="Taille" value={doc.size} onChange={(e) => { const newDocs = [...editedItem.documents]; newDocs[i].size = e.target.value; setEditedItem({...editedItem, documents: newDocs}); }} style={{ flex: 1, padding: '8px', border: '2px solid #E5E7EB', borderRadius: '6px', fontSize: '12px' }} />
                        <button onClick={() => { const newDocs = editedItem.documents.filter((_, idx) => idx !== i); setEditedItem({...editedItem, documents: newDocs}); }} style={{ padding: '8px 12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🗑️</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {(selectedItem.documents && selectedItem.documents.length > 0) ? selectedItem.documents.map((doc, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '20px' }}>📄</span>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                          <div style={{ fontSize: '10px', color: '#6B7280' }}>{doc.size}</div>
                        </div>
                      </div>
                    )) : <p style={{ color: '#6B7280', fontSize: '13px', fontStyle: 'italic', gridColumn: '1 / -1' }}>Aucun document</p>}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div style={{ background: '#FEF3C7', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#1F2937' }}>📝 Notes</h4>
                {editMode ? (
                  <textarea value={editedItem?.notes || ''} onChange={(e) => setEditedItem({...editedItem, notes: e.target.value})} placeholder="Ajoutez des notes..." style={{ width: '100%', minHeight: '100px', padding: '14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', fontFamily: 'system-ui', resize: 'vertical' }} />
                ) : (
                  <p style={{ color: '#1F2937', fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                    {selectedItem.notes || <span style={{ color: '#6B7280', fontStyle: 'italic' }}>Aucune note</span>}
                  </p>
                )}
              </div>

              {/* TAGS & INFOS CANDIDAT (uniquement pour candidats) */}
              {(selectedItem.position || selectedItem.experience !== undefined) && (
                <div style={{ background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', color: '#1F2937' }}>
                    🏷️ Tags & Informations Complémentaires
                  </h4>

                  {/* Tags */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: '#1F2937' }}>Tags</label>
                    {editMode ? (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {tags.map(tag => {
                          const isSelected = (editedItem?.tags || []).includes(tag.id);
                          return (
                            <button 
                              key={tag.id}
                              onClick={() => {
                                const currentTags = editedItem?.tags || [];
                                const newTags = isSelected 
                                  ? currentTags.filter(t => t !== tag.id)
                                  : [...currentTags, tag.id];
                                setEditedItem({...editedItem, tags: newTags});
                              }}
                              style={{ 
                                padding: '8px 16px', 
                                background: isSelected ? tag.color : '#F3F4F6', 
                                color: isSelected ? 'white' : '#4B5563', 
                                border: isSelected ? `2px solid ${tag.color}` : '2px solid #E5E7EB', 
                                borderRadius: '8px', 
                                cursor: 'pointer', 
                                fontWeight: '700', 
                                fontSize: '13px',
                                transition: 'all 0.2s'
                              }}>
                              {isSelected ? '✓ ' : ''}{tag.name}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {(selectedItem.tags || []).length > 0 ? (
                          (selectedItem.tags || []).map(tagId => {
                            const tag = tags.find(t => t.id === tagId);
                            return tag ? (
                              <span key={tagId} style={{ padding: '8px 16px', background: tag.color, color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
                                {tag.name}
                              </span>
                            ) : null;
                          })
                        ) : (
                          <span style={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: '13px' }}>Aucun tag</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Grille infos supplémentaires */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {/* Salaire */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#1F2937' }}>💰 Prétention salariale</label>
                      {editMode ? (
                        <input 
                          type="text" 
                          value={editedItem?.salary || ''} 
                          onChange={(e) => setEditedItem({...editedItem, salary: e.target.value})}
                          placeholder="Ex: 45-55k€"
                          style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }}
                        />
                      ) : (
                        <div style={{ padding: '10px', background: 'white', borderRadius: '8px', fontWeight: '700', color: '#1F2937' }}>
                          {selectedItem.salary || <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Non renseigné</span>}
                        </div>
                      )}
                    </div>

                    {/* Disponibilité */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#1F2937' }}>📅 Disponibilité</label>
                      {editMode ? (
                        <select 
                          value={editedItem?.availability || ''} 
                          onChange={(e) => setEditedItem({...editedItem, availability: e.target.value})}
                          style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'white' }}>
                          <option value="">Non défini</option>
                          <option value="Immédiate">Immédiate</option>
                          <option value="1 semaine">1 semaine</option>
                          <option value="2 semaines">2 semaines</option>
                          <option value="3 semaines">3 semaines</option>
                          <option value="1 mois">1 mois</option>
                          <option value="2 mois">2 mois</option>
                          <option value="3 mois">3 mois</option>
                          <option value="Préavis en cours">Préavis en cours</option>
                        </select>
                      ) : (
                        <div style={{ padding: '10px', background: 'white', borderRadius: '8px', fontWeight: '700', color: '#1F2937' }}>
                          {selectedItem.availability || <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Non renseigné</span>}
                        </div>
                      )}
                    </div>

                    {/* Source */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#1F2937' }}>📍 Source / Canal</label>
                      {editMode ? (
                        <select 
                          value={editedItem?.source || ''} 
                          onChange={(e) => setEditedItem({...editedItem, source: e.target.value})}
                          style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'white' }}>
                          <option value="">Non défini</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Indeed">Indeed</option>
                          <option value="Apec">Apec</option>
                          <option value="Monster">Monster</option>
                          <option value="Site carrière">Site carrière</option>
                          <option value="Cooptation">Cooptation</option>
                          <option value="Recommandation">Recommandation</option>
                          <option value="Candidature spontanée">Candidature spontanée</option>
                          <option value="Job board">Job board</option>
                          <option value="Réseaux sociaux">Réseaux sociaux</option>
                          <option value="Behance">Behance</option>
                          <option value="GitHub">GitHub</option>
                          <option value="Autre">Autre</option>
                        </select>
                      ) : (
                        <div style={{ padding: '10px', background: 'white', borderRadius: '8px', fontWeight: '700', color: '#1F2937' }}>
                          {selectedItem.source || <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Non renseigné</span>}
                        </div>
                      )}
                    </div>

                    {/* Dernière activité */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#1F2937' }}>🕐 Dernière activité</label>
                      {editMode ? (
                        <input 
                          type="date" 
                          value={editedItem?.lastActivity || ''} 
                          onChange={(e) => setEditedItem({...editedItem, lastActivity: e.target.value})}
                          style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
                        />
                      ) : (
                        <div style={{ padding: '10px', background: 'white', borderRadius: '8px', fontWeight: '700', color: '#1F2937' }}>
                          {selectedItem.lastActivity ? new Date(selectedItem.lastActivity).toLocaleDateString('fr-FR') : <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Non renseigné</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Favori */}
                  {editMode && (
                    <div style={{ marginTop: '20px', padding: '16px', background: 'white', borderRadius: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={editedItem?.favorite || false}
                          onChange={(e) => setEditedItem({...editedItem, favorite: e.target.checked})}
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>
                          ⭐ Ajouter aux favoris
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* ACTIVITÉ RECRUTEUR (seulement pour membres équipe) */}
              {selectedItem.role && selectedItem.activity && (
                <div style={{ background: '#FEF3C7', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    📊 Activité & Suivi
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {[
                      ['🕐 Dernière connexion', selectedItem.activity.lastLogin],
                      ['📞 Candidats contactés', selectedItem.activity.candidatesContacted],
                      ['📅 Entretiens planifiés', selectedItem.activity.interviewsScheduled],
                      ['⏱️ Temps de réponse moyen', selectedItem.activity.avgResponseTime],
                      ['📈 Heures hebdo', selectedItem.activity.weeklyHours + 'h'],
                      ['💼 Missions actives', selectedItem.assignedMissions.length]
                    ].map(([label, value], i) => (
                      <div key={i} style={{ padding: '12px', background: 'white', borderRadius: '10px' }}>
                        <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>{label}</div>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#1F2937' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PERFORMANCE RECRUTEUR (seulement pour membres équipe) */}
              {selectedItem.role && selectedItem.performance && (
                <div style={{ background: '#E0E7FF', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    🎯 Performance & KPIs
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {/* Objectif mensuel */}
                    <div style={{ padding: '16px', background: 'white', borderRadius: '12px' }}>
                      <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '700', marginBottom: '12px' }}>📌 Objectif Mensuel</div>
                      <div style={{ display: 'flex', alignItems: 'end', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '32px', fontWeight: '900', color: '#667EEA' }}>{selectedItem.performance.monthlyAchieved}</span>
                        <span style={{ fontSize: '20px', color: '#6B7280', marginBottom: '4px' }}>/ {selectedItem.performance.monthlyGoal}</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${(selectedItem.performance.monthlyAchieved / selectedItem.performance.monthlyGoal) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #667EEA 0%, #764BA2 100%)' }}></div>
                      </div>
                    </div>

                    {/* Taux de conversion */}
                    <div style={{ padding: '16px', background: 'white', borderRadius: '12px' }}>
                      <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '700', marginBottom: '12px' }}>📈 Taux de Conversion</div>
                      <div style={{ fontSize: '32px', fontWeight: '900', color: '#10B981', marginBottom: '8px' }}>{selectedItem.performance.conversionRate}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>Candidatures → Placements</div>
                    </div>

                    {/* Satisfaction */}
                    <div style={{ padding: '16px', background: 'white', borderRadius: '12px' }}>
                      <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '700', marginBottom: '12px' }}>⭐ Satisfaction Client</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '32px', fontWeight: '900', color: '#F59E0B' }}>{selectedItem.performance.satisfaction}</span>
                        <span style={{ fontSize: '20px', color: '#F59E0B' }}>★</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>/ 5.0</div>
                    </div>

                    {/* Attribution totale */}
                    <div style={{ padding: '16px', background: 'white', borderRadius: '12px' }}>
                      <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '700', marginBottom: '12px' }}>📋 Portefeuille Total</div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#1F2937', marginBottom: '4px' }}>
                        {selectedItem.assignedClients.length} clients
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#1F2937' }}>
                        {selectedItem.assignedMissions.length} missions
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Attribution aux Recruteurs (pour Clients et Missions) */}
              {(selectedItem.industry || selectedItem.title) && (
                <div style={{ background: '#F0F9FF', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    👨‍👩‍👧‍👦 Attribution aux Recruteurs
                  </h4>
                  
                  {editMode ? (
                    <div>
                      <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px', fontStyle: 'italic' }}>
                        Sélectionnez un ou plusieurs recruteurs pour attribuer ce {selectedItem.industry ? 'client' : 'poste'}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        {team.filter(t => t.active).map(member => {
                          const isAssigned = selectedItem.industry 
                            ? member.assignedClients.includes(selectedItem.id)
                            : member.assignedMissions.includes(selectedItem.id);
                          
                          return (
                            <div key={member.id} onClick={() => {
                              const updatedTeam = team.map(t => {
                                if (t.id === member.id) {
                                  if (selectedItem.industry) {
                                    // Attribution client
                                    const newClients = isAssigned 
                                      ? t.assignedClients.filter(id => id !== selectedItem.id)
                                      : [...t.assignedClients, selectedItem.id];
                                    return {...t, assignedClients: newClients};
                                  } else {
                                    // Attribution mission
                                    const newMissions = isAssigned
                                      ? t.assignedMissions.filter(id => id !== selectedItem.id)
                                      : [...t.assignedMissions, selectedItem.id];
                                    return {...t, assignedMissions: newMissions};
                                  }
                                }
                                return t;
                              });
                              setTeam(updatedTeam);
                            }} style={{ padding: '12px', background: isAssigned ? 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)' : 'white', border: '2px solid', borderColor: isAssigned ? '#10B981' : '#E5E7EB', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '12px' }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                              <div style={{ width: '40px', height: '40px', background: `linear-gradient(135deg, ${member.color} 0%, ${member.color}99 100%)`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                {member.avatar}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>{member.name}</div>
                                <div style={{ fontSize: '11px', color: '#6B7280' }}>{member.role}</div>
                              </div>
                              <div style={{ fontSize: '20px' }}>{isAssigned ? '✓' : '○'}</div>
                            </div>
                          );
                        })}
                      </div>
                      {team.filter(t => t.active).length === 0 && (
                        <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '13px', fontStyle: 'italic', padding: '20px' }}>
                          Aucun recruteur actif disponible
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      {/* Affichage des recruteurs assignés */}
                      {team.filter(t => selectedItem.industry ? t.assignedClients.includes(selectedItem.id) : t.assignedMissions.includes(selectedItem.id)).length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {team.filter(t => selectedItem.industry ? t.assignedClients.includes(selectedItem.id) : t.assignedMissions.includes(selectedItem.id)).map(member => (
                            <div key={member.id} style={{ padding: '10px 16px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', border: '2px solid #10B981' }}>
                              <div style={{ width: '32px', height: '32px', background: `linear-gradient(135deg, ${member.color} 0%, ${member.color}99 100%)`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                                {member.avatar}
                              </div>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937' }}>{member.name}</div>
                                <div style={{ fontSize: '10px', color: '#6B7280' }}>{member.role}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '13px', fontStyle: 'italic', padding: '16px' }}>
                          Aucun recruteur assigné - Utilisez le mode édition pour attribuer
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Historique lié */}
              {(history.filter(h => h.relatedTo?.type === (selectedItem.name ? 'candidate' : selectedItem.title ? 'mission' : selectedItem.industry ? 'client' : selectedItem.email && !selectedItem.title && !selectedItem.industry ? 'team' : '') && h.relatedTo?.id === selectedItem.id).length > 0 || 
                events.filter(e => e.relatedTo?.type === (selectedItem.name ? 'candidate' : selectedItem.title ? 'mission' : selectedItem.industry ? 'client' : '') && e.relatedTo?.id === selectedItem.id).length > 0) && (
                <div style={{ background: '#F3E8FF', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#1F2937' }}>📜 Historique & Événements</h4>
                  
                  {/* Événements liés */}
                  {events.filter(e => e.relatedTo?.type === (selectedItem.name ? 'candidate' : selectedItem.title ? 'mission' : selectedItem.industry ? 'client' : '') && e.relatedTo?.id === selectedItem.id).length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#667EEA', marginBottom: '10px' }}>📅 Rendez-vous</div>
                      {events.filter(e => e.relatedTo?.type === (selectedItem.name ? 'candidate' : selectedItem.title ? 'mission' : selectedItem.industry ? 'client' : '') && e.relatedTo?.id === selectedItem.id).map(event => (
                        <div key={event.id} style={{ padding: '12px', background: 'white', borderRadius: '10px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '50px', padding: '8px', background: event.color, borderRadius: '8px', textAlign: 'center', color: 'white', fontSize: '11px', fontWeight: '700' }}>
                            {new Date(event.date).getDate()}/{new Date(event.date).getMonth() + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937' }}>{event.title}</div>
                            <div style={{ fontSize: '11px', color: '#6B7280' }}>{event.time} • {event.location}</div>
                          </div>
                          <div style={{ padding: '4px 10px', background: event.status === 'completed' ? '#10B981' : '#F59E0B', color: 'white', borderRadius: '6px', fontSize: '10px', fontWeight: '700' }}>
                            {event.status === 'completed' ? '✓ Fait' : '⏱ Prévu'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Historique lié */}
                  {history.filter(h => h.relatedTo?.type === (selectedItem.name ? 'candidate' : selectedItem.title ? 'mission' : selectedItem.industry ? 'client' : '') && h.relatedTo?.id === selectedItem.id).length > 0 && (
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#667EEA', marginBottom: '10px' }}>📋 Actions</div>
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {history.filter(h => h.relatedTo?.type === (selectedItem.name ? 'candidate' : selectedItem.title ? 'mission' : selectedItem.industry ? 'client' : '') && h.relatedTo?.id === selectedItem.id).sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)).map(item => (
                          <div key={item.id} style={{ padding: '12px', background: 'white', borderRadius: '10px', marginBottom: '8px', borderLeft: '3px solid #667EEA' }}>
                            <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                              <span style={{ fontSize: '16px' }}>{item.icon}</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#1F2937', marginBottom: '2px' }}>{item.action}</div>
                                <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>{item.details}</div>
                                <div style={{ fontSize: '10px', color: '#9CA3AF' }}>
                                  {new Date(item.date).toLocaleDateString('fr-FR')} {item.time}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Boutons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                {editMode ? (
                  <>
                    <button onClick={() => {
                      if (missions.find(m => m.id === selectedItem.id)) setMissions(missions.map(m => m.id === selectedItem.id ? editedItem : m));
                      else if (candidates.find(c => c.id === selectedItem.id)) setCandidates(candidates.map(c => c.id === selectedItem.id ? editedItem : c));
                      else if (clients.find(c => c.id === selectedItem.id)) setClients(clients.map(c => c.id === selectedItem.id ? editedItem : c));
                      else if (applications.find(a => a.id === selectedItem.id)) setApplications(applications.map(a => a.id === selectedItem.id ? editedItem : a));
                      setSelectedItem(editedItem);
                      setEditMode(false);
                    }} style={{ flex: 1, padding: '16px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>✓ Enregistrer</button>
                    <button onClick={() => { setEditMode(false); setEditedItem(null); }} style={{ flex: 1, padding: '16px', background: '#6B7280', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>✕ Annuler</button>
                  </>
                ) : (
                  <button onClick={() => { setSelectedItem(null); setEditMode(false); }} style={{ flex: 1, padding: '16px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>Fermer</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========== MODAL LOGIN SUPERADMIN ==========
  if (showSuperAdminLogin && !isSuperAdmin) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, fontFamily: 'system-ui' }}>
        <div style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', padding: '50px', borderRadius: '24px', maxWidth: '450px', width: '90%', border: '2px solid #334155', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>👑</div>
            <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px', color: 'white' }}>Accès SuperAdmin</h2>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>Panneau de contrôle plateforme</p>
          </div>
          
          <input 
            type="password" 
            placeholder="Mot de passe administrateur"
            value={superAdminPassword}
            onChange={(e) => setSuperAdminPassword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && superAdminPassword === 'admin2026') {
                setIsSuperAdmin(true);
                setShowSuperAdminLogin(false);
                setView('superadmin');
              }
            }}
            style={{ width: '100%', padding: '16px', border: '2px solid #334155', borderRadius: '12px', fontSize: '16px', marginBottom: '24px', background: '#0F172A', color: 'white', outline: 'none' }}
            autoFocus
          />
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button 
              onClick={() => { setShowSuperAdminLogin(false); setSuperAdminPassword(''); }} 
              style={{ flex: 1, padding: '16px', background: '#374151', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>
              Annuler
            </button>
            <button 
              onClick={() => {
                if (superAdminPassword === 'admin2026') {
                  setIsSuperAdmin(true);
                  setShowSuperAdminLogin(false);
                  setView('superadmin');
                } else {
                  alert('❌ Mot de passe incorrect');
                }
              }} 
              style={{ flex: 1, padding: '16px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>
              🔓 Connexion
            </button>
          </div>
          
          <div style={{ padding: '16px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
            <div style={{ fontSize: '12px', color: '#FCD34D', marginBottom: '4px', fontWeight: '600' }}>💡 Informations de test</div>
            <div style={{ fontSize: '13px', color: '#FDE68A', fontFamily: 'monospace' }}>Mot de passe: <strong>admin2026</strong></div>
          </div>
        </div>
      </div>
    );
  }

  // ========== DASHBOARD SUPERADMIN ==========
  if (view === 'superadmin' && isSuperAdmin) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui', background: '#0F172A' }}>
        {/* Sidebar */}
        <div style={{ width: '280px', background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)', color: 'white', padding: '40px 24px', borderRight: '2px solid #334155', overflowY: 'auto', maxHeight: '100vh' }}>
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '6px' }}>👑 SuperAdmin</h1>
            <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>Contrôle Total</p>
          </div>
          
          {/* Analytics */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '800', marginBottom: '10px', textTransform: 'uppercase' }}>📊 Analytics</div>
            {[
              ['overview', '📈', 'Vue d\'ensemble'],
              ['analytics', '📊', 'Analytics SaaS'],
              ['revenue', '💰', 'Revenus'],
              ['conversion', '🎯', 'Conversion']
            ].map(([id, icon, label]) => (
              <button key={id} onClick={() => setSuperAdminPage(id)} style={{ width: '100%', padding: '12px 16px', background: superAdminPage === id ? 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)' : 'transparent', color: 'white', border: 'none', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', marginBottom: '6px', fontWeight: superAdminPage === id ? '800' : '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Utilisateurs */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '800', marginBottom: '10px', textTransform: 'uppercase' }}>👥 Utilisateurs</div>
            {[
              ['users', '👤', 'Utilisateurs'],
              ['companies', '🏢', 'Entreprises'],
              ['subscriptions', '💳', 'Abonnements']
            ].map(([id, icon, label]) => (
              <button key={id} onClick={() => setSuperAdminPage(id)} style={{ width: '100%', padding: '12px 16px', background: superAdminPage === id ? 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)' : 'transparent', color: 'white', border: 'none', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', marginBottom: '6px', fontWeight: superAdminPage === id ? '800' : '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Données */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '800', marginBottom: '10px', textTransform: 'uppercase' }}>💼 Données</div>
            {[
              ['candidates', '👨‍💼', 'Candidats'],
              ['missions', '🎯', 'Missions']
            ].map(([id, icon, label]) => (
              <button key={id} onClick={() => setSuperAdminPage(id)} style={{ width: '100%', padding: '12px 16px', background: superAdminPage === id ? 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)' : 'transparent', color: 'white', border: 'none', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', marginBottom: '6px', fontWeight: superAdminPage === id ? '800' : '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Système */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '800', marginBottom: '10px', textTransform: 'uppercase' }}>🛠️ Système</div>
            {[
              ['logs', '📜', 'Logs'],
              ['database', '💾', 'Database']
            ].map(([id, icon, label]) => (
              <button key={id} onClick={() => setSuperAdminPage(id)} style={{ width: '100%', padding: '12px 16px', background: superAdminPage === id ? 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)' : 'transparent', color: 'white', border: 'none', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', marginBottom: '6px', fontWeight: superAdminPage === id ? '800' : '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          <button onClick={() => { setIsSuperAdmin(false); setView('landing'); setSuperAdminPassword(''); }} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '800' }}>
            🚪 Déconnexion
          </button>
        </div>

        {/* Contenu */}
        <div style={{ flex: 1, background: '#0F172A', padding: '50px', overflowY: 'auto', maxHeight: '100vh' }}>
          
          {/* Vue d'ensemble */}
          {superAdminPage === 'overview' && (
            <div>
              <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '40px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                📊 Vue d\'ensemble
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                {[
                  ['👥', 'Utilisateurs', platformStats.totalUsers, '#667EEA'],
                  ['✅', 'Actifs', platformStats.activeUsers, '#10B981'],
                  ['📊', 'Sessions', platformStats.totalSessions, '#F59E0B'],
                  ['💰', 'Revenu', platformStats.totalRevenu, '#FF6B9D']
                ].map(([icon, label, value, color], i) => (
                  <div key={i} style={{ padding: '32px', background: '#1E293B', borderRadius: '20px', border: '2px solid #334155', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontSize: '36px', fontWeight: '900', color: color }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Utilisateurs */}
          {/* ========== UTILISATEURS - VUE LISTE ========== */}
          {superAdminPage === 'users' && !selectedUser && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '48px', fontWeight: '900', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                  👥 Utilisateurs ({demoUsers.length})
                </h2>
                <button onClick={() => {
                  const csv = 'Prenom,Nom,Email,Tel,Role,Entreprise,Plan,Sessions,Candidats,Missions,IP,Derniere_Connexion\n' + demoUsers.map(u => `${u.firstName},${u.lastName},${u.email},${u.phone},${u.role},${u.company},${u.plan},${u.sessions},${u.totalCandidates},${u.totalMissions},${u.ip},${u.lastLogin}`).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'utilisateurs_export.csv';
                  a.click();
                  alert('✅ Export CSV créé!');
                }} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '14px' }}>
                  📥 Export CSV
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                {demoUsers.map(user => (
                  <div key={user.id} onClick={() => setSelectedUser(user)} style={{ background: '#1E293B', padding: '32px', borderRadius: '20px', border: '2px solid #334155', cursor: 'pointer', transition: 'all 0.3s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#667EEA'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.boxShadow = 'none'; }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <div>
                        <div style={{ fontSize: '22px', fontWeight: '900', color: 'white', marginBottom: '6px' }}>{user.firstName} {user.lastName}</div>
                        <div style={{ fontSize: '14px', color: '#94A3B8' }}>{user.role} • {user.company}</div>
                      </div>
                      <span style={{ padding: '8px 16px', background: user.plan === 'Enterprise' ? '#8B5CF6' : user.plan === 'Pro' ? '#667EEA' : '#10B981', color: 'white', borderRadius: '10px', fontSize: '13px', fontWeight: '800', height: 'fit-content' }}>
                        {user.plan}
                      </span>
                    </div>

                    <div style={{ padding: '20px', background: '#0F172A', borderRadius: '12px', marginBottom: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', fontSize: '13px' }}>
                        <div><span style={{ color: '#64748B', fontWeight: '600' }}>📧 Email:</span><div style={{ color: '#667EEA', fontWeight: '700', marginTop: '4px', fontSize: '12px' }}>{user.email}</div></div>
                        <div><span style={{ color: '#64748B', fontWeight: '600' }}>📞 Tel:</span><div style={{ color: 'white', fontWeight: '700', marginTop: '4px' }}>{user.phone}</div></div>
                        <div><span style={{ color: '#64748B', fontWeight: '600' }}>🔢 Sessions:</span><div style={{ color: 'white', fontWeight: '700', marginTop: '4px' }}>{user.sessions}</div></div>
                        <div><span style={{ color: '#64748B', fontWeight: '600' }}>🌐 IP:</span><div style={{ color: '#8B5CF6', fontWeight: '700', marginTop: '4px', fontSize: '11px' }}>{user.ip}</div></div>
                      </div>
                    </div>

                    <div style={{ padding: '16px', background: '#0F172A', borderRadius: '12px', marginBottom: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '12px' }}>
                        <div><span style={{ color: '#64748B', fontWeight: '600' }}>👨‍💼 Candidats:</span><div style={{ color: '#10B981', fontWeight: '900', marginTop: '4px', fontSize: '18px' }}>{user.totalCandidates}</div></div>
                        <div><span style={{ color: '#64748B', fontWeight: '600' }}>🎯 Missions:</span><div style={{ color: '#F59E0B', fontWeight: '900', marginTop: '4px', fontSize: '18px' }}>{user.totalMissions}</div></div>
                        <div><span style={{ color: '#64748B', fontWeight: '600' }}>🔐 Mot de passe:</span><div style={{ color: '#F59E0B', fontWeight: '700', marginTop: '4px', fontFamily: 'monospace' }}>{user.password}</div></div>
                      </div>
                    </div>

                    <div style={{ fontSize: '14px', color: '#667EEA', fontWeight: '800', textAlign: 'center', padding: '12px', background: '#667EEA15', borderRadius: '10px', border: '2px solid #667EEA40' }}>
                      👁️ Cliquer pour voir la fiche complète et modifier →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== UTILISATEURS - VUE DÉTAILLÉE ========== */}
          {superAdminPage === 'users' && selectedUser && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <button onClick={() => { setSelectedUser(null); setUserEditMode(false); setEditedUserData(null); setUserDetailView(null); }} style={{ padding: '12px 24px', background: '#374151', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                    ← Retour
                  </button>
                  <h2 style={{ fontSize: '42px', fontWeight: '900', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h2>
                </div>
                <button onClick={() => {
                  if (!userEditMode) {
                    setUserEditMode(true);
                    setEditedUserData({...selectedUser});
                  } else {
                    alert('✅ Modifications sauvegardées!');
                    setUserEditMode(false);
                  }
                }} style={{ padding: '14px 28px', background: userEditMode ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '14px' }}>
                  {userEditMode ? '💾 Sauvegarder' : '✏️ Mode Edition'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px' }}>
                {/* Colonne 1: Informations Personnelles */}
                <div style={{ background: '#1E293B', padding: '32px', borderRadius: '20px', border: '2px solid #334155' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#667EEA', marginBottom: '24px' }}>👤 Informations Personnelles</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Prénom */}
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px', fontWeight: '700' }}>PRÉNOM</div>
                      {userEditMode ? (
                        <input type="text" value={editedUserData ? editedUserData.firstName : selectedUser.firstName} onChange={(e) => setEditedUserData({...editedUserData, firstName: e.target.value})} style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #667EEA', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '800' }} />
                      ) : (
                        <div style={{ fontSize: '18px', fontWeight: '900', color: 'white' }}>{selectedUser.firstName}</div>
                      )}
                    </div>

                    {/* Nom */}
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px', fontWeight: '700' }}>NOM</div>
                      {userEditMode ? (
                        <input type="text" value={editedUserData ? editedUserData.lastName : selectedUser.lastName} onChange={(e) => setEditedUserData({...editedUserData, lastName: e.target.value})} style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #667EEA', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '800' }} />
                      ) : (
                        <div style={{ fontSize: '18px', fontWeight: '900', color: 'white' }}>{selectedUser.lastName}</div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px', fontWeight: '700' }}>EMAIL</div>
                      {userEditMode ? (
                        <input type="email" value={editedUserData ? editedUserData.email : selectedUser.email} onChange={(e) => setEditedUserData({...editedUserData, email: e.target.value})} style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #667EEA', borderRadius: '8px', color: '#667EEA', fontSize: '14px', fontWeight: '800' }} />
                      ) : (
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#667EEA' }}>{selectedUser.email}</div>
                      )}
                    </div>

                    {/* Téléphone */}
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px', fontWeight: '700' }}>TÉLÉPHONE</div>
                      {userEditMode ? (
                        <input type="tel" value={editedUserData ? editedUserData.phone : selectedUser.phone} onChange={(e) => setEditedUserData({...editedUserData, phone: e.target.value})} style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #10B981', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '800' }} />
                      ) : (
                        <div style={{ fontSize: '18px', fontWeight: '900', color: 'white' }}>{selectedUser.phone}</div>
                      )}
                    </div>

                    {/* Rôle */}
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px', fontWeight: '700' }}>RÔLE</div>
                      {userEditMode ? (
                        <select value={editedUserData ? editedUserData.role : selectedUser.role} onChange={(e) => setEditedUserData({...editedUserData, role: e.target.value})} style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #8B5CF6', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '800' }}>
                          <option value="Admin">👑 Admin</option>
                          <option value="RH Manager">👥 RH Manager</option>
                          <option value="Recruteur">🎯 Recruteur</option>
                          <option value="Talent Acquisition">✨ Talent Acquisition</option>
                          <option value="CEO">💼 CEO</option>
                        </select>
                      ) : (
                        <div style={{ fontSize: '18px', fontWeight: '900', color: 'white' }}>{selectedUser.role}</div>
                      )}
                    </div>

                    {/* Mot de passe */}
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px', fontWeight: '700' }}>MOT DE PASSE</div>
                      {userEditMode ? (
                        <input type="text" value={editedUserData ? editedUserData.password : selectedUser.password} onChange={(e) => setEditedUserData({...editedUserData, password: e.target.value})} style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #F59E0B', borderRadius: '8px', color: '#F59E0B', fontSize: '14px', fontFamily: 'monospace', fontWeight: '800' }} />
                      ) : (
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#F59E0B', fontFamily: 'monospace' }}>{selectedUser.password}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Colonne 2: Entreprise & Plan */}
                <div style={{ background: '#1E293B', padding: '32px', borderRadius: '20px', border: '2px solid #334155' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#10B981', marginBottom: '24px' }}>🏢 Entreprise & Plan</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Entreprise */}
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px', fontWeight: '700' }}>ENTREPRISE</div>
                      {userEditMode ? (
                        <select value={editedUserData ? editedUserData.company : selectedUser.company} onChange={(e) => {
                          if (e.target.value === '__new__') {
                            const newCompany = prompt('Nom de la nouvelle entreprise:');
                            if (newCompany) setEditedUserData({...editedUserData, company: newCompany});
                          } else {
                            setEditedUserData({...editedUserData, company: e.target.value});
                          }
                        }} style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #10B981', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '800' }}>
                          {Array.from(new Set(demoUsers.map(u => u.company))).map(company => (
                            <option key={company} value={company}>{company}</option>
                          ))}
                          <option value="__new__">➕ Créer nouvelle entreprise</option>
                        </select>
                      ) : (
                        <div style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>{selectedUser.company}</div>
                      )}
                    </div>

                    {/* Plan */}
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px', fontWeight: '700' }}>PLAN</div>
                      {userEditMode ? (
                        <select value={editedUserData ? editedUserData.plan : selectedUser.plan} onChange={(e) => setEditedUserData({...editedUserData, plan: e.target.value})} style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #8B5CF6', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '800' }}>
                          <option value="Starter">🚀 Starter</option>
                          <option value="Pro">⭐ Pro</option>
                          <option value="Enterprise">👑 Enterprise</option>
                        </select>
                      ) : (
                        <div style={{ display: 'inline-block', padding: '10px 20px', background: selectedUser.plan === 'Enterprise' ? '#8B5CF6' : selectedUser.plan === 'Pro' ? '#667EEA' : '#10B981', borderRadius: '10px', fontSize: '16px', fontWeight: '900', color: 'white' }}>
                          {selectedUser.plan}
                        </div>
                      )}
                    </div>

                    {/* Localisation */}
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px', fontWeight: '700' }}>LOCALISATION</div>
                      {userEditMode ? (
                        <input type="text" value={editedUserData && editedUserData.location ? editedUserData.location : (selectedUser.location || '')} onChange={(e) => setEditedUserData({...editedUserData, location: e.target.value})} placeholder="ex: Paris, France" style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #10B981', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '800' }} />
                      ) : (
                        <div style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>{selectedUser.location || 'Non défini'}</div>
                      )}
                    </div>

                    {/* KPIs Cliquables */}
                    <div style={{ marginTop: '20px' }}>
                      <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#FF6B9D', marginBottom: '16px' }}>📊 Activité (Cliquez pour détails)</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        {[
                          {label: 'Sessions', value: selectedUser.sessions, color: '#667EEA', view: 'sessions'},
                          {label: 'Candidats', value: selectedUser.totalCandidates, color: '#10B981', view: 'candidats'},
                          {label: 'Missions', value: selectedUser.totalMissions, color: '#F59E0B', view: 'missions'},
                          {label: 'IP', value: selectedUser.ip, color: '#8B5CF6', view: null}
                        ].map((stat, i) => (
                          <div key={i} onClick={() => stat.view && setUserDetailView(userDetailView === stat.view ? null : stat.view)} style={{ padding: '16px', background: userDetailView === stat.view ? stat.color : '#0F172A', borderRadius: '10px', textAlign: 'center', border: `2px solid ${stat.color}40`, cursor: stat.view ? 'pointer' : 'default', transition: 'all 0.3s' }}
                            onMouseEnter={(e) => { if (stat.view) { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.borderColor = stat.color; }}}
                            onMouseLeave={(e) => { if (stat.view) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = `${stat.color}40`; }}}>
                            <div style={{ fontSize: '20px', fontWeight: '900', color: userDetailView === stat.view ? 'white' : stat.color, marginBottom: '4px' }}>{stat.value}</div>
                            <div style={{ fontSize: '10px', color: userDetailView === stat.view ? 'white' : '#64748B', fontWeight: '700' }}>{stat.label}</div>
                            {stat.view && <div style={{ fontSize: '9px', color: userDetailView === stat.view ? 'white' : '#64748B', marginTop: '4px' }}>👁️ {userDetailView === stat.view ? 'Masquer' : 'Voir'}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* VUE DÉTAIL: SESSIONS */}
              {userDetailView === 'sessions' && (
                <div style={{ background: '#1E293B', padding: '32px', borderRadius: '20px', border: '2px solid #667EEA', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#667EEA', margin: 0 }}>📊 Sessions de {selectedUser.firstName}</h3>
                    <button onClick={() => {
                      const csv = 'Date,Duree,Device,Pages_Vues,IP\n2026-02-06 09:15,2h 34min,Chrome Desktop,47,'+selectedUser.ip+'\n2026-02-05 14:22,1h 18min,Safari Mobile,23,'+selectedUser.ip+'\n2026-02-04 10:05,3h 12min,Chrome Desktop,65,'+selectedUser.ip+'\n2026-02-03 16:45,45min,Firefox,12,'+selectedUser.ip+'\n2026-02-01 11:30,2h 05min,Chrome Desktop,38,'+selectedUser.ip;
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `sessions_${selectedUser.firstName}_${selectedUser.lastName}.csv`;
                      a.click();
                      alert('✅ Export sessions créé!');
                    }} style={{ padding: '12px 24px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800' }}>
                      📥 Export CSV
                    </button>
                  </div>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {[
                      {date: '2026-02-06 09:15', duree: '2h 34min', device: 'Chrome Desktop', pages: 47},
                      {date: '2026-02-05 14:22', duree: '1h 18min', device: 'Safari Mobile', pages: 23},
                      {date: '2026-02-04 10:05', duree: '3h 12min', device: 'Chrome Desktop', pages: 65},
                      {date: '2026-02-03 16:45', duree: '45min', device: 'Firefox', pages: 12},
                      {date: '2026-02-01 11:30', duree: '2h 05min', device: 'Chrome Desktop', pages: 38}
                    ].map((session, i) => (
                      <div key={i} style={{ padding: '16px', background: '#0F172A', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', alignItems: 'center' }}>
                        <div><span style={{ color: '#64748B', fontSize: '11px' }}>DATE</span><div style={{ color: 'white', fontWeight: '700', fontSize: '13px', marginTop: '4px' }}>{session.date}</div></div>
                        <div><span style={{ color: '#64748B', fontSize: '11px' }}>DURÉE</span><div style={{ color: '#667EEA', fontWeight: '900', fontSize: '16px', marginTop: '4px' }}>{session.duree}</div></div>
                        <div><span style={{ color: '#64748B', fontSize: '11px' }}>DEVICE</span><div style={{ color: 'white', fontWeight: '700', fontSize: '13px', marginTop: '4px' }}>{session.device}</div></div>
                        <div><span style={{ color: '#64748B', fontSize: '11px' }}>PAGES</span><div style={{ color: '#10B981', fontWeight: '900', fontSize: '16px', marginTop: '4px' }}>{session.pages}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VUE DÉTAIL: CANDIDATS */}
              {userDetailView === 'candidats' && (
                <div style={{ background: '#1E293B', padding: '32px', borderRadius: '20px', border: '2px solid #10B981', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#10B981', margin: 0 }}>👨‍💼 Candidats de {selectedUser.firstName}</h3>
                    <button onClick={() => {
                      const csv = 'Nom,Position,Email,Statut\n' + candidates.slice(0, selectedUser.totalCandidates).map(c => `${c.name},${c.position},${c.email},${c.status}`).join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `candidats_${selectedUser.firstName}_${selectedUser.lastName}.csv`;
                      a.click();
                      alert('✅ Export candidats créé!');
                    }} style={{ padding: '12px 24px', background: '#10B981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800' }}>
                      📥 Export CSV
                    </button>
                  </div>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {candidates.slice(0, selectedUser.totalCandidates).map(c => (
                      <div key={c.id} style={{ padding: '16px', background: '#0F172A', borderRadius: '10px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ fontSize: '32px' }}>{c.avatar}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '16px', fontWeight: '900', color: 'white' }}>{c.name}</div>
                          <div style={{ fontSize: '13px', color: '#94A3B8' }}>{c.position}</div>
                        </div>
                        <div style={{ padding: '6px 12px', background: c.status === 'Entretien' ? '#F59E0B' : c.status === 'Présélectionné' ? '#667EEA' : '#10B981', color: 'white', borderRadius: '8px', fontSize: '11px', fontWeight: '800' }}>
                          {c.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VUE DÉTAIL: MISSIONS */}
              {userDetailView === 'missions' && (
                <div style={{ background: '#1E293B', padding: '32px', borderRadius: '20px', border: '2px solid #F59E0B' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#F59E0B', margin: 0 }}>🎯 Missions de {selectedUser.firstName}</h3>
                    <button onClick={() => {
                      const csv = 'Titre,Client,Localisation,Salaire,Statut\n' + missions.slice(0, selectedUser.totalMissions).map(m => `${m.title},${m.client},${m.location},${m.salary},${m.status}`).join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `missions_${selectedUser.firstName}_${selectedUser.lastName}.csv`;
                      a.click();
                      alert('✅ Export missions créé!');
                    }} style={{ padding: '12px 24px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800' }}>
                      📥 Export CSV
                    </button>
                  </div>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {missions.slice(0, selectedUser.totalMissions).map(m => (
                      <div key={m.id} style={{ padding: '16px', background: '#0F172A', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                          <div style={{ fontSize: '32px' }}>{m.emoji}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '18px', fontWeight: '900', color: 'white', marginBottom: '6px' }}>{m.title}</div>
                            <div style={{ fontSize: '13px', color: '#94A3B8' }}>{m.client} • {m.location}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                          <div style={{ fontSize: '16px', fontWeight: '900', color: '#10B981' }}>{m.salary}</div>
                          <div style={{ padding: '6px 12px', background: m.status === 'Ouverte' ? '#10B981' : '#F59E0B', color: 'white', borderRadius: '8px', fontSize: '11px', fontWeight: '800' }}>
                            {m.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}


          {/* ENTREPRISES */}
          {superAdminPage === 'companies' && !selectedCompany && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '42px', fontWeight: '900', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                  🏢 Entreprises Clientes
                </h2>
                <button onClick={() => {
                  const csv = 'Entreprise,Contact,Email,Plan,MRR,Sessions,Candidats,Missions,Status\n' + 
                    demoUsers.map(u => `${u.company},${u.firstName} ${u.lastName},${u.email},${u.plan},${u.plan === 'Enterprise' ? '4800' : u.plan === 'Pro' ? '1800' : '980'}€,${u.sessions},${u.totalCandidates},${u.totalMissions},${u.status}`).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'entreprises_export.csv';
                  a.click();
                  alert('✅ Export CSV créé!');
                }} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '14px' }}>
                  📥 Export CSV
                </button>
              </div>

              {/* Stats Globales */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                  { label: 'Total Entreprises', value: demoUsers.length, icon: '🏢', color: '#667EEA' },
                  { label: 'Actives', value: demoUsers.filter(u => u.status === 'active').length, icon: '✓', color: '#10B981' },
                  { label: 'MRR Total', value: demoUsers.reduce((sum, u) => sum + (u.plan === 'Enterprise' ? 4800 : u.plan === 'Pro' ? 1800 : 980), 0) + '€', icon: '💰', color: '#F59E0B' },
                  { label: 'Candidats Total', value: demoUsers.reduce((sum, u) => sum + u.totalCandidates, 0), icon: '👥', color: '#FF6B9D' },
                  { label: 'Missions Total', value: demoUsers.reduce((sum, u) => sum + u.totalMissions, 0), icon: '🎯', color: '#8B5CF6' }
                ].map((stat, i) => (
                  <div key={i} style={{ padding: '20px', background: '#1E293B', borderRadius: '12px', border: `2px solid ${stat.color}`, textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.icon}</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Liste Entreprises - CLIQUABLE */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                {demoUsers.map(user => {
                  const companyUsers = demoUsers.filter(u => u.company === user.company);
                  return (
                    <div key={user.id} onClick={() => setSelectedCompany(user)} style={{ background: '#1E293B', padding: '32px', borderRadius: '20px', border: '2px solid #334155', transition: 'all 0.3s', cursor: 'pointer' }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#667EEA'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.3)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.boxShadow = 'none'; }}>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px', paddingBottom: '20px', borderBottom: '2px solid #334155' }}>
                        <div>
                          <div style={{ fontSize: '28px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>{user.company}</div>
                          <div style={{ fontSize: '15px', color: '#94A3B8', marginBottom: '4px' }}>📍 {user.location}</div>
                          <div style={{ fontSize: '13px', color: '#64748B' }}>Inscrit le {user.signupDate.split(' ')[0]}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ padding: '10px 20px', background: user.plan === 'Enterprise' ? '#8B5CF6' : user.plan === 'Pro' ? '#667EEA' : '#10B981', borderRadius: '12px', marginBottom: '10px' }}>
                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px', fontWeight: '700' }}>PLAN {user.plan.toUpperCase()}</div>
                            <div style={{ fontSize: '24px', fontWeight: '900', color: 'white' }}>
                              {user.plan === 'Enterprise' ? '4800€' : user.plan === 'Pro' ? '1800€' : '980€'}/mois
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '20px' }}>
                        {[
                          { label: 'Sessions', value: user.sessions, icon: '🔄', color: '#667EEA' },
                          { label: 'Utilisateurs', value: companyUsers.length, icon: '👥', color: '#10B981' },
                          { label: 'Candidats', value: user.totalCandidates, icon: '👨‍💼', color: '#F59E0B' },
                          { label: 'Missions', value: user.totalMissions, icon: '🎯', color: '#FF6B9D' },
                          { label: 'Applications', value: user.totalCandidates * 2, icon: '📝', color: '#8B5CF6' },
                          { label: 'Taux Succès', value: '68%', icon: '✓', color: '#3B82F6' }
                        ].map((stat, i) => (
                          <div key={i} style={{ padding: '16px', background: '#0F172A', borderRadius: '10px', textAlign: 'center', border: `2px solid ${stat.color}20` }}>
                            <div style={{ fontSize: '24px', marginBottom: '6px' }}>{stat.icon}</div>
                            <div style={{ fontSize: '20px', fontWeight: '900', color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
                            <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '700' }}>{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ fontSize: '14px', color: '#667EEA', fontWeight: '800', textAlign: 'center', padding: '14px', background: '#667EEA15', borderRadius: '12px', border: '2px solid #667EEA40' }}>
                        👁️ Cliquer pour voir la fiche complète et gérer les utilisateurs →
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VUE DÉTAILLÉE ENTREPRISE AVEC ÉDITION */}
          {superAdminPage === 'companies' && selectedCompany && (
            <div>
              {/* Header avec retour */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <button onClick={() => { setSelectedCompany(null); setCompanyEditMode(false); setEditedCompanyData(null); }} style={{ padding: '12px 24px', background: '#374151', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                    ← Retour
                  </button>
                  <h2 style={{ fontSize: '42px', fontWeight: '900', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                    {selectedCompany.company}
                  </h2>
                </div>
                <button onClick={() => { 
                  setCompanyEditMode(!companyEditMode); 
                  if (!companyEditMode) setEditedCompanyData({...selectedCompany});
                  else { setDemoUsers(demoUsers.map(u => u.id === selectedCompany.id ? editedCompanyData : u)); setSelectedCompany(editedCompanyData); setCompanyEditMode(false); alert('✅ Modifications sauvegardées!'); }
                }} style={{ padding: '14px 28px', background: companyEditMode ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '14px' }}>
                  {companyEditMode ? '💾 Sauvegarder' : '✏️ Mode Édition'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                {/* Informations Générales */}
                <div style={{ background: '#1E293B', padding: '32px', borderRadius: '20px', border: '2px solid #334155' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#667EEA', marginBottom: '24px' }}>🏢 Informations Générales</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px', fontWeight: '700' }}>NOM ENTREPRISE</div>
                      {companyEditMode ? (
                        <input type="text" value={editedCompanyData.company} onChange={(e) => setEditedCompanyData({...editedCompanyData, company: e.target.value})} style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #667EEA', borderRadius: '8px', color: 'white', fontSize: '16px', fontWeight: '800' }} />
                      ) : (
                        <div style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>{selectedCompany.company}</div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px', fontWeight: '700' }}>LOCALISATION</div>
                      {companyEditMode ? (
                        <input type="text" value={editedCompanyData.location} onChange={(e) => setEditedCompanyData({...editedCompanyData, location: e.target.value})} style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #667EEA', borderRadius: '8px', color: 'white', fontSize: '14px' }} />
                      ) : (
                        <div style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>{selectedCompany.location}</div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px', fontWeight: '700' }}>PLAN</div>
                      {companyEditMode ? (
                        <select value={editedCompanyData.plan} onChange={(e) => setEditedCompanyData({...editedCompanyData, plan: e.target.value})} style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #667EEA', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '800' }}>
                          <option value="Starter">Starter - 980€/mois</option>
                          <option value="Pro">Pro - 1800€/mois</option>
                          <option value="Enterprise">Enterprise - 4800€/mois</option>
                        </select>
                      ) : (
                        <div style={{ display: 'inline-block', padding: '10px 20px', background: selectedCompany.plan === 'Enterprise' ? '#8B5CF6' : selectedCompany.plan === 'Pro' ? '#667EEA' : '#10B981', borderRadius: '10px', fontSize: '16px', fontWeight: '900', color: 'white' }}>
                          {selectedCompany.plan}
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px', fontWeight: '700' }}>STATUT</div>
                      {companyEditMode ? (
                        <select value={editedCompanyData.status} onChange={(e) => setEditedCompanyData({...editedCompanyData, status: e.target.value})} style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #667EEA', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '800' }}>
                          <option value="active">Actif</option>
                          <option value="inactive">Inactif</option>
                          <option value="suspended">Suspendu</option>
                        </select>
                      ) : (
                        <div style={{ display: 'inline-block', padding: '8px 16px', background: selectedCompany.status === 'active' ? '#10B981' : '#EF4444', borderRadius: '8px', fontSize: '14px', fontWeight: '800', color: 'white' }}>
                          {selectedCompany.status === 'active' ? '✓ ACTIF' : '✕ INACTIF'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statistiques */}
                <div style={{ background: '#1E293B', padding: '32px', borderRadius: '20px', border: '2px solid #334155' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#10B981', marginBottom: '24px' }}>📊 Statistiques</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {[
                      { label: 'Sessions', value: selectedCompany.sessions, icon: '🔄', color: '#667EEA' },
                      { label: 'Connexions', value: selectedCompany.sessions * 2, icon: '🔗', color: '#3B82F6' },
                      { label: 'Candidats', value: selectedCompany.totalCandidates, icon: '👥', color: '#10B981' },
                      { label: 'Missions', value: selectedCompany.totalMissions, icon: '🎯', color: '#F59E0B' }
                    ].map((stat, i) => (
                      <div key={i} style={{ padding: '20px', background: '#0F172A', borderRadius: '12px', textAlign: 'center', border: `2px solid ${stat.color}40` }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.icon}</div>
                        <div style={{ fontSize: '28px', fontWeight: '900', color: stat.color, marginBottom: '6px' }}>{stat.value}</div>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* UTILISATEURS DE L'ENTREPRISE */}
              <div style={{ marginTop: '32px', background: '#1E293B', padding: '32px', borderRadius: '20px', border: '2px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#FF6B9D', margin: 0 }}>👥 Utilisateurs de {selectedCompany.company}</h3>
                  <button onClick={() => setShowAddUserModal(true)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '13px' }}>
                    ➕ Ajouter Utilisateur
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  {demoUsers.filter(u => u.company === selectedCompany.company).map(user => (
                    <div key={user.id} style={{ background: '#0F172A', padding: '24px', borderRadius: '16px', border: selectedUserForEdit === user.id ? '2px solid #667EEA' : '2px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                        <div>
                          {selectedUserForEdit === user.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <input type="text" placeholder="Prénom" value={user.firstName} onChange={(e) => setDemoUsers(demoUsers.map(u => u.id === user.id ? {...u, firstName: e.target.value} : u))} style={{ padding: '10px', background: '#1E293B', border: '2px solid #667EEA', borderRadius: '8px', color: 'white', fontSize: '16px', fontWeight: '800' }} />
                              <input type="text" placeholder="Nom" value={user.lastName} onChange={(e) => setDemoUsers(demoUsers.map(u => u.id === user.id ? {...u, lastName: e.target.value} : u))} style={{ padding: '10px', background: '#1E293B', border: '2px solid #667EEA', borderRadius: '8px', color: 'white', fontSize: '16px', fontWeight: '800' }} />
                            </div>
                          ) : (
                            <div style={{ fontSize: '20px', fontWeight: '900', color: 'white', marginBottom: '6px' }}>{user.firstName} {user.lastName}</div>
                          )}
                          {!selectedUserForEdit && <div style={{ fontSize: '14px', color: '#94A3B8' }}>{user.role}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {selectedUserForEdit === user.id ? (
                            <>
                              <button onClick={() => { setSelectedUserForEdit(null); alert('✅ Modifications sauvegardées!'); }} style={{ padding: '8px 16px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '12px' }}>
                                💾 Sauvegarder
                              </button>
                              <button onClick={() => setSelectedUserForEdit(null)} style={{ padding: '8px 16px', background: '#6B7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '12px' }}>
                                ✕ Annuler
                              </button>
                            </>
                          ) : (
                            <button onClick={() => setSelectedUserForEdit(user.id)} style={{ padding: '8px 16px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '12px' }}>
                              ✏️ Modifier
                            </button>
                          )}
                        </div>
                      </div>

                      {selectedUserForEdit === user.id ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                          <div>
                            <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>EMAIL</div>
                            <input type="email" value={user.email} onChange={(e) => setDemoUsers(demoUsers.map(u => u.id === user.id ? {...u, email: e.target.value} : u))} style={{ width: '100%', padding: '10px', background: '#1E293B', border: '2px solid #667EEA', borderRadius: '8px', color: 'white', fontSize: '13px' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>TÉLÉPHONE</div>
                            <input type="tel" value={user.phone} onChange={(e) => setDemoUsers(demoUsers.map(u => u.id === user.id ? {...u, phone: e.target.value} : u))} style={{ width: '100%', padding: '10px', background: '#1E293B', border: '2px solid #667EEA', borderRadius: '8px', color: 'white', fontSize: '13px' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>RÔLE</div>
                            <input type="text" value={user.role} onChange={(e) => setDemoUsers(demoUsers.map(u => u.id === user.id ? {...u, role: e.target.value} : u))} style={{ width: '100%', padding: '10px', background: '#1E293B', border: '2px solid #667EEA', borderRadius: '8px', color: 'white', fontSize: '13px' }} />
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '13px' }}>
                          <div>
                            <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>EMAIL</div>
                            <div style={{ color: '#667EEA', fontWeight: '700' }}>{user.email}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>TÉLÉPHONE</div>
                            <div style={{ color: 'white', fontWeight: '700' }}>{user.phone}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>SESSIONS</div>
                            <div style={{ color: '#10B981', fontWeight: '900' }}>{user.sessions}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABONNEMENTS */}
          {superAdminPage === 'subscriptions' && (
            <div>
              <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '40px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>💳 Abonnements</h2>
              <div style={{ background: '#1E293B', padding: '28px', borderRadius: '16px', border: '2px solid #334155' }}>
                {demoUsers.filter(u => u.plan !== 'Trial').map(user => (
                  <div key={user.id} style={{ padding: '20px', background: '#0F172A', borderRadius: '12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: 'white', marginBottom: '4px' }}>{user.company}</div>
                      <div style={{ fontSize: '13px', color: '#94A3B8' }}>{user.email}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ padding: '6px 16px', background: user.plan === 'Enterprise' ? '#8B5CF6' : '#667EEA', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: '900', marginBottom: '6px' }}>{user.plan}</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#10B981' }}>
                        {user.plan === 'Enterprise' ? '4800€' : user.plan === 'Pro' ? '1800€' : '980€'}/mois
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODAL AJOUT UTILISATEUR */}
          {showAddUserModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowAddUserModal(false)}>
              <div onClick={(e) => e.stopPropagation()} style={{ background: '#1E293B', padding: '40px', borderRadius: '20px', border: '2px solid #667EEA', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#667EEA', margin: 0 }}>➕ Ajouter un Utilisateur</h3>
                  <button onClick={() => setShowAddUserModal(false)} style={{ padding: '8px 16px', background: '#374151', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
                    ✕ Fermer
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Prénom */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '8px', fontWeight: '700' }}>PRÉNOM *</label>
                    <input 
                      type="text" 
                      value={newUserData.firstName} 
                      onChange={(e) => setNewUserData({...newUserData, firstName: e.target.value})}
                      placeholder="ex: Marie"
                      style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #334155', borderRadius: '8px', color: 'white', fontSize: '14px' }}
                    />
                  </div>

                  {/* Nom */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '8px', fontWeight: '700' }}>NOM *</label>
                    <input 
                      type="text" 
                      value={newUserData.lastName} 
                      onChange={(e) => setNewUserData({...newUserData, lastName: e.target.value})}
                      placeholder="ex: Dubois"
                      style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #334155', borderRadius: '8px', color: 'white', fontSize: '14px' }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '8px', fontWeight: '700' }}>EMAIL *</label>
                    <input 
                      type="email" 
                      value={newUserData.email} 
                      onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                      placeholder="ex: marie@entreprise.com"
                      style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #667EEA', borderRadius: '8px', color: '#667EEA', fontSize: '14px' }}
                    />
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '8px', fontWeight: '700' }}>TÉLÉPHONE</label>
                    <input 
                      type="tel" 
                      value={newUserData.phone} 
                      onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})}
                      placeholder="ex: +33612345678"
                      style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #334155', borderRadius: '8px', color: 'white', fontSize: '14px' }}
                    />
                  </div>

                  {/* Mot de passe */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '8px', fontWeight: '700' }}>MOT DE PASSE *</label>
                    <input 
                      type="text" 
                      value={newUserData.password} 
                      onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                      placeholder="ex: motdepasse123"
                      style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #F59E0B', borderRadius: '8px', color: '#F59E0B', fontSize: '14px', fontFamily: 'monospace' }}
                    />
                  </div>

                  {/* Rôle */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '8px', fontWeight: '700' }}>RÔLE *</label>
                    <select 
                      value={newUserData.role} 
                      onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
                      style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #8B5CF6', borderRadius: '8px', color: 'white', fontSize: '14px' }}
                    >
                      <option value="Admin">👑 Admin</option>
                      <option value="RH Manager">👥 RH Manager</option>
                      <option value="Recruteur">🎯 Recruteur</option>
                      <option value="Talent Acquisition">✨ Talent Acquisition</option>
                      <option value="CEO">💼 CEO</option>
                    </select>
                  </div>

                  {/* Entreprise */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '8px', fontWeight: '700' }}>ENTREPRISE *</label>
                    <select 
                      value={newUserData.company} 
                      onChange={(e) => {
                        if (e.target.value === '__new__') {
                          const newCompany = prompt('Nom de la nouvelle entreprise:');
                          if (newCompany) setNewUserData({...newUserData, company: newCompany});
                        } else {
                          setNewUserData({...newUserData, company: e.target.value});
                        }
                      }}
                      style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #10B981', borderRadius: '8px', color: 'white', fontSize: '14px' }}
                    >
                      <option value="">-- Sélectionner --</option>
                      {Array.from(new Set(demoUsers.map(u => u.company))).map(company => (
                        <option key={company} value={company}>{company}</option>
                      ))}
                      <option value="__new__">➕ Créer nouvelle entreprise</option>
                    </select>
                  </div>

                  {/* Plan */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '8px', fontWeight: '700' }}>PLAN *</label>
                    <select 
                      value={newUserData.plan} 
                      onChange={(e) => setNewUserData({...newUserData, plan: e.target.value})}
                      style={{ width: '100%', padding: '12px', background: '#0F172A', border: '2px solid #8B5CF6', borderRadius: '8px', color: 'white', fontSize: '14px' }}
                    >
                      <option value="Starter">🚀 Starter (Gratuit)</option>
                      <option value="Pro">⭐ Pro (49€/mois)</option>
                      <option value="Enterprise">👑 Enterprise (Sur mesure)</option>
                    </select>
                  </div>

                  {/* Boutons */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button 
                      onClick={() => {
                        // Validation
                        if (!newUserData.firstName || !newUserData.lastName || !newUserData.email || !newUserData.password || !newUserData.company) {
                          alert('❌ Veuillez remplir tous les champs obligatoires (*)');
                          return;
                        }
                        
                        // Créer le nouvel utilisateur
                        const newUser = {
                          id: demoUsers.length + 1,
                          firstName: newUserData.firstName,
                          lastName: newUserData.lastName,
                          email: newUserData.email,
                          password: newUserData.password,
                          phone: newUserData.phone || '+33600000000',
                          role: newUserData.role,
                          company: newUserData.company,
                          plan: newUserData.plan,
                          sessions: 0,
                          totalCandidates: 0,
                          totalMissions: 0,
                          ip: '192.168.1.' + (100 + demoUsers.length),
                          lastLogin: new Date().toISOString().slice(0, 16).replace('T', ' '),
                          signupDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
                          status: 'active',
                          location: 'Non défini',
                          browser: 'Chrome'
                        };
                        
                        // Ajouter à la liste (note: dans une vraie app, ceci ferait un appel API)
                        // AJOUTER L'UTILISATEUR À LA LISTE
                        setDemoUsers([...demoUsers, newUser]);
                        
                        // Confirmation
                        alert(`✅ Utilisateur ${newUser.firstName} ${newUser.lastName} créé avec succès!

📧 Email: ${newUser.email}
🏢 Entreprise: ${newUser.company}
💼 Rôle: ${newUser.role}
⭐ Plan: ${newUser.plan}

✅ L'utilisateur apparaît maintenant dans:
  • Section Utilisateurs (${demoUsers.length + 1} utilisateurs)
  • Section Entreprises > ${newUser.company}
  • Vue Demo (login avec email/password)`);
                        
                        // Réinitialiser le formulaire
                        setNewUserData({firstName: '', lastName: '', email: '', password: '', role: 'Recruteur', phone: '', company: '', plan: 'Starter'});
                        setShowAddUserModal(false);
                      }}
                      style={{ flex: 1, padding: '16px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '16px' }}
                    >
                      ✅ Créer l'Utilisateur
                    </button>
                    <button 
                      onClick={() => {
                        setNewUserData({firstName: '', lastName: '', email: '', password: '', role: 'Recruteur', phone: '', company: '', plan: 'Starter'});
                        setShowAddUserModal(false);
                      }}
                      style={{ flex: 1, padding: '16px', background: '#374151', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '16px' }}
                    >
                      ❌ Annuler
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* CANDIDATS */}
          {superAdminPage === 'candidates' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '42px', fontWeight: '900', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                  👨‍💼 Base Candidats Globale
                </h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => {
                    const csv = 'Nom,Entreprise,Poste,Experience,Status,Email,Phone,Localisation,Salaire,Disponibilite,Source,DateAjout\n' + 
                      globalCandidates.map(c => `${c.name},${c.company},${c.poste},${c.experience},${c.status},${c.email},${c.phone},${c.localisation},${c.salaire},${c.disponibilite},${c.source},${c.dateAjout}`).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'candidats_export.csv';
                    a.click();
                    alert('✅ Export CSV créé!');
                  }} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '14px' }}>
                    📥 Export CSV
                  </button>
                  <button onClick={() => alert('📊 Rapport candidats généré!')} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '14px' }}>
                    📊 Rapport Global
                  </button>
                </div>
              </div>

              {/* Stats Globales */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', marginBottom: '32px' }}>
                {[
                  { label: 'Total Candidats', value: globalCandidates.length, icon: '👥', color: '#667EEA' },
                  { label: 'Ce mois', value: globalCandidates.filter(c => c.dateAjout.startsWith('2026-02')).length, icon: '📅', color: '#10B981' },
                  { label: 'En processus', value: globalCandidates.filter(c => c.status === 'En processus').length, icon: '⏳', color: '#F59E0B' },
                  { label: 'Entretiens', value: globalCandidates.filter(c => c.status === 'Entretien planifié').length, icon: '💼', color: '#FF6B9D' },
                  { label: 'Offres', value: globalCandidates.filter(c => c.status === 'Offre envoyée').length, icon: '✉️', color: '#8B5CF6' },
                  { label: 'Nouveaux', value: globalCandidates.filter(c => c.status === 'Nouveau').length, icon: '✨', color: '#3B82F6' }
                ].map((stat, i) => (
                  <div key={i} style={{ padding: '20px', background: '#1E293B', borderRadius: '12px', border: `2px solid ${stat.color}`, textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Répartition par entreprise */}
              <div style={{ background: '#1E293B', padding: '28px', borderRadius: '16px', border: '2px solid #334155', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '20px' }}>📊 Répartition par Entreprise</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {demoUsers.map(user => {
                    const count = globalCandidates.filter(c => c.company === user.company).length;
                    return (
                      <div key={user.id} style={{ padding: '20px', background: '#0F172A', borderRadius: '12px', border: '2px solid #334155' }}>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>{user.company}</div>
                        <div style={{ fontSize: '32px', fontWeight: '900', color: '#667EEA', marginBottom: '6px' }}>{count}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>candidats</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Liste Candidats Détaillée */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                {globalCandidates.map(candidat => (
                  <div key={candidat.id} style={{ background: '#1E293B', padding: '28px', borderRadius: '20px', border: '2px solid #334155', transition: 'all 0.3s' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#667EEA'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#334155'}>
                    
                    {/* Header Candidat */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px', paddingBottom: '20px', borderBottom: '2px solid #334155' }}>
                      <div>
                        <div style={{ fontSize: '26px', fontWeight: '900', color: 'white', marginBottom: '6px' }}>{candidat.name}</div>
                        <div style={{ fontSize: '16px', color: '#667EEA', fontWeight: '700', marginBottom: '4px' }}>{candidat.poste}</div>
                        <div style={{ fontSize: '13px', color: '#94A3B8' }}>📍 {candidat.localisation} • {candidat.experience} d'expérience</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ padding: '8px 16px', background: 
                          candidat.status === 'Offre envoyée' ? '#8B5CF6' : 
                          candidat.status === 'Entretien planifié' ? '#F59E0B' : 
                          candidat.status === 'En processus' ? '#667EEA' : '#10B981', 
                          borderRadius: '10px', marginBottom: '10px', fontSize: '13px', fontWeight: '800', color: 'white' }}>
                          {candidat.status}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>Ajouté le {candidat.dateAjout}</div>
                      </div>
                    </div>

                    {/* Informations Principales */}
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#10B981', marginBottom: '16px', textTransform: 'uppercase' }}>📋 Informations</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        <div style={{ padding: '14px', background: '#0F172A', borderRadius: '10px' }}>
                          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>ENTREPRISE</div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: 'white' }}>{candidat.company}</div>
                        </div>
                        <div style={{ padding: '14px', background: '#0F172A', borderRadius: '10px' }}>
                          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>EMAIL</div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#667EEA' }}>{candidat.email}</div>
                        </div>
                        <div style={{ padding: '14px', background: '#0F172A', borderRadius: '10px' }}>
                          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>TÉLÉPHONE</div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>{candidat.phone}</div>
                        </div>
                        <div style={{ padding: '14px', background: '#0F172A', borderRadius: '10px' }}>
                          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>CV</div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#10B981' }}>{candidat.cv}</div>
                        </div>
                      </div>
                    </div>

                    {/* Détails Complémentaires */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        <div style={{ padding: '14px', background: '#0F172A', borderRadius: '10px' }}>
                          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>SALAIRE SOUHAITÉ</div>
                          <div style={{ fontSize: '16px', fontWeight: '900', color: '#F59E0B' }}>{candidat.salaire}</div>
                        </div>
                        <div style={{ padding: '14px', background: '#0F172A', borderRadius: '10px' }}>
                          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>DISPONIBILITÉ</div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: 'white' }}>{candidat.disponibilite}</div>
                        </div>
                        <div style={{ padding: '14px', background: '#0F172A', borderRadius: '10px' }}>
                          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>SOURCE</div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#667EEA' }}>{candidat.source}</div>
                        </div>
                        <div style={{ padding: '14px', background: '#0F172A', borderRadius: '10px' }}>
                          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>EXPÉRIENCE</div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: 'white' }}>{candidat.experience}</div>
                        </div>
                      </div>
                    </div>

                    {/* Compétences */}
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#FF6B9D', marginBottom: '12px', textTransform: 'uppercase' }}>🏷️ Compétences</h4>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {candidat.tags.map((tag, i) => (
                          <span key={i} style={{ padding: '8px 16px', background: '#667EEA20', border: '2px solid #667EEA', borderRadius: '20px', fontSize: '12px', fontWeight: '800', color: '#667EEA' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {candidat.notes && (
                      <div style={{ marginBottom: '20px', padding: '16px', background: '#F59E0B10', border: '2px solid #F59E0B40', borderRadius: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#F59E0B', fontWeight: '700', marginBottom: '6px' }}>📝 NOTES</div>
                        <div style={{ fontSize: '14px', color: '#FDE68A' }}>{candidat.notes}</div>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                      <button onClick={() => { navigator.clipboard.writeText(candidat.email); alert('✅ Email copié!'); }} style={{ padding: '12px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '12px' }}>
                        📧 Email
                      </button>
                      <button onClick={() => { navigator.clipboard.writeText(candidat.phone); alert('✅ Téléphone copié!'); }} style={{ padding: '12px', background: '#10B981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '12px' }}>
                        📞 Tél
                      </button>
                      <button onClick={() => alert(`📄 Téléchargement CV: ${candidat.cv}`)} style={{ padding: '12px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '12px' }}>
                        📄 CV
                      </button>
                      <button onClick={() => alert(`📅 Entretien planifié avec ${candidat.name}`)} style={{ padding: '12px', background: '#FF6B9D', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '12px' }}>
                        📅 RDV
                      </button>
                      <button onClick={() => {
                        const info = `Nom: ${candidat.name}\nPoste: ${candidat.poste}\nEmail: ${candidat.email}\nPhone: ${candidat.phone}\nExp: ${candidat.experience}\nSalaire: ${candidat.salaire}`;
                        navigator.clipboard.writeText(info);
                        alert('✅ Toutes les infos copiées!');
                      }} style={{ padding: '12px', background: '#8B5CF6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '12px' }}>
                        📋 Copier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MISSIONS */}
          {superAdminPage === 'missions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '42px', fontWeight: '900', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                  🎯 Missions Globales
                </h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => {
                    const csv = 'Titre,Entreprise,Localisation,Type,Salaire,Status,Urgence,DateCreation,DateLimite,Candidatures,Vues,Secteur,Experience\n' + 
                      globalMissions.map(m => `${m.titre},${m.company},${m.localisation},${m.type},${m.salaire},${m.status},${m.urgence},${m.dateCreation},${m.dateLimit},${m.candidatures},${m.vues},${m.secteur},${m.experience}`).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'missions_export.csv';
                    a.click();
                    alert('✅ Export CSV créé!');
                  }} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '14px' }}>
                    📥 Export CSV
                  </button>
                  <button onClick={() => alert('📊 Rapport missions généré!')} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '14px' }}>
                    📊 Rapport Global
                  </button>
                </div>
              </div>

              {/* Stats Globales */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', marginBottom: '32px' }}>
                {[
                  { label: 'Total Missions', value: globalMissions.length, icon: '🎯', color: '#667EEA' },
                  { label: 'Ouvertes', value: globalMissions.filter(m => m.status === 'Ouverte').length, icon: '🟢', color: '#10B981' },
                  { label: 'En cours', value: globalMissions.filter(m => m.status === 'En cours').length, icon: '⏳', color: '#F59E0B' },
                  { label: 'Candidatures', value: globalMissions.reduce((sum, m) => sum + m.candidatures, 0), icon: '📝', color: '#FF6B9D' },
                  { label: 'Vues Total', value: globalMissions.reduce((sum, m) => sum + m.vues, 0), icon: '👁️', color: '#8B5CF6' },
                  { label: 'Urgentes', value: globalMissions.filter(m => m.urgence === 'Haute').length, icon: '🔥', color: '#EF4444' }
                ].map((stat, i) => (
                  <div key={i} style={{ padding: '20px', background: '#1E293B', borderRadius: '12px', border: `2px solid ${stat.color}`, textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Répartition par entreprise */}
              <div style={{ background: '#1E293B', padding: '28px', borderRadius: '16px', border: '2px solid #334155', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '20px' }}>📊 Répartition par Entreprise</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {demoUsers.map(user => {
                    const missions = globalMissions.filter(m => m.company === user.company);
                    const candidatures = missions.reduce((sum, m) => sum + m.candidatures, 0);
                    return (
                      <div key={user.id} style={{ padding: '20px', background: '#0F172A', borderRadius: '12px', border: '2px solid #334155' }}>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>{user.company}</div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <div>
                            <div style={{ fontSize: '24px', fontWeight: '900', color: '#FF6B9D', marginBottom: '4px' }}>{missions.length}</div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>missions</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '24px', fontWeight: '900', color: '#667EEA', marginBottom: '4px' }}>{candidatures}</div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>candidatures</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Liste Missions Détaillée */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                {globalMissions.map(mission => (
                  <div key={mission.id} style={{ background: '#1E293B', padding: '28px', borderRadius: '20px', border: '2px solid #334155', transition: 'all 0.3s' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = mission.urgence === 'Haute' ? '#EF4444' : '#667EEA'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#334155'}>
                    
                    {/* Header Mission */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px', paddingBottom: '20px', borderBottom: '2px solid #334155' }}>
                      <div>
                        <div style={{ fontSize: '26px', fontWeight: '900', color: 'white', marginBottom: '6px' }}>{mission.titre}</div>
                        <div style={{ fontSize: '15px', color: '#94A3B8', marginBottom: '4px' }}>🏢 {mission.company}</div>
                        <div style={{ fontSize: '13px', color: '#64748B' }}>📍 {mission.localisation} • {mission.type}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ padding: '8px 16px', background: mission.status === 'Ouverte' ? '#10B981' : '#F59E0B', borderRadius: '10px', marginBottom: '8px', fontSize: '13px', fontWeight: '800', color: 'white' }}>
                          {mission.status}
                        </div>
                        {mission.urgence === 'Haute' && (
                          <div style={{ padding: '6px 12px', background: '#EF4444', borderRadius: '8px', fontSize: '12px', fontWeight: '800', color: 'white' }}>
                            🔥 URGENT
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Informations Principales */}
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#10B981', marginBottom: '16px', textTransform: 'uppercase' }}>📋 Détails de la Mission</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        <div style={{ padding: '14px', background: '#0F172A', borderRadius: '10px' }}>
                          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>SALAIRE</div>
                          <div style={{ fontSize: '16px', fontWeight: '900', color: '#F59E0B' }}>{mission.salaire}</div>
                        </div>
                        <div style={{ padding: '14px', background: '#0F172A', borderRadius: '10px' }}>
                          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>SECTEUR</div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#667EEA' }}>{mission.secteur}</div>
                        </div>
                        <div style={{ padding: '14px', background: '#0F172A', borderRadius: '10px' }}>
                          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>EXPÉRIENCE</div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: 'white' }}>{mission.experience}</div>
                        </div>
                        <div style={{ padding: '14px', background: '#0F172A', borderRadius: '10px' }}>
                          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>TÉLÉTRAVAIL</div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#10B981' }}>{mission.teletravail}</div>
                        </div>
                      </div>
                    </div>

                    {/* Statistiques Mission */}
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#667EEA', marginBottom: '16px', textTransform: 'uppercase' }}>📊 Statistiques</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                        <div style={{ padding: '16px', background: '#0F172A', borderRadius: '10px', textAlign: 'center', border: '2px solid #FF6B9D40' }}>
                          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>CANDIDATURES</div>
                          <div style={{ fontSize: '24px', fontWeight: '900', color: '#FF6B9D' }}>{mission.candidatures}</div>
                        </div>
                        <div style={{ padding: '16px', background: '#0F172A', borderRadius: '10px', textAlign: 'center', border: '2px solid #8B5CF640' }}>
                          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>VUES</div>
                          <div style={{ fontSize: '24px', fontWeight: '900', color: '#8B5CF6' }}>{mission.vues}</div>
                        </div>
                        <div style={{ padding: '16px', background: '#0F172A', borderRadius: '10px', textAlign: 'center', border: '2px solid #10B98140' }}>
                          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>TAUX CONV.</div>
                          <div style={{ fontSize: '24px', fontWeight: '900', color: '#10B981' }}>{Math.round((mission.candidatures / mission.vues) * 100)}%</div>
                        </div>
                        <div style={{ padding: '16px', background: '#0F172A', borderRadius: '10px', textAlign: 'center', border: '2px solid #667EEA40' }}>
                          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>CRÉATION</div>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: '#667EEA' }}>{mission.dateCreation}</div>
                        </div>
                        <div style={{ padding: '16px', background: '#0F172A', borderRadius: '10px', textAlign: 'center', border: '2px solid #EF444440' }}>
                          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>LIMITE</div>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: '#EF4444' }}>{mission.dateLimit}</div>
                        </div>
                      </div>
                    </div>

                    {/* Délai restant */}
                    <div style={{ marginBottom: '20px', padding: '16px', background: '#667EEA10', border: '2px solid #667EEA40', borderRadius: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#667EEA', fontWeight: '700', marginBottom: '6px' }}>⏰ DÉLAI RESTANT</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#667EEA' }}>
                        {Math.ceil((new Date(mission.dateLimit) - new Date()) / (1000 * 60 * 60 * 24))} jours
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                      <button onClick={() => alert(`📝 ${mission.candidatures} candidatures pour ${mission.titre}`)} style={{ padding: '12px', background: '#FF6B9D', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '12px' }}>
                        📝 Candidatures
                      </button>
                      <button onClick={() => alert(`📊 Analytics mission: ${mission.titre}`)} style={{ padding: '12px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '12px' }}>
                        📊 Analytics
                      </button>
                      <button onClick={() => alert('✏️ Édition mission')} style={{ padding: '12px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '12px' }}>
                        ✏️ Modifier
                      </button>
                      <button onClick={() => alert('📢 Mission promue!')} style={{ padding: '12px', background: '#10B981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '12px' }}>
                        📢 Promouvoir
                      </button>
                      <button onClick={() => {
                        const info = `Mission: ${mission.titre}\nEntreprise: ${mission.company}\nLocalisation: ${mission.localisation}\nSalaire: ${mission.salaire}\nCandidatures: ${mission.candidatures}\nVues: ${mission.vues}`;
                        navigator.clipboard.writeText(info);
                        alert('✅ Infos copiées!');
                      }} style={{ padding: '12px', background: '#8B5CF6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '12px' }}>
                        📋 Copier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DATABASE */}
          {superAdminPage === 'database' && (
            <div>
              <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '40px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>💾 Base de Données</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                  { table: 'Utilisateurs', rows: demoUsers.length, size: '2.4 MB' },
                  { table: 'Candidats', rows: 52, size: '8.7 MB' },
                  { table: 'Missions', rows: 14, size: '1.2 MB' },
                  { table: 'Logs', rows: systemLogs.length, size: '450 KB' },
                  { table: 'Entreprises', rows: 3, size: '780 KB' },
                  { table: 'Applications', rows: 142, size: '5.3 MB' }
                ].map((t, i) => (
                  <div key={i} style={{ padding: '24px', background: '#1E293B', borderRadius: '16px', border: '2px solid #334155', textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>{t.table}</div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#667EEA', marginBottom: '6px' }}>{t.rows}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{t.size}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#1E293B', padding: '32px', borderRadius: '20px', border: '2px solid #334155' }}>
                <button onClick={() => {
                  const fullExport = { users: demoUsers, stats: platformStats, logs: systemLogs };
                  const json = JSON.stringify(fullExport, null, 2);
                  const blob = new Blob([json], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `full_backup_${new Date().toISOString()}.json`;
                  a.click();
                  alert('✅ Export complet téléchargé!');
                }} style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '16px' }}>
                  💾 Export Complet JSON
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );



  }

  return null;
}
