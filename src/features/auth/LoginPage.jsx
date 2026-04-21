/**
 * 🔐 Login Page
 *
 * Page de connexion
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/core/contexts';
import { Input, Button, Card } from '@/shared/components';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        navigate('/app/dashboard');
      } else {
        setError(result.error || 'Erreur de connexion');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">ATS Ultimate</h1>
          <p className="text-blue-200">Connectez-vous à votre compte</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Connexion</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              icon="📧"
            />

            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              icon="🔒"
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={!email || !password}
            >
              Se connecter
            </Button>

            <div className="text-center text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-blue-600 hover:underline font-medium"
              >
                Créer un compte
              </button>
            </div>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-100 hover:text-white transition-colors"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};
