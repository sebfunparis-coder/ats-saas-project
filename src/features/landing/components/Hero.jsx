/**
 * 🦸 Hero Component
 *
 * Section hero de la landing page
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components';

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          ATS Ultimate
        </h1>
        <p className="text-xl md:text-2xl mb-4 text-blue-100">
          La solution complète pour gérer vos recrutements
        </p>
        <p className="text-lg mb-8 text-blue-200 max-w-2xl mx-auto">
          Simplifiez votre processus de recrutement avec notre plateforme tout-en-un :
          gestion de missions, CVthèque intelligente, pipeline Kanban et bien plus encore.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            size="lg"
            onClick={() => navigate('/login')}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Se connecter
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={() => navigate('/register')}
            className="border-2 border-white text-white hover:bg-white hover:text-blue-600"
          >
            Créer un compte
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div>
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="font-semibold mb-1">Rapide</h3>
            <p className="text-sm text-blue-200">Interface intuitive et performante</p>
          </div>
          <div>
            <div className="text-4xl mb-2">🎯</div>
            <h3 className="font-semibold mb-1">Efficace</h3>
            <p className="text-sm text-blue-200">Pipeline Kanban drag & drop</p>
          </div>
          <div>
            <div className="text-4xl mb-2">📊</div>
            <h3 className="font-semibold mb-1">Complet</h3>
            <p className="text-sm text-blue-200">Statistiques et analytics détaillés</p>
          </div>
        </div>
      </div>
    </section>
  );
};
