/**
 * Styles partagés pour toutes les cards (Candidats, Missions, Clients)
 * Garantit un design identique sur les 3 types de cartes.
 */

export const cardBase = {
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  height: '340px',
  display: 'flex',
  flexDirection: 'column',
};

export const cardHoverEnter = (color) => (e) => {
  e.currentTarget.style.transform = 'translateY(-4px)';
  e.currentTarget.style.boxShadow = `0 12px 32px ${color}30`;
};

export const cardHoverLeave = (e) => {
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
};

/** Header flex row : avatar + contenu */
export const cardHeader = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
  marginBottom: '14px',
};

/** Avatar rond 64px avec gradient couleur */
export const cardAvatar = (color) => ({
  width: '64px',
  height: '64px',
  background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '30px',
  flexShrink: 0,
  boxShadow: `0 4px 16px ${color}40`,
});

/** Bloc texte à droite de l'avatar */
export const cardContent = {
  flex: 1,
  minWidth: 0,
};

/** Titre principal */
export const cardTitle = {
  fontSize: '18px',
  fontWeight: '900',
  color: '#1F2937',
  marginBottom: '3px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

/** Sous-titre (poste, client, secteur…) */
export const cardSubtitle = {
  fontSize: '13px',
  color: '#6B7280',
  fontWeight: '600',
  marginBottom: '6px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

/** Ligne de méta-données (localisation, expérience…) */
export const cardMeta = {
  fontSize: '12px',
  color: '#9CA3AF',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
};

/** Conteneur de chips/tags */
export const cardChips = {
  display: 'flex',
  gap: '6px',
  flexWrap: 'wrap',
  marginBottom: '12px',
};

/** Chip individuel (compétence, info…) */
export const cardChip = {
  padding: '4px 10px',
  background: '#EFF6FF',
  color: '#3B82F6',
  borderRadius: '6px',
  fontSize: '11px',
  fontWeight: '600',
};

/** Chip neutre (compteur overflow) */
export const cardChipNeutral = {
  padding: '4px 10px',
  background: '#F3F4F6',
  color: '#6B7280',
  borderRadius: '6px',
  fontSize: '11px',
  fontWeight: '600',
};

/** Footer avec séparateur haut */
export const cardFooter = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 'auto',
  paddingTop: '14px',
  borderTop: '1px solid #E5E7EB',
};

/** Valeur principale footer gauche (salaire, chiffre…) */
export const cardFooterValue = {
  fontSize: '15px',
  fontWeight: '800',
  background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

/** Groupe badges footer droite */
export const cardFooterBadges = {
  display: 'flex',
  gap: '6px',
  alignItems: 'center',
};
