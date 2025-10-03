import React, { ReactNode } from 'react';
import { getProfessionalLegalColors } from './ProfessionalLegalTheme';

export interface ProfessionalLegalButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  darkMode?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const ProfessionalLegalButton: React.FC<ProfessionalLegalButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  darkMode = false,
  icon,
  fullWidth = false,
  type = 'button'
}) => {
  const colors = getProfessionalLegalColors(darkMode);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          color: colors.textInverted,
          border: `1px solid ${colors.primary}`,
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
          color: colors.textInverted,
          border: `1px solid ${colors.secondary}`,
        };
      case 'accent':
        return {
          backgroundColor: colors.accent,
          color: colors.textInverted,
          border: `1px solid ${colors.accent}`,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: darkMode ? colors.textPrimary : colors.primary,
          border: `1px solid ${darkMode ? colors.textPrimary : colors.primary}`,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          color: darkMode ? colors.textPrimary : colors.primary,
          border: '1px solid transparent',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '6px 12px',
          fontSize: '0.875rem',
          borderRadius: '0.25rem',
          minHeight: '32px'
        };
      case 'lg':
        return {
          padding: '12px 24px',
          fontSize: '1.125rem',
          borderRadius: '0.375rem',
          minHeight: '48px'
        };
      default:
        return {
          padding: '8px 16px',
          fontSize: '1rem',
          borderRadius: '0.25rem',
          minHeight: '40px'
        };
    }
  };

  const baseStyles = {
    fontFamily: "'Tajawal', 'Segoe UI', sans-serif",
    fontWeight: 500,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    textDecoration: 'none',
    boxShadow: 'none',
    ...getSizeStyles(),
    ...getVariantStyles()
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      if (variant === 'primary') {
        e.currentTarget.style.backgroundColor = darkMode ? '#1A3A86' : '#1A3A86';
      } else if (variant === 'secondary') {
        e.currentTarget.style.backgroundColor = darkMode ? '#3D4758' : '#3D4758';
      } else if (variant === 'accent') {
        e.currentTarget.style.backgroundColor = darkMode ? '#C8961B' : '#C8961B';
      } else if (variant === 'outline' || variant === 'text') {
        e.currentTarget.style.backgroundColor = darkMode ? colors.hoverBackground : '#F7FAFC';
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      const originalStyles = getVariantStyles();
      e.currentTarget.style.backgroundColor = originalStyles.backgroundColor || '';
      e.currentTarget.style.color = originalStyles.color || '';
    }
  };

  return (
    <button
      type={type}
      style={baseStyles}
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || loading}
    >
      {/* Loading Spinner */}
      {loading && (
        <div
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      )}
      
      {/* Icon */}
      {!loading && icon && (
        <span style={{ fontSize: '1.1em' }}>{icon}</span>
      )}
      
      {/* Text Content */}
      <span>{children}</span>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default ProfessionalLegalButton;