import React, { ReactNode } from 'react';
import { getFuturisticColors } from '../ui/FuturisticTheme';

export interface HolographicDisplayProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  darkMode?: boolean;
  animated?: boolean;
  className?: string;
}

const HolographicDisplay: React.FC<HolographicDisplayProps> = ({
  children,
  size = 'md',
  darkMode = false,
  animated = true,
  className = ''
}) => {
  const colors = getFuturisticColors(darkMode);

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { width: '200px', height: '200px' };
      case 'md':
        return { width: '300px', height: '300px' };
      case 'lg':
        return { width: '400px', height: '400px' };
      default:
        return { width: '300px', height: '300px' };
    }
  };

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        ...getSizeStyles()
      }}
    >
      {/* Main holographic frame */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
          border: `2px solid ${colors.neonBlue}`,
          borderRadius: '20px',
          position: 'relative',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden'
        }}
      >
        {/* Animated border glow */}
        <div
          style={{
            position: 'absolute',
            inset: '-2px',
            background: colors.hologram,
            borderRadius: '22px',
            opacity: 0.3,
            animation: animated ? 'framePulse 3s ease-in-out infinite' : 'none'
          }}
        />

        {/* Content area */}
        <div
          style={{
            position: 'absolute',
            inset: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}
        >
          {children}
        </div>

        {/* Data streams */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '2px',
                height: '100%',
                left: '50%',
                transformOrigin: 'center bottom',
                transform: `rotate(${i * 60}deg)`,
                opacity: 0.6
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '60%',
                  background: `linear-gradient(to top, ${colors.neonBlue}, transparent)`,
                  animation: animated ? 'streamFlow 2s ease-in-out infinite' : 'none',
                  animationDelay: `${i * 0.2}s`
                }}
              />
            </div>
          ))}
        </div>

        {/* Outer glow */}
        <div
          style={{
            position: 'absolute',
            inset: '-20px',
            background: `radial-gradient(circle, ${colors.neonBlue}22 0%, transparent 70%)`,
            animation: animated ? 'glowPulse 4s ease-in-out infinite' : 'none',
            pointerEvents: 'none'
          }}
        />
      </div>

      <style>{`
        @keyframes framePulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes streamFlow {
          0% { height: 0%; opacity: 0; }
          50% { height: 60%; opacity: 1; }
          100% { height: 0%; opacity: 0; }
        }
        
        @keyframes glowPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default HolographicDisplay;