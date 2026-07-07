import mongoose from 'mongoose';

const OnboardingEmailSchema = new mongoose.Schema({
  userId:      { type: String, required: true, index: true },
  email:       { type: String, required: true },
  firstName:   { type: String, default: 'là' },
  companyName: { type: String, default: '' },
  templateKey: { type: String, required: true, enum: ['welcome', 'first_mission', 'import_candidates', 'analytics', 'trial_ending'] },
  scheduledFor:{ type: Date, required: true, index: true },
  status:      { type: String, enum: ['pending', 'sent', 'failed', 'cancelled'], default: 'pending' },
  sentAt:      { type: Date },
  error:       { type: String },
  cancelledAt: { type: Date },
}, { timestamps: true });

OnboardingEmailSchema.index({ status: 1, scheduledFor: 1 });

export default mongoose.model('OnboardingEmail', OnboardingEmailSchema);
