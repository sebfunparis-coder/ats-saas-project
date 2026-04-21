/**
 * 👥 TeamMember Model
 *
 * Représente un membre de l'équipe de recrutement.
 * Lié à un User et à une Company.
 */

import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  // Informations personnelles
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
  },

  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },

  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },

  phone: {
    type: String,
    trim: true
  },

  avatar: {
    type: String,
    default: '👤'
  },

  // Rôle et permissions
  role: {
    type: String,
    enum: ['Admin', 'Recruteur', 'Manager', 'Consultant'],
    default: 'Recruteur',
    required: true
  },

  permissions: [{
    type: String,
    enum: ['all', 'missions', 'candidates', 'applications', 'clients', 'team', 'reports', 'settings']
  }],

  // Relation utilisateur
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },

  // Statut
  active: {
    type: Boolean,
    default: true
  },

  // Dates
  joinDate: {
    type: Date,
    default: Date.now,
    required: true
  },

  lastActive: {
    type: Date,
    default: Date.now
  },

  // Statistiques
  stats: {
    candidatesAdded: {
      type: Number,
      default: 0,
      min: 0
    },
    missionsCreated: {
      type: Number,
      default: 0,
      min: 0
    },
    interviewsScheduled: {
      type: Number,
      default: 0,
      min: 0
    },
    placements: {
      type: Number,
      default: 0,
      min: 0
    },
    revenue: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // Activité
  activity: {
    lastLogin: {
      type: String,
      default: 'Jamais'
    },
    candidatesContacted: {
      type: Number,
      default: 0,
      min: 0
    },
    interviewsScheduled: {
      type: Number,
      default: 0,
      min: 0
    },
    avgResponseTime: {
      type: String,
      default: 'N/A'
    }
  },

  // Performance
  performance: {
    monthlyGoal: {
      type: Number,
      default: 10,
      min: 0
    },
    monthlyAchieved: {
      type: Number,
      default: 0,
      min: 0
    },
    conversionRate: {
      type: String,
      default: '0%'
    },
    satisfaction: {
      type: Number,
      default: 5,
      min: 0,
      max: 5
    },
    hoursThisWeek: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // Notes
  notes: {
    type: String,
    maxlength: [1000, 'Les notes ne peuvent pas dépasser 1000 caractères']
  },

  // Métadonnées
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  // Multi-tenant
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Le membre doit être lié à une entreprise'],
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====

// Index composé pour multi-tenant (email unique par company)
teamMemberSchema.index({ companyId: 1, email: 1 }, { unique: true });

// Index sur companyId et active pour filtrage rapide
teamMemberSchema.index({ companyId: 1, active: 1 });

// Index sur role
teamMemberSchema.index({ role: 1 });

// Index texte pour recherche
teamMemberSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

// ===== VIRTUALS =====

// Nom complet
teamMemberSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Taux de réussite
teamMemberSchema.virtual('successRate').get(function() {
  if (this.stats.missionsCreated === 0) return 0;
  return Math.round((this.stats.placements / this.stats.missionsCreated) * 100);
});

// Progression du mois
teamMemberSchema.virtual('monthlyProgress').get(function() {
  if (this.performance.monthlyGoal === 0) return 0;
  return Math.round((this.performance.monthlyAchieved / this.performance.monthlyGoal) * 100);
});

// ===== MIDDLEWARE =====

// Pre-save : Update timestamp
teamMemberSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Set default permissions based on role
  if (this.isModified('role') && (!this.permissions || this.permissions.length === 0)) {
    switch (this.role) {
      case 'Admin':
        this.permissions = ['all'];
        break;
      case 'Manager':
        this.permissions = ['missions', 'candidates', 'applications', 'clients', 'team', 'reports'];
        break;
      case 'Recruteur':
        this.permissions = ['missions', 'candidates', 'applications'];
        break;
      case 'Consultant':
        this.permissions = ['missions', 'candidates'];
        break;
      default:
        this.permissions = ['missions', 'candidates'];
    }
  }

  next();
});

// ===== METHODS =====

// Vérifier si membre a une permission
teamMemberSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes('all') || this.permissions.includes(permission);
};

// Mettre à jour l'activité
teamMemberSchema.methods.updateActivity = async function() {
  this.lastActive = new Date();
  this.activity.lastLogin = 'À l\'instant';
  await this.save();
};

// Incrémenter les stats
teamMemberSchema.methods.incrementStat = async function(statName, value = 1) {
  if (this.stats.hasOwnProperty(statName)) {
    this.stats[statName] += value;
    await this.save();
  }
};

// Calculer la performance du mois
teamMemberSchema.methods.calculateMonthlyPerformance = async function() {
  // Cette méthode sera appelée en début de mois pour réinitialiser
  this.performance.monthlyAchieved = 0;
  await this.save();
};

// ===== EXPORT =====

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

export default TeamMember;
