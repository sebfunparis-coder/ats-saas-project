/**
 * 📋 Application Model
 *
 * Représente une candidature (candidat postulant à une mission).
 */

import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  // Relations
  missionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    required: [true, 'La mission est requise'],
    index: true
  },

  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: [true, 'Le candidat est requis'],
    index: true
  },

  // Dénormalisé pour performance (évite les joins)
  missionTitle: {
    type: String,
    required: true
  },

  candidateName: {
    type: String,
    required: true
  },

  candidateEmail: {
    type: String,
    required: true
  },

  // Statut pipeline
  status: {
    type: String,
    enum: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'],
    default: 'applied',
    required: true,
    index: true
  },

  // Dates importantes
  appliedAt: {
    type: Date,
    default: Date.now,
    required: true
  },

  screenedAt: {
    type: Date
  },

  interviewedAt: {
    type: Date
  },

  offeredAt: {
    type: Date
  },

  hiredAt: {
    type: Date
  },

  rejectedAt: {
    type: Date
  },

  // Détails de candidature
  coverLetter: {
    type: String,
    maxlength: [2000, 'La lettre de motivation ne peut pas dépasser 2000 caractères']
  },

  salaryExpectation: {
    type: Number,
    min: 0
  },

  availableFrom: {
    type: Date
  },

  // Entretiens
  interviews: [{
    type: {
      type: String,
      enum: ['phone', 'video', 'onsite', 'technical'],
      required: true
    },
    scheduledAt: {
      type: Date,
      required: true
    },
    completedAt: {
      type: Date
    },
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      maxlength: [1000, 'Les notes ne peuvent pas dépasser 1000 caractères']
    },
    rating: {
      type: Number,
      min: 0,
      max: 5
    },
    outcome: {
      type: String,
      enum: ['pending', 'passed', 'failed'],
      default: 'pending'
    }
  }],

  // Feedback
  feedback: {
    type: String,
    maxlength: [2000, 'Le feedback ne peut pas dépasser 2000 caractères']
  },

  rejectionReason: {
    type: String,
    maxlength: [500, 'La raison de rejet ne peut pas dépasser 500 caractères']
  },

  // Métadonnées
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  updatedBy: {
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

  // Multi-tenant
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'La candidature doit être liée à une entreprise'],
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====

// Index composé pour multi-tenant
applicationSchema.index({ companyId: 1, status: 1 });

// Index unique (un candidat ne peut postuler qu'une fois à une mission)
applicationSchema.index({ missionId: 1, candidateId: 1 }, { unique: true });

// Index sur companyId et status
applicationSchema.index({ companyId: 1, status: 1 });

// Index sur dates
applicationSchema.index({ appliedAt: -1 });
applicationSchema.index({ updatedAt: -1 });

// ===== VIRTUALS =====

// Nombre d'entretiens
applicationSchema.virtual('interviewCount').get(function() {
  return this.interviews ? this.interviews.length : 0;
});

// Jours depuis candidature
applicationSchema.virtual('daysSinceApplied').get(function() {
  const diffTime = Date.now() - this.appliedAt;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Prochain entretien
applicationSchema.virtual('nextInterview').get(function() {
  if (!this.interviews || this.interviews.length === 0) return null;

  const upcomingInterviews = this.interviews
    .filter(i => !i.completedAt && i.scheduledAt > new Date())
    .sort((a, b) => a.scheduledAt - b.scheduledAt);

  return upcomingInterviews[0] || null;
});

// ===== MIDDLEWARE =====

// Pre-save : Update timestamp and status dates
applicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Set status-specific timestamps
  if (this.isModified('status')) {
    const now = Date.now();

    switch (this.status) {
      case 'screening':
        if (!this.screenedAt) this.screenedAt = now;
        break;
      case 'interview':
        if (!this.interviewedAt) this.interviewedAt = now;
        break;
      case 'offer':
        if (!this.offeredAt) this.offeredAt = now;
        break;
      case 'hired':
        if (!this.hiredAt) this.hiredAt = now;
        break;
      case 'rejected':
        if (!this.rejectedAt) this.rejectedAt = now;
        break;
    }
  }

  next();
});

// ===== METHODS =====

// Mettre à jour le statut
applicationSchema.methods.updateStatus = async function(newStatus, userId) {
  this.status = newStatus;
  this.updatedBy = userId;
  await this.save();
};

// Ajouter un entretien
applicationSchema.methods.addInterview = async function(interviewData) {
  this.interviews.push(interviewData);

  // Si premier entretien, passer au statut interview
  if (this.status === 'screening' && this.interviews.length === 1) {
    this.status = 'interview';
  }

  await this.save();
};

// Rejeter la candidature
applicationSchema.methods.reject = async function(reason, userId) {
  this.status = 'rejected';
  this.rejectionReason = reason;
  this.rejectedAt = Date.now();
  this.updatedBy = userId;
  await this.save();
};

// Embaucher le candidat
applicationSchema.methods.hire = async function(userId) {
  this.status = 'hired';
  this.hiredAt = Date.now();
  this.updatedBy = userId;
  await this.save();
};

// Faire une offre
applicationSchema.methods.makeOffer = async function(userId) {
  this.status = 'offer';
  this.offeredAt = Date.now();
  this.updatedBy = userId;
  await this.save();
};

// ===== EXPORT =====

const Application = mongoose.model('Application', applicationSchema);

export default Application;
