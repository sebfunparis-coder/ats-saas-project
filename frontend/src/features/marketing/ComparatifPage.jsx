import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '@/shared/components/Marketing';
import { SEO } from '@/shared/components/SEO';

// T-298 — Comparatif concurrents
// Données basées sur informations publiques des sites officiels (06/2026).
// À réviser si les tarifs/features évoluent.

const FEATURES = [
  { category: 'Core', items: [
    'Pipeline Kanban',
    'Import CV (parsing IA)',
    'Multi-poste par mission',
    'CVthèque avec recherche sémantique',
    'Portail carrières public',
    'Formulaire candidature multi-étapes',
  ]},
  { category: 'Collaboration', items: [
    'Grille d\'évaluation structurée',
    'Partage candidat avec manager',
    'Workflow approbation mission',
    'Suivi candidature pour candidat',
  ]},
  { category: 'Analytics & SEO', items: [
    'Analytics recrutement (funnel, TTH)',
    'Export PDF rapport entretien',
    'Schema.org JobPosting',
    'Sitemap automatique',
  ]},
  { category: 'Conformité & Sécurité', items: [
    'RGPD natif (consentement, droit oubli)',
    'Export RGPD ZIP par candidat',
    'RLS multi-tenant Supabase',
    'Logs d\'audit impersonation',
  ]},
  { category: 'Tarif de départ', items: ['Prix de départ'] },
];

const COMPETITORS = [
  {
    name: 'ATS Ultimate',
    logo: '⚡',
    tagline: 'Le plus complet au meilleur prix',
    price: '29,90 €/mois',
    highlight: true,
    data: {
      'Pipeline Kanban': '✅',
      'Import CV (parsing IA)': '✅',
      'Multi-poste par mission': '✅',
      'CVthèque avec recherche sémantique': '✅',
      'Portail carrières public': '✅',
      'Formulaire candidature multi-étapes': '✅',
      'Grille d\'évaluation structurée': '✅',
      'Partage candidat avec manager': '✅',
      'Workflow approbation mission': '✅',
      'Suivi candidature pour candidat': '✅',
      'Analytics recrutement (funnel, TTH)': '✅',
      'Export PDF rapport entretien': '✅',
      'Schema.org JobPosting': '✅',
      'Sitemap automatique': '✅',
      'RGPD natif (consentement, droit oubli)': '✅',
      'Export RGPD ZIP par candidat': '✅',
      'RLS multi-tenant Supabase': '✅',
      'Logs d\'audit impersonation': '✅',
      'Prix de départ': '29,90 €/mois',
    },
  },
  {
    name: 'Flatchr',
    logo: '🟦',
    tagline: 'Simple mais limité',
    price: '€99/mois',
    data: {
      'Pipeline Kanban': '✅',
      'Import CV (parsing IA)': '✅',
      'Multi-poste par mission': '❌',
      'CVthèque avec recherche sémantique': '⚠️ Basique',
      'Portail carrières public': '✅',
      'Formulaire candidature multi-étapes': '❌',
      'Grille d\'évaluation structurée': '⚠️ Basique',
      'Partage candidat avec manager': '✅',
      'Workflow approbation mission': '❌',
      'Suivi candidature pour candidat': '❌',
      'Analytics recrutement (funnel, TTH)': '⚠️ Basique',
      'Export PDF rapport entretien': '❌',
      'Schema.org JobPosting': '❌',
      'Sitemap automatique': '❌',
      'RGPD natif (consentement, droit oubli)': '⚠️ Partiel',
      'Export RGPD ZIP par candidat': '❌',
      'RLS multi-tenant Supabase': '❌',
      'Logs d\'audit impersonation': '❌',
      'Prix de départ': '€99/mois',
    },
  },
  {
    name: 'Taleez',
    logo: '🟩',
    tagline: 'Bon produit, prix élevé',
    price: '€149/mois',
    data: {
      'Pipeline Kanban': '✅',
      'Import CV (parsing IA)': '✅',
      'Multi-poste par mission': '✅',
      'CVthèque avec recherche sémantique': '✅',
      'Portail carrières public': '✅',
      'Formulaire candidature multi-étapes': '⚠️ Basique',
      'Grille d\'évaluation structurée': '✅',
      'Partage candidat avec manager': '✅',
      'Workflow approbation mission': '✅',
      'Suivi candidature pour candidat': '❌',
      'Analytics recrutement (funnel, TTH)': '✅',
      'Export PDF rapport entretien': '❌',
      'Schema.org JobPosting': '⚠️ Partiel',
      'Sitemap automatique': '⚠️ Partiel',
      'RGPD natif (consentement, droit oubli)': '✅',
      'Export RGPD ZIP par candidat': '⚠️ Partiel',
      'RLS multi-tenant Supabase': '❌',
      'Logs d\'audit impersonation': '❌',
      'Prix de départ': '€149/mois',
    },
  },
  {
    name: 'Beetween',
    logo: '🟧',
    tagline: 'Spécialisé multidiffusion',
    price: '€199/mois',
    data: {
      'Pipeline Kanban': '✅',
      'Import CV (parsing IA)': '⚠️ Basique',
      'Multi-poste par mission': '❌',
      'CVthèque avec recherche sémantique': '⚠️ Basique',
      'Portail carrières public': '✅',
      'Formulaire candidature multi-étapes': '⚠️ Basique',
      'Grille d\'évaluation structurée': '⚠️ Basique',
      'Partage candidat avec manager': '✅',
      'Workflow approbation mission': '✅',
      'Suivi candidature pour candidat': '❌',
      'Analytics recrutement (funnel, TTH)': '✅',
      'Export PDF rapport entretien': '❌',
      'Schema.org JobPosting': '❌',
      'Sitemap automatique': '❌',
      'RGPD natif (consentement, droit oubli)': '✅',
      'Export RGPD ZIP par candidat': '❌',
      'RLS multi-tenant Supabase': '❌',
      'Logs d\'audit impersonation': '❌',
      'Prix de départ': '€199/mois',
    },
  },
  {
    name: 'Recruitee',
    logo: '🟪',
    tagline: 'Complet mais complexe',
    price: '€189/mois',
    data: {
      'Pipeline Kanban': '✅',
      'Import CV (parsing IA)': '✅',
      'Multi-poste par mission': '✅',
      'CVthèque avec recherche sémantique': '✅',
      'Portail carrières public': '✅',
      'Formulaire candidature multi-étapes': '✅',
      'Grille d\'évaluation structurée': '✅',
      'Partage candidat avec manager': '✅',
      'Workflow approbation mission': '✅',
      'Suivi candidature pour candidat': '⚠️ Basique',
      'Analytics recrutement (funnel, TTH)': '✅',
      'Export PDF rapport entretien': '✅',
      'Schema.org JobPosting': '⚠️ Partiel',
      'Sitemap automatique': '❌',
      'RGPD natif (consentement, droit oubli)': '✅',
      'Export RGPD ZIP par candidat': '⚠️ Partiel',
      'RLS multi-tenant Supabase': '❌',
      'Logs d\'audit impersonation': '❌',
      'Prix de départ': '€189/mois',
    },
  },
];

