import mongoose from 'mongoose';
import { getStripe, PLAN_PRICE_IDS, PLAN_MRR, isStripeConfigured } from '../config/stripe.config.js';
import { listStripeInvoices, streamInvoicePDF } from '../services/invoice.service.js';
import Company from '../models/Company.model.js';
import { AppError } from '../utils/AppError.js';
import logger from '../utils/logger.js';

const useMockDB = () => mongoose.connection.readyState !== 1;

// ─── Checkout ──────────────────────────────────────────────────────────────────

/**
 * POST /api/billing/checkout
 * Crée une session Stripe Checkout pour passer sur un plan payant.
 */
export const createCheckoutSession = async (req, res, next) => {
  try {
    if (!isStripeConfigured()) {
      return next(new AppError('Stripe non configuré sur ce serveur', 503));
    }

    const { plan } = req.body;
    if (!['Starter', 'Pro', 'Enterprise'].includes(plan)) {
      return next(new AppError('Plan invalide', 400));
    }

    const priceId = PLAN_PRICE_IDS[plan];
    if (!priceId) {
      return next(new AppError(`Prix Stripe non configuré pour le plan ${plan}`, 503));
    }

    const stripe = getStripe();
    const companyId = req.user.companyId;

    let company;
    if (!useMockDB()) {
      company = await Company.findById(companyId);
      if (!company) return next(new AppError('Entreprise introuvable', 404));
    }

    // Créer ou récupérer le customer Stripe
    let stripeCustomerId = company?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: company?.email || req.user.email,
        name: company?.name,
        metadata: { companyId: companyId.toString(), plan },
      });
      stripeCustomerId = customer.id;
      if (!useMockDB()) {
        await Company.findByIdAndUpdate(companyId, { stripeCustomerId });
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/app/admin?tab=billing&success=1&plan=${plan}`,
      cancel_url: `${process.env.FRONTEND_URL}/app/admin?tab=billing&canceled=1`,
      subscription_data: {
        metadata: { companyId: companyId.toString(), plan },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (err) {
    logger.error('Stripe checkout error', { error: err.message });
    next(err);
  }
};

// ─── Customer Portal ────────────────────────────────────────────────────────────

/**
 * POST /api/billing/portal
 * Redirige vers le portail Stripe pour gérer l'abonnement (annuler, changer, factures).
 */
export const createPortalSession = async (req, res, next) => {
  try {
    if (!isStripeConfigured()) {
      return next(new AppError('Stripe non configuré sur ce serveur', 503));
    }

    const stripe = getStripe();
    const companyId = req.user.companyId;

    let stripeCustomerId;
    if (!useMockDB()) {
      const company = await Company.findById(companyId).select('stripeCustomerId');
      stripeCustomerId = company?.stripeCustomerId;
    }

    if (!stripeCustomerId) {
      return next(new AppError("Aucun abonnement actif — veuillez d'abord souscrire à un plan", 400));
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/app/admin?tab=billing`,
    });

    res.json({ success: true, url: session.url });
  } catch (err) {
    logger.error('Stripe portal error', { error: err.message });
    next(err);
  }
};

// ─── Webhook ────────────────────────────────────────────────────────────────────

/**
 * POST /api/billing/webhook
 * Reçoit les événements Stripe (invoice.paid, subscription.updated, etc.)
 * Corps brut requis (bodyParser.raw).
 */
