/**
 * Email Service — Nodemailer
 *
 * Envoi non-bloquant avec fallback gracieux si SMTP non configuré.
 */

import { getTransporter, EMAIL_FROM, getEmailProvider } from '../config/email.config.js';
import logger from '../utils/logger.js';

/**
 * Send an email. Never throws — logs and returns false on failure.
 * @param {string} to
 * @param {string} subject
 * @param {string} html
 * @param {string} [text] - Plain-text fallback
 * @returns {Promise<boolean>}
 */
export const sendEmail = async (to, subject, html, text) => {
  const transporter = getTransporter();

  if (!transporter) {
    logger.warn('Email non envoyé — aucun provider configuré', { to, subject });
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),
    });
    logger.info('Email envoyé', { to, subject, provider: getEmailProvider(), messageId: info.messageId });
    return true;
  } catch (error) {
    logger.error('Échec envoi email', { to, subject, provider: getEmailProvider(), error: error.message });
    return false;
  }
};

// ===== EMAIL TEMPLATES =====

/**
 * Reset password email
 */
export const sendResetPasswordEmail = (to, resetUrl) => {
  const subject = 'Réinitialisation de votre mot de passe — ATS Ultimate';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Réinitialisation de mot de passe</h2>
      <p>Bonjour,</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe ATS Ultimate.</p>
      <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          Réinitialiser mon mot de passe
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas fait cette demande, ignorez cet email.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px;">ATS Ultimate — Plateforme de recrutement</p>
    </div>
  `;
  return sendEmail(to, subject, html);
};

/**
 * Email verification email
 */
export const sendVerificationEmail = (to, verifyUrl) => {
  const subject = 'Vérifiez votre adresse email — ATS Ultimate';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Confirmez votre adresse email</h2>
      <p>Bonjour,</p>
      <p>Merci de vous être inscrit sur ATS Ultimate. Veuillez confirmer votre adresse email :</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          Vérifier mon email
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        Ce lien expire dans <strong>24 heures</strong>.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px;">ATS Ultimate — Plateforme de recrutement</p>
    </div>
  `;
  return sendEmail(to, subject, html);
};

/**
 * Team member invitation email
 */
export const sendTeamInvitationEmail = (to, { inviterName, companyName, role, inviteUrl }) => {
  const subject = `Invitation à rejoindre ${companyName} sur ATS Ultimate`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Vous êtes invité(e) !</h2>
      <p>Bonjour,</p>
      <p><strong>${inviterName}</strong> vous invite à rejoindre <strong>${companyName}</strong> sur ATS Ultimate en tant que <strong>${role}</strong>.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${inviteUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          Accepter l'invitation
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        Cette invitation expire dans <strong>7 jours</strong>.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px;">ATS Ultimate — Plateforme de recrutement</p>
    </div>
  `;
  return sendEmail(to, subject, html);
};

/**
 * Confirmation de candidature envoyée au candidat depuis le portail public.
 */
export const sendApplicationConfirmation = (to, { candidateName, missionTitle, companyName, companyWebsite }) => {
  const subject = `Votre candidature chez ${companyName} a bien été reçue`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Candidature reçue ✅</h2>
      <p>Bonjour ${candidateName},</p>
      <p>Nous avons bien reçu votre candidature chez <strong>${companyName}</strong> pour le poste :</p>
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:16px; margin:20px 0;">
        <strong style="color:#166534;">📌 ${missionTitle}</strong>
      </div>
      <p>Notre équipe RH va étudier votre profil et vous recontactera dans les meilleurs délais.</p>
      ${companyWebsite ? `<p>En savoir plus sur nous : <a href="${companyWebsite}" style="color:#2563eb;">${companyWebsite}</a></p>` : ''}
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px;">${companyName} · Propulsé par ATS Ultimate</p>
    </div>
  `;
  return sendEmail(to, subject, html);
};

/**
 * Application status change email (to candidate)
 */
export const sendApplicationStatusEmail = (to, { candidateName, missionTitle, newStatus, companyName }) => {
  const statusLabels = {
    screening: 'en cours de présélection',
    interview: 'retenu(e) pour un entretien',
    offer: 'sélectionné(e) pour une offre',
    hired: 'retenu(e) pour le poste',
    rejected: 'non retenu(e) pour ce poste'
  };

  const label = statusLabels[newStatus] || newStatus;
  const subject = `Mise à jour de votre candidature — ${missionTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Mise à jour de votre candidature</h2>
      <p>Bonjour ${candidateName},</p>
      <p>Votre candidature pour le poste <strong>${missionTitle}</strong> chez <strong>${companyName}</strong> a été mise à jour.</p>
      <p>Nouveau statut : <strong>${label}</strong></p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px;">ATS Ultimate — Plateforme de recrutement</p>
    </div>
  `;
  return sendEmail(to, subject, html);
};
