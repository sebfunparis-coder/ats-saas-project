/**
 * ✍️ Signature électronique — T-275
 *
 * Intégration Yousign API v3 (conforme eIDAS, nativement français).
 * Permet de signer depuis l'ATS : offres d'emploi, comptes-rendus d'entretien,
 * accords de confidentialité (NDA).
 *
 * Documentation API : https://developers.yousign.com/reference/getting-started
 *
 * Variables d'environnement :
 *   YOUSIGN_API_KEY    — Clé API Yousign (sandbox ou production)
 *   YOUSIGN_ENV        — 'sandbox' | 'production' (défaut: sandbox)
 *
 * Flux :
 *   1. Créer une procédure de signature (POST /signature_requests)
 *   2. Uploader le document PDF (POST /signature_requests/:id/documents)
 *   3. Ajouter les signataires (POST /signature_requests/:id/signers)
 *   4. Activer la demande (POST /signature_requests/:id/activate)
 *   5. Les signataires reçoivent un email avec le lien de signature
 *   6. Webhook POST → votre endpoint quand signature complète
 */

import https from 'https';
import logger from '../utils/logger.js';

const YOUSIGN = {
  apiKey:  () => process.env.YOUSIGN_API_KEY,
  baseUrl: () => process.env.YOUSIGN_ENV === 'production'
    ? 'api.yousign.app'
    : 'api-sandbox.yousign.app',
  isEnabled: () => !!process.env.YOUSIGN_API_KEY,
};

// ── HTTP helper ───────────────────────────────────────────────────────────────

