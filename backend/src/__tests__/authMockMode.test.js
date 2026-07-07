/**
 * Découvert en lançant réellement les tests de charge k6 (T-383, bloc 25) :
 * en Mode Mock (MongoDB non connecté — cf. CLAUDE.md, comportement de dev
 * prévu quand MongoDB n'est pas installé localement), `auth.controller.js`
 * (register/login) bascule déjà sur MockUser/MockCompany, mais le middleware
 * `protect` — traversé par TOUTE route authentifiée — appelait toujours
 * `User.findById()` (vrai Mongoose). Sans connexion active, Mongoose met la
 * requête en buffer puis échoue après 10s (`bufferTimeoutMS`) : CHAQUE appel
 * API authentifié en Mode Mock bloquait 10s puis retournait 500, contrairement
 * à ce que documente CLAUDE.md ("les routes /api/missions, /api/candidates...
 * fonctionnent toutes" en Mode Mock — faux pour tout ce qui passe par `protect`).
 *
 * Ce test simule le Mode Mock en coupant réellement la connexion Mongoose
 * (comme si MongoDB n'était pas installé) puis en restaurant une connexion
 * propre ensuite — le seul moyen de vérifier ce comportement sans dépendre
 * d'une vraie absence de MongoDB sur la machine qui exécute la suite.
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import { connectTestDb, disconnectTestDb, reconnectTestDb } from './helpers/testDb.js';

beforeAll(async () => { await connectTestDb(); });
afterAll(async () => { await disconnectTestDb(); });

describe('Auth middleware — comportement en Mode Mock (MongoDB déconnecté)', () => {
  it('protect() répond vite (pas de hang 10s) même sans connexion MongoDB active', async () => {
    // Un vrai token JWT (peu importe l'ID — en Mode Mock, seul le fait de ne
    // JAMAIS déclencher le buffering Mongoose de 10s compte ici).
    const jwt = (await import('jsonwebtoken')).default;
    const fakeToken = jwt.sign({ id: 'inexistant' }, process.env.JWT_SECRET || 'test-secret');

    // Simule l'absence de MongoDB en coupant la connexion active du process,
    // exactement l'état que `useMockDB()` détecte (`readyState !== 1`).
    await mongoose.connection.close();
    expect(mongoose.connection.readyState).not.toBe(1);

    try {
      const start = Date.now();
      const res = await request(app)
        .get('/api/missions')
        .set('Authorization', `Bearer ${fakeToken}`);
      const elapsed = Date.now() - start;

      // Avant le correctif : ~10 000ms (buffering Mongoose) + 500. Après :
      // quasi instantané, 401 (utilisateur mock introuvable pour cet ID).
      expect(elapsed).toBeLessThan(3000);
      expect(res.status).toBe(401);
    } finally {
      // Reconnexion au même serveur in-memory (pas de nouveau MongoMemoryServer)
      // pour ne pas casser afterAll() / les autres tests de ce fichier.
      await reconnectTestDb();
    }
  });
});
