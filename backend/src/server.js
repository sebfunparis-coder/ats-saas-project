/**
 * 🚀 ATS Ultimate Backend API Server
 * Node.js + Express + MongoDB
 */

import * as Sentry from '@sentry/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './utils/logger.js';

// Load env first so SENTRY_DSN is available
dotenv.config();

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1,
    integrations: [Sentry.httpIntegration()],
  });
}

// Import configurations
import { connectDatabase, getDbStatus } from './config/database.js';
import { startTrialService } from './services/trial.service.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { globalLimiter, authLimiter, apiLimiter } from './middleware/rateLimiter.js';
import { protect } from './middleware/auth.middleware.js';
import { csrfProtection } from './middleware/csrf.middleware.js';
import { getAllowedOrigins, getCorsOptions } from './config/cors.js';

// Import routes
import routes from './routes/index.js';

// Swagger
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== MIDDLEWARE =====

// Security headers - Enhanced configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration (T-334 : partagée avec app.js via config/cors.js)
const allowedOrigins = getAllowedOrigins();
app.use(cors(getCorsOptions()));

// CSRF protection (Origin/Referer validation for mutation endpoints)
app.use(csrfProtection(allowedOrigins));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn('NoSQL injection attempt detected', {
      event: 'security.nosql_injection',
      key,
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
    });
  }
}));

// Compression
app.use(compression());

// T-339 : le format 'combined' logge l'URL complète, query string incluse —
// GET /api/sse/stream?token=<JWT> écrivait le JWT en clair dans les logs
// applicatifs (et ceux de tout proxy intermédiaire en prod). On redacte tout
// paramètre `token` avant de logger, plutôt que d'utiliser :url directement.
morgan.token('redacted-url', (req) => req.originalUrl.replace(/([?&]token=)[^&]+/i, '$1[REDACTED]'));
app.use(morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :redacted-url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
  { stream: logger.stream }
));

// Rate limiting - Global limiter applied to all API routes
app.use('/api', globalLimiter);

// ===== STATIC FILES =====

// Serve uploaded files (protected by auth)
app.use('/uploads', protect, express.static(path.join(__dirname, '../uploads')));

// ===== ROUTES =====

// Health check
app.get('/health', (req, res) => {
  const db = getDbStatus();
  const memMB = process.memoryUsage();
  const healthy = db.readyState === 1 || process.env.NODE_ENV === 'development';

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    status: healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    database: {
      state: db.state,
      host: db.host,
      name: db.name,
    },
    memory: {
      heapUsedMB: Math.round(memMB.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(memMB.heapTotal / 1024 / 1024),
      rssMB: Math.round(memMB.rss / 1024 / 1024),
    },
  });
});

// ── Swagger UI (/api/docs) ──────────────────────────────────────────────────
// Helmet CSP relaxée uniquement pour cette route (swagger-ui nécessite unsafe-inline)
app.use('/api/docs', (req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; worker-src blob:;"
  );
  next();
}, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'ATS Ultimate — API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    defaultModelsExpandDepth: 1,
  },
}));

// Spec OpenAPI brute exportable en JSON
app.get('/api/docs/spec.json', (req, res) => res.json(swaggerSpec));

// API routes (centralized)
// Apply stricter rate limiting for auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Apply per-user rate limiting for all API routes (after global limiter)
app.use('/api', apiLimiter);

// All routes
app.use('/api', routes);

// 404 handler (doit être après les routes)
app.use(notFound);

// Error handling middleware (doit être en dernier)
app.use(errorHandler);

// ===== START SERVER =====

const startServer = async () => {
  // T-363 : `isProduction` n'était jamais déclaré dans ce fichier (seul cors.js
  // en a une copie locale, non exportée) — chaque démarrage levait un
  // ReferenceError non catché, transformé en unhandledRejection → process.exit(1).
  const isProduction = process.env.NODE_ENV === 'production';
  // Fail fast in production if required env vars are missing
  if (isProduction && !process.env.FRONTEND_URL) {
    logger.error('FRONTEND_URL est requis en production (variable .env manquante)');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    logger.error('JWT_SECRET est requis (variable .env manquante)');
    process.exit(1);
  }

  try {
    let dbConnected = false;
    try {
      await connectDatabase();
      dbConnected = true;
    } catch (dbError) {
      logger.warn('MongoDB non disponible — Mode Mock Data activé', {
        hint: 'Installez MongoDB localement ou configurez MongoDB Atlas',
      });
    }

    // Démarrer les services de fond
    startTrialService();

    app.listen(PORT, () => {
      logger.info('ATS Ultimate Backend API démarré', {
        port: PORT,
        env: process.env.NODE_ENV || 'development',
        db: dbConnected ? 'connected' : 'mock',
        url: `http://localhost:${PORT}/health`,
      });
    });
  } catch (error) {
    logger.error('Erreur au démarrage du serveur', { error });
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION — shutting down', { error: err });
  process.exit(1);
});

// Start the server
startServer();

export default app;

