/**
 * Invoice Service
 *
 * Génère des factures PDF via pdfkit.
 * En production avec Stripe, utiliser les factures Stripe directement (PDF natif).
 */

import PDFDocument from 'pdfkit';
import { getStripe, isStripeConfigured } from '../config/stripe.config.js';
import logger from '../utils/logger.js';

// ─── Stripe invoice list ───────────────────────────────────────────────────────

export const listStripeInvoices = async (stripeCustomerId, limit = 10) => {
  if (!isStripeConfigured() || !stripeCustomerId) return [];
  try {
    const stripe = getStripe();
    const { data } = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit,
      status: 'paid',
    });
    return data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      amount: inv.amount_paid / 100,
      currency: inv.currency.toUpperCase(),
      date: new Date(inv.created * 1000).toISOString(),
      status: inv.status,
      pdfUrl: inv.invoice_pdf,
      hostedUrl: inv.hosted_invoice_url,
    }));
  } catch (err) {
    logger.error('Erreur récupération factures Stripe', { error: err.message });
    return [];
  }
};

// ─── PDF generation (fallback local) ─────────────────────────────────────────

/**
 * Génère une facture PDF et la stream dans la réponse Express.
 * @param {object} res — Express Response
 * @param {object} invoice — Données de la facture
 */
export const streamInvoicePDF = (res, invoice) => {
  const {
    invoiceNumber,
    date,
    companyName,
    companyEmail,
    companyAddress,
    planName,
    amount,
    currency = 'EUR',
    vatRate = 0,
    period,
  } = invoice;

  const vatAmount = Math.round(amount * (vatRate / 100) * 100) / 100;
  const totalTTC = Math.round((amount + vatAmount) * 100) / 100;
  const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="facture-${invoiceNumber}.pdf"`
  );
  doc.pipe(res);

  // En-tête
  doc.fontSize(24).font('Helvetica-Bold').text('ATS Ultimate', 50, 50);
  doc.fontSize(10).font('Helvetica').fillColor('#6b7280')
    .text('Plateforme de recrutement SaaS', 50, 80);

  // Numéro de facture + date
  doc.fontSize(20).font('Helvetica-Bold').fillColor('#111827')
    .text('FACTURE', 400, 50, { align: 'right' });
  doc.fontSize(11).font('Helvetica').fillColor('#374151')
    .text(`N° ${invoiceNumber}`, 400, 78, { align: 'right' })
    .text(`Date : ${formattedDate}`, 400, 93, { align: 'right' });

  // Séparateur
  doc.moveTo(50, 120).lineTo(545, 120).strokeColor('#e5e7eb').stroke();

  // Facturer à
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#374151')
    .text('FACTURER À', 50, 140);
  doc.font('Helvetica').fillColor('#111827').fontSize(12)
    .text(companyName, 50, 158)
    .fontSize(10).fillColor('#6b7280')
    .text(companyEmail, 50, 175);
  if (companyAddress) {
    doc.text(companyAddress, 50, 190);
  }

  // Période
  if (period) {
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#374151')
      .text('PÉRIODE', 350, 140);
    doc.font('Helvetica').fillColor('#111827').fontSize(10)
      .text(period, 350, 158);
  }

  // Tableau
  const tableTop = 250;
  doc.moveTo(50, tableTop).lineTo(545, tableTop).strokeColor('#e5e7eb').stroke();

  // En-têtes tableau
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#374151')
    .text('DESCRIPTION', 50, tableTop + 10)
    .text('MONTANT HT', 400, tableTop + 10, { align: 'right' });

  doc.moveTo(50, tableTop + 30).lineTo(545, tableTop + 30).strokeColor('#e5e7eb').stroke();

  // Ligne
  doc.fontSize(11).font('Helvetica').fillColor('#111827')
    .text(`Abonnement ${planName}`, 50, tableTop + 45)
    .fontSize(9).fillColor('#6b7280')
    .text(period ? `Période : ${period}` : '', 50, tableTop + 62);

  doc.fontSize(11).font('Helvetica').fillColor('#111827')
    .text(`${amount.toFixed(2)} ${currency}`, 400, tableTop + 45, { align: 'right' });

  doc.moveTo(50, tableTop + 85).lineTo(545, tableTop + 85).strokeColor('#e5e7eb').stroke();

  // Totaux
  let y = tableTop + 100;
  doc.fontSize(10).font('Helvetica').fillColor('#374151')
    .text('Sous-total HT', 350, y)
    .text(`${amount.toFixed(2)} ${currency}`, 545, y, { align: 'right' });

  if (vatRate > 0) {
    y += 18;
    doc.text(`TVA (${vatRate}%)`, 350, y)
      .text(`${vatAmount.toFixed(2)} ${currency}`, 545, y, { align: 'right' });
  }

  y += 24;
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#111827')
    .text('TOTAL TTC', 350, y)
    .text(`${totalTTC.toFixed(2)} ${currency}`, 545, y, { align: 'right' });

  // Pied de page
  doc.fontSize(9).font('Helvetica').fillColor('#9ca3af')
    .text('Payé par carte bancaire via Stripe. Merci de votre confiance.', 50, 700, { align: 'center' })
    .text('ATS Ultimate — contact@ats-ultimate.com', 50, 715, { align: 'center' });

  doc.end();
};