export const handleWebhook = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(503).json({ error: 'Stripe non configuré' });

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.warn('Stripe webhook signature invalide', { error: err.message });
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  logger.info('Stripe webhook reçu', { type: event.type });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { companyId, plan } = session.subscription_data?.metadata || {};
        if (companyId && plan && !useMockDB()) {
          await Company.findByIdAndUpdate(companyId, {
            plan,
            status: 'active',
            stripeSubscriptionId: session.subscription,
            subscriptionStartDate: new Date(),
            mrr: PLAN_MRR[plan] || 0,
            paymentMethod: 'Stripe',
          });
          logger.info('Company upgradée', { companyId, plan });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const companyId = sub.metadata?.companyId;
        if (companyId && !useMockDB()) {
          const plan = sub.metadata?.plan;
          const status = sub.status === 'active' ? 'active' : 'suspended';
          await Company.findByIdAndUpdate(companyId, {
            ...(plan && { plan }),
            status,
            nextBillingDate: sub.current_period_end
              ? new Date(sub.current_period_end * 1000)
              : undefined,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const companyId = sub.metadata?.companyId;
        if (companyId && !useMockDB()) {
          await Company.findByIdAndUpdate(companyId, {
            status: 'cancelled',
            stripeSubscriptionId: null,
            mrr: 0,
          });
          logger.info('Abonnement annulé', { companyId });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        if (!useMockDB()) {
          await Company.findOneAndUpdate(
            { stripeCustomerId: customerId },
            { status: 'suspended' }
          );
          logger.warn('Paiement échoué — company suspendue', { customerId });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        if (!useMockDB()) {
          await Company.findOneAndUpdate(
            { stripeCustomerId: customerId },
            { status: 'active' }
          );
        }
        break;
      }

      default:
        // Événement non géré — OK, Stripe envoie beaucoup d'événements
        break;
    }
  } catch (err) {
    logger.error('Erreur traitement webhook Stripe', { type: event.type, error: err.message });
    // On répond 200 quand même pour éviter que Stripe rétente
  }

  res.json({ received: true });
};

// ─── Invoices ───────────────────────────────────────────────────────────────────

/**
 * GET /api/billing/invoices
 * Liste les factures payées Stripe de la company.
 */
export const listInvoices = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    if (useMockDB()) {
      return res.json({ success: true, data: [] });
    }

    const company = await Company.findById(companyId).select('stripeCustomerId');
    if (!company) return next(new AppError('Entreprise introuvable', 404));

    const invoices = await listStripeInvoices(company.stripeCustomerId);
    res.json({ success: true, data: invoices });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/billing/invoices/:invoiceId/pdf
 * Redirige vers le PDF Stripe natif (hosted by Stripe).
 */
export const getInvoicePDF = async (req, res, next) => {
  try {
    if (!isStripeConfigured()) {
      return next(new AppError('Stripe non configuré', 503));
    }

    const stripe = getStripe();
    const { invoiceId } = req.params;

    const invoice = await stripe.invoices.retrieve(invoiceId);
    if (!invoice) return next(new AppError('Facture introuvable', 404));

    // Vérifier que la facture appartient bien au customer de cette company
    if (!useMockDB()) {
      const company = await Company.findById(req.user.companyId).select('stripeCustomerId');
      if (company?.stripeCustomerId && invoice.customer !== company.stripeCustomerId) {
        return next(new AppError('Accès non autorisé à cette facture', 403));
      }
    }

    if (invoice.invoice_pdf) {
      return res.redirect(302, invoice.invoice_pdf);
    }

    return next(new AppError('PDF non disponible pour cette facture', 404));
  } catch (err) {
    next(err);
  }
};

// ─── Status ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/billing/status
 * Retourne l'abonnement actuel de la company.
 */
export const getBillingStatus = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    if (useMockDB()) {
      return res.json({
        success: true,
        data: {
          plan: 'Starter',
          status: 'trial',
          stripeConfigured: isStripeConfigured(),
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });
    }

    const company = await Company.findById(companyId).select(
      'plan status stripeCustomerId stripeSubscriptionId trialEndsAt nextBillingDate mrr'
    );

    if (!company) return next(new AppError('Entreprise introuvable', 404));

    res.json({
      success: true,
      data: {
        plan: company.plan,
        status: company.status,
        stripeConfigured: isStripeConfigured(),
        trialEndsAt: company.trialEndsAt,
        nextBillingDate: company.nextBillingDate,
        mrr: company.mrr,
        hasActiveSubscription: !!company.stripeSubscriptionId,
      },
    });
  } catch (err) {
    next(err);
  }
};
