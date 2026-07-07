/**
 * 📧 Onboarding Email Sequence — T-315
 *
 * Séquence de 5 emails automatiques déclenchés après l'inscription.
 * Planification via un job cron (ou Supabase Edge Function).
 *
 * ── Calendrier ────────────────────────────────────────────────────────────────
 * J0  : Email de bienvenue + guide de démarrage
 * J2  : Créer votre première mission
 * J5  : Importer vos candidats
 * J10 : Découvrir les analytics
 * J14 : (Fin trial) Proposition de plan
 *
 * ── Utilisation ───────────────────────────────────────────────────────────────
 * import { scheduleOnboarding } from './onboarding.service.js';
 * await scheduleOnboarding({ userId, email, firstName, companyName, trialEndsAt });
 *
 * ── Déclenchement des emails ──────────────────────────────────────────────────
 * Deux approches :
 * A) Cron job : npm install node-cron, exécuter checkAndSendOnboarding() toutes les heures
 * B) Supabase Edge Function : scheduler cron qui appelle votre endpoint /api/onboarding/trigger
 */

import { sendEmail } from './email.service.js';
import { logger } from '../utils/logger.js';

const APP_URL = process.env.FRONTEND_URL || 'https://ats-ultimate.com';
const SUPPORT_EMAIL = 'support@ats-ultimate.com';

// ── Templates d'email ─────────────────────────────────────────────────────────

const SEQUENCE = [
  {
    dayOffset: 0,
    key: 'welcome',
    subject: 'Bienvenue sur ATS Ultimate 🎉 — Voici comment démarrer',
    getHtml: ({ firstName, companyName }) => `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,sans-serif;background:#F9FAFB;margin:0;padding:40px 20px">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
  <div style="background:linear-gradient(135deg,#667EEA,#764BA2);padding:40px;text-align:center">
    <div style="font-size:48px;margin-bottom:12px">⚡</div>
    <h1 style="color:white;margin:0;font-size:28px;font-weight:900">Bienvenue sur ATS Ultimate !</h1>
  </div>
  <div style="padding:40px">
    <p style="font-size:16px;color:#374151;line-height:1.7">Bonjour ${firstName},</p>
    <p style="font-size:16px;color:#374151;line-height:1.7">
      Félicitations pour avoir rejoint ATS Ultimate ! Vous avez <strong>14 jours</strong> pour découvrir comment recruter plus vite et mieux avec ${companyName}.
    </p>
    <h2 style="font-size:20px;color:#1F2937;margin-top:32px">Vos premières étapes 🚀</h2>
    <div style="background:#F3F4F6;border-radius:12px;padding:24px;margin-top:16px">
      ${['Créer votre première mission (5 min)', 'Inviter votre équipe RH', 'Publier sur votre portail carrières', 'Importer vos candidats existants en CSV'].map((step, i) =>
        `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #E5E7EB">
          <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#667EEA,#764BA2);color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;flex-shrink:0">${i+1}</div>
          <span style="color:#374151;font-size:15px">${step}</span>
        </div>`
      ).join('')}
    </div>
    <div style="text-align:center;margin-top:32px">
      <a href="${APP_URL}/app/dashboard" style="display:inline-block;padding:16px 36px;background:linear-gradient(135deg,#667EEA,#764BA2);color:white;text-decoration:none;border-radius:12px;font-weight:800;font-size:16px">
        Accéder à l'application →
      </a>
    </div>
    <p style="font-size:14px;color:#6B7280;margin-top:32px;line-height:1.6">
      Des questions ? Consultez notre <a href="${APP_URL}/aide" style="color:#667EEA">centre d'aide</a> ou répondez directement à cet email.
    </p>
  </div>
  <div style="background:#F9FAFB;padding:24px;text-align:center">
    <p style="font-size:12px;color:#9CA3AF;margin:0">ATS Ultimate SAS · <a href="${APP_URL}/politique-confidentialite" style="color:#6B7280">Confidentialité</a> · <a href="${APP_URL}/se-desabonner" style="color:#6B7280">Se désabonner</a></p>
  </div>
</div></body></html>`,
  },
  {
    dayOffset: 2,
    key: 'first_mission',
    subject: '💼 Créez votre première mission en 3 minutes',
    getHtml: ({ firstName, companyName }) => `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="font-family:system-ui,sans-serif;background:#F9FAFB;margin:0;padding:40px 20px">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);padding:40px">
  <h1 style="font-size:26px;color:#1F2937;margin-bottom:8px">Votre recrutement commence ici 💼</h1>
  <p style="font-size:16px;color:#374151;line-height:1.7">Bonjour ${firstName},</p>
  <p style="font-size:16px;color:#374151;line-height:1.7">
    La première étape pour recruter avec ATS Ultimate : créer une mission. En 3 minutes, vous pouvez publier une offre et la diffuser sur votre portail carrières.
  </p>
  <div style="background:#EEF2FF;border-radius:12px;padding:24px;margin:24px 0;border-left:4px solid #667EEA">
    <p style="font-size:15px;color:#4338CA;margin:0"><strong>💡 Astuce :</strong> Utilisez les questions de pré-sélection pour filtrer automatiquement les candidatures non qualifiées avant même de les lire.</p>
  </div>
  <a href="${APP_URL}/app/missions" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#667EEA,#764BA2);color:white;text-decoration:none;border-radius:12px;font-weight:800;font-size:15px">Créer ma première mission →</a>
  <p style="font-size:14px;color:#6B7280;margin-top:24px">Besoin d'aide ? <a href="${APP_URL}/aide#start" style="color:#667EEA">Guide de démarrage rapide</a></p>
</div></body></html>`,
  },
  {
    dayOffset: 5,
    key: 'import_candidates',
    subject: '👥 Importez vos candidats existants (en 5 min)',
    getHtml: ({ firstName }) => `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="font-family:system-ui,sans-serif;background:#F9FAFB;margin:0;padding:40px 20px">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);padding:40px">
  <h1 style="font-size:26px;color:#1F2937;margin-bottom:8px">Votre vivier de talents vous attend 👥</h1>
  <p style="font-size:16px;color:#374151;line-height:1.7">Bonjour ${firstName},</p>
  <p style="font-size:16px;color:#374151;line-height:1.7">
    Vous avez sûrement des candidats dans un fichier Excel ou un autre outil. Importez-les en CSV en 5 minutes et bénéficiez immédiatement de la recherche sémantique et du scoring IA.
  </p>
  <div style="display:grid;gap:12px;margin:24px 0">
    ${['Upload du fichier CSV', 'Mapping automatique des colonnes (nom, email, compétences…)', 'Détection des doublons', 'Import avec rapport détaillé'].map((step, i) =>
      `<div style="display:flex;gap:12px;align-items:flex-start">
        <span style="color:#667EEA;font-size:18px;flex-shrink:0">✓</span>
        <span style="font-size:15px;color:#374151">${step}</span>
      </div>`
    ).join('')}
  </div>
  <a href="${APP_URL}/app/candidates" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#667EEA,#764BA2);color:white;text-decoration:none;border-radius:12px;font-weight:800;font-size:15px">Importer mes candidats →</a>
</div></body></html>`,
  },
  {
    dayOffset: 10,
    key: 'analytics',
    subject: '📊 Mesurez votre performance RH en temps réel',
    getHtml: ({ firstName }) => `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="font-family:system-ui,sans-serif;background:#F9FAFB;margin:0;padding:40px 20px">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);padding:40px">
  <h1 style="font-size:26px;color:#1F2937;margin-bottom:8px">Vos analytics sont prêts 📊</h1>
  <p style="font-size:16px;color:#374151;line-height:1.7">Bonjour ${firstName},</p>
  <p style="font-size:16px;color:#374151;line-height:1.7">
    Grâce aux données accumulées depuis votre arrivée, vous pouvez maintenant mesurer vos performances de recrutement en temps réel.
  </p>
  <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin:20px 0">
    <p style="font-size:14px;color:#374151;margin-bottom:12px"><strong>Ce que vous pouvez mesurer :</strong></p>
    ${['Time-to-hire (délai moyen de recrutement)', 'Sources de candidatures les plus performantes', 'Entonnoir de conversion par étape', 'Charge de travail par recruteur', 'Taux d\'embauche par mission'].map(m =>
      `<div style="padding:6px 0;font-size:14px;color:#6B7280">• ${m}</div>`
    ).join('')}
  </div>
  <a href="${APP_URL}/app/analytics" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#667EEA,#764BA2);color:white;text-decoration:none;border-radius:12px;font-weight:800;font-size:15px">Voir mes analytics →</a>
</div></body></html>`,
  },
  {
    dayOffset: 14,
    key: 'trial_ending',
    subject: '⏰ Votre essai gratuit se termine bientôt',
    getHtml: ({ firstName, companyName }) => `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="font-family:system-ui,sans-serif;background:#F9FAFB;margin:0;padding:40px 20px">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);padding:40px">
  <h1 style="font-size:26px;color:#1F2937;margin-bottom:8px">Continuez à recruter avec ${companyName} ⏰</h1>
  <p style="font-size:16px;color:#374151;line-height:1.7">Bonjour ${firstName},</p>
  <p style="font-size:16px;color:#374151;line-height:1.7">
    Votre essai gratuit de 14 jours se termine bientôt. Pour ne pas perdre vos données et continuer à utiliser ATS Ultimate, choisissez votre plan dès maintenant.
  </p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:28px 0">
    <div style="border:2px solid #E5E7EB;border-radius:12px;padding:20px;text-align:center">
      <div style="font-size:22px;font-weight:900;color:#1F2937">99€</div>
      <div style="font-size:13px;color:#6B7280;margin:4px 0">/mois — Starter</div>
      <div style="font-size:12px;color:#374151;margin-top:8px">10 missions · 200 candidats · Support email</div>
    </div>
    <div style="border:2px solid #667EEA;border-radius:12px;padding:20px;text-align:center;background:#EEF2FF">
      <div style="font-size:11px;font-weight:700;color:#667EEA;margin-bottom:4px">⭐ RECOMMANDÉ</div>
      <div style="font-size:22px;font-weight:900;color:#667EEA">299€</div>
      <div style="font-size:13px;color:#6B7280;margin:4px 0">/mois — Professional</div>
      <div style="font-size:12px;color:#374151;margin-top:8px">Illimité · IA avancée · Support 4h</div>
    </div>
  </div>
  <div style="text-align:center">
    <a href="${APP_URL}/pricing" style="display:inline-block;padding:16px 36px;background:linear-gradient(135deg,#667EEA,#764BA2);color:white;text-decoration:none;border-radius:12px;font-weight:800;font-size:16px">Choisir mon plan →</a>
    <p style="font-size:12px;color:#9CA3AF;margin-top:12px">✓ Sans engagement · ✓ Annulation en 1 clic · ✓ Données conservées</p>
  </div>
</div></body></html>`,
  },
];

// ── Scheduling ─────────────────────────────────────────────────────────────────

/**
 * Enregistre une séquence d'onboarding pour un nouvel utilisateur.
 * Stocké dans la DB (table onboarding_emails) pour être exécuté par le cron.
 */
export async function scheduleOnboarding({ userId, email, firstName, companyName, trialEndsAt }) {
  if (!userId || !email) {
    logger.warn('[Onboarding] scheduleOnboarding appelé sans userId ou email');
    return;
  }

  // Lazy import pour éviter les dépendances circulaires
  let OnboardingEmail;
  try {
    OnboardingEmail = (await import('../models/OnboardingEmail.model.js')).default;
  } catch {
    logger.debug('[Onboarding] Modèle OnboardingEmail non disponible (mock mode ou migration manquante)');
    return;
  }

  const signupDate = new Date();
  const emails = SEQUENCE.map(seq => ({
    userId,
    email,
    firstName: firstName || 'là',
    companyName: companyName || 'votre équipe',
    templateKey: seq.key,
    scheduledFor: new Date(signupDate.getTime() + seq.dayOffset * 86400000),
    status: 'pending',
  }));

  await OnboardingEmail.insertMany(emails);
  logger.info('[Onboarding] Séquence programmée', { userId, emails: emails.length });
}

/**
 * À appeler toutes les heures via un cron job ou Supabase Edge Function.
 * Envoie les emails dont la date d'envoi est dépassée.
 */
export async function sendPendingOnboardingEmails() {
  let OnboardingEmail;
  try {
    OnboardingEmail = (await import('../models/OnboardingEmail.model.js')).default;
  } catch {
    return;
  }

  const pending = await OnboardingEmail.find({
    status: 'pending',
    scheduledFor: { $lte: new Date() },
  }).limit(50).lean();

  if (!pending.length) return;

  logger.info(`[Onboarding] ${pending.length} email(s) à envoyer`);

  const results = await Promise.allSettled(pending.map(async (item) => {
    const seq = SEQUENCE.find(s => s.key === item.templateKey);
    if (!seq) return;

    try {
      await sendEmail({
        to: item.email,
        subject: seq.subject,
        html: seq.getHtml({ firstName: item.firstName, companyName: item.companyName }),
      });
      await OnboardingEmail.updateOne({ _id: item._id }, { status: 'sent', sentAt: new Date() });
      logger.info('[Onboarding] Email envoyé', { email: item.email, key: item.templateKey });
    } catch (err) {
      await OnboardingEmail.updateOne({ _id: item._id }, { status: 'failed', error: err.message });
      logger.error('[Onboarding] Erreur envoi email', { email: item.email, key: item.templateKey, error: err.message });
    }
  }));

  return results;
}

/**
 * Annule la séquence d'onboarding (résiliation, fin trial, etc.)
 */
export async function cancelOnboarding(userId) {
  let OnboardingEmail;
  try {
    OnboardingEmail = (await import('../models/OnboardingEmail.model.js')).default;
  } catch { return; }

  await OnboardingEmail.updateMany(
    { userId, status: 'pending' },
    { status: 'cancelled', cancelledAt: new Date() }
  );
  logger.info('[Onboarding] Séquence annulée', { userId });
}

export default { scheduleOnboarding, sendPendingOnboardingEmails, cancelOnboarding };
