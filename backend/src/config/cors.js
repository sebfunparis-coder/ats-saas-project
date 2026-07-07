/**
 * Configuration CORS partagée — T-334.
 *
 * `app.js` (factory Express utilisée par toute la suite de tests via
 * supertest) avait divergé de `server.js` : CORS `origin: '*'` + `credentials:
 * true` (config incorrecte — les deux ensemble sont de toute façon rejetés par
 * les navigateurs, mais restaient trompeurs et non alignés avec la prod), pas
 * de restriction par allowlist. Centraliser ici garantit que les tests
 * d'intégration valident la même politique CORS qu'en production.
 */

const DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
];

export function getAllowedOrigins() {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction
    ? [process.env.FRONTEND_URL].filter(Boolean)
    : [...DEV_ORIGINS, process.env.FRONTEND_URL].filter(Boolean);
}

export function getCorsOptions() {
  const allowedOrigins = getAllowedOrigins();
  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origine non autorisée — ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}
