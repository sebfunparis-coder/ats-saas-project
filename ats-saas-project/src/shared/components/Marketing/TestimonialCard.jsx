import React from 'react';

/**
 * TestimonialCard - Carte de témoignage client
 *
 * @param {Object} props
 * @param {string} props.name - Nom du client
 * @param {string} props.role - Rôle du client
 * @param {string} props.stars - Notation en étoiles (ex: '⭐⭐⭐⭐⭐')
 * @param {string} props.text - Texte du témoignage
 * @param {string} props.avatar - Émoji avatar
 * @param {string} props.variant - Variante ('light' | 'dark')
 */
export function TestimonialCard({
  name,
  role,
  stars = '⭐⭐⭐⭐⭐',
  text,
  avatar = '👤',
  variant = 'dark'
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  const cardStyles = {
    padding: '40px',
    background: variant === 'dark'
      ? 'rgba(255,255,255,0.08)'
      : 'white',
    backdropFilter: variant === 'dark' ? 'blur(10px)' : 'none',
    borderRadius: '20px',
    border: variant === 'dark'
      ? '1px solid rgba(255,255,255,0.1)'
      : '1px solid #E5E7EB',
    cursor: 'pointer',
    transition: 'all 0.3s',
    transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
    boxShadow: isHovered
      ? '0 20px 40px rgba(0,0,0,0.2)'
      : 'none'
  };

  const starsStyles = {
    fontSize: '24px',
    marginBottom: '16px'
  };

  const textStyles = {
    fontSize: '18px',
    marginBottom: '24px',
    lineHeight: '1.6',
    fontStyle: 'italic',
    color: variant === 'dark' ? 'white' : '#1F2937'
  };

  const profileContainerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const avatarStyles = {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px'
  };

  const nameStyles = {
    fontWeight: '700',
    fontSize: '16px',
    color: variant === 'dark' ? 'white' : '#1F2937'
  };

  const roleStyles = {
    opacity: 0.7,
    fontSize: '14px',
    color: variant === 'dark' ? 'white' : '#6B7280'
  };

  return (
    <div
      style={cardStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Témoignage de ${name}`}>

      <div style={starsStyles} aria-label={`Note : ${stars.length} étoiles`}>
        {stars}
      </div>

      <p style={textStyles}>"{text}"</p>

      <div style={profileContainerStyles}>
        <div style={avatarStyles} aria-hidden="true">
          {avatar}
        </div>
        <div>
          <div style={nameStyles}>{name}</div>
          <div style={roleStyles}>{role}</div>
        </div>
      </div>
    </div>
  );
}

export default TestimonialCard;
