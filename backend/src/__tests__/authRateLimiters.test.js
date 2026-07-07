/**
 * T-379/T-380 : `passwordResetLimiter` n'était appliqué qu'à
 * `/resend-verification` (pas à `/forgot-password` ni `/reset-password/:token`)
 * et `registrationLimiter` était défini dans rateLimiter.js mais jamais importé
 * nulle part — `/api/auth/register` n'était couvert que par `authLimiter`
 * (5/15min, partagé avec `/login`), plus permissif que prévu.
 *
 * En NODE_ENV=test, express-rate-limit est volontairement désactivé (max
 * porté à 100000 — voir rateLimiter.js) pour ne jamais ralentir la suite : un
 * test HTTP classique ne peut donc pas observer un vrai 429 ici. On vérifie à
 * la place, de façon structurelle, que le bon middleware est bien monté sur
 * la bonne route dans la pile Express (comparaison de référence de fonction),
 * ce qui est le seul fait vérifiable indépendamment de NODE_ENV.
 */
import { describe, it, expect } from '@jest/globals';
import authRoutes from '../routes/auth.routes.js';
import { registrationLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';

function middlewaresForPath(path) {
  const layer = authRoutes.stack.find(l => l.route && l.route.path === path);
  if (!layer) return [];
  return layer.route.stack.map(s => s.handle);
}

describe('T-379/T-380 — rate limiters câblés sur les bonnes routes auth', () => {
  it('POST /register applique registrationLimiter', () => {
    const handlers = middlewaresForPath('/register');
    expect(handlers).toContain(registrationLimiter);
  });

  it('POST /forgot-password applique passwordResetLimiter', () => {
    const handlers = middlewaresForPath('/forgot-password');
    expect(handlers).toContain(passwordResetLimiter);
  });

  it('POST /reset-password/:token applique passwordResetLimiter', () => {
    const handlers = middlewaresForPath('/reset-password/:token');
    expect(handlers).toContain(passwordResetLimiter);
  });

  it('POST /resend-verification garde passwordResetLimiter (pas de régression)', () => {
    const handlers = middlewaresForPath('/resend-verification');
    expect(handlers).toContain(passwordResetLimiter);
  });
});
