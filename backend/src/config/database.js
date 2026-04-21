/**
 * 🗄️ Configuration Database MongoDB
 */

import mongoose from 'mongoose';

export const connectDatabase = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ats-ultimate';

    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    // En développement, on ne fait pas crash le serveur si MongoDB n'est pas dispo
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ Database connection failed: ${error.message.split(',')[0]}`);
      throw error; // On throw pour que server.js puisse le catch
    } else {
      // En production, on fait crash le serveur
      console.error(`❌ Database connection failed: ${error.message}`);
      process.exit(1);
    }
  }
};

export default { connectDatabase };
