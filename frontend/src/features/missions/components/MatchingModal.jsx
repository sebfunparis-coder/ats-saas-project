import React, { useMemo, useState } from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Button from '@/shared/components/Button/Button';
import { useData } from '@/core/contexts/DataContext';
import { useNavigate } from 'react-router-dom';

/**
 * Calcule un score de matching entre une mission et un candidat (0-100)
 * Critères : compétences (60%), expérience (20%), localisation (10%), disponibilité (10%)
 */
function computeMatchScore(mission, candidate) {
  let score = 0;

  // 1. Compétences (60 pts)
  const mSkills = (mission.skills || []).map((s) => s.toLowerCase());
  const cSkills = (candidate.skills || []).map((s) => s.toLowerCase());
  if (mSkills.length > 0) {
    const matches = mSkills.filter((s) =>
      cSkills.some((cs) => cs.includes(s) || s.includes(cs))
    );
    score += Math.round((matches.length / mSkills.length) * 60);
  }

  // 2. Expérience (20 pts) — heuristique : 5+ ans = plein score
  const exp = Number(candidate.experience) || 0;
  score += Math.min(exp / 5, 1) * 20;

  // 3. Localisation (10 pts)
  const mCity = mission.location?.toLowerCase() || '';
  const cCity = candidate.location?.toLowerCase() || '';
  if (mCity === 'remote' || cCity === 'remote' || mCity === cCity || cCity.includes(mCity) || mCity.includes(cCity)) {
    score += 10;
  }

  // 4. Disponibilité (10 pts) — candidat "active" = disponible
  if (candidate.status === 'active') score += 10;

  return Math.min(Math.round(score), 100);
}

function SkillBadge({ skill, matched }) {
  return (
    <span style={{
      padding: '3px 9px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
      background: matched ? '#ECFDF5' : '#F3F4F6',
      color: matched ? '#059669' : '#9CA3AF',
      border: `1px solid ${matched ? '#A7F3D0' : '#E5E7EB'}`,
    }}>
      {matched ? '✓ ' : ''}{skill}
    </span>
  );
}

