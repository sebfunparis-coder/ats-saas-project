import React, { useState } from 'react';
import { Navbar, Footer } from '@/shared/components/Marketing';
import { SEO } from '@/shared/components/SEO';

/**
 * Page Changelog et Release Notes — T-313
 * Historique public des mises à jour, par version et date.
 */

const RELEASES = [
  {
    version: '2.0.0',
    date: '1er juillet 2026',
    type: 'major',
    title: 'Blocs 5–10 : Intégrations, Légal, Site vitrine, Internationalisation, Tests, Documentation',
    changes: [
      { cat: '🔗 Intégrations', items: ['Jobboards : HelloWork, APEC, Monster (en plus de LinkedIn/Indeed/WTTJ)', 'Google Calendar OAuth2 — sync entretiens avec invitations automatiques', 'Microsoft Outlook / M365 sync via Microsoft Graph API', 'Zoom Server-to-Server OAuth — réunions créées automatiquement', 'Microsoft Teams — réunions via Graph API OnlineMeetings', 'SMS Twilio — convocation, rappel J-1, mise à jour statut', 'Signature électronique Yousign (eIDAS) — workflow complet', 'Webhooks sortants réels : retry backoff (5s/25s/125s), timeout 10s, HMAC-SHA256', 'API publique v1 versionnée avec clés API scoped'] },
      { cat: '⚖️ Légal & Compliance', items: ['CGU complètes (13 articles)', 'CGV avec politique de remboursement', 'DPA Article 28 RGPD', 'SLA contractuel (uptime 99,5%, crédit service)', 'Registre des traitements RGPD (Article 30)', 'Politique anti-discrimination avec avertissements in-app', 'Mentions légales avec hébergeur réel (Supabase/AWS Frankfurt)'] },
      { cat: '🌐 Site vitrine', items: ['3 landing pages verticales (/agences-interim, /rh-interne, /cabinets-recrutement)', 'Page comparatif concurrents (/comparatif)', 'Sitemap XML + robots.txt', 'Schema.org JobPosting sur le portail carrières', 'Blog avec intégration CMS Contentful (fallback articles hardcodés)', 'Formulaire contact → CRM via Formspree', 'Crisp chat live, LinkedIn Insight Tag, Meta Pixel (consentement cookies)', 'Démo sandbox "1 clic" avec pré-remplissage credentials'] },
      { cat: '🌍 Internationalisation', items: ['react-i18next complet (fr/en)', 'Composant LanguageSwitcher FR↔EN', 'Formatage dates/nombres selon locale (fr-FR/en-GB)', 'Mapping currency : EUR (FR), GBP (EN)'] },
      { cat: '🧪 Tests & Qualité', items: ['Vitest + Testing Library : 32 tests frontend', 'Jest + SuperTest : 4 suites backend (missions, candidats, applications, multi-tenant)', 'Playwright E2E : auth, navigation, site vitrine, 7 pages légales', 'k6 load tests : smoke (1 VU) + stress (0→100 VUs, seuil p95<300ms)', 'ESLint flat config frontend + backend', 'Prettier + Husky pre-commit hook'] },
    ],
  },
  {
    version: '1.4.0',
    date: '30 juin 2026',
    type: 'feature',
    title: 'Bloc 4 : UX, Design et Performance',
    changes: [
      { cat: '📱 Mobile', items: ['Sidebar drawer mobile avec animation 0.25s', 'Kanban responsive : vue colonne unique sur mobile', 'Touch targets 44px WCAG 2.5.5', 'Swipe-to-delete candidats sur mobile', 'double-tap zoom désactivé (touch-action: manipulation)'] },
      { cat: '⚡ Performance', items: ['pdfjs-dist en lazy loading → app-pages 903kB → 455kB', 'Code splitting par page → chunks 40-110kB (au lieu d\'un monolithe)', 'react-window virtualisation : candidats, CVthèque, pipeline liste', 'React Query : cache 30s, sync fond, invalidation post-mutation, retry×2'] },
      { cat: '✨ UX', items: ['Skeleton shimmer sur les 4 listes principales', 'EmptyState cohérents avec CTA primaire', 'ConfirmDialog modale (22 window.confirm remplacés)', 'Dark mode avec CSS variables', 'Sélecteur de langue FR/EN dans le Navbar', 'Accessibilité : focus trap, skip link, landmarks ARIA'] },
    ],
  },
  {
    version: '1.3.0',
    date: '30 juin 2026',
    type: 'feature',
    title: 'Bloc 3 : Features métier recrutement',
    changes: [
      { cat: '🎯 Recrutement', items: ['Flux d\'approbation missions (recruteur → manager)', 'Offre multi-postes avec compteur postes pourvus', 'Clôture automatique (date dépassée, seuil candidatures)', 'Formulaire candidature multi-étapes public (4 étapes)', 'Questions de pré-sélection configurables + éliminatoires', 'Test de pré-qualification externe (lien)', 'Grille d\'évaluation structurée multi-recruteurs', 'Rapport entretien PDF exportable', 'Partage candidat avec manager (lien sécurisé, avis)', 'Portail candidat suivi candidature (/track/:token)'] },
      { cat: '🔒 Sécurité', items: ['RLS activée sur companies + missions (failles corrigées)', '12 colonnes manquantes candidates/clients ajoutées en migration', 'Table applications migrée vers Supabase (sortie du localStorage)', 'Table evaluations créée avec RLS', 'Tables share_links + tracking_links créées'] },
    ],
  },
  {
    version: '1.2.0',
    date: '30 juin 2026',
    type: 'feature',
    title: 'Bloc 2 : Sécurité',
    changes: [
      { cat: '🔐 Sécurité', items: ['2FA TOTP via Supabase MFA (enroll, confirm, disable, backup codes)', 'Rotation automatique refresh tokens (Supabase GoTrue)', 'Sessions concurrentes : déconnecter toutes les autres', 'Masquage données sensibles dans les logs (winston redactSensitive)', 'Bannière consentement cookies RGPD conforme CNIL (13 mois)', 'Export RGPD ZIP par candidat', 'Export RGPD ZIP par company', 'Droit à l\'oubli automatisé avec cascade + preuve de suppression', 'RLS candidats activée + correctif faille critique (T-218)'] },
    ],
  },
  {
    version: '1.1.0',
    date: '21 avril 2026',
    type: 'feature',
    title: 'Bloc 1 : Infrastructure critique',
    changes: [
      { cat: '🏗️ Infrastructure', items: ['Migration vers Supabase Auth (abandonnement JWT Express custom)', 'MongoDB Atlas configuré', 'Déploiement Vercel frontend', 'HTTPS via Let\'s Encrypt', 'Sentry error tracking', 'CI/CD GitHub Actions'] },
    ],
  },
  {
    version: '1.0.0',
    date: '13 février 2026',
    type: 'release',
    title: 'Lancement initial ATS Ultimate',
    changes: [
      { cat: '🚀 Fonctionnalités initiales', items: ['Dashboard analytics temps réel', 'Pipeline Kanban 6 colonnes avec drag & drop HTML5', 'CVthèque avec recherche et filtres avancés', 'Gestion missions CRUD complète', 'Portail carrières public', 'Scoring IA candidatures', 'Calendrier avec export iCal', 'Gestion équipe et clients', 'Export CSV/PDF'] },
    ],
  },
];

