/**
 * 🎯 Pipeline Page
 *
 * Page principale du pipeline Kanban pour gérer les candidatures
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useApplications } from '@/core/hooks';
import { useUI, useFilters } from '@/core/contexts';
import { Button, Input, Select, StatsCard } from '@/shared/components';
import { KanbanBoard } from './components/KanbanBoard';
import { ApplicationDetail } from './components/ApplicationDetail';
import { exportData } from '@/core/utils/exporters';
import { APPLICATION_STATUS } from '@/config/constants';

export const PipelinePage = () => {
  const { applications, fetchApplications, updateApplicationStatus } = useApplications();
  const { loadingStates } = useUI();
  const { applicationFilters, updateApplicationFilters } = useFilters();

  // Local state
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const total = applications.length;
    const active = applications.filter(
      a => !['rejected', 'hired'].includes(a.status)
    ).length;
    const interviews = applications.filter(a => a.status === 'interview').length;
    const hired = applications.filter(a => a.status === 'hired').length;

    return { total, active, interviews, hired };
  }, [applications]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    let filtered = [...applications];

    // Search filter
    if (applicationFilters.search) {
      const searchLower = applicationFilters.search.toLowerCase();
      filtered = filtered.filter(app => {
        const candidateName = app.candidate
          ? `${app.candidate.firstName} ${app.candidate.lastName}`.toLowerCase()
          : '';
        const candidateEmail = app.candidate?.email?.toLowerCase() || '';
        const missionTitle = app.mission?.title?.toLowerCase() || '';

        return (
          candidateName.includes(searchLower) ||
          candidateEmail.includes(searchLower) ||
          missionTitle.includes(searchLower)
        );
      });
    }

    // Status filter
    if (applicationFilters.status && applicationFilters.status !== '') {
      filtered = filtered.filter(app => app.status === applicationFilters.status);
    }

    // Mission filter
    if (applicationFilters.missionId) {
      filtered = filtered.filter(
        app => (app.mission?.id || app.mission?._id || app.missionId) === applicationFilters.missionId
      );
    }

    return filtered;
  }, [applications, applicationFilters]);

  // Handlers
  const handleView = (application) => {
    setCurrentApplication(application);
    setIsDetailOpen(true);
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    await updateApplicationStatus(applicationId, newStatus);
    // Update current application if it's the one being viewed
    if (currentApplication && (currentApplication._id === applicationId || currentApplication.id === applicationId)) {
      setCurrentApplication(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleReject = async (application) => {
    if (confirm(`Rejeter la candidature de ${application.candidate?.firstName} ${application.candidate?.lastName} ?`)) {
      await handleStatusChange(application._id || application.id, 'rejected');
      setIsDetailOpen(false);
    }
  };

  const handleAccept = async (application) => {
    if (confirm(`Embaucher ${application.candidate?.firstName} ${application.candidate?.lastName} ?`)) {
      await handleStatusChange(application._id || application.id, 'hired');
      setIsDetailOpen(false);
    }
  };

  const handleExport = () => {
    try {
      exportData('applications', filteredApplications, 'csv');
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  // Status options for filter
  const statusOptions = Object.entries(APPLICATION_STATUS).map(([key, value]) => ({
    value,
    label: key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pipeline</h1>
        <p className="text-gray-600">Gérez le parcours de vos candidats</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard title="Total Candidatures" value={stats.total} icon="📨" color="blue" />
        <StatsCard title="En cours" value={stats.active} icon="⏳" color="orange" />
        <StatsCard title="Entretiens" value={stats.interviews} icon="💬" color="purple" />
        <StatsCard title="Embauchés" value={stats.hired} icon="✅" color="green" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Rechercher candidat ou mission..."
            value={applicationFilters.search || ''}
            onChange={(e) => updateApplicationFilters({ search: e.target.value })}
            icon="🔍"
          />
          <Select
            placeholder="Tous les statuts"
            value={applicationFilters.status || ''}
            onChange={(e) => updateApplicationFilters({ status: e.target.value })}
            options={statusOptions}
          />
          <Button
            variant="secondary"
            onClick={() => updateApplicationFilters({ search: '', status: '', missionId: '' })}
            icon="🔄"
          >
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-600">
          {filteredApplications.length} candidature{filteredApplications.length > 1 ? 's' : ''} affichée{filteredApplications.length > 1 ? 's' : ''}
          {applications.length !== filteredApplications.length && (
            <span className="text-gray-500"> (sur {applications.length} au total)</span>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleExport}
            icon="📥"
            disabled={filteredApplications.length === 0}
          >
            Exporter
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard
        applications={filteredApplications}
        onView={handleView}
        onStatusChange={handleStatusChange}
        loading={loadingStates.applications}
      />

      {/* Application Detail Modal */}
      <ApplicationDetail
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setCurrentApplication(null);
        }}
        application={currentApplication}
        onStatusChange={handleStatusChange}
        onReject={handleReject}
        onAccept={handleAccept}
      />
    </div>
  );
};
