import React, { ReactNode } from 'react';
import { getPalestinianLegalColors } from './PalestinianLegalTheme';

export interface LegalCardProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  className?: string;
  darkMode?: boolean;
  borderColor?: string;
  icon?: ReactNode;
  title?: string;
  subtitle?: string;
  onClick?: () => void;
}

const LegalCard: React.FC<LegalCardProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  hoverable = false,
  className = '',
  darkMode = false,
  borderColor,
  icon,
  title,
  subtitle,
  onClick
}) => {
  const colors = getPalestinianLegalColors(darkMode);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: darkMode ? 'rgba(44, 95, 45, 0.1)' : 'rgba(44, 95, 45, 0.05)',
          borderColor: colors.primary,
          color: colors.primaryText
        };
      case 'secondary':
        return {
          backgroundColor: darkMode ? 'rgba(0, 122, 61, 0.1)' : 'rgba(0, 122, 61, 0.05)',
          borderColor: colors.secondary,
          color: colors.primaryText
        };
      case 'accent':
        return {
          backgroundColor: darkMode ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.05)',
          borderColor: colors.accent,
          color: colors.primaryText
        };
      default:
        return {
          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          color: colors.primaryText
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '1rem',
          borderRadius: '8px'
        };
      case 'lg':
        return {
          padding: '2rem',
          borderRadius: '16px'
        };
      default:
        return {
          padding: '1.5rem',
          borderRadius: '12px'
        };
    }
  };

  const baseStyles = {
    border: `2px solid ${borderColor || getVariantStyles().borderColor}`,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    cursor: onClick ? 'pointer' : 'default',
    ...getVariantStyles(),
    ...getSizeStyles()
  };

  const hoverStyles = hoverable ? {
    transform: 'translateY(-4px)',
    boxShadow: darkMode 
      ? '0 8px 25px rgba(212, 175, 55, 0.15)' 
      : '0 8px 25px rgba(44, 95, 45, 0.15)'
  } : {};

  return (
    <div
      style={baseStyles}
      className={className}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hoverable) {
          Object.assign(e.currentTarget.style, hoverStyles);
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* Palestinian Pattern Border Accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, ${colors.palestineRed} 0%, ${colors.palestineGreen} 50%, ${colors.legalGold} 100%)`,
        opacity: 0.8
      }} />

      {/* Header with Icon and Title */}
      {(icon || title) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: subtitle ? '8px' : '16px'
        }}>
          {icon && (
            <div style={{
              fontSize: size === 'lg' ? '2rem' : size === 'sm' ? '1.2rem' : '1.5rem',
              color: getVariantStyles().borderColor
            }}>
              {icon}
            </div>
          )}
          {title && (
            <h3 style={{
              margin: 0,
              fontSize: size === 'lg' ? '1.25rem' : size === 'sm' ? '1rem' : '1.125rem',
              fontWeight: 700,
              color: colors.secondaryText,
              fontFamily: "'Amiri', 'Times New Roman', serif"
            }}>
              {title}
            </h3>
          )}
        </div>
      )}

      {/* Subtitle */}
      {subtitle && (
        <p style={{
          margin: '0 0 16px 0',
          fontSize: '0.875rem',
          color: colors.mutedText,
          fontFamily: "'Tajawal', sans-serif"
        }}>
          {subtitle}
        </p>
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>

      {/* Subtle Pattern Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '60px',
        height: '60px',
        opacity: 0.05,
        background: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><path d='M20 0L40 20L20 40L0 20Z' fill='${colors.legalGold.slice(1)}'/></svg>")`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat'
      }} />
    </div>
  );
};

export default LegalCard;