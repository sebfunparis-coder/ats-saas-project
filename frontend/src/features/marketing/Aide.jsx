import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '@/shared/components/Marketing';
import { SEO } from '@/shared/components/SEO';

/**
 * T-311 — Guide utilisateur in-app
 * Centre d'aide avec 5 guides étape par étape et FAQ accordion.
 */

const GUIDES = [
  { id: 'start', icon: '🚀', title: 'Démarrage rapide', time: '5 min', steps: [
    { title: 'Créer votre compte', text: 'Rendez-vous sur ats-ultimate.com, cliquez "Démarrer maintenant". Choisissez votre plan, renseignez nom, email professionnel, nom entreprise.' },
    { title: 'Inviter votre équipe', text: 'Administration → Utilisateurs → "Inviter un membre". Choisissez le rôle (Admin, Recruteur, Manager, Viewer). Invitation envoyée par email.' },
    { title: 'Créer votre première mission', text: 'Onglet Missions → "+ Nouvelle mission". Renseignez titre, contrat, localisation, description. Publiez pour la rendre visible sur votre portail carrières.' },
    { title: 'Partager votre portail carrières', text: 'URL du portail dans Administration → Paramètres. Partagez sur LinkedIn ou votre site web pour recevoir des candidatures directement dans le pipeline.' },
  ]},
  { id: 'pipeline', icon: '📋', title: 'Pipeline Kanban', time: '10 min', steps: [
    { title: 'Les 8 colonnes du pipeline', text: 'Reçue → Présélection → Entretien 1 → Entretien 2 → Offre → Finaliste → Recruté → Refusé.' },
    { title: 'Déplacer une candidature', text: 'Glissez-déposez une carte pour changer son statut. Sur mobile, utilisez les boutons dans le panneau de détail.' },
    { title: 'Grille d\'évaluation structurée', text: 'Cliquez "Évaluer" sur une carte. Notez de 1 à 5 étoiles : Communication, Technique, Culture fit, Motivation, Leadership. Consolidation automatique par l\'équipe.' },
    { title: 'Partage avec un manager', text: '"Générer un lien" dans le panneau de détail. Lien sécurisé 7 jours — le manager donne son avis sans créer de compte.' },
  ]},
  { id: 'candidates', icon: '👥', title: 'Gestion des candidats', time: '8 min', steps: [
    { title: 'Parser un CV avec l\'IA', text: '"+ Nouveau candidat" → déposer un PDF. L\'IA pré-remplit nom, email, compétences et expériences automatiquement.' },
    { title: 'Import CSV', text: '"Candidats → Importer CSV". Wizard 4 étapes : mapping colonnes, aperçu, détection doublons, rapport d\'import.' },
    { title: 'CVthèque et matching IA', text: 'Recherche sémantique par compétences, localisation, disponibilité. Score IA de correspondance calculé automatiquement.' },
    { title: 'Export RGPD candidat', text: 'Fiche candidat → "Export RGPD" : ZIP avec profil JSON, CV, candidatures, entretiens, historique. Conforme Article 20 RGPD.' },
  ]},
  { id: 'integrations', icon: '🔌', title: 'Intégrations', time: '15 min', steps: [
    { title: 'Jobboards (LinkedIn, Indeed…)', text: 'Administration → Intégrations → configurez vos credentials. Publiez en 1 clic depuis n\'importe quelle mission ouverte.' },
    { title: 'Google Calendar / Outlook', text: 'Administration → Intégrations → Calendrier → "Connecter". Entretiens synchro avec invitations automatiques aux participants.' },
    { title: 'Zoom / Microsoft Teams', text: 'Configurez dans Administration → Intégrations → Vidéo. Lien de réunion créé automatiquement pour chaque entretien visio.' },
    { title: 'Webhooks Zapier / Make', text: 'Administration → Webhooks → "Créer". URL destination + événements. Test Ping avec retry backoff (3 tentatives, 5s/25s/125s).' },
  ]},
  { id: 'rgpd', icon: '⚖️', title: 'Conformité RGPD', time: '10 min', steps: [
    { title: 'Consentements candidats', text: 'Le portail carrières affiche la mention d\'information. Consentements tracés dans Administration → RGPD.' },
    { title: 'Droit à l\'oubli', text: 'Administration → RGPD → "Supprimer" : efface profil, CV, candidatures, notes. Certificat de suppression généré automatiquement.' },
    { title: 'Export données company', text: 'Administration → RGPD → "Export complet (ZIP)" : missions, candidats, candidatures, équipe en JSON.' },
    { title: 'DPA et registre des traitements', text: 'DPA Article 28 RGPD téléchargeable depuis Administration → RGPD. Registre des traitements accessible sur /registre-rgpd.' },
  ]},
];

