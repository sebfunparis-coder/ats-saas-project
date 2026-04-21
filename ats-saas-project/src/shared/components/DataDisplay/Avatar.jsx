import React from 'react';
import { getInitials } from '@/core/utils/formatters';

/**
 * Composant Avatar réutilisable
 *
 * @param {object} props
 * @param {string} props.name - Nom pour générer les initiales
 * @param {string} props.src - URL de l'image
 * @param {string} props.emoji - Emoji à afficher
 * @param {'sm'|'md'|'lg'|'xl'} props.size - Taille de l'avatar
 * @param {string} props.color - Couleur de fond
 *
 * @example
 * <Avatar name="Jean Dupont" />
 * <Avatar emoji="👨‍💼" size="lg" />
 * <Avatar src="/image.jpg" name="Jean" />
 */
export function Avatar({
  name = '',
  src,
  emoji,
  size = 'md',
  color = '#667EEA',
  className = '',
  ...rest
}) {
  const sizeMap = {
    sm: { width: '32px', height: '32px', fontSize: '14px' },
    md: { width: '48px', height: '48px', fontSize: '20px' },
    lg: { width: '64px', height: '64px', fontSize: '28px' },
    xl: { width: '96px', height: '96px', fontSize: '40px' },
  };

  const baseStyles = {
    ...sizeMap[size],
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    overflow: 'hidden',
    flexShrink: 0,
  };

  // Si image fournie
  if (src) {
    return (
      <div style={baseStyles} className={className} {...rest}>
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  // Si emoji fourni
  if (emoji) {
    return (
      <div
        style={{
          ...baseStyles,
          background: color + '20',
        }}
        className={className}
        {...rest}
      >
        {emoji}
      </div>
    );
  }

  // Sinon initiales
  const initials = getInitials(name);

  return (
    <div
      style={{
        ...baseStyles,
        background: color,
        color: 'white',
      }}
      className={className}
      {...rest}
    >
      {initials}
    </div>
  );
}

export default Avatar;
