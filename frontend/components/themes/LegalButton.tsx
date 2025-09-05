import React, { ReactNode } from 'react';
import { getPalestinianLegalColors } from './PalestinianLegalTheme';

export interface LegalButtonProps {
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

const LegalButton: React.FC<LegalButtonProps> = ({
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
  const colors = getPalestinianLegalColors(darkMode);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          color: darkMode ? colors.primaryText : '#FFFFFF',
          border: `2px solid ${colors.primary}`,
          boxShadow: '0 4px 12px rgba(44, 95, 45, 0.2)'
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
          color: '#FFFFFF',
          border: `2px solid ${colors.secondary}`,
          boxShadow: '0 4px 12px rgba(0, 122, 61, 0.2)'
        };
      case 'accent':
        return {
          backgroundColor: colors.accent,
          color: colors.primaryText,
          border: `2px solid ${colors.accent}`,
          boxShadow: '0 4px 12px rgba(212, 175, 55, 0.2)'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: colors.primary,
          border: `2px solid ${colors.primary}`,
          boxShadow: 'none'
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          color: colors.primary,
          border: '2px solid transparent',
          boxShadow: 'none'
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '8px 16px',
          fontSize: '0.875rem',
          borderRadius: '6px',
          minHeight: '36px'
        };
      case 'lg':
        return {
          padding: '16px 32px',
          fontSize: '1.125rem',
          borderRadius: '12px',
          minHeight: '52px'
        };
      default:
        return {
          padding: '12px 24px',
          fontSize: '1rem',
          borderRadius: '8px',
          minHeight: '44px'
        };
    }
  };

  const baseStyles = {
    fontFamily: "'Tajawal', 'Segoe UI', sans-serif",
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    textDecoration: 'none',
    ...getSizeStyles(),
    ...getVariantStyles()
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      e.currentTarget.style.transform = 'translateY(-2px)';
      if (variant === 'primary') {
        e.currentTarget.style.backgroundColor = '#1e4a20';
      } else if (variant === 'secondary') {
        e.currentTarget.style.backgroundColor = '#005a2e';
      } else if (variant === 'accent') {
        e.currentTarget.style.backgroundColor = '#b8941f';
      } else if (variant === 'outline') {
        e.currentTarget.style.backgroundColor = colors.primary;
        e.currentTarget.style.color = '#FFFFFF';
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      e.currentTarget.style.transform = 'translateY(0)';
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
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      )}
      
      {/* Icon */}
      {!loading && icon && (
        <span style={{ fontSize: '1.2em' }}>{icon}</span>
      )}
      
      {/* Text Content */}
      <span style={{ whiteSpace: 'nowrap' }}>{children}</span>

      {/* Ripple Effect on Click */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
          transform: 'translateX(-100%)',
          transition: 'transform 0.6s ease',
          pointerEvents: 'none'
        }}
        className="ripple-effect"
      />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        button:active .ripple-effect {
          transform: translateX(100%);
        }
      `}</style>
    </button>
  );
};

export default LegalButton;