/**
 * Email transporter configuration (Nodemailer)
 *
 * Ordre de priorité :
 *   1. Resend (RESEND_API_KEY)        → smtp.resend.com:465
 *   2. SendGrid (SENDGRID_API_KEY)    → smtp.sendgrid.net:587
 *   3. SMTP générique (EMAIL_HOST + EMAIL_USER + EMAIL_PASS)
 *   4. Aucun → emails ignorés (mode dev sans SMTP)
 */

import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

let transporter = null;
let providerName = null;

const buildTransporter = () => {
  // 1. Resend
  if (process.env.RESEND_API_KEY) {
    providerName = 'Resend';
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    });
  }

  // 2. SendGrid
  if (process.env.SENDGRID_API_KEY) {
    providerName = 'SendGrid';
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  // 3. SMTP générique
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    providerName = `SMTP (${process.env.EMAIL_HOST})`;
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return null;
};

export const getTransporter = () => {
  if (transporter !== null) return transporter;
  transporter = buildTransporter();
  if (transporter) {
    logger.info(`Email provider actif : ${providerName}`);
  } else {
    logger.warn('Aucun provider email configuré — emails désactivés (RESEND_API_KEY, SENDGRID_API_KEY ou EMAIL_HOST requis)');
  }
  return transporter;
};

export const getEmailProvider = () => providerName;

export const verifyEmailConfig = async () => {
  const t = getTransporter();
  if (!t) return { ok: false, provider: null, error: 'Non configuré' };
  try {
    await t.verify();
    return { ok: true, provider: providerName };
  } catch (err) {
    return { ok: false, provider: providerName, error: err.message };
  }
};

export const EMAIL_FROM = `"${process.env.EMAIL_FROM_NAME || 'ATS Ultimate'}" <${process.env.EMAIL_FROM || 'noreply@ats-ultimate.com'}>`;
