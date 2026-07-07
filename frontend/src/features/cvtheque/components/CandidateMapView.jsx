import React, { useMemo, useState } from 'react';
import { useIsMobile } from '@/core/hooks/useIsMobile';

// Rough SVG positions for major French regions (x, y as % of a 600x700 viewbox)
const REGIONS = [
  { key: 'idf',       label: 'Île-de-France',       cities: ['paris', 'versailles', 'boulogne'],          x: 300, y: 220 },
  { key: 'ara',       label: 'Auvergne-Rhône-Alpes', cities: ['lyon', 'grenoble', 'clermont'],             x: 380, y: 380 },
  { key: 'paca',      label: 'PACA',                 cities: ['marseille', 'nice', 'toulon', 'aix'],       x: 400, y: 490 },
  { key: 'occ',       label: 'Occitanie',            cities: ['toulouse', 'montpellier', 'nîmes'],         x: 290, y: 470 },
  { key: 'naq',       label: 'Nouvelle-Aquitaine',   cities: ['bordeaux', 'limoges', 'poitiers'],          x: 200, y: 380 },
  { key: 'pdl',       label: 'Pays de la Loire',     cities: ['nantes', 'le mans', 'angers'],              x: 165, y: 290 },
  { key: 'bre',       label: 'Bretagne',             cities: ['rennes', 'brest', 'lorient'],               x: 105, y: 240 },
  { key: 'nor',       label: 'Normandie',            cities: ['rouen', 'caen', 'le havre'],                x: 220, y: 165 },
  { key: 'hdf',       label: 'Hauts-de-France',      cities: ['lille', 'amiens', 'roubaix'],               x: 295, y: 115 },
  { key: 'ges',       label: 'Grand Est',            cities: ['strasbourg', 'reims', 'metz', 'nancy'],     x: 415, y: 175 },
  { key: 'bfc',       label: 'Bourgogne-FC',         cities: ['dijon', 'besançon'],                        x: 385, y: 285 },
  { key: 'cvl',       label: 'Centre-Val-de-Loire',  cities: ['orléans', 'tours'],                         x: 255, y: 280 },
  { key: 'com',       label: 'Corse',                cities: ['ajaccio', 'bastia'],                        x: 465, y: 545 },
];

function matchesRegion(candidate, region) {
  const loc = (candidate.location || '').toLowerCase();
  return region.cities.some(c => loc.includes(c));
}

export function CandidateMapView({ candidates }) {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const isMobile = useIsMobile();

  const regionCounts = useMemo(() => {
    const counts = {};
    candidates.forEach(c => {
      const region = REGIONS.find(r => matchesRegion(c, r));
      const key = region ? region.key : 'other';
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [candidates]);

  const maxCount = Math.max(1, ...Object.values(regionCounts));

  const filteredCandidates = selectedRegion
    ? candidates.filter(c => {
        const region = REGIONS.find(r => r.key === selectedRegion);
        return region ? matchesRegion(c, region) : false;
      })
    : candidates;

  const getColor = (count) => {
    if (!count) return '#F3F4F6';
    const intensity = count / maxCount;
    if (intensity > 0.7) return '#667EEA';
    if (intensity > 0.4) return '#93C5FD';
    return '#DBEAFE';
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px', alignItems: 'start' }}>
      {/* SVG Map */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #E5E7EB' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1F2937', marginBottom: '16px' }}>
          🗺️ Répartition géographique
        </h3>
        <svg viewBox="0 0 600 700" style={{ width: '100%', height: 'auto' }}>
          {/* Background France outline (simplified) */}
          <rect x="0" y="0" width="600" height="700" fill="#F0F9FF" rx="8" />
          <text x="300" y="650" textAnchor="middle" fontSize="11" fill="#9CA3AF">Cliquez sur une région pour filtrer</text>

          {REGIONS.map(region => {
            const count = regionCounts[region.key] || 0;
            const r = Math.max(18, Math.min(40, 18 + (count / maxCount) * 24));
            const isSelected = selectedRegion === region.key;
            return (
              <g
                key={region.key}
                onClick={() => setSelectedRegion(selectedRegion === region.key ? null : region.key)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={region.x} cy={region.y} r={r}
                  fill={isSelected ? '#667EEA' : getColor(count)}
                  stroke={isSelected ? '#4338CA' : '#E5E7EB'}
                  strokeWidth={isSelected ? 3 : 1.5}
                  opacity={0.9}
                />
                {count > 0 && (
                  <text
                    x={region.x} y={region.y + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="13" fontWeight="800"
                    fill={isSelected || count / maxCount > 0.4 ? 'white' : '#374151'}
                  >
                    {count}
                  </text>
                )}
                <text
                  x={region.x} y={region.y + r + 12}
                  textAnchor="middle" fontSize="9" fill="#6B7280"
                  style={{ pointerEvents: 'none' }}
                >
                  {region.label.split('-')[0]}
                </text>
              </g>
            );
          })}
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', justifyContent: 'center' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Faible</span>
          {['#F3F4F6', '#DBEAFE', '#93C5FD', '#667EEA'].map((c, i) => (
            <div key={i} style={{ width: '20px', height: '12px', borderRadius: '3px', background: c, border: '1px solid #E5E7EB' }} />
          ))}
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Fort</span>
        </div>
      </div>

      {/* Right panel */}
      <div>
        {selectedRegion ? (
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1F2937' }}>
                {REGIONS.find(r => r.key === selectedRegion)?.label} — {filteredCandidates.length} candidat(s)
              </h3>
              <button
                onClick={() => setSelectedRegion(null)}
                aria-label="Fermer le détail de la région"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredCandidates.slice(0, 8).map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#F9FAFB', borderRadius: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #667EEA, #764BA2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                    {c.avatar || '👤'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>{c.position} · {c.location}</div>
                  </div>
                </div>
              ))}
              {filteredCandidates.length > 8 && (
                <div style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', padding: '8px' }}>
                  +{filteredCandidates.length - 8} autres candidats dans cette région
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1F2937', marginBottom: '16px' }}>
              📊 Top régions
            </h3>
            {REGIONS
              .map(r => ({ ...r, count: regionCounts[r.key] || 0 }))
              .filter(r => r.count > 0)
              .sort((a, b) => b.count - a.count)
              .slice(0, 8)
              .map(r => (
                <div
                  key={r.key}
                  onClick={() => setSelectedRegion(r.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937' }}>{r.label}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: `${(r.count / maxCount) * 80}px`, height: '6px', background: '#667EEA', borderRadius: '3px', minWidth: '4px' }} />
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#667EEA', minWidth: '20px' }}>{r.count}</span>
                  </div>
                </div>
              ))}
            {Object.values(regionCounts).every(v => !v) && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF', fontSize: '13px' }}>
                Aucune localisation détectée
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CandidateMapView;