function ScoreGauge({ score }) {
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '56px' }}>
      <div style={{
        width: '50px', height: '50px', borderRadius: '50%',
        background: `conic-gradient(${color} ${score * 3.6}deg, #F3F4F6 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: '900', color,
        }}>
          {score}%
        </div>
      </div>
    </div>
  );
}

/**
 * Modal IA de matching : suggère les meilleurs candidats pour une mission
 */
export function MatchingModal({ mission, isOpen, onClose }) {
  const { candidates, addApplication, applications } = useData();
  const navigate = useNavigate();
  const [addedIds, setAddedIds] = useState(new Set());
  const [minScore, setMinScore] = useState(40);

  const ranked = useMemo(() => {
    if (!mission) return [];
    return candidates
      .map((c) => ({ candidate: c, score: computeMatchScore(mission, c) }))
      .filter((r) => r.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }, [mission, candidates, minScore]);

  const alreadyApplied = useMemo(() => {
    if (!mission) return new Set();
    return new Set(
      applications
        .filter((a) => a.missionId === mission.id || a.missionTitle === mission.title)
        .map((a) => a.candidateId)
    );
  }, [applications, mission]);

  const handleAdd = (candidate) => {
    addApplication({
      candidateId: candidate.id,
      candidateName: candidate.name,
      candidateAvatar: candidate.avatar,
      missionId: mission.id,
      missionTitle: mission.title,
      clientName: mission.client,
      status: 'received',
      score: computeMatchScore(mission, candidate),
      dateApplied: new Date().toISOString().split('T')[0],
      notes: `Ajouté via matching IA (score ${computeMatchScore(mission, candidate)}%)`,
    });
    setAddedIds((prev) => new Set([...prev, candidate.id]));
  };

  const missionSkills = (mission?.skills || []).map((s) => s.toLowerCase());

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1F2937', marginBottom: '4px' }}>
            🤖 Matching IA
          </h2>
          <div style={{ fontSize: '13px', color: '#6B7280' }}>
            Candidats recommandés pour : <strong>{mission?.title}</strong>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        {/* Compétences requises */}
        <div style={{
          padding: '14px 18px', background: '#EEF2FF', borderRadius: '12px',
          marginBottom: '20px', border: '1px solid #C7D2FE',
        }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#4338CA', marginBottom: '8px', textTransform: 'uppercase' }}>
            🎯 Compétences recherchées
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(mission?.skills || []).map((s) => (
              <span key={s} style={{
                padding: '4px 10px', borderRadius: '7px', fontSize: '12px', fontWeight: '700',
                background: '#667EEA', color: 'white',
              }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Filtre score minimum */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280', whiteSpace: 'nowrap' }}>
            Score minimum :
          </span>
          {[0, 30, 50, 70].map((val) => (
            <button
              key={val}
              onClick={() => setMinScore(val)}
              style={{
                padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                cursor: 'pointer', transition: 'all 0.15s',
                border: `1.5px solid ${minScore === val ? '#667EEA' : '#E5E7EB'}`,
                background: minScore === val ? '#EEF2FF' : 'white',
                color: minScore === val ? '#4338CA' : '#6B7280',
              }}
            >
              {val === 0 ? 'Tous' : `≥ ${val}%`}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#9CA3AF' }}>
            {ranked.length} candidat{ranked.length !== 1 ? 's' : ''} trouvé{ranked.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Résultats */}
        {ranked.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🤔</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>Aucun candidat correspondant</div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>Essayez un score minimum plus bas</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ranked.map(({ candidate, score }, idx) => {
              const cSkillsLower = (candidate.skills || []).map((s) => s.toLowerCase());
              const isApplied = alreadyApplied.has(candidate.id) || addedIds.has(candidate.id);
              return (
                <div key={candidate.id} style={{
                  padding: '16px', background: 'white', borderRadius: '14px',
                  border: `1.5px solid ${score >= 75 ? '#A7F3D0' : score >= 50 ? '#FDE68A' : '#E5E7EB'}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Rang */}
                    <div style={{
                      fontSize: '13px', fontWeight: '900', color: idx < 3 ? '#667EEA' : '#D1D5DB',
                      minWidth: '20px', textAlign: 'center',
                    }}>
                      #{idx + 1}
                    </div>

                    {/* Avatar */}
                    <div style={{ fontSize: '28px', flexShrink: 0 }}>{candidate.avatar || '👤'}</div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#1F2937', marginBottom: '2px' }}>
                        {candidate.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                        {candidate.position} · {candidate.experience} ans · {candidate.location}
                        {candidate.salary && ` · ${candidate.salary}`}
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {(candidate.skills || []).slice(0, 6).map((skill) => (
                          <SkillBadge
                            key={skill}
                            skill={skill}
                            matched={missionSkills.some((ms) => ms.includes(skill.toLowerCase()) || skill.toLowerCase().includes(ms))}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Score + action */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <ScoreGauge score={score} />
                      {isApplied ? (
                        <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '700' }}>✅ Ajouté</span>
                      ) : (
                        <button
                          onClick={() => handleAdd(candidate)}
                          style={{
                            padding: '6px 12px', background: '#667EEA', color: 'white',
                            border: 'none', borderRadius: '8px', cursor: 'pointer',
                            fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#4F46E5'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#667EEA'; }}
                        >
                          ➕ Ajouter
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', width: '100%' }}>
          <button
            onClick={() => { onClose(); navigate('/app/pipeline'); }}
            style={{
              padding: '9px 16px', border: '1.5px solid #667EEA', borderRadius: '10px',
              background: 'white', color: '#667EEA', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
            }}
          >
            📋 Voir le Pipeline
          </button>
          <Button variant="secondary" onClick={onClose}>Fermer</Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default MatchingModal;
