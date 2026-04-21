/**
 * 📊 Dashboard Page
 *
 * Page principale du tableau de bord avec KPIs et activités
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useData } from '@/core/contexts';
import { StatsCard } from './components/StatsCard';
import { RecentActivity } from './components/RecentActivity';
import { QuickActions } from './components/QuickActions';
import { UpcomingEvents } from './components/UpcomingEvents';
import { Button } from '@/shared/components';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { missions, candidates, applications, events } = useData();

  // Calculate KPIs
  const stats = useMemo(() => {
    const activeMissions = missions.filter(m => m.status === 'Ouverte').length;
    const totalCandidates = candidates.length;
    const activeApplications = applications.filter(
      a => !['Hired', 'Rejected'].includes(a.status)
    ).length;
    const upcomingInterviews = events.filter(
      e => e.type === 'interview' && new Date(e.date) >= new Date()
    ).length;

    // Trends (mock data - in production, compare with previous period)
    const missionsTrend = activeMissions > 0 ? 'up' : 'neutral';
    const candidatesTrend = totalCandidates > 0 ? 'up' : 'neutral';
    const applicationsTrend = activeApplications > 0 ? 'up' : 'neutral';

    return {
      missions: {
        value: activeMissions,
        total: missions.length,
        trend: missionsTrend,
        trendValue: '+12% vs mois dernier'
      },
      candidates: {
        value: totalCandidates,
        new: candidates.filter(c => {
          const createdAt = new Date(c.createdAt);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return createdAt >= thirtyDaysAgo;
        }).length,
        trend: candidatesTrend,
        trendValue: '+8% vs mois dernier'
      },
      applications: {
        value: activeApplications,
        total: applications.length,
        trend: applicationsTrend,
        trendValue: '+15% vs mois dernier'
      },
      interviews: {
        value: upcomingInterviews,
        trend: upcomingInterviews > 5 ? 'up' : 'neutral',
        trendValue: upcomingInterviews > 0 ? `${upcomingInterviews} cette semaine` : 'Aucun prévu'
      }
    };
  }, [missions, candidates, applications, events]);

  // Recent activities (mock - in production, fetch from API)
  const recentActivities = useMemo(() => {
    const activities = [];

    // Add recent applications
    applications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .forEach(app => {
        const candidate = candidates.find(c => c._id === app.candidateId);
        const mission = missions.find(m => m._id === app.missionId);
        if (candidate && mission) {
          activities.push({
            id: app._id,
            type: 'application_created',
            title: 'Nouvelle candidature',
            description: `${candidate.firstName} ${candidate.lastName} a postulé pour ${mission.title}`,
            createdAt: app.createdAt,
            status: app.status
          });
        }
      });

    // Add recent missions
    missions
      .filter(m => m.status === 'Ouverte')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .forEach(mission => {
        activities.push({
          id: mission._id,
          type: 'mission_created',
          title: 'Mission publiée',
          description: `${mission.title} - ${mission.contractType}`,
          createdAt: mission.createdAt,
          status: mission.status
        });
      });

    // Add recent candidates
    candidates
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .forEach(candidate => {
        activities.push({
          id: candidate._id,
          type: 'candidate_created',
          title: 'Nouveau candidat',
          description: `${candidate.firstName} ${candidate.lastName} - ${candidate.position}`,
          createdAt: candidate.createdAt
        });
      });

    // Sort by date and limit
    return activities
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 15);
  }, [missions, candidates, applications]);

  // Upcoming events
  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📊 Tableau de bord
        </h1>
        <p className="text-gray-600">
          Bienvenue {user?.firstName} ! Voici un aperçu de votre activité
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Missions Actives"
          value={stats.missions.value}
          subtitle={`${stats.missions.total} au total`}
          icon="📝"
          color="blue"
          trend={stats.missions.trend}
          trendValue={stats.missions.trendValue}
          onClick={() => navigate('/app/missions')}
        />
        <StatsCard
          title="Candidats"
          value={stats.candidates.value}
          subtitle={`${stats.candidates.new} nouveaux ce mois`}
          icon="👥"
          color="green"
          trend={stats.candidates.trend}
          trendValue={stats.candidates.trendValue}
          onClick={() => navigate('/app/candidates')}
        />
        <StatsCard
          title="Candidatures Actives"
          value={stats.applications.value}
          subtitle={`${stats.applications.total} au total`}
          icon="📨"
          color="purple"
          trend={stats.applications.trend}
          trendValue={stats.applications.trendValue}
          onClick={() => navigate('/app/pipeline')}
        />
        <StatsCard
          title="Entretiens à venir"
          value={stats.interviews.value}
          subtitle={stats.interviews.trendValue}
          icon="📅"
          color="orange"
          trend={stats.interviews.trend}
          onClick={() => navigate('/app/calendar')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Activity (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <RecentActivity activities={recentActivities} maxItems={10} />
        </div>

        {/* Right Column - Quick Actions & Events (1/3 width) */}
        <div className="space-y-6">
          <QuickActions />
          <UpcomingEvents events={upcomingEvents} maxItems={5} />
        </div>
      </div>

      {/* Bottom Stats - Optional Performance Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pipeline Funnel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎯 Pipeline de recrutement
          </h3>
          <div className="space-y-3">
            {['Applied', 'Screening', 'Interview', 'Offer', 'Hired'].map((status, idx) => {
              const count = applications.filter(a => a.status === status).length;
              const percentage = applications.length > 0
                ? (count / applications.length) * 100
                : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{status}</span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Missions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔥 Missions populaires
          </h3>
          <div className="space-y-3">
            {missions
              .filter(m => m.status === 'Ouverte')
              .sort((a, b) => {
                const aCount = applications.filter(app => app.missionId === a._id).length;
                const bCount = applications.filter(app => app.missionId === b._id).length;
                return bCount - aCount;
              })
              .slice(0, 5)
              .map(mission => {
                const appCount = applications.filter(app => app.missionId === mission._id).length;
                return (
                  <div
                    key={mission._id}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/app/missions`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {mission.title}
                      </p>
                      <p className="text-xs text-gray-500">{mission.contractType}</p>
                    </div>
                    <span className="ml-2 text-sm font-semibold text-blue-600">
                      {appCount} 📨
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Recent Hires */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎉 Recrutements récents
          </h3>
          <div className="space-y-3">
            {applications
              .filter(a => a.status === 'Hired')
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
              .slice(0, 5)
              .map(app => {
                const candidate = candidates.find(c => c._id === app.candidateId);
                const mission = missions.find(m => m._id === app.missionId);
                if (!candidate || !mission) return null;
                return (
                  <div
                    key={app._id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate('/app/pipeline')}
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                      {candidate.firstName[0]}{candidate.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {candidate.firstName} {candidate.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{mission.title}</p>
                    </div>
                  </div>
                );
              })}
            {applications.filter(a => a.status === 'Hired').length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucun recrutement récent
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