function yousignRequest(method, path, body = null, contentType = 'application/json') {
  return new Promise((resolve, reject) => {
    const data = body
      ? (contentType === 'application/json' ? JSON.stringify(body) : body)
      : null;

    const req = https.request(
      {
        hostname: YOUSIGN.baseUrl(),
        path: `/v3${path}`,
        method,
        headers: {
          Authorization: `Bearer ${YOUSIGN.apiKey()}`,
          'Content-Type': contentType,
          ...(data && { 'Content-Length': Buffer.byteLength(data) }),
        },
      },
      res => {
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          const raw = Buffer.concat(chunks);
          try { resolve({ status: res.statusCode, body: JSON.parse(raw.toString()) }); }
          catch { resolve({ status: res.statusCode, body: raw }); }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ── Core functions ────────────────────────────────────────────────────────────

/**
 * Crée une demande de signature Yousign.
 * @param {string} name — Nom de la procédure (affiché aux signataires)
 * @param {object} options — { externalId, orderedSigners, reminderSettings }
 * @returns {Promise<{signatureRequestId}>}
 */
export async function createSignatureRequest(name, options = {}) {
  if (!YOUSIGN.isEnabled()) {
    throw new Error('Yousign non configuré. Définissez YOUSIGN_API_KEY dans les variables d\'environnement.');
  }

  const payload = {
    name,
    delivery_mode: 'email',
    ordered_signers: options.orderedSigners ?? false, // true = signatures séquentielles
    reminder_settings: options.reminderSettings || {
      interval_in_days: 1,
      max_occurrences: 3,
    },
    timezone: 'Europe/Paris',
    external_id: options.externalId || null,
    ...(options.webhookUrl && {
      signers_allowed_to_decline: true,
      custom_experience_id: null,
    }),
  };

  const result = await yousignRequest('POST', '/signature_requests', payload);

  if (result.status !== 201 && result.status !== 200) {
    throw new Error(`Yousign createRequest erreur ${result.status}: ${JSON.stringify(result.body)}`);
  }

  logger.info('[Signature] Demande créée', { id: result.body.id, name });
  return { signatureRequestId: result.body.id };
}

/**
 * Uploade un document PDF dans une demande de signature.
 * @param {string} signatureRequestId
 * @param {Buffer} pdfBuffer — Contenu du PDF
 * @param {string} fileName — Nom du fichier
 * @returns {Promise<{documentId}>}
 */
export async function uploadSignatureDocument(signatureRequestId, pdfBuffer, fileName) {
  if (!YOUSIGN.isEnabled()) throw new Error('Yousign non configuré');

  // Yousign v3 : multipart/form-data pour l'upload de document
  const boundary = `----YousignBoundary${Date.now()}`;
  const disposition = `Content-Disposition: form-data; name="file"; filename="${fileName}"`;
  const type = 'Content-Type: application/pdf';

  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\n${disposition}\r\n${type}\r\n\r\n`),
    pdfBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const result = await yousignRequest(
    'POST',
    `/signature_requests/${signatureRequestId}/documents`,
    body,
    `multipart/form-data; boundary=${boundary}`
  );

  if (result.status !== 201 && result.status !== 200) {
    throw new Error(`Yousign uploadDoc erreur ${result.status}: ${JSON.stringify(result.body)}`);
  }

  logger.info('[Signature] Document uploadé', { signatureRequestId, documentId: result.body.id });
  return { documentId: result.body.id };
}

/**
 * Ajoute un signataire à une demande de signature.
 * @param {string} signatureRequestId
 * @param {object} signer — { firstName, lastName, email, phone }
 * @param {string} documentId
 * @param {object} signaturePosition — { page, x, y, width, height } (optionnel pour signature positionnée)
 * @returns {Promise<{signerId, signatureLink}>}
 */
export async function addSigner(signatureRequestId, signer, documentId, signaturePosition = null) {
  if (!YOUSIGN.isEnabled()) throw new Error('Yousign non configuré');

  const signerPayload = {
    info: {
      first_name: signer.firstName || signer.name?.split(' ')[0] || 'Candidat',
      last_name: signer.lastName || signer.name?.split(' ').slice(1).join(' ') || '',
      email: signer.email,
      ...(signer.phone && { phone_number: signer.phone }),
      locale: 'fr',
    },
    signature_authentication_mode: 'otp_email',
    signature_level: 'electronic_signature', // Niveau EIDAS simple
    fields: signaturePosition ? [
      {
        document_id: documentId,
        type: 'signature',
        page: signaturePosition.page || 1,
        x: signaturePosition.x || 300,
        y: signaturePosition.y || 700,
        width: signaturePosition.width || 200,
        height: signaturePosition.height || 60,
      }
    ] : [],
  };

  const result = await yousignRequest(
    'POST',
    `/signature_requests/${signatureRequestId}/signers`,
    signerPayload
  );

  if (result.status !== 201 && result.status !== 200) {
    throw new Error(`Yousign addSigner erreur ${result.status}: ${JSON.stringify(result.body)}`);
  }

  logger.info('[Signature] Signataire ajouté', { signatureRequestId, email: signer.email });
  return {
    signerId: result.body.id,
    signatureLink: result.body.signature_link,
  };
}

/**
 * Active la demande de signature (envoi des emails aux signataires).
 * @param {string} signatureRequestId
 * @returns {Promise<void>}
 */
export async function activateSignatureRequest(signatureRequestId) {
  if (!YOUSIGN.isEnabled()) throw new Error('Yousign non configuré');

  const result = await yousignRequest(
    'POST',
    `/signature_requests/${signatureRequestId}/activate`
  );

  if (result.status !== 200 && result.status !== 201) {
    throw new Error(`Yousign activate erreur ${result.status}: ${JSON.stringify(result.body)}`);
  }

  logger.info('[Signature] Demande activée — emails envoyés', { signatureRequestId });
}

/**
 * Annule une demande de signature.
 */
export async function cancelSignatureRequest(signatureRequestId, reason = 'Annulé par l\'administrateur') {
  if (!YOUSIGN.isEnabled()) return;

  await yousignRequest(
    'POST',
    `/signature_requests/${signatureRequestId}/cancel`,
    { reason }
  );

  logger.info('[Signature] Demande annulée', { signatureRequestId });
}

/**
 * Récupère le statut d'une demande de signature.
 */
export async function getSignatureRequest(signatureRequestId) {
  if (!YOUSIGN.isEnabled()) throw new Error('Yousign non configuré');

  const result = await yousignRequest('GET', `/signature_requests/${signatureRequestId}`);

  if (result.status !== 200) {
    throw new Error(`Yousign getRequest erreur ${result.status}`);
  }

  return result.body;
}

/**
 * Télécharge le document signé (PDF).
 * Retourne un Buffer contenant le PDF signé.
 */
export async function downloadSignedDocument(signatureRequestId, documentId) {
  if (!YOUSIGN.isEnabled()) throw new Error('Yousign non configuré');

  const result = await yousignRequest(
    'GET',
    `/signature_requests/${signatureRequestId}/documents/${documentId}/download`
  );

  if (result.status !== 200) {
    throw new Error(`Yousign download erreur ${result.status}`);
  }

  return result.body; // Buffer
}

/**
 * Workflow complet : créer la demande + uploader PDF + ajouter signataires + activer.
 * Retourne l'ID de la demande et les liens de signature pour chaque signataire.
 *
 * @param {object} options
 * @param {string} options.name — Nom de la procédure
 * @param {Buffer} options.pdfBuffer — Contenu du document à signer
 * @param {string} options.fileName — Nom du fichier PDF
 * @param {Array}  options.signers — [{ firstName, lastName, email, phone }]
 * @param {string} options.externalId — ID externe (ex: application._id)
 * @param {object} options.signaturePosition — Position de la zone de signature dans le PDF
 */
export async function initiateSignatureWorkflow({
  name,
  pdfBuffer,
  fileName = 'document.pdf',
  signers = [],
  externalId = null,
  signaturePosition = null,
}) {
  if (!YOUSIGN.isEnabled()) {
    throw new Error('Yousign non configuré. Définissez YOUSIGN_API_KEY.');
  }

  // 1. Créer la demande
  const { signatureRequestId } = await createSignatureRequest(name, { externalId });

  // 2. Uploader le document
  const { documentId } = await uploadSignatureDocument(signatureRequestId, pdfBuffer, fileName);

  // 3. Ajouter les signataires
  const signerResults = [];
  for (const signer of signers) {
    const result = await addSigner(signatureRequestId, signer, documentId, signaturePosition);
    signerResults.push({ ...signer, ...result });
  }

  // 4. Activer (envoi emails)
  await activateSignatureRequest(signatureRequestId);

  logger.info('[Signature] Workflow complet', { signatureRequestId, signers: signers.length });

  return {
    signatureRequestId,
    documentId,
    signers: signerResults,
    yousignEnv: process.env.YOUSIGN_ENV || 'sandbox',
  };
}

/**
 * Teste la connexion à l'API Yousign.
 */
export async function testYousignConfig() {
  if (!YOUSIGN.isEnabled()) {
    throw new Error('Yousign non configuré. Définissez YOUSIGN_API_KEY.');
  }

  const result = await yousignRequest('GET', '/users/me');

  if (result.status !== 200) {
    throw new Error(`Yousign API inaccessible (HTTP ${result.status}): ${JSON.stringify(result.body)}`);
  }

  return {
    userId: result.body.id,
    email: result.body.email,
    organization: result.body.organization?.name,
    environment: process.env.YOUSIGN_ENV || 'sandbox',
  };
}

export default {
  createSignatureRequest, uploadSignatureDocument, addSigner,
  activateSignatureRequest, cancelSignatureRequest, getSignatureRequest,
  downloadSignedDocument, initiateSignatureWorkflow, testYousignConfig,
};