const FAQ_ITEMS = [
  { q: 'Proposez-vous un essai gratuit ?', a: 'Non, mais tous nos plans sont sans engagement (résiliation à tout moment) et vous pouvez demander une démo personnalisée avant de vous abonner.' },
  { q: 'Puis-je importer mes candidats existants ?', a: 'Oui via CSV (Candidats → Importer CSV). Le wizard détecte les doublons et vous permet de mapper les colonnes librement.' },
  { q: 'Mes données sont-elles sécurisées ?', a: 'Chiffrement TLS 1.3 + AES-256 au repos. Hébergement exclusif en UE (AWS Frankfurt). Row Level Security multi-tenant. Sauvegardes quotidiennes avec rétention 30 jours.' },
  { q: 'Comment fonctionne le scoring IA ?', a: 'Score 0-100% basé sur la correspondance compétences/critères de la mission. Aucune donnée démographique utilisée. Score indicatif, pas décisionnel.' },
  { q: 'L\'API est-elle accessible ?', a: 'Oui, /api/v1/ avec clé API. Créez une clé dans Administration → Clés API en choisissant les scopes. Documentation Swagger sur /api/docs.' },
  { q: 'Comment résilier mon abonnement ?', a: 'Administration → Facturation → "Gérer l\'abonnement". Résiliation à la fin de la période en cours. Données exportables 30 jours après résiliation.' },
  { q: 'Les candidats peuvent-ils suivre leur candidature ?', a: 'Oui, lien de suivi automatique après soumission depuis le portail carrières. Le candidat consulte son statut sans créer de compte.' },
  { q: 'Comment configurer le 2FA ?', a: 'Administration → Sécurité → "Activer la vérification en 2 étapes". Scannez le QR code avec Google Authenticator ou Authy. Conservez vos 8 codes de récupération.' },
];

