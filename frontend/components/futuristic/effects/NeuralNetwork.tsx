import React from 'react';
import { getFuturisticColors } from '../ui/FuturisticTheme';

export interface NeuralNetworkProps {
  darkMode?: boolean;
  gridSize?: number;
  opacity?: number;
  animated?: boolean;
  className?: string;
}

const NeuralNetwork: React.FC<NeuralNetworkProps> = ({
  darkMode = false,
  gridSize = 50,
  opacity = 0.1,
  animated = true,
  className = ''
}) => {
  const colors = getFuturisticColors(darkMode);

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        opacity: opacity,
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(${colors.neonBlue} 1px, transparent 1px),
            linear-gradient(90deg, ${colors.neonBlue} 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          animation: animated ? 'gridPulse 4s ease-in-out infinite' : 'none'
        }}
      />

      {/* Connection nodes */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 25% 25%, ${colors.neonBlue} 2px, transparent 2px),
                           radial-gradient(circle at 75% 25%, ${colors.neonPurple} 2px, transparent 2px),
                           radial-gradient(circle at 25% 75%, ${colors.neonGreen} 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, ${colors.neonBlue} 2px, transparent 2px)`,
          backgroundSize: `${gridSize * 4}px ${gridSize * 4}px`,
          animation: animated ? 'nodesPulse 3s ease-in-out infinite' : 'none'
        }}
      />

      <style>{`
        @keyframes gridPulse {
          0%, 100% { opacity: ${opacity}; }
          50% { opacity: ${opacity * 3}; }
        }
        
        @keyframes nodesPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default NeuralNetwork;