import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '@/core/contexts/DataContext';
import { SEO } from '@/shared/components/SEO';

const SKILL_COLORS = ['#667EEA', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function JobSharePage() {
  const { id } = useParams();
  const { missions } = useData();

  const mission = useMemo(
    () => missions.find(m => String(m.id) === String(id) || String(m._id) === String(id)),
    [missions, id]
  );

  if (!mission) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', padding: '24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1F2937', marginBottom: '8px' }}>Mission introuvable</h1>
        <p style={{ color: '#6B7280', marginBottom: '24px' }}>Ce lien n'est plus valide ou la mission a été clôturée.</p>
        <Link to="/" style={{ color: '#667EEA', fontWeight: '700', textDecoration: 'none' }}>← Retour à l'accueil</Link>
      </div>
    );
  }

  const { title, client, location, salary, skills = [], description, emoji = '💼', color = '#667EEA', contractType, workMode, startDate } = mission;

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '0' }}>
      <SEO
        title={title}
        description={(description || `Offre d'emploi : ${title}`).slice(0, 160)}
        url={`https://ats-ultimate.com/jobs/${id}`}
      />
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`, padding: '48px 24px 32px', color: 'white' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{
              width: '64px', height: '64px', background: 'rgba(255,255,255,0.2)',
              borderRadius: '16px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '32px', flexShrink: 0,
            }}>
              {emoji}
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>{title}</h1>
              <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: '16px' }}>
                🏢 {client} · 📍 {location}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {contractType && (
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>
                📄 {contractType}
              </span>
            )}
            {workMode && (
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>
                🏠 {workMode}
              </span>
            )}
            {salary && (
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>
                💰 {salary}
              </span>
            )}
            {startDate && (
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>
                🗓️ Dès le {new Date(startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>

        {description && (
          <section style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1F2937', marginBottom: '16px' }}>
              📋 Description du poste
            </h2>
            <div style={{
              background: 'white', padding: '24px', borderRadius: '14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6',
              fontSize: '15px', color: '#4B5563', lineHeight: '1.7',
            }}>
              {description}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1F2937', marginBottom: '16px' }}>
              🛠️ Compétences recherchées
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {skills.map((skill, i) => (
                <span
                  key={skill}
                  style={{
                    padding: '8px 16px',
                    background: `${SKILL_COLORS[i % SKILL_COLORS.length]}18`,
                    color: SKILL_COLORS[i % SKILL_COLORS.length],
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '700',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section style={{ marginBottom: '36px' }}>
          <div style={{
            background: `linear-gradient(135deg, ${color}18, ${color}08)`,
            border: `1px solid ${color}40`,
            borderRadius: '16px', padding: '32px', textAlign: 'center',
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#1F2937', marginBottom: '8px' }}>
              Vous êtes intéressé(e) ?
            </h2>
            <p style={{ color: '#6B7280', marginBottom: '24px', fontSize: '15px' }}>
              Connectez-vous à votre espace ou créez un compte pour postuler.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/register"
                style={{
                  padding: '12px 28px', background: color, color: 'white',
                  borderRadius: '10px', fontWeight: '800', textDecoration: 'none', fontSize: '15px',
                }}
              >
                Créer un compte →
              </Link>
              <Link
                to="/login"
                style={{
                  padding: '12px 28px', background: 'white', color: color,
                  borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '15px',
                  border: `1.5px solid ${color}`,
                }}
              >
                Se connecter
              </Link>
            </div>
          </div>
        </section>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#9CA3AF' }}>
          Partagé via la plateforme ATS SaaS · <Link to="/" style={{ color: '#667EEA' }}>En savoir plus</Link>
        </p>
      </div>
    </div>
  );
}

export default JobSharePage;
