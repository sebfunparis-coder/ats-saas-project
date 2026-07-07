/**
 * Response helpers — format standard pour tous les contrôleurs
 *
 * Format: { success, data, message, meta }
 *   success : boolean
 *   data    : payload (objet, tableau, null)
 *   message : texte lisible par l'humain (optionnel)
 *   meta    : pagination { total, page, limit, pages } (optionnel)
 */

/**
 * Réponse succès
 * @param {Response} res - Express response
 * @param {any}     data - Payload
 * @param {string}  [message] - Message optionnel
 * @param {object}  [meta]    - Métadonnées pagination
 * @param {number}  [status]  - Code HTTP (défaut 200)
 */
export const successResponse = (res, data = null, message = '', meta = null, status = 200) => {
  const body = { success: true };
  if (data !== null && data !== undefined) body.data = data;
  if (message) body.message = message;
  if (meta) body.meta = meta;
  return res.status(status).json(body);
};

/**
 * Réponse création (201)
 */
export const createdResponse = (res, data, message = '') =>
  successResponse(res, data, message, null, 201);

/**
 * Réponse erreur
 * @param {Response} res
 * @param {number}   statusCode
 * @param {string}   message
 * @param {object}   [details] - Champs en erreur (validation)
 */
export const errorResponse = (res, statusCode, message, details = null) => {
  const body = { success: false, message };
  if (details) body.details = details;
  return res.status(statusCode).json(body);
};

/**
 * Construit les métadonnées de pagination
 */
export const paginationMeta = (total, page, limit) => ({
  total,
  page: Number(page),
  limit: Number(limit),
  pages: Math.ceil(total / limit)
});
