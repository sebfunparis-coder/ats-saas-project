import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

/**
 * Page Mentions Légales
 */
export function MentionsLegales() {
  const navigate = useNavigate();

  const containerStyles = {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%)',
    padding: '120px 40px 80px'
  };

  const maxWidthStyles = {
    maxWidth: '900px',
    margin: '0 auto',
    background: 'white',
    padding: '60px',
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
  };

  const titleStyles = {
    fontSize: '48px',
    fontWeight: '900',
    marginBottom: '12px',
    background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  };

  const sectionTitleStyles = {
    fontSize: '28px',
    fontWeight: '800',
    marginTop: '48px',
    marginBottom: '20px',
    color: '#1F2937'
  };

  const textStyles = {
    fontSize: '16px',
    lineHeight: '1.8',
    color: '#4B5563',
    marginBottom: '16px'
  };

  return (
    <div style={containerStyles}>
      <div style={maxWidthStyles}>
        {/* Bouton retour */}
        <button
          onClick={() => navigate(ROUTES.LANDING)}
          style={{
            marginBottom: '32px',
            padding: '12px 24px',
            background: '#EEF2FF',
            color: '#667EEA',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '14px',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#667EEA'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#EEF2FF'}
        >
          ← Retour à l'accueil
        </button>

        <h1 style={titleStyles}>Mentions Légales</h1>
        <p style={{ ...textStyles, color: '#9CA3AF', marginBottom: '48px' }}>
          Dernière mise à jour : 18 février 2026
        </p>

        <h2 style={sectionTitleStyles}>1. Éditeur du site</h2>
        <p style={textStyles}>
          <strong>Raison sociale :</strong> ATS Ultimate SAS<br />
          <strong>Siège social :</strong> 123 Avenue des Champs-Élysées, 75008 Paris, France<br />
          <strong>Capital social :</strong> 50 000 €<br />
          <strong>RCS :</strong> Paris B 123 456 789<br />
          <strong>SIRET :</strong> 123 456 789 00012<br />
          <strong>TVA Intracommunautaire :</strong> FR 12 123456789<br />
          <strong>Directeur de publication :</strong> Marie Dubois, Présidente<br />
          <strong>Email :</strong> contact@ats-ultimate.com<br />
          <strong>Téléphone :</strong> +33 1 40 50 60 70
        </p>

        <h2 style={sectionTitleStyles}>2. Hébergement</h2>
        <p style={textStyles}>
          <strong>Hébergeur :</strong> OVHcloud<br />
          <strong>Raison sociale :</strong> OVH SAS<br />
          <strong>Siège social :</strong> 2 rue Kellermann, 59100 Roubaix, France<br />
          <strong>Téléphone :</strong> 1007<br />
          <strong>Site web :</strong> <a href="https://www.ovhcloud.com" target="_blank" rel="noopener noreferrer" style={{ color: '#667EEA' }}>www.ovhcloud.com</a>
        </p>

        <h2 style={sectionTitleStyles}>3. Propriété intellectuelle</h2>
        <p style={textStyles}>
          L'ensemble des éléments présents sur le site ATS Ultimate (textes, images, graphismes, logo, icônes, sons, logiciels, etc.) sont la propriété exclusive de ATS Ultimate SAS, à l'exception des marques, logos ou contenus appartenant à d'autres sociétés partenaires ou auteurs.
        </p>
        <p style={textStyles}>
          Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de ATS Ultimate SAS.
        </p>
        <p style={textStyles}>
          Toute exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.
        </p>

        <h2 style={sectionTitleStyles}>4. Responsabilité</h2>
        <p style={textStyles}>
          Les informations diffusées sur le site ATS Ultimate sont présentées à titre indicatif et général. Malgré les mises à jour régulières, la responsabilité de ATS Ultimate SAS ne peut être engagée en cas de modification des dispositions administratives et juridiques survenant après la publication.
        </p>
        <p style={textStyles}>
          ATS Ultimate SAS décline toute responsabilité :
        </p>
        <ul style={{ ...textStyles, paddingLeft: '24px' }}>
          <li>Pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur le site</li>
          <li>Pour tous dommages résultant d'une intrusion frauduleuse d'un tiers ayant entraîné une modification des informations</li>
          <li>Pour tous dommages directs et indirects découlant de l'utilisation du site</li>
        </ul>

        <h2 style={sectionTitleStyles}>5. Liens hypertextes</h2>
        <p style={textStyles}>
          Le site ATS Ultimate peut contenir des liens hypertextes vers d'autres sites présents sur le réseau Internet. Les liens vers ces autres ressources vous font quitter le site.
        </p>
        <p style={textStyles}>
          Il est possible de créer un lien vers la page de présentation de ce site sans autorisation expresse de ATS Ultimate SAS. Aucune autorisation ni demande d'information préalable ne peut être exigée par l'éditeur à l'égard d'un site qui souhaite établir un lien vers le site de l'éditeur.
        </p>

        <h2 style={sectionTitleStyles}>6. Protection des données personnelles</h2>
        <p style={textStyles}>
          En conformité avec le Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.
        </p>
        <p style={textStyles}>
          Pour plus d'informations, consultez notre <button onClick={() => navigate('/politique-confidentialite')} style={{ color: '#667EEA', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: 0 }}>Politique de Confidentialité</button>.
        </p>

        <h2 style={sectionTitleStyles}>7. Cookies</h2>
        <p style={textStyles}>
          Le site utilise des cookies pour améliorer l'expérience utilisateur. Pour plus d'informations, consultez notre <button onClick={() => navigate('/politique-cookies')} style={{ color: '#667EEA', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: 0 }}>Politique de Cookies</button>.
        </p>

        <h2 style={sectionTitleStyles}>8. Droit applicable et juridiction</h2>
        <p style={textStyles}>
          Les présentes mentions légales sont régies par le droit français. En cas de litige et à défaut d'accord amiable, le litige sera porté devant les tribunaux français conformément aux règles de compétence en vigueur.
        </p>

        <h2 style={sectionTitleStyles}>9. Contact</h2>
        <p style={textStyles}>
          Pour toute question concernant les mentions légales, vous pouvez nous contacter :
        </p>
        <ul style={{ ...textStyles, paddingLeft: '24px' }}>
          <li>Par email : contact@ats-ultimate.com</li>
          <li>Par téléphone : +33 1 40 50 60 70</li>
          <li>Par courrier : ATS Ultimate SAS, 123 Avenue des Champs-Élysées, 75008 Paris, France</li>
        </ul>

        <div style={{ marginTop: '64px', padding: '24px', background: '#EEF2FF', borderRadius: '16px', borderLeft: '4px solid #667EEA' }}>
          <p style={{ ...textStyles, margin: 0, color: '#667EEA', fontWeight: '600' }}>
            📄 Ces mentions légales ont été mises à jour le 18 février 2026 et peuvent être modifiées à tout moment.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MentionsLegales;
