/**
 * 🏢 Company Model
 *
 * Représente une entreprise cliente utilisant le système ATS.
 * Multi-tenant : chaque company a ses propres données isolées.
 */

import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  // Informations de base
  name: {
    type: String,
    required: [true, 'Le nom de l\'entreprise est requis'],
    unique: true,
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },

  industry: {
    type: String,
    trim: true
  },

  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    default: '1-10'
  },

  website: {
    type: String,
    trim: true,
    lowercase: true
  },

  description: {
    type: String,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },

  // Contact
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },

  phone: {
    type: String,
    trim: true
  },

  address: {
    street: String,
    city: String,
    postalCode: String,
    country: {
      type: String,
      default: 'France'
    }
  },

  // Abonnement
  plan: {
    type: String,
    enum: ['Starter', 'Pro', 'Enterprise'],
    default: 'Starter',
    required: true
  },

  planLimits: {
    maxUsers: {
      type: Number,
      default: 3
    },
    maxMissions: {
      type: Number,
      default: 10
    },
    maxCandidates: {
      type: Number,
      default: 100
    }
  },

  status: {
    type: String,
    enum: ['trial', 'active', 'suspended', 'cancelled'],
    default: 'trial',
    required: true
  },

  // Facturation
  stripeCustomerId: {
    type: String,
    sparse: true
  },

  stripeSubscriptionId: {
    type: String,
    sparse: true
  },

  mrr: {
    type: Number,
    default: 0,
    min: 0
  },

  paymentMethod: {
    type: String,
    default: 'Trial'
  },

  // Dates
  joinDate: {
    type: Date,
    default: Date.now,
    required: true
  },

  trialEndsAt: {
    type: Date
  },

  subscriptionStartDate: {
    type: Date
  },

  nextBillingDate: {
    type: Date
  },

  // Relations utilisateurs
  userIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  adminUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Metrics
  health: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },

  engagement: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },

  // Contacts
  contacts: [{
    name: String,
    role: String,
    email: String,
    phone: String
  }],

  // Documents & notes
  documents: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  notes: {
    type: String,
    maxlength: [2000, 'Les notes ne peuvent pas dépasser 2000 caractères']
  },

  tags: [String],

  // Portail carrières public
  slug: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },

  careerPageEnabled: {
    type: Boolean,
    default: true
  },

  careerPageBio: {
    type: String,
    maxlength: [500, 'La bio ne peut pas dépasser 500 caractères']
  },

  // T-378 (bonus) : ce champ était écrit par calendarCallback.routes.js
  // (`updateOne({ $set: { 'integrationTokens.googleCalendar': ... } } })`)
  // sans jamais être déclaré dans le schéma — en mode strict (défaut
  // Mongoose), un chemin non déclaré est silencieusement supprimé d'un
  // update, donc les tokens OAuth Google/Microsoft Calendar n'étaient en
  // réalité jamais persistés. Type Mixed : la forme diffère par provider
  // (accessToken/refreshToken/expiresAt pour Google, +tenantId pour
  // Microsoft) et l'objet est géré exclusivement par calendar.service.js.
  integrationTokens: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Préférence de provider visio pour la création automatique de réunions
  // (T-272/273) — lu par videocall.service.js. 'none' = pas de création
  // automatique de lien visio à la planification d'un entretien.
  videoProvider: {
    type: String,
    enum: ['none', 'zoom', 'teams'],
    default: 'none'
  },

  // Métadonnées
  lastLoginAt: {
    type: Date
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====

// Index unique sur email
companySchema.index({ email: 1 }, { unique: true });

// Index sur status pour filtrage rapide
companySchema.index({ status: 1 });

// Index sur plan
companySchema.index({ plan: 1 });

// Index sur dates pour requêtes de facturation
companySchema.index({ nextBillingDate: 1 });
companySchema.index({ trialEndsAt: 1 });

// Index texte pour recherche
companySchema.index({ name: 'text', industry: 'text' });

// ===== VIRTUALS =====

// Compte le nombre d'utilisateurs
companySchema.virtual('userCount').get(function() {
  return this.userIds ? this.userIds.length : 0;
});

// Vérifie si en période d'essai
companySchema.virtual('isInTrial').get(function() {
  return this.status === 'trial' && this.trialEndsAt && this.trialEndsAt > new Date();
});

// Jours restants de trial
companySchema.virtual('trialDaysLeft').get(function() {
  if (!this.isInTrial) return 0;
  const diffTime = this.trialEndsAt - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// ===== MIDDLEWARE =====

// Pre-save : Update timestamp
const generateSlug = (name) =>
  name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

companySchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Auto-generate slug from name for new companies
  if (this.isNew && !this.slug && this.name) {
    this.slug = generateSlug(this.name);
  }

  // Set trial end date if new and in trial
  if (this.isNew && this.status === 'trial' && !this.trialEndsAt) {
    this.trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
  }

  // Set plan limits based on plan
  if (this.isModified('plan')) {
    switch (this.plan) {
      case 'Starter':
        this.planLimits = { maxUsers: 3, maxMissions: 10, maxCandidates: 100 };
        break;
      case 'Pro':
        this.planLimits = { maxUsers: 10, maxMissions: 50, maxCandidates: 500 };
        break;
      case 'Enterprise':
        this.planLimits = { maxUsers: 999, maxMissions: 999, maxCandidates: 9999 };
        break;
    }
  }

  next();
});

// ===== METHODS =====

// Vérifier si la limite d'utilisateurs est atteinte
companySchema.methods.canAddUser = function() {
  return this.userIds.length < this.planLimits.maxUsers;
};

// Vérifier si la limite de missions est atteinte
companySchema.methods.canAddMission = async function() {
  const Mission = mongoose.model('Mission');
  const count = await Mission.countDocuments({ companyId: this._id });
  return count < this.planLimits.maxMissions;
};

// Vérifier si la limite de candidats est atteinte
companySchema.methods.canAddCandidate = async function() {
  const Candidate = mongoose.model('Candidate');
  const count = await Candidate.countDocuments({ companyId: this._id });
  return count < this.planLimits.maxCandidates;
};

// Calculer le health score
companySchema.methods.calculateHealth = async function() {
  let score = 100;

  // Pénalité si inactif (pas de login depuis 7 jours)
  if (this.lastLoginAt) {
    const daysSinceLogin = (Date.now() - this.lastLoginAt) / (1000 * 60 * 60 * 24);
    if (daysSinceLogin > 7) score -= 20;
    if (daysSinceLogin > 14) score -= 20;
  }

  // Bonus si utilisateurs actifs
  if (this.userIds.length > 1) score += 10;

  // Pénalité si trial bientôt fini sans conversion
  if (this.status === 'trial' && this.trialDaysLeft < 3) {
    score -= 30;
  }

  this.health = Math.max(0, Math.min(100, score));
  await this.save();

  return this.health;
};

// ===== EXPORT =====

const Company = mongoose.model('Company', companySchema);

export default Company;
