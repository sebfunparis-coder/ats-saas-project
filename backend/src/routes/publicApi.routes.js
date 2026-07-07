/**
 * 🌐 API Publique — T-277
 *
 * Endpoints REST accessibles via clé API (sk_live_*) pour les intégrateurs.
 * Authentication : Authorization: Bearer sk_live_<clé>
 *
 * Scopes disponibles (gérés dans AdminPage → Clés API) :
 *   missions:read, missions:write
 *   candidates:read, candidates:write
 *   applications:read (à activer dans VALID_SCOPES si besoin)
 *
 * Rate limiting : défini dans middleware/rateLimiter.js (apiLimiter, 60 req/min/clé)
 *
 * Documentation Swagger : accessible à /api/docs (déjà configuré dans server.js)
 * Cette route est préfixée /api/v1 pour versioning.
 */

import express from 'express';
import { protect, requireScope } from '../middleware/auth.middleware.js';
import { escapeRegExp } from '../utils/regexHelpers.js';
import Mission from '../models/Mission.model.js';
import Candidate from '../models/Candidate.model.js';
import Application from '../models/Application.model.js';
import Company from '../models/Company.model.js';
import { AppError } from '../utils/AppError.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification (JWT ou API Key)
router.use(apiLimiter, protect);

// ── Pagination helper ─────────────────────────────────────────────────────────

function paginate(req) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

// T-404 : `{ ...req.body, companyId, createdVia:'api' }` sans allowlist
// permettait à une clé API tierce d'écrire n'importe quel champ interne
// (approvalHistory, applicationCount, candidateIds, createdBy, isDeleted...),
// sans jamais vérifier les quotas du plan, et une mission créée via l'API
// héritait du défaut Mongoose `status: 'active'` — publiée en direct, en
// contournant entièrement le workflow d'approbation (T-242).
function pickAllowedFields(body, allowedKeys) {
  const out = {};
  for (const key of allowedKeys) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
}

// 'company' (ObjectId) et 'companyName' sont volontairement exclus de
// l'allowlist : ce sont des copies dénormalisées de l'identité du tenant
// (companyId/nom de la company authentifiée), pas des champs qu'un
// intégrateur tiers doit pouvoir dicter — dérivées côté serveur à la création.
const MISSION_ALLOWED_FIELDS = [
  'title', 'contract', 'location', 'remote',
  'salary', 'description', 'requirements', 'benefits', 'skills',
  'experience', 'department',
];

const CANDIDATE_ALLOWED_FIELDS = [
  'firstName', 'lastName', 'email', 'phone', 'location', 'country',
  'position', 'experience', 'experienceLevel', 'salary', 'skills',
  'languages', 'cvUrl', 'cvFilename', 'linkedinUrl', 'portfolioUrl',
  'availability', 'preferences', 'tags', 'source',
];

function paginatedResponse(res, data, total, page, limit) {
  res.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
    },
  });
}

// ════════════════════════════════════════════════════════════════════════════
// MISSIONS — /api/v1/missions
// ════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/missions:
 *   get:
 *     summary: Liste les missions de la company
 *     tags: [Missions]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, open, closed, pending_approval] }
 *         description: Filtrer par statut
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200:
 *         description: Liste paginée des missions
 */
