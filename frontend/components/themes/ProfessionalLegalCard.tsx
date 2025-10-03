import React, { ReactNode } from 'react';
import { getProfessionalLegalColors } from './ProfessionalLegalTheme';

export interface ProfessionalLegalCardProps {
  children: ReactNode;
  variant?: 'default' | 'outlined' | 'filled';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  darkMode?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const ProfessionalLegalCard: React.FC<ProfessionalLegalCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  darkMode = false,
  hoverable = false,
  onClick,
  style = {}
}) => {
  const colors = getProfessionalLegalColors(darkMode);

  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          border: `1px solid ${colors.border}`,
        };
      case 'filled':
        return {
          backgroundColor: colors.cardBackground,
          border: 'none',
        };
      default:
        return {
          backgroundColor: colors.cardBackground,
          border: `1px solid ${colors.border}`,
        };
    }
  };

  const getPadding = () => {
    switch (padding) {
      case 'sm':
        return '12px';
      case 'lg':
        return '24px';
      case 'xl':
        return '32px';
      default:
        return '16px';
    }
  };

  const baseStyles = {
    fontFamily: "'Tajawal', 'Segoe UI', sans-serif",
    borderRadius: '0.25rem',
    padding: getPadding(),
    transition: 'all 0.2s ease',
    cursor: onClick ? 'pointer' : 'default',
    boxShadow: 'none',
    ...getVariantStyles(),
    ...style
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable && !onClick) {
      e.currentTarget.style.backgroundColor = darkMode ? colors.hoverBackground : '#F7FAFC';
    }
    if (onClick) {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = darkMode 
        ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
        : '0 4px 6px rgba(0, 0, 0, 0.1)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable && !onClick) {
      const originalStyles = getVariantStyles();
      e.currentTarget.style.backgroundColor = originalStyles.backgroundColor || '';
    }
    if (onClick) {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }
  };

  return (
    <div
      style={baseStyles}
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export default ProfessionalLegalCard;