import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '@/shared/components/Marketing';
import { SEO } from '@/shared/components/SEO';
import styles from './VerticalLandingPage.module.css';

/**
 * Composant générique pour les landing pages verticales (T-289).
 * Accepte le contenu segmenté en props — utilisé par :
 * - AgencesInterimPage (/agences-interim)
 * - RHInternePage (/rh-interne)
 * - CabinetsRecrutementPage (/cabinets-recrutement)
 */
export function VerticalLandingPage({ seo, segment, hero, pains, features, testimonials, stats }) {
  return (
    <div className={styles.page}>
      <SEO {...seo} />
      <Navbar activePage="landing" />

      {/* HERO */}
      <section className={styles.hero} style={{ background: hero.gradient }}>
        {['🚀', '⚡', '✨', '🎯'].map((emoji, i) => (
          <div
            key={i}
            className={styles.floatingEmoji}
            style={{ animationDelay: `${i * 0.5}s`, left: `${12 + i * 22}%`, top: `${20 + (i % 2) * 40}%` }}
          >
            {emoji}
          </div>
        ))}
        <div className={styles.heroContent}>
          <div className={styles.segment}>{hero.badge}</div>
          <h1 className={styles.heroTitle} dangerouslySetInnerHTML={{ __html: hero.title }} />
          <p className={styles.heroSubtitle}>{hero.subtitle}</p>
          <div className={styles.heroCta}>
            <Link to="/register" className={styles.btnPrimary}>Démarrer maintenant →</Link>
            <Link to="/demo" className={styles.btnSecondary}>Voir la démo</Link>
          </div>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className={styles.painSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{pains.title}</h2>
          <p className={styles.sectionSubtitle}>{pains.subtitle}</p>
          <div className={styles.painGrid}>
            {pains.items.map((p, i) => (
              <div key={i} className={styles.painCard}>
                <div className={styles.painIcon}>{p.icon}</div>
                <div className={styles.painTitle}>{p.title}</div>
                <div className={styles.painText}>{p.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      {stats && (
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            {stats.map((s, i) => (
              <div key={i}>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FEATURES */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{features.title}</h2>
          <p className={styles.sectionSubtitle}>{features.subtitle}</p>
          <div className={styles.featuresList}>
            {features.items.map((f, i) => (
              <div key={i} className={`${styles.featureRow}${i % 2 === 1 ? ' ' + styles.reverse : ''}`}>
                <div className={styles.featureMock}>{f.mockIcon}</div>
                <div>
                  <div className={styles.featureTag}>{f.tag}</div>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureText}>{f.text}</p>
                  <div className={styles.featureChecks}>
                    {f.checks.map((c, j) => (
                      <div key={j} className={styles.featureCheck}>{c}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={styles.testimonialsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{testimonials.title}</h2>
          <p className={styles.sectionSubtitle}>{testimonials.subtitle}</p>
          <div className={styles.testimonialsGrid}>
            {testimonials.items.map((t, i) => (
              <div key={i} className={styles.testimonialCard}>
                <div className={styles.testimonialQuote}>{t.quote}</div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{t.avatar}</div>
                  <div>
                    <div className={styles.testimonialName}>{t.name}</div>
                    <div className={styles.testimonialRole}>{t.role}</div>
                    {t.metric && <div className={styles.testimonialMetric}>📈 {t.metric}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Prêt à transformer votre recrutement ?</h2>
          <p className={styles.sectionSubtitle}>
            Rejoignez {segment.customerCount}+ {segment.label} qui recrutent plus vite avec ATS Ultimate.
          </p>
          <div className={styles.ctaButtons}>
            <Link to="/register" className={styles.ctaBtnPrimary}>Démarrer maintenant</Link>
            <Link to="/contact" className={styles.ctaBtnSecondary}>Demander une démo personnalisée</Link>
          </div>
          <p className={styles.ctaNote}>✓ Sans engagement · ✓ Annulation en 1 clic</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default VerticalLandingPage;
