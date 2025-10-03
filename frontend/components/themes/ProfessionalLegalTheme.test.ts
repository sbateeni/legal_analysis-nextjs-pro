// Simple test file for Professional Legal Theme
import { getProfessionalLegalColors, getProfessionalLegalTheme } from './ProfessionalLegalTheme';

// Test light mode colors
const lightColors = getProfessionalLegalColors(false);
console.log('Light mode colors:', lightColors);

// Test dark mode colors
const darkColors = getProfessionalLegalColors(true);
console.log('Dark mode colors:', darkColors);

// Test theme configuration
const theme = getProfessionalLegalTheme(false);
console.log('Theme configuration:', theme);

// Verify that required colors exist
if (lightColors.primary === '#0A2A66' && 
    lightColors.secondary === '#2D3748' && 
    lightColors.accent === '#B8860B') {
  console.log('✓ Light mode colors are correct');
} else {
  console.error('✗ Light mode colors are incorrect');
}

if (darkColors.primary === '#0A2A66' && 
    darkColors.secondary === '#2D3748' && 
    darkColors.accent === '#B8860B') {
  console.log('✓ Dark mode colors are correct');
} else {
  console.error('✗ Dark mode colors are incorrect');
}

if (theme.typography.fontFamily.primary === "'Tajawal', 'Segoe UI', sans-serif" && 
    theme.typography.fontFamily.secondary === "'Amiri', 'Georgia', serif") {
  console.log('✓ Theme configuration is correct');
} else {
  console.error('✗ Theme configuration is incorrect');
}

export { getProfessionalLegalColors, getProfessionalLegalTheme };