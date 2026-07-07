/**
 * 🔑 ApiKey Model — Clés API pour intégrations tierces
 */

import mongoose from 'mongoose';

const VALID_SCOPES = [
  'missions:read', 'missions:write',
  'candidates:read', 'candidates:write',
  'applications:read', 'applications:write',
  'clients:read', 'clients:write',
  'team:read',
  'events:read', 'events:write',
];

const apiKeySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de la clé est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
  },

  // Hash bcrypt de la clé brute — jamais retourné dans les requêtes
  keyHash: {
    type: String,
    required: true,
    select: false,
  },

  // Préfixe de la clé pour identification visuelle (ex: sk_live_ab12cd34)
  keyPrefix: {
    type: String,
    required: true,
  },

  scopes: {
    type: [String],
    enum: VALID_SCOPES,
    default: [],
  },

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  lastUsedAt: {
    type: Date,
    default: null,
  },

  expiresAt: {
    type: Date,
    default: null,
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
}, {
  timestamps: true,
});

apiKeySchema.index({ companyId: 1, isActive: 1 });
apiKeySchema.index({ keyPrefix: 1 });

export { VALID_SCOPES };
export default mongoose.model('ApiKey', apiKeySchema);
