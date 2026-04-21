/**
 * 💾 Mock Database - Stockage en mémoire pour développement sans MongoDB
 * Utilisé quand MongoDB n'est pas disponible
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Stockage en mémoire
const mockDB = {
  users: [],
  companies: [],
  teamMembers: [],
  missions: [],
  candidates: [],
  applications: []
};

/**
 * Génère un ID unique (simule MongoDB ObjectId)
 */
const generateId = () => {
  return crypto.randomBytes(12).toString('hex');
};

/**
 * Mock User Model
 */
export const MockUser = {
  async findOne(query) {
    if (query.email) {
      return mockDB.users.find(u => u.email === query.email);
    }
    if (query._id) {
      return mockDB.users.find(u => u._id === query._id);
    }
    return null;
  },

  async findById(id) {
    return mockDB.users.find(u => u._id === id);
  },

  async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = {
      _id: generateId(),
      ...data,
      password: hashedPassword,
      role: data.role || 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockDB.users.push(user);
    return user;
  }
};

/**
 * Mock Company Model
 */
export const MockCompany = {
  async create(data) {
    const company = {
      _id: generateId(),
      ...data,
      userIds: data.userIds || [],
      candidateIds: data.candidateIds || [],
      missionIds: data.missionIds || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockDB.companies.push(company);
    return company;
  },

  async findById(id) {
    return mockDB.companies.find(c => c._id === id);
  },

  async findByIdAndUpdate(id, update) {
    const company = mockDB.companies.find(c => c._id === id);
    if (company) {
      Object.assign(company, update, { updatedAt: new Date() });
    }
    return company;
  }
};

/**
 * Mock TeamMember Model
 */
export const MockTeamMember = {
  async create(data) {
    const teamMember = {
      _id: generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockDB.teamMembers.push(teamMember);
    return teamMember;
  },

  async findById(id) {
    return mockDB.teamMembers.find(t => t._id === id);
  }
};

/**
 * Mock Mission Model
 */
export const MockMission = {
  async find(query = {}) {
    let results = [...mockDB.missions];
    if (query.companyId) {
      results = results.filter(m => m.companyId === query.companyId);
    }
    return results;
  },

  async findById(id) {
    return mockDB.missions.find(m => m._id === id);
  },

  async create(data) {
    const mission = {
      _id: generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockDB.missions.push(mission);
    return mission;
  }
};

/**
 * Mock Candidate Model
 */
export const MockCandidate = {
  async find(query = {}) {
    let results = [...mockDB.candidates];
    if (query.companyId) {
      results = results.filter(c => c.companyId === query.companyId);
    }
    return results;
  },

  async findById(id) {
    return mockDB.candidates.find(c => c._id === id);
  },

  async create(data) {
    const candidate = {
      _id: generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockDB.candidates.push(candidate);
    return candidate;
  }
};

/**
 * Vérifie si MongoDB est connecté
 */
export const isMongoDBConnected = () => {
  // Retourne false pour forcer l'utilisation du mock
  return false;
};

export default mockDB;
