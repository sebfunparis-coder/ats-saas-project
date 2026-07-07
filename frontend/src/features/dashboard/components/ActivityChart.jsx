import React, { useMemo, useState } from 'react';

const W = 600;
const H = 200;
const PAD = { top: 20, right: 20, bottom: 44, left: 36 };
const CHART_W = W - PAD.left - PAD.right;
const CHART_H = H - PAD.top - PAD.bottom;

function buildDaySlots(count = 7) {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (count - 1 - i));
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(start.getTime() + 86_400_000);
    const label = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
    return { start, end, label };
  });
}

function countPerDay(items, dateFn, slots) {
  return slots.map(({ start, end }) =>
    items.filter(item => {
      const d = new Date(dateFn(item));
      return !isNaN(d) && d >= start && d < end;
    }).length
  );
}

function toPoints(counts, maxVal) {
  const step = CHART_W / Math.max(counts.length - 1, 1);
  return counts.map((v, i) => ({
    x: PAD.left + i * step,
    y: PAD.top + CHART_H - (v / maxVal) * CHART_H,
    v,
  }));
}

function linePath(pts) {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
}

function areaPath(pts) {
  const bottom = `L${pts[pts.length - 1].x},${PAD.top + CHART_H} L${pts[0].x},${PAD.top + CHART_H}Z`;
  return `${linePath(pts)} ${bottom}`;
}

export function ActivityChart({ missions = [], applications = [] }) {
  const [tooltip, setTooltip] = useState(null);

  const { slots, appPts, missionPts, maxVal } = useMemo(() => {
    const slots = buildDaySlots(7);
    const appCounts = countPerDay(applications, a => a.dateApplied || a.appliedDate || a.createdAt || '', slots);
    // T-369 : les missions Supabase n'ont pas de createdAt/dateAdded camelCase
    // (seul created_at snake_case existe réellement) — la courbe "Missions
    // publiées" restait toujours à 0 sans ce champ.
    const missionCounts = countPerDay(missions, m => m.created_at || m.dateAdded || m.createdDate || '', slots);
    const maxVal = Math.max(...appCounts, ...missionCounts, 1);
    return {
      slots,
      appPts: toPoints(appCounts, maxVal),
      missionPts: toPoints(missionCounts, maxVal),
      maxVal,
    };
  }, [missions, applications]);

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        {/* Grid horizontales */}
        {gridLines.map(frac => {
          const y = PAD.top + (1 - frac) * CHART_H;
          return (
            <g key={frac}>
              <line x1={PAD.left} y1={y} x2={PAD.left + CHART_W} y2={y}
                stroke="#F3F4F6" strokeWidth="1" />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#9CA3AF">
                {Math.round(maxVal * frac)}
              </text>
            </g>
          );
        })}

        {/* Aires */}
        <path d={areaPath(appPts)} fill="rgba(102,126,234,0.08)" />
        <path d={areaPath(missionPts)} fill="rgba(16,185,129,0.08)" />

        {/* Lignes */}
        <path d={linePath(appPts)} fill="none" stroke="#667EEA" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />
        <path d={linePath(missionPts)} fill="none" stroke="#10B981" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Points + zones hover invisibles */}
        {appPts.map((p, i) => (
          <g key={`a${i}`}>
            <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#667EEA" strokeWidth="2.5" />
            <rect
              x={p.x - 20} y={PAD.top} width="40" height={CHART_H + 10}
              fill="transparent"
              onMouseEnter={() => setTooltip({ i, x: p.x, y: Math.min(p.y, missionPts[i].y) - 12 })}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: 'default' }}
            />
          </g>
        ))}
        {missionPts.map((p, i) => (
          <circle key={`m${i}`} cx={p.x} cy={p.y} r="4" fill="white" stroke="#10B981" strokeWidth="2.5" />
        ))}

        {/* Labels X */}
        {slots.map((s, i) => (
          <text
            key={i}
            x={PAD.left + i * (CHART_W / 6)}
            y={H - 6}
            textAnchor="middle"
            fontSize="11"
            fill="#9CA3AF"
          >
            {s.label}
          </text>
        ))}

        {/* Tooltip */}
        {tooltip !== null && (() => {
          const i = tooltip.i;
          const tx = Math.min(Math.max(tooltip.x, 60), W - 60);
          const ty = Math.max(tooltip.y - 36, PAD.top);
          return (
            <g>
              <line x1={tooltip.x} y1={PAD.top} x2={tooltip.x} y2={PAD.top + CHART_H}
                stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,2" />
              <rect x={tx - 58} y={ty} width="116" height="42" rx="6"
                fill="white" stroke="#E5E7EB" strokeWidth="1"
                style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.1))' }} />
              <text x={tx} y={ty + 14} textAnchor="middle" fontSize="11" fill="#667EEA" fontWeight="700">
                ● {appPts[i].v} candidature{appPts[i].v !== 1 ? 's' : ''}
              </text>
              <text x={tx} y={ty + 30} textAnchor="middle" fontSize="11" fill="#10B981" fontWeight="700">
                ● {missionPts[i].v} mission{missionPts[i].v !== 1 ? 's' : ''}
              </text>
            </g>
          );
        })()}
      </svg>

      {/* Légende */}
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '4px' }}>
        {[
          { color: '#667EEA', label: 'Candidatures' },
          { color: '#10B981', label: 'Missions publiées' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B7280' }}>
            <div style={{ width: '18px', height: '3px', background: color, borderRadius: '2px' }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivityChart;
