/**
 * Helper pour démarrer/arrêter MongoDB in-memory dans les tests
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod;

export const connectTestDb = async () => {
  // Fail fast instead of buffering indefinitely
  mongoose.set('bufferCommands', false);

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
  });
};

export const disconnectTestDb = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongod) await mongod.stop();
};

export const clearTestDb = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

// Reconnecte au même serveur MongoDB in-memory déjà démarré par
// connectTestDb() — utile pour les tests qui doivent simuler une coupure de
// connexion (mongoose.connection.close()) sans faire tourner un second
// MongoMemoryServer inutilement.
export const reconnectTestDb = async () => {
  if (!mongod) throw new Error('reconnectTestDb() appelé sans connectTestDb() préalable');
  await mongoose.connect(mongod.getUri(), {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
  });
};
