/**
 * Tokens de design - Thème de l'application
 * Définit les couleurs, espacements, typographie, etc.
 */

export const theme = {
  // Palette de couleurs
  colors: {
    // Couleurs primaires
    primary: {
      50: '#F5F3FF',
      100: '#EDE9FE',
      200: '#DDD6FE',
      300: '#C4B5FD',
      400: '#A78BFA',
      500: '#8B5CF6', // Main
      600: '#7C3AED',
      700: '#6D28D9',
      800: '#5B21B6',
      900: '#4C1D95',
    },

    // Couleurs secondaires
    secondary: {
      50: '#FFF1F2',
      100: '#FFE4E6',
      200: '#FECDD3',
      300: '#FDA4AF',
      400: '#FB7185',
      500: '#F43F5E',
      600: '#E11D48',
      700: '#BE123C',
      800: '#9F1239',
      900: '#881337',
    },

    // Couleurs neutres
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },

    // Couleurs de statut
    success: {
      light: '#D1FAE5',
      main: '#10B981',
      dark: '#047857',
    },
    warning: {
      light: '#FEF3C7',
      main: '#F59E0B',
      dark: '#D97706',
    },
    error: {
      light: '#FEE2E2',
      main: '#EF4444',
      dark: '#DC2626',
    },
    info: {
      light: '#DBEAFE',
      main: '#3B82F6',
      dark: '#2563EB',
    },

    // Gradients
    gradients: {
      primary: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
      secondary: 'linear-gradient(135deg, #FF6B9D 0%, #C06595 100%)',
      success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      warning: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
      purple: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)',
    },

    // Couleurs spécifiques
    background: '#FFFFFF',
    backgroundAlt: '#F9FAFB',
    text: '#1F2937',
    textLight: '#6B7280',
    border: '#E5E7EB',
    hover: '#F3F4F6',
  },

  // Espacements (en px)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
    '4xl': 96,
  },

  // Border radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },

  // Ombres
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    card: '0 8px 32px rgba(0,0,0,0.08)',
  },

  // Typographie
  typography: {
    fontFamily: {
      base: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      heading: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
    },

    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
      '6xl': '64px',
    },

    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },

    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Breakpoints pour responsive
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },

  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

// Export des couleurs individuellement pour faciliter l'utilisation
export const { colors, spacing, borderRadius, shadows, typography, breakpoints, transitions, zIndex } = theme;

export default theme;
