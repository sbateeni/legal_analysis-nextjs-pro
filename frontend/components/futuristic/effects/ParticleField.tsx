import React, { useEffect, useState, useRef } from 'react';
import { getFuturisticColors } from '../ui/FuturisticTheme';

export interface ParticleFieldProps {
  particleCount?: number;
  particleSpeed?: number;
  particleSize?: number;
  darkMode?: boolean;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

const ParticleField: React.FC<ParticleFieldProps> = ({
  particleCount = 20,
  particleSpeed = 0.5,
  particleSize = 2,
  darkMode = false,
  className = ''
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [activeParticle, setActiveParticle] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const colors = getFuturisticColors(darkMode);

  // Initialize particles
  useEffect(() => {
    const initParticles: Particle[] = [];
    const particleColors = [colors.neonBlue, colors.neonPurple, colors.neonGreen];

    for (let i = 0; i < particleCount; i++) {
      initParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * particleSpeed,
        vy: (Math.random() - 0.5) * particleSpeed,
        size: particleSize + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.7,
        color: particleColors[Math.floor(Math.random() * particleColors.length)]
      });
    }
    setParticles(initParticles);
  }, [particleCount, particleSpeed, particleSize, colors]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setParticles(prev => prev.map(particle => {
        let newX = particle.x + particle.vx;
        let newY = particle.y + particle.vy;
        let newVx = particle.vx;
        let newVy = particle.vy;

        // Bounce off walls
        if (newX <= 0 || newX >= 100) {
          newVx = -newVx;
          newX = Math.max(0, Math.min(100, newX));
        }
        if (newY <= 0 || newY >= 100) {
          newVy = -newVy;
          newY = Math.max(0, Math.min(100, newY));
        }

        return {
          ...particle,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy
        };
      }));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Active particle rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveParticle(prev => (prev + 1) % particleCount);
    }, 150);
    return () => clearInterval(interval);
  }, [particleCount]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      {particles.map((particle, index) => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: '50%',
            opacity: particle.opacity,
            transform: activeParticle === index ? 'scale(2)' : 'scale(1)',
            boxShadow: activeParticle === index ? `0 0 10px ${particle.color}` : 'none',
            transition: 'all 0.3s ease',
            animation: 'particleFloat 4s ease-in-out infinite',
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}

      <style jsx>{`
        @keyframes particleFloat {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(var(--scale, 1)); 
            opacity: var(--opacity, 0.6); 
          }
          25% { 
            transform: translateY(-10px) translateX(5px) scale(var(--scale, 1)); 
            opacity: 1; 
          }
          50% { 
            transform: translateY(-5px) translateX(-5px) scale(var(--scale, 1)); 
            opacity: 0.8; 
          }
          75% { 
            transform: translateY(-15px) translateX(3px) scale(var(--scale, 1)); 
            opacity: 1; 
          }
        }
      `}</style>
    </div>
  );
};

export default ParticleField;