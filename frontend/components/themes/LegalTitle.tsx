import React from 'react';
import { getPalestinianLegalColors } from './PalestinianLegalTheme';

export interface LegalTitleProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'accent' | 'heritage';
  darkMode?: boolean;
  className?: string;
  textAlign?: 'left' | 'center' | 'right';
  icon?: React.ReactNode;
}

const LegalTitle: React.FC<LegalTitleProps> = ({
  children,
  size = 'md',
  variant = 'primary',
  darkMode = false,
  className = '',
  textAlign = 'center',
  icon
}) => {
  const colors = getPalestinianLegalColors(darkMode);

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          fontSize: '1.5rem',
          marginBottom: '16px'
        };
      case 'lg':
        return {
          fontSize: '3rem',
          marginBottom: '32px'
        };
      case 'xl':
        return {
          fontSize: '4rem',
          marginBottom: '40px'
        };
      default:
        return {
          fontSize: '2.25rem',
          marginBottom: '24px'
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          color: colors.primary,
          textShadow: darkMode 
            ? `0 0 20px ${colors.primary}33` 
            : `0 2px 8px ${colors.primary}22`
        };
      case 'secondary':
        return {
          color: colors.secondary,
          textShadow: darkMode 
            ? `0 0 20px ${colors.secondary}33` 
            : `0 2px 8px ${colors.secondary}22`
        };
      case 'accent':
        return {
          color: colors.accent,
          textShadow: darkMode 
            ? `0 0 20px ${colors.accent}33` 
            : `0 2px 8px ${colors.accent}22`
        };
      case 'heritage':
        return {
          color: colors.palestineRed,
          textShadow: darkMode 
            ? `0 0 20px ${colors.palestineRed}33` 
            : `0 2px 8px ${colors.palestineRed}22`
        };
      default:
        return {
          color: colors.primaryText
        };
    }
  };

  return (
    <h2 
      className={className}
      style={{
        fontFamily: "'Amiri', 'Times New Roman', serif",
        fontWeight: 900,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        textAlign,
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
        gap: icon ? '16px' : '0',
        ...getSizeStyles(),
        ...getVariantStyles()
      }}
    >
      {icon && (
        <span style={{
          fontSize: size === 'xl' ? '4rem' : size === 'lg' ? '3rem' : size === 'sm' ? '1.5rem' : '2.25rem',
          display: 'inline-block'
        }}>
          {icon}
        </span>
      )}
      {children}
    </h2>
  );
};

export default LegalTitle;