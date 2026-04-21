/**
 * 👤 User Model - Utilisateurs du système ATS
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
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
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
    select: false // Ne pas retourner le mot de passe par défaut
  },

  // Rôle et permissions
  role: {
    type: String,
    enum: ['user', 'recruiter', 'manager', 'admin', 'superadmin'],
    default: 'recruiter'
  },
  permissions: [{
    type: String,
    enum: [
      'missions:read', 'missions:write', 'missions:delete',
      'candidates:read', 'candidates:write', 'candidates:delete',
      'applications:read', 'applications:write', 'applications:delete',
      'users:read', 'users:write', 'users:delete',
      'admin:access'
    ]
  }],

  // Informations professionnelles
  company: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String, // URL de l'image
    default: null
  },

  // Relations (Multi-tenant)
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'L\'utilisateur doit être lié à une entreprise'],
    index: true
  },

  teamMemberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember',
    index: true
  },

  // Préférences
  preferences: {
    language: {
      type: String,
      enum: ['fr', 'en'],
      default: 'fr'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      inApp: {
        type: Boolean,
        default: true
      }
    },
    darkMode: {
      type: Boolean,
      default: false
    }
  },

  // Sécurité
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,

  // Statut
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // createdAt, updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====
// Index unique sur email
userSchema.index({ email: 1 }, { unique: true });

// Index multi-tenant (email unique par company)
userSchema.index({ companyId: 1, email: 1 });

// Index sur company string (pour recherche)
userSchema.index({ company: 1 });

// Index sur role
userSchema.index({ role: 1 });

// Index sur status
userSchema.index({ isActive: 1, isDeleted: 1 });

// ===== VIRTUAL PROPERTIES =====
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// ===== MIDDLEWARE =====

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ===== METHODS =====

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }

  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Generate JWT token (method à implémenter dans authController)
userSchema.methods.toAuthJSON = function() {
  return {
    id: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: this.fullName,
    role: this.role,
    permissions: this.permissions,
    company: this.company,
    avatar: this.avatar,
    preferences: this.preferences
  };
};

const User = mongoose.model('User', userSchema);

export default User;
