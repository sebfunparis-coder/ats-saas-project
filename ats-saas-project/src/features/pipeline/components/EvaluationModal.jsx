import React, { useState } from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Button from '@/shared/components/Button/Button';
import { useData } from '@/core/contexts/DataContext';

const CRITERIA_DEFAULT = [
  { id: 'technical',    name: 'Compétences techniques' },
  { id: 'communication', name: 'Communication' },
  { id: 'motivation',   name: 'Motivation' },
  { id: 'culture',      name: 'Fit culturel' },
  { id: 'experience',   name: 'Expérience' },
];

const STAR_LABELS = { 1: 'Insuffisant', 2: 'Passable', 3: 'Bien', 4: 'Très bien', 5: 'Excellent' };

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
            fontSize: '22px', lineHeight: 1,
            color: star <= (hovered || value) ? '#F59E0B' : '#E5E7EB',
            transition: 'color 0.1s, transform 0.1s',
            transform: star <= (hovered || value) ? 'scale(1.15)' : 'scale(1)',
          }}
          title={STAR_LABELS[star]}
        >
          ★
        </button>
      ))}
      {(hovered || value) > 0 && (
        <span style={{ fontSize: '12px', color: '#6B7280', marginLeft: '4px' }}>
          {STAR_LABELS[hovered || value]}
        </span>
      )}
    </div>
  );
}

/**
 * Modal d'évaluation structurée d'un candidat après entretien
 */
export function EvaluationModal({ application, isOpen, onClose, existingEvaluation }) {
  const { addEvaluation, updateEvaluation, evaluationCriteria } = useData();

  const criteria = evaluationCriteria || CRITERIA_DEFAULT;

  const initCriteria = () =>
    criteria.map((c) => {
      const existing = existingEvaluation?.criteria?.find((e) => e.id === c.id);
      return { ...c, score: existing?.score || 0, notes: existing?.notes || '' };
    });

  const [criteriaScores, setCriteriaScores] = useState(initCriteria);
  const [globalNotes, setGlobalNotes] = useState(existingEvaluation?.notes || '');
  const [recommendation, setRecommendation] = useState(existingEvaluation?.recommendation || 'pending');
  const [evaluatorName, setEvaluatorName] = useState(existingEvaluation?.evaluatorName || 'Marie Dubois');

  const scoredCount = criteriaScores.filter((c) => c.score > 0).length;
  const globalScore = scoredCount > 0
    ? Math.round((criteriaScores.reduce((sum, c) => sum + c.score, 0) / (criteriaScores.length * 5)) * 100)
    : 0;

  const scoreColor = globalScore >= 75 ? '#10B981' : globalScore >= 50 ? '#F59E0B' : '#EF4444';

  const updateCriteria = (id, field, val) => {
    setCriteriaScores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  const handleSubmit = () => {
    const evalData = {
      applicationId: application.id,
      candidateId: application.candidateId,
      candidateName: application.candidateName,
      missionTitle: application.missionTitle,
      stage: application.status,
      date: new Date().toISOString().split('T')[0],
      evaluatorName,
      criteria: criteriaScores,
      globalScore,
      notes: globalNotes,
      recommendation,
    };

    if (existingEvaluation) {
      updateEvaluation(existingEvaluation.id, evalData);
    } else {
      addEvaluation(evalData);
    }
    onClose();
  };

  const recommendationOptions = [
    { value: 'go',      label: '✅ Recommandé',     color: '#10B981', bg: '#ECFDF5' },
    { value: 'maybe',   label: '🤔 À revoir',        color: '#F59E0B', bg: '#FFFBEB' },
    { value: 'no_go',   label: '❌ Non retenu',      color: '#EF4444', bg: '#FEF2F2' },
    { value: 'pending', label: '⏳ En attente',      color: '#6B7280', bg: '#F9FAFB' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1F2937', marginBottom: '4px' }}>
            ⭐ Évaluation candidat
          </h2>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>
            {application?.candidateName} · {application?.missionTitle}
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        {/* Évaluateur */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Évaluateur
          </label>
          <input
            value={evaluatorName}
            onChange={(e) => setEvaluatorName(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB',
              borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Score global */}
        <div style={{
          marginBottom: '24px', padding: '20px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
          border: '2px solid #E5E7EB', textAlign: 'center',
        }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px' }}>
            Score global
          </div>
          <div style={{ fontSize: '48px', fontWeight: '900', color: scoreColor, lineHeight: 1 }}>
            {globalScore}%
          </div>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
            {scoredCount}/{criteria.length} critères évalués
          </div>
        </div>

        {/* Grille de critères */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
            Critères d'évaluation
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {criteriaScores.map((criterion) => (
              <div key={criterion.id} style={{
                padding: '16px', background: 'white', borderRadius: '12px',
                border: `1.5px solid ${criterion.score > 0 ? '#E0E7FF' : '#F3F4F6'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>{criterion.name}</span>
                  <StarRating
                    value={criterion.score}
                    onChange={(val) => updateCriteria(criterion.id, 'score', val)}
                  />
                </div>
                <input
                  placeholder="Notes (optionnel)..."
                  value={criterion.notes}
                  onChange={(e) => updateCriteria(criterion.id, 'notes', e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB',
                    borderRadius: '8px', fontSize: '13px', color: '#6B7280',
                    outline: 'none', boxSizing: 'border-box', background: '#F9FAFB',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Recommandation */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            Recommandation
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {recommendationOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRecommendation(opt.value)}
                style={{
                  padding: '10px 16px', borderRadius: '10px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '700', transition: 'all 0.15s',
                  background: recommendation === opt.value ? opt.bg : 'white',
                  color: recommendation === opt.value ? opt.color : '#6B7280',
                  border: `2px solid ${recommendation === opt.value ? opt.color : '#E5E7EB'}`,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes globales */}
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            Commentaire général
          </h3>
          <textarea
            value={globalNotes}
            onChange={(e) => setGlobalNotes(e.target.value)}
            placeholder="Synthèse de l'entretien, points forts, axes d'amélioration..."
            rows={4}
            style={{
              width: '100%', padding: '12px', border: '1.5px solid #E5E7EB',
              borderRadius: '10px', fontSize: '14px', color: '#374151',
              outline: 'none', resize: 'vertical', boxSizing: 'border-box',
              fontFamily: 'inherit', lineHeight: '1.5',
            }}
          />
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={scoredCount === 0}
          >
            {existingEvaluation ? '💾 Mettre à jour' : '⭐ Enregistrer l\'évaluation'}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default EvaluationModal;
