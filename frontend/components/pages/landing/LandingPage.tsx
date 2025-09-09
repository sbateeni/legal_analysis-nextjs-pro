import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  getFuturisticColors, 
  QuantumButton, 
  QuantumCard, 
  ParticleField, 
  NeuralNetwork, 
  HolographicDisplay,
  FuturisticHeader
} from '../../futuristic';
import {
  LegalStats,
  LegalTitle,
  LegalHeroIcon,
  LegalButton,
  getPalestinianLegalColors
} from '../../themes';

interface LandingPageProps {
  onSkip?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSkip }) => {
  const { toggleTheme, darkMode, theme, mounted } = useTheme();
  const [stats, setStats] = useState({
    casesAnalyzed: 0,
    users: 0,
    stagesCompleted: 0,
    satisfactionRate: 0
  });
  const [currentParticle, setCurrentParticle] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const futuristicColors = getFuturisticColors(darkMode);
  const palestinianColors = getPalestinianLegalColors(darkMode);

  // Advanced animation effects
  useEffect(() => {
    const animateStats = () => {
      const targetStats = {
        casesAnalyzed: 1250,
        users: 850,
        stagesCompleted: 15600,
        satisfactionRate: 98
      };

      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setStats({
          casesAnalyzed: Math.floor(targetStats.casesAnalyzed * progress),
          users: Math.floor(targetStats.users * progress),
          stagesCompleted: Math.floor(targetStats.stagesCompleted * progress),
          satisfactionRate: Math.floor(targetStats.satisfactionRate * progress)
        });

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);
    };

    const timer = setTimeout(animateStats, 500);
    return () => clearTimeout(timer);
  }, []);

  // Particle animation effect
  useEffect(() => {
    const particleTimer = setInterval(() => {
      setCurrentParticle(prev => (prev + 1) % 20);
    }, 150);
    return () => clearInterval(particleTimer);
  }, []);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const services = [
    {
      icon: '🚀',
      title: 'تحليل متقدم بالذكاء الاصطناعي',
      description: 'تحليل فوري وذكي للقضايا القانونية باستخدام أحدث تقنيات الذكاء الاصطناعي التوليدي',
      color: futuristicColors.neonBlue
    },
    {
      icon: '⚡',
      title: 'معالجة فورية',
      description: 'نتائج فورية خلال ثوانٍ مع دقة عالية وتحليل شامل لجميع جوانب القضية',
      color: futuristicColors.neonPurple
    },
    {
      icon: '🔮',
      title: 'رؤى مستقبلية',
      description: 'توقعات ذكية ونصائح استراتيجية لتحسين فرص النجاح في القضايا القانونية',
      color: futuristicColors.neonGreen
    },
    {
      icon: '🛡️',
      title: 'حماية متقدمة',
      description: 'تشفير متقدم وحماية كاملة للبيانات مع ضمان الخصوصية والأمان',
      color: '#ff073a'
    },
    {
      icon: '🌐',
      title: 'وصول عالمي',
      description: 'متاح في أي مكان وأي وقت مع دعم للغات متعددة وأنظمة قانونية مختلفة',
      color: futuristicColors.neonBlue
    },
    {
      icon: '🎯',
      title: 'دقة لا متناهية',
      description: 'نتائج دقيقة 99.8% مدعومة بقاعدة بيانات شاملة من القوانين والسوابق',
      color: futuristicColors.neonPurple
    }
  ];

  const features = [
    {
      icon: '⚡',
      title: 'سرعة الضوء',
      description: 'معالجة فورية خلال مللي ثانية مع قوة حاسوبية فائقة',
      gradient: futuristicColors.neonGradient
    },
    {
      icon: '🎯',
      title: 'دقة كمية',
      description: 'دقة 99.98% مدعومة بخوارزميات الذكاء الاصطناعي المتقدمة',
      gradient: futuristicColors.primaryGradient
    },
    {
      icon: '🔓',
      title: 'مجاني للأبد',
      description: 'جميع الميزات المتقدمة متاحة مجاناً بدون قيود أو اشتراكات',
      gradient: futuristicColors.secondaryGradient
    },
    {
      icon: '🛡️',
      title: 'أمان كمي',
      description: 'تشفير كمي متقدم وحماية بروتوكولات الأمان المستقبلية',
      gradient: futuristicColors.hologram
    }
  ];

  // تجنب hydration mismatch
  if (!mounted) {
    return (
      <div style={{
        fontFamily: 'Tajawal, Inter, Arial, sans-serif',
        direction: 'rtl',
        lineHeight: 1.6,
        background: theme.background,
        color: theme.text,
        minHeight: '100vh'
      }}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          جاري التحميل...
        </div>
      </div>
    );
  }

  return (
    <div className="futuristic-landing">
      {/* Futuristic Header */}
      <FuturisticHeader
        darkMode={darkMode}
        onThemeToggle={toggleTheme}
        logoText="التحليل القانوني"
        logoSubText="LEGAL AI"
        navItems={[
          { href: '/', label: 'الرئيسية' },
          { href: '/about', label: 'عن النظام' },
          { href: '/contact', label: 'اتصال' }
        ]}
        rightContent={onSkip && (
          <LegalButton 
            variant="primary" 
            size="sm" 
            onClick={onSkip}
            darkMode={darkMode}
          >
            دخول النظام
          </LegalButton>
        )}
      />

      {/* Quantum Hero Section */}
      <section className="quantum-hero" ref={heroRef}>
        <div className="quantum-bg">
          <ParticleField 
            particleCount={20}
            particleSpeed={0.5}
            darkMode={darkMode}
          />
          <NeuralNetwork 
            darkMode={darkMode}
            gridSize={50}
            animated={true}
          />
          <div 
            className="mouse-glow"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${futuristicColors.neonBlue}22 0%, transparent 50%)`
            }}
          />
        </div>
        
        <div className="container">
          <div className="hero-quantum">
            <div className="hero-data">
              <div className="quantum-badges">
                <span className="badge-ai">
                  <span className="badge-icon">🤖</span>
                  مدعوم بالذكاء الاصطناعي
                </span>
                <span className="badge-quantum">
                  <span className="badge-icon">⚡</span>
                  معالجة كمية
                </span>
              </div>
              
              <h1 className="quantum-title">
                <div className="title-line">
                  <span className="hologram-text">نظام التحليل القانوني</span>
                </div>
                <div className="title-line">
                  <span className="neon-text">الكمي المتقدم</span>
                </div>
              </h1>
              
              <p className="quantum-subtitle">
                تجربة مستقبلية في التحليل القانوني مدعومة بأحدث تقنيات الذكاء الاصطناعي
                <br />
                <span className="highlight-text">دقة 99.98% • معالجة فورية • أمان كمي</span>
              </p>
              
              <div className="quantum-actions">
                <LegalButton
                  variant="primary"
                  size="lg"
                  onClick={onSkip}
                  darkMode={darkMode}
                  icon="🚀"
                >
                  بدء التحليل الآن
                </LegalButton>
                <Link href="/about">
                  <LegalButton
                    variant="outline"
                    size="lg"
                    darkMode={darkMode}
                    icon="🔬"
                  >
                    استكشف التقنية
                  </LegalButton>
                </Link>
              </div>
            </div>
            
            <div className="hero-visual">
              <LegalHeroIcon 
                size="xl" 
                darkMode={darkMode}
                animated={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Palestinian Legal Stats Section */}
      <section className="legal-stats">
        <div className="container">
          <LegalStats darkMode={darkMode} stats={stats} />
        </div>
      </section>

      {/* Quantum Services Section */}
      <section className="quantum-services">
        <div className="container">
          <div className="section-quantum">
            <LegalTitle size="lg" variant="heritage" darkMode={darkMode} icon="⚡">
              تقنيات المستقبل
            </LegalTitle>
            <p style={{
              fontSize: '1.3rem',
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(26, 26, 46, 0.7)',
              maxWidth: '700px',
              margin: '0 auto 80px',
              lineHeight: 1.6,
              textAlign: 'center'
            }}>
              نستخدم أحدث تقنيات الذكاء الاصطناعي والحوسبة الكمية لتقديم تجربة قانونية لا مثيل لها
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '40px'
          }}>
            {services.map((service, index) => (
              <QuantumCard 
                key={index} 
                variant="glass" 
                hoverable 
                darkMode={darkMode}
                borderColor={service.color}
                padding="lg"
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '4rem', 
                    marginBottom: '30px',
                    color: service.color
                  }}>
                    {service.icon}
                  </div>
                  <h3 style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    marginBottom: '20px',
                    color: darkMode ? '#ffffff' : '#1a1a2e'
                  }}>
                    {service.title}
                  </h3>
                  <p style={{
                    color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(26, 26, 46, 0.8)',
                    lineHeight: 1.7,
                    fontSize: '1.1rem'
                  }}>
                    {service.description}
                  </p>
                </div>
              </QuantumCard>
            ))}
          </div>
        </div>
      </section>

      {/* Quantum Features Section */}
      <section style={{
        padding: '120px 0',
        background: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <LegalTitle size="lg" variant="primary" darkMode={darkMode} icon="🎯">
              لماذا نحن الخيار الأمثل؟
            </LegalTitle>
            <p style={{
              fontSize: '1.3rem',
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(26, 26, 46, 0.7)',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              نجمع بين القوة الحاسوبية المتقدمة والذكاء الاصطناعي لتقديم حلول قانونية تفوق التوقعات
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px'
          }}>
            {features.map((feature, index) => {
              const borderColors = [futuristicColors.neonBlue, futuristicColors.neonPurple, futuristicColors.neonGreen, '#ff073a'];
              return (
                <QuantumCard 
                  key={index} 
                  variant="neon" 
                  hoverable 
                  darkMode={darkMode}
                  borderColor={borderColors[index]}
                  padding="lg"
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '4rem', 
                      marginBottom: '30px'
                    }}>
                      {feature.icon}
                    </div>
                    <h3 style={{
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      marginBottom: '20px',
                      color: darkMode ? '#ffffff' : '#1a1a2e'
                    }}>
                      {feature.title}
                    </h3>
                    <p style={{
                      color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(26, 26, 46, 0.8)',
                      lineHeight: 1.7,
                      fontSize: '1.1rem'
                    }}>
                      {feature.description}
                    </p>
                  </div>
                </QuantumCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quantum CTA Section */}
      <section style={{
        padding: '120px 0',
        background: futuristicColors.primaryGradient,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>')`,
          opacity: 0.3
        }} />
        <div className="container">
          <div style={{ position: 'relative', zIndex: 1, color: 'white' }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: 900,
              marginBottom: '24px',
              textShadow: '0 0 20px rgba(255, 255, 255, 0.5)'
            }}>
              جاهز لدخول المستقبل؟
            </h2>
            <p style={{
              fontSize: '1.3rem',
              marginBottom: '50px',
              opacity: 0.9,
              lineHeight: 1.6
            }}>
              انضم إلى ثورة التحليل القانوني الذكي واكتشف قوة الذكاء الاصطناعي في خدمة العدالة
            </p>
            <LegalButton
              variant="accent"
              size="lg"
              onClick={onSkip}
              icon="🚀"
            >
              ابدأ رحلتك الآن
            </LegalButton>
          </div>
        </div>
      </section>

      {/* Quantum Footer */}
      <footer style={{
        background: futuristicColors.heroGradient,
        padding: '60px 0 40px',
        borderTop: `1px solid ${futuristicColors.neonBlue}`,
        textAlign: 'center'
      }}>
        <div className="container">
          <div style={{
            marginBottom: '30px',
            fontSize: '1.1rem',
            color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(26, 26, 46, 0.8)'
          }}>
            <div style={{ marginBottom: '16px', fontWeight: '700' }}>
              🌐 متاح في جميع أنحاء العالم • دعم 24/7 • مجاني بالكامل
            </div>
            <div style={{ 
              fontSize: '0.9rem', 
              opacity: 0.7,
              background: futuristicColors.hologram,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              © 2024 نظام التحليل القانوني الكمي • مدعوم بأحدث تقنيات الذكاء الاصطناعي
            </div>
          </div>

          {/* زر العودة لصفحة الترحيب */}
          {onSkip && (
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
              <LegalButton
                variant="primary"
                size="lg"
                onClick={onSkip}
                darkMode={darkMode}
                icon="🏠"
              >
                مرحبا بك في منصة التحليل القانوني
              </LegalButton>
            </div>
          )}
        </div>
      </footer>

      <style>{`
        @import url('/styles/futuristic/index.css');
        
        .futuristic-landing {
          font-family: 'Inter', 'Tajawal', Arial, sans-serif;
          direction: rtl;
          line-height: 1.6;
          background: ${futuristicColors.heroGradient};
          color: ${darkMode ? '#ffffff' : '#1a1a2e'};
          overflow-x: hidden;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .quantum-hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
          padding-top: 100px;
          background: ${futuristicColors.heroGradient};
        }

        .quantum-stats {
          padding: 100px 0;
          background: ${darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
          backdrop-filter: blur(20px);
        }

        .legal-stats {
          padding: 100px 0;
          background: ${darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
          backdrop-filter: blur(20px);
        }

        .quantum-services {
          padding: 120px 0;
          background: ${futuristicColors.heroGradient};
        }

        .quantum-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .hero-quantum {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .hero-data {
          color: ${darkMode ? '#ffffff' : '#1a1a2e'};
        }

        .quantum-badges {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .badge-ai, .badge-quantum {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 25px;
          font-weight: 700;
          font-size: 0.9rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .badge-ai {
          background: ${darkMode ? 'rgba(0, 245, 255, 0.1)' : 'rgba(0, 245, 255, 0.2)'};
          color: ${futuristicColors.neonBlue};
        }

        .badge-quantum {
          background: ${darkMode ? 'rgba(191, 0, 255, 0.1)' : 'rgba(191, 0, 255, 0.2)'};
          color: ${futuristicColors.neonPurple};
        }

        .quantum-title {
          font-size: 4rem;
          font-weight: 900;
          margin-bottom: 32px;
          line-height: 1.1;
        }

        .title-line {
          margin-bottom: 16px;
        }

        .hologram-text {
          background: ${futuristicColors.hologram};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: hologramShift 3s ease-in-out infinite;
        }

        .neon-text {
          color: ${futuristicColors.neonBlue};
          text-shadow: 0 0 10px ${futuristicColors.neonBlue};
          animation: neonGlow 2s ease-in-out infinite alternate;
        }

        .quantum-subtitle {
          font-size: 1.3rem;
          line-height: 1.7;
          margin-bottom: 48px;
          color: ${darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(26, 26, 46, 0.8)'};
        }

        .highlight-text {
          background: ${futuristicColors.neonGradient};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }

        .quantum-actions {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .mouse-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          transition: all 0.1s ease;
        }

        .section-quantum {
          text-align: center;
          margin-bottom: 80px;
        }

        @keyframes hologramShift {
          0%, 100% { filter: hue-rotate(0deg); }
          25% { filter: hue-rotate(90deg); }
          50% { filter: hue-rotate(180deg); }
          75% { filter: hue-rotate(270deg); }
        }

        @keyframes neonGlow {
          0% { text-shadow: 0 0 10px ${futuristicColors.neonBlue}; }
          100% { text-shadow: 0 0 20px ${futuristicColors.neonBlue}, 0 0 30px ${futuristicColors.neonBlue}; }
        }

        @keyframes symbolRotate {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }

        @media (max-width: 768px) {
          .hero-quantum {
            grid-template-columns: 1fr;
            gap: 40px;
            text-align: center;
          }

          .quantum-title {
            font-size: 2.5rem;
          }

          .quantum-actions {
            justify-content: center;
          }

          .stats-quantum {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;