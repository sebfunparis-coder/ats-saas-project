/**
 * 📧 EmailTemplate Model
 *
 * Templates d'email personnalisables par company.
 * Les corps HTML peuvent contenir des variables {{variableName}}.
 *
 * Slugs réservés (créés automatiquement au premier accès) :
 *  - application-confirmation
 *  - interview-invite
 *  - offer
 *  - rejection
 */

import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema({
  // Identifiant technique unique dans la company
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },

  // Libellé affiché dans l'interface
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
  },

  // Objet de l'email
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'L\'objet ne peut pas dépasser 200 caractères'],
  },

  // Corps HTML — peut contenir {{variableName}}
  htmlBody: {
    type: String,
    required: true,
    maxlength: [20000, 'Le corps ne peut pas dépasser 20 000 caractères'],
  },

  // Variables disponibles dans ce template (documentation)
  variables: [{
    type: String,
    trim: true,
  }],

  // Multi-tenant
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Index unique : un slug par company
emailTemplateSchema.index({ companyId: 1, slug: 1 }, { unique: true });

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);

// ── Templates par défaut ──────────────────────────────────────────────────────

export const DEFAULT_TEMPLATES = [
  {
    slug: 'application-confirmation',
    name: 'Confirmation de candidature',
    subject: 'Votre candidature chez {{companyName}} a bien été reçue',
    variables: ['candidateName', 'missionTitle', 'companyName', 'companyWebsite'],
    htmlBody: `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:24px}
.card{background:white;border-radius:12px;max-width:560px;margin:0 auto;padding:40px;border:1px solid #e5e7eb}
.badge{display:inline-block;background:#dbeafe;color:#1d4ed8;border-radius:20px;padding:4px 12px;font-size:13px;font-weight:600;margin-bottom:24px}
h1{font-size:22px;color:#111827;margin:0 0 16px}
p{color:#6b7280;line-height:1.6;margin:0 0 12px}
.mission{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0}
.mission strong{color:#166534}
.footer{text-align:center;color:#9ca3af;font-size:12px;margin-top:32px;padding-top:20px;border-top:1px solid #f3f4f6}
</style></head>
<body><div class="card">
<div class="badge">✅ Candidature reçue</div>
<h1>Bonjour {{candidateName}},</h1>
<p>Nous avons bien reçu votre candidature chez <strong>{{companyName}}</strong>.</p>
<div class="mission"><strong>📌 Poste : {{missionTitle}}</strong></div>
<p>Notre équipe RH va étudier votre profil et vous recontactera dans les meilleurs délais.</p>
<div class="footer"><p>{{companyName}} · Propulsé par ATS Ultimate</p></div>
</div></body></html>`,
  },
  {
    slug: 'interview-invite',
    name: 'Convocation à un entretien',
    subject: 'Invitation à un entretien — {{missionTitle}} chez {{companyName}}',
    variables: ['candidateName', 'missionTitle', 'companyName', 'interviewDate', 'interviewLocation', 'interviewerName'],
    htmlBody: `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:24px}
.card{background:white;border-radius:12px;max-width:560px;margin:0 auto;padding:40px;border:1px solid #e5e7eb}
.badge{display:inline-block;background:#ede9fe;color:#6d28d9;border-radius:20px;padding:4px 12px;font-size:13px;font-weight:600;margin-bottom:24px}
h1{font-size:22px;color:#111827;margin:0 0 16px}
p{color:#6b7280;line-height:1.6;margin:0 0 12px}
.details{background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:16px;margin:20px 0}
.details p{margin:4px 0;color:#4c1d95;font-size:14px}
.footer{text-align:center;color:#9ca3af;font-size:12px;margin-top:32px;padding-top:20px;border-top:1px solid #f3f4f6}
</style></head>
<body><div class="card">
<div class="badge">📅 Entretien planifié</div>
<h1>Bonjour {{candidateName}},</h1>
<p>Nous avons le plaisir de vous inviter à un entretien pour le poste de <strong>{{missionTitle}}</strong> chez <strong>{{companyName}}</strong>.</p>
<div class="details">
<p>📅 <strong>Date :</strong> {{interviewDate}}</p>
<p>📍 <strong>Lieu :</strong> {{interviewLocation}}</p>
<p>👤 <strong>Interlocuteur :</strong> {{interviewerName}}</p>
</div>
<p>Merci de confirmer votre présence en répondant à cet email.</p>
<div class="footer"><p>{{companyName}} · Propulsé par ATS Ultimate</p></div>
</div></body></html>`,
  },
  {
    slug: 'offer',
    name: "Offre d'emploi",
    subject: "Offre d'emploi — {{missionTitle}} chez {{companyName}}",
    variables: ['candidateName', 'missionTitle', 'companyName', 'startDate', 'salary'],
    htmlBody: `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:24px}
.card{background:white;border-radius:12px;max-width:560px;margin:0 auto;padding:40px;border:1px solid #e5e7eb}
.badge{display:inline-block;background:#dcfce7;color:#15803d;border-radius:20px;padding:4px 12px;font-size:13px;font-weight:600;margin-bottom:24px}
h1{font-size:22px;color:#111827;margin:0 0 16px}
p{color:#6b7280;line-height:1.6;margin:0 0 12px}
.offer{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0}
.offer p{margin:4px 0;color:#166534;font-size:14px}
.footer{text-align:center;color:#9ca3af;font-size:12px;margin-top:32px;padding-top:20px;border-top:1px solid #f3f4f6}
</style></head>
<body><div class="card">
<div class="badge">🎉 Offre d'emploi</div>
<h1>Félicitations {{candidateName}} !</h1>
<p>Nous avons le plaisir de vous proposer le poste de <strong>{{missionTitle}}</strong> au sein de <strong>{{companyName}}</strong>.</p>
<div class="offer">
<p>📌 <strong>Poste :</strong> {{missionTitle}}</p>
<p>📅 <strong>Date de début :</strong> {{startDate}}</p>
<p>💰 <strong>Rémunération :</strong> {{salary}}</p>
</div>
<p>Merci de nous faire part de votre réponse dans les 5 jours ouvrés.</p>
<div class="footer"><p>{{companyName}} · Propulsé par ATS Ultimate</p></div>
</div></body></html>`,
  },
  {
    slug: 'rejection',
    name: 'Refus de candidature',
    subject: 'Réponse à votre candidature — {{missionTitle}}',
    variables: ['candidateName', 'missionTitle', 'companyName'],
    htmlBody: `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:24px}
.card{background:white;border-radius:12px;max-width:560px;margin:0 auto;padding:40px;border:1px solid #e5e7eb}
h1{font-size:22px;color:#111827;margin:0 0 16px}
p{color:#6b7280;line-height:1.6;margin:0 0 12px}
.footer{text-align:center;color:#9ca3af;font-size:12px;margin-top:32px;padding-top:20px;border-top:1px solid #f3f4f6}
</style></head>
<body><div class="card">
<h1>Bonjour {{candidateName}},</h1>
<p>Nous vous remercions de l'intérêt que vous avez porté à <strong>{{companyName}}</strong> et du temps consacré à votre candidature pour le poste de <strong>{{missionTitle}}</strong>.</p>
<p>Après examen attentif de votre dossier, nous avons le regret de ne pas pouvoir donner suite à votre candidature. Cette décision est indépendante de la qualité de votre profil.</p>
<p>Nous vous souhaitons plein succès dans vos recherches et espérons avoir l'opportunité de collaborer à l'avenir.</p>
<div class="footer"><p>{{companyName}} · Propulsé par ATS Ultimate</p></div>
</div></body></html>`,
  },
];

export default EmailTemplate;
