/**
 * 💼 Mission Model
 *
 * Représente une offre d'emploi / mission de recrutement.
 */

import mongoose from 'mongoose';

const missionSchema = new mongoose.Schema({
  // Informations de base
  title: {
    type: String,
    required: [true, 'Le titre de la mission est requis'],
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },

  // Company info (denormalized for performance)
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    index: true
  },

  companyName: {
    type: String,
    required: true,
    trim: true
  },

  // Statut
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed'],
    default: 'active',
    required: true,
    index: true
  },

  // Type de contrat
  contract: {
    type: String,
    enum: ['CDI', 'CDD', 'Freelance', 'Stage'],
    required: [true, 'Le type de contrat est requis']
  },

  // Localisation
  location: {
    type: String,
    required: [true, 'La localisation est requise'],
    trim: true
  },

  remote: {
    type: String,
    enum: ['Sur site', 'Hybride', 'Full remote'],
    default: 'Sur site'
  },

  // Salaire
  salary: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'EUR'
    }
  },

  // Description
  description: {
    type: String,
    maxlength: [5000, 'La description ne peut pas dépasser 5000 caractères']
  },

  requirements: [{
    type: String,
    maxlength: [500, 'Chaque exigence ne peut pas dépasser 500 caractères']
  }],

  benefits: [{
    type: String,
    maxlength: [500, 'Chaque avantage ne peut pas dépasser 500 caractères']
  }],

  // Compétences
  skills: [{
    type: String,
    trim: true
  }],

  // Niveau d'expérience
  experience: {
    type: String,
    enum: ['Junior', 'Confirmé', 'Senior', 'Expert'],
    default: 'Confirmé'
  },

  // Département
  department: {
    type: String,
    trim: true
  },

  // Candidatures liées
  applicationCount: {
    type: Number,
    default: 0,
    min: 0
  },

  candidateIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate'
  }],

  // Métadonnées
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  publishedAt: {
    type: Date
  },

  closedAt: {
    type: Date
  },

  // Multi-tenant
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'La mission doit être liée à une entreprise'],
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====

// Index composé pour multi-tenant
missionSchema.index({ companyId: 1, status: 1 });

// Index texte pour recherche
missionSchema.index({ title: 'text', description: 'text', department: 'text' });

// Index sur dates
missionSchema.index({ publishedAt: -1 });
missionSchema.index({ createdAt: -1 });

// Index sur contract et location pour filtrage
missionSchema.index({ contract: 1 });
missionSchema.index({ location: 1 });
missionSchema.index({ remote: 1 });

// ===== VIRTUALS =====

// Jours depuis publication
missionSchema.virtual('daysSincePublished').get(function() {
  if (!this.publishedAt) return 0;
  const diffTime = Date.now() - this.publishedAt;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Est active
missionSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

// Range salarial formaté
missionSchema.virtual('salaryRange').get(function() {
  if (!this.salary.min && !this.salary.max) return 'Non spécifié';
  if (this.salary.min && this.salary.max) {
    return `${this.salary.min.toLocaleString()} - ${this.salary.max.toLocaleString()} ${this.salary.currency}`;
  }
  if (this.salary.min) {
    return `À partir de ${this.salary.min.toLocaleString()} ${this.salary.currency}`;
  }
  return `Jusqu'à ${this.salary.max.toLocaleString()} ${this.salary.currency}`;
});

// ===== MIDDLEWARE =====

// Pre-save : Update timestamp
missionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Set publishedAt if status changes to active and not set
  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = Date.now();
  }

  // Set closedAt if status changes to closed
  if (this.isModified('status') && this.status === 'closed' && !this.closedAt) {
    this.closedAt = Date.now();
  }

  next();
});

// ===== METHODS =====

// Ajouter une candidature
missionSchema.methods.addApplication = async function(candidateId) {
  if (!this.candidateIds.includes(candidateId)) {
    this.candidateIds.push(candidateId);
    this.applicationCount += 1;
    await this.save();
  }
};

// Retirer une candidature
missionSchema.methods.removeApplication = async function(candidateId) {
  const index = this.candidateIds.indexOf(candidateId);
  if (index > -1) {
    this.candidateIds.splice(index, 1);
    this.applicationCount = Math.max(0, this.applicationCount - 1);
    await this.save();
  }
};

// Publier la mission
missionSchema.methods.publish = async function() {
  this.status = 'active';
  this.publishedAt = Date.now();
  await this.save();
};

// Fermer la mission
missionSchema.methods.close = async function() {
  this.status = 'closed';
  this.closedAt = Date.now();
  await this.save();
};

// ===== EXPORT =====

const Mission = mongoose.model('Mission', missionSchema);

export default Mission;
