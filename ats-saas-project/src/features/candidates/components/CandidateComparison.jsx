import { useState } from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Button from '@/shared/components/Button/Button';
import { useData } from '@/core/contexts/DataContext';
import { STATUS_LABELS } from '@/config/constants';

const COMPARE_FIELDS = [
  { key: 'position',     label: '💼 Poste visé' },
  { key: 'experience',   label: '📅 Expérience',  format: (v) => `${v} ans` },
  { key: 'location',     label: '📍 Localisation' },
  { key: 'salary',       label: '💰 Prétentions' },
  { key: 'availability', label: '🗓️ Disponibilité' },
  { key: 'status',       label: '🔵 Statut',      format: (v) => STATUS_LABELS.CANDIDATE_STATUS?.[v] || v },
  { key: 'source',       label: '📢 Source' },
];

function ScoreBar({ value, max = 100, color = '#667EEA' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, background: '#F3F4F6', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '99px', background: color,
          width: `${Math.min((value / max) * 100, 100)}%`,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <span style={{ fontSize: '13px', fontWeight: '800', color, minWidth: '34px', textAlign: 'right' }}>
        {value}%
      </span>
    </div>
  );
}

/**
 * Modal de comparaison côte-à-côte de 2-3 candidats
 */
export function CandidateComparison({ isOpen, onClose, initialCandidates = [] }) {
  const { candidates, evaluations, applications } = useData();
  const [selected, setSelected] = useState(
    initialCandidates.slice(0, 3).map((c) => c.id)
  );
  const [searchInput, setSearchInput] = useState('');

  const selectedCandidates = selected.map((id) => candidates.find((c) => c.id === id)).filter(Boolean);

  const getEvalScore = (candidateId) => {
    const evals = evaluations.filter((e) => e.candidateId === candidateId);
    if (evals.length === 0) return null;
    const avg = evals.reduce((sum, e) => sum + e.globalScore, 0) / evals.length;
    return Math.round(avg);
  };

  const getAIScore = (candidateId) => {
    const apps = applications.filter((a) => a.candidateId === candidateId);
    if (apps.length === 0) return null;
    const scores = apps.filter((a) => a.score > 0).map((a) => a.score);
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  };

  const searchResults = searchInput.trim()
    ? candidates.filter(
        (c) =>
          !selected.includes(c.id) &&
          (c.name.toLowerCase().includes(searchInput.toLowerCase()) ||
           c.position?.toLowerCase().includes(searchInput.toLowerCase()))
      ).slice(0, 5)
    : [];

  const addCandidate = (id) => {
    if (selected.length < 3 && !selected.includes(id)) {
      setSelected([...selected, id]);
      setSearchInput('');
    }
  };

  const removeCandidate = (id) => setSelected(selected.filter((s) => s !== id));

  const getBestValue = (key) => {
    if (key === 'experience') {
      return Math.max(...selectedCandidates.map((c) => Number(c[key]) || 0));
    }
    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1F2937', marginBottom: '4px' }}>
            ⚖️ Comparer des candidats
          </h2>
          <div style={{ fontSize: '13px', color: '#6B7280' }}>Comparez jusqu'à 3 candidats côte-à-côte</div>
        </div>
      </Modal.Header>

      <Modal.Body>
        {/* Sélecteur de candidats */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {selectedCandidates.map((c) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 14px', background: '#EEF2FF', borderRadius: '10px',
                border: '1.5px solid #667EEA',
              }}>
                <span style={{ fontSize: '20px' }}>{c.avatar || '👤'}</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#4338CA' }}>{c.name}</span>
                <button
                  onClick={() => removeCandidate(c.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '14px', padding: '0' }}
                >
                  ✕
                </button>
              </div>
            ))}
            {selected.length < 3 && (
              <div style={{ flex: 1, minWidth: '200px' }}>
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="➕ Rechercher un candidat à ajouter..."
                  style={{
                    width: '100%', padding: '10px 14px', border: '1.5px dashed #D1D5DB',
                    borderRadius: '10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            )}
          </div>

          {/* Résultats de recherche — inline, pas de absolute pour éviter le clipping modal */}
          {searchResults.length > 0 && (
            <div style={{
              border: '1.5px solid #E5E7EB', borderRadius: '12px',
              overflow: 'hidden', marginTop: '4px',
            }}>
              {searchResults.map((c) => (
                <div
                  key={c.id}
                  onClick={() => addCandidate(c.id)}
                  style={{
                    padding: '10px 16px', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: '12px', fontSize: '13px',
                    borderBottom: '1px solid #F3F4F6', background: 'white',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#EEF2FF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                >
                  <span style={{ fontSize: '20px' }}>{c.avatar || '👤'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', color: '#1F2937' }}>{c.name}</div>
                    <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{c.position}</div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#667EEA', fontWeight: '600' }}>+ Ajouter</span>
                </div>
              ))}
            </div>
          )}

          {/* Message si recherche sans résultats */}
          {searchInput.trim() && searchResults.length === 0 && selected.length < 3 && (
            <div style={{ fontSize: '13px', color: '#9CA3AF', padding: '8px 4px' }}>
              Aucun candidat trouvé pour « {searchInput} »
            </div>
          )}
        </div>

        {selectedCandidates.length < 2 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF', fontSize: '14px' }}>
            Sélectionnez au moins 2 candidats pour comparer
          </div>
        ) : (
          <>
            {/* Scores */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `120px ${selectedCandidates.map(() => '1fr').join(' ')}`,
              gap: '12px', marginBottom: '24px',
            }}>
              <div />
              {selectedCandidates.map((c) => (
                <div key={c.id} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '4px' }}>{c.avatar || '👤'}</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#1F2937' }}>{c.name}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>{c.position}</div>
                </div>
              ))}

              {/* Score IA moyen */}
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', display: 'flex', alignItems: 'center' }}>
                🤖 Score IA
              </div>
              {selectedCandidates.map((c) => {
                const score = getAIScore(c.id);
                return (
                  <div key={c.id}>
                    {score !== null
                      ? <ScoreBar value={score} color={score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'} />
                      : <span style={{ fontSize: '12px', color: '#D1D5DB' }}>—</span>
                    }
                  </div>
                );
              })}

              {/* Score évaluation */}
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', display: 'flex', alignItems: 'center' }}>
                ⭐ Évaluation
              </div>
              {selectedCandidates.map((c) => {
                const score = getEvalScore(c.id);
                return (
                  <div key={c.id}>
                    {score !== null
                      ? <ScoreBar value={score} color="#667EEA" />
                      : <span style={{ fontSize: '12px', color: '#D1D5DB' }}>Non évalué</span>
                    }
                  </div>
                );
              })}
            </div>

            {/* Compétences communes */}
            <div style={{ marginBottom: '24px', padding: '16px', background: '#F9FAFB', borderRadius: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', marginBottom: '12px' }}>
                🎯 Compétences
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `120px ${selectedCandidates.map(() => '1fr').join(' ')}`,
                gap: '8px',
              }}>
                {/* Compétences de chaque candidat */}
                {selectedCandidates.map((c) => (
                  <div key={c.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(c.skills || []).slice(0, 6).map((skill) => {
                      const isShared = selectedCandidates
                        .filter((other) => other.id !== c.id)
                        .some((other) => (other.skills || []).some((s) => s.toLowerCase() === skill.toLowerCase()));
                      return (
                        <span key={skill} style={{
                          padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                          background: isShared ? '#ECFDF5' : '#EFF6FF',
                          color: isShared ? '#059669' : '#3B82F6',
                          border: isShared ? '1px solid #A7F3D0' : '1px solid #BFDBFE',
                        }}>
                          {isShared ? '✓ ' : ''}{skill}
                        </span>
                      );
                    })}
                    {(c.skills || []).length === 0 && <span style={{ fontSize: '12px', color: '#D1D5DB' }}>—</span>}
                  </div>
                ))}
                <div /> {/* spacer for grid alignment */}
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '8px' }}>
                <span style={{ color: '#059669', fontWeight: '700' }}>✓ vert</span> = compétence partagée
              </div>
            </div>

            {/* Tableau de critères */}
            <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1.5px solid #E5E7EB' }}>
              {COMPARE_FIELDS.map((field, idx) => {
                const bestVal = getBestValue(field.key);
                return (
                  <div
                    key={field.key}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `160px ${selectedCandidates.map(() => '1fr').join(' ')}`,
                      gap: '0',
                      background: idx % 2 === 0 ? 'white' : '#F9FAFB',
                    }}
                  >
                    <div style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: '#6B7280', borderRight: '1px solid #E5E7EB' }}>
                      {field.label}
                    </div>
                    {selectedCandidates.map((c) => {
                      const raw = c[field.key];
                      const display = field.format ? field.format(raw) : raw;
                      const isBest = bestVal !== null && Number(raw) === bestVal;
                      return (
                        <div
                          key={c.id}
                          style={{
                            padding: '12px 16px', fontSize: '13px', fontWeight: isBest ? '800' : '600',
                            color: isBest ? '#059669' : '#374151',
                            borderRight: '1px solid #E5E7EB',
                            background: isBest ? '#ECFDF5' : 'transparent',
                          }}
                        >
                          {isBest && '🏆 '}{display || <span style={{ color: '#D1D5DB' }}>—</span>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="secondary" onClick={onClose}>Fermer</Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default CandidateComparison;
