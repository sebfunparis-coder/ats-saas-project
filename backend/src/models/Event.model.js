/**
 * 📅 Event Model
 *
 * Représente un événement dans le calendrier (entretiens, réunions, deadlines).
 */

import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  // Informations de base
  title: {
    type: String,
    required: [true, 'Le titre de l\'événement est requis'],
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },

  description: {
    type: String,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },

  type: {
    type: String,
    enum: ['interview', 'meeting', 'call', 'deadline', 'other'],
    required: [true, 'Le type d\'événement est requis'],
    index: true
  },

  // Dates
  startDate: {
    type: Date,
    required: [true, 'La date de début est requise'],
    index: true
  },

  endDate: {
    type: Date
  },

  allDay: {
    type: Boolean,
    default: false
  },

  // Participants
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'organisateur est requis'],
    index: true
  },

  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],

  // Localisation
  location: {
    type: String,
    trim: true
  },

  meetingLink: {
    type: String,
    trim: true
  },

  // Relations
  missionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    index: true
  },

  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    index: true
  },

  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    index: true
  },

  // Rappels
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'notification'],
      default: 'notification'
    },
    minutesBefore: {
      type: Number,
      min: 0,
      default: 30
    }
  }],

  // Statut
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled',
    index: true
  },

  // Notes post-événement
  notes: {
    type: String,
    maxlength: [2000, 'Les notes ne peuvent pas dépasser 2000 caractères']
  },

  outcome: {
    type: String,
    maxlength: [500, 'Le résultat ne peut pas dépasser 500 caractères']
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

  // Multi-tenant
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'L\'événement doit être lié à une entreprise'],
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====

// Index composé pour multi-tenant
eventSchema.index({ companyId: 1, startDate: 1 });

// Index sur organizer et date
eventSchema.index({ organizer: 1, startDate: 1 });

// Index sur type et status
eventSchema.index({ type: 1, status: 1 });

// Index texte pour recherche
eventSchema.index({ title: 'text', description: 'text' });

// ===== VIRTUALS =====

// Durée en minutes
eventSchema.virtual('durationMinutes').get(function() {
  if (!this.endDate) return null;
  const diffTime = this.endDate - this.startDate;
  return Math.ceil(diffTime / (1000 * 60));
});

// Est passé
eventSchema.virtual('isPast').get(function() {
  return this.startDate < new Date();
});

// Est aujourd'hui
eventSchema.virtual('isToday').get(function() {
  const today = new Date();
  const eventDate = new Date(this.startDate);

  return eventDate.toDateString() === today.toDateString();
});

// Est dans le futur
eventSchema.virtual('isFuture').get(function() {
  return this.startDate > new Date();
});

// Temps avant l'événement (en minutes)
eventSchema.virtual('minutesUntilEvent').get(function() {
  if (this.isPast) return 0;
  const diffTime = this.startDate - new Date();
  return Math.ceil(diffTime / (1000 * 60));
});

// ===== MIDDLEWARE =====

// Pre-save : Update timestamp
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Si pas de endDate, la définir à +1h de startDate
  if (!this.endDate && this.startDate) {
    this.endDate = new Date(this.startDate.getTime() + 60 * 60 * 1000); // +1 hour
  }

  next();
});

// ===== METHODS =====

// Annuler l'événement
eventSchema.methods.cancel = async function() {
  this.status = 'cancelled';
  await this.save();
};

// Marquer comme terminé
eventSchema.methods.complete = async function(outcome, notes) {
  this.status = 'completed';
  if (outcome) this.outcome = outcome;
  if (notes) this.notes = notes;
  await this.save();
};

// Reprogrammer
eventSchema.methods.reschedule = async function(newStartDate, newEndDate) {
  this.status = 'rescheduled';
  this.startDate = newStartDate;
  if (newEndDate) this.endDate = newEndDate;
  await this.save();
};

// Ajouter un participant
eventSchema.methods.addParticipant = async function(participantData) {
  this.participants.push(participantData);
  await this.save();
};

// Retirer un participant
eventSchema.methods.removeParticipant = async function(participantId) {
  this.participants = this.participants.filter(
    p => p.userId && p.userId.toString() !== participantId.toString()
  );
  await this.save();
};

// Mettre à jour le statut d'un participant
eventSchema.methods.updateParticipantStatus = async function(participantId, status) {
  const participant = this.participants.find(
    p => p.userId && p.userId.toString() === participantId.toString()
  );

  if (participant) {
    participant.status = status;
    await this.save();
  }
};

// Vérifier si rappel doit être envoyé
eventSchema.methods.shouldSendReminder = function(minutesBefore) {
  const minutesUntil = this.minutesUntilEvent;
  return minutesUntil <= minutesBefore && minutesUntil > minutesBefore - 5;
};

// ===== EXPORT =====

const Event = mongoose.model('Event', eventSchema);

export default Event;
