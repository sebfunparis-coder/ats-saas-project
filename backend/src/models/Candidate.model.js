/**
 * 📄 Candidate Model
 *
 * Représente un candidat dans la CVthèque.
 */

import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
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

  // Localisation
  location: {
    type: String,
    trim: true
  },

  country: {
    type: String,
    default: 'France'
  },

  // Profil professionnel
  position: {
    type: String,
    required: [true, 'Le poste recherché est requis'],
    trim: true
  },

  experience: {
    type: Number,
    min: 0,
    default: 0
  },

  experienceLevel: {
    type: String,
    enum: ['Junior', 'Confirmé', 'Senior', 'Expert'],
    default: 'Junior'
  },

  salary: {
    current: {
      type: Number,
      min: 0
    },
    expected: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'EUR'
    }
  },

  // Compétences
  skills: [{
    type: String,
    trim: true
  }],

  languages: [{
    name: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['Débutant', 'Intermédiaire', 'Courant', 'Natif'],
      required: true
    }
  }],

  // Documents
  cvUrl: {
    type: String
  },

  cvFilename: {
    type: String
  },

  linkedinUrl: {
    type: String,
    trim: true
  },

  portfolioUrl: {
    type: String,
    trim: true
  },

  // Statut
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'interview', 'offer', 'hired', 'rejected'],
    default: 'new',
    index: true
  },

  availability: {
    type: String,
    enum: ['Immédiate', '1 mois', '2 mois', '3 mois+'],
    default: 'Immédiate'
  },

  // Préférences
  preferences: {
    contracts: [{
      type: String,
      enum: ['CDI', 'CDD', 'Freelance', 'Stage']
    }],
    remote: {
      type: String,
      enum: ['Sur site', 'Hybride', 'Full remote']
    },
    sectors: [String]
  },

  // Missions associées
  applicationIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],

  // Notes & évaluation
  tags: [String],

  notes: {
    type: String,
    maxlength: [2000, 'Les notes ne peuvent pas dépasser 2000 caractères']
  },

  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },

  // Source
  source: {
    type: String,
    enum: ['website', 'linkedin', 'referral', 'jobboard', 'other'],
    default: 'website'
  },

  // Métadonnées
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  lastContactedAt: {
    type: Date
  },

  // Multi-tenant
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Le candidat doit être lié à une entreprise'],
    index: true
  },

  // Soft delete
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====

// Index composé pour multi-tenant (email unique par company)
candidateSchema.index({ companyId: 1, email: 1 }, { unique: true });

// Index sur companyId et status
candidateSchema.index({ companyId: 1, status: 1 });

// Index texte pour recherche
candidateSchema.index({ firstName: 'text', lastName: 'text', position: 'text', location: 'text' });

// Index sur skills pour filtrage
candidateSchema.index({ skills: 1 });

// Index sur dates
candidateSchema.index({ createdAt: -1 });
candidateSchema.index({ lastContactedAt: -1 });

// ===== VIRTUALS =====

// Nom complet
candidateSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Nombre de candidatures
candidateSchema.virtual('applicationCount').get(function() {
  return this.applicationIds ? this.applicationIds.length : 0;
});

// Jours depuis dernier contact
candidateSchema.virtual('daysSinceLastContact').get(function() {
  if (!this.lastContactedAt) return null;
  const diffTime = Date.now() - this.lastContactedAt;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// ===== MIDDLEWARE =====

// Pre-save : Update timestamp + track field changes for denormalization sync
candidateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this._nameChanged = this.isModified('firstName') || this.isModified('lastName');
  next();
});

// Post-save : Sync candidateName in all related Applications when name changes
candidateSchema.post('save', async function() {
  if (!this._nameChanged) return;
  try {
    const fullName = `${this.firstName} ${this.lastName}`.trim();
    await mongoose.model('Application').updateMany(
      { candidateId: this._id },
      { $set: { candidateName: fullName } }
    );
  } catch (err) {
    console.error('[SYNC] Failed to propagate candidate name to applications:', err.message);
  }
});

// ===== METHODS =====

// Mettre à jour le statut
candidateSchema.methods.updateStatus = async function(newStatus) {
  this.status = newStatus;
  this.lastContactedAt = Date.now();
  await this.save();
};

// Ajouter une candidature
candidateSchema.methods.addApplication = async function(applicationId) {
  if (!this.applicationIds.includes(applicationId)) {
    this.applicationIds.push(applicationId);
    await this.save();
  }
};

// Retirer une candidature
candidateSchema.methods.removeApplication = async function(applicationId) {
  const index = this.applicationIds.indexOf(applicationId);
  if (index > -1) {
    this.applicationIds.splice(index, 1);
    await this.save();
  }
};

// Mettre à jour la note
candidateSchema.methods.rate = async function(rating) {
  this.rating = Math.max(0, Math.min(5, rating));
  await this.save();
};

// ===== SOFT DELETE MIDDLEWARE =====

const softDeleteFilter = function(next) {
  if (!this.options.includeDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
};

candidateSchema.pre(/^find/, softDeleteFilter);
candidateSchema.pre('countDocuments', softDeleteFilter);

// ===== EXPORT =====

const Candidate = mongoose.model('Candidate', candidateSchema);

export default Candidate;
