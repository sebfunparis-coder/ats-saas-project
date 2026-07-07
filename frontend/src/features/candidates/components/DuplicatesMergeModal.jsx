import React, { useState } from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Button from '@/shared/components/Button/Button';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import { useConfirm } from '@/core/contexts/ConfirmContext';

export function DuplicatesMergeModal({ isOpen, onClose, duplicatePairs, onMerge }) {
  const isMobile = useIsMobile();
  const { confirm } = useConfirm();
  const [selectedPair, setSelectedPair] = useState(0);
  const [keepIndex, setKeepIndex] = useState(0); // 0 = garder le premier, 1 = garder le second

  if (!isOpen || duplicatePairs.length === 0) return null;

  const pair = duplicatePairs[selectedPair];
  if (!pair) return null;

  const [a, b] = pair;
  const kept = keepIndex === 0 ? a : b;
  const removed = keepIndex === 0 ? b : a;

  const handleMerge = async () => {
    if (await confirm(`Fusionner "${removed.name}" dans "${kept.name}" ? Le profil de "${removed.name}" sera supprimé.`, { title: 'Fusionner les doublons', confirmLabel: 'Fusionner' })) {
      onMerge(kept, removed);
      if (selectedPair >= duplicatePairs.length - 1) {
        setSelectedPair(Math.max(0, selectedPair - 1));
      }
    }
  };

  const reasonLabel = a.email && b.email && a.email.toLowerCase() === b.email.toLowerCase()
    ? `Même email : ${a.email}`
    : `Même téléphone : ${a.phone || a.phoneNumber}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <Modal.Header onClose={onClose}>
        🔄 Fusion de doublons
      </Modal.Header>

      <Modal.Body>
        {/* Selector paire */}
        {duplicatePairs.length > 1 && (
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>Doublon</span>
            <select
              value={selectedPair}
              onChange={e => { setSelectedPair(Number(e.target.value)); setKeepIndex(0); }}
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px' }}
            >
              {duplicatePairs.map((p, i) => (
                <option key={i} value={i}>{p[0].name} / {p[1].name}</option>
              ))}
            </select>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>({duplicatePairs.length} paires détectées)</span>
          </div>
        )}

        {/* Raison du doublon */}
        <div style={{ padding: '8px 12px', background: '#FEF3C7', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: '#92400E', fontWeight: '600' }}>
          ⚠️ {reasonLabel}
        </div>

        {/* Comparaison côte-à-côte */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {[a, b].map((cand, idx) => (
            <div
              key={cand.id}
              onClick={() => setKeepIndex(idx)}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: `2px solid ${keepIndex === idx ? '#667EEA' : '#E5E7EB'}`,
                background: keepIndex === idx ? '#EEF2FF' : 'white',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#667EEA', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', flexShrink: 0 }}>
                  {(cand.name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: '#1F2937' }}>{cand.name}</div>
                  {keepIndex === idx && <div style={{ fontSize: '11px', color: '#667EEA', fontWeight: '700' }}>✓ À conserver</div>}
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.7' }}>
                {cand.email && <div>📧 {cand.email}</div>}
                {(cand.phone || cand.phoneNumber) && <div>📞 {cand.phone || cand.phoneNumber}</div>}
                {cand.skills?.length > 0 && <div>🛠️ {(Array.isArray(cand.skills) ? cand.skills : cand.skills.split(',').map(s => s.trim())).slice(0, 3).join(', ')}</div>}
                {cand.dateAdded && <div>📅 Ajouté le {cand.dateAdded}</div>}
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: 0 }}>
          Le profil non conservé sera supprimé définitivement. Les notes du profil supprimé seront ajoutées au profil conservé.
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Annuler</Button>
        <Button variant="error" onClick={handleMerge}>
          🔄 Fusionner → Garder "{kept?.name}"
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DuplicatesMergeModal;
