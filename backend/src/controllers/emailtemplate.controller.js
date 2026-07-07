/**
 * 📧 EmailTemplate Controller
 *
 * CRUD des templates d'email personnalisables.
 * Les templates par défaut sont créés automatiquement au premier listTemplates.
 */

import EmailTemplate, { DEFAULT_TEMPLATES } from '../models/EmailTemplate.model.js';
import { AppError } from '../middleware/error.middleware.js';
import { sendEmail } from '../services/email.service.js';
import User from '../models/User.model.js';

// ── Rendu d'un template avec variables ───────────────────────────────────────

export const renderTemplate = (template, vars = {}) => {
  let subject = template.subject;
  let html = template.htmlBody;

  for (const [key, value] of Object.entries(vars)) {
    const re = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    const safe = String(value ?? '');
    subject = subject.replace(re, safe);
    html = html.replace(re, safe);
  }

  return { subject, html };
};

// ── Seed des templates par défaut pour une company ───────────────────────────

const seedDefaultTemplates = async (companyId, userId) => {
  const ops = DEFAULT_TEMPLATES.map(tpl => ({
    updateOne: {
      filter: { companyId, slug: tpl.slug },
      update: {
        $setOnInsert: {
          ...tpl,
          companyId,
          createdBy: userId,
        },
      },
      upsert: true,
    },
  }));
  await EmailTemplate.bulkWrite(ops);
};

// ── GET /api/email-templates ──────────────────────────────────────────────────

export const listTemplates = async (req, res, next) => {
  try {
    const { companyId, id: userId } = req.user;

    // Crée les templates par défaut s'ils n'existent pas encore
    await seedDefaultTemplates(companyId, userId);

    const templates = await EmailTemplate.find({ companyId })
      .select('-htmlBody') // Ne pas renvoyer le corps complet dans la liste
      .sort({ createdAt: 1 });

    res.json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/email-templates/:slug ───────────────────────────────────────────

export const getTemplate = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { slug } = req.params;

    const template = await EmailTemplate.findOne({ companyId, slug });
    if (!template) throw new AppError('Template introuvable', 404);

    res.json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/email-templates/:slug ───────────────────────────────────────────

export const updateTemplate = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { slug } = req.params;
    const { subject, htmlBody } = req.body;

    if (!subject?.trim()) throw new AppError('L\'objet est requis', 400);
    if (!htmlBody?.trim()) throw new AppError('Le corps du template est requis', 400);

    const template = await EmailTemplate.findOneAndUpdate(
      { companyId, slug },
      { subject: subject.trim(), htmlBody: htmlBody.trim() },
      { new: true, runValidators: true }
    );

    if (!template) throw new AppError('Template introuvable', 404);

    res.json({ success: true, data: template, message: 'Template mis à jour' });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/email-templates/:slug/reset ────────────────────────────────────

export const resetTemplate = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { slug } = req.params;

    const defaultTpl = DEFAULT_TEMPLATES.find(t => t.slug === slug);
    if (!defaultTpl) throw new AppError('Template inconnu', 404);

    const template = await EmailTemplate.findOneAndUpdate(
      { companyId, slug },
      { subject: defaultTpl.subject, htmlBody: defaultTpl.htmlBody },
      { new: true }
    );

    if (!template) throw new AppError('Template introuvable', 404);

    res.json({ success: true, data: template, message: 'Template réinitialisé' });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/email-templates/:slug/test ─────────────────────────────────────

export const sendTestEmail = async (req, res, next) => {
  try {
    const { companyId, id: userId } = req.user;
    const { slug } = req.params;

    const [template, userDoc] = await Promise.all([
      EmailTemplate.findOne({ companyId, slug }),
      User.findById(userId).select('email firstName lastName'),
    ]);

    if (!template) throw new AppError('Template introuvable', 404);

    const testVars = {
      candidateName: `${userDoc.firstName} ${userDoc.lastName}`,
      missionTitle: 'Développeur Full Stack (test)',
      companyName: 'Votre Entreprise',
      companyWebsite: 'https://exemple.com',
      interviewDate: new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      interviewLocation: 'Visioconférence (lien envoyé séparément)',
      interviewerName: 'Marie Dupont, RRH',
      startDate: 'Dès que possible',
      salary: '45 000 € / an',
    };

    const { subject, html } = renderTemplate(template, testVars);
    const sent = await sendEmail(userDoc.email, `[TEST] ${subject}`, html);

    if (!sent) {
      // sendEmail retourne false si SMTP non configuré
      return res.json({
        success: true,
        message: 'SMTP non configuré — aperçu du rendu ci-dessous',
        data: { preview: { subject, html } },
      });
    }

    res.json({
      success: true,
      message: `Email de test envoyé à ${userDoc.email}`,
    });
  } catch (error) {
    next(error);
  }
};

export default { listTemplates, getTemplate, updateTemplate, resetTemplate, sendTestEmail };
