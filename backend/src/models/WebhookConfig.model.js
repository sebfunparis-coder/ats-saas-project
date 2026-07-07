import mongoose from 'mongoose';
import { WEBHOOK_EVENTS } from '../services/webhook.service.js';

const WebhookConfigSchema = new mongoose.Schema({
  companyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  name:        { type: String, default: '' },
  url:         { type: String, required: true },
  events:      [{ type: String, enum: Object.keys(WEBHOOK_EVENTS) }],
  secret:      { type: String, default: null }, // HMAC secret — jamais renvoyé en lecture
  enabled:     { type: Boolean, default: true },
  headers:     { type: Map, of: String, default: {} }, // Headers custom (ex: Authorization)
}, { timestamps: true });

WebhookConfigSchema.index({ companyId: 1, enabled: 1 });

export default mongoose.model('WebhookConfig', WebhookConfigSchema);
