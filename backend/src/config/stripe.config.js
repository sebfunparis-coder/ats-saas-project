import Stripe from 'stripe';

let stripeInstance = null;

export const getStripe = () => {
  if (stripeInstance) return stripeInstance;
  if (!process.env.STRIPE_SECRET_KEY) return null;
  stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-05-28.basil',
    appInfo: { name: 'ATS Ultimate', version: '1.0.0' },
  });
  return stripeInstance;
};

// Prix Stripe par plan (à configurer dans le dashboard Stripe)
export const PLAN_PRICE_IDS = {
  Starter: process.env.STRIPE_PRICE_STARTER,
  Pro: process.env.STRIPE_PRICE_PRO,
  Enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
};

export const PLAN_MRR = {
  Starter: 49,
  Pro: 99,
  Enterprise: 299,
};

export const isStripeConfigured = () =>
  !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
