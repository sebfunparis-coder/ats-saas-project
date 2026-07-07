import React, { useState, useMemo } from 'react';
import { useData } from '@/core/contexts/DataContext';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import { APPLICATION_STATUS_COLORS } from '@/config/constants';

const _getLocale = () => { const l = localStorage.getItem('ats_language') || 'fr'; return l.startsWith('en') ? 'en-GB' : 'fr-FR'; };

const COLORS = ['#667EEA', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

function BarChart({ data, colorKey = 'color', labelKey = 'label', valueKey = 'value', height = 160 }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height, padding: '0 0 8px' }}>
      {data.map((d, i) => {
        const pct = (d[valueKey] / max) * 100;
        const color = d[colorKey] || COLORS[i % COLORS.length];
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#374151' }}>{d[valueKey]}</span>
            <div style={{ width: '100%', background: color, borderRadius: '4px 4px 0 0', height: `${Math.max(pct, 2)}%`, transition: 'height 0.5s ease', minHeight: '2px' }} />
            <span style={{ fontSize: '10px', color: '#9CA3AF', textAlign: 'center', lineHeight: '1.2' }}>{d[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ data, size = 140 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cumulative = 0;
  const segments = data.map((d, i) => {
    const pct = d.value / total;
    const start = cumulative;
    cumulative += pct;
    return { ...d, start, pct, color: d.color || COLORS[i % COLORS.length] };
  });

  const r = 50, cx = 60, cy = 60;
  const toXY = (pct) => {
    const angle = pct * 2 * Math.PI - Math.PI / 2;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <svg width={size} height={size} viewBox="0 0 120 120">
        {segments.map((seg, i) => {
          if (seg.pct < 0.001) return null;
          const [x1, y1] = toXY(seg.start);
          const [x2, y2] = toXY(seg.start + seg.pct);
          const large = seg.pct > 0.5 ? 1 : 0;
          return (
            <path key={i}
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
              fill={seg.color} stroke="white" strokeWidth="2"
            />
          );
        })}
        <circle cx={cx} cy={cy} r={30} fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fontWeight="800" fill="#1F2937">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#6B7280">total</text>
      </svg>
      <div style={{ display: 'grid', gap: '6px', flex: 1 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: '#374151', flex: 1 }}>{seg.label}</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#1F2937' }}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, sub, color = '#667EEA' }) {
  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px', fontWeight: '600' }}>{label}</div>
          <div style={{ fontSize: '30px', fontWeight: '900', color: '#1F2937' }}>{value}</div>
          {sub && <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>{sub}</div>}
        </div>
        <span style={{ fontSize: '28px' }}>{icon}</span>
      </div>
    </div>
  );
}

const PIPELINE_STAGES = [
  { id: 'received', label: 'Reçue', color: APPLICATION_STATUS_COLORS.received },
  { id: 'screening', label: 'Présélection', color: APPLICATION_STATUS_COLORS.screening },
  { id: 'interview_1', label: 'Entretien 1', color: APPLICATION_STATUS_COLORS.interview_1 },
  { id: 'interview_2', label: 'Entretien 2', color: APPLICATION_STATUS_COLORS.interview_2 },
  { id: 'offer', label: 'Offre', color: APPLICATION_STATUS_COLORS.offer },
  { id: 'hired', label: 'Embauché', color: APPLICATION_STATUS_COLORS.hired },
];

export default function AnalyticsPage() {
  const { missions = [], candidates = [], applications = [], team = [] } = useData();
  const isMobile = useIsMobile();
  const [period, setPeriod] = useState('30d');
  const [cphSalary, setCphSalary] = useState('');
  const [cphDays, setCphDays] = useState('');
  const [cphBoard, setCphBoard] = useState('');
  const cphDailyRate = 350;
  const cphResult = useMemo(() => {
    const sal = parseFloat(cphSalary) || 0;
    const days = parseFloat(cphDays) || 0;
    const board = parseFloat(cphBoard) || 0;
    const total = days * cphDailyRate + board;
    const pct = sal > 0 ? Math.round((total / sal) * 100) : 0;
    return { total, pct };
  }, [cphSalary, cphDays, cphBoard]);

  const [benchmarkSector, setBenchmarkSector] = useState('tech');
  const BENCHMARKS = {
    tech:     { label: 'Tech / IT',       tth: 42, cph: 8500,  convRate: 12, offerRate: 78 },
    finance:  { label: 'Finance',         tth: 38, cph: 11000, convRate: 9,  offerRate: 82 },
    retail:   { label: 'Commerce / Retail', tth: 22, cph: 3200, convRate: 20, offerRate: 65 },
    health:   { label: 'Santé',           tth: 55, cph: 7800,  convRate: 8,  offerRate: 88 },
    industry: { label: 'Industrie',       tth: 35, cph: 6500,  convRate: 14, offerRate: 74 },
    startup:  { label: 'Startup',         tth: 30, cph: 5000,  convRate: 18, offerRate: 70 },
  };

  const abandonmentData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString(_getLocale(), { month: 'short', year: '2-digit' });
      const monthMissions = missions.filter(m => {
        const created = new Date(m.createdAt || m.datePosted || '2026-01-01');
        return created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth();
      });
      const closed = monthMissions.filter(m => ['filled', 'closed', 'cancelled'].includes(m.status));
      const noHire = closed.filter(m => m.status !== 'filled');
      const rate = closed.length > 0 ? Math.round((noHire.length / closed.length) * 100) : 0;
      months.push({ label, total: monthMissions.length, closed: closed.length, noHire: noHire.length, rate, color: rate > 40 ? '#EF4444' : rate > 20 ? '#F59E0B' : '#10B981' });
    }
    return months;
  }, [missions]);

  const periodMs = useMemo(() => {
    const map = { '7d': 7, '30d': 30, '90d': 90, 'all': 99999 };
    return (map[period] || 30) * 24 * 60 * 60 * 1000;
  }, [period]);

  const filteredApps = useMemo(() => {
    const cutoff = Date.now() - periodMs;
    return applications.filter(a => {
      const d = new Date(a.dateApplied || a.createdAt || '2026-01-01').getTime();
      return d >= cutoff;
    });
  }, [applications, periodMs]);

  const stats = useMemo(() => {
    const total = filteredApps.length;
    const hired = filteredApps.filter(a => a.status === 'hired').length;
    const offered = filteredApps.filter(a => ['offer', 'hired'].includes(a.status)).length;
    const offerAcceptRate = offered > 0 ? Math.round((hired / offered) * 100) : 0;
    const conversionRate = total > 0 ? Math.round((hired / total) * 100) : 0;

    const hiredApps = filteredApps.filter(a => a.status === 'hired' && a.dateApplied && a.hiredAt);
    const avgDays = hiredApps.length > 0
      ? Math.round(hiredApps.reduce((sum, a) => sum + (new Date(a.hiredAt) - new Date(a.dateApplied)) / (1000 * 60 * 60 * 24), 0) / hiredApps.length)
      : null;

    return { total, hired, conversionRate, offerAcceptRate, avgDays };
  }, [filteredApps]);

  const funnelData = useMemo(() => {
    return PIPELINE_STAGES.map(stage => ({
      ...stage,
      value: filteredApps.filter(a => a.status === stage.id).length,
    }));
  }, [filteredApps]);

  const sourcesData = useMemo(() => {
    const map = {};
    filteredApps.forEach(a => {
      const src = a.source || candidates.find(c => c.id === a.candidateId)?.source || 'Non renseigné';
      map[src] = (map[src] || 0) + 1;
    });
    return Object.entries(map).map(([label, value], i) => ({ label, value, color: COLORS[i % COLORS.length] }))
      .sort((a, b) => b.value - a.value).slice(0, 6);
  }, [filteredApps, candidates]);

  const recruiterPerf = useMemo(() => {
    return team.slice(0, 6).map((member, i) => {
      const memberApps = filteredApps.filter(a => a.assignedTo === member.id || a.assignedToName === member.name);
      const hires = memberApps.filter(a => a.status === 'hired').length;
      const rate = memberApps.length > 0 ? Math.round((hires / memberApps.length) * 100) : 0;
      return { label: member.name.split(' ')[0], value: memberApps.length, hired: hires, rate, color: COLORS[i % COLORS.length] };
    }).filter(r => r.value > 0).sort((a, b) => b.value - a.value);
  }, [filteredApps, team]);

  const missionStats = useMemo(() => {
    const openM = missions.filter(m => m.status === 'open' || m.status === 'active').length;
    const filledM = missions.filter(m => m.status === 'filled').length;
    const pausedM = missions.filter(m => m.status === 'paused').length;
    return [
      { label: 'Ouvertes', value: openM, color: '#10B981' },
      { label: 'Pourvues', value: filledM, color: '#8B5CF6' },
      { label: 'En pause', value: pausedM, color: '#F59E0B' },
    ];
  }, [missions]);

  const monthlyData = useMemo(() => {
    const months = {};
    applications.forEach(a => {
      const d = new Date(a.dateApplied || a.createdAt || '2026-01-01');
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { label: d.toLocaleDateString(_getLocale(), { month: 'short' }), value: 0 };
      months[key].value++;
    });
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([, v]) => v);
  }, [applications]);

  return (
    <div id="analytics-printable" style={{ padding: '32px', background: 'linear-gradient(180deg, #ffffff 0%, #fef5ff 50%, #f3e7ff 100%)', minHeight: '100vh' }}>
      {/* T-253 — Isole le contenu analytics lors de l'impression PDF (cache la
          sidebar/header AppLayout + les contrôles de filtre/export eux-mêmes,
          qui seraient sinon inclus dans le PDF généré par window.print()). */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #analytics-printable, #analytics-printable * { visibility: visible; }
          #analytics-printable { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: '900', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
              Analytiques
            </h1>
            <p style={{ fontSize: '16px', color: '#6B7280', margin: 0 }}>Tableau de bord recrutement — données en temps réel</p>
          </div>
          <div className="no-print" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '6px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              {[['7d','7 jours'], ['30d','30 jours'], ['90d','90 jours'], ['all','Tout']].map(([p, label]) => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontWeight: '700', fontSize: '13px',
                  background: period === p ? '#667EEA' : 'transparent',
                  color: period === p ? 'white' : '#6B7280',
                }}>{label}</button>
              ))}
            </div>
            <button
              onClick={() => window.print()}
              style={{ padding: '10px 20px', background: 'white', color: '#667EEA', border: '2px solid #667EEA', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#EEF2FF'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}>
              📄 Export PDF
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          <KpiCard icon="📋" label="Candidatures totales" value={stats.total} sub={`sur les ${period === 'all' ? 'toutes périodes' : period}`} color="#667EEA" />
          <KpiCard icon="🎉" label="Embauches" value={stats.hired} sub={`taux ${stats.conversionRate}%`} color="#10B981" />
          <KpiCard icon="✅" label="Taux d'acceptation offres" value={`${stats.offerAcceptRate}%`} sub="offres → embauches" color="#F59E0B" />
          <KpiCard icon="⏱️" label="Délai moyen recrutement" value={stats.avgDays != null ? `${stats.avgDays}j` : '—'} sub="candidature → embauche" color="#8B5CF6" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Pipeline funnel */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 20px', fontWeight: '800', fontSize: '16px', color: '#1F2937' }}>🔽 Funnel Pipeline</h3>
            <BarChart data={funnelData} colorKey="color" labelKey="label" valueKey="value" height={160} />
          </div>

          {/* Missions status */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 20px', fontWeight: '800', fontSize: '16px', color: '#1F2937' }}>💼 Statut missions</h3>
            <DonutChart data={missionStats} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Sources */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 20px', fontWeight: '800', fontSize: '16px', color: '#1F2937' }}>🌐 Sources de candidatures</h3>
            {sourcesData.length === 0 ? (
              <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '24px' }}>Aucune donnée</p>
            ) : (
              <DonutChart data={sourcesData} />
            )}
          </div>

          {/* Candidatures par mois */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 20px', fontWeight: '800', fontSize: '16px', color: '#1F2937' }}>📅 Candidatures / mois</h3>
            {monthlyData.length === 0 ? (
              <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '24px' }}>Aucune donnée</p>
            ) : (
              <BarChart data={monthlyData} colorKey="color" labelKey="label" valueKey="value" height={160} />
            )}
          </div>
        </div>

        {/* Performance recruteur */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 20px', fontWeight: '800', fontSize: '16px', color: '#1F2937' }}>👤 Performance par recruteur</h3>
          {recruiterPerf.length === 0 ? (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '24px' }}>Aucune candidature assignée à un recruteur sur cette période.</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 80px 80px 80px', gap: '12px', paddingBottom: '8px', borderBottom: '2px solid #F3F4F6' }}>
                {['Recruteur', 'Candidatures', 'Nb', 'Embauches', 'Taux'].map(h => (
                  <span key={h} style={{ fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase' }}>{h}</span>
                ))}
              </div>
              {recruiterPerf.map((r, i) => {
                const maxV = recruiterPerf[0].value;
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 80px 80px 80px', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#374151' }}>{r.label}</span>
                    <div style={{ height: '8px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(r.value / maxV) * 100}%`, background: r.color, borderRadius: '4px' }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>{r.value}</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#10B981' }}>{r.hired}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: r.rate >= 20 ? '#10B981' : r.rate >= 10 ? '#F59E0B' : '#EF4444' }}>{r.rate}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cohortes de candidatures */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginTop: '24px' }}>
          <h3 style={{ margin: '0 0 8px', fontWeight: '800', fontSize: '16px', color: '#1F2937' }}>📈 Cohortes de candidatures</h3>
          <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '20px' }}>Taux de progression par mois de réception</p>
          {(() => {
            const cohortMap = {};
            applications.forEach(a => {
              const d = new Date(a.dateApplied || a.createdAt || '2026-01-01');
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
              if (!cohortMap[key]) cohortMap[key] = { received: 0, screening: 0, interview: 0, offer: 0, hired: 0 };
              cohortMap[key].received++;
              if (['screening','interview_1','interview_2','offer','hired'].includes(a.status)) cohortMap[key].screening++;
              if (['interview_1','interview_2','offer','hired'].includes(a.status)) cohortMap[key].interview++;
              if (['offer','hired'].includes(a.status)) cohortMap[key].offer++;
              if (a.status === 'hired') cohortMap[key].hired++;
            });
            const rows = Object.entries(cohortMap).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
            if (rows.length === 0) return <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>Aucune donnée</p>;
            const columns = [
              { key: 'received', label: 'Reçues', color: '#6B7280' },
              { key: 'screening', label: 'Présélection', color: '#667EEA' },
              { key: 'interview', label: 'Entretien', color: '#8B5CF6' },
              { key: 'offer', label: 'Offre', color: '#F59E0B' },
              { key: 'hired', label: 'Embauché', color: '#10B981' },
            ];
            return (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                      <th style={{ textAlign: 'left', padding: '8px 12px', color: '#6B7280', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase' }}>Mois</th>
                      {columns.map(c => <th key={c.key} style={{ textAlign: 'center', padding: '8px 12px', color: c.color, fontWeight: '700', fontSize: '11px', textTransform: 'uppercase' }}>{c.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(([month, data]) => {
                      const base = data.received || 1;
                      return (
                        <tr key={month} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '10px 12px', fontWeight: '700', color: '#374151' }}>{new Date(month + '-01').toLocaleDateString(_getLocale(), { month: 'long', year: 'numeric' })}</td>
                          {columns.map(c => {
                            const pct = c.key === 'received' ? 100 : Math.round((data[c.key] / base) * 100);
                            return (
                              <td key={c.key} style={{ padding: '10px 12px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ fontWeight: '700', color: c.color }}>{data[c.key]}</span>
                                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{pct}%</span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>

        {/* Entonnoir de conversion detaille */}
        {(() => {
          // Compute for current period and previous period
          const prevApps = applications.filter(a => {
            const d = new Date(a.dateApplied || a.createdAt || '2026-01-01').getTime();
            return d >= Date.now() - 2 * periodMs && d < Date.now() - periodMs;
          });

          const STAGES = [
            { id: 'received', label: 'Recues' },
            { id: 'screening', label: 'Preselection' },
            { id: 'interview_1', label: 'Entretien 1' },
            { id: 'interview_2', label: 'Entretien 2' },
            { id: 'offer', label: 'Offre' },
            { id: 'hired', label: 'Embauche' },
          ];

          const countStageAndAbove = (apps, stageId) => {
            const idx = STAGES.findIndex(s => s.id === stageId);
            const ids = STAGES.slice(idx).map(s => s.id);
            return apps.filter(a => ids.includes(a.status)).length;
          };

          const rows = STAGES.map((stage, i) => {
            const curr = i === 0 ? filteredApps.length : countStageAndAbove(filteredApps, stage.id);
            const prev = i === 0 ? prevApps.length : countStageAndAbove(prevApps, stage.id);
            const prevFirst = i === 0 ? filteredApps.length : countStageAndAbove(filteredApps, STAGES[0].id);
            const rate = prevFirst > 0 ? Math.round((curr / prevFirst) * 100) : 0;
            const prevRate = prev > 0 && prevApps.length > 0 ? Math.round((prev / prevApps.length) * 100) : 0;
            const delta = rate - prevRate;
            return { ...stage, curr, prev, rate, delta };
          });

          return (
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginTop: '24px' }}>
              <h3 style={{ margin: '0 0 6px', fontWeight: '800', fontSize: '16px', color: '#1F2937' }}>Entonnoir de conversion detaille</h3>
              <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '20px' }}>Taux de passage avec comparaison periode precedente</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {rows.map((row, i) => (
                  <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '110px', fontSize: '12px', fontWeight: '700', color: '#374151', flexShrink: 0 }}>{row.label}</div>
                    <div style={{ flex: 1, height: '28px', background: '#F3F4F6', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ height: '100%', width: row.rate + '%', background: COLORS[i % COLORS.length], borderRadius: '6px', transition: 'width 0.5s ease', display: 'flex', alignItems: 'center', paddingLeft: '10px', minWidth: '2px' }}>
                        {row.rate > 10 && <span style={{ fontSize: '11px', color: 'white', fontWeight: '700' }}>{row.rate}%</span>}
                      </div>
                    </div>
                    <div style={{ width: '50px', textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#1F2937', flexShrink: 0 }}>{row.curr}</div>
                    <div style={{ width: '60px', textAlign: 'right', flexShrink: 0 }}>
                      {row.delta !== 0 && (
                        <span style={{ fontSize: '11px', fontWeight: '700', color: row.delta > 0 ? '#10B981' : '#EF4444' }}>
                          {row.delta > 0 ? '+' : ''}{row.delta}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '11px', color: '#9CA3AF' }}>
                <span>Nombre = candidatures sur la periode</span>
                <span>+/- % = vs periode precedente</span>
              </div>
            </div>
          );
        })()}

        {/* Heatmap d'activite */}
        {(() => {
          const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
          const HOURS = Array.from({ length: 24 }, (_, i) => i);
          // Build heatmap grid [day][hour]
          const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
          applications.forEach(a => {
            const d = new Date(a.dateApplied || a.createdAt || '2026-01-01');
            const day = (d.getDay() + 6) % 7; // Mon=0
            const hour = d.getHours();
            grid[day][hour]++;
          });
          const maxVal = Math.max(...grid.flat(), 1);
          const getColor = (v) => {
            const intensity = v / maxVal;
            if (intensity === 0) return '#F3F4F6';
            if (intensity < 0.25) return '#BFDBFE';
            if (intensity < 0.5) return '#60A5FA';
            if (intensity < 0.75) return '#3B82F6';
            return '#1D4ED8';
          };
          return (
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginTop: '24px' }}>
              <h3 style={{ margin: '0 0 6px', fontWeight: '800', fontSize: '16px', color: '#1F2937' }}>Heatmap d'activite</h3>
              <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '20px' }}>Intensite des candidatures par jour et heure</p>
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', gap: '4px', minWidth: 'max-content' }}>
                  {/* Day labels */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingTop: '20px' }}>
                    {DAYS.map(d => (
                      <div key={d} style={{ height: '18px', width: '32px', fontSize: '10px', fontWeight: '700', color: '#6B7280', display: 'flex', alignItems: 'center' }}>{d}</div>
                    ))}
                  </div>
                  {/* Grid */}
                  <div>
                    {/* Hour labels */}
                    <div style={{ display: 'flex', gap: '3px', marginBottom: '4px' }}>
                      {HOURS.map(h => (
                        <div key={h} style={{ width: '18px', textAlign: 'center', fontSize: '9px', color: '#9CA3AF' }}>{h % 3 === 0 ? h + 'h' : ''}</div>
                      ))}
                    </div>
                    {/* Cells */}
                    {grid.map((row, di) => (
                      <div key={di} style={{ display: 'flex', gap: '3px', marginBottom: '3px' }}>
                        {row.map((val, hi) => (
                          <div
                            key={hi}
                            title={`${DAYS[di]} ${hi}h — ${val} candidature(s)`}
                            style={{ width: '18px', height: '18px', borderRadius: '3px', background: getColor(val), cursor: 'default' }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '11px', color: '#6B7280' }}>
                  <span>Moins</span>
                  {['#F3F4F6','#BFDBFE','#60A5FA','#3B82F6','#1D4ED8'].map((c, i) => (
                    <div key={i} style={{ width: '14px', height: '14px', borderRadius: '2px', background: c }} />
                  ))}
                  <span>Plus</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ROI des sources */}
        {(() => {
          const SOURCE_COSTS = { LinkedIn: 800, Indeed: 400, Cooptation: 200, Jobboard: 500, 'Site web': 100, Email: 50, Autre: 300 };
          const sourceMap = {};
          applications.forEach(a => {
            const src = a.source || candidates.find(c => String(c.id) === String(a.candidateId))?.source || 'Autre';
            if (!sourceMap[src]) sourceMap[src] = { total: 0, hired: 0 };
            sourceMap[src].total++;
            if (a.status === 'hired') sourceMap[src].hired++;
          });
          const roiData = Object.entries(sourceMap).map(([src, d], i) => {
            const costPer = SOURCE_COSTS[src] || 300;
            const totalCost = costPer * d.total;
            const costPerHire = d.hired > 0 ? Math.round(totalCost / d.hired) : null;
            const convRate = d.total > 0 ? Math.round((d.hired / d.total) * 100) : 0;
            return { source: src, total: d.total, hired: d.hired, convRate, costPerHire, color: COLORS[i % COLORS.length] };
          }).sort((a, b) => b.total - a.total);

          const donutData = roiData.map(d => ({ label: d.source, value: d.total, color: d.color }));

          return (
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginTop: '24px' }}>
              <h3 style={{ margin: '0 0 20px', fontWeight: '800', fontSize: '16px', color: '#1F2937' }}>Analyse ROI des sources</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                <DonutChart data={donutData} />
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                        {['Source', 'Cand.', 'Embauches', 'Taux', 'Cout/embauche'].map(h => (
                          <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '800', color: '#374151', fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {roiData.map((d, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '8px 10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                              <span style={{ fontWeight: '700', color: '#1F2937' }}>{d.source}</span>
                            </div>
                          </td>
                          <td style={{ padding: '8px 10px', color: '#374151' }}>{d.total}</td>
                          <td style={{ padding: '8px 10px', color: '#374151' }}>{d.hired}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', background: d.convRate >= 20 ? '#D1FAE5' : '#FEF3C7', color: d.convRate >= 20 ? '#065F46' : '#92400E' }}>
                              {d.convRate}%
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', fontWeight: '700', color: d.costPerHire !== null ? (d.costPerHire < 1000 ? '#10B981' : '#EF4444') : '#9CA3AF' }}>
                            {d.costPerHire !== null ? d.costPerHire + ' EUR' : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Time-to-Hire Report */}
        {(() => {
          const tthData = missions
            .map(m => {
              const mId = m._id || m.id;
              // T-370 : le repli `a.updatedAt || Date.now()` reproduisait le même
              // biais que le Dashboard (temps jusqu'à aujourd'hui plutôt que
              // jusqu'à l'embauche) pour toute candidature sans `hiredAt` —
              // désormais exclue du calcul plutôt que d'afficher une moyenne fausse.
              const hiredApps = applications.filter(a => String(a.missionId) === String(mId) && a.status === 'hired' && a.dateApplied && a.hiredAt);
              if (hiredApps.length === 0) return null;
              const avg = Math.round(hiredApps.reduce((sum, a) => {
                const start = new Date(a.dateApplied);
                const end = new Date(a.hiredAt);
                return sum + (end - start) / 86400000;
              }, 0) / hiredApps.length);
              const recruiterApp = hiredApps[0];
              return { label: (m.title || 'Mission').substring(0, 20), value: avg, hires: hiredApps.length, recruiter: recruiterApp.assignedToName || 'N/A', color: avg <= 30 ? '#10B981' : avg <= 60 ? '#F59E0B' : '#EF4444' };
            })
            .filter(Boolean)
            .sort((a, b) => a.value - b.value);

          const exportCSV = () => {
            const header = 'Mission,Jours moyen,Embauches,Recruteur\n';
            const rows = tthData.map(d => '"' + d.label + '",' + d.value + ',' + d.hires + ',"' + d.recruiter + '"').join('\n');
            const blob = new Blob([header + rows], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'time-to-hire.csv'; a.click();
          };

          return (
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontWeight: '800', fontSize: '16px', color: '#1F2937' }}>Time-to-Hire par mission</h3>
                  <p style={{ color: '#6B7280', fontSize: '13px', margin: '4px 0 0' }}>Delai moyen entre reception candidature et embauche</p>
                </div>
                <button className="no-print" onClick={exportCSV} style={{ padding: '8px 16px', background: '#10B981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
                  CSV Export
                </button>
              </div>
              {tthData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                  <div style={{ fontSize: '13px' }}>Aucune embauche enregistree sur la periode</div>
                </div>
              ) : (
                <div>
                  <BarChart data={tthData} labelKey="label" valueKey="value" height={140} />
                  <div style={{ marginTop: '20px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                          {['Mission', 'Jours moyen', 'Embauches', 'Recruteur', 'Performance'].map(h => (
                            <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '800', color: '#374151', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tthData.map((d, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '10px 12px', fontWeight: '700', color: '#1F2937' }}>{d.label}</td>
                            <td style={{ padding: '10px 12px', fontWeight: '900', color: d.color, fontSize: '16px' }}>{d.value}j</td>
                            <td style={{ padding: '10px 12px', color: '#374151' }}>{d.hires}</td>
                            <td style={{ padding: '10px 12px', color: '#6B7280' }}>{d.recruiter}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: d.color + '20', color: d.color }}>
                                {d.value <= 30 ? 'Excellent' : d.value <= 60 ? 'Moyen' : 'Long'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Benchmarks sectoriels */}
        {(() => {
          const bm = BENCHMARKS[benchmarkSector];
          const myConvRate = stats.conversionRate;
          const myOfferRate = stats.offerAcceptRate;
          const myTTH = stats.avgDays || 0;
          const compare = (mine, ref, lowerIsBetter = false) => {
            if (!mine) return null;
            const diff = mine - ref;
            const pct = Math.round(Math.abs(diff / ref) * 100);
            const better = lowerIsBetter ? diff < 0 : diff > 0;
            return { diff, pct, better, text: `${better ? '+' : ''}${lowerIsBetter ? -diff : diff}${lowerIsBetter ? 'j' : '%'} vs référence` };
          };
          const rows = [
            { label: 'TTH moyen (jours)', mine: myTTH || '—', ref: bm.tth, cmp: myTTH ? compare(myTTH, bm.tth, true) : null, unit: 'j' },
            { label: 'Taux de conversion', mine: `${myConvRate}%`, ref: `${bm.convRate}%`, cmp: compare(myConvRate, bm.convRate), unit: '%' },
            { label: 'Taux acceptation offres', mine: `${myOfferRate}%`, ref: `${bm.offerRate}%`, cmp: compare(myOfferRate, bm.offerRate), unit: '%' },
            { label: 'Coût par embauche (€)', mine: '—', ref: bm.cph.toLocaleString(_getLocale()) + ' €', cmp: null, unit: '€' },
          ];
          return (
            <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#1F2937', marginBottom: '4px' }}>📊 Benchmarks sectoriels</h2>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>Comparez vos performances aux références du marché</p>
                </div>
                <select value={benchmarkSector} onChange={e => setBenchmarkSector(e.target.value)}
                  style={{ padding: '9px 14px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
                  {Object.entries(BENCHMARKS).map(([key, b]) => <option key={key} value={key}>{b.label}</option>)}
                </select>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                      {['Métrique', 'Vos données', `Référence ${bm.label}`, 'Écart'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '800', color: '#374151', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '12px 14px', fontWeight: '600', color: '#374151' }}>{row.label}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '900', color: '#1F2937', fontSize: '15px' }}>{row.mine}</td>
                        <td style={{ padding: '12px 14px', color: '#6B7280', fontWeight: '600' }}>{row.ref}</td>
                        <td style={{ padding: '12px 14px' }}>
                          {row.cmp ? (
                            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: row.cmp.better ? '#ECFDF5' : '#FEF2F2', color: row.cmp.better ? '#059669' : '#DC2626' }}>
                              {row.cmp.better ? '✅' : '⚠️'} {row.cmp.text}
                            </span>
                          ) : <span style={{ color: '#D1D5DB' }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* Taux d'abandon missions */}
        {(() => {
          const overallNoHire = abandonmentData.reduce((s, m) => s + m.noHire, 0);
          const overallClosed = abandonmentData.reduce((s, m) => s + m.closed, 0);
          const overallRate = overallClosed > 0 ? Math.round((overallNoHire / overallClosed) * 100) : 0;
          const isAlert = overallRate > 40;
          return (
            <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#1F2937', marginBottom: '4px' }}>📉 Taux d'abandon missions</h2>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>Missions fermées sans embauche sur 12 mois</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: isAlert ? '#DC2626' : '#10B981' }}>{overallRate}%</div>
                  {isAlert && <div style={{ fontSize: '12px', background: '#FEE2E2', color: '#DC2626', padding: '4px 10px', borderRadius: '20px', fontWeight: '700', marginTop: '4px' }}>⚠️ Taux élevé</div>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px', padding: '0 0 8px' }}>
                {abandonmentData.map((m, i) => {
                  const pct = m.rate;
                  return (
                    <div key={i} title={`${m.label} : ${m.rate}% (${m.noHire}/${m.closed})`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end', cursor: 'default' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: m.color }}>{pct > 0 ? `${pct}%` : ''}</span>
                      <div style={{ width: '100%', background: m.color, borderRadius: '4px 4px 0 0', height: `${Math.max(pct, 2)}%`, opacity: pct === 0 ? 0.2 : 1 }} />
                      <span style={{ fontSize: '9px', color: '#9CA3AF', textAlign: 'center', lineHeight: '1.2' }}>{m.label}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
                {[{ color: '#10B981', label: '≤ 20% (Excellent)' }, { color: '#F59E0B', label: '20-40% (Moyen)' }, { color: '#EF4444', label: '> 40% (Élevé)' }].map(({ color, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color }} />
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Calculateur coût par embauche */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', marginTop: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#1F2937', marginBottom: '6px' }}>💰 Calculateur coût par embauche</h2>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px' }}>Estimez le coût total de votre recrutement en fonction des ressources mobilisées.</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            {[
              { label: 'Salaire annuel du poste (€)', value: cphSalary, setter: setCphSalary, placeholder: 'ex: 55000' },
              { label: `Jours recruteur mobilisés (taux ${cphDailyRate}€/j)`, value: cphDays, setter: setCphDays, placeholder: 'ex: 10' },
              { label: 'Coût annonces jobboards (€)', value: cphBoard, setter: setCphBoard, placeholder: 'ex: 1500' },
            ].map(({ label, value, setter, placeholder }) => (
              <div key={label}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>{label}</div>
                <input
                  type="number" min="0" value={value} onChange={e => setter(e.target.value)}
                  placeholder={placeholder}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', color: '#1F2937', outline: 'none' }}
                />
              </div>
            ))}
          </div>
          {(cphSalary || cphDays || cphBoard) ? (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '20px', background: '#EEF2FF', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#667EEA', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase' }}>Coût total estimé</div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#4338CA' }}>{cphResult.total.toLocaleString(_getLocale())} €</div>
              </div>
              <div style={{ padding: '20px', background: cphResult.pct > 20 ? '#FEF2F2' : '#ECFDF5', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', color: cphResult.pct > 20 ? '#EF4444' : '#10B981' }}>% du salaire annuel</div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: cphResult.pct > 20 ? '#DC2626' : '#059669' }}>{cphResult.pct}%</div>
                <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>{cphResult.pct > 20 ? 'Élevé — optimisez le processus' : 'Dans les normes sectorielles'}</div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: '#9CA3AF', fontSize: '14px' }}>Renseignez les champs ci-dessus pour calculer le coût</div>
          )}
        </div>
      </div>
    </div>
  );
}
