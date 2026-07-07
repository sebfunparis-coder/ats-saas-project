/**
 * 🔑 ApiKey Routes
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  deleteApiKey,
} from '../controllers/apikey.controller.js';

const router = express.Router();

// Toutes les routes nécessitent auth JWT + rôle admin ou manager
router.use(protect, authorize('admin', 'superadmin', 'manager'));

router.post('/', createApiKey);
router.get('/', listApiKeys);
router.delete('/:id/revoke', revokeApiKey);
router.delete('/:id', deleteApiKey);

export default router;
