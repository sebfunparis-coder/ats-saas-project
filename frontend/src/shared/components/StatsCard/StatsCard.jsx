import React from 'react';

/**
 * Carte de statistique compacte — format canonique unique utilisé par tous
 * les onglets de l'application (Dashboard, Clients, Missions, Candidats,
 * Pipeline, Agenda, Tâches, CVthèque) pour garantir un rendu identique.
 * Seules les infos affichées (icône, libellé, valeur, couleur) varient.
 *
 * @example
 * <StatsCard icon="📊" label="Total" value={42} color="#667EEA" />
 */
export function StatsCard({ icon, label, value, color = '#667EEA', trend = null }) {
  return (
    <div style={{
      height: '128px', padding: '16px', background: 'white', borderRadius: '14px',
      border: '2px solid #F3F4F6', textAlign: 'center',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      boxSizing: 'border-box', overflow: 'hidden',
    }}>
      <div style={{
        fontSize: '28px', fontWeight: '900', marginBottom: '2px', lineHeight: 1.1,
        background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', lineHeight: 1.3 }}>
        {icon} {label}
      </div>
      {trend && (
        <div style={{ fontSize: '11px', fontWeight: '700', marginTop: '4px', color: trend.startsWith('+') ? '#10B981' : trend.startsWith('-') ? '#EF4444' : '#6B7280' }}>
          {trend}
        </div>
      )}
    </div>
  );
}

/**
 * Grille de StatsCard — même conteneur partout (gap/marge identiques).
 * @example
 * <StatsGrid>
 *   <StatsCard icon="📊" label="Total" value={8} />
 *   <StatsCard icon="✅" label="Actifs" value={5} color="#10B981" />
 * </StatsGrid>
 */
export function StatsGrid({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
      {children}
    </div>
  );
}

export default StatsCard;
