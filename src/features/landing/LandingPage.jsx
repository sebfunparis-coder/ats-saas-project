/**
 * 🏠 Landing Page
 *
 * Page d'accueil publique de l'application
 */

import React from 'react';
import { Hero } from './components/Hero';
import { Features } from './components/Features';

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 ATS Ultimate. Tous droits réservés.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            La solution complète pour gérer vos recrutements
          </p>
        </div>
      </footer>
    </div>
  );
};
