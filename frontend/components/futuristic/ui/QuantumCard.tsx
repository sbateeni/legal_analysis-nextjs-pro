import React, { ReactNode, useState } from 'react';
import { getFuturisticColors } from './FuturisticTheme';

export interface QuantumCardProps {
  children: ReactNode;
  variant?: 'glass' | 'neon' | 'hologram' | 'minimal';
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  darkMode?: boolean;
  borderColor?: string;
  onClick?: () => void;
}

const QuantumCard: React.FC<QuantumCardProps> = ({
  children,
  variant = 'glass',
  hoverable = true,
  padding = 'md',
  className = '',
  darkMode = false,
  borderColor,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const colors = getFuturisticColors(darkMode);

  const getVariantStyles = () => {
    switch (variant) {
      case 'glass':
        return {
          background: colors.cardGradient,
          border: `1px solid ${borderColor || colors.neonBlue}`,
          backdropFilter: 'blur(20px)',
          boxShadow: isHovered && hoverable ? '0 20px 40px rgba(0, 245, 255, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.1)'
        };
      case 'neon':
        return {
          background: darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
          border: `2px solid ${borderColor || colors.neonBlue}`,
          backdropFilter: 'blur(10px)',
          boxShadow: isHovered && hoverable ? `0 0 30px ${colors.neonBlue}` : `0 0 10px ${colors.neonBlue}`
        };
      case 'hologram':
        return {
          background: 'transparent',
          border: `2px solid transparent`,
          backgroundImage: colors.hologram,
          backgroundClip: 'padding-box',
          position: 'relative' as const,
          boxShadow: isHovered && hoverable ? '0 25px 50px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.1)'
        };
      case 'minimal':
        return {
          background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          border: `1px solid ${borderColor || 'rgba(255, 255, 255, 0.1)'}`,
          backdropFilter: 'blur(5px)',
          boxShadow: isHovered && hoverable ? '0 10px 25px rgba(0, 0, 0, 0.1)' : 'none'
        };
      default:
        return {};
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'sm':
        return { padding: '16px 20px' };
      case 'md':
        return { padding: '24px 30px' };
      case 'lg':
        return { padding: '40px 50px' };
      default:
        return {};
    }
  };

  const baseStyles = {
    borderRadius: '16px',
    transition: 'all 0.4s ease',
    cursor: onClick ? 'pointer' : 'default',
    transform: isHovered && hoverable ? 'translateY(-8px)' : 'translateY(0)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    ...getPaddingStyles(),
    ...getVariantStyles()
  };

  const handleMouseEnter = () => {
    if (hoverable) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (hoverable) {
      setIsHovered(false);
    }
  };

  return (
    <div
      style={baseStyles}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Shimmer Effect for Glass Cards */}
      {variant === 'glass' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
            transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
            transition: 'transform 0.6s ease',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Hologram Background for Hologram Cards */}
      {variant === 'hologram' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: colors.cardGradient,
            margin: '2px',
            borderRadius: '14px',
            zIndex: 0
          }}
        />
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default QuantumCard;