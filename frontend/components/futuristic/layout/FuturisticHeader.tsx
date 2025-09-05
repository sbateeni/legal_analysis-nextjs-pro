import React, { ReactNode } from 'react';
import Link from 'next/link';
import { getFuturisticColors } from '../ui/FuturisticTheme';
import QuantumButton from '../ui/QuantumButton';

export interface FuturisticHeaderProps {
  darkMode: boolean;
  onThemeToggle: () => void;
  logoText?: string;
  logoSubText?: string;
  navItems?: Array<{
    href: string;
    label: string;
    icon?: ReactNode;
  }>;
  rightContent?: ReactNode;
  className?: string;
}

const FuturisticHeader: React.FC<FuturisticHeaderProps> = ({
  darkMode,
  onThemeToggle,
  logoText = 'التحليل القانوني',
  logoSubText = 'LEGAL AI',
  navItems = [],
  rightContent,
  className = ''
}) => {
  const colors = getFuturisticColors(darkMode);

  return (
    <header
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backdropFilter: 'blur(20px)'
      }}
    >
      <div
        style={{
          background: darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
          borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 0'
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  background: colors.hologram,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  animation: 'orbPulse 2s ease-in-out infinite',
                  position: 'relative'
                }}
              >
                ⚖️
                <div
                  style={{
                    position: 'absolute',
                    inset: '-4px',
                    background: colors.hologram,
                    borderRadius: '50%',
                    opacity: 0.3,
                    animation: 'orbGlow 3s ease-in-out infinite'
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                <span
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    background: colors.hologram,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {logoText}
                </span>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: colors.neonBlue,
                    letterSpacing: '2px',
                    opacity: 0.8
                  }}
                >
                  {logoSubText}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '32px'
              }}
            >
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  style={{
                    color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(26, 26, 46, 0.8)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = darkMode ? '#ffffff' : '#000000';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = `${colors.neonGradient}22`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(26, 26, 46, 0.8)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {item.icon && <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>}
                  {item.label}
                </Link>
              ))}

              {/* Theme Toggle */}
              <button
                onClick={onThemeToggle}
                style={{
                  width: '50px',
                  height: '50px',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  position: 'relative',
                  background: 'transparent',
                  padding: 0
                }}
                title={darkMode ? 'النمط النهاري' : 'النمط الليلي'}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: colors.primaryGradient,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = `0 0 20px ${colors.neonBlue}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>
                    {darkMode ? '☀️' : '🌙'}
                  </span>
                </div>
              </button>

              {/* Right Content */}
              {rightContent}
            </nav>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes orbPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes orbGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </header>
  );
};

export default FuturisticHeader;