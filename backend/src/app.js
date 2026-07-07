/**
 * Express app factory — séparé de server.js pour permettre les tests d'intégration
 * server.js importe ceci et appelle app.listen().
 * Les tests importent ceci et utilisent supertest(app).
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';

import { errorHandler, notFound } from './middleware/error.middleware.js';
import { protect } from './middleware/auth.middleware.js';
import routes from './routes/index.js';
import { getCorsOptions } from './config/cors.js';

dotenv.config();

const app = express();

// Security
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(mongoSanitize({ replaceWith: '_' }));

// T-334 : CORS aligné sur server.js (avant : `origin: '*'` + `credentials:
// true`, une config incorrecte et divergente de la prod — les tests
// d'intégration qui utilisent cette factory ne validaient donc rien de réel
// sur ce point).
app.use(cors(getCorsOptions()));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Health
app.get('/health', (_req, res) =>
  res.json({ success: true, message: 'OK', timestamp: new Date().toISOString() })
);

// API routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
