import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * FeatureCard - Carte de présentation d'une fonctionnalité
 *
 * @param {Object} props
 * @param {string} props.icon - Émoji de la fonctionnalité
 * @param {string} props.title - Titre de la fonctionnalité
 * @param {string} props.description - Description
 * @param {string} props.gradient - Gradient CSS pour le background de l'icône
 * @param {string} props.link - Lien de destination au clic (optionnel)
 * @param {Function} props.onClick - Callback au clic (optionnel)
 * @param {Object} props.size - Taille de la card ('small' | 'medium' | 'large')
 */
export function FeatureCard({
  icon,
  title,
  description,
  gradient = 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
  link,
  onClick,
  size = 'medium'
}) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = React.useState(false);

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          padding: '32px',
          iconSize: '80px',
          iconFontSize: '48px',
          titleSize: '22px',
          descriptionSize: '14px'
        };
      case 'large':
        return {
          padding: '56px',
          iconSize: '120px',
          iconFontSize: '64px',
          titleSize: '32px',
          descriptionSize: '18px'
        };
      default: // medium
        return {
          padding: '48px',
          iconSize: '100px',
          iconFontSize: '56px',
          titleSize: '28px',
          descriptionSize: '16px'
        };
    }
  };

  const sizeConfig = getSizeConfig();

  const cardStyles = {
    padding: sizeConfig.padding,
    background: 'white',
    borderRadius: '24px',
    textAlign: 'center',
    cursor: link || onClick ? 'pointer' : 'default',
    border: '2px solid transparent',
    boxShadow: isHovered
      ? '0 24px 60px rgba(102, 126, 234, 0.25)'
      : '0 4px 20px rgba(0,0,0,0.06)',
    transition: 'all 0.4s',
    transform: isHovered ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
    borderColor: isHovered ? '#667EEA' : 'transparent'
  };

  const iconContainerStyles = {
    width: sizeConfig.iconSize,
    height: sizeConfig.iconSize,
    margin: '0 auto 24px',
    background: gradient,
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: sizeConfig.iconFontSize,
    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.3)'
  };

  const titleStyles = {
    fontSize: sizeConfig.titleSize,
    fontWeight: '800',
    marginBottom: '16px',
    color: '#1F2937'
  };

  const descriptionStyles = {
    color: '#6B7280',
    lineHeight: '1.7',
    fontSize: sizeConfig.descriptionSize
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (link) {
      navigate(link);
    }
  };

  return (
    <div
      style={cardStyles}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={link || onClick ? 'button' : undefined}
      tabIndex={link || onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if ((link || onClick) && e.key === 'Enter') {
          handleClick();
        }
      }}>
      {/* Lighthouse (2026-07-06) : un aria-label explicite ici masquait le
          texte visible (h3/p) pour les lecteurs d'écran, en violation de
          WCAG 2.5.3 (Label in Name) — l'accessible name se calcule
          désormais naturellement à partir du contenu visible. */}

      <div style={iconContainerStyles}
        aria-hidden="true">
        {icon}
      </div>

      <h3 style={titleStyles}>{title}</h3>

      <p style={descriptionStyles}>{description}</p>
    </div>
  );
}

export default FeatureCard;
