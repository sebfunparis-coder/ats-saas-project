/**
 * 🤝 Client Model
 *
 * Représente un client (entreprise) pour lequel on recrute.
 */

import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  // Informations de base
  name: {
    type: String,
    required: [true, 'Le nom du client est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },

  type: {
    type: String,
    enum: ['company', 'individual'],
    default: 'company'
  },

  industry: {
    type: String,
    trim: true
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

  // Contacts associés
  contacts: [{
    name: {
      type: String,
      required: true
    },
    role: String,
    email: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide']
    },
    phone: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],

  // Relations
  missionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission'
  }],

  // Statut
  status: {
    type: String,
    enum: ['lead', 'prospect', 'active', 'inactive'],
    default: 'lead',
    index: true
  },

  source: {
    type: String,
    trim: true
  },

  // Documents
  documents: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Notes
  notes: {
    type: String,
    maxlength: [2000, 'Les notes ne peuvent pas dépasser 2000 caractères']
  },

  tags: [String],

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
    required: [true, 'Le client doit être lié à une entreprise'],
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====

// Index sur companyId
clientSchema.index({ companyId: 1 });

// Index sur status
clientSchema.index({ status: 1 });

// Index texte pour recherche
clientSchema.index({ name: 'text', industry: 'text' });

// Index sur dates
clientSchema.index({ createdAt: -1 });
clientSchema.index({ lastContactedAt: -1 });

// ===== VIRTUALS =====

// Nombre de missions
clientSchema.virtual('missionCount').get(function() {
  return this.missionIds ? this.missionIds.length : 0;
});

// Contact principal
clientSchema.virtual('primaryContact').get(function() {
  if (!this.contacts || this.contacts.length === 0) return null;
  return this.contacts.find(c => c.isPrimary) || this.contacts[0];
});

// Jours depuis dernier contact
clientSchema.virtual('daysSinceLastContact').get(function() {
  if (!this.lastContactedAt) return null;
  const diffTime = Date.now() - this.lastContactedAt;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// ===== MIDDLEWARE =====

// Pre-save : Update timestamp
clientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Assurer qu'un seul contact est primary
  if (this.contacts && this.contacts.length > 0) {
    let hasPrimary = false;
    this.contacts.forEach(contact => {
      if (contact.isPrimary && !hasPrimary) {
        hasPrimary = true;
      } else {
        contact.isPrimary = false;
      }
    });

    // Si aucun primary, définir le premier
    if (!hasPrimary) {
      this.contacts[0].isPrimary = true;
    }
  }

  next();
});

// ===== METHODS =====

// Ajouter une mission
clientSchema.methods.addMission = async function(missionId) {
  if (!this.missionIds.includes(missionId)) {
    this.missionIds.push(missionId);
    await this.save();
  }
};

// Retirer une mission
clientSchema.methods.removeMission = async function(missionId) {
  const index = this.missionIds.indexOf(missionId);
  if (index > -1) {
    this.missionIds.splice(index, 1);
    await this.save();
  }
};

// Mettre à jour le statut
clientSchema.methods.updateStatus = async function(newStatus) {
  this.status = newStatus;
  this.lastContactedAt = Date.now();
  await this.save();
};

// Ajouter un contact
clientSchema.methods.addContact = async function(contactData) {
  this.contacts.push(contactData);
  await this.save();
};

// Retirer un contact
clientSchema.methods.removeContact = async function(contactId) {
  this.contacts = this.contacts.filter(c => c._id.toString() !== contactId.toString());
  await this.save();
};

// ===== EXPORT =====

const Client = mongoose.model('Client', clientSchema);

export default Client;
