import React from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Button from '@/shared/components/Button/Button';
import { APPLICATION_STATUS_COLORS } from '@/config/constants';

const PIPELINE_STAGES = {
  received:    { label: '📨 Reçue',        color: APPLICATION_STATUS_COLORS.received },
  screening:   { label: '🔍 Présélection', color: APPLICATION_STATUS_COLORS.screening },
  interview_1: { label: '👥 Entretien 1',  color: APPLICATION_STATUS_COLORS.interview_1 },
  interview_2: { label: '🎯 Entretien 2',  color: APPLICATION_STATUS_COLORS.interview_2 },
  offer:       { label: '📋 Offre',        color: APPLICATION_STATUS_COLORS.offer },
  final:       { label: '✅ Finaliste',    color: APPLICATION_STATUS_COLORS.final },
  hired:       { label: '🎉 Recruté',      color: APPLICATION_STATUS_COLORS.hired },
  rejected:    { label: '❌ Refusé',       color: APPLICATION_STATUS_COLORS.rejected },
};

const COLS = ['#667EEA', '#10B981', '#F59E0B'];

export function CandidateCompareModal({ isOpen, onClose, applications }) {
  if (!isOpen || !applications || applications.length < 2) return null;

  const rows = [
    { label: 'Mission',      fn: a => a.missionTitle || '—' },
    { label: 'Client',       fn: a => a.clientName || '—' },
    { label: 'Score IA',     fn: a => a.score > 0 ? `${a.score}%` : '—', isScore: true },
    { label: 'Statut',       fn: a => PIPELINE_STAGES[a.status]?.label || a.status },
    { label: 'Candidature',  fn: a => a.dateApplied ? new Date(a.dateApplied).toLocaleDateString('fr-FR') : '—' },
    { label: 'Note rapide',  fn: a => a.quickNote || '—' },
  ];

  const maxScore = Math.max(...applications.map(a => Number(a.score) || 0));

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>
        ⚖️ Comparaison de candidats
      </Modal.Header>

      <Modal.Body>
        <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '-16px', marginBottom: '16px' }}>
          {applications.length} candidats sélectionnés
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '130px' }} />
              {applications.map((_, i) => <col key={i} />)}
            </colgroup>
            <thead>
              <tr>
                <th style={{ padding: '12px', background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }} />
                {applications.map((app, i) => (
                  <th key={app.id} style={{
                    padding: '12px 16px', background: `${COLS[i]}10`,
                    borderBottom: `3px solid ${COLS[i]}`,
                    textAlign: 'center',
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: `linear-gradient(135deg, ${COLS[i]}, ${COLS[i]}99)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', margin: '0 auto 8px',
                    }}>
                      {app.candidateAvatar || '👤'}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#1F2937' }}>
                      {app.candidateName}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? 'white' : '#F9FAFB' }}>
                  <td style={{
                    padding: '12px 14px', fontSize: '11px', fontWeight: '800',
                    color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.3px',
                    borderRight: '1px solid #E5E7EB',
                  }}>
                    {row.label}
                  </td>
                  {applications.map((app, i) => {
                    const val = row.fn(app);
                    const isTop = row.isScore && Number(app.score) === maxScore && maxScore > 0;
                    return (
                      <td key={app.id} style={{
                        padding: '12px 16px', textAlign: 'center', fontSize: '13px',
                        fontWeight: row.isScore ? '900' : '600',
                        color: row.isScore
                          ? (Number(app.score) >= 75 ? '#10B981' : Number(app.score) >= 50 ? '#F59E0B' : '#EF4444')
                          : '#374151',
                        background: isTop ? '#ECFDF5' : undefined,
                      }}>
                        {isTop ? `⭐ ${val}` : val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Fermer</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CandidateCompareModal;