router.get('/missions', requireScope('missions:read'), async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { page, limit, skip } = paginate(req);
    const filter = { companyId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.contract) filter.contract = req.query.contract;
    // T-366 : échapper les métacaractères regex (ReDoS) — surface exposée à
    // des clés API tierces, exposition la plus sensible de cette faille.
    if (req.query.location) filter.location = new RegExp(escapeRegExp(req.query.location), 'i');

    const [data, total] = await Promise.all([
      Mission.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Mission.countDocuments(filter),
    ]);

    paginatedResponse(res, data, total, page, limit);
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/v1/missions/{id}:
 *   get:
 *     summary: Récupère une mission par son ID
 *     tags: [Missions]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.get('/missions/:id', requireScope('missions:read'), async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const mission = await Mission.findOne({ _id: req.params.id, companyId }).lean();
    if (!mission) return next(new AppError('Mission introuvable', 404));
    res.json({ success: true, data: mission });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/v1/missions:
 *   post:
 *     summary: Crée une nouvelle mission
 *     tags: [Missions]
 *     security:
 *       - ApiKeyAuth: []
 */
router.post('/missions', requireScope('missions:write'), async (req, res, next) => {
  try {
    const { companyId, id: userId, companyName } = req.user;

    const company = await Company.findById(companyId);
    if (company && !(await company.canAddMission())) {
      throw new AppError('Limite de missions atteinte pour votre plan', 403);
    }

    // Bonus découvert en corrigeant T-404 : `company`/`companyName`/`createdBy`
    // sont tous les trois `required` sur le schéma Mongoose, mais l'ancien
    // code ne les fournissait jamais (sauf si l'appelant les envoyait
    // lui-même) — POST /api/v1/missions échouait donc déjà systématiquement
    // en ValidationError 500 pour tout appelant normal, avant même la question
    // du mass-assignment. Dérivés côté serveur, jamais depuis req.body.
    const missionData = {
      ...pickAllowedFields(req.body, MISSION_ALLOWED_FIELDS),
      companyId,
      company: companyId,
      companyName: companyName || company?.name || 'Company',
      createdBy: userId,
      createdVia: 'api',
      // Toujours soumise au workflow d'approbation manager, jamais publiée en
      // direct — le défaut Mongoose (status: 'active') publierait sinon
      // silencieusement une mission créée par un intégrateur tiers.
      status: 'pending_approval',
    };
    const mission = await Mission.create(missionData);
    res.status(201).json({ success: true, data: mission });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/v1/missions/{id}:
 *   patch:
 *     summary: Met à jour une mission
 *     tags: [Missions]
 *     security:
 *       - ApiKeyAuth: []
 */
router.patch('/missions/:id', requireScope('missions:write'), async (req, res, next) => {
  try {
    const { companyId } = req.user;
    // T-404 : même mass-assignment que POST — allowlist appliquée ici aussi
    // (status volontairement exclu de la mise à jour publique : changer le
    // statut passe par le workflow d'approbation interne, pas par l'API tierce).
    const mission = await Mission.findOneAndUpdate(
      { _id: req.params.id, companyId },
      { $set: { ...pickAllowedFields(req.body, MISSION_ALLOWED_FIELDS), updatedAt: new Date() } },
      { new: true, runValidators: true }
    ).lean();
    if (!mission) return next(new AppError('Mission introuvable', 404));
    res.json({ success: true, data: mission });
  } catch (err) { next(err); }
});

// ════════════════════════════════════════════════════════════════════════════
// CANDIDATS — /api/v1/candidates
// ════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/candidates:
 *   get:
 *     summary: Liste les candidats de la company
 *     tags: [Candidats]
 *     security:
 *       - ApiKeyAuth: []
 */
router.get('/candidates', requireScope('candidates:read'), async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { page, limit, skip } = paginate(req);
    const filter = { companyId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.q) {
      // T-366 : échapper les métacaractères regex (ReDoS).
      // T-402 : `Candidate` n'a pas de champ `name` (seulement firstName/
      // lastName) — cette branche du $or ne matchait jamais rien, la
      // recherche ne portait en pratique que sur email/skills.
      const re = new RegExp(escapeRegExp(req.query.q), 'i');
      filter.$or = [{ firstName: re }, { lastName: re }, { email: re }, { skills: re }];
    }

    const [data, total] = await Promise.all([
      // T-403 : `.select('-resume')` — `Candidate` n'a pas de champ `resume`
      // (confusion avec le schéma Supabase du frontend, qui lui en a un) ;
      // cette exclusion ne faisait donc rien. Le champ réellement sensible à
      // ne jamais exposer à une clé API tierce est `notes` (notes internes
      // du recruteur).
      Candidate.find(filter).select('-notes').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Candidate.countDocuments(filter),
    ]);

    paginatedResponse(res, data, total, page, limit);
  } catch (err) { next(err); }
});

router.get('/candidates/:id', requireScope('candidates:read'), async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const candidate = await Candidate.findOne({ _id: req.params.id, companyId }).select('-notes').lean();
    if (!candidate) return next(new AppError('Candidat introuvable', 404));
    res.json({ success: true, data: candidate });
  } catch (err) { next(err); }
});

router.post('/candidates', requireScope('candidates:write'), async (req, res, next) => {
  try {
    const { companyId, id: userId } = req.user;

    const company = await Company.findById(companyId);
    if (company && !(await company.canAddCandidate())) {
      throw new AppError('Limite de candidats atteinte pour votre plan', 403);
    }

    const candidateData = {
      ...pickAllowedFields(req.body, CANDIDATE_ALLOWED_FIELDS),
      companyId,
      createdBy: userId,
      createdVia: 'api',
    };
    const candidate = await Candidate.create(candidateData);
    res.status(201).json({ success: true, data: candidate });
  } catch (err) { next(err); }
});

router.patch('/candidates/:id', requireScope('candidates:write'), async (req, res, next) => {
  try {
    const { companyId } = req.user;
    // T-404 : même mass-assignment que POST — allowlist appliquée ici aussi.
    const candidate = await Candidate.findOneAndUpdate(
      { _id: req.params.id, companyId },
      { $set: { ...pickAllowedFields(req.body, CANDIDATE_ALLOWED_FIELDS), updatedAt: new Date() } },
      { new: true, runValidators: true }
    ).lean();
    if (!candidate) return next(new AppError('Candidat introuvable', 404));
    res.json({ success: true, data: candidate });
  } catch (err) { next(err); }
});

// ════════════════════════════════════════════════════════════════════════════
// CANDIDATURES — /api/v1/applications (lecture seule dans la v1)
// ════════════════════════════════════════════════════════════════════════════

router.get('/applications', requireScope('candidates:read'), async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { page, limit, skip } = paginate(req);
    const filter = { companyId };
    if (req.query.missionId) filter.missionId = req.query.missionId;
    if (req.query.candidateId) filter.candidateId = req.query.candidateId;
    if (req.query.status) filter.status = req.query.status;

    const [data, total] = await Promise.all([
      Application.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Application.countDocuments(filter),
    ]);

    paginatedResponse(res, data, total, page, limit);
  } catch (err) { next(err); }
});

// ════════════════════════════════════════════════════════════════════════════
// INFO — /api/v1
// ════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1:
 *   get:
 *     summary: Informations sur l'API publique
 *     tags: [Info]
 *     security:
 *       - ApiKeyAuth: []
 */
router.get('/', protect, (req, res) => {
  res.json({
    success: true,
    data: {
      version: 'v1',
      company: req.user.companyName,
      scopes: req.user.apiKeyScopes || [],
      rateLimit: { requestsPerMinute: 60, window: '1 minute' },
      endpoints: {
        missions: { read: 'GET /api/v1/missions', write: 'POST/PATCH /api/v1/missions' },
        candidates: { read: 'GET /api/v1/candidates', write: 'POST/PATCH /api/v1/candidates' },
        applications: { read: 'GET /api/v1/applications' },
      },
      docs: '/api/docs',
      support: 'api@ats-ultimate.com',
    },
  });
});

export default router;
