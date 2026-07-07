import mongoose from 'mongoose';

const WebhookLogSchema = new mongoose.Schema({
  companyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  webhookId:    { type: mongoose.Schema.Types.ObjectId, ref: 'WebhookConfig' },
  event:        { type: String, required: true },
  url:          { type: String, required: true },
  success:      { type: Boolean, required: true },
  attempts:     { type: Number, default: 1 },
  lastStatus:   { type: Number },
  lastError:    { type: String },
  duration:     { type: Number }, // ms
}, { timestamps: true });

// TTL : logs supprimés automatiquement après 90 jours
WebhookLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 86400 });
WebhookLogSchema.index({ companyId: 1, webhookId: 1 });

export default mongoose.model('WebhookLog', WebhookLogSchema);
