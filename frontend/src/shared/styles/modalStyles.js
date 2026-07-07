/**
 * Système de styles partagés pour les modales Clients, Missions, Candidats
 * Garantit une présentation cohérente, professionnelle et lisible.
 */

// ── Tokens de design ──────────────────────────────────────────────────────────

export const MODAL_TOKENS = {
  // Espacement
  sectionGap:   '20px',
  sectionPad:   '20px',
  sectionRadius:'14px',
  headerPad:    '24px 28px 20px',
  bodyPad:      '24px 28px',
  footerPad:    '16px 28px 24px',

  // Typographie
  titleSize:    '22px',
  titleWeight:  '900',
  titleColor:   '#111827',
  subtitleSize: '14px',
  subtitleColor:'#6B7280',
  sectionLabelSize: '11px',
  infoFontSize: '14px',
  labelWeight:  '600',
  labelColor:   '#374151',
  valueColor:   '#6B7280',
  labelMinWidth:'120px',

  // Couleurs sections
  sectionBg:    '#FAFAFA',
  sectionBorder:'#F0F0F0',

  // Avatar
  avatarSize:   '56px',
  avatarRadius: '50%',
  iconSize:     '52px',
  iconRadius:   '14px',
};

// ── Styles de base ────────────────────────────────────────────────────────────

/** Conteneur de section */
export const sectionStyle = (accent = '#6B7280') => ({
  background: '#FAFAFA',
  borderRadius: MODAL_TOKENS.sectionRadius,
  padding: MODAL_TOKENS.sectionPad,
  border: '1px solid #F0F0F0',
  marginBottom: MODAL_TOKENS.sectionGap,
  position: 'relative',
  overflow: 'hidden',
});

/** Bandeau coloré à gauche d'une section */
export const sectionAccentBar = (color = '#667EEA') => ({
  position: 'absolute', left: 0, top: 0, bottom: 0,
  width: '4px', background: color, borderRadius: '14px 0 0 14px',
});

/** Titre de section */
export const sectionTitleStyle = (color = '#374151') => ({
  fontSize: MODAL_TOKENS.sectionLabelSize,
  fontWeight: '800',
  color,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  marginBottom: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

/** Ligne label / valeur */
export const infoRowStyle = {
  display: 'grid',
  gridTemplateColumns: `${MODAL_TOKENS.labelMinWidth} 1fr`,
  gap: '8px',
  alignItems: 'flex-start',
  marginBottom: '10px',
  fontSize: MODAL_TOKENS.infoFontSize,
  lineHeight: 1.5,
};

/** Label dans une info row */
export const infoLabelStyle = {
  fontWeight: MODAL_TOKENS.labelWeight,
  color: MODAL_TOKENS.labelColor,
};

/** Valeur dans une info row */
export const infoValueStyle = {
  color: MODAL_TOKENS.valueColor,
};

/** Grille 2 colonnes */
export const twoColGrid = (isMobile = false) => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
  gap: '12px',
});

/**
 * Champ en lecture seule — pattern "ClientForm-inspired"
 * Utiliser dans une grille twoColGrid() pour afficher les infos structurées.
 */
export const readFieldWrapper = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
};

/** Libellé d'un champ en lecture (petit, gris, majuscules) */
export const readFieldLabel = {
  fontSize: '10px',
  fontWeight: '700',
  color: '#94A3B8',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
};

/** Valeur d'un champ en lecture */
export const readFieldValue = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1F2937',
  lineHeight: 1.4,
};

/** Tag/badge de compétence ou label */
export const tagStyle = (bg = '#EFF6FF', color = '#3B82F6') => ({
  padding: '4px 10px',
  background: bg,
  color,
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '700',
  display: 'inline-flex',
  alignItems: 'center',
});

/** Bouton principal modal footer */
export const primaryBtnStyle = {
  padding: '11px 24px',
  background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '700',
  fontSize: '14px',
  boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
  transition: 'opacity 0.15s',
};

/** Bouton secondaire modal footer */
export const secondaryBtnStyle = {
  padding: '11px 24px',
  background: 'white',
  color: '#374151',
  border: '1.5px solid #E5E7EB',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px',
  transition: 'border-color 0.15s',
};

/** Bouton danger */
export const dangerBtnStyle = {
  padding: '11px 24px',
  background: '#FEF2F2',
  color: '#EF4444',
  border: '1.5px solid #FECACA',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '700',
  fontSize: '14px',
};

/** Séparateur discret */
export const dividerStyle = {
  height: '1px',
  background: '#F3F4F6',
  margin: '0 0 20px',
};

/** Avatar rond (candidat) */
export const avatarStyle = (color = '#667EEA') => ({
  width: MODAL_TOKENS.avatarSize,
  height: MODAL_TOKENS.avatarSize,
  borderRadius: MODAL_TOKENS.avatarRadius,
  background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '28px',
  flexShrink: 0,
  boxShadow: `0 4px 12px ${color}40`,
});

/** Icône carrée arrondie (mission, client) */
export const iconBoxStyle = (color = '#667EEA') => ({
  width: MODAL_TOKENS.iconSize,
  height: MODAL_TOKENS.iconSize,
  borderRadius: MODAL_TOKENS.iconRadius,
  background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '26px',
  flexShrink: 0,
  boxShadow: `0 4px 12px ${color}40`,
});

/** En-tête de modal (zone titre + avatar) */
export const modalHeaderInner = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

export const modalHeaderTitle = {
  fontSize: MODAL_TOKENS.titleSize,
  fontWeight: MODAL_TOKENS.titleWeight,
  color: MODAL_TOKENS.titleColor,
  marginBottom: '4px',
  lineHeight: 1.2,
};

export const modalHeaderSubtitle = {
  fontSize: MODAL_TOKENS.subtitleSize,
  color: MODAL_TOKENS.subtitleColor,
  fontWeight: '500',
  marginBottom: '8px',
};

/** Barre de progression */
export const progressBarContainer = {
  height: '6px',
  background: '#E5E7EB',
  borderRadius: '3px',
  overflow: 'hidden',
};

export const progressBar = (pct = 0, color = '#667EEA') => ({
  height: '100%',
  width: `${pct}%`,
  background: color,
  borderRadius: '3px',
  transition: 'width 0.4s ease',
});

/** Footer modal */
export const modalFooterStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  alignItems: 'center',
  paddingTop: '4px',
};
