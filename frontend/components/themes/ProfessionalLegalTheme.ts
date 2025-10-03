/**
 * Professional Legal Theme Configuration
 * Formal and conservative design for legal applications
 * Based on traditional legal colors and professional aesthetics
 */

export interface ProfessionalLegalColors {
  // Traditional Legal Colors
  legalNavy: string;
  legalDarkGray: string;
  legalMediumGray: string;
  legalLightGray: string;
  legalWhite: string;
  
  // Professional Accent Colors
  legalGold: string;
  legalBurgundy: string;
  legalForest: string;
  legalSlate: string;
  
  // Main Color Scheme
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  
  // Text Colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverted: string;
  
  // UI Elements
  border: string;
  inputBackground: string;
  cardBackground: string;
  hoverBackground: string;
  activeBackground: string;
  
  // Status Colors
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ProfessionalLegalTheme {
  colors: ProfessionalLegalColors;
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
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

export const getProfessionalLegalColors = (darkMode: boolean): ProfessionalLegalColors => {
  if (darkMode) {
    return {
      // Traditional Legal Colors
      legalNavy: '#0A2A66',
      legalDarkGray: '#2D3748',
      legalMediumGray: '#4A5568',
      legalLightGray: '#718096',
      legalWhite: '#FFFFFF',
      
      // Professional Accent Colors
      legalGold: '#B8860B',
      legalBurgundy: '#800020',
      legalForest: '#228B22',
      legalSlate: '#708090',
      
      // Main Color Scheme
      primary: '#0A2A66',          // Deep navy for primary
      secondary: '#2D3748',        // Dark gray for secondary
      accent: '#B8860B',           // Gold for accents
      background: '#1A202C',       // Dark background
      
      // Text Colors
      textPrimary: '#FFFFFF',      // White text
      textSecondary: '#E2E8F0',    // Light gray text
      textMuted: '#A0AEC0',        // Muted text
      textInverted: '#1A202C',     // Inverted text
      
      // UI Elements
      border: '#4A5568',           // Medium gray border
      inputBackground: '#2D3748',  // Dark input background
      cardBackground: '#2D3748',   // Card background
      hoverBackground: '#4A5568',  // Hover state
      activeBackground: '#718096',  // Active state
      
      // Status Colors
      success: '#228B22',          // Forest green
      warning: '#B8860B',          // Gold
      error: '#800020',            // Burgundy
      info: '#708090',             // Slate
    };
  } else {
    return {
      // Traditional Legal Colors
      legalNavy: '#0A2A66',
      legalDarkGray: '#2D3748',
      legalMediumGray: '#4A5568',
      legalLightGray: '#718096',
      legalWhite: '#FFFFFF',
      
      // Professional Accent Colors
      legalGold: '#B8860B',
      legalBurgundy: '#800020',
      legalForest: '#228B22',
      legalSlate: '#708090',
      
      // Main Color Scheme
      primary: '#0A2A66',          // Deep navy for primary
      secondary: '#2D3748',        // Dark gray for secondary
      accent: '#B8860B',           // Gold for accents
      background: '#FFFFFF',       // White background
      
      // Text Colors
      textPrimary: '#2D3748',      // Dark gray text
      textSecondary: '#4A5568',    // Medium gray text
      textMuted: '#718096',        // Light gray text
      textInverted: '#FFFFFF',     // Inverted text
      
      // UI Elements
      border: '#CBD5E0',           // Light gray border
      inputBackground: '#FFFFFF',  // White input background
      cardBackground: '#FFFFFF',   // White card background
      hoverBackground: '#F7FAFC',  // Light hover state
      activeBackground: '#EDF2F7', // Active state
      
      // Status Colors
      success: '#228B22',          // Forest green
      warning: '#B8860B',          // Gold
      error: '#800020',            // Burgundy
      info: '#708090',             // Slate
    };
  }
};

export const professionalLegalTheme: Omit<ProfessionalLegalTheme, 'colors'> = {
  typography: {
    fontFamily: {
      primary: "'Tajawal', 'Segoe UI', sans-serif",       // Arabic sans-serif for UI
      secondary: "'Amiri', 'Georgia', serif",             // Arabic serif for formal content
      arabic: "'Tajawal', 'Amiri', 'Arial Unicode MS', sans-serif"
    },
    fontSizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      md: '1rem',       // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      xxl: '1.5rem',    // 24px
      huge: '2rem'      // 32px
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
      relaxed: 1.75
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
    sm: '0.125rem',   // 2px - minimal for formal look
    md: '0.25rem',    // 4px
    lg: '0.375rem',   // 6px
    xl: '0.5rem'      // 8px
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    lg: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  },
  transitions: {
    fast: 'all 0.1s ease',
    normal: 'all 0.2s ease',
    slow: 'all 0.3s ease'
  }
};

// Utility function to get complete theme
export const getProfessionalLegalTheme = (darkMode: boolean): ProfessionalLegalTheme => ({
  colors: getProfessionalLegalColors(darkMode),
  ...professionalLegalTheme
});

export default { getProfessionalLegalColors, professionalLegalTheme, getProfessionalLegalTheme };