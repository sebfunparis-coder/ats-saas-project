import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/services/supabase';

const STATUS_INFO = {
  received:    { label: 'Candidature reçue', desc: 'Votre candidature a bien été reçue et est en cours d\'examen.', color: '#6B7280', progress: 15 },
  screening:   { label: 'Présélection en cours', desc: 'Votre profil est en cours d\'évaluation par notre équipe.', color: '#3B82F6', progress: 30 },
  interview_1: { label: 'Entretien planifié', desc: 'Félicitations ! Vous avez été sélectionné(e) pour un entretien.', color: '#F59E0B', progress: 50 },
  interview_2: { label: 'Deuxième entretien', desc: 'Vous avancez dans notre processus de recrutement.', color: '#8B5CF6', progress: 65 },
  offer:       { label: 'Offre en préparation', desc: 'Excellente nouvelle ! Une offre est en cours de préparation.', color: '#10B981', progress: 85 },
  final:       { label: 'Finaliste', desc: 'Vous êtes parmi les finalistes pour ce poste.', color: '#059669', progress: 90 },
  hired:       { label: 'Félicitations !', desc: 'Vous avez été recruté(e) pour ce poste. Bienvenue dans l\'équipe !', color: '#EC4899', progress: 100 },
  rejected:    { label: 'Candidature non retenue', desc: 'Après examen de votre candidature, nous n\'avons pas pu donner une suite favorable.', color: '#EF4444', progress: 100 },
};

/**
 * Portail candidat — suivi de candidature (T-251). Accès via lien tokenisé,
 * sans compte. Tout l'accès passe par la fonction RPC SECURITY DEFINER
 * get_tracking_status (migration 011) — ne retourne que le statut et le CV
 * du candidat lié au token, jamais les notes internes/scores recruteur.
 */
export default function TrackingPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: result, error } = await supabase.rpc('get_tracking_status', { p_token: token });
      if (cancelled) return;
      if (error || !result) setNotFound(true);
      else setData(result);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [token]);

  const base = { minHeight: '100vh', background: 'linear-gradient(135deg, #667EEA15 0%, #764BA215 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' };

  if (notFound) return (
    <div style={base}>
      <div style={{ textAlign: 'center', padding: '48px', background: 'white', borderRadius: '24px', maxWidth: '420px', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔍</div>
        <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1F2937', marginBottom: '8px' }}>Lien introuvable</h1>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>Ce lien de suivi est invalide. Contactez votre recruteur pour obtenir un nouveau lien.</p>
      </div>
    </div>
  );

  if (loading || !data) return <div style={base}><div style={{ fontSize: '32px' }}>⏳</div></div>;

  const info = STATUS_INFO[data.status] || STATUS_INFO.received;

  return (
    <div style={base}>
      <div style={{ background: 'white', borderRadius: '24px', maxWidth: '560px', width: '100%', padding: '40px', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👋</div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1F2937', marginBottom: '4px' }}>Bonjour {data.candidateName} !</h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>
            Suivi de votre candidature pour <strong>{data.missionTitle}</strong>
            {data.clientName ? ` chez ${data.clientName}` : ''}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ height: '8px', background: '#F3F4F6', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${info.progress}%`, background: `linear-gradient(90deg, #667EEA, ${info.color})`, borderRadius: '999px', transition: 'width 1s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Candidature reçue</span>
            <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Recruté</span>
          </div>
        </div>

        {/* Current status */}
        <div style={{ padding: '24px', background: `${info.color}12`, borderRadius: '16px', border: `2px solid ${info.color}30`, marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>
            {data.status === 'hired' ? '🎉' : data.status === 'rejected' ? '😔' : '📋'}
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: info.color, marginBottom: '8px' }}>{info.label}</h2>
          <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>{info.desc}</p>
          {data.dateApplied && (
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '10px' }}>
              Candidature soumise le {new Date(data.dateApplied).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* Documents */}
        {data.resume?.base64Data && (
          <div style={{ padding: '16px', background: '#F9FAFB', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', marginBottom: '10px' }}>📎 Vos documents</div>
            <a
              href={data.resume.base64Data}
              download={data.resume.fileName}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#667EEA', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '13px' }}
            >
              📄 Télécharger mon CV
            </a>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#D1D5DB', marginTop: '24px' }}>
          Propulsé par ATS SaaS Platform
        </p>
      </div>
    </div>
  );
}
