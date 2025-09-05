/**
 * Futuristic Theme Configuration
 * Provides color schemes and design tokens for the futuristic UI components
 */

export interface FuturisticColors {
  primaryGradient: string;
  secondaryGradient: string;
  neonGradient: string;
  heroGradient: string;
  cardGradient: string;
  glassEffect: string;
  neonBlue: string;
  neonPurple: string;
  neonGreen: string;
  neonRed: string;
  hologram: string;
}

export interface FuturisticTheme {
  colors: FuturisticColors;
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
  fontSizes: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    huge: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

export const getFuturisticColors = (darkMode: boolean): FuturisticColors => {
  if (darkMode) {
    return {
      primaryGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondaryGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      neonGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      heroGradient: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
      cardGradient: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      glassEffect: 'rgba(255, 255, 255, 0.08)',
      neonBlue: '#00f5ff',
      neonPurple: '#bf00ff',
      neonGreen: '#39ff14',
      neonRed: '#ff073a',
      hologram: 'linear-gradient(45deg, #00f5ff, #bf00ff, #39ff14, #ff073a)'
    };
  } else {
    return {
      primaryGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondaryGradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      neonGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      heroGradient: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
      cardGradient: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
      glassEffect: 'rgba(255, 255, 255, 0.25)',
      neonBlue: '#0ea5e9',
      neonPurple: '#8b5cf6',
      neonGreen: '#10b981',
      neonRed: '#ef4444',
      hologram: 'linear-gradient(45deg, #0ea5e9, #8b5cf6, #10b981, #f59e0b)'
    };
  }
};

export const futuristicTheme: Omit<FuturisticTheme, 'colors'> = {
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px'
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    xxl: '1.5rem',
    huge: '3rem'
  },
  transitions: {
    fast: 'all 0.15s ease',
    normal: 'all 0.3s ease',
    slow: 'all 0.5s ease'
  }
};

export default { getFuturisticColors, futuristicTheme };