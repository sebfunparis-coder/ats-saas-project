import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/services/supabase';

const base = { minHeight: '100vh', background: 'linear-gradient(135deg, #667EEA15 0%, #764BA215 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' };
const card = { background: 'white', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '40px', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' };

function StarRating({ value, onChange, label }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>{label}</div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '28px', padding: 0, opacity: n <= value ? 1 : 0.3 }}
            aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
          >
            ⭐
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Portail candidat — enquête de satisfaction (T-337). Accès via lien tokenisé,
 * sans compte. Tout l'accès passe par les fonctions RPC SECURITY DEFINER
 * get_survey_details / submit_survey_response (migration 018).
 */
export default function SurveyPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [process, setProcess] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [nps, setNps] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: result, error: err } = await supabase.rpc('get_survey_details', { p_token: token });
      if (cancelled) return;
      if (err || !result) setNotFound(true);
      else {
        setData(result);
        if (result.alreadyAnswered) setSubmitted(true);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [token]);

  const handleSubmit = async () => {
    if (!process || !communication || nps === null) {
      setError('Merci de répondre aux 3 questions avant d\'envoyer.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const { data: ok, error: err } = await supabase.rpc('submit_survey_response', {
        p_token: token, p_process: process, p_communication: communication, p_nps: nps, p_comment: comment.trim() || null,
      });
      if (err || !ok) throw err || new Error('Ce questionnaire a déjà reçu une réponse.');
      setSubmitted(true);
    } catch (e) {
      setError(e.message || 'Impossible d\'envoyer votre réponse, réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  if (notFound) return (
    <div style={base}>
      <div style={{ ...card, textAlign: 'center', maxWidth: '420px' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔍</div>
        <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1F2937', marginBottom: '8px' }}>Lien introuvable</h1>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>Ce lien de questionnaire est invalide ou a expiré.</p>
      </div>
    </div>
  );

  if (loading || !data) return <div style={base}><div style={{ fontSize: '32px' }}>⏳</div></div>;

  if (submitted) return (
    <div style={base}>
      <div style={{ ...card, textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🙏</div>
        <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1F2937', marginBottom: '8px' }}>Merci pour votre retour !</h1>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>Votre réponse a bien été enregistrée.</p>
      </div>
    </div>
  );

  return (
    <div style={base}>
      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1F2937', marginBottom: '4px' }}>Bonjour {data.candidateName} !</h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>
            Votre avis sur le processus de recrutement pour <strong>{data.missionTitle}</strong> nous intéresse.
          </p>
        </div>

        <StarRating value={process} onChange={setProcess} label="Comment évaluez-vous le déroulement du processus ?" />
        <StarRating value={communication} onChange={setCommunication} label="Comment évaluez-vous notre communication ?" />

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
            Recommanderiez-vous notre processus à un proche ? (0 = pas du tout, 10 = certainement)
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {Array.from({ length: 11 }, (_, n) => n).map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setNps(n)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700',
                  border: nps === n ? '2px solid #667EEA' : '1.5px solid #E5E7EB',
                  background: nps === n ? '#EEF2FF' : 'white',
                  color: nps === n ? '#667EEA' : '#6B7280',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Un commentaire à ajouter ? (optionnel)</div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical' }}
          />
        </div>

        {error && <p style={{ color: '#EF4444', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #667EEA, #764BA2)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? 'Envoi...' : 'Envoyer ma réponse'}
        </button>
      </div>
    </div>
  );
}
