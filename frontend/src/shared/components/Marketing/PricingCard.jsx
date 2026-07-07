import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

/**
 * PricingCard - Carte de tarification
 *
 * @param {Object} props
 * @param {string} props.name - Nom du plan
 * @param {string} props.savings - Mention de facturation annuelle affichée au-dessus du bouton (ex: 'Facturé 238,80€/an')
 * @param {boolean} props.popular - Si c'est le plan mis en avant
 * @param {Array<string>} props.features - Liste des features
 * @param {string} props.ctaText - Texte du bouton CTA (contient le prix, ex: 'Formule à 29,90€/mois')
 * @param {Function} props.onCTAClick - Callback au clic sur le CTA
 * @param {string} props.variant - Variante ('light' | 'dark')
 */
export function PricingCard({
  name,
  savings = null,
  popular = false,
  features = [],
  ctaText = 'Commencer',
  onCTAClick,
  variant = 'dark'
}) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isButtonHovered, setIsButtonHovered] = React.useState(false);

  const handleCTAClick = () => {
    if (onCTAClick) {
      onCTAClick();
    } else {
      navigate(ROUTES.LOGIN);
    }
  };

  const cardStyles = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '40px',
    background: popular
      ? 'white'
      : variant === 'dark' ? 'rgba(255,255,255,0.1)' : 'white',
    color: popular
      ? '#1F2937'
      : variant === 'dark' ? 'white' : '#1F2937',
    border: popular
      ? 'none'
      : variant === 'dark' ? '2px solid rgba(255,255,255,0.2)' : '2px solid #E5E7EB',
    borderRadius: '20px',
    position: 'relative',
    transform: isHovered
      ? popular ? 'scale(1.08)' : 'scale(1.03)'
      : popular ? 'scale(1.05)' : 'scale(1)',
    boxShadow: popular
      ? '0 20px 60px rgba(0,0,0,0.3)'
      : 'none',
    cursor: 'pointer',
    transition: 'all 0.3s'
  };

  const badgeStyles = {
    position: 'absolute',
    top: '-16px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)',
    color: 'white',
    padding: '6px 20px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700'
  };

  const nameStyles = {
    fontSize: '28px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '32px'
  };

  const featuresListStyles = {
    listStyle: 'none',
    padding: 0,
    marginBottom: '24px',
    flexGrow: 1
  };

  const featureItemStyles = {
    padding: '10px 0',
    fontSize: '16px',
    opacity: 0.9
  };

  const savingsCaptionStyles = {
    textAlign: 'center',
    marginBottom: '12px'
  };

  // Lighthouse (2026-07-06) : le texte vert clair sur fond blanc (variant popular/light)
  // et sur fond translucide (variant dark, dégradé animé derrière) ne passait pas le
  // contraste WCAG AA de façon fiable. Badge plein (fond vert foncé + texte blanc,
  // ratio ~5.5:1) au lieu d'un texte de couleur posé directement sur un fond variable.
  const savingsBadgeStyles = {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '999px',
    background: '#047857',
    color: 'white',
    fontSize: '13px',
    fontWeight: '700'
  };

  const buttonStyles = {
    width: '100%',
    padding: '16px',
    background: popular
      ? 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)'
      : variant === 'dark' ? 'white' : 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)',
    color: popular
      ? 'white'
      : variant === 'dark' ? '#667EEA' : 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '16px',
    transition: 'all 0.3s',
    transform: isButtonHovered ? 'translateY(-2px)' : 'translateY(0)'
  };

  return (
    <div
      style={cardStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Plan ${name}`}>

      {popular && (
        <div style={badgeStyles}>
          LE PLUS POPULAIRE
        </div>
      )}

      <h2 style={nameStyles}>{name}</h2>

      <ul style={featuresListStyles}>
        {features.map((feature, idx) => (
          <li key={idx} style={featureItemStyles}>
            {feature}
          </li>
        ))}
      </ul>

      {savings && (
        <div style={savingsCaptionStyles}>
          <span style={savingsBadgeStyles}>✨ {savings}</span>
        </div>
      )}

      <button
        onClick={handleCTAClick}
        style={buttonStyles}
        onMouseEnter={() => setIsButtonHovered(true)}
        onMouseLeave={() => setIsButtonHovered(false)}
        aria-label={`${ctaText} - Plan ${name}`}>
        {ctaText}
      </button>
    </div>
  );
}

export default PricingCard;
