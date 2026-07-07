/**
 * 🔗 JobboardIntegration Model
 *
 * Stocke la configuration des intégrations jobboards par company.
 *
 * T-377 : `credentials` était un sous-document Mongoose à champs nommés
 * (clientSecret, accessToken, apiKey en clair) — remplacé par une chaîne
 * unique contenant un blob JSON chiffré (AES-256-GCM, voir utils/encryption.js),
 * pour supporter n'importe quelle clé (les services jobboard utilisent aussi
 * partnerId/username/password selon la plateforme, pas seulement les 5 champs
 * qui étaient déclarés ici) sans jamais persister de secret en clair.
 *
 * Plateformes supportées : linkedin, indeed, wttj, hellowork, apec, monster
 */

import mongoose from 'mongoose';

const jobboardIntegrationSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  },

  platform: {
    type: String,
    // Découvert en corrigeant T-377 : l'enum ne listait que les 3 premières
    // plateformes (T-267/268) alors que integration.controller.js accepte
    // aussi hellowork/apec/monster (T-269) — sans ces valeurs, sauvegarder
    // une config pour l'une de ces 3 plateformes échouait (runValidators).
    enum: ['linkedin', 'indeed', 'wttj', 'hellowork', 'apec', 'monster'],
    required: true,
  },

  enabled: {
    type: Boolean,
    default: false,
  },

  // T-377 : blob JSON chiffré (AES-256-GCM) — jamais de credentials en clair
  // en base. Voir utils/encryption.js (encryptJSON/decryptJSON) et
  // integration.controller.js pour les points d'accès. Champ générique
  // (String) plutôt que des sous-champs nommés : les différentes plateformes
  // utilisent des clés différentes (clientSecret/accessToken/apiKey/
  // publisherId pour LinkedIn/Indeed, mais aussi partnerId/username/password
  // pour APEC/Monster), un typage strict par nom aurait silencieusement
  // supprimé les clés non déclarées.
  credentials: {
    type: String,
    default: '',
  },

  // Mapping missionId → externalJobId (pour pouvoir dépublier)
  publishedJobs: [{
    missionId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Mission' },
    externalJobId: { type: String },
    publishedAt:  { type: Date, default: Date.now },
    url:          { type: String },
  }],

  lastTestedAt: { type: Date },
  lastTestResult: {
    type: String,
    enum: ['success', 'error', null],
    default: null,
  },
  lastTestMessage: { type: String },
}, {
  timestamps: true,
});

// Index unique : une config par platform par company
jobboardIntegrationSchema.index({ companyId: 1, platform: 1 }, { unique: true });

const JobboardIntegration = mongoose.model('JobboardIntegration', jobboardIntegrationSchema);

export default JobboardIntegration;