const CELL_COLOR = {
  '✅': '#ECFDF5',
  '❌': '#FEF2F2',
  '⚠️ Basique': '#FFFBEB',
  '⚠️ Partiel': '#FFFBEB',
};

export function ComparatifPage() {
  const [highlightOnly, setHighlightOnly] = useState(false);

  const allFeatures = FEATURES.flatMap(g => g.items);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <SEO
        title="Comparatif ATS — ATS Ultimate vs Flatchr vs Taleez vs Beetween vs Recruitee"
        description="Comparez ATS Ultimate avec les principaux ATS du marché français. Fonctionnalités, prix, RGPD. Découvrez pourquoi ATS Ultimate est le meilleur rapport qualité-prix."
        url="https://ats-ultimate.com/comparatif"
      />
      <Navbar activePage="landing" />

      {/* Hero */}
      <section style={{
        padding: 'clamp(100px, 12vw, 140px) clamp(24px, 4vw, 60px) clamp(48px, 6vw, 80px)',
        background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
        color: 'white',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '6px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', marginBottom: '24px' }}>
            🏆 Comparatif ATS 2026
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '900', marginBottom: '20px' }}>
            Pourquoi choisir ATS Ultimate plutôt que la concurrence ?
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '36px', lineHeight: 1.6 }}>
            Fonctionnalités comparées, prix transparents, pas de langue de bois.
            Informations issues des sites officiels — dernière mise à jour : juillet 2026.
          </p>
          <Link to="/register" style={{ display: 'inline-block', padding: '16px 36px', background: 'white', color: '#667EEA', borderRadius: '12px', fontWeight: '800', fontSize: '16px', textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
            Démarrer maintenant →
          </Link>
        </div>
      </section>

      {/* Avantages clés en résumé */}
      <section style={{ padding: 'clamp(48px, 6vw, 72px) clamp(24px, 4vw, 60px)', background: '#F9FAFB' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: '900', color: '#1F2937', marginBottom: '8px' }}>
            Ce que vous n'aurez qu'avec ATS Ultimate
          </h2>
          <p style={{ textAlign: 'center', color: '#6B7280', marginBottom: '40px', fontSize: '15px' }}>
            Des fonctionnalités absentes ou basiques chez nos concurrents.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {[
              { icon: '🔒', title: 'RGPD intégral', text: 'Export ZIP par candidat, logs d\'audit, consentement trackable — pas juste une page "politique RGPD".' },
              { icon: '📋', title: 'Formulaire multi-étapes', text: 'Wizard 4 étapes (profil → CV → questions → test) sur le portail public, configurable par mission.' },
              { icon: '🎯', title: 'Tracking candidat', text: 'Le candidat suit l\'avancement de sa candidature via un lien sécurisé, sans créer de compte.' },
              { icon: '🔗', title: 'Partage manager sécurisé', text: 'Envoyez un lien tokenisé (7 jours) au manager pour recueillir son avis sur un profil.' },
              { icon: '🏷️', title: 'JobPosting Schema.org', text: 'Vos offres sont éligibles aux Rich Results Google (offres d\'emploi enrichies dans les SERP).' },
              { icon: '€', title: 'Prix imbattable', text: 'Toutes ces fonctionnalités à partir de 29,90€/mois — 3 à 4× moins cher qu\'un concurrent équivalent.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
                <div style={{ fontWeight: '800', fontSize: '16px', color: '#1F2937', marginBottom: '8px' }}>{item.title}</div>
                <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tableau comparatif */}
      <section style={{ padding: 'clamp(48px, 6vw, 72px) clamp(24px, 4vw, 40px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: '900', color: '#1F2937' }}>
              Comparatif fonctionnel détaillé
            </h2>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={highlightOnly}
                onChange={e => setHighlightOnly(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              Voir uniquement les différences
            </label>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '800', color: '#374151', fontSize: '14px', borderBottom: '2px solid #E5E7EB', minWidth: '220px' }}>
                    Fonctionnalité
                  </th>
                  {COMPETITORS.map((c, i) => (
                    <th key={i} style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontWeight: '800',
                      fontSize: '14px',
                      borderBottom: '2px solid #E5E7EB',
                      background: c.highlight ? '#667EEA' : '#F9FAFB',
                      color: c.highlight ? 'white' : '#374151',
                      minWidth: '130px',
                    }}>
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{c.logo}</div>
                      {c.name}
                      {c.highlight && <div style={{ fontSize: '11px', fontWeight: '600', opacity: 0.85, marginTop: '2px' }}>✓ Recommandé</div>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((group, gi) => (
                  <React.Fragment key={gi}>
                    <tr>
                      <td colSpan={COMPETITORS.length + 1} style={{ background: '#F3F4F6', padding: '10px 20px', fontSize: '12px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {group.category}
                      </td>
                    </tr>
                    {group.items.map((feature, fi) => {
                      const values = COMPETITORS.map(c => c.data[feature] || '—');
                      const isAllSame = values.every(v => v === values[0]);
                      if (highlightOnly && isAllSame) return null;
                      return (
                        <tr key={fi} style={{ borderBottom: '1px solid #F3F4F6' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}>
                          <td style={{ padding: '12px 20px', fontSize: '14px', color: '#374151', fontWeight: '600' }}>{feature}</td>
                          {COMPETITORS.map((c, ci) => {
                            const val = c.data[feature] || '—';
                            const isPrice = group.category === 'Tarif de départ';
                            return (
                              <td key={ci} style={{
                                padding: '12px 8px',
                                textAlign: 'center',
                                fontSize: '13px',
                                fontWeight: c.highlight ? '700' : '500',
                                background: c.highlight ? '#667EEA10' : (CELL_COLOR[val] || 'white'),
                                color: c.highlight ? '#1F2937' : '#374151',
                              }}>
                                {isPrice ? <strong style={{ color: c.highlight ? '#667EEA' : '#374151' }}>{val}</strong> : val}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ marginTop: '16px', fontSize: '12px', color: '#9CA3AF', textAlign: 'center' }}>
            Sources : sites officiels de chaque éditeur · Juillet 2026 · ✅ = inclus · ⚠️ = fonctionnalité limitée · ❌ = absent ou en option payante
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(24px, 4vw, 60px)', background: 'linear-gradient(135deg, #667EEA15, #764BA215)', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '900', color: '#1F2937', marginBottom: '16px' }}>
            Convaincant ? Voyez par vous-même.
          </h2>
          <p style={{ color: '#6B7280', marginBottom: '32px', lineHeight: 1.6 }}>
            Sans engagement, résiliation à tout moment. Prenez le temps de juger par vous-même.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ padding: '16px 36px', background: 'linear-gradient(135deg, #667EEA, #764BA2)', color: 'white', borderRadius: '14px', fontWeight: '800', fontSize: '16px', textDecoration: 'none', boxShadow: '0 8px 24px rgba(102,126,234,0.4)' }}>
              Démarrer maintenant →
            </Link>
            <Link to="/demo" style={{ padding: '16px 36px', background: 'white', color: '#374151', borderRadius: '14px', fontWeight: '700', fontSize: '16px', textDecoration: 'none', border: '2px solid #E5E7EB' }}>
              Voir la démo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ComparatifPage;
