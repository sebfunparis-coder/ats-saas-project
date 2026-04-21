import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

/**
 * PricingCard - Carte de tarification
 *
 * @param {Object} props
 * @param {string} props.name - Nom du plan
 * @param {string} props.price - Prix (ex: '99€')
 * @param {string} props.period - Période (ex: '/mois')
 * @param {string} props.savings - Économies affichées (ex: 'Économisez 238€/an')
 * @param {boolean} props.popular - Si c'est le plan populaire
 * @param {Array<string>} props.features - Liste des features
 * @param {string} props.ctaText - Texte du bouton CTA
 * @param {Function} props.onCTAClick - Callback au clic sur le CTA
 * @param {string} props.variant - Variante ('light' | 'dark')
 */
export function PricingCard({
  name,
  price,
  period = '',
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
    marginBottom: '16px'
  };

  const priceContainerStyles = {
    marginBottom: '32px'
  };

  const priceStyles = {
    fontSize: '48px',
    fontWeight: 'bold'
  };

  const periodStyles = {
    fontSize: '20px',
    opacity: 0.7
  };

  const savingsStyles = {
    display: 'inline-block',
    marginTop: '12px',
    padding: '6px 16px',
    background: popular
      ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
      : variant === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
    color: popular ? 'white' : variant === 'dark' ? '#34D399' : '#10B981',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '700',
    border: popular ? 'none' : '1px solid rgba(16, 185, 129, 0.3)'
  };

  const featuresListStyles = {
    listStyle: 'none',
    padding: 0,
    marginBottom: '32px'
  };

  const featureItemStyles = {
    padding: '10px 0',
    fontSize: '16px',
    opacity: 0.9
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
      aria-label={`Plan ${name} à ${price}${period}`}>

      {popular && (
        <div style={badgeStyles}>
          LE PLUS POPULAIRE
        </div>
      )}

      <h3 style={nameStyles}>{name}</h3>

      <div style={priceContainerStyles}>
        <span style={priceStyles}>{price}</span>
        <span style={periodStyles}>{period}</span>
        {savings && (
          <div style={{ marginTop: '12px' }}>
            <span style={savingsStyles}>✨ {savings}</span>
          </div>
        )}
      </div>

      <ul style={featuresListStyles}>
        {features.map((feature, idx) => (
          <li key={idx} style={featureItemStyles}>
            {feature}
          </li>
        ))}
      </ul>

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
