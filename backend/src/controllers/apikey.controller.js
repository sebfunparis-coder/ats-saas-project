/**
 * 🔑 ApiKey Controller — Gestion des clés API
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import ApiKey, { VALID_SCOPES } from '../models/ApiKey.model.js';
import { AppError } from '../utils/AppError.js';

const useMockDB = () => process.env.USE_MOCK_DB === 'true' || global._useMockDB;

/**
 * POST /api/apikeys
 * Créer une nouvelle API key. La clé brute est retournée une seule fois.
 */
export const createApiKey = async (req, res, next) => {
  try {
    if (useMockDB()) throw new AppError('Les API Keys nécessitent MongoDB', 503);

    const { name, scopes = [], expiresAt } = req.body;
    const { companyId, id: userId } = req.user;

    if (!name) throw new AppError('Le nom de la clé est requis', 400);

    // Valider les scopes
    const invalidScopes = scopes.filter(s => !VALID_SCOPES.includes(s));
    if (invalidScopes.length > 0) {
      throw new AppError(`Scopes invalides : ${invalidScopes.join(', ')}`, 400);
    }

    // Générer la clé brute : sk_live_<32 hex chars>
    const rawKey = `sk_live_${crypto.randomBytes(16).toString('hex')}`;
    const keyPrefix = rawKey.slice(0, 15); // sk_live_xxxxxxx

    const keyHash = await bcrypt.hash(rawKey, 8);

    const apiKey = await ApiKey.create({
      name,
      keyHash,
      keyPrefix,
      scopes,
      companyId,
      createdBy: userId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    res.status(201).json({
      success: true,
      data: {
        id: apiKey._id,
        name: apiKey.name,
        key: rawKey, // affiché UNE SEULE FOIS
        keyPrefix: apiKey.keyPrefix,
        scopes: apiKey.scopes,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
      },
      message: 'Conservez cette clé en lieu sûr — elle ne sera plus affichée.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/apikeys
 * Lister les API keys de la company (sans keyHash)
 */
export const listApiKeys = async (req, res, next) => {
  try {
    if (useMockDB()) throw new AppError('Les API Keys nécessitent MongoDB', 503);

    const { companyId } = req.user;

    const keys = await ApiKey.find({ companyId })
      .select('-keyHash')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: keys });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/apikeys/:id/revoke
 * Révoquer une API key (désactivation soft)
 */
export const revokeApiKey = async (req, res, next) => {
  try {
    if (useMockDB()) throw new AppError('Les API Keys nécessitent MongoDB', 503);

    const { id } = req.params;
    const { companyId } = req.user;

    const apiKey = await ApiKey.findOne({ _id: id, companyId });
    if (!apiKey) throw new AppError('Clé API non trouvée', 404);
    if (!apiKey.isActive) throw new AppError('Clé déjà révoquée', 400);

    apiKey.isActive = false;
    await apiKey.save();

    res.json({ success: true, message: 'Clé API révoquée' });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/apikeys/:id
 * Supprimer définitivement une API key
 */
export const deleteApiKey = async (req, res, next) => {
  try {
    if (useMockDB()) throw new AppError('Les API Keys nécessitent MongoDB', 503);

    const { id } = req.params;
    const { companyId } = req.user;

    const result = await ApiKey.deleteOne({ _id: id, companyId });
    if (result.deletedCount === 0) throw new AppError('Clé API non trouvée', 404);

    res.json({ success: true, message: 'Clé API supprimée' });
  } catch (error) {
    next(error);
  }
};

export default { createApiKey, listApiKeys, revokeApiKey, deleteApiKey };
