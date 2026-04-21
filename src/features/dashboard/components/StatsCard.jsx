/**
 * 📊 Stats Card Component
 *
 * Carte KPI réutilisable pour afficher des statistiques
 */

import React from 'react';
import { Card } from '@/shared/components';

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'blue',
  onClick
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      text: 'text-blue-900'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      text: 'text-green-900'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      text: 'text-orange-900'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      text: 'text-purple-900'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      text: 'text-red-900'
    },
    gray: {
      bg: 'bg-gray-50',
      icon: 'text-gray-600',
      text: 'text-gray-900'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  const getTrendColor = () => {
    if (!trend) return '';
    return trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  };

  const getTrendIcon = () => {
    if (!trend) return '';
    return trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➖';
  };

  return (
    <Card
      className={`${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${colors.text} mb-1`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${getTrendColor()}`}>
              <span>{getTrendIcon()}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`${colors.bg} ${colors.icon} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
