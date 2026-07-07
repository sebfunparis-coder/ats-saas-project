import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const RETRY_DELAY_MS = 5000;
const MAX_RETRIES = 5;

const getConnectionOptions = () => ({
  maxPoolSize: 20,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
  readPreference: 'primaryPreferred',
  compressors: ['zlib'],
  zlibCompressionLevel: 6,
  autoIndex: process.env.NODE_ENV !== 'production',
  autoCreate: process.env.NODE_ENV !== 'production',
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectDatabase = async (retryCount = 0) => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ats-ultimate';

  const isAtlas = MONGODB_URI.includes('mongodb+srv');

  try {
    const conn = await mongoose.connect(MONGODB_URI, getConnectionOptions());

    const host = isAtlas
      ? MONGODB_URI.replace(/mongodb\+srv:\/\/[^@]+@/, '').split('/')[0]
      : conn.connection.host;

    logger.info('MongoDB connecté', {
      host,
      mode: isAtlas ? 'Atlas (cloud)' : 'local',
      db: conn.connection.name,
      pool: `${getConnectionOptions().minPoolSize}-${getConnectionOptions().maxPoolSize}`,
    });

    mongoose.connection.on('error', (err) => {
      logger.error('Erreur MongoDB', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB déconnecté — tentative de reconnexion automatique');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnecté');
    });

    return conn;
  } catch (error) {
    const isLastRetry = retryCount >= MAX_RETRIES;

    if (process.env.NODE_ENV === 'production' && !isLastRetry) {
      const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
      logger.warn(`MongoDB indisponible — retry ${retryCount + 1}/${MAX_RETRIES} dans ${delay / 1000}s`, {
        error: error.message,
      });
      await sleep(delay);
      return connectDatabase(retryCount + 1);
    }

    throw error;
  }
};

export const disconnectDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info('MongoDB déconnecté proprement');
  }
};

export const getDbStatus = () => {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  return {
    state: states[mongoose.connection.readyState] ?? 'unknown',
    host: mongoose.connection.host ?? null,
    name: mongoose.connection.name ?? null,
    readyState: mongoose.connection.readyState,
  };
};

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

export default { connectDatabase, disconnectDatabase, getDbStatus };
