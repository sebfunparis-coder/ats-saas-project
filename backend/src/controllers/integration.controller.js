/**
 * 🔗 Integration Controller
 *
 * Gère la configuration et l'utilisation des intégrations jobboards.
 * Endpoints protégés admin/manager/superadmin.
 */

import JobboardIntegration from '../models/JobboardIntegration.model.js';
import Mission from '../models/Mission.model.js';
import Company from '../models/Company.model.js';
import { AppError } from '../utils/AppError.js';
import { publishToJobboard, testJobboard } from '../services/jobboard.service.js';
import { encryptJSON, decryptJSON } from '../utils/encryption.js';

const PLATFORMS = ['linkedin', 'indeed', 'wttj', 'hellowork', 'apec', 'monster'];

// ── GET /api/integrations ────────────────────────────────────────────────────

export const getIntegrations = async (req, res, next) => {
  try {
    const { companyId } = req.user;

    const saved = await JobboardIntegration.find({ companyId }).lean();

    // Retourner toutes les plateformes connues, en masquant les secrets
    const integrations = PLATFORMS.map(platform => {
      const config = saved.find(i => i.platform === platform) || {};
      const credentials = decryptJSON(config.credentials);

      // Masquer les valeurs sensibles
      const maskedCredentials = {};
      for (const [k, v] of Object.entries(credentials)) {
        if (v) maskedCredentials[k] = k.toLowerCase().includes('secret') || k.toLowerCase().includes('token') || k.toLowerCase().includes('key')
          ? '••••••••' + v.slice(-4)
          : v;
      }

      return {
        platform,
        enabled: config.enabled || false,
        configured: !!(config._id),
        credentials: maskedCredentials,
        publishedJobsCount: config.publishedJobs?.length || 0,
        lastTestedAt: config.lastTestedAt,
        lastTestResult: config.lastTestResult,
        lastTestMessage: config.lastTestMessage,
      };
    });

    res.json({ success: true, data: integrations });
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/integrations/:platform ──────────────────────────────────────────

export const saveIntegration = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { platform } = req.params;

    if (!PLATFORMS.includes(platform)) throw new AppError(`Plateforme inconnue : ${platform}`, 400);

    const { enabled, credentials = {} } = req.body;

    // Ne pas écraser les secrets déjà stockés si la valeur masquée est envoyée
    const existing = await JobboardIntegration.findOne({ companyId, platform });
    const mergedCredentials = { ...decryptJSON(existing?.credentials) };

    for (const [k, v] of Object.entries(credentials)) {
      // Ignorer les valeurs masquées (••••)
      if (v && !String(v).includes('••••')) {
        mergedCredentials[k] = String(v).trim();
      }
    }

    const integration = await JobboardIntegration.findOneAndUpdate(
      { companyId, platform },
      { $set: { enabled: !!enabled, credentials: encryptJSON(mergedCredentials) } },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, data: { platform, enabled: integration.enabled }, message: 'Intégration enregistrée' });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/integrations/:platform/test ────────────────────────────────────

export const testIntegration = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { platform } = req.params;

    if (!PLATFORMS.includes(platform)) throw new AppError(`Plateforme inconnue : ${platform}`, 400);

    const integration = await JobboardIntegration.findOne({ companyId, platform });
    if (!integration) throw new AppError('Intégration non configurée', 404);

    let result = 'error';
    let message = '';

    try {
      await testJobboard(platform, decryptJSON(integration.credentials));
      result = 'success';
      message = 'Connexion établie avec succès.';
    } catch (err) {
      message = err.message;
    }

    integration.lastTestedAt = new Date();
    integration.lastTestResult = result;
    integration.lastTestMessage = message;
    await integration.save();

    res.json({
      success: result === 'success',
      data: { result, message },
      message: result === 'success' ? message : `Test échoué : ${message}`,
    });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/integrations/:platform/publish/:missionId ──────────────────────

export const publishMissionToJobboard = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { platform, missionId } = req.params;

    if (!PLATFORMS.includes(platform)) throw new AppError(`Plateforme inconnue : ${platform}`, 400);

    const [integration, mission, company] = await Promise.all([
      JobboardIntegration.findOne({ companyId, platform }),
      Mission.findOne({ _id: missionId, companyId }),
      Company.findById(companyId).select('name').lean(),
    ]);

    if (!integration) throw new AppError('Intégration non configurée. Ajoutez vos credentials dans les paramètres.', 404);
    if (!integration.enabled) throw new AppError('Intégration désactivée. Activez-la dans les paramètres.', 400);
    if (!mission) throw new AppError('Mission introuvable', 404);
    if (!['active', 'pending_approval'].includes(mission.status)) {
      throw new AppError('Seules les missions actives ou approuvées peuvent être publiées sur les jobboards', 400);
    }

    // Vérifier si déjà publiée sur cette plateforme
    const alreadyPublished = integration.publishedJobs.find(j => j.missionId?.toString() === missionId);
    if (alreadyPublished) {
      return res.json({
        success: true,
        data: alreadyPublished,
        message: `Mission déjà publiée sur ${platform}`,
      });
    }

    const credentials = decryptJSON(integration.credentials);
    const { externalJobId, url } = await publishToJobboard(platform, mission, credentials, company?.name || '');

    integration.publishedJobs.push({ missionId, externalJobId, publishedAt: new Date(), url });
    await integration.save();

    // Mémoriser la source sur la mission pour le tracking
    if (!mission.jobboardPublications) mission.jobboardPublications = [];
    mission.jobboardPublications = mission.jobboardPublications || [];
    await Mission.updateOne(
      { _id: missionId },
      { $addToSet: { publishedOn: platform } }
    );

    res.json({
      success: true,
      data: { platform, externalJobId, url },
      message: `Mission publiée sur ${platform} avec succès`,
    });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/integrations/:platform/jobs/:externalJobId ───────────────────

export const unpublishMissionFromJobboard = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { platform, externalJobId } = req.params;

    if (!PLATFORMS.includes(platform)) throw new AppError(`Plateforme inconnue : ${platform}`, 400);

    const integration = await JobboardIntegration.findOne({ companyId, platform });
    if (!integration) throw new AppError('Intégration non configurée', 404);

    const credentials = decryptJSON(integration.credentials);

    // Appel API de suppression (best-effort — ne pas bloquer si l'offre a déjà expiré)
    try {
      if (platform === 'linkedin') {
        const { unpublishFromLinkedIn } = await import('../services/jobboard.service.js');
        await unpublishFromLinkedIn(externalJobId, credentials);
      } else if (platform === 'indeed') {
        const { unpublishFromIndeed } = await import('../services/jobboard.service.js');
        await unpublishFromIndeed(externalJobId, credentials);
      }
    } catch (apiErr) {
      console.warn(`[Jobboard] Unpublish warning (${platform}):`, apiErr.message);
    }

    // Retirer de la liste locale
    integration.publishedJobs = integration.publishedJobs.filter(j => j.externalJobId !== externalJobId);
    await integration.save();

    res.json({ success: true, message: `Offre retirée de ${platform}` });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/integrations/:platform/jobs ─────────────────────────────────────

export const getPublishedJobs = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { platform } = req.params;

    if (!PLATFORMS.includes(platform)) throw new AppError(`Plateforme inconnue : ${platform}`, 400);

    const integration = await JobboardIntegration.findOne({ companyId, platform })
      .populate('publishedJobs.missionId', 'title status')
      .lean();

    if (!integration) return res.json({ success: true, data: [] });

    res.json({ success: true, data: integration.publishedJobs || [] });
  } catch (error) {
    next(error);
  }
};
