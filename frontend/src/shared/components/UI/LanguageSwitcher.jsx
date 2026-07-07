import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Sélecteur de langue FR/EN — T-303
 * Bascule entre français et anglais, persiste dans localStorage via i18n config.
 */
export function LanguageSwitcher({ style = {} }) {
  const { i18n, t } = useTranslation();
  const current = i18n.language?.slice(0, 2) || 'fr';

  const toggle = () => {
    const next = current === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={t('language.switch')}
      title={t('language.switch')}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        background: 'transparent',
        border: '1px solid currentColor',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '700',
        opacity: 0.85,
        transition: 'opacity 0.15s',
        ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '0.85'; }}
    >
      <span style={{ fontSize: '16px' }}>{current === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
      <span>{current === 'fr' ? 'EN' : 'FR'}</span>
    </button>
  );
}

export default LanguageSwitcher;
