import React from 'react';
import { getPalestinianLegalColors } from './PalestinianLegalTheme';

export interface LegalHeroIconProps {
  darkMode?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

const LegalHeroIcon: React.FC<LegalHeroIconProps> = ({
  darkMode = false,
  size = 'lg',
  animated = true,
  className = ''
}) => {
  const colors = getPalestinianLegalColors(darkMode);

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { fontSize: '2rem' };
      case 'md':
        return { fontSize: '4rem' };
      case 'lg':
        return { fontSize: '6rem' };
      case 'xl':
        return { fontSize: '8rem' };
      default:
        return { fontSize: '6rem' };
    }
  };

  return (
    <div 
      className={className}
      style={{
        textAlign: 'center',
        marginBottom: '24px'
      }}
    >
      {/* Palestinian Legal Justice Scale - Stable Color, No Gradients */}
      <div style={{
        ...getSizeStyles(),
        color: colors.legalGold,
        textShadow: darkMode 
          ? `0 0 30px ${colors.legalGold}44, 0 0 60px ${colors.legalGold}22` 
          : `0 4px 12px ${colors.legalGold}33, 0 8px 24px ${colors.legalGold}22`,
        display: 'inline-block',
        position: 'relative',
        animation: animated ? 'legalIconFloat 4s ease-in-out infinite' : 'none',
        filter: darkMode ? 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.3))' : 'none'
      }}>
        ⚖️
      </div>

      {/* Palestinian Pattern Background */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '120%',
        height: '120%',
        opacity: 0.1,
        background: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><pattern id='palestinian-pattern' patternUnits='userSpaceOnUse' width='10' height='10'><rect width='10' height='10' fill='none'/><path d='M5,0 L10,5 L5,10 L0,5 Z' fill='%23${colors.palestineRed.slice(1)}' opacity='0.3'/></pattern><rect width='100' height='100' fill='url(%23palestinian-pattern)'/></svg>")`,
        backgroundSize: '20px 20px',
        borderRadius: '50%',
        zIndex: -1
      }} />

      <style>{`
        @keyframes legalIconFloat {
          0%, 100% { 
            transform: translateY(0px) rotateZ(0deg); 
          }
          25% { 
            transform: translateY(-8px) rotateZ(1deg); 
          }
          50% { 
            transform: translateY(-4px) rotateZ(0deg); 
          }
          75% { 
            transform: translateY(-12px) rotateZ(-1deg); 
          }
        }
      `}</style>
    </div>
  );
};

export default LegalHeroIcon;