/**
 * ⭐ Features Component
 *
 * Section features de la landing page
 */

import React from 'react';
import { Card } from '@/shared/components';

export const Features = () => {
  const features = [
    {
      icon: '💼',
      title: 'Gestion de Missions',
      description: 'Créez, publiez et gérez vos offres d\'emploi en quelques clics. Contrôlez le statut de chaque mission (brouillon, active, pause, fermée).'
    },
    {
      icon: '👥',
      title: 'CVthèque Intelligente',
      description: 'Centralisez tous vos candidats avec filtres avancés : compétences, secteur, localisation, expérience, disponibilité.'
    },
    {
      icon: '🎯',
      title: 'Pipeline Kanban',
      description: 'Suivez vos candidatures avec un board Kanban drag & drop : candidature → présélection → entretien → offre → embauche.'
    },
    {
      icon: '📅',
      title: 'Agenda Intégré',
      description: 'Planifiez vos entretiens et réunions. Vues jour, semaine, mois pour une organisation optimale.'
    },
    {
      icon: '🏢',
      title: 'Gestion Clients',
      description: 'Centralisez vos contacts clients et partenaires. Suivez vos relations commerciales efficacement.'
    },
    {
      icon: '👨‍💼',
      title: 'Gestion d\'Équipe',
      description: 'Gérez les utilisateurs de votre entreprise avec des rôles (user, admin, superadmin) et permissions.'
    },
    {
      icon: '📊',
      title: 'Analytics & Stats',
      description: 'Tableaux de bord avec KPIs : taux de conversion, sources de candidatures, performance des missions.'
    },
    {
      icon: '📥',
      title: 'Import / Export',
      description: 'Importez des candidats en masse (CSV) et exportez vos données (CSV, JSON) en un clic.'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Fonctionnalités Complètes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tout ce dont vous avez besoin pour gérer vos recrutements de A à Z
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} hover className="h-full">
              <div className="text-center">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
