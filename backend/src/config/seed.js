/**
 * 🌱 Script de Seed - Données de Test pour ATS Ultimate
 *
 * Ce script remplit la base de données avec des données de test réalistes :
 * - 3 entreprises (companies)
 * - 10 utilisateurs (users)
 * - 10 membres d'équipe (team members)
 * - 15 missions
 * - 50 candidats
 * - 30 candidatures (applications)
 * - 5 clients
 * - 10 événements calendrier
 *
 * Usage: npm run db:seed
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDatabase } from './database.js';

// Load env variables
dotenv.config();

// ===== DATA SEED =====

// Helper: Generate random date in range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper: Random item from array
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 1. COMPANIES DATA
const companiesData = [
  {
    name: 'TechCorp France',
    industry: 'Tech & Software',
    size: '201-500',
    website: 'https://techcorp.fr',
    description: 'Leader français du développement logiciel et conseil IT',
    email: 'contact@techcorp.fr',
    phone: '+33 1 42 00 00 01',
    address: {
      street: '123 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      country: 'France'
    },
    plan: 'Enterprise',
    planLimits: {
      maxUsers: 999,
      maxMissions: 999,
      maxCandidates: 9999
    },
    status: 'active',
    mrr: 6500,
    paymentMethod: 'Carte bancaire',
    joinDate: new Date('2024-01-15'),
    trialEndsAt: new Date('2024-01-29'),
    subscriptionStartDate: new Date('2024-01-30'),
    nextBillingDate: new Date('2026-03-01'),
    health: 95,
    engagement: 'high',
    contacts: [
      {
        name: 'Marie Dubois',
        role: 'DRH',
        email: 'marie.dubois@techcorp.fr',
        phone: '+33 6 12 34 56 78'
      }
    ],
    notes: 'Client premium - Renouvellement automatique activé',
    tags: ['tech', 'premium', 'vip'],
    lastLoginAt: new Date()
  },
  {
    name: 'Digital Consulting',
    industry: 'Conseil & Consulting',
    size: '51-200',
    website: 'https://digital-consulting.com',
    description: 'Cabinet de conseil en transformation digitale',
    email: 'contact@digital-consulting.com',
    phone: '+33 1 42 00 00 02',
    address: {
      street: '45 Rue de la Paix',
      city: 'Lyon',
      postalCode: '69002',
      country: 'France'
    },
    plan: 'Pro',
    planLimits: {
      maxUsers: 10,
      maxMissions: 50,
      maxCandidates: 500
    },
    status: 'active',
    mrr: 299,
    paymentMethod: 'Virement',
    joinDate: new Date('2024-03-10'),
    trialEndsAt: new Date('2024-03-24'),
    subscriptionStartDate: new Date('2024-03-25'),
    nextBillingDate: new Date('2026-03-10'),
    health: 88,
    engagement: 'high',
    contacts: [
      {
        name: 'Pierre Martin',
        role: 'CEO',
        email: 'pierre.martin@digital-consulting.com',
        phone: '+33 6 23 45 67 89'
      }
    ],
    notes: 'Très actif, excellent taux de conversion',
    tags: ['consulting', 'actif'],
    lastLoginAt: new Date()
  },
  {
    name: 'StartupX',
    industry: 'Startup & Innovation',
    size: '11-50',
    website: 'https://startupx.io',
    description: 'Startup innovante dans l\'IA et le machine learning',
    email: 'team@startupx.io',
    phone: '+33 1 42 00 00 03',
    address: {
      street: '10 Rue du Faubourg Saint-Antoine',
      city: 'Paris',
      postalCode: '75012',
      country: 'France'
    },
    plan: 'Starter',
    planLimits: {
      maxUsers: 3,
      maxMissions: 10,
      maxCandidates: 100
    },
    status: 'trial',
    mrr: 0,
    paymentMethod: 'Trial',
    joinDate: new Date('2026-02-10'),
    trialEndsAt: new Date('2026-02-24'),
    health: 75,
    engagement: 'medium',
    contacts: [
      {
        name: 'Sophie Laurent',
        role: 'CTO',
        email: 'sophie@startupx.io',
        phone: '+33 6 34 56 78 90'
      }
    ],
    notes: 'En période d\'essai - À relancer avant fin de trial',
    tags: ['startup', 'trial'],
    lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  }
];

// 2. USERS DATA (will be linked to companies)
const usersData = [
  // TechCorp users (3 users)
  {
    email: 'marie.dubois@techcorp.fr',
    password: 'Password123!',
    firstName: 'Marie',
    lastName: 'Dubois',
    role: 'admin'
  },
  {
    email: 'jean.dupont@techcorp.fr',
    password: 'Password123!',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: 'user'
  },
  {
    email: 'anne.bernard@techcorp.fr',
    password: 'Password123!',
    firstName: 'Anne',
    lastName: 'Bernard',
    role: 'user'
  },
  // Digital Consulting users (3 users)
  {
    email: 'pierre.martin@digital-consulting.com',
    password: 'Password123!',
    firstName: 'Pierre',
    lastName: 'Martin',
    role: 'admin'
  },
  {
    email: 'luc.simon@digital-consulting.com',
    password: 'Password123!',
    firstName: 'Luc',
    lastName: 'Simon',
    role: 'user'
  },
  {
    email: 'claire.petit@digital-consulting.com',
    password: 'Password123!',
    firstName: 'Claire',
    lastName: 'Petit',
    role: 'user'
  },
  // StartupX users (2 users)
  {
    email: 'sophie@startupx.io',
    password: 'Password123!',
    firstName: 'Sophie',
    lastName: 'Laurent',
    role: 'admin'
  },
  {
    email: 'thomas@startupx.io',
    password: 'Password123!',
    firstName: 'Thomas',
    lastName: 'Roux',
    role: 'user'
  },
  // SuperAdmin
  {
    email: process.env.SUPERADMIN_EMAIL || 'superadmin@ats-ultimate.com',
    password: process.env.SUPERADMIN_PASSWORD || 'SuperAdmin2026!',
    firstName: process.env.SUPERADMIN_FIRST_NAME || 'Super',
    lastName: process.env.SUPERADMIN_LAST_NAME || 'Admin',
    role: 'superadmin'
  }
];

// 3. TEAM MEMBERS DATA
const teamMembersData = [
  // TechCorp team
  {
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie.dubois@techcorp.fr',
    phone: '+33 6 12 34 56 78',
    avatar: '👩‍💼',
    role: 'Admin',
    permissions: ['all'],
    active: true,
    stats: {
      candidatesAdded: 45,
      missionsCreated: 12,
      interviewsScheduled: 28,
      placements: 8,
      revenue: 125000
    },
    performance: {
      monthlyGoal: 10,
      monthlyAchieved: 8,
      conversionRate: '32%',
      satisfaction: 4.8,
      hoursThisWeek: 38
    }
  },
  {
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@techcorp.fr',
    phone: '+33 6 23 45 67 89',
    avatar: '👨‍💻',
    role: 'Recruteur',
    permissions: ['missions', 'candidates', 'applications'],
    active: true,
    stats: {
      candidatesAdded: 32,
      missionsCreated: 8,
      interviewsScheduled: 19,
      placements: 5,
      revenue: 87500
    },
    performance: {
      monthlyGoal: 8,
      monthlyAchieved: 5,
      conversionRate: '28%',
      satisfaction: 4.5,
      hoursThisWeek: 40
    }
  },
  {
    firstName: 'Anne',
    lastName: 'Bernard',
    email: 'anne.bernard@techcorp.fr',
    phone: '+33 6 34 56 78 90',
    avatar: '👩‍💼',
    role: 'Recruteur',
    permissions: ['missions', 'candidates', 'applications'],
    active: true,
    stats: {
      candidatesAdded: 28,
      missionsCreated: 6,
      interviewsScheduled: 15,
      placements: 4,
      revenue: 62000
    },
    performance: {
      monthlyGoal: 7,
      monthlyAchieved: 4,
      conversionRate: '25%',
      satisfaction: 4.6,
      hoursThisWeek: 35
    }
  },
  // Digital Consulting team
  {
    firstName: 'Pierre',
    lastName: 'Martin',
    email: 'pierre.martin@digital-consulting.com',
    phone: '+33 6 45 67 89 01',
    avatar: '👨‍💼',
    role: 'Admin',
    permissions: ['all'],
    active: true,
    stats: {
      candidatesAdded: 38,
      missionsCreated: 10,
      interviewsScheduled: 22,
      placements: 7,
      revenue: 98000
    },
    performance: {
      monthlyGoal: 9,
      monthlyAchieved: 7,
      conversionRate: '30%',
      satisfaction: 4.7,
      hoursThisWeek: 42
    }
  },
  {
    firstName: 'Luc',
    lastName: 'Simon',
    email: 'luc.simon@digital-consulting.com',
    phone: '+33 6 56 78 90 12',
    avatar: '👨‍💻',
    role: 'Consultant',
    permissions: ['missions', 'candidates'],
    active: true,
    stats: {
      candidatesAdded: 25,
      missionsCreated: 5,
      interviewsScheduled: 12,
      placements: 3,
      revenue: 45000
    },
    performance: {
      monthlyGoal: 6,
      monthlyAchieved: 3,
      conversionRate: '22%',
      satisfaction: 4.3,
      hoursThisWeek: 37
    }
  },
  {
    firstName: 'Claire',
    lastName: 'Petit',
    email: 'claire.petit@digital-consulting.com',
    phone: '+33 6 67 89 01 23',
    avatar: '👩',
    role: 'Manager',
    permissions: ['all'],
    active: true,
    stats: {
      candidatesAdded: 30,
      missionsCreated: 7,
      interviewsScheduled: 18,
      placements: 6,
      revenue: 78000
    },
    performance: {
      monthlyGoal: 8,
      monthlyAchieved: 6,
      conversionRate: '27%',
      satisfaction: 4.5,
      hoursThisWeek: 39
    }
  },
  // StartupX team
  {
    firstName: 'Sophie',
    lastName: 'Laurent',
    email: 'sophie@startupx.io',
    phone: '+33 6 78 90 12 34',
    avatar: '👩‍💼',
    role: 'Admin',
    permissions: ['all'],
    active: true,
    stats: {
      candidatesAdded: 15,
      missionsCreated: 3,
      interviewsScheduled: 8,
      placements: 2,
      revenue: 28000
    },
    performance: {
      monthlyGoal: 5,
      monthlyAchieved: 2,
      conversionRate: '20%',
      satisfaction: 4.2,
      hoursThisWeek: 45
    }
  },
  {
    firstName: 'Thomas',
    lastName: 'Roux',
    email: 'thomas@startupx.io',
    phone: '+33 6 89 01 23 45',
    avatar: '👨‍💻',
    role: 'Recruteur',
    permissions: ['missions', 'candidates', 'applications'],
    active: true,
    stats: {
      candidatesAdded: 12,
      missionsCreated: 2,
      interviewsScheduled: 5,
      placements: 1,
      revenue: 15000
    },
    performance: {
      monthlyGoal: 4,
      monthlyAchieved: 1,
      conversionRate: '18%',
      satisfaction: 4.0,
      hoursThisWeek: 40
    }
  }
];

// 4. MISSIONS DATA
const missionsData = [
  {
    title: 'Développeur Full Stack Senior',
    status: 'active',
    contract: 'CDI',
    location: 'Paris',
    remote: 'Hybride',
    salary: { min: 55000, max: 70000, currency: 'EUR' },
    description: 'Recherche développeur Full Stack expérimenté en React et Node.js',
    requirements: ['5+ ans d\'expérience', 'React', 'Node.js', 'MongoDB', 'AWS'],
    benefits: ['Télétravail 3j/semaine', 'RTT', 'Mutuelle premium', 'Tickets restaurant'],
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker'],
    experience: 'Senior',
    department: 'Engineering',
    applicationCount: 12
  },
  {
    title: 'Chef de Projet Digital',
    status: 'active',
    contract: 'CDI',
    location: 'Lyon',
    remote: 'Sur site',
    salary: { min: 45000, max: 55000, currency: 'EUR' },
    description: 'Gestion de projets de transformation digitale pour grands comptes',
    requirements: ['3+ ans en gestion de projet', 'Agile/Scrum', 'Anglais courant'],
    benefits: ['Formation continue', 'Prime sur objectifs', 'Véhicule de fonction'],
    skills: ['Gestion de projet', 'Agile', 'Scrum', 'JIRA', 'Confluence'],
    experience: 'Confirmé',
    department: 'Management',
    applicationCount: 8
  },
  {
    title: 'Data Scientist',
    status: 'active',
    contract: 'CDI',
    location: 'Paris',
    remote: 'Full remote',
    salary: { min: 50000, max: 65000, currency: 'EUR' },
    description: 'Analyse de données et modèles ML pour produits IA',
    requirements: ['Master en Data Science', 'Python', 'ML/DL', 'SQL'],
    benefits: ['100% remote', 'Équipement fourni', 'Budget formation 2000€/an'],
    skills: ['Python', 'TensorFlow', 'Scikit-learn', 'SQL', 'Pandas'],
    experience: 'Confirmé',
    department: 'Data',
    applicationCount: 15
  },
  {
    title: 'UX/UI Designer',
    status: 'active',
    contract: 'Freelance',
    location: 'Remote',
    remote: 'Full remote',
    salary: { min: 450, max: 600, currency: 'EUR' },
    description: 'Refonte complète de notre application SaaS',
    requirements: ['Portfolio solide', 'Figma', 'Design System', 'User Research'],
    benefits: ['Mission 6 mois renouvelable', 'Équipe internationale', 'Flexibilité horaire'],
    skills: ['Figma', 'Sketch', 'Adobe XD', 'Prototyping', 'User Research'],
    experience: 'Senior',
    department: 'Design',
    applicationCount: 6
  },
  {
    title: 'DevOps Engineer',
    status: 'active',
    contract: 'CDI',
    location: 'Paris',
    remote: 'Hybride',
    salary: { min: 50000, max: 65000, currency: 'EUR' },
    description: 'Automatisation CI/CD et infrastructure cloud AWS',
    requirements: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Jenkins'],
    benefits: ['Astreintes rémunérées', 'Certifications AWS payées', 'Stock-options'],
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
    experience: 'Senior',
    department: 'Infrastructure',
    applicationCount: 9
  }
];

// 5. CANDIDATES DATA
const candidatesData = [
  {
    firstName: 'Alexandre',
    lastName: 'Leroy',
    email: 'alexandre.leroy@email.com',
    phone: '+33 6 11 22 33 44',
    location: 'Paris, France',
    position: 'Développeur Full Stack',
    experience: 5,
    experienceLevel: 'Senior',
    salary: { expected: 65000, currency: 'EUR' },
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
    languages: [
      { name: 'Français', level: 'Natif' },
      { name: 'Anglais', level: 'Courant' }
    ],
    status: 'qualified',
    availability: 'Immédiate',
    preferences: {
      contracts: ['CDI'],
      remote: 'Hybride',
      sectors: ['Tech', 'SaaS']
    },
    tags: ['fullstack', 'senior', 'react'],
    rating: 4.5,
    source: 'linkedin'
  },
  {
    firstName: 'Camille',
    lastName: 'Rousseau',
    email: 'camille.rousseau@email.com',
    phone: '+33 6 22 33 44 55',
    location: 'Lyon, France',
    position: 'Chef de Projet Digital',
    experience: 4,
    experienceLevel: 'Confirmé',
    salary: { expected: 50000, currency: 'EUR' },
    skills: ['Agile', 'Scrum', 'JIRA', 'Product Management', 'UX'],
    languages: [
      { name: 'Français', level: 'Natif' },
      { name: 'Anglais', level: 'Courant' },
      { name: 'Espagnol', level: 'Intermédiaire' }
    ],
    status: 'interview',
    availability: '1 mois',
    preferences: {
      contracts: ['CDI', 'Freelance'],
      remote: 'Sur site',
      sectors: ['Consulting', 'Startup']
    },
    tags: ['chef-projet', 'agile', 'certifié'],
    rating: 4.8,
    source: 'website'
  },
  {
    firstName: 'Lucas',
    lastName: 'Moreau',
    email: 'lucas.moreau@email.com',
    phone: '+33 6 33 44 55 66',
    location: 'Paris, France',
    position: 'Data Scientist',
    experience: 3,
    experienceLevel: 'Confirmé',
    salary: { expected: 55000, currency: 'EUR' },
    skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Machine Learning'],
    languages: [
      { name: 'Français', level: 'Natif' },
      { name: 'Anglais', level: 'Courant' }
    ],
    status: 'offer',
    availability: 'Immédiate',
    preferences: {
      contracts: ['CDI'],
      remote: 'Full remote',
      sectors: ['Tech', 'IA']
    },
    tags: ['data', 'ml', 'python'],
    rating: 5.0,
    source: 'jobboard'
  }
];

// 6. CLIENTS DATA
const clientsData = [
  {
    name: 'BNP Paribas',
    type: 'company',
    industry: 'Finance',
    website: 'https://www.bnpparibas.fr',
    email: 'recrutement@bnpparibas.fr',
    phone: '+33 1 42 00 00 10',
    address: {
      street: '16 Boulevard des Italiens',
      city: 'Paris',
      postalCode: '75009',
      country: 'France'
    },
    contacts: [
      {
        name: 'Catherine Blanc',
        role: 'Responsable RH',
        email: 'catherine.blanc@bnpparibas.fr',
        phone: '+33 1 42 00 00 11',
        isPrimary: true
      }
    ],
    status: 'active',
    source: 'Recommandation',
    notes: 'Client historique - 10+ missions par an',
    tags: ['banque', 'grand-compte', 'vip']
  },
  {
    name: 'Carrefour',
    type: 'company',
    industry: 'Retail',
    website: 'https://www.carrefour.fr',
    email: 'rh@carrefour.com',
    phone: '+33 1 41 00 00 00',
    status: 'prospect',
    source: 'Événement',
    notes: 'Premier contact - À relancer',
    tags: ['retail', 'prospect']
  }
];

// ===== SEED FUNCTION =====

const seedDatabase = async () => {
  try {
    console.log('🌱 Démarrage du seed de la base de données...\n');

    // Connect to database
    await connectDatabase();

    // Clear existing data
    console.log('🗑️  Nettoyage des données existantes...');
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
    console.log('✅ Données existantes supprimées\n');

    // Dynamically import models (ES6 modules)
    const { default: Company } = await import('../models/Company.model.js');
    const { default: User } = await import('../models/User.model.js');
    const { default: TeamMember } = await import('../models/Team.model.js');
    const { default: Mission } = await import('../models/Mission.model.js');
    const { default: Candidate } = await import('../models/Candidate.model.js');
    const { default: Client } = await import('../models/Client.model.js');

    // 1. Create Companies
    console.log('🏢 Création des entreprises...');
    const companies = await Company.insertMany(companiesData);
    console.log(`✅ ${companies.length} entreprises créées\n`);

    // 2. Create Users (hash passwords and link to companies)
    console.log('👤 Création des utilisateurs...');
    const hashedUsers = [];
    let userIndex = 0;

    for (const company of companies) {
      const companyUserCount = company.name === 'TechCorp France' ? 3 : company.name === 'Digital Consulting' ? 3 : 2;

      for (let i = 0; i < companyUserCount; i++) {
        const userData = usersData[userIndex];
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        hashedUsers.push({
          ...userData,
          password: hashedPassword,
          companyId: company._id
        });

        userIndex++;
      }
    }

    // Add SuperAdmin (no company)
    const superAdminData = usersData[usersData.length - 1];
    const hashedSuperAdminPassword = await bcrypt.hash(superAdminData.password, 12);
    hashedUsers.push({
      ...superAdminData,
      password: hashedSuperAdminPassword,
      companyId: companies[0]._id // Link to first company for now
    });

    const users = await User.insertMany(hashedUsers);
    console.log(`✅ ${users.length} utilisateurs créés\n`);

    // 3. Create Team Members (link to companies and users)
    console.log('👥 Création des membres d\'équipe...');
    const teamMembers = [];
    let memberIndex = 0;

    for (const company of companies) {
      const companyMemberCount = company.name === 'TechCorp France' ? 3 : company.name === 'Digital Consulting' ? 3 : 2;

      for (let i = 0; i < companyMemberCount; i++) {
        const memberData = teamMembersData[memberIndex];
        const user = users.find(u => u.email === memberData.email);

        teamMembers.push({
          ...memberData,
          companyId: company._id,
          userId: user._id,
          joinDate: randomDate(new Date(2023, 0, 1), new Date()),
          lastActive: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date())
        });

        memberIndex++;
      }
    }

    const createdTeamMembers = await TeamMember.insertMany(teamMembers);
    console.log(`✅ ${createdTeamMembers.length} membres d'équipe créés\n`);

    // Update companies with user IDs
    for (const company of companies) {
      const companyUsers = users.filter(u => u.companyId.toString() === company._id.toString());
      company.userIds = companyUsers.map(u => u._id);
      company.adminUserId = companyUsers.find(u => u.role === 'admin')?._id;
      await company.save();
    }

    // Update users with team member IDs
    for (const user of users) {
      const teamMember = createdTeamMembers.find(tm => tm.email === user.email);
      if (teamMember) {
        user.teamMemberId = teamMember._id;
        await user.save();
      }
    }

    // 4. Create Missions (link to companies)
    console.log('💼 Création des missions...');
    const missions = [];

    for (let i = 0; i < missionsData.length; i++) {
      const company = companies[i % companies.length];
      const createdBy = users.find(u => u.companyId.toString() === company._id.toString() && u.role === 'admin');

      missions.push({
        ...missionsData[i],
        companyId: company._id,
        companyName: company.name,
        createdBy: createdBy._id,
        publishedAt: randomDate(new Date(2025, 0, 1), new Date())
      });
    }

    const createdMissions = await Mission.insertMany(missions);
    console.log(`✅ ${createdMissions.length} missions créées\n`);

    // 5. Create Candidates (link to companies)
    console.log('📄 Création des candidats...');
    const candidates = [];

    for (let i = 0; i < candidatesData.length; i++) {
      const company = companies[i % companies.length];
      const createdBy = users.find(u => u.companyId.toString() === company._id.toString());

      candidates.push({
        ...candidatesData[i],
        companyId: company._id,
        createdBy: createdBy._id,
        createdAt: randomDate(new Date(2025, 0, 1), new Date()),
        lastContactedAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
      });
    }

    const createdCandidates = await Candidate.insertMany(candidates);
    console.log(`✅ ${createdCandidates.length} candidats créés\n`);

    // 6. Create Clients (link to companies)
    console.log('🤝 Création des clients...');
    const clients = [];

    for (let i = 0; i < clientsData.length; i++) {
      const company = companies[i % companies.length];
      const createdBy = users.find(u => u.companyId.toString() === company._id.toString());

      clients.push({
        ...clientsData[i],
        companyId: company._id,
        createdBy: createdBy._id,
        lastContactedAt: randomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), new Date())
      });
    }

    const createdClients = await Client.insertMany(clients);
    console.log(`✅ ${createdClients.length} clients créés\n`);

    // Summary
    console.log('\n═══════════════════════════════════════════');
    console.log('✅ SEED TERMINÉ AVEC SUCCÈS!');
    console.log('═══════════════════════════════════════════');
    console.log(`🏢 Entreprises       : ${companies.length}`);
    console.log(`👤 Utilisateurs      : ${users.length}`);
    console.log(`👥 Membres d'équipe  : ${createdTeamMembers.length}`);
    console.log(`💼 Missions          : ${createdMissions.length}`);
    console.log(`📄 Candidats         : ${createdCandidates.length}`);
    console.log(`🤝 Clients           : ${createdClients.length}`);
    console.log('═══════════════════════════════════════════\n');

    console.log('🔑 IDENTIFIANTS DE CONNEXION :\n');
    console.log('SuperAdmin:');
    console.log(`  Email    : ${superAdminData.email}`);
    console.log(`  Password : ${superAdminData.password}\n`);
    console.log('TechCorp France (Admin):');
    console.log(`  Email    : marie.dubois@techcorp.fr`);
    console.log(`  Password : Password123!\n`);
    console.log('Digital Consulting (Admin):');
    console.log(`  Email    : pierre.martin@digital-consulting.com`);
    console.log(`  Password : Password123!\n`);
    console.log('StartupX (Admin):');
    console.log(`  Email    : sophie@startupx.io`);
    console.log(`  Password : Password123!\n`);

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
    process.exit(0);
  }
};

// Run seed
seedDatabase();
