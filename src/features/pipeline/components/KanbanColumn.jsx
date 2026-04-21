/**
 * 📊 Kanban Column Component
 *
 * Colonne droppable représentant un statut dans le pipeline
 */

import React, { useState } from 'react';
import { KanbanCard } from './KanbanCard';
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/config/constants';

export const KanbanColumn = ({
  status,
  title,
  applications = [],
  onView,
  onDrop,
  icon = '📋'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const applicationData = e.dataTransfer.getData('application');
      if (applicationData) {
        const application = JSON.parse(applicationData);
        if (onDrop) {
          onDrop(application, status);
        }
      }
    } catch (error) {
      console.error('Error parsing dropped application:', error);
    }
  };

  // Get color for column header based on status
  const getHeaderColor = () => {
    switch (status) {
      case 'applied':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'screening':
        return 'bg-purple-50 border-purple-200 text-purple-900';
      case 'interview':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'offer':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'hired':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const headerColor = getHeaderColor();

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg border border-gray-200">
      {/* Column Header */}
      <div className={`p-4 border-b ${headerColor} rounded-t-lg`}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <span>{icon}</span>
            <span>{title}</span>
          </h3>
          <span className="text-xs font-medium px-2 py-1 bg-white bg-opacity-60 rounded-full">
            {applications.length}
          </span>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 p-4 overflow-y-auto ${
          isDragOver ? 'bg-blue-100 border-2 border-dashed border-blue-400' : ''
        } transition-colors`}
        style={{ minHeight: '400px', maxHeight: 'calc(100vh - 300px)' }}
      >
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <p className="text-sm">Aucune candidature</p>
            <p className="text-xs mt-1">Glissez une carte ici</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((application) => (
              <KanbanCard
                key={application._id || application.id}
                application={application}
                onView={onView}
              />
            ))}
          </div>
        )}

        {/* Drop zone indicator when dragging */}
        {isDragOver && applications.length > 0 && (
          <div className="mt-3 p-4 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50 text-center text-sm text-blue-700">
            Déposer ici
          </div>
        )}
      </div>
    </div>
  );
};
