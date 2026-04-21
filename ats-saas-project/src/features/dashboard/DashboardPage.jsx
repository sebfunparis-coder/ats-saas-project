import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/shared/components/Layout/PageContainer';
import StatsCard from './components/StatsCard';
import RecentActivity from './components/RecentActivity';
import { useData } from '@/core/contexts/DataContext';

/**
 * Page Dashboard - KPIs, funnel pipeline, activité récente
 */
export function DashboardPage() {
  const { missions, candidates, applications, history } = useData();
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState('month');

  const stats = useMemo(() => {
    const now = new Date();

    const getThreshold = (period) => {
      const t = new Date(now);
      if (period === 'week')    t.setDate(t.getDate() - 7);
      else if (period === 'month')   t.setMonth(t.getMonth() - 1);
      else if (period === 'quarter') t.setMonth(t.getMonth() - 3);
      else if (period === 'year')    t.setFullYear(t.getFullYear() - 1);
      else t.setFullYear(2020);
      return t;
    };

    const getPrevRange = (period) => {
      const end = new Date(now);
      const start = new Date(now);
      if (period === 'week')    { end.setDate(end.getDate() - 7);    start.setDate(start.getDate() - 14); }
      else if (period === 'month')   { end.setMonth(end.getMonth() - 1);   start.setMonth(start.getMonth() - 2); }
      else if (period === 'quarter') { end.setMonth(end.getMonth() - 3);   start.setMonth(start.getMonth() - 6); }
      else if (period === 'year')    { end.setFullYear(end.getFullYear() - 1); start.setFullYear(start.getFullYear() - 2); }
      else return null;
      return { start, end };
    };

    const threshold = getThreshold(timePeriod);
    const prevRange = getPrevRange(timePeriod);

    const inPeriod = (dateStr, from, to) => {
      const d = new Date(dateStr || '2024-01-01');
      return d >= from && (!to || d < to);
    };

    const curMissions     = missions.filter(m => inPeriod(m.dateAdded || m.createdDate, threshold));
    const curCandidates   = candidates.filter(c => inPeriod(c.dateAdded, threshold));
    const curApplications = applications.filter(a => inPeriod(a.dateApplied || a.appliedDate, threshold));

    const prevMissions     = prevRange ? missions.filter(m => inPeriod(m.dateAdded || m.createdDate, prevRange.start, prevRange.end)) : [];
    const prevCandidates   = prevRange ? candidates.filter(c => inPeriod(c.dateAdded, prevRange.start, prevRange.end)) : [];
    const prevApplications = prevRange ? applications.filter(a => inPeriod(a.dateApplied || a.appliedDate, prevRange.start, prevRange.end)) : [];

    const trend = (cur, prev) => {
      if (prev === 0) return cur > 0 ? '+100%' : '0%';
      const d = ((cur - prev) / prev) * 100;
      return d > 0 ? `+${d.toFixed(0)}%` : `${d.toFixed(0)}%`;
    };

    const openMissions       = curMissions.filter(m => m.status === 'open').length;
    const activeCandidates   = curCandidates.filter(c => c.status === 'active').length;
    const screening          = curApplications.filter(a => a.status === 'screening').length;
    const interview          = curApplications.filter(a => a.status === 'interview_1' || a.status === 'interview_2').length;
    const hired              = curApplications.filter(a => a.status === 'hired').length;
    const rejected           = curApplications.filter(a => a.status === 'rejected').length;
    const total              = curApplications.length;

    // Taux de conversion déterministes
    const conversionStoI = screening > 0 ? ((interview / screening) * 100).toFixed(1) : 0;
    const conversionItoH = interview > 0 ? ((hired / interview) * 100).toFixed(1) : 0;
    const overallRate    = total > 0 ? ((hired / total) * 100).toFixed(1) : 0;

    // Temps moyen de recrutement : calculé depuis dateApplied des candidatures hired
    const hiredApps = curApplications.filter(a => a.status === 'hired');
    const avgTimeToHire = (() => {
      if (hiredApps.length === 0) return 0;
      const totalDays = hiredApps.reduce((sum, a) => {
        const applied = new Date(a.dateApplied || now);
        return sum + Math.round((now - applied) / (1000 * 60 * 60 * 24));
      }, 0);
      return Math.round(totalDays / hiredApps.length);
    })();

    // Top 5 missions par candidatures
    const topMissions = missions
      .map(m => ({
        id: m.id,
        title: m.title,
        count: applications.filter(a => a.missionId === m.id).length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Funnel pipeline (toutes les candidatures, pas filtrées par période)
    const funnelStages = [
      { label: 'Reçues',       count: applications.filter(a => a.status === 'received').length,    color: '#6B7280' },
      { label: 'Présélection', count: applications.filter(a => a.status === 'screening').length,   color: '#3B82F6' },
      { label: 'Entretiens',   count: applications.filter(a => a.status === 'interview_1' || a.status === 'interview_2').length, color: '#F59E0B' },
      { label: 'Offres',       count: applications.filter(a => a.status === 'offer' || a.status === 'final').length, color: '#8B5CF6' },
      { label: 'Recrutés',     count: applications.filter(a => a.status === 'hired').length,       color: '#10B981' },
    ];

    return {
      missions:     { open: openMissions,     trend: trend(openMissions, prevMissions.filter(m => m.status === 'open').length) },
      candidates:   { active: activeCandidates, trend: trend(activeCandidates, prevCandidates.filter(c => c.status === 'active').length) },
      applications: { total, screening, interview, hired, rejected,
        screeningTrend: trend(screening, prevApplications.filter(a => a.status === 'screening').length),
        interviewTrend: trend(interview, prevApplications.filter(a => a.status === 'interview_1' || a.status === 'interview_2').length),
        hiredTrend:     trend(hired,     prevApplications.filter(a => a.status === 'hired').length),
      },
      conversions: { screeningToInterview: conversionStoI, interviewToHired: conversionItoH, overallSuccessRate: overallRate },
      performance: { avgTimeToHire },
      topMissions,
      funnelStages,
    };
  }, [missions, candidates, applications, timePeriod]);

  // ─── Styles réutilisables ────────────────────────────────────────────────
  const card = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #F3F4F6',
  };

  const sectionTitle = {
    fontSize: '22px',
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: '20px',
  };

  const periodBtn = (active) => ({
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: active ? '#667EEA' : 'white',
    color: active ? 'white' : '#6B7280',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: active ? '0 2px 8px rgba(102,126,234,0.35)' : '0 1px 3px rgba(0,0,0,0.08)',
  });

  const maxFunnel = Math.max(...stats.funnelStages.map(s => s.count), 1);

  return (
    <PageContainer title="Dashboard" subtitle="Vue d'ensemble de votre activité">

      {/* Sélecteur de période */}
      <div style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        padding: '14px 20px',
        background: '#F9FAFB',
        borderRadius: '12px',
        marginBottom: '32px',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontWeight: '700', color: '#374151', fontSize: '13px' }}>📅 Période :</span>
        {[
          { key: 'week',    label: '7 jours' },
          { key: 'month',   label: '30 jours' },
          { key: 'quarter', label: '3 mois' },
          { key: 'year',    label: '12 mois' },
          { key: 'all',     label: 'Tout' },
        ].map(({ key, label }) => (
          <button key={key} style={periodBtn(timePeriod === key)} onClick={() => setTimePeriod(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* KPIs principaux */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <StatsCard icon="💼" label="Missions Actives"   value={stats.missions.open}                    trend={`${stats.missions.trend} vs période précédente`}              color="#667EEA" />
        <StatsCard icon="👥" label="Candidats Actifs"   value={stats.candidates.active}                trend={`${stats.candidates.trend} vs période précédente`}            color="#10B981" />
        <StatsCard icon="🔍" label="En Présélection"    value={stats.applications.screening}           trend={`${stats.applications.screeningTrend} vs période précédente`} color="#3B82F6" />
        <StatsCard icon="💬" label="Entretiens"         value={stats.applications.interview}           trend={`${stats.applications.interviewTrend} vs période précédente`} color="#F59E0B" />
        <StatsCard icon="🎉" label="Recrutements"       value={stats.applications.hired}               trend={`${stats.applications.hiredTrend} vs période précédente`}     color="#EC4899" />
        <StatsCard icon="⚡" label="Taux de réussite"   value={`${stats.conversions.overallSuccessRate}%`} trend={`${stats.applications.total} candidatures totales`}       color="#8B5CF6" />
      </div>

      {/* Funnel pipeline */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={sectionTitle}>🔽 Funnel de recrutement</h2>
        <div style={{ ...card }}>
          {stats.funnelStages.map((stage, i) => {
            const pct = Math.round((stage.count / maxFunnel) * 100);
            const dropRate = i > 0 && stats.funnelStages[i - 1].count > 0
              ? Math.round((1 - stage.count / stats.funnelStages[i - 1].count) * 100)
              : null;
            return (
              <div key={stage.label} style={{ marginBottom: i < stats.funnelStages.length - 1 ? '18px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: stage.color, flexShrink: 0,
                    }} />
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#374151' }}>{stage.label}</span>
                    {dropRate !== null && (
                      <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: '600' }}>
                        −{dropRate}%
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '16px', fontWeight: '900', color: stage.color }}>
                    {stage.count}
                  </span>
                </div>
                <div style={{ height: '10px', background: '#F3F4F6', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${stage.color} 0%, ${stage.color}bb 100%)`,
                    borderRadius: '5px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance & Conversion */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={sectionTitle}>📊 Performance & Conversion</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>

          {/* Conversion Présélection → Entretien */}
          <div style={card}>
            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
              📈 Présélection → Entretien
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#3B82F6', marginBottom: '8px' }}>
              {stats.conversions.screeningToInterview}%
            </div>
            <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ width: `${stats.conversions.screeningToInterview}%`, height: '100%', background: '#3B82F6', borderRadius: '3px' }} />
            </div>
            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
              {stats.applications.interview} entretiens / {stats.applications.screening} présélections
            </div>
          </div>

          {/* Conversion Entretien → Embauche */}
          <div style={card}>
            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
              🎯 Entretien → Embauche
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#10B981', marginBottom: '8px' }}>
              {stats.conversions.interviewToHired}%
            </div>
            <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ width: `${stats.conversions.interviewToHired}%`, height: '100%', background: '#10B981', borderRadius: '3px' }} />
            </div>
            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
              {stats.applications.hired} embauches / {stats.applications.interview} entretiens
            </div>
          </div>

          {/* Temps moyen de recrutement (calculé, pas random) */}
          <div style={card}>
            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
              ⏱️ Temps moyen de recrutement
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#F59E0B', marginBottom: '8px' }}>
              {stats.performance.avgTimeToHire > 0 ? `${stats.performance.avgTimeToHire}j` : '—'}
            </div>
            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
              Délai moyen depuis la candidature
            </div>
          </div>

          {/* Rejets */}
          <div style={card}>
            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
              📉 Candidatures rejetées
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#EF4444', marginBottom: '8px' }}>
              {stats.applications.rejected}
            </div>
            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
              {stats.applications.total > 0
                ? `${((stats.applications.rejected / stats.applications.total) * 100).toFixed(1)}% du total`
                : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Missions */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={sectionTitle}>🏆 Top 5 Missions les plus actives</h2>
        <div style={card}>
          {stats.topMissions.length > 0 ? stats.topMissions.map((mission, i) => (
            <div key={mission.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: i < stats.topMissions.length - 1 ? '1px solid #F3F4F6' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#E5E7EB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '900', fontSize: '13px',
                  color: i < 3 ? 'white' : '#6B7280',
                }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: '#1F2937', fontSize: '14px' }}>{mission.title}</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{mission.count} candidature{mission.count > 1 ? 's' : ''}</div>
                </div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#667EEA' }}>{mission.count}</div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '24px' }}>
              Aucune mission avec candidatures pour le moment
            </div>
          )}
        </div>
      </div>

      {/* Activité + Actions rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <div>
          <h2 style={sectionTitle}>📋 Activité Récente</h2>
          <RecentActivity history={history} />
        </div>

        <div>
          <h2 style={sectionTitle}>🚀 Actions Rapides</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              { label: '➕ Nouvelle Mission',   path: '/app/missions',    grad: '#667EEA,#764BA2' },
              { label: '👥 Nouveau Candidat',   path: '/app/candidates',  grad: '#10B981,#34D399' },
              { label: '📊 Voir le Pipeline',   path: '/app/pipeline',    grad: '#3B82F6,#60A5FA' },
              { label: '🔍 Parcourir CVthèque', path: '/app/cvtheque',    grad: '#F59E0B,#FBBF24' },
            ].map(({ label, path, grad }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                style={{
                  padding: '18px',
                  background: `linear-gradient(135deg, ${grad})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '15px',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default DashboardPage;
