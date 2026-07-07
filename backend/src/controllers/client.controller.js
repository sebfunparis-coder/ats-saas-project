/**
 * 🤝 Client Controller
 *
 * Gère les clients (entreprises clientes) : CRUD, contacts, missions
 */

import Client from '../models/Client.model.js';
import Mission from '../models/Mission.model.js';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';
import { successResponse, createdResponse, paginationMeta } from '../utils/response.js';
import { escapeRegExp } from '../utils/regexHelpers.js';

// ===== CONTROLLERS =====

/**
 * GET /api/clients
 * Liste tous les clients (avec pagination, filtres, recherche)
 */
export const getAllClients = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const {
      status,
      type,
      industry,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 50,
      skip = 0
    } = req.query;
    const safeLimit = Math.min(parseInt(limit) || 20, 100);
    const safeSkip = parseInt(skip) || 0;

    const filter = { companyId };

    if (status) filter.status = status;
    if (type) filter.type = type;
    // T-366 : échapper les métacaractères regex avant new RegExp() (ReDoS).
    if (industry) filter.industry = new RegExp(escapeRegExp(industry), 'i');
    if (search) filter.$text = { $search: search };

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [clients, total] = await Promise.all([
      Client.find(filter)
        .sort(sort)
        .limit(safeLimit)
        .skip(safeSkip)
        .populate('createdBy', 'firstName lastName email')
        .populate({
          path: 'missionIds',
          select: 'title status contract createdAt',
          options: { limit: 5, sort: { createdAt: -1 } }
        })
        .lean(),
      Client.countDocuments(filter)
    ]);

    successResponse(res, clients, '', paginationMeta(total, Math.floor(safeSkip / safeLimit) + 1, safeLimit));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/clients/:id
 * Récupérer un client par ID
 */
export const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const client = await Client.findOne({ _id: id, companyId })
      .populate('createdBy', 'firstName lastName email avatar')
      .populate({
        path: 'missionIds',
        select: 'title status contract location salary createdAt publishedAt',
        populate: {
          path: 'createdBy',
          select: 'firstName lastName'
        }
      })
      .lean();

    if (!client) {
      throw new AppError('Client non trouvé', 404);
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/clients
 * Créer un nouveau client
 */
export const createClient = async (req, res, next) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { companyId, id: userId } = req.user;

    const clientData = {
      ...req.body,
      companyId,
      createdBy: userId,
      status: req.body.status || 'lead'
    };

    const client = await Client.create(clientData);

    res.status(201).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/clients/:id
 * Mettre à jour un client
 */
export const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Trouver le client
    const client = await Client.findOne({ _id: id, companyId });

    if (!client) {
      throw new AppError('Client non trouvé', 404);
    }

    // Champs autorisés à la modification
    const allowedFields = [
      'name',
      'type',
      'industry',
      'website',
      'description',
      'email',
      'phone',
      'address',
      'status',
      'source',
      'notes',
      'tags'
    ];

    // Mettre à jour uniquement les champs autorisés
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        client[field] = req.body[field];
      }
    });

    await client.save();

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/clients/:id
 * Supprimer un client
 */
