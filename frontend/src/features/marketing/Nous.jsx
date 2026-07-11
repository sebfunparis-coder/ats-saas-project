import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { Navbar, Footer } from '@/shared/components/Marketing';
import { SEO } from '@/shared/components/SEO';
import styles from './Nous.module.css';

const PARCOURS = [
  {
    emoji: '🏢',
    title: 'Agence d\'intérim',
    text: 'Recruteur en agence d\'intérim, j\'ai connu le rythme effréné du recrutement de masse : des dizaines de candidatures à traiter chaque jour, des clients à satisfaire dans l\'urgence, et déjà ce sentiment de courir après les CV plus que de vraiment recruter.',
  },
  {
    emoji: '💼',
    title: 'Consultant indépendant',
    text: 'En tant que consultant indépendant, j\'ai accompagné des dizaines d\'entreprises dans leurs recrutements — avec les mêmes outils artisanaux d\'une mission à l\'autre : tableurs, post-it, boîtes mail surchargées.',
  },
  {
    emoji: '🏭',
    title: 'DRH dans un groupe tech',
    text: 'Puis DRH d\'un service recrutement au sein d\'un groupe tech, j\'ai piloté des campagnes pour des clients dans la grande distribution, l\'industrie, le bâtiment et auprès de nombreuses PME — des secteurs différents, mais toujours le même problème.',
  },
];

/**
 * Page Nous — genèse du projet ATS Ultimate
 */
export function Nous() {
  const navigate = useNavigate();

  return (
    <div>
      <SEO
        title="Nous — Notre histoire | ATS Ultimate"
        description="Née de plusieurs années sur le terrain du recrutement — agence d'intérim, conseil indépendant, DRH dans un groupe tech — ATS Ultimate a été créée pour ne plus jamais perdre le fil d'un recrutement."
        url="https://ats-ultimate.com/nous"
      />
      <Navbar activePage="nous" />

      {/* HERO */}
      <section className={styles.heroSection}>
        {['📋', '📞', '📁', '✨', '🗂️', '🎯'].map((emoji, i) => (
          <div
            key={i}
            className={styles.floatingEmoji}
            style={{ animationDelay: `${i * 0.5}s`, left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
          >
            {emoji}
          </div>
        ))}
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>👋 Notre histoire</div>
            <h1 className={styles.heroTitle}>
              Née de plusieurs années sur le terrain du recrutement
            </h1>
            <p className={styles.heroDescription}>
              Avant d'être un logiciel, ATS Ultimate a d'abord été un ras-le-bol — celui de perdre le fil de ses recrutements au milieu des piles de CV et de dossiers clients.
            </p>
            <button className={styles.ctaButton} onClick={() => navigate(ROUTES.REGISTER)}>
              🚀 Découvrir la plateforme
            </button>
          </div>
        </div>
      </section>

      {/* PARCOURS */}
      <section className={styles.storySection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Un même problème, à chaque poste 📌</h2>
            <p className={styles.sectionSubtitle}>
              Plusieurs années, plusieurs métiers du recrutement, plusieurs secteurs — et toujours le même constat.
            </p>
          </div>

          <div className={styles.parcoursGrid}>
            {PARCOURS.map((step, i) => (
              <div key={i} className={styles.parcoursCard}>
                <div className={styles.parcoursEmoji}>{step.emoji}</div>
                <h3 className={styles.parcoursTitle}>{step.title}</h3>
                <p className={styles.parcoursText}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LE DÉCLIC */}
      <section className={styles.declicSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} style={{ color: 'white', WebkitTextFillColor: 'white', background: 'none' }}>
              Le déclic 💡
            </h2>
          </div>
          <blockquote className={styles.declicQuote}>
            « À force de piles de CV et de dossiers clients qui s'accumulent sur le bureau, on finit par ne plus savoir qui on a appelé ou pas. Et on passe forcément à côté de pépites — ces candidats parfaits, noyés dans la masse, qu'on ne recontacte jamais. »
          </blockquote>
          <p className={styles.declicText}>
            Ce constat, je l'ai vécu de l'intérieur, dans des contextes très différents — intérim, conseil, grand groupe — mais toujours avec la même frustration : passer plus de temps à chercher où en est un dossier qu'à recruter.
          </p>
        </div>
      </section>

      {/* LA SOLUTION */}
      <section className={styles.storySection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>La solution que j'aurais aimé avoir 🚀</h2>
            <p className={styles.sectionSubtitle}>
              ATS Ultimate est né de ce vécu — pour donner enfin aux recruteurs les moyens de piloter leurs recrutements sans rien laisser filer.
            </p>
          </div>
          <div className={styles.missionBox}>
            <p className={styles.missionText}>
              Un pipeline clair au lieu de piles de dossiers. Un historique de chaque candidat au lieu de post-it perdus. Une vue d'ensemble de chaque mission au lieu de tableurs disséminés. Rien de magique — juste l'outil qu'il m'a manqué pendant toutes ces années sur le terrain.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Envie d'en discuter ? 🎥</h2>
        <p className={styles.ctaDescription}>On vous montre comment ATS Ultimate peut changer votre quotidien de recruteur.</p>
        <button
          onClick={() => navigate(`${ROUTES.CONTACT}?sujet=demo`)}
          className={styles.ctaButton}
        >
          🎥 Demandez votre démo
        </button>
      </section>

      <Footer variant="dark" />
    </div>
  );
}

export default Nous;
