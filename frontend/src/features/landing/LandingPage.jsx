import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { Navbar, Footer, FeatureCard, TestimonialCard } from '@/shared/components/Marketing';
import { SEO } from '@/shared/components/SEO';
import styles from './LandingPage.module.css';

/**
 * Landing Page complète
 * Page d'accueil publique de l'application ATS
 * Utilise CSS Modules pour un design responsive et maintenable
 * SEO optimisé avec structured data
 */
export function LandingPage() {
  const navigate = useNavigate();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'ATS Ultimate',
    'description': 'Plateforme ATS #1 en France pour recruter 10x plus vite avec l\'intelligence artificielle',
    'url': 'https://ats-ultimate.com',
    'applicationCategory': 'BusinessApplication',
    'offers': {
      '@type': 'AggregateOffer',
      'lowPrice': '99',
      'highPrice': '299',
      'priceCurrency': 'EUR'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'reviewCount': '247',
      'bestRating': '5'
    },
    'featureList': [
      'Intelligence Artificielle',
      'Pipeline Kanban',
      'CVthèque Intelligente',
      'Calendrier Intégré',
      'Auto-Emails',
      'Analytics'
    ]
  };

  return (
    <div>
      <SEO
        title="ATS Ultimate - Recrutez 10x plus vite avec l'IA"
        description="Plateforme ATS #1 en France. Intelligence artificielle, Pipeline Kanban, CVthèque intelligente. Automatisez votre recrutement. Sans engagement."
        url="https://ats-ultimate.com"
        structuredData={structuredData}
      />
      {/* NAVBAR */}
      <Navbar activePage="landing" />

      {/* HERO */}
      <section className={styles.heroSection}>
        {/* Floating emojis */}
        {['🚀', '⚡', '💎', '🎯', '✨', '🌟', '💫', '🎨'].map((emoji, i) => (
          <div
            key={i}
            className={styles.floatingEmoji}
            style={{
              animationDelay: `${i * 0.5}s`,
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`
            }}
          >
            {emoji}
          </div>
        ))}

        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              🎉 Plateforme ATS #1 en France
            </div>
            <h1 className={styles.heroTitle}>
              Recrutez les meilleurs talents 10x plus vite ⚡
            </h1>
            <p className={styles.heroDescription}>
              L'intelligence artificielle au service de vos recrutements. Automatisez, optimisez et trouvez le candidat parfait en quelques clics. 🎯
            </p>
            <div className={styles.heroStats}>
              {[['⚡ 10x', 'Plus rapide'], ['🎯 87%', 'Match IA'], ['🌟 500+', 'Clients']].map(([num, label], i) => (
                <div key={i} className={styles.heroStat}>
                  <div className={styles.heroStatNumber}>{num}</div>
                  <div className={styles.heroStatLabel}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Tout ce dont vous rêviez 🚀
            </h2>
            <p className={styles.sectionSubtitle}>Une suite complète d'outils puissants</p>
          </div>

          <div className={styles.featuresGrid}>
            {[
              ['🤖', 'IA Avancée', 'Scoring automatique avec 87% de précision', 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)'],
              ['📊', 'Pipeline Visuel', 'Kanban intuitif avec drag & drop', 'linear-gradient(135deg, #FF6B9D 0%, #FEC7D7 100%)'],
              ['👥', 'CVthèque', 'Base de données intelligente', 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)'],
              ['📅', 'Planning', 'Calendrier intégré automatique', 'linear-gradient(135deg, #A78BFA 0%, #C471F5 100%)'],
              ['✉️', 'Auto-Emails', 'Templates et envois automatiques', 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)'],
              ['📈', 'Analytics', 'Dashboards temps réel', 'linear-gradient(135deg, #10B981 0%, #34D399 100%)']
            ].map(([emoji, title, desc, gradient], i) => (
              <FeatureCard
                key={i}
                icon={emoji}
                title={title}
                description={desc}
                gradient={gradient}
                link={ROUTES.LOGIN}
              />
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={styles.testimonialsSection}>
        <div className={styles.featuresContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} style={{ color: 'white' }}>
              Ils nous font confiance 💫
            </h2>
          </div>

          <div className={styles.testimonialsGrid}>
            {[
              { name: 'Sarah L.', role: 'DRH TechCorp', stars: '⭐⭐⭐⭐⭐', text: 'Temps divisé par 3 ! L\'IA est bluffante 🚀', avatar: '👩‍💼' },
              { name: 'Marc D.', role: 'CEO Startup', stars: '⭐⭐⭐⭐⭐', text: 'Interface intuitive, ROI incroyable 💎', avatar: '👨‍💻' },
              { name: 'Julie M.', role: 'Recruteuse', stars: '⭐⭐⭐⭐⭐', text: 'Meilleur ATS du marché ! Je recommande ✨', avatar: '👩‍🎤' }
            ].map((testimonial, i) => (
              <TestimonialCard
                key={i}
                name={testimonial.name}
                role={testimonial.role}
                stars={testimonial.stars}
                text={testimonial.text}
                avatar={testimonial.avatar}
                variant="dark"
              />
            ))}
          </div>
        </div>
      </section>

      {/* VIDÉO PRODUIT — T-291
          Remplacer VITE_LOOM_EMBED_URL par l'URL d'intégration Loom ou YouTube.
          Exemple : https://www.loom.com/embed/XXXXXXXX ou https://www.youtube.com/embed/XXXXXXXX
          Si non configuré : affiche un placeholder CTA vers /demo. */}
      <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(24px, 4vw, 60px)', background: '#0F172A', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(102,126,234,0.2)', border: '1px solid rgba(102,126,234,0.4)', padding: '6px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', color: '#A78BFA', marginBottom: '20px' }}>
            🎬 Voir l'app en action
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '900', color: 'white', marginBottom: '16px' }}>
            De l'offre à l'embauche en moins de 3 minutes
          </h2>
          <p style={{ color: '#94A3B8', marginBottom: '36px', lineHeight: 1.6, fontSize: '16px' }}>
            Créez une mission, recevez des candidatures, interviewez et embauchez — le tout dans un seul outil.
          </p>
          {import.meta.env.VITE_LOOM_EMBED_URL ? (
            <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: '16px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
              <iframe
                src={import.meta.env.VITE_LOOM_EMBED_URL}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
                title="ATS Ultimate — Démonstration produit"
              />
            </div>
          ) : (
            <div
              onClick={() => navigate(ROUTES.DEMO)}
              style={{
                background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                borderRadius: '20px',
                padding: '80px 40px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                border: '2px solid rgba(255,255,255,0.15)',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>▶</div>
              <div style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>Accéder à la démo interactive</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Interface authentique · Données réalistes · Sans inscription</div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Prêt à révolutionner ? 🚀</h2>
        <p className={styles.ctaDescription}>Rejoignez les 500+ entreprises qui recrutent mieux</p>
        <button
          onClick={() => navigate(`${ROUTES.CONTACT}?sujet=demo`)}
          className={styles.ctaButton}
        >
          🎥 Demandez votre démo
        </button>
      </section>

      {/* FOOTER */}
      <Footer variant="dark" />
    </div>
  );
}

export default LandingPage;
