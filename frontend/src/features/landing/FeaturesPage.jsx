import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { Navbar, Footer } from '@/shared/components/Marketing';
import { SEO } from '@/shared/components/SEO';

/**
 * Page Features - Présentation détaillée et approfondie des fonctionnalités
 * Design cohérent avec la landing page (violet/mauve, badges, métriques)
 */
export function FeaturesPage() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <SEO
        title="Fonctionnalités - ATS Ultimate | Recrutement Intelligent"
        description="Découvrez toutes les fonctionnalités d'ATS Ultimate : IA de matching 87%, Pipeline Kanban, CVthèque intelligente, Automatisation complète, Analytics temps réel."
        url="https://ats-ultimate.com/features"
      />

      {/* NavBar */}
      <Navbar activePage="features" />

      {/* HERO SECTION */}
      <style>{`
        @keyframes featuresHeroGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .featuresHero { animation: none !important; }
        }
      `}</style>
      <section className="featuresHero" style={{
        background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 50%, #667EEA 100%)',
        backgroundSize: '200% 200%',
        animation: 'featuresHeroGradient 8s ease infinite',
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '20px', left: '20px', fontSize: '40px', opacity: 0.6 }}>🚀</div>
        <div style={{ position: 'absolute', top: '15%', right: '10%', fontSize: '50px', opacity: 0.5 }}>⚡</div>
        <div style={{ position: 'absolute', bottom: '15%', left: '8%', fontSize: '45px', opacity: 0.5 }}>✨</div>
        <div style={{ position: 'absolute', bottom: '20%', right: '15%', fontSize: '35px', opacity: 0.6 }}>🎯</div>

        <div style={{ maxWidth: '1200px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-block',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '12px 24px',
            borderRadius: '50px',
            marginBottom: '24px'
          }}>
            <span style={{ color: 'white', fontWeight: '700', fontSize: 'clamp(14px, 2vw, 20px)' }}>
              🏆 Plateforme ATS #1 en France
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: '900',
            color: 'white',
            marginBottom: '24px',
            lineHeight: 1.1,
            textShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            Toutes les fonctionnalités pour<br />
            <span style={{
              background: 'linear-gradient(90deg, #FEC7D7, #FF6B9D)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              recruter plus vite ⚡
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(18px, 2.5vw, 24px)',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '40px',
            maxWidth: '800px',
            margin: '0 auto 40px',
            lineHeight: 1.6
          }}>
            De l'IA de matching à l'automatisation complète, découvrez comment ATS Ultimate transforme votre recrutement en une expérience fluide et efficace.
          </p>

          <button
            onClick={() => navigate(ROUTES.REGISTER)}
            style={{
              padding: '18px 44px',
              fontSize: '18px',
              fontWeight: '800',
              color: '#764BA2',
              background: 'white',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
            }}
          >
            🚀 Démarrer gratuitement
          </button>

          {/* Quick metrics */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            flexWrap: 'wrap',
            marginTop: '50px'
          }}>
            {[
              { icon: '⚡', value: '10x', label: 'Plus rapide' },
              { icon: '🎯', value: '87%', label: 'Match IA' },
              { icon: '⭐', value: '500+', label: 'Clients' }
            ].map((metric, i) => (
              <div key={i} style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                padding: '24px 40px',
                borderRadius: '20px',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{metric.icon}</div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: 'white' }}>{metric.value}</div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN FEATURES SECTIONS */}
      <div style={{ background: '#F9FAFB' }}>

        {/* 1. IA DE MATCHING */}
        <section style={{ padding: '100px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
            <div>
              <div style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '50px',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '20px'
              }}>
                🤖 Intelligence Artificielle
              </div>
              <h2 style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: '900',
                color: '#1F2937',
                marginBottom: '20px',
                lineHeight: 1.2
              }}>
                Matching IA ultra-précis à <span style={{ color: '#667EEA' }}>87%</span>
              </h2>
              <p style={{ fontSize: '18px', color: '#6B7280', lineHeight: 1.7, marginBottom: '30px' }}>
                Notre algorithme d'IA analyse automatiquement chaque CV et calcule un score de compatibilité avec vos offres. Gagnez des heures de tri manuel et concentrez-vous sur les meilleurs candidats.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: '🎯', text: 'Analyse sémantique des compétences' },
                  { icon: '📊', text: 'Score de compatibilité en temps réel' },
                  { icon: '🔍', text: 'Détection automatique des mots-clés' },
                  { icon: '⚡', text: 'Tri intelligent par pertinence' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      {item.icon}
                    </div>
                    <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #667EEA15 0%, #764BA215 100%)',
              borderRadius: '24px',
              padding: '40px',
              border: '2px solid #667EEA30'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#1F2937' }}>
                  Exemple de scoring IA
                </h3>
                {[
                  // Lighthouse (2026-07-06) : `color` reste la teinte claire décorative de la
                  // barre de progression ; `textColor` (plus foncé, ratio >= 4.5:1 sur blanc)
                  // est utilisé pour le pourcentage texte à côté, qui doit rester lisible WCAG AA.
                  { name: 'Marie Dupont', score: 92, color: '#10B981', textColor: '#047857' },
                  { name: 'Pierre Martin', score: 87, color: '#34D399', textColor: '#047857' },
                  { name: 'Sophie Laurent', score: 78, color: '#FBBF24', textColor: '#92400E' },
                  { name: 'Jean Dubois', score: 65, color: '#F59E0B', textColor: '#92400E' }
                ].map((candidate, i) => (
                  <div key={i} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{candidate.name}</span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: candidate.textColor }}>{candidate.score}%</span>
                    </div>
                    <div style={{
                      height: '8px',
                      background: '#E5E7EB',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${candidate.score}%`,
                        height: '100%',
                        background: candidate.color,
                        borderRadius: '10px',
                        transition: 'width 1s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2. PIPELINE KANBAN */}
        <section style={{ padding: '100px 20px', maxWidth: '1200px', margin: '0 auto', background: 'white', borderRadius: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
            <div style={{ order: 2 }}>
              <div style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #FF6B9D 0%, #FEC7D7 100%)',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '50px',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '20px'
              }}>
                📊 Gestion Visuelle
              </div>
              <h2 style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: '900',
                color: '#1F2937',
                marginBottom: '20px',
                lineHeight: 1.2
              }}>
                Pipeline Kanban intuitif en drag & drop
              </h2>
              <p style={{ fontSize: '18px', color: '#6B7280', lineHeight: 1.7, marginBottom: '30px' }}>
                Visualisez et gérez toutes vos candidatures en un coup d'œil. Déplacez les candidats d'une étape à l'autre par simple glisser-déposer. Workflow 100% personnalisable.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {[
                  { icon: '🎨', title: 'Colonnes personnalisables', desc: 'Adaptez le workflow à vos besoins' },
                  { icon: '👆', title: 'Drag & Drop fluide', desc: 'Interface ultra-réactive' },
                  { icon: '🏷️', title: 'Tags et filtres', desc: 'Organisation avancée' },
                  { icon: '📱', title: '100% Responsive', desc: 'Fonctionne sur mobile' }
                ].map((feature, i) => (
                  <div key={i} style={{
                    background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '2px solid #E5E7EB'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>{feature.icon}</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937', marginBottom: '6px' }}>{feature.title}</div>
                    <div style={{ fontSize: '14px', color: '#6B7280' }}>{feature.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ order: 1 }}>
              <div style={{
                background: 'linear-gradient(135deg, #FF6B9D15 0%, #FEC7D715 100%)',
                borderRadius: '24px',
                padding: '30px',
                border: '2px solid #FF6B9D30'
              }}>
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto' }}>
                  {['Nouveau', 'Qualifié', 'Entretien', 'Offre'].map((stage, i) => (
                    <div key={i} style={{
                      minWidth: '180px',
                      background: 'white',
                      borderRadius: '12px',
                      padding: '16px'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#1F2937',
                        marginBottom: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        {stage}
                        <span style={{
                          background: '#E5E7EB',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {[4, 3, 2, 1][i]}
                        </span>
                      </div>
                      {Array(i === 0 ? 3 : i === 1 ? 2 : i === 2 ? 1 : 0).fill(0).map((_, j) => (
                        <div key={j} style={{
                          background: '#F9FAFB',
                          borderRadius: '8px',
                          padding: '12px',
                          marginBottom: '8px',
                          border: '1px solid #E5E7EB'
                        }}>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Candidat {j + 1}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. CVTHÈQUE INTELLIGENTE */}
        <section style={{ padding: '100px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '50px',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '20px'
            }}>
              👥 Base de Talents
            </div>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: '900',
              color: '#1F2937',
              marginBottom: '20px'
            }}>
              CVthèque centralisée et intelligente
            </h2>
            <p style={{ fontSize: '18px', color: '#6B7280', maxWidth: '600px', margin: '0 auto' }}>
              Tous vos talents dans une seule base de données. Recherche ultra-rapide, filtres avancés, et suggestions intelligentes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {[
              { icon: '🔍', title: 'Recherche Instantanée', desc: 'Trouvez le bon candidat en secondes' },
              { icon: '🏷️', title: 'Tags Personnalisés', desc: 'Organisez vos talents comme vous voulez' },
              { icon: '📂', title: 'Import Automatique', desc: 'Parsing intelligent des CV' },
              { icon: '🔄', title: 'Sync Multi-sources', desc: 'LinkedIn, Indeed, Apec...' },
              { icon: '⭐', title: 'Notes & Évaluations', desc: 'Historique complet des interactions' },
              { icon: '🚀', title: 'Export Flexible', desc: 'CSV, Excel, PDF en un clic' }
            ].map((feature, i) => (
              <div key={i} style={{
                background: 'white',
                padding: '30px',
                borderRadius: '20px',
                border: '2px solid #E5E7EB',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#4ECDC4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  marginBottom: '20px'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937', marginBottom: '12px' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. AUTOMATISATION */}
        <section style={{
          padding: '100px 20px',
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'linear-gradient(135deg, #F59E0B15 0%, #FBBF2415 100%)',
          borderRadius: '40px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '50px',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '20px'
            }}>
              ⚙️ Automatisation
            </div>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: '900',
              color: '#1F2937',
              marginBottom: '20px'
            }}>
              Automatisez jusqu'à <span style={{ color: '#F59E0B' }}>80%</span> de votre processus
            </h2>
            <p style={{ fontSize: '18px', color: '#6B7280', maxWidth: '700px', margin: '0 auto' }}>
              Laissez l'IA gérer les tâches répétitives pendant que vous vous concentrez sur l'humain. Emails, relances, planification, tout est automatisé.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {[
              {
                icon: '✉️',
                title: 'Emails Automatiques',
                tasks: ['Accusé de réception', 'Relances candidats', 'Invitations entretien', 'Feedbacks personnalisés']
              },
              {
                icon: '📅',
                title: 'Planification Intelligente',
                tasks: ['Proposition de créneaux', 'Sync Google/Outlook', 'Rappels automatiques', 'Gestion des annulations']
              },
              {
                icon: '📊',
                title: 'Reporting Automatique',
                tasks: ['KPIs hebdomadaires', 'Dashboards temps réel', 'Alertes personnalisées', 'Export programmés']
              }
            ].map((section, i) => (
              <div key={i} style={{
                background: 'white',
                padding: '40px',
                borderRadius: '24px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  marginBottom: '24px'
                }}>
                  {section.icon}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#1F2937', marginBottom: '20px' }}>
                  {section.title}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {section.tasks.map((task, j) => (
                    <li key={j} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px',
                      fontSize: '15px',
                      color: '#374151'
                    }}>
                      <span style={{ color: '#F59E0B', fontSize: '18px' }}>✓</span>
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 5. ANALYTICS */}
        <section style={{ padding: '100px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
            <div>
              <div style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '50px',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '20px'
              }}>
                📈 Analytics
              </div>
              <h2 style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: '900',
                color: '#1F2937',
                marginBottom: '20px',
                lineHeight: 1.2
              }}>
                Pilotez votre recrutement avec des données temps réel
              </h2>
              <p style={{ fontSize: '18px', color: '#6B7280', lineHeight: 1.7, marginBottom: '30px' }}>
                Dashboards personnalisables, KPIs précis, rapports détaillés. Prenez des décisions data-driven pour améliorer continuellement votre performance.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { metric: 'Temps moyen de recrutement', value: '-45%', trend: '↓' },
                  { metric: 'Taux de conversion', value: '+32%', trend: '↑' },
                  { metric: 'Coût par embauche', value: '-€2,400', trend: '↓' },
                  { metric: 'Satisfaction candidats', value: '4.8/5', trend: '↑' }
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px',
                    background: 'white',
                    borderRadius: '12px',
                    border: '2px solid #E5E7EB'
                  }}>
                    <span style={{ fontSize: '15px', color: '#374151', fontWeight: '500' }}>{item.metric}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Lighthouse (2026-07-06) : #10B981 sur blanc ne passait pas le
                          contraste WCAG AA (~2.54:1) — #047857 passe (~5.5:1). */}
                      <span style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: item.trend === '↑' ? '#047857' : '#047857'
                      }}>
                        {item.value}
                      </span>
                      <span style={{ fontSize: '28px', color: item.trend === '↑' ? '#047857' : '#047857' }}>
                        {item.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #10B98115 0%, #34D39915 100%)',
              borderRadius: '24px',
              padding: '40px',
              border: '2px solid #10B98130'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', color: '#1F2937' }}>
                  Dashboard Temps Réel
                </h3>
                {[
                  { label: 'Offres actives', value: 24, icon: '📋' },
                  { label: 'Candidatures reçues', value: 156, icon: '👥' },
                  { label: 'Entretiens planifiés', value: 32, icon: '📅' },
                  { label: 'Offres envoyées', value: 8, icon: '🎯' }
                ].map((stat, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: i < 3 ? '1px solid #E5E7EB' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>{stat.label}</span>
                    </div>
                    <span style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937' }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{
          padding: '100px 20px',
          maxWidth: '900px',
          margin: '0 auto',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
          borderRadius: '40px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '50px', opacity: 0.3 }}>⚡</div>
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', fontSize: '45px', opacity: 0.3 }}>🚀</div>

          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: '900',
            color: 'white',
            marginBottom: '24px',
            position: 'relative',
            zIndex: 1
          }}>
            Prêt à transformer votre recrutement ?
          </h2>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px',
            position: 'relative',
            zIndex: 1
          }}>
            Rejoignez les 500+ entreprises qui recrutent déjà 10x plus vite avec ATS Ultimate
          </p>

          <button
            onClick={() => navigate(ROUTES.REGISTER)}
            style={{
              padding: '20px 50px',
              fontSize: '18px',
              fontWeight: '700',
              // Lighthouse (2026-07-06) : #667EEA sur blanc ne passe pas le contraste
              // WCAG AA (~3.65:1) — #764BA2 passe (~6.5:1), même famille de couleur.
              color: '#764BA2',
              background: 'white',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              transition: 'all 0.3s',
              position: 'relative',
              zIndex: 1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
            }}
          >
            🚀 Démarrer maintenant
          </button>

          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginTop: '20px',
            position: 'relative',
            zIndex: 1
          }}>
            Sans engagement • Support 7j/7
          </p>
        </section>
      </div>

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}

export default FeaturesPage;