export const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const client = await Client.findOne({ _id: id, companyId });

    if (!client) {
      throw new AppError('Client non trouvé', 404);
    }

    // Vérifier si des missions existent
    if (client.missionIds && client.missionIds.length > 0) {
      throw new AppError(
        `Impossible de supprimer ce client car ${client.missionIds.length} mission(s) y sont associées`,
        400
      );
    }

    client.isDeleted = true;
    client.deletedAt = new Date();
    await client.save();

    res.json({
      success: true,
      message: 'Client supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/clients/:id/status
 * Mettre à jour le statut d'un client
 */
export const updateClientStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { companyId } = req.user;

    if (!status) {
      throw new AppError('Le statut est requis', 400);
    }

    const validStatuses = ['lead', 'prospect', 'active', 'inactive'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Statut invalide', 400);
    }

    const client = await Client.findOne({ _id: id, companyId });

    if (!client) {
      throw new AppError('Client non trouvé', 404);
    }

    // Utiliser la méthode du model
    await client.updateStatus(status);

    res.json({
      success: true,
      data: client,
      message: 'Statut mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/clients/:id/contact
 * Ajouter un contact à un client
 */
export const addContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    const { name, role, email, phone, isPrimary } = req.body;

    if (!name || !email) {
      throw new AppError('Nom et email du contact sont requis', 400);
    }

    const client = await Client.findOne({ _id: id, companyId });

    if (!client) {
      throw new AppError('Client non trouvé', 404);
    }

    const contactData = {
      name,
      role,
      email,
      phone,
      isPrimary: isPrimary || false
    };

    // Utiliser la méthode du model
    await client.addContact(contactData);

    res.status(201).json({
      success: true,
      data: client,
      message: 'Contact ajouté avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/clients/:id/contact/:contactId
 * Retirer un contact d'un client
 */
export const removeContact = async (req, res, next) => {
  try {
    const { id, contactId } = req.params;
    const { companyId } = req.user;

    const client = await Client.findOne({ _id: id, companyId });

    if (!client) {
      throw new AppError('Client non trouvé', 404);
    }

    // Utiliser la méthode du model
    await client.removeContact(contactId);

    res.json({
      success: true,
      data: client,
      message: 'Contact retiré avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/clients/:id/contact/:contactId
 * Mettre à jour un contact
 */
export const updateContact = async (req, res, next) => {
  try {
    const { id, contactId } = req.params;
    const { companyId } = req.user;
    const { name, role, email, phone, isPrimary } = req.body;

    const client = await Client.findOne({ _id: id, companyId });

    if (!client) {
      throw new AppError('Client non trouvé', 404);
    }

    const contact = client.contacts.id(contactId);

    if (!contact) {
      throw new AppError('Contact non trouvé', 404);
    }

    if (name) contact.name = name;
    if (role) contact.role = role;
    if (email) contact.email = email;
    if (phone) contact.phone = phone;
    if (isPrimary !== undefined) contact.isPrimary = isPrimary;

    await client.save();

    res.json({
      success: true,
      data: client,
      message: 'Contact mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/clients/:id/missions
 * Récupérer toutes les missions d'un client
 */
export const getClientMissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    const { status, limit = 50, skip = 0 } = req.query;

    // Vérifier que le client existe
    const client = await Client.findOne({ _id: id, companyId });

    if (!client) {
      throw new AppError('Client non trouvé', 404);
    }

    const filter = {
      _id: { $in: client.missionIds },
      companyId
    };

    if (status) {
      filter.status = status;
    }

    const safeLimit2 = Math.min(parseInt(limit) || 20, 100);
    const safeSkip2 = parseInt(skip) || 0;

    const [missions, total] = await Promise.all([
      Mission.find(filter)
        .sort({ createdAt: -1 })
        .limit(safeLimit2)
        .skip(safeSkip2)
        .populate('createdBy', 'firstName lastName')
        .lean(),
      Mission.countDocuments(filter)
    ]);

    successResponse(res, missions, '', paginationMeta(total, Math.floor(safeSkip2 / safeLimit2) + 1, safeLimit2));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/clients/:id/mission/:missionId
 * Associer une mission à un client
 */
export const linkMission = async (req, res, next) => {
  try {
    const { id, missionId } = req.params;
    const { companyId } = req.user;

    const client = await Client.findOne({ _id: id, companyId });

    if (!client) {
      throw new AppError('Client non trouvé', 404);
    }

    const mission = await Mission.findOne({ _id: missionId, companyId });

    if (!mission) {
      throw new AppError('Mission non trouvée', 404);
    }

    // Utiliser la méthode du model
    await client.addMission(missionId);

    res.json({
      success: true,
      data: client,
      message: 'Mission associée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/clients/:id/mission/:missionId
 * Dissocier une mission d'un client
 */
export const unlinkMission = async (req, res, next) => {
  try {
    const { id, missionId } = req.params;
    const { companyId } = req.user;

    const client = await Client.findOne({ _id: id, companyId });

    if (!client) {
      throw new AppError('Client non trouvé', 404);
    }

    // Utiliser la méthode du model
    await client.removeMission(missionId);

    res.json({
      success: true,
      data: client,
      message: 'Mission dissociée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/clients/stats
 * Statistiques clients pour dashboard
 */
export const getClientStats = async (req, res, next) => {
  try {
    const { companyId } = req.user;

    const stats = await Client.aggregate([
      { $match: { companyId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Client.countDocuments({ companyId });
    const leads = await Client.countDocuments({ companyId, status: 'lead' });
    const prospects = await Client.countDocuments({ companyId, status: 'prospect' });
    const active = await Client.countDocuments({ companyId, status: 'active' });

    // Clients ajoutés ce mois
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const thisMonth = await Client.countDocuments({
      companyId,
      createdAt: { $gte: startOfMonth }
    });

    // Top industries
    const topIndustries = await Client.aggregate([
      { $match: { companyId } },
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        total,
        leads,
        prospects,
        active,
        thisMonth,
        byStatus: stats,
        topIndustries
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/clients/:id/restore
 */
export const restoreClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const result = await Client.updateOne(
      { _id: id, companyId, isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null } }
    );

    if (result.matchedCount === 0) {
      throw new AppError('Client supprimé non trouvé', 404);
    }

    res.json({ success: true, message: 'Client restauré avec succès' });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/clients/:id/purge
 */
export const purgeClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const result = await Client.deleteOne({ _id: id, companyId, isDeleted: true });

    if (result.deletedCount === 0) {
      throw new AppError('Client supprimé non trouvé', 404);
    }

    res.json({ success: true, message: 'Client supprimé définitivement' });
  } catch (error) {
    next(error);
  }
};

// Export default pour compatibilité
export default {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  restoreClient,
  purgeClient,
  updateClientStatus,
  addContact,
  removeContact,
  updateContact,
  getClientMissions,
  linkMission,
  unlinkMission,
  getClientStats
};
