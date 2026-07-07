/**
 * 📋 AuditLog Model
 *
 * Journal d'audit immuable (insert-only) — RGPD compliance.
 */

import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  userEmail: {
    type: String,
    trim: true,
    index: true
  },
  action: {
    type: String,
    enum: ['POST', 'PUT', 'PATCH', 'DELETE'],
    required: true,
    index: true
  },
  entity: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  entityId: {
    type: String,
    default: null
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  ip: {
    type: String,
    trim: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    index: true
  }
}, {
  timestamps: true
});

// ===== INDEXES =====
auditLogSchema.index({ companyId: 1, createdAt: -1 });
auditLogSchema.index({ companyId: 1, entity: 1, createdAt: -1 });
auditLogSchema.index({ companyId: 1, userId: 1, createdAt: -1 });

// ===== INSERT-ONLY ENFORCEMENT =====

auditLogSchema.pre('save', function(next) {
  if (!this.isNew) {
    return next(new Error('AuditLog is insert-only and cannot be modified'));
  }
  next();
});

for (const hook of ['updateOne', 'updateMany', 'findOneAndUpdate', 'findOneAndReplace', 'replaceOne']) {
  auditLogSchema.pre(hook, function(next) {
    next(new Error('AuditLog is insert-only'));
  });
}

// ===== EXPORT =====

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
