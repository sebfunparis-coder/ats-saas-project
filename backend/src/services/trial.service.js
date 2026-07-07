/**
 * Trial Notification Service
 *
 * Vérifie chaque jour les trials qui expirent et envoie des emails de rappel.
 * Lancé au démarrage du serveur.
 */

import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import { sendEmail } from './email.service.js';

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24h

const useMockDB = () => mongoose.connection.readyState !== 1;

const getTrialReminderHtml = (companyName, daysLeft, checkoutUrl) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#2563eb;">Votre essai gratuit expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}</h2>
  <p>Bonjour,</p>
  <p>Votre période d'essai <strong>ATS Ultimate</strong> pour <strong>${companyName}</strong> se termine dans <strong>${daysLeft} jour${daysLeft > 1 ? 's' : ''}</strong>.</p>
  <p>Pour continuer à utiliser toutes les fonctionnalités sans interruption, choisissez un plan :</p>
  <div style="text-align:center;margin:32px 0;">
    <a href="${checkoutUrl}" style="background-color:#2563eb;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
      Choisir un plan →
    </a>
  </div>
  <p style="color:#6b7280;font-size:13px;">Plans à partir de 49€/mois. Annulez à tout moment.</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
  <p style="color:#9ca3af;font-size:12px;">ATS Ultimate — Plateforme de recrutement</p>
</div>
`;

const sendTrialReminders = async () => {
  if (useMockDB()) return;

  try {
    const Company = (await import('../models/Company.model.js')).default;
    const User = (await import('../models/User.model.js')).default;

    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

    const checkoutUrl = `${process.env.FRONTEND_URL}/app/admin?tab=billing`;

    // Trouver les companies en trial qui expirent dans 7 ou 1 jour (±12h de tolérance)
    const tolerance = 12 * 60 * 60 * 1000;

    for (const [target, daysLeft] of [[in7Days, 7], [in1Day, 1]]) {
      const from = new Date(target.getTime() - tolerance);
      const to = new Date(target.getTime() + tolerance);

      const companies = await Company.find({
        status: 'trial',
        trialEndsAt: { $gte: from, $lte: to },
      }).select('name email');

      for (const company of companies) {
        // Trouver l'admin de la company
        const admin = await User.findOne({
          companyId: company._id,
          role: { $in: ['admin', 'superadmin'] },
          isActive: true,
        }).select('email firstName');

        if (!admin) continue;

        const html = getTrialReminderHtml(company.name, daysLeft, checkoutUrl);
        await sendEmail(
          admin.email,
          `Votre essai ATS Ultimate expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`,
          html
        );

        logger.info('Trial reminder envoyé', {
          companyId: company._id,
          email: admin.email,
          daysLeft,
        });
      }
    }
  } catch (err) {
    logger.error('Erreur trial reminder service', { error: err.message });
  }
};

let _timer = null;

export const startTrialService = () => {
  if (_timer) return;

  // Premier check immédiat (après 1 minute pour laisser le serveur démarrer)
  setTimeout(sendTrialReminders, 60_000);

  // Puis toutes les 24h
  _timer = setInterval(sendTrialReminders, CHECK_INTERVAL_MS);
  _timer.unref(); // Ne pas bloquer le process.exit

  logger.info('Trial notification service démarré (check toutes les 24h)');
};

export const stopTrialService = () => {
  if (_timer) {
    clearInterval(_timer);
    _timer = null;
  }
};