const TYPE_COLORS = {
  major: { bg: '#EDE9FE', color: '#7C3AED', label: 'Majeure' },
  feature: { bg: '#DCFCE7', color: '#16A34A', label: 'Nouveautés' },
  fix: { bg: '#FEF3C7', color: '#D97706', label: 'Correctifs' },
  release: { bg: '#EFF6FF', color: '#2563EB', label: 'Lancement' },
};

export function ChangelogPage() {
  const [expandedVersion, setExpandedVersion] = useState('2.0.0');

  return (
    <div style={{ fontFamily: 'system-ui,sans-serif' }}>
      <SEO
        title="Changelog"
        description="Historique public des mises à jour d'ATS Ultimate, version par version."
        url="https://ats-ultimate.com/changelog"
      />
      <Navbar />

      <section style={{ padding: 'clamp(100px,12vw,140px) clamp(24px,4vw,60px) 60px', background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: '900', marginBottom: '16px' }}>Changelog</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
          Historique des mises à jour et nouvelles fonctionnalités d'ATS Ultimate.
        </p>
      </section>

      <section style={{ padding: 'clamp(48px,6vw,80px) clamp(24px,4vw,60px)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {RELEASES.map(release => {
            const typeStyle = TYPE_COLORS[release.type] || TYPE_COLORS.feature;
            const isExpanded = expandedVersion === release.version;
            return (
              <div key={release.version} style={{ display: 'flex', gap: '24px', marginBottom: '0', paddingBottom: '48px', position: 'relative' }}>
                {/* Timeline line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: typeStyle.color, marginTop: '4px', flexShrink: 0 }} />
                  <div style={{ width: '2px', flex: 1, background: '#E5E7EB', marginTop: '8px' }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '900', fontSize: '20px', color: '#1F2937' }}>v{release.version}</span>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: typeStyle.bg, color: typeStyle.color }}>{typeStyle.label}</span>
                    <span style={{ fontSize: '13px', color: '#9CA3AF' }}>{release.date}</span>
                  </div>
                  <p style={{ fontSize: '15px', color: '#374151', fontWeight: '700', marginBottom: '16px' }}>{release.title}</p>

                  <button onClick={() => setExpandedVersion(isExpanded ? null : release.version)} style={{ fontSize: '13px', color: '#667EEA', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: isExpanded ? '16px' : 0 }}>
                    {isExpanded ? '▲ Masquer les détails' : '▼ Voir les détails'}
                  </button>

                  {isExpanded && (
                    <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '20px', border: '1px solid #E5E7EB' }}>
                      {release.changes.map((group, gi) => (
                        <div key={gi} style={{ marginBottom: gi < release.changes.length - 1 ? '20px' : 0 }}>
                          <div style={{ fontWeight: '800', fontSize: '14px', color: '#374151', marginBottom: '10px' }}>{group.cat}</div>
                          <ul style={{ paddingLeft: '20px', margin: 0 }}>
                            {group.items.map((item, ii) => (
                              <li key={ii} style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.7, marginBottom: '4px' }}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ChangelogPage;
