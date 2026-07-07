import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { Navbar, Footer } from '@/shared/components/Marketing';
import { Accordion } from '@/shared/components/UI';
import { SEO } from '@/shared/components/SEO';
import styles from './FAQPage.module.css';

/**
 * Page FAQ - Questions fréquentes par catégories
 * Utilise l'Accordion pour une navigation fluide
 */
export function FAQPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: '🌟 Toutes', color: '#667EEA' },
    { id: 'general', label: '💡 Général', color: '#10B981' },
    { id: 'pricing', label: '💰 Tarifs', color: '#F59E0B' },
    { id: 'features', label: '⚡ Fonctionnalités', color: '#8B5CF6' },
    { id: 'technical', label: '🔧 Technique', color: '#06B6D4' },
    { id: 'security', label: '🔒 Sécurité', color: '#EF4444' }
  ];

  const faqs = [
    // GÉNÉRAL
    {
      category: 'general',
      question: 'Qu\'est-ce qu\'ATS Ultimate et à qui s\'adresse-t-il ?',
      answer: 'ATS Ultimate est une plateforme de recrutement complète qui utilise l\'intelligence artificielle pour automatiser et optimiser vos processus de recrutement. Elle s\'adresse aux équipes RH, recruteurs, cabinets de recrutement et entreprises de toutes tailles qui souhaitent recruter plus rapidement et efficacement.'
    },
    {
      category: 'general',
      question: 'Combien de temps faut-il pour commencer à utiliser ATS Ultimate ?',
      answer: 'Vous pouvez commencer en moins de 5 minutes ! Créez votre compte, importez vos premières offres d\'emploi et candidatures, et vous êtes prêt. Notre assistant de configuration vous guide pas à pas pour un démarrage optimal.'
    },
    {
      category: 'general',
      question: 'Proposez-vous une formation ou un accompagnement ?',
      answer: 'Oui ! Tous nos plans incluent un accès à notre centre d\'aide complet avec des tutoriels vidéo. Les plans Professional et Enterprise bénéficient d\'un support prioritaire et d\'une formation personnalisée pour votre équipe.'
    },

    // TARIFS
    {
      category: 'pricing',
      question: 'Quelle est la différence entre les plans Mensuel et Annuel ?',
      answer: 'Le plan Annuel vous offre <strong>20% d\'économies</strong> par rapport au plan Mensuel. Vous êtes facturé une fois par an et vous économisez jusqu\'à 718€/an sur le plan Professional. Le plan Mensuel offre plus de flexibilité avec un engagement mois par mois.'
    },
    {
      category: 'pricing',
      question: 'Puis-je changer de plan à tout moment ?',
      answer: 'Absolument ! Vous pouvez upgrader ou downgrader votre plan à tout moment. Si vous passez à un plan supérieur, le changement est immédiat. Si vous passez à un plan inférieur, il prendra effet à la fin de votre période de facturation actuelle.'
    },
    {
      category: 'pricing',
      question: 'Y a-t-il des frais cachés ou des coûts supplémentaires ?',
      answer: 'Non, aucun frais caché ! Le prix affiché est le prix final. Toutes les fonctionnalités de votre plan sont incluses. Les seuls coûts additionnels possibles concernent le plan Enterprise pour des besoins très spécifiques (API personnalisée, intégrations sur mesure).'
    },
    {
      category: 'pricing',
      question: 'Offrez-vous un essai gratuit ?',
      answer: 'Nous ne proposons pas d\'essai gratuit, mais vous pouvez <strong>demander une démo personnalisée</strong> pour voir la plateforme en action avant de vous engager. Tous nos plans sont sans engagement, avec possibilité de résilier à tout moment.'
    },
    {
      category: 'pricing',
      question: 'Quels modes de paiement acceptez-vous ?',
      answer: 'Nous acceptons toutes les cartes bancaires (Visa, Mastercard, American Express), les virements SEPA, et PayPal. Les entreprises peuvent également payer par bon de commande pour les contrats annuels.'
    },

    // FONCTIONNALITÉS
    {
      category: 'features',
      question: 'Comment fonctionne le scoring IA des candidats ?',
      answer: 'Notre IA analyse automatiquement chaque CV en comparant les compétences, l\'expérience et les qualifications du candidat avec les critères de votre offre d\'emploi. Elle attribue un score de matching de 0 à 100% avec une précision de 87%. Vous pouvez ajuster les critères de scoring selon vos préférences.'
    },
    {
      category: 'features',
      question: 'Puis-je personnaliser mon pipeline de recrutement ?',
      answer: 'Oui, totalement ! Vous pouvez créer autant d\'étapes que nécessaire dans votre pipeline (Nouveau, Présélection, Entretien RH, Entretien technique, Offre, Embauché). Chaque étape est personnalisable avec des actions automatiques (envoi d\'email, notifications, etc.).'
    },
    {
      category: 'features',
      question: 'L\'outil s\'intègre-t-il avec d\'autres applications ?',
      answer: 'Oui ! Nous proposons des intégrations natives avec plus de 30 outils : LinkedIn, Indeed, Gmail, Outlook, Slack, Teams, Google Calendar, Zapier, et bien d\'autres. Le plan Professional inclut 10 intégrations, le plan Enterprise offre des intégrations illimitées et une API complète.'
    },
    {
      category: 'features',
      question: 'Puis-je publier des offres sur plusieurs sites d\'emploi simultanément ?',
      answer: 'Absolument ! En un clic, publiez vos offres sur LinkedIn, Indeed, Monster, Pôle Emploi, et 50+ autres jobboards. La multi-diffusion vous fait gagner des heures et maximise la visibilité de vos offres.'
    },
    {
      category: 'features',
      question: 'Comment fonctionne la CVthèque intelligente ?',
      answer: 'La CVthèque centralise tous vos candidats (actuels et passés) dans une base de données recherchable. Notre IA permet de retrouver instantanément les meilleurs profils pour une nouvelle mission grâce à des filtres avancés : compétences, localisation, disponibilité, salaire, etc.'
    },

    // TECHNIQUE
    {
      category: 'technical',
      question: 'Sur quelles plateformes ATS Ultimate est-il disponible ?',
      answer: 'ATS Ultimate est une application web accessible depuis n\'importe quel navigateur moderne (Chrome, Firefox, Safari, Edge). Aucune installation n\'est nécessaire. Nous proposons également des applications mobiles iOS et Android (disponibles en version bêta).'
    },
    {
      category: 'technical',
      question: 'Quelle est la limite de stockage et de candidats ?',
      answer: 'Le plan Starter permet 100 candidats et 10 missions actives. Les plans Professional et Enterprise offrent des candidats et missions <strong>illimités</strong>. Le stockage de fichiers est de 10GB (Starter), 100GB (Professional) et illimité (Enterprise).'
    },
    {
      category: 'technical',
      question: 'Puis-je importer mes données depuis un autre ATS ?',
      answer: 'Oui ! Nous proposons un service de migration gratuit depuis les principaux ATS du marché (Greenhouse, Lever, Workable, SmartRecruiters, etc.). Notre équipe technique vous accompagne pour assurer une transition sans perte de données.'
    },
    {
      category: 'technical',
      question: 'Les données sont-elles sauvegardées automatiquement ?',
      answer: 'Oui, toutes vos données sont sauvegardées automatiquement en temps réel sur des serveurs sécurisés redondants. Nous effectuons également des backups quotidiens avec une rétention de 30 jours pour une protection maximale.'
    },

    // SÉCURITÉ
    {
      category: 'security',
      question: 'Mes données sont-elles sécurisées et conformes RGPD ?',
      answer: 'Absolument ! Nous sommes 100% conformes RGPD et certifiés ISO 27001. Toutes vos données sont chiffrées en transit (SSL/TLS) et au repos (AES-256). Nos serveurs sont hébergés en Europe (France) avec une infrastructure hautement sécurisée.'
    },
    {
      category: 'security',
      question: 'Qui a accès à mes données candidats ?',
      answer: 'Seuls les membres de votre équipe que vous avez autorisés ont accès à vos données. Vous contrôlez précisément les permissions de chaque utilisateur (lecture seule, édition, admin). Notre équipe technique n\'accède jamais à vos données sauf si vous nous y autorisez explicitement pour du support.'
    },
    {
      category: 'security',
      question: 'Proposez-vous l\'authentification à deux facteurs (2FA) ?',
      answer: 'Oui ! L\'authentification à deux facteurs est disponible sur tous les plans pour renforcer la sécurité de votre compte. Nous supportons Google Authenticator, SMS, et les clés de sécurité matérielles (YubiKey).'
    },
    {
      category: 'security',
      question: 'Que se passe-t-il si je souhaite supprimer mon compte ?',
      answer: 'Vous pouvez supprimer votre compte à tout moment depuis les paramètres. Toutes vos données seront définitivement supprimées sous 30 jours conformément au RGPD. Vous recevez un export complet de vos données avant la suppression.'
    }
  ];

  // Filtrage par recherche et catégorie
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  // Grouper par catégorie pour affichage
  const faqsByCategory = categories
    .filter(cat => cat.id !== 'all')
    .map(cat => ({
      ...cat,
      faqs: filteredFAQs.filter(faq => faq.category === cat.id)
    }))
    .filter(cat => cat.faqs.length > 0);

  return (
    <div>
      <SEO
        title="FAQ"
        description="Toutes les réponses à vos questions sur ATS Ultimate : tarifs, fonctionnalités, sécurité et aspects techniques."
        url="https://ats-ultimate.com/faq"
      />
      <Navbar activePage="faq" />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>❓ Questions Fréquentes (FAQ)</h1>
          <p className={styles.subtitle}>
            Trouvez rapidement des réponses à toutes vos questions sur ATS Ultimate
          </p>

          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="🔍 Rechercher une question..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filters */}
          <div className={styles.categories}>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`${styles.categoryButton} ${activeCategory === cat.id ? styles.active : ''}`}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  '--category-color': cat.color
                }}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Sections */}
        {activeCategory === 'all' ? (
          <div className={styles.faqSections}>
            {faqsByCategory.map(cat => (
              <div key={cat.id} className={styles.faqSection}>
                <h2 className={styles.categoryTitle}>{cat.label}</h2>
                <Accordion items={cat.faqs.map(faq => ({
                  question: faq.question,
                  answer: faq.answer
                }))} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.faqSections}>
            <Accordion items={filteredFAQs.map(faq => ({
              question: faq.question,
              answer: faq.answer
            }))} />
          </div>
        )}

        {/* Empty State */}
        {filteredFAQs.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <h3>Aucune question trouvée</h3>
            <p>Essayez avec d'autres mots-clés ou parcourez toutes les catégories</p>
            <button
              className={styles.resetButton}
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}>
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* CTA Contact */}
        <div className={styles.ctaSection}>
          <h3>Vous ne trouvez pas votre réponse ?</h3>
          <p>Notre équipe est là pour vous aider !</p>
          <button
            className={styles.ctaButton}
            onClick={() => navigate(ROUTES.CONTACT)}>
            💬 Contactez-nous
          </button>
        </div>
      </div>

      <Footer variant="light" />
    </div>
  );
}

export default FAQPage;
