/**
 * Palestinian Legal Theme Configuration
 * Professional and culturally appropriate design for Palestinian legal system
 * Inspired by Palestinian heritage colors and professional legal aesthetics
 */

export interface PalestinianLegalColors {
  // Palestinian Heritage Colors
  palestineRed: string;
  palestineGreen: string;
  palestineBlack: string;
  palestineWhite: string;
  
  // Professional Legal Colors
  legalGold: string;
  legalBrown: string;
  legalBeige: string;
  justiceBlue: string;
  
  // Main Color Schemes
  primary: string;
  secondary: string;
  accent: string;
  
  // Background Gradients (stable, no webkit issues)
  primaryGradient: string;
  secondaryGradient: string;
  heroGradient: string;
  cardGradient: string;
  
  // Text Colors (solid, reliable)
  primaryText: string;
  secondaryText: string;
  accentText: string;
  mutedText: string;
  
  // Interactive States
  hover: string;
  active: string;
  disabled: string;
  
  // Semantic Colors
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface PalestinianLegalTheme {
  colors: PalestinianLegalColors;
  typography: {
    fontFamily: {
      primary: string;
      secondary: string;
      arabic: string;
    };
    fontSizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
      huge: string;
    };
    fontWeights: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
      extrabold: number;
    };
    lineHeights: {
      tight: number;
      normal: number;
      relaxed: number;
      loose: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

export const getPalestinianLegalColors = (darkMode: boolean): PalestinianLegalColors => {
  const baseColors = {
    // Palestinian Heritage Colors
    palestineRed: '#CE1126',     // Palestinian flag red
    palestineGreen: '#007A3D',   // Palestinian flag green  
    palestineBlack: '#000000',   // Palestinian flag black
    palestineWhite: '#FFFFFF',   // Palestinian flag white
    
    // Professional Legal Colors
    legalGold: '#D4AF37',        // Classic legal gold
    legalBrown: '#8B4513',       // Traditional legal brown
    legalBeige: '#F5F5DC',       // Elegant beige
    justiceBlue: '#2C5F2D',      // Deep justice blue
  };

  if (darkMode) {
    return {
      ...baseColors,
      
      // Main Colors - Dark Mode
      primary: '#D4AF37',          // Legal gold for primary
      secondary: '#007A3D',        // Palestine green for secondary  
      accent: '#CE1126',           // Palestine red for accents
      
      // Stable Background Gradients (no webkit dependencies)
      primaryGradient: 'linear-gradient(135deg, #1a1a2e 0%, #2d3748 50%, #1a202c 100%)',
      secondaryGradient: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
      heroGradient: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #2d3748 100%)',
      cardGradient: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      
      // Reliable Text Colors (solid colors, no gradients)
      primaryText: '#FFFFFF',
      secondaryText: '#D4AF37',    // Legal gold
      accentText: '#CE1126',       // Palestine red
      mutedText: '#A0AEC0',
      
      // Interactive States
      hover: '#F7FAFC',
      active: '#EDF2F7',
      disabled: '#4A5568',
      
      // Semantic Colors
      success: '#007A3D',          // Palestine green for success
      warning: '#D4AF37',          // Legal gold for warnings
      error: '#CE1126',            // Palestine red for errors
      info: '#2C5F2D',             // Justice blue for info
    };
  } else {
    return {
      ...baseColors,
      
      // Main Colors - Light Mode
      primary: '#2C5F2D',          // Deep justice blue for primary
      secondary: '#007A3D',        // Palestine green for secondary
      accent: '#D4AF37',           // Legal gold for accents
      
      // Stable Background Gradients
      primaryGradient: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 50%, #e2e8f0 100%)',
      secondaryGradient: 'linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)',
      heroGradient: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 50%, #edf2f7 100%)',
      cardGradient: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
      
      // Reliable Text Colors
      primaryText: '#1A202C',
      secondaryText: '#2C5F2D',    // Deep justice blue
      accentText: '#D4AF37',       // Legal gold
      mutedText: '#718096',
      
      // Interactive States
      hover: '#F7FAFC',
      active: '#EDF2F7',
      disabled: '#E2E8F0',
      
      // Semantic Colors
      success: '#007A3D',          // Palestine green
      warning: '#D69E2E',          // Warm warning
      error: '#CE1126',            // Palestine red
      info: '#2C5F2D',             // Justice blue
    };
  }
};

export const palestinianLegalTheme: Omit<PalestinianLegalTheme, 'colors'> = {
  typography: {
    fontFamily: {
      primary: "'Amiri', 'Times New Roman', serif",           // Arabic serif for formal legal documents
      secondary: "'Tajawal', 'Segoe UI', sans-serif",        // Arabic sans-serif for UI
      arabic: "'Amiri', 'Tajawal', 'Arial Unicode MS', sans-serif"
    },
    fontSizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      md: '1rem',       // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      xxl: '1.5rem',    // 24px
      huge: '2.5rem'    // 40px
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    }
  },
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    xxl: '3rem'       // 48px
  },
  borderRadius: {
    sm: '0.25rem',    // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  transitions: {
    fast: 'all 0.15s ease',
    normal: 'all 0.3s ease',
    slow: 'all 0.5s ease'
  }
};

// Utility function to get complete theme
export const getPalestinianLegalTheme = (darkMode: boolean): PalestinianLegalTheme => ({
  colors: getPalestinianLegalColors(darkMode),
  ...palestinianLegalTheme
});

export default { getPalestinianLegalColors, palestinianLegalTheme, getPalestinianLegalTheme };