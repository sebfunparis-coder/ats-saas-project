import React, { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/shared/components/Layout/PageContainer';
import StatsCard, { StatsGrid } from '@/shared/components/StatsCard/StatsCard';
import RecentActivity from './components/RecentActivity';
import ActivityChart from './components/ActivityChart';
import TodayWidget from './components/TodayWidget';
import { useData } from '@/core/contexts/DataContext';

const WIDGET_ORDER_KEY = 'ats_dashboard_widget_order';
const DEFAULT_ORDER = ['activity', 'funnel', 'performance', 'forecast', 'top-missions', 'today', 'recent', 'velocity', 'quickwins', 'minifunnel'];

const WIDGET_META = {
  activity:     { icon: '📈', label: 'Activité 7 derniers jours' },
  funnel:       { icon: '🔽', label: 'Funnel de recrutement' },
  performance:  { icon: '📊', label: 'Performance & Conversion' },
  'top-missions': { icon: '🏆', label: 'Top 5 Missions actives' },
  forecast:       { icon: '🔮', label: 'Prévisions de recrutement' },
  today:        { icon: '📅', label: 'À faire aujourd\'hui' },
  recent:       { icon: '📋', label: 'Activité récente & Actions' },
  velocity:     { icon: '⚡', label: 'Vélocité de recrutement' },
  quickwins:    { icon: '🔥', label: 'Candidats chauds non contactés' },
  minifunnel:   { icon: '📊', label: 'Mini funnel pipeline' },
};

function DraggableWidget({ id, dragOver, onDragStart, onDragOver, onDrop, children }) {
  const isOver = dragOver === id;
  return (
    <div
      draggable
      onDragStart={() => onDragStart(id)}
      onDragOver={e => { e.preventDefault(); onDragOver(id); }}
      onDrop={() => onDrop(id)}
      style={{ position: 'relative', marginBottom: '40px', opacity: 1, outline: isOver ? '2px dashed #667EEA' : 'none', borderRadius: '16px', transition: 'outline 0.15s' }}
    >
      <div
        title="Glisser pour réorganiser"
        style={{ position: 'absolute', top: '-2px', right: '0px', zIndex: 10, cursor: 'grab', padding: '4px 8px', background: '#F3F4F6', borderRadius: '8px', fontSize: '12px', color: '#9CA3AF', userSelect: 'none' }}
      >
        {WIDGET_META[id]?.icon} {WIDGET_META[id]?.label} ⣿
      </div>
      {children}
    </div>
  );
}

export function DashboardPage() {
  const { missions, candidates, applications, history, events, tasks } = useData();
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState('month');

  const ALL_KPIS = ['missions', 'candidates', 'screening', 'interview', 'hired', 'conversion'];
  const KPI_KEY = 'ats_dashboard_kpis';
  const [enabledKpis, setEnabledKpis] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KPI_KEY) || 'null') || ALL_KPIS; } catch { return ALL_KPIS; }
  });
  const [kpiModalOpen, setKpiModalOpen] = useState(false);

  const [widgetOrder, setWidgetOrder] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(WIDGET_ORDER_KEY) || 'null');
      if (!saved) return DEFAULT_ORDER;
      const missing = DEFAULT_ORDER.filter(id => !saved.includes(id));
      return missing.length > 0 ? [...saved, ...missing] : saved;
    } catch { return DEFAULT_ORDER; }
  });
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const handleDragStart = useCallback((id) => setDragging(id), []);
  const handleDragOver = useCallback((id) => setDragOver(id), []);
  const handleDrop = useCallback((targetId) => {
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return; }
    setWidgetOrder(prev => {
      const next = [...prev];
      const fromIdx = next.indexOf(dragging);
      const toIdx = next.indexOf(targetId);
      next.splice(fromIdx, 1);
      next.splice(toIdx, 0, dragging);
      localStorage.setItem(WIDGET_ORDER_KEY, JSON.stringify(next));
      return next;
    });
    setDragging(null);
    setDragOver(null);
  }, [dragging]);

  const toggleKpi = (id) => {
    setEnabledKpis(prev => {
      const next = prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id];
      localStorage.setItem(KPI_KEY, JSON.stringify(next));
      return next;
    });
  };

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
      const end = new Date(now); const start = new Date(now);
      if (period === 'week')    { end.setDate(end.getDate() - 7);    start.setDate(start.getDate() - 14); }
      else if (period === 'month')   { end.setMonth(end.getMonth() - 1);   start.setMonth(start.getMonth() - 2); }
      else if (period === 'quarter') { end.setMonth(end.getMonth() - 3);   start.setMonth(start.getMonth() - 6); }
      else if (period === 'year')    { end.setFullYear(end.getFullYear() - 1); start.setFullYear(start.getFullYear() - 2); }
      else return null;
      return { start, end };
    };
    const threshold = getThreshold(timePeriod);
    const prevRange = getPrevRange(timePeriod);
    const inPeriod = (dateStr, from, to) => { const d = new Date(dateStr || '2024-01-01'); return d >= from && (!to || d < to); };
    const curMissions     = missions.filter(m => inPeriod(m.dateAdded || m.createdDate, threshold));
    const curCandidates   = candidates.filter(c => inPeriod(c.dateAdded, threshold));
    const curApplications = applications.filter(a => inPeriod(a.dateApplied || a.appliedDate, threshold));
    const prevMissions     = prevRange ? missions.filter(m => inPeriod(m.dateAdded || m.createdDate, prevRange.start, prevRange.end)) : [];
    const prevCandidates   = prevRange ? candidates.filter(c => inPeriod(c.dateAdded, prevRange.start, prevRange.end)) : [];
    const prevApplications = prevRange ? applications.filter(a => inPeriod(a.dateApplied || a.appliedDate, prevRange.start, prevRange.end)) : [];
    const trend = (cur, prev) => { if (prev === 0) return cur > 0 ? '+100%' : '0%'; const d = ((cur - prev) / prev) * 100; return d > 0 ? `+${d.toFixed(0)}%` : `${d.toFixed(0)}%`; };
    const openMissions       = curMissions.filter(m => m.status === 'open').length;
    const activeCandidates   = curCandidates.filter(c => c.status === 'active').length;
    const screening          = curApplications.filter(a => a.status === 'screening').length;
    const interview          = curApplications.filter(a => a.status === 'interview_1' || a.status === 'interview_2').length;
    const hired              = curApplications.filter(a => a.status === 'hired').length;
    const rejected           = curApplications.filter(a => a.status === 'rejected').length;
    const total              = curApplications.length;
    const conversionStoI = screening > 0 ? ((interview / screening) * 100).toFixed(1) : 0;
    const conversionItoH = interview > 0 ? ((hired / interview) * 100).toFixed(1) : 0;
    const overallRate    = total > 0 ? ((hired / total) * 100).toFixed(1) : 0;
    // T-370 : calculait (aujourd'hui - dateApplied), qui grossit indéfiniment
    // pour un candidat embauché il y a des mois — utilise désormais `hiredAt`,
    // renseigné une seule fois au moment réel de la transition vers 'hired'
    // (DataContext.jsx → updateApplication), seule source pour cette métrique
    // dans toute l'app (voir aussi AnalyticsPage.jsx, même correctif).
    const hiredApps = curApplications.filter(a => a.status === 'hired' && a.hiredAt);
    const avgTimeToHire = (() => {
      if (hiredApps.length === 0) return 0;
      const totalDays = hiredApps.reduce((sum, a) => {
        const applied = new Date(a.dateApplied || a.hiredAt);
        const hired = new Date(a.hiredAt);
        return sum + Math.max(0, Math.round((hired - applied) / (1000 * 60 * 60 * 24)));
      }, 0);
      return Math.round(totalDays / hiredApps.length);
    })();
    const last30 = new Date(now); last30.setDate(last30.getDate() - 30);
    const recentApps = applications.filter(a => { const d = new Date(a.dateApplied || a.appliedDate || a.createdAt || '2020-01-01'); return d >= last30; });
    const topMissions = missions.map(m => ({ id: m.id, title: m.title, status: m.status, count: recentApps.filter(a => a.missionId === m.id).length, total: applications.filter(a => a.missionId === m.id).length })).sort((a, b) => b.count - a.count).slice(0, 5);
    const openM = missions.filter(m => m.status === 'open').length;
    const activeC = candidates.filter(c => c.status === 'active').length;
    const missionWithApps = missions.filter(m => applications.some(a => a.missionId === m.id)).length;
    const blockedRatio = openM > 0 ? (openM - missionWithApps) / openM : 0;
    const convScore = Number(overallRate);
    const activityScore = Math.min(recentApps.length * 10, 40);
    const pipelineScore = Math.min((activeC / Math.max(openM, 1)) * 20, 30);
    const blockedPenalty = blockedRatio * 30;
    const meteoScore = Math.round(Math.max(0, Math.min(100, convScore * 0.3 + activityScore + pipelineScore - blockedPenalty)));
    const meteo = meteoScore >= 65 ? { icon: '☀️', label: 'Excellent', color: '#10B981', bg: '#ECFDF5', desc: 'Pipeline actif et taux de conversion élevé' } : meteoScore >= 35 ? { icon: '⛅', label: 'Correct', color: '#F59E0B', bg: '#FFFBEB', desc: "Activité modérée, des axes d'amélioration existent" } : { icon: '🌧️', label: 'À surveiller', color: '#EF4444', bg: '#FEF2F2', desc: 'Peu d\'activité ou taux de conversion faible' };
    const funnelStages = [
      { label: 'Reçues',       count: applications.filter(a => a.status === 'received').length,    color: '#6B7280' },
      { label: 'Présélection', count: applications.filter(a => a.status === 'screening').length,   color: '#3B82F6' },
      { label: 'Entretiens',   count: applications.filter(a => a.status === 'interview_1' || a.status === 'interview_2').length, color: '#F59E0B' },
      { label: 'Offres',       count: applications.filter(a => a.status === 'offer' || a.status === 'final').length, color: '#8B5CF6' },
      { label: 'Recrutés',     count: applications.filter(a => a.status === 'hired').length,       color: '#10B981' },
    ];
    // Smart alerts
    const now2 = new Date();
    const alerts = [];
    const last7 = new Date(now2); last7.setDate(last7.getDate() - 7);
    const recentApps7 = applications.filter(a => new Date(a.dateApplied || a.appliedDate || a.createdAt || '2020-01-01') >= last7);
    if (recentApps7.length === 0 && applications.length > 0) alerts.push({ type: 'warning', msg: 'Aucune candidature reçue ces 7 derniers jours — vérifiez vos diffusions' });
    missions.filter(m => m.status === 'open').forEach(m => {
      const created = new Date(m.dateAdded || m.createdDate || '2020-01-01');
      const ageDays = Math.round((now2 - created) / 86400000);
      const hasApp = applications.some(a => a.missionId === m.id);
      if (ageDays >= 30 && !hasApp) alerts.push({ type: 'error', msg: `Mission "${m.title || m.name}" ouverte depuis ${ageDays}j sans aucune candidature` });
    });
    applications.filter(a => a.status === 'interview_1' || a.status === 'interview_2').forEach(a => {
      const d = new Date(a.dateApplied || a.appliedDate || a.updatedAt || '2020-01-01');
      const days = Math.round((now2 - d) / 86400000);
      if (days >= 14) {
        const cand = candidates.find(c => c.id === a.candidateId);
        alerts.push({ type: 'info', msg: `Candidat "${cand ? (cand.firstName || '') + ' ' + (cand.lastName || cand.name || '') : a.candidateId}" bloqué en entretien depuis ${days}j` });
      }
    });
    return { alerts, meteo: { score: meteoScore, ...meteo }, missions: { open: openMissions, trend: trend(openMissions, prevMissions.filter(m => m.status === 'open').length) }, candidates: { active: activeCandidates, trend: trend(activeCandidates, prevCandidates.filter(c => c.status === 'active').length) }, applications: { total, screening, interview, hired, rejected, screeningTrend: trend(screening, prevApplications.filter(a => a.status === 'screening').length), interviewTrend: trend(interview, prevApplications.filter(a => a.status === 'interview_1' || a.status === 'interview_2').length), hiredTrend: trend(hired, prevApplications.filter(a => a.status === 'hired').length) }, conversions: { screeningToInterview: conversionStoI, interviewToHired: conversionItoH, overallSuccessRate: overallRate }, performance: { avgTimeToHire }, topMissions, funnelStages };
  }, [missions, candidates, applications, timePeriod]);

  const card = { background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6' };
  const sectionTitle = { fontSize: '22px', fontWeight: '900', color: '#1F2937', marginBottom: '20px' };
  const periodBtn = (active) => ({ padding: '8px 16px', borderRadius: '8px', border: 'none', background: active ? '#667EEA' : 'white', color: active ? 'white' : '#6B7280', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: active ? '0 2px 8px rgba(102,126,234,0.35)' : '0 1px 3px rgba(0,0,0,0.08)' });
  const maxFunnel = Math.max(...stats.funnelStages.map(s => s.count), 1);

  const renderWidget = (id) => {
    const dnd = { id, dragOver, onDragStart: handleDragStart, onDragOver: handleDragOver, onDrop: handleDrop };
    switch (id) {
      case 'activity':
        return (
          <DraggableWidget key={id} {...dnd}>
            <h2 style={sectionTitle}>📈 Activité des 7 derniers jours</h2>
            <div style={card}><ActivityChart missions={missions} applications={applications} /></div>
          </DraggableWidget>
        );
      case 'funnel':
        return (
          <DraggableWidget key={id} {...dnd}>
            <h2 style={sectionTitle}>🔽 Funnel de recrutement</h2>
            <div style={card}>
              {stats.funnelStages.map((stage, i) => {
                const pct = Math.round((stage.count / maxFunnel) * 100);
                const prev = stats.funnelStages[i - 1];
                const passRate = prev && prev.count > 0 ? Math.round((stage.count / prev.count) * 100) : null;
                const dropRate = passRate !== null ? 100 - passRate : null;
                return (
                  <React.Fragment key={stage.label}>
                    {i > 0 && (
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', margin:'6px 0' }}>
                        <div style={{ flex:1, height:'1px', background:'#E5E7EB' }} />
                        <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'3px 10px', borderRadius:'20px', background: passRate >= 50 ? '#ECFDF5' : passRate >= 25 ? '#FFFBEB' : '#FEF2F2', border:`1px solid ${passRate >= 50 ? '#6EE7B7' : passRate >= 25 ? '#FCD34D' : '#FECACA'}` }}>
                          <span style={{ fontSize:'11px', color:'#9CA3AF' }}>↓</span>
                          <span style={{ fontSize:'12px', fontWeight:'800', color: passRate >= 50 ? '#10B981' : passRate >= 25 ? '#F59E0B' : '#EF4444' }}>{passRate ?? 0}% passés</span>
                          {dropRate !== null && dropRate > 0 && <span style={{ fontSize:'11px', color:'#9CA3AF' }}>· {dropRate}% perdus</span>}
                        </div>
                        <div style={{ flex:1, height:'1px', background:'#E5E7EB' }} />
                      </div>
                    )}
                    <div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:stage.color, flexShrink:0 }} />
                          <span style={{ fontSize:'14px', fontWeight:'700', color:'#374151' }}>{stage.label}</span>
                        </div>
                        <span style={{ fontSize:'16px', fontWeight:'900', color:stage.color }}>{stage.count}</span>
                      </div>
                      <div style={{ height:'10px', background:'#F3F4F6', borderRadius:'5px', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg, ${stage.color} 0%, ${stage.color}bb 100%)`, borderRadius:'5px', transition:'width 0.5s ease' }} />
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </DraggableWidget>
        );
      case 'performance':
        return (
          <DraggableWidget key={id} {...dnd}>
            <h2 style={sectionTitle}>📊 Performance & Conversion</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'20px' }}>
              <div style={card}>
                <div style={{ fontSize:'12px', color:'#6B7280', fontWeight:'700', textTransform:'uppercase', marginBottom:'8px' }}>📈 Présélection → Entretien</div>
                <div style={{ fontSize:'32px', fontWeight:'900', color:'#3B82F6', marginBottom:'8px' }}>{stats.conversions.screeningToInterview}%</div>
                <div style={{ height:'6px', background:'#E5E7EB', borderRadius:'3px', overflow:'hidden', marginBottom:'8px' }}><div style={{ width:`${stats.conversions.screeningToInterview}%`, height:'100%', background:'#3B82F6', borderRadius:'3px' }} /></div>
                <div style={{ fontSize:'11px', color:'#9CA3AF' }}>{stats.applications.interview} entretiens / {stats.applications.screening} présélections</div>
              </div>
              <div style={card}>
                <div style={{ fontSize:'12px', color:'#6B7280', fontWeight:'700', textTransform:'uppercase', marginBottom:'8px' }}>🎯 Entretien → Embauche</div>
                <div style={{ fontSize:'32px', fontWeight:'900', color:'#10B981', marginBottom:'8px' }}>{stats.conversions.interviewToHired}%</div>
                <div style={{ height:'6px', background:'#E5E7EB', borderRadius:'3px', overflow:'hidden', marginBottom:'8px' }}><div style={{ width:`${stats.conversions.interviewToHired}%`, height:'100%', background:'#10B981', borderRadius:'3px' }} /></div>
                <div style={{ fontSize:'11px', color:'#9CA3AF' }}>{stats.applications.hired} embauches / {stats.applications.interview} entretiens</div>
              </div>
              <div style={card}>
                <div style={{ fontSize:'12px', color:'#6B7280', fontWeight:'700', textTransform:'uppercase', marginBottom:'8px' }}>⏱️ Temps moyen de recrutement</div>
                <div style={{ fontSize:'32px', fontWeight:'900', color:'#F59E0B', marginBottom:'8px' }}>{stats.performance.avgTimeToHire > 0 ? `${stats.performance.avgTimeToHire}j` : '—'}</div>
                <div style={{ fontSize:'11px', color:'#9CA3AF' }}>Délai moyen depuis la candidature</div>
              </div>
              <div style={card}>
                <div style={{ fontSize:'12px', color:'#6B7280', fontWeight:'700', textTransform:'uppercase', marginBottom:'8px' }}>📉 Candidatures rejetées</div>
                <div style={{ fontSize:'32px', fontWeight:'900', color:'#EF4444', marginBottom:'8px' }}>{stats.applications.rejected}</div>
                <div style={{ fontSize:'11px', color:'#9CA3AF' }}>{stats.applications.total > 0 ? `${((stats.applications.rejected / stats.applications.total) * 100).toFixed(1)}% du total` : '—'}</div>
              </div>
            </div>
          </DraggableWidget>
        );
      case 'forecast': {
        const overallRate = Number(stats.conversions.overallSuccessRate) / 100;
        const screeningRate = Number(stats.conversions.screeningToInterview) / 100;
        const hireRate = Number(stats.conversions.interviewToHired) / 100;
        const currentScreening = stats.applications.screening;
        const currentInterview = stats.applications.interview;
        const avgNewPerMonth = stats.applications.total > 0 ? Math.round(stats.applications.total / 3) : 0;
        const forecast30  = Math.round(currentInterview * hireRate + currentScreening * screeningRate * hireRate);
        const forecast60  = Math.round(forecast30 + avgNewPerMonth * overallRate);
        const forecast90  = Math.round(forecast60 + avgNewPerMonth * overallRate);
        const avgTTH = stats.performance.avgTimeToHire || 30;
        return (
          <DraggableWidget key={id} {...dnd}>
            <h2 style={sectionTitle}>🔮 Prévisions de recrutement</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'20px' }}>
              {[{ label:'30 jours', value:forecast30, color:'#3B82F6', bg:'#EFF6FF' }, { label:'60 jours', value:forecast60, color:'#8B5CF6', bg:'#EDE9FE' }, { label:'90 jours', value:forecast90, color:'#10B981', bg:'#ECFDF5' }].map(f => (
                <div key={f.label} style={{ ...card, background:f.bg, border:`1px solid ${f.color}33`, textAlign:'center' }}>
                  <div style={{ fontSize:'13px', fontWeight:'700', color:f.color, textTransform:'uppercase', marginBottom:'8px' }}>Horizon {f.label}</div>
                  <div style={{ fontSize:'42px', fontWeight:'900', color:f.color, lineHeight:1, marginBottom:'6px' }}>{f.value}</div>
                  <div style={{ fontSize:'12px', color:'#6B7280' }}>embauche{f.value !== 1 ? 's' : ''} prévue{f.value !== 1 ? 's' : ''}</div>
                </div>
              ))}
              <div style={{ ...card, textAlign:'center' }}>
                <div style={{ fontSize:'13px', fontWeight:'700', color:'#F59E0B', textTransform:'uppercase', marginBottom:'8px' }}>Temps moyen</div>
                <div style={{ fontSize:'42px', fontWeight:'900', color:'#F59E0B', lineHeight:1, marginBottom:'6px' }}>{avgTTH}j</div>
                <div style={{ fontSize:'12px', color:'#6B7280' }}>par recrutement</div>
              </div>
            </div>
            <div style={{ marginTop:'12px', padding:'10px 16px', background:'#F9FAFB', borderRadius:'10px', fontSize:'12px', color:'#9CA3AF' }}>
              Basé sur un taux de conversion global de {stats.conversions.overallSuccessRate}% · {stats.applications.screening} candidats en présélection · {stats.applications.interview} en entretien
            </div>
          </DraggableWidget>
        );
      }
      case 'top-missions':
        return (
          <DraggableWidget key={id} {...dnd}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h2 style={{ ...sectionTitle, marginBottom:0 }}>🏆 Top 5 Missions les plus actives</h2>
              <span style={{ fontSize:'12px', fontWeight:'700', color:'#667EEA', background:'#EEF2FF', padding:'4px 10px', borderRadius:'20px' }}>30 derniers jours</span>
            </div>
            <div style={card}>
              {stats.topMissions.length > 0 ? stats.topMissions.map((mission, i) => {
                const medalBg = ['#FFD700', '#C0C0C0', '#CD7F32'];
                return (
                  <div key={mission.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom: i < stats.topMissions.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                      <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:medalBg[i] || '#E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'13px', color: i < 3 ? 'white' : '#6B7280', flexShrink:0 }}>{i + 1}</div>
                      <div>
                        <div style={{ fontWeight:'700', color:'#1F2937', fontSize:'14px' }}>{mission.title}</div>
                        <div style={{ fontSize:'12px', color:'#9CA3AF' }}>{mission.count} candidature{mission.count !== 1 ? 's' : ''} ce mois{mission.total !== mission.count && ` · ${mission.total} au total`}</div>
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:'18px', fontWeight:'900', color:'#667EEA' }}>{mission.count}</div>
                      <div style={{ fontSize:'10px', fontWeight:'700', color: mission.status === 'open' ? '#10B981' : '#9CA3AF', textTransform:'uppercase' }}>{mission.status === 'open' ? '● Active' : mission.status}</div>
                    </div>
                  </div>
                );
              }) : <div style={{ textAlign:'center', color:'#9CA3AF', padding:'24px' }}>Aucune candidature reçue dans les 30 derniers jours</div>}
            </div>
          </DraggableWidget>
        );
      case 'today':
        return (
          <DraggableWidget key={id} {...dnd}>
            <TodayWidget events={events} tasks={tasks} />
          </DraggableWidget>
        );
      case 'recent':
        return (
          <DraggableWidget key={id} {...dnd}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'32px' }}>
              <div>
                <h2 style={sectionTitle}>📋 Activité Récente</h2>
                <RecentActivity history={history} />
              </div>
              <div>
                <h2 style={sectionTitle}>🚀 Actions Rapides</h2>
                <div style={{ display:'grid', gap:'12px' }}>
                  {[
                    { label: '➕ Nouvelle Mission',   path: '/app/missions',   grad: '#667EEA,#764BA2' },
                    { label: '👥 Nouveau Candidat',   path: '/app/candidates', grad: '#10B981,#34D399' },
                    { label: '📊 Voir le Pipeline',   path: '/app/pipeline',   grad: '#3B82F6,#60A5FA' },
                    { label: '🔍 Parcourir CVthèque', path: '/app/cvtheque',   grad: '#F59E0B,#FBBF24' },
                  ].map(({ label, path, grad }) => (
                    <button key={path} onClick={() => navigate(path)} style={{ padding:'18px', background:`linear-gradient(135deg, ${grad})`, color:'white', border:'none', borderRadius:'14px', cursor:'pointer', fontWeight:'700', fontSize:'15px', textAlign:'center', transition:'all 0.2s', boxShadow:'0 4px 12px rgba(0,0,0,0.1)' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                    >{label}</button>
                  ))}
                </div>
              </div>
            </div>
          </DraggableWidget>
        );
      case 'velocity': {
        const now = new Date();
        const monthlyData = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          const month = d.getMonth();
          const year = d.getFullYear();
          const label = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
          // T-369 : les missions Supabase n'ont pas de champs camelCase
          // dateAdded/createdAt/updatedAt (useAPIMissions ne normalise pas,
          // contrairement à useAPIApplications) — seuls created_at/updated_at
          // (snake_case) existent réellement, donc `new Date(undefined)`
          // retombait toujours sur epoch 1970 et ce widget affichait 0 partout.
          const opened = missions.filter(m => {
            const md = new Date(m.created_at || m.dateAdded || m.date || 0);
            return md.getMonth() === month && md.getFullYear() === year;
          }).length;
          const closed = missions.filter(m => {
            if (m.status !== 'filled' && m.status !== 'closed') return false;
            const md = new Date(m.updated_at || m.created_at || m.date || 0);
            return md.getMonth() === month && md.getFullYear() === year;
          }).length;
          return { label, opened, closed };
        });
        const maxVal = Math.max(...monthlyData.map(d => Math.max(d.opened, d.closed)), 1);
        const totalOpened = monthlyData.reduce((s, d) => s + d.opened, 0);
        const totalClosed = monthlyData.reduce((s, d) => s + d.closed, 0);
        const balance = totalOpened - totalClosed;
        return (
          <DraggableWidget key={id} {...dnd}>
            <h2 style={sectionTitle}>⚡ Vélocité de recrutement</h2>
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#667EEA' }} />
                  <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Missions ouvertes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10B981' }} />
                  <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Missions clôturées</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px' }}>
                {monthlyData.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '3px', width: '100%' }}>
                      <div title={`${d.opened} ouvertes`} style={{ flex: 1, background: '#667EEA', borderRadius: '4px 4px 0 0', height: `${Math.round((d.opened / maxVal) * 100)}%`, minHeight: d.opened > 0 ? '4px' : '0', transition: 'height 0.5s ease' }} />
                      <div title={`${d.closed} clôturées`} style={{ flex: 1, background: '#10B981', borderRadius: '4px 4px 0 0', height: `${Math.round((d.closed / maxVal) * 100)}%`, minHeight: d.closed > 0 ? '4px' : '0', transition: 'height 0.5s ease' }} />
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: '#9CA3AF', textAlign: 'center', lineHeight: 1.2 }}>{d.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F3F4F6' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#667EEA' }}>{monthlyData[5].opened}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Ouvertes ce mois</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#10B981' }}>{monthlyData[5].closed}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Clôturées ce mois</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: balance >= 0 ? '#F59E0B' : '#EF4444' }}>{balance >= 0 ? '+' : ''}{balance}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Balance (6 mois)</div>
                </div>
              </div>
            </div>
          </DraggableWidget>
        );
      }
      case 'minifunnel': {
        const STAGES = [
          { key: 'received',    label: 'Nouveau',       color: '#6B7280', icon: '📥' },
          { key: 'screening',   label: 'Présélection',  color: '#3B82F6', icon: '🔍' },
          { key: 'interview_1', label: 'Entretien 1',   color: '#8B5CF6', icon: '💬' },
          { key: 'interview_2', label: 'Entretien 2',   color: '#7C3AED', icon: '💬' },
          { key: 'test',        label: 'Test',          color: '#F59E0B', icon: '📝' },
          { key: 'offer',       label: 'Offre',         color: '#EC4899', icon: '📄' },
          { key: 'hired',       label: 'Embauché',      color: '#10B981', icon: '🎉' },
        ];
        const counts = STAGES.map(s => ({ ...s, count: applications.filter(a => a.status === s.key && !a.archived).length }));
        const maxCount = Math.max(...counts.map(s => s.count), 1);
        const total = counts.reduce((sum, s) => sum + s.count, 0);
        return (
          <DraggableWidget key={id} {...dnd}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ ...sectionTitle, marginBottom: 0 }}>📊 Mini funnel pipeline</h2>
              <span style={{ padding: '4px 12px', background: '#EEF2FF', color: '#667EEA', borderRadius: '20px', fontSize: '13px', fontWeight: '800' }}>{total} candidatures</span>
            </div>
            <div style={card}>
              {counts.map(s => (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '100px', fontSize: '12px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span>{s.icon}</span><span>{s.label}</span>
                  </div>
                  <div style={{ flex: 1, height: '20px', background: '#F3F4F6', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round((s.count / maxCount) * 100)}%`, background: s.color, borderRadius: '10px', transition: 'width 0.5s ease', minWidth: s.count > 0 ? '4px' : '0' }} />
                  </div>
                  <div style={{ width: '32px', textAlign: 'right', fontSize: '14px', fontWeight: '900', color: s.color, flexShrink: 0 }}>{s.count}</div>
                </div>
              ))}
              <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => navigate('/app/pipeline')} style={{ padding: '8px 16px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                  Voir le Pipeline →
                </button>
              </div>
            </div>
          </DraggableWidget>
        );
      }
      case 'quickwins': {
        const sevenDaysAgo = Date.now() - 7 * 86400000;
        // T-393 : `c.score`/`c.matchScore` n'existent que sur `applications`,
        // jamais sur `candidates` — ce filtre ne matchait donc jamais rien
        // (toujours 0 >= 80 → faux), le widget affichait en permanence "tous
        // vos top candidats ont été contactés" sans avoir jamais rien vérifié.
        // Recalcul depuis le meilleur score parmi les candidatures actives
        // (hors hired/rejected/archived) de chaque candidat.
        const bestActiveScoreByCandidate = new Map();
        for (const a of applications) {
          if (['hired', 'rejected', 'archived'].includes(a.status)) continue;
          const s = Number(a.score || 0);
          const current = bestActiveScoreByCandidate.get(a.candidateId) || 0;
          if (s > current) bestActiveScoreByCandidate.set(a.candidateId, s);
        }
        const hotCandidates = candidates.filter(c => {
          const score = bestActiveScoreByCandidate.get(c.id) || 0;
          const lastActivity = new Date(c.updatedAt || c.lastActivity || c.lastContactDate || c.dateAdded || c.createdAt || 0).getTime();
          return score >= 80 && lastActivity < sevenDaysAgo;
        }).map(c => ({ ...c, score: bestActiveScoreByCandidate.get(c.id) || 0 })).slice(0, 8);
        return (
          <DraggableWidget key={id} {...dnd}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ ...sectionTitle, marginBottom: 0 }}>🔥 Candidats chauds non contactés</h2>
              {hotCandidates.length > 0 && (
                <span style={{ padding: '4px 12px', background: '#FEE2E2', color: '#DC2626', borderRadius: '20px', fontSize: '13px', fontWeight: '800' }}>
                  {hotCandidates.length} à contacter
                </span>
              )}
            </div>
            <div style={card}>
              {hotCandidates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>✅</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>Tous vos top candidats ont été contactés récemment !</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {hotCandidates.map(c => {
                    const score = Number(c.score || c.matchScore || 0);
                    const lastDate = new Date(c.updatedAt || c.lastActivity || c.lastContactDate || c.dateAdded || c.createdAt || 0);
                    const daysAgo = Math.round((Date.now() - lastDate.getTime()) / 86400000);
                    const name = c.firstName ? `${c.firstName} ${c.lastName || ''}`.trim() : (c.name || c.candidateName || 'Candidat');
                    return (
                      <div
                        key={c.id}
                        onClick={() => navigate('/app/pipeline')}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#FFF7ED', borderRadius: '10px', cursor: 'pointer', border: '1px solid #FED7AA', transition: 'opacity 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                      >
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                          🔥
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{c.currentPosition || c.title || c.jobTitle || '—'}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                          <span style={{ padding: '2px 8px', background: '#10B98118', color: '#10B981', borderRadius: '6px', fontSize: '12px', fontWeight: '800' }}>{score}%</span>
                          <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: '600' }}>J+{daysAgo}</span>
                        </div>
                      </div>
                    );
                  })}
                  <button onClick={() => navigate('/app/pipeline')} style={{ marginTop: '4px', padding: '10px', background: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                    Voir dans le Pipeline →
                  </button>
                </div>
              )}
            </div>
          </DraggableWidget>
        );
      }
      default: return null;
    }
  };

  return (
    <PageContainer title="Dashboard" subtitle="Vue d'ensemble de votre activité">
      {/* KPIs principaux */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
        <span style={{ fontWeight:'800', fontSize:'16px', color:'#1F2937' }}>Indicateurs clés</span>
        <button onClick={() => setKpiModalOpen(true)} style={{ padding:'7px 14px', background:'white', color:'#667EEA', border:'2px solid #667EEA', borderRadius:'8px', fontWeight:'700', fontSize:'12px', cursor:'pointer' }}>⚙️ Personnaliser</button>
      </div>
      <StatsGrid>
        {enabledKpis.includes('missions')   && <StatsCard icon="💼" label="Missions Actives"  value={stats.missions.open}                       trend={`${stats.missions.trend} vs période précédente`}              color="#667EEA" />}
        {enabledKpis.includes('candidates') && <StatsCard icon="👥" label="Candidats Actifs"  value={stats.candidates.active}                   trend={`${stats.candidates.trend} vs période précédente`}            color="#10B981" />}
        {enabledKpis.includes('screening')  && <StatsCard icon="🔍" label="En Présélection"   value={stats.applications.screening}              trend={`${stats.applications.screeningTrend} vs période précédente`} color="#3B82F6" />}
        {enabledKpis.includes('interview')  && <StatsCard icon="💬" label="Entretiens"        value={stats.applications.interview}              trend={`${stats.applications.interviewTrend} vs période précédente`} color="#F59E0B" />}
        {enabledKpis.includes('hired')      && <StatsCard icon="🎉" label="Recrutements"      value={stats.applications.hired}                  trend={`${stats.applications.hiredTrend} vs période précédente`}     color="#EC4899" />}
        {enabledKpis.includes('conversion') && <StatsCard icon="⚡" label="Taux de réussite"  value={`${stats.conversions.overallSuccessRate}%`} trend={`${stats.applications.total} candidatures totales`}          color="#8B5CF6" />}
      </StatsGrid>

      {/* Sélecteur de période */}
      <div style={{ display:'flex', gap:'10px', alignItems:'center', padding:'14px 20px', background:'#F9FAFB', borderRadius:'12px', marginBottom:'32px', flexWrap:'wrap' }}>
        <span style={{ fontWeight:'700', color:'#374151', fontSize:'13px' }}>📅 Période :</span>
        {[{ key:'week', label:'7 jours' }, { key:'month', label:'30 jours' }, { key:'quarter', label:'3 mois' }, { key:'year', label:'12 mois' }, { key:'all', label:'Tout' }].map(({ key, label }) => (
          <button key={key} style={periodBtn(timePeriod === key)} onClick={() => setTimePeriod(key)}>{label}</button>
        ))}
        <div style={{ marginLeft:'auto', fontSize:'12px', color:'#9CA3AF' }}>⣿ Glissez les sections pour les réorganiser</div>
      </div>


      {/* Alertes intelligentes */}
      {stats.alerts && stats.alerts.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'24px' }}>
          {stats.alerts.slice(0, 3).map((alert, i) => {
            const colors = { error: { bg:'#FEF2F2', border:'#FECACA', text:'#DC2626', icon:'🚨' }, warning: { bg:'#FFFBEB', border:'#FDE68A', text:'#D97706', icon:'⚠️' }, info: { bg:'#EFF6FF', border:'#BFDBFE', text:'#2563EB', icon:'ℹ️' } };
            const c = colors[alert.type] || colors.info;
            return (
              <div key={i} style={{ padding:'12px 16px', background:c.bg, borderRadius:'10px', border:`1px solid ${c.border}`, display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ fontSize:'16px' }}>{c.icon}</span>
                <span style={{ fontSize:'13px', fontWeight:'600', color:c.text, flex:1 }}>{alert.msg}</span>
              </div>
            );
          })}
        </div>
      )}
      {/* Météo recrutement */}
      <div style={{ display:'flex', alignItems:'center', gap:'16px', padding:'16px 22px', background:stats.meteo.bg, borderRadius:'14px', border:`1px solid ${stats.meteo.color}33`, marginBottom:'32px', flexWrap:'wrap' }}>
        <span style={{ fontSize:'36px', lineHeight:1 }}>{stats.meteo.icon}</span>
        <div style={{ flex:1, minWidth:160 }}>
          <div style={{ fontWeight:'800', fontSize:'15px', color:stats.meteo.color }}>Météo recrutement — {stats.meteo.label}</div>
          <div style={{ fontSize:'12px', color:'#6B7280', marginTop:'2px' }}>{stats.meteo.desc}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
          <div style={{ width:'140px', height:'8px', background:'#E5E7EB', borderRadius:'4px', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${stats.meteo.score}%`, background:stats.meteo.color, borderRadius:'4px', transition:'width 0.6s ease' }} />
          </div>
          <span style={{ fontSize:'14px', fontWeight:'900', color:stats.meteo.color, minWidth:'36px' }}>{stats.meteo.score}/100</span>
        </div>
      </div>

      {/* Modal personnalisation KPIs */}
      {kpiModalOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'white', borderRadius:'20px', padding:'28px', width:'340px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h3 style={{ margin:0, fontWeight:'800', color:'#1F2937' }}>⚙️ Personnaliser les KPIs</h3>
              <button onClick={() => setKpiModalOpen(false)} aria-label="Fermer la personnalisation des KPIs" style={{ background:'none', border:'none', fontSize:'18px', cursor:'pointer', color:'#6B7280' }}>✕</button>
            </div>
            {[{ id:'missions', label:'💼 Missions Actives' }, { id:'candidates', label:'👥 Candidats Actifs' }, { id:'screening', label:'🔍 En Présélection' }, { id:'interview', label:'💬 Entretiens' }, { id:'hired', label:'🎉 Recrutements' }, { id:'conversion', label:'⚡ Taux de réussite' }].map(kpi => (
              <label key={kpi.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom:'1px solid #F3F4F6', cursor:'pointer' }}>
                <input type="checkbox" checked={enabledKpis.includes(kpi.id)} onChange={() => toggleKpi(kpi.id)} style={{ width:'16px', height:'16px', accentColor:'#667EEA' }} />
                <span style={{ fontSize:'14px', fontWeight:'600', color:'#374151' }}>{kpi.label}</span>
              </label>
            ))}
            <button onClick={() => setKpiModalOpen(false)} style={{ width:'100%', padding:'12px', background:'#667EEA', color:'white', border:'none', borderRadius:'8px', fontWeight:'700', cursor:'pointer', marginTop:'16px' }}>✅ Enregistrer</button>
          </div>
        </div>
      )}

      {/* Widgets réorganisables */}
      <div onDragEnd={() => { setDragging(null); setDragOver(null); }}>
        {widgetOrder.map(id => renderWidget(id))}
      </div>
    </PageContainer>
  );
}

export default DashboardPage;






