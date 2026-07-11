import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { SEO } from '@/shared/components/SEO';
import { Navbar, Footer } from '@/shared/components/Marketing';

/**
 * Page À Propos
 */
export function APropos() {
  const navigate = useNavigate();

  const containerStyles = { minHeight: '100vh', background: 'linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%)', padding: '120px 40px 80px' };
  const maxWidthStyles = { maxWidth: '1200px', margin: '0 auto' };
  const titleStyles = { fontSize: '56px', fontWeight: '900', marginBottom: '24px', textAlign: 'center', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };
  const textStyles = { fontSize: '18px', lineHeight: '1.8', color: '#4B5563', marginBottom: '16px', textAlign: 'center', maxWidth: '800px', margin: '0 auto 16px' };

  return (
    <div style={containerStyles}>
      <SEO
        title="À propos"
        description="Découvrez la mission d'ATS Ultimate : simplifier et accélérer le recrutement grâce à l'intelligence artificielle."
        url="https://ats-ultimate.com/a-propos"
      />
      <Navbar />
      <div style={maxWidthStyles}>
        <button onClick={() => navigate(ROUTES.LANDING)} style={{ marginBottom: '32px', padding: '12px 24px', background: '#EEF2FF', color: '#667EEA', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
          ← Retour à l'accueil
        </button>

        <h1 style={titleStyles}>À Propos d'ATS Ultimate</h1>
        <p style={{ ...textStyles, fontSize: '20px', color: '#667EEA', fontWeight: '600', marginBottom: '64px' }}>
          Révolutionner le recrutement avec l'intelligence artificielle
        </p>

        {/* Mission */}
        <div style={{ background: 'white', padding: '64px', borderRadius: '24px', marginBottom: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '24px', color: '#1F2937', textAlign: 'center' }}>🎯 Notre Mission</h2>
          <p style={textStyles}>
            Chez ATS Ultimate, nous croyons que le recrutement ne devrait pas être une corvée chronophage. Notre mission est de simplifier et d'accélérer le processus de recrutement grâce à l'intelligence artificielle, tout en améliorant la qualité des embauches.
          </p>
          <p style={textStyles}>
            Nous aidons les entreprises de toutes tailles à trouver les meilleurs talents 10x plus rapidement, avec une précision inégalée.
          </p>
        </div>

        {/* Histoire */}
        <div style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', padding: '64px', borderRadius: '24px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '24px', color: '#1F2937', textAlign: 'center' }}>📖 Notre Histoire</h2>
          <p style={textStyles}>
            Fondée en 2024 par une équipe passionnée de recruteurs et d'ingénieurs en IA, ATS Ultimate est née d'une frustration commune : les outils de recrutement traditionnels sont lents, complexes et inefficaces.
          </p>
          <p style={textStyles}>
            Après 2 ans de R&D intensive, nous avons lancé la première plateforme ATS propulsée par une IA de matching atteignant 87% de précision.
          </p>
          <p style={textStyles}>
            Aujourd'hui, plus de 500 entreprises nous font confiance pour recruter leurs talents.
          </p>
        </div>

        {/* Équipe */}
        <div style={{ background: 'white', padding: '64px', borderRadius: '24px', marginBottom: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '48px', color: '#1F2937', textAlign: 'center' }}>👥 Notre Équipe</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {[
              { name: 'Marie Dubois', role: 'CEO & Co-fondatrice', emoji: '👩‍💼', desc: '15 ans en RH & Tech' },
              { name: 'Thomas Martin', role: 'CTO & Co-fondateur', emoji: '👨‍💻', desc: 'Expert IA & Machine Learning' },
              { name: 'Sophie Laurent', role: 'Head of Product', emoji: '👩‍🎨', desc: 'Design & UX passionnée' }
            ].map((member, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '32px', background: '#F9FAFB', borderRadius: '16px' }}>
                <div style={{ fontSize: '80px', marginBottom: '16px' }}>{member.emoji}</div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: '#1F2937' }}>{member.name}</h3>
                <p style={{ fontSize: '16px', color: '#667EEA', fontWeight: '600', marginBottom: '8px' }}>{member.role}</p>
                <p style={{ fontSize: '14px', color: '#6B7280' }}>{member.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Valeurs */}
        <div style={{ background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', padding: '64px', borderRadius: '24px', color: 'white' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '48px', textAlign: 'center' }}>💎 Nos Valeurs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
            {[
              { icon: '🚀', title: 'Innovation', desc: 'Toujours à la pointe de la technologie' },
              { icon: '🤝', title: 'Transparence', desc: 'Honnêteté et clarté dans tout ce que nous faisons' },
              { icon: '🎯', title: 'Excellence', desc: 'Qualité et précision sans compromis' },
              { icon: '💪', title: 'Impact', desc: 'Créer de la valeur réelle pour nos clients' }
            ].map((value, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '32px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{value.icon}</div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>{value.title}</h3>
                <p style={{ fontSize: '16px', opacity: 0.9 }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chiffres clés */}
        <div style={{ marginTop: '64px', padding: '64px', background: 'white', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '48px', color: '#1F2937', textAlign: 'center' }}>📊 Nos Chiffres Clés</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', textAlign: 'center' }}>
            {[
              { num: '500+', label: 'Clients actifs' },
              { num: '87%', label: 'Précision IA' },
              { num: '10x', label: 'Plus rapide' },
              { num: '99.5%', label: 'Uptime' }
            ].map((stat, i) => (
              <div key={i}>
                <div style={{ fontSize: '48px', fontWeight: '900', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '12px' }}>
                  {stat.num}
                </div>
                <div style={{ fontSize: '16px', color: '#6B7280', fontWeight: '600' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer variant="light" />
    </div>
  );
}

export default APropos;