function GuideCard({ guide, isOpen, onToggle }) {
  return (
    <div style={{ background:'white', borderRadius:'16px', border:`2px solid ${isOpen?'#667EEA':'#E5E7EB'}`, marginBottom:'12px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
      <button onClick={onToggle} style={{ width:'100%', padding:'20px 24px', display:'flex', alignItems:'center', gap:'14px', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}>
        <span style={{ fontSize:'28px' }}>{guide.icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'16px', fontWeight:'800', color:'#1F2937' }}>{guide.title}</div>
          <div style={{ fontSize:'12px', color:'#6B7280', marginTop:'2px' }}>{guide.time} · {guide.steps.length} étapes</div>
        </div>
        <span style={{ fontSize:'18px', color:'#667EEA', transition:'transform 0.2s', transform:isOpen?'rotate(90deg)':'none' }}>›</span>
      </button>
      {isOpen && (
        <div style={{ padding:'0 24px 20px', borderTop:'1px solid #F3F4F6' }}>
          {guide.steps.map((st, i) => (
            <div key={i} style={{ display:'flex', gap:'14px', marginTop:'18px' }}>
              <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'linear-gradient(135deg,#667EEA,#764BA2)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'900', flexShrink:0, marginTop:'2px' }}>{i+1}</div>
              <div>
                <div style={{ fontWeight:'800', color:'#1F2937', marginBottom:'4px', fontSize:'14px' }}>{st.title}</div>
                <div style={{ fontSize:'13px', color:'#6B7280', lineHeight:1.7 }}>{st.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom:'1px solid #F3F4F6' }}>
      <button onClick={() => setOpen(!open)} style={{ width:'100%', padding:'16px 0', display:'flex', justifyContent:'space-between', alignItems:'center', background:'none', border:'none', cursor:'pointer', textAlign:'left', gap:'16px' }}>
        <span style={{ fontWeight:'700', color:'#1F2937', fontSize:'15px' }}>{item.q}</span>
        <span style={{ fontSize:'18px', color:'#667EEA', flexShrink:0, transition:'transform 0.2s', transform:open?'rotate(45deg)':'none' }}>+</span>
      </button>
      {open && <div style={{ paddingBottom:'16px', fontSize:'14px', color:'#6B7280', lineHeight:1.7 }}>{item.a}</div>}
    </div>
  );
}

export function Aide() {
  const [openGuide, setOpenGuide] = useState(null);

  return (
    <div style={{ fontFamily:'system-ui,sans-serif' }}>
      <SEO
        title="Centre d'aide"
        description="Guides étape par étape et FAQ pour bien démarrer et exploiter toutes les fonctionnalités d'ATS Ultimate."
        url="https://ats-ultimate.com/aide"
      />
      <Navbar />

      <section style={{ padding:'clamp(100px,12vw,140px) clamp(24px,4vw,60px) 60px', background:'linear-gradient(135deg,#667EEA,#764BA2)', color:'white', textAlign:'center' }}>
        <h1 style={{ fontSize:'clamp(2rem,5vw,3rem)', fontWeight:'900', marginBottom:'16px' }}>Centre d'aide</h1>
        <p style={{ fontSize:'1.1rem', opacity:0.9, maxWidth:'560px', margin:'0 auto 32px', lineHeight:1.6 }}>
          Guides étape par étape, FAQ et ressources pour maîtriser ATS Ultimate.
        </p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <a href="/api/docs" target="_blank" rel="noopener noreferrer" style={{ padding:'12px 24px', background:'white', color:'#667EEA', borderRadius:'12px', fontWeight:'700', fontSize:'14px', textDecoration:'none' }}>📖 Documentation API</a>
          <Link to="/contact" style={{ padding:'12px 24px', background:'rgba(255,255,255,0.15)', color:'white', borderRadius:'12px', fontWeight:'700', fontSize:'14px', textDecoration:'none', border:'1px solid rgba(255,255,255,0.4)' }}>💬 Support</Link>
        </div>
      </section>

      <section style={{ padding:'clamp(48px,6vw,80px) clamp(24px,4vw,60px)' }}>
        <div style={{ maxWidth:'840px', margin:'0 auto' }}>
          <h2 style={{ fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:'900', color:'#1F2937', marginBottom:'8px' }}>Guides complets</h2>
          <p style={{ color:'#6B7280', marginBottom:'28px' }}>Cliquez sur un guide pour voir les étapes détaillées.</p>
          {GUIDES.map(g => (
            <GuideCard key={g.id} guide={g} isOpen={openGuide === g.id} onToggle={() => setOpenGuide(openGuide === g.id ? null : g.id)} />
          ))}
        </div>
      </section>

      <section style={{ padding:'clamp(48px,6vw,80px) clamp(24px,4vw,60px)', background:'#F9FAFB' }}>
        <div style={{ maxWidth:'780px', margin:'0 auto' }}>
          <h2 style={{ fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:'900', color:'#1F2937', marginBottom:'8px' }}>Questions fréquentes</h2>
          <p style={{ color:'#6B7280', marginBottom:'28px' }}>Réponses aux questions les plus posées.</p>
          <div style={{ background:'white', borderRadius:'16px', padding:'8px 28px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', border:'1px solid #E5E7EB' }}>
            {FAQ_ITEMS.map((item, i) => <FAQItem key={i} item={item} />)}
          </div>
        </div>
      </section>

      <section style={{ padding:'clamp(48px,6vw,80px) clamp(24px,4vw,60px)', textAlign:'center' }}>
        <div style={{ maxWidth:'580px', margin:'0 auto' }}>
          <h2 style={{ fontSize:'clamp(1.4rem,3vw,1.9rem)', fontWeight:'900', color:'#1F2937', marginBottom:'12px' }}>Besoin d'aide supplémentaire ?</h2>
          <p style={{ color:'#6B7280', marginBottom:'28px', lineHeight:1.6 }}>Notre équipe répond sous 24h ouvrées (4h en plan Professional/Enterprise).</p>
          <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/contact" style={{ padding:'14px 28px', background:'linear-gradient(135deg,#667EEA,#764BA2)', color:'white', borderRadius:'12px', fontWeight:'700', textDecoration:'none' }}>💬 Contacter le support</Link>
            <a href="/api/docs" target="_blank" rel="noopener noreferrer" style={{ padding:'14px 28px', background:'white', color:'#374151', borderRadius:'12px', fontWeight:'700', textDecoration:'none', border:'2px solid #E5E7EB' }}>📖 Documentation API</a>
          </div>
          <p style={{ marginTop:'14px', fontSize:'13px', color:'#9CA3AF' }}>
            Email : <a href="mailto:support@ats-ultimate.com" style={{ color:'#667EEA' }}>support@ats-ultimate.com</a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Aide;