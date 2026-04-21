/**
 * 📊 StatsCard Component
 *
 * Carte d'affichage de statistiques/KPI
 */

import React from 'react';
import { Card } from '../Card/Card';

/**
 * @param {object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Stat value
 * @param {string} props.icon - Icon (emoji)
 * @param {string} props.trend - Trend indicator ('+5%', '-2%')
 * @param {string} props.trendDirection - Trend direction ('up', 'down', 'neutral')
 * @param {string} props.description - Description text
 * @param {string} props.color - Color theme ('blue', 'green', 'purple', 'orange', 'red')
 * @param {Function} props.onClick - Click handler
 */
export const StatsCard = ({
  title,
  value,
  icon,
  trend,
  trendDirection,
  description,
  color = 'blue',
  onClick
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card hover={!!onClick} onClick={onClick} className="cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>

          {trend && trendDirection && (
            <p className={`text-sm font-medium ${trendColors[trendDirection]}`}>
              {trendDirection === 'up' && '↑ '}
              {trendDirection === 'down' && '↓ '}
              {trend}
            </p>
          )}

          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>

        {icon && (
          <div className={`text-4xl p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
