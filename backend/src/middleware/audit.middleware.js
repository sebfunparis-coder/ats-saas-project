/**
 * 📋 Audit Middleware
 *
 * Log automatique de toutes les mutations (POST/PUT/PATCH/DELETE) sur les routes protégées.
 * Non-bloquant : utilise res.on('finish') pour ne pas ralentir la requête.
 */

import AuditLog from '../models/AuditLog.model.js';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const SENSITIVE_FIELDS = new Set([
  'password', 'currentpassword', 'newpassword', 'confirmpassword',
  'passwordresettoken', 'emailverificationtoken',
  'token', 'accesstoken', 'refreshtoken', 'idtoken', 'secret', 'apikey', 'authorization',
  'ssn', 'iban', 'creditcard', 'cardnumber', 'cvv',
]);

const SKIP_PATHS = ['/audit-logs', '/health', '/auth/login', '/auth/register'];

// Masque récursivement les champs sensibles (objets/tableaux imbriqués inclus)
const sanitizeBody = (body, seen = new WeakSet()) => {
  if (Array.isArray(body)) return body.map((v) => sanitizeBody(v, seen));
  if (!body || typeof body !== 'object') return body;
  if (seen.has(body)) return '[CIRCULAR]';
  seen.add(body);
  const sanitized = {};
  for (const [key, value] of Object.entries(body)) {
    sanitized[key] = SENSITIVE_FIELDS.has(key.toLowerCase()) ? '[REDACTED]' : sanitizeBody(value, seen);
  }
  return sanitized;
};

const extractEntity = (path) => {
  // /missions/123/publish -> 'missions'
  // /candidates -> 'candidates'
  const parts = path.replace(/^\//, '').split('/');
  return parts[0] || 'unknown';
};

const extractEntityId = (params, path) => {
  if (params?.id) return params.id;
  const parts = path.replace(/^\//, '').split('/');
  const mongoIdPattern = /^[a-f\d]{24}$/i;
  return parts.find(p => mongoIdPattern.test(p)) || null;
};

export const auditLog = (req, res, next) => {
  if (!MUTATION_METHODS.has(req.method)) return next();
  if (SKIP_PATHS.some(skip => req.path.includes(skip))) return next();

  res.on('finish', async () => {
    // Only log successful mutations (2xx)
    if (res.statusCode < 200 || res.statusCode >= 300) return;
    // Skip if no authenticated user
    if (!req.user) return;

    try {
      await AuditLog.create({
        userId: req.user.id,
        userEmail: req.user.email,
        action: req.method,
        entity: extractEntity(req.path),
        entityId: extractEntityId(req.params, req.path),
        changes: req.method !== 'DELETE' ? sanitizeBody(req.body) : null,
        ip: req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip,
        companyId: req.user.companyId
      });
    } catch (err) {
      // Never let audit failure affect the request
      console.error('[AUDIT] Failed to create log:', err.message);
    }
  });

  next();
};
