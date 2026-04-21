/**
 * 🚀 ATS Ultimate Backend API Server
 * Node.js + Express + MongoDB
 */

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

// Import configurations
import { connectDatabase } from './config/database.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { globalLimiter, authLimiter, apiLimiter } from './middleware/rateLimiter.js';
import { protect } from './middleware/auth.middleware.js';

// Import routes
import routes from './routes/index.js';

// Load environment variables
dotenv.config();

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

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️ Tentative d'injection NoSQL détectée - Key: ${key}`);
  }
}));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting - Global limiter applied to all API routes
app.use('/api', globalLimiter);

// ===== STATIC FILES =====

// Serve uploaded files (protected by auth)
app.use('/uploads', protect, express.static(path.join(__dirname, '../uploads')));

// ===== ROUTES =====

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ATS Ultimate API is running! 🚀',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

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
  try {
    // Try to connect to database (optional for development)
    let dbStatus = 'Not Connected ⚠️ (Mock Data)';
    try {
      await connectDatabase();
      dbStatus = 'Connected ✅';
    } catch (dbError) {
      console.warn('⚠️ MongoDB non disponible - Mode Mock Data activé');
      console.warn('   Pour utiliser MongoDB : installez et démarrez MongoDB localement');
      console.warn('   ou utilisez MongoDB Atlas (cloud)');
    }

    // Start listening
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════╗
║   🚀 ATS Ultimate Backend API Server       ║
╠════════════════════════════════════════════╣
║   Port        : ${PORT}                    ║
║   Environment : ${process.env.NODE_ENV || 'development'}            ║
║   Database    : ${dbStatus}  ║
║   Status      : Running 🟢                 ║
║   API Docs    : http://localhost:${PORT}/health     ║
╚════════════════════════════════════════════╝

📝 Note: Les routes retournent des données mock pour le moment.
   Implémentez les controllers pour connecter à MongoDB.
      `);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage du serveur:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION:', err);
  process.exit(1);
});

// Start the server
startServer();

export default app;

