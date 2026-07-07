import React, { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import PageContainer from '@/shared/components/Layout/PageContainer';
import { useCandidates } from '@/core/hooks/useCandidates';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import { useConfirm } from '@/core/contexts/ConfirmContext';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import { usePlanAccess } from '@/core/hooks/usePlanAccess';

const RGPD_KEY = 'ats_rgpd_consents';

const BASE_LEGALES = [
  { value: 'consentement', label: 'Consentement explicite' },
  { value: 'interet_legitime', label: 'Interet legitime' },
  { value: 'contrat', label: 'Execution de contrat' },
];

export default function RGPDPage() {
  const { candidates, removeCandidate } = useCandidates();
  const { showNotification } = useNotifications();
  const { confirm } = useConfirm();
  const isMobile = useIsMobile();
  const { canSeeAdmin } = usePlanAccess();
  const [consents, setConsents] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RGPD_KEY) || '{}'); } catch { return {}; }
  });
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');

  const saveConsent = (candidateId, base) => {
    const updated = { ...consents, [candidateId]: { base, date: new Date().toISOString(), renewalAt: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString() } };
    setConsents(updated);
    localStorage.setItem(RGPD_KEY, JSON.stringify(updated));
  };

  const handleDelete = async (candidate) => {
    if (!await confirm(`Supprimer définitivement ${candidate.name} et toutes ses données ?`, { title: 'Droit à l\'oubli', confirmLabel: 'Supprimer définitivement' })) return;
    setDeletingId(candidate.id);
    try {
      await removeCandidate(candidate.id);
      const updated = { ...consents };
      delete updated[candidate.id];
      setConsents(updated);
      localStorage.setItem(RGPD_KEY, JSON.stringify(updated));
      showNotification(candidate.name + ' supprime definitivement', 'success');
    } catch {
      showNotification('Erreur lors de la suppression', 'error');
    }
    setDeletingId(null);
  };

  const exportRGPD = () => {
    const rows = candidates.map(c => {
      const consent = consents[c.id];
      return [c.name, c.email, c.dateAdded || '', consent?.base || 'non defini', consent?.date ? new Date(consent.date).toLocaleDateString('fr-FR') : '', consent?.renewalAt ? new Date(consent.renewalAt).toLocaleDateString('fr-FR') : ''].join(',');
    });
    const blob = new Blob([['Nom,Email,Date ajout,Base legale,Date consentement,Renouvellement\n', ...rows.map(r => r + '\n')].join('')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'rapport-rgpd.csv'; a.click();
  };

  const now = Date.now();
  const TWO_YEARS = 2 * 365 * 24 * 60 * 60 * 1000;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return candidates.filter(c => !q || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
  }, [candidates, search]);

  const stats = useMemo(() => {
    const withConsent = candidates.filter(c => consents[c.id]).length;
    const renewalNeeded = candidates.filter(c => {
      const dateAdded = new Date(c.dateAdded || '2024-01-01').getTime();
      return now - dateAdded > TWO_YEARS;
    }).length;
    return { total: candidates.length, withConsent, renewalNeeded };
  }, [candidates, consents, now]);

  const box = { background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '24px' };

  // T-326 : cette page permet l'export CSV et la suppression DÉFINITIVE de
  // candidats — elle n'avait aucune vérification de rôle, un Équipier pouvait
  // supprimer n'importe quel candidat en tapant directement /app/rgpd.
  if (!canSeeAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <PageContainer title="Rapport RGPD" subtitle="Gestion des consentements et droits des candidats">
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Candidats total', value: stats.total, color: '#667EEA' },
          { label: 'Avec consentement', value: stats.withConsent, color: '#10B981' },
          { label: 'Renouvellement requis', value: stats.renewalNeeded, color: '#EF4444' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...box, marginBottom: 0, borderLeft: '4px solid ' + color }}>
            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '700', marginBottom: '6px' }}>{label}</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#1F2937' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Rechercher un candidat..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '10px 16px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit' }}
        />
        <button onClick={exportRGPD} style={{ padding: '10px 20px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
          Export CSV RGPD
        </button>
      </div>

      {/* Table */}
      <div style={box}>
        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
              {['Candidat', 'Email', 'Ajoute le', 'Base legale', 'Consentement', 'Renouvellement', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '800', color: '#374151', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const consent = consents[c.id] || {};
              const addedMs = new Date(c.dateAdded || '2024-01-01').getTime();
              const renewalNeeded = now - addedMs > TWO_YEARS;
              const renewalSoon = consent.renewalAt && new Date(consent.renewalAt).getTime() - now < 30 * 24 * 60 * 60 * 1000;

              return (
                <tr key={c.id} style={{ borderBottom: '1px solid #F3F4F6', background: renewalNeeded ? '#FEF2F2' : 'white' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '700', color: '#1F2937' }}>{c.name}</td>
                  <td style={{ padding: '10px 12px', color: '#6B7280' }}>{c.email}</td>
                  <td style={{ padding: '10px 12px', color: '#6B7280' }}>{c.dateAdded ? new Date(c.dateAdded).toLocaleDateString('fr-FR') : '—'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <select
                      value={consent.base || ''}
                      onChange={e => saveConsent(c.id, e.target.value)}
                      style={{ padding: '5px 8px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '12px', fontFamily: 'inherit', background: consent.base ? '#F0FDF4' : 'white' }}
                    >
                      <option value="">Non defini</option>
                      {BASE_LEGALES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#6B7280', fontSize: '12px' }}>
                    {consent.date ? new Date(consent.date).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {renewalNeeded ? (
                      <span style={{ padding: '3px 8px', background: '#FEE2E2', color: '#EF4444', borderRadius: '10px', fontSize: '11px', fontWeight: '700' }}>Requis</span>
                    ) : renewalSoon ? (
                      <span style={{ padding: '3px 8px', background: '#FEF3C7', color: '#D97706', borderRadius: '10px', fontSize: '11px', fontWeight: '700' }}>Bientot</span>
                    ) : (
                      <span style={{ padding: '3px 8px', background: '#D1FAE5', color: '#065F46', borderRadius: '10px', fontSize: '11px', fontWeight: '700' }}>OK</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <button
                      onClick={() => handleDelete(c)}
                      disabled={deletingId === c.id}
                      style={{ padding: '5px 12px', background: '#FEE2E2', color: '#EF4444', border: '1px solid #FCA5A5', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}
                    >
                      {deletingId === c.id ? '...' : 'Supprimer'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>Aucun candidat trouve</div>
        )}
      </div>
    </PageContainer>
  );
}
