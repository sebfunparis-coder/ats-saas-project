import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import { supabase } from '@/services/supabase';

const STATUS_LABELS = {
  open: { label: 'En cours', color: '#10B981', bg: '#D1FAE5' },
  active: { label: 'Active', color: '#10B981', bg: '#D1FAE5' },
  filled: { label: 'Pourvue', color: '#8B5CF6', bg: '#EDE9FE' },
  paused: { label: 'En pause', color: '#F59E0B', bg: '#FEF3C7' },
  closed: { label: 'Clôturée', color: '#6B7280', bg: '#F3F4F6' },
};

const STAGE_ICONS = {
  received: '📥',
  screening: '🔍',
  interview_1: '🤝',
  interview_2: '💬',
  offer: '📋',
  hired: '🎉',
};

export function ClientPortalPage() {
  const { token } = useParams();
  const isMobile = useIsMobile();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: result, error } = await supabase.rpc('get_client_portal_data', { p_token: token });
      if (!cancelled) {
        setData(error ? null : result);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
        Chargement…
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1F2937', marginBottom: '8px' }}>Portail introuvable</h2>
          <p style={{ color: '#6B7280' }}>Ce lien a expiré ou n'existe pas. Contactez votre recruteur.</p>
        </div>
      </div>
    );
  }

  const { clientName, missions = [], generatedAt } = data;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F0F4FF 0%, #FAF5FF 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #667EEA, #764BA2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🏢</div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1F2937', margin: 0 }}>Portail de suivi — {clientName}</h1>
              <p style={{ color: '#6B7280', fontSize: '14px', margin: '4px 0 0' }}>
                Vue en lecture seule · Généré le {new Date(generatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { icon: '💼', label: 'Missions', value: missions.length, color: '#667EEA' },
            { icon: '🟢', label: 'En cours', value: missions.filter(m => ['open','active'].includes(m.status)).length, color: '#10B981' },
            { icon: '🎉', label: 'Pourvues', value: missions.filter(m => m.status === 'filled').length, color: '#8B5CF6' },
          ].map((kpi, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{kpi.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: kpi.color }}>{kpi.value}</div>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Missions */}
        {missions.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
            <p style={{ color: '#6B7280' }}>Aucune mission partagée pour l'instant.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {missions.map(mission => {
              const statusInfo = STATUS_LABELS[mission.status] || STATUS_LABELS.open;
              return (
                <div key={mission.id} style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1F2937', margin: '0 0 4px' }}>{mission.title}</h3>
                      <p style={{ color: '#6B7280', fontSize: '13px', margin: 0 }}>{mission.location} · {mission.contractType || 'CDI'}</p>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: statusInfo.bg, color: statusInfo.color }}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Pipeline progress */}
                  {mission.stages && (
                    <div>
                      <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '10px' }}>PROGRESSION DU PIPELINE</p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {Object.entries(mission.stages).map(([stage, count]) => (
                          <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                            <span style={{ fontSize: '14px' }}>{STAGE_ICONS[stage] || '📌'}</span>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937' }}>{count}</span>
                            <span style={{ fontSize: '11px', color: '#6B7280' }}>{stage.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Progress bar */}
                  {typeof mission.progress === 'number' && (
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Avancement</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#667EEA' }}>{mission.progress}%</span>
                      </div>
                      <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${mission.progress}%`, height: '100%', background: 'linear-gradient(90deg, #667EEA, #10B981)', borderRadius: '4px' }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '12px', marginTop: '32px' }}>
          Portail sécurisé · Vue en lecture seule · Powered by ATS SaaS
        </p>
      </div>
    </div>
  );
}

export default ClientPortalPage;
