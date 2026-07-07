import express from 'express';
import {
  createCheckoutSession,
  createPortalSession,
  handleWebhook,
  getBillingStatus,
  listInvoices,
  getInvoicePDF,
} from '../controllers/billing.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Webhook Stripe — corps brut obligatoire (avant express.json)
// Cette route est montée séparément dans server.js avec bodyParser.raw
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// Routes authentifiées
router.use(protect);

router.get('/status', getBillingStatus);

router.post('/checkout', authorize('admin', 'superadmin'), createCheckoutSession);

router.post('/portal', authorize('admin', 'superadmin'), createPortalSession);

router.get('/invoices', authorize('admin', 'superadmin'), listInvoices);
router.get('/invoices/:invoiceId/pdf', authorize('admin', 'superadmin'), getInvoicePDF);

export default router;
