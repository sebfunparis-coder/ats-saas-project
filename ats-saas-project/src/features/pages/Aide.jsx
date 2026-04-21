import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

/**
 * Page Centre d'Aide
 */
export function Aide() {
  const navigate = useNavigate();

  const containerStyles = { minHeight: '100vh', background: 'linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%)', padding: '120px 40px 80px' };
  const maxWidthStyles = { maxWidth: '1200px', margin: '0 auto' };
  const titleStyles = { fontSize: '56px', fontWeight: '900', marginBottom: '24px', textAlign: 'center', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };

  const categories = [
    {
      icon: '🚀',
      title: 'Premiers Pas',
      desc: 'Commencez avec ATS Ultimate',
      articles: [
        'Créer votre compte',
        'Configurer votre profil',
        'Inviter votre équipe',
        'Importer vos candidats'
      ]
    },
    {
      icon: '📊',
      title: 'Gestion Candidats',
      desc: 'Optimisez votre pipeline',
      articles: [
        'Ajouter un candidat',
        'Utiliser le scoring IA',
        'Organiser les candidatures',
        'Exporter les données'
      ]
    },
    {
      icon: '💼',
      title: 'Missions & Offres',
      desc: 'Publiez vos postes',
      articles: [
        'Créer une mission',
        'Diffuser une offre',
        'Gérer les candidatures',
        'Suivre les statistiques'
      ]
    },
    {
      icon: '👥',
      title: 'Collaboration',
      desc: 'Travaillez en équipe',
      articles: [
        'Inviter des membres',
        'Gérer les permissions',
        'Partager des candidats',
        'Communiquer efficacement'
      ]
    },
    {
      icon: '📈',
      title: 'Analytics & Reporting',
      desc: 'Mesurez vos performances',
      articles: [
        'Tableaux de bord',
        'Rapports personnalisés',
        'KPIs de recrutement',
        'Exporter les analyses'
      ]
    },
    {
      icon: '⚙️',
      title: 'Paramètres',
      desc: 'Personnalisez votre espace',
      articles: [
        'Gérer mon compte',
        'Configurer les notifications',
        'Sécurité & confidentialité',
        'Intégrations tierces'
      ]
    }
  ];

  return (
    <div style={containerStyles}>
      <div style={maxWidthStyles}>
        <button onClick={() => navigate(ROUTES.LANDING)} style={{ marginBottom: '32px', padding: '12px 24px', background: '#EEF2FF', color: '#667EEA', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
          ← Retour à l'accueil
        </button>

        <h1 style={titleStyles}>Centre d'Aide</h1>
        <p style={{ textAlign: 'center', fontSize: '20px', color: '#6B7280', marginBottom: '48px' }}>
          Tout ce dont vous avez besoin pour maîtriser ATS Ultimate
        </p>

        {/* Barre de recherche */}
        <div style={{ maxWidth: '700px', margin: '0 auto 64px' }}>
          <input
            type="search"
            placeholder="🔍 Rechercher dans la documentation..."
            style={{
              width: '100%',
              padding: '20px 24px',
              fontSize: '18px',
              border: '2px solid #E5E7EB',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
            }}
          />
        </div>

        {/* Catégories */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', marginBottom: '64px' }}>
          {categories.map((cat, i) => (
            <div
              key={i}
              style={{
                background: 'white',
                padding: '40px',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = '#667EEA';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(102, 126, 234, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>{cat.icon}</div>
              <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', color: '#1F2937' }}>{cat.title}</h3>
              <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '24px' }}>{cat.desc}</p>

              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '20px' }}>
                {cat.articles.map((article, j) => (
                  <div key={j} style={{ padding: '10px 0', color: '#667EEA', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                    → {article}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Ressources populaires */}
        <div style={{ background: 'white', padding: '64px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '40px', color: '#1F2937', textAlign: 'center' }}>📚 Ressources Populaires</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            {[
              { title: 'Guide de démarrage rapide', views: '12.5k vues', icon: '🚀' },
              { title: 'Comment utiliser le scoring IA', views: '8.2k vues', icon: '🤖' },
              { title: 'Meilleures pratiques de recrutement', views: '6.8k vues', icon: '💡' },
              { title: 'Tutoriel vidéo complet', views: '5.4k vues', icon: '🎥' }
            ].map((resource, i) => (
              <div
                key={i}
                style={{
                  padding: '24px',
                  background: '#F9FAFB',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#EEF2FF'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#F9FAFB'}
              >
                <div style={{ fontSize: '40px' }}>{resource.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>{resource.title}</div>
                  <div style={{ fontSize: '14px', color: '#6B7280' }}>{resource.views}</div>
                </div>
                <div style={{ fontSize: '24px', color: '#667EEA' }}>→</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact support */}
        <div style={{ background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', padding: '64px', borderRadius: '24px', textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '20px' }}>Besoin d'aide supplémentaire ?</h2>
          <p style={{ fontSize: '20px', marginBottom: '32px', opacity: 0.9 }}>Notre équipe support est là pour vous</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={() => navigate('/contact')} style={{ padding: '16px 32px', background: 'white', color: '#667EEA', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '18px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
              💬 Contacter le support
            </button>
            <button onClick={() => navigate('/faq')} style={{ padding: '16px 32px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid white', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '18px' }}>
              📚 Voir la FAQ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Aide;
