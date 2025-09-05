import React, { ReactNode } from 'react';
import { getFuturisticColors } from './FuturisticTheme';

export interface QuantumButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'neon' | 'hologram';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  darkMode?: boolean;
  icon?: ReactNode;
  loading?: boolean;
}

const QuantumButton: React.FC<QuantumButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  darkMode = false,
  icon,
  loading = false
}) => {
  const colors = getFuturisticColors(darkMode);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: colors.primaryGradient,
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
        };
      case 'secondary':
        return {
          background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          color: darkMode ? '#ffffff' : '#1a1a2e',
          border: `2px solid ${colors.neonBlue}`,
          boxShadow: 'none'
        };
      case 'neon':
        return {
          background: colors.neonGradient,
          color: darkMode ? '#000000' : '#ffffff',
          border: 'none',
          boxShadow: `0 0 20px ${colors.neonBlue}`
        };
      case 'hologram':
        return {
          background: colors.hologram,
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
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
          borderRadius: '8px'
        };
      case 'md':
        return {
          padding: '12px 24px',
          fontSize: '1rem',
          borderRadius: '12px'
        };
      case 'lg':
        return {
          padding: '16px 32px',
          fontSize: '1.1rem',
          borderRadius: '15px'
        };
      default:
        return {};
    }
  };

  const baseStyles = {
    position: 'relative' as const,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    overflow: 'hidden' as const,
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backdropFilter: 'blur(10px)',
    opacity: disabled ? 0.5 : 1,
    transform: disabled ? 'none' : 'translateY(0)',
    ...getSizeStyles(),
    ...getVariantStyles()
  };

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'translateY(-2px)';
      if (variant === 'primary') {
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.4)';
      } else if (variant === 'secondary') {
        e.currentTarget.style.background = colors.neonBlue;
        e.currentTarget.style.color = '#ffffff';
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'translateY(0)';
      if (variant === 'primary') {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.3)';
      } else if (variant === 'secondary') {
        e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.color = darkMode ? '#ffffff' : '#1a1a2e';
      }
    }
  };

  return (
    <button
      style={baseStyles}
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
    >
      {/* Energy Flow Effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
          transform: 'translateX(-100%)',
          animation: loading ? 'energyFlow 1s infinite' : 'energyFlow 2s infinite'
        }}
      />
      
      {/* Button Content */}
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
        {loading ? (
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
        ) : icon ? (
          <span style={{ fontSize: '1.2rem' }}>{icon}</span>
        ) : null}
        {children}
      </span>

      <style jsx>{`
        @keyframes energyFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default QuantumButton;