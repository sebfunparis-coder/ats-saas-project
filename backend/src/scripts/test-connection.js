/**
 * 🔌 Script de Test de Connexion MongoDB
 *
 * Ce script teste simplement la connexion à MongoDB
 * pour vérifier que tout est bien configuré.
 *
 * Usage: npm run test:connection
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from './database.js';

// Load environment variables
dotenv.config();

const testConnection = async () => {
  try {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   🔌 Test de Connexion MongoDB             ║');
    console.log('╚════════════════════════════════════════════╝\n');

    console.log('📍 URI de connexion :', process.env.MONGODB_URI || 'mongodb://localhost:27017/ats-ultimate');
    console.log('🔄 Tentative de connexion...\n');

    // Try to connect
    await connectDatabase();

    // Test database operations
    console.log('📊 Test des opérations de base...');

    // List databases
    const admin = mongoose.connection.db.admin();
    const { databases } = await admin.listDatabases();

    console.log('\n✅ Databases disponibles :');
    databases.forEach(db => {
      const marker = db.name === 'ats-ultimate' ? '👉' : '  ';
      console.log(`   ${marker} ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });

    // List collections if ats-ultimate exists
    const atsDb = databases.find(db => db.name === 'ats-ultimate');
    if (atsDb) {
      const collections = await mongoose.connection.db.listCollections().toArray();

      if (collections.length > 0) {
        console.log('\n📦 Collections dans ats-ultimate :');
        for (const collection of collections) {
          const count = await mongoose.connection.db.collection(collection.name).countDocuments();
          console.log(`   ✓ ${collection.name} (${count} documents)`);
        }
      } else {
        console.log('\n⚠️  Database ats-ultimate existe mais est vide');
        console.log('   💡 Lancez "npm run db:seed" pour la peupler');
      }
    } else {
      console.log('\n⚠️  Database ats-ultimate n\'existe pas encore');
      console.log('   💡 Lancez "npm run db:seed" pour la créer et la peupler');
    }

    // Connection info
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   ✅ CONNEXION RÉUSSIE !                   ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║   Host    : ${mongoose.connection.host}`.padEnd(48) + '║');
    console.log(`║   Port    : ${mongoose.connection.port || 'N/A'}`.padEnd(48) + '║');
    console.log(`║   Database: ${mongoose.connection.name}`.padEnd(48) + '║');
    console.log('╚════════════════════════════════════════════╝\n');

    console.log('🎉 MongoDB est prêt à l\'emploi !\n');
    console.log('📝 Prochaines étapes :');
    console.log('   1. npm run db:seed     - Peupler la base avec des données de test');
    console.log('   2. npm run dev         - Démarrer le serveur API');
    console.log('   3. npm test            - Lancer les tests\n');

  } catch (error) {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   ❌ ÉCHEC DE LA CONNEXION                 ║');
    console.log('╚════════════════════════════════════════════╝\n');

    console.error('❌ Erreur:', error.message);
    console.log('\n🔧 Solutions possibles :\n');

    if (error.message.includes('ECONNREFUSED')) {
      console.log('   1. MongoDB n\'est pas démarré');
      console.log('      Windows   : Start-Service MongoDB');
      console.log('      macOS     : brew services start mongodb-community');
      console.log('      Linux     : sudo systemctl start mongod\n');
    } else if (error.message.includes('Authentication failed')) {
      console.log('   1. Vérifiez votre username/password dans .env');
      console.log('   2. Pour MongoDB Atlas :');
      console.log('      - Le mot de passe est correct ?');
      console.log('      - L\'IP est autorisée (0.0.0.0/0) ?');
      console.log('      - L\'utilisateur a les permissions ?\n');
    } else if (error.message.includes('connect ETIMEDOUT')) {
      console.log('   1. Problème réseau ou firewall');
      console.log('   2. Pour MongoDB Atlas :');
      console.log('      - Vérifiez votre connexion internet');
      console.log('      - Autorisez votre IP dans Network Access\n');
    } else {
      console.log('   1. Vérifiez votre MONGODB_URI dans .env');
      console.log('   2. Consultez la documentation : backend/MONGODB_SETUP.md');
      console.log('   3. Vérifiez les logs MongoDB\n');
    }

    console.log('📖 Guide complet : backend/MONGODB_SETUP.md\n');

    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée\n');
  }
};

// Run test
testConnection();
