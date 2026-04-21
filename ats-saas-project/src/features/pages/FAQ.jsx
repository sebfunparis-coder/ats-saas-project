import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

/**
 * Page FAQ (Foire Aux Questions)
 */
export function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const containerStyles = { minHeight: '100vh', background: 'linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%)', padding: '120px 40px 80px' };
  const maxWidthStyles = { maxWidth: '900px', margin: '0 auto' };
  const titleStyles = { fontSize: '48px', fontWeight: '900', marginBottom: '12px', textAlign: 'center', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };

  const faqs = [
    {
      category: '🚀 Démarrage',
      questions: [
        { q: 'Comment créer un compte ?', a: 'Cliquez sur "Essayer Gratuitement" sur la page d\'accueil. Remplissez le formulaire avec vos informations professionnelles. Vous recevrez un email de confirmation pour activer votre compte.' },
        { q: 'Quelle est la durée de l\'essai gratuit ?', a: 'L\'essai gratuit dure 14 jours, sans carte bancaire requise. Vous avez accès à toutes les fonctionnalités premium pendant cette période.' },
        { q: 'Puis-je importer mes candidats existants ?', a: 'Oui ! Vous pouvez importer vos candidats via fichier CSV ou Excel. Nous proposons également une API pour les intégrations personnalisées.' }
      ]
    },
    {
      category: '💰 Tarifs & Abonnement',
      questions: [
        { q: 'Quels sont les plans tarifaires ?', a: 'Nous proposons 3 plans : Starter (29€/mois), Professional (99€/mois), et Enterprise (sur devis). Tous incluent un essai gratuit de 14 jours.' },
        { q: 'Puis-je changer de plan à tout moment ?', a: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.' },
        { q: 'Y a-t-il des frais cachés ?', a: 'Non, aucun frais caché. Le prix affiché est le prix final (hors taxes applicables).' }
      ]
    },
    {
      category: '🔒 Sécurité & Données',
      questions: [
        { q: 'Mes données sont-elles sécurisées ?', a: 'Oui ! Nous utilisons un chiffrement SSL/TLS, hébergement sécurisé en France (OVHcloud), et sauvegardes quotidiennes. Nous sommes conformes RGPD.' },
        { q: 'Où sont stockées mes données ?', a: 'Toutes vos données sont hébergées en France sur des serveurs OVHcloud certifiés ISO 27001.' },
        { q: 'Puis-je exporter mes données ?', a: 'Oui, vous pouvez exporter toutes vos données à tout moment en CSV, JSON ou Excel.' }
      ]
    },
    {
      category: '🎯 Fonctionnalités',
      questions: [
        { q: 'Comment fonctionne le scoring IA ?', a: 'Notre IA analyse automatiquement les CV et attribue un score de matching basé sur les compétences, l\'expérience et les critères de la mission. Précision de 87%.' },
        { q: 'Puis-je collaborer avec mon équipe ?', a: 'Oui ! Invitez vos collègues, assignez des candidats, commentez, et suivez l\'activité en temps réel.' },
        { q: 'Y a-t-il une application mobile ?', a: 'L\'interface est responsive et optimisée pour mobile. Une application native iOS/Android est prévue pour 2026.' }
      ]
    },
    {
      category: '💬 Support',
      questions: [
        { q: 'Comment contacter le support ?', a: 'Email : support@ats-ultimate.com (réponse sous 24h). Chat en direct disponible pour les plans Professional et Enterprise.' },
        { q: 'Y a-t-il des formations disponibles ?', a: 'Oui ! Webinaires gratuits chaque semaine + documentation complète + tutoriels vidéo.' },
        { q: 'Puis-je annuler mon abonnement ?', a: 'Oui, vous pouvez annuler à tout moment depuis votre compte. Aucun engagement de durée.' }
      ]
    }
  ];

  return (
    <div style={containerStyles}>
      <div style={maxWidthStyles}>
        <button onClick={() => navigate(ROUTES.LANDING)} style={{ marginBottom: '32px', padding: '12px 24px', background: '#EEF2FF', color: '#667EEA', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
          ← Retour à l'accueil
        </button>

        <h1 style={titleStyles}>Questions Fréquentes</h1>
        <p style={{ textAlign: 'center', fontSize: '18px', color: '#6B7280', marginBottom: '64px' }}>
          Trouvez rapidement les réponses à vos questions
        </p>

        {faqs.map((category, catIndex) => (
          <div key={catIndex} style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '24px', color: '#1F2937' }}>
              {category.category}
            </h2>

            {category.questions.map((faq, qIndex) => {
              const globalIndex = `${catIndex}-${qIndex}`;
              const isOpen = openIndex === globalIndex;

              return (
                <div
                  key={qIndex}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    marginBottom: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                    border: '2px solid',
                    borderColor: isOpen ? '#667EEA' : 'transparent',
                    transition: 'all 0.3s'
                  }}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                    style={{
                      width: '100%',
                      padding: '24px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#1F2937',
                      textAlign: 'left'
                    }}
                  >
                    <span>❓ {faq.q}</span>
                    <span style={{ fontSize: '24px', transition: 'transform 0.3s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                      ▼
                    </span>
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 24px 24px', fontSize: '16px', lineHeight: '1.8', color: '#4B5563' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        <div style={{ marginTop: '64px', padding: '32px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', borderRadius: '20px', textAlign: 'center', color: 'white' }}>
          <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px' }}>Vous ne trouvez pas votre réponse ?</h3>
          <p style={{ fontSize: '18px', marginBottom: '24px', opacity: 0.9 }}>Notre équipe est là pour vous aider !</p>
          <button onClick={() => navigate('/contact')} style={{ padding: '16px 32px', background: 'white', color: '#667EEA', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            💬 Nous contacter
          </button>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
