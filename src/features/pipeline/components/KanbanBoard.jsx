/**
 * 🎯 Kanban Board Component
 *
 * Board complet avec toutes les colonnes du pipeline
 */

import React, { useMemo } from 'react';
import { KanbanColumn } from './KanbanColumn';

export const KanbanBoard = ({
  applications = [],
  onView,
  onStatusChange,
  loading = false
}) => {
  // Define columns configuration
  const columns = [
    {
      status: 'applied',
      title: 'Candidatures',
      icon: '📨'
    },
    {
      status: 'screening',
      title: 'Présélection',
      icon: '🔍'
    },
    {
      status: 'interview',
      title: 'Entretien',
      icon: '💬'
    },
    {
      status: 'offer',
      title: 'Offre',
      icon: '📝'
    },
    {
      status: 'hired',
      title: 'Embauché',
      icon: '✅'
    },
    {
      status: 'rejected',
      title: 'Rejeté',
      icon: '❌'
    }
  ];

  // Group applications by status
  const applicationsByStatus = useMemo(() => {
    const grouped = {};

    // Initialize all statuses with empty arrays
    columns.forEach(col => {
      grouped[col.status] = [];
    });

    // Group applications
    applications.forEach(app => {
      const status = app.status || 'applied';
      if (grouped[status]) {
        grouped[status].push(app);
      } else {
        // If status doesn't match any column, add to 'applied'
        grouped['applied'].push(app);
      }
    });

    return grouped;
  }, [applications]);

  // Handle drop
  const handleDrop = async (application, newStatus) => {
    // Don't do anything if dropped in same column
    if (application.status === newStatus) {
      return;
    }

    // Call parent handler to update status
    if (onStatusChange) {
      await onStatusChange(application._id || application.id, newStatus);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⏳</div>
          <p className="text-gray-600">Chargement du pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {columns.map((column) => (
        <KanbanColumn
          key={column.status}
          status={column.status}
          title={column.title}
          icon={column.icon}
          applications={applicationsByStatus[column.status] || []}
          onView={onView}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
};
