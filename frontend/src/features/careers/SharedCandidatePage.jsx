import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { useIsMobile } from '@/core/hooks/useIsMobile';

const RECOMMENDATION_OPTIONS = [
  { value: 'go', label: '✅ Recommandé', color: '#10B981' },
  { value: 'maybe', label: '🤔 À revoir', color: '#F59E0B' },
  { value: 'no_go', label: '❌ Non retenu', color: '#EF4444' },
];

/**
 * Page publique de consultation candidat via lien tokenisé (T-249) — permet à
 * un manager sans compte de consulter le profil et laisser un avis. Tout
 * l'accès passe par les fonctions RPC SECURITY DEFINER get_shared_candidate/
 * submit_share_review (voir migration 010) — aucun accès direct aux tables
 * candidates/applications n'est accordé à anon.
 */
export default function SharedCandidatePage() {
  const { token } = useParams();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [reviewerName, setReviewerName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: result, error } = await supabase.rpc('get_shared_candidate', { p_token: token });
      if (cancelled) return;
      if (error || !result) {
        setNotFound(true);
      } else {
        setData(result);
        if (result.review?.text) {
          setReviewerName(result.review.reviewerName || '');
          setReviewText(result.review.text || '');
          setRecommendation(result.review.recommendation || '');
        }
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [token]);

  const handleSubmitReview = async () => {
    setSubmitting(true);
    const { data: ok } = await supabase.rpc('submit_share_review', {
      p_token: token,
      p_review_text: reviewText.trim(),
      p_recommendation: recommendation || null,
      p_reviewer_name: reviewerName.trim(),
    });
    setSubmitting(false);
    if (ok) setSubmitted(true);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#6B7280' }}>
      Chargement…
    </div>
  );

  if (notFound) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#6B7280' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
      <p>Ce lien est invalide ou a expiré.</p>
    </div>
  );

  const { candidate, application } = data;
  const inputStyle = {
    width: '100%', padding: '12px 14px', border: '2px solid #E5E7EB',
    borderRadius: '10px', fontSize: '15px', boxSizing: 'border-box',
    outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle = { display: 'block', fontWeight: '700', fontSize: '14px', marginBottom: '6px', color: '#374151' };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '48px 24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #667EEA, #764BA2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
            {candidate?.avatar || '👤'}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#1F2937' }}>{candidate?.name}</h1>
            <p style={{ margin: '4px 0 0', color: '#6B7280' }}>{candidate?.position} {application?.missionTitle ? `— ${application.missionTitle}` : ''}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', fontSize: '14px', color: '#374151', marginBottom: '16px' }}>
          {candidate?.email && <div><strong>Email :</strong> {candidate.email}</div>}
          {candidate?.phone && <div><strong>Téléphone :</strong> {candidate.phone}</div>}
          {candidate?.location && <div><strong>Localisation :</strong> {candidate.location}</div>}
          {candidate?.experience != null && <div><strong>Expérience :</strong> {candidate.experience} ans</div>}
        </div>

        {candidate?.skills?.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <strong style={{ fontSize: '13px', color: '#6B7280' }}>Compétences :</strong>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
              {candidate.skills.map((s, i) => (
                <span key={i} style={{ padding: '4px 10px', background: '#EFF6FF', color: '#3B82F6', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {candidate?.resume?.base64Data && (
          <a
            href={candidate.resume.base64Data}
            download={candidate.resume.fileName}
            style={{ display: 'inline-block', padding: '10px 18px', background: '#667EEA', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}
          >
            📄 Télécharger le CV
          </a>
        )}
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '800', color: '#1F2937' }}>💬 Votre avis</h2>

        {submitted ? (
          <div style={{ padding: '16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', color: '#065F46', fontWeight: '600' }}>
            ✅ Merci, votre avis a été transmis au recruteur.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Votre nom</label>
              <input style={inputStyle} value={reviewerName} onChange={e => setReviewerName(e.target.value)} placeholder="Nom et prénom" />
            </div>
            <div>
              <label style={labelStyle}>Recommandation</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {RECOMMENDATION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRecommendation(opt.value)}
                    style={{
                      padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px',
                      border: `2px solid ${recommendation === opt.value ? opt.color : '#E5E7EB'}`,
                      background: recommendation === opt.value ? `${opt.color}15` : 'white',
                      color: recommendation === opt.value ? opt.color : '#6B7280',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Commentaire</label>
              <textarea
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Vos impressions sur ce profil..."
              />
            </div>
            <button
              onClick={handleSubmitReview}
              disabled={submitting || !reviewerName.trim()}
              style={{
                padding: '14px', background: submitting ? '#9CA3AF' : '#667EEA', color: 'white', border: 'none',
                borderRadius: '12px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: '800', fontSize: '15px',
              }}
            >
              {submitting ? 'Envoi…' : 'Envoyer mon avis'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
