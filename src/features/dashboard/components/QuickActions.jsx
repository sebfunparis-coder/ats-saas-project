/**
 * ⚡ Quick Actions Component
 *
 * Actions rapides du dashboard
 */

import React from 'react';
import { Card, Button } from '@/shared/components';
import { useNavigate } from 'react-router-dom';

export const QuickActions = ({ onNewMission, onNewCandidate, onNewClient }) => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: '📝',
      title: 'Nouvelle Mission',
      description: 'Créer une offre d\'emploi',
      color: 'blue',
      onClick: onNewMission || (() => navigate('/app/missions'))
    },
    {
      icon: '👤',
      title: 'Nouveau Candidat',
      description: 'Ajouter un candidat',
      color: 'green',
      onClick: onNewCandidate || (() => navigate('/app/candidates'))
    },
    {
      icon: '🏢',
      title: 'Nouveau Client',
      description: 'Enregistrer un client',
      color: 'purple',
      onClick: onNewClient || (() => navigate('/app/clients'))
    },
    {
      icon: '📊',
      title: 'Voir Pipeline',
      description: 'Suivi candidatures',
      color: 'orange',
      onClick: () => navigate('/app/pipeline')
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100'
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        ⚡ Actions rapides
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`${colorClasses[action.color]} p-4 rounded-lg text-left transition-colors`}
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <div className="font-medium text-sm text-gray-900 mb-0.5">
              {action.title}
            </div>
            <div className="text-xs text-gray-600">
              {action.description}
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};
