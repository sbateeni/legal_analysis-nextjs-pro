import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  ProfessionalLegalButton, 
  ProfessionalLegalCard,
  getProfessionalLegalColors
} from '../../themes';
import { LegalStats } from '../../themes';

interface ProfessionalLandingPageProps {
  onSkip?: () => void;
}

const ProfessionalLandingPage: React.FC<ProfessionalLandingPageProps> = ({ onSkip }) => {
  const { darkMode, theme, mounted } = useTheme();
  const [stats, setStats] = useState({
    casesAnalyzed: 0,
    users: 0,
    stagesCompleted: 0,
    satisfactionRate: 0
  });
  
  const professionalColors = getProfessionalLegalColors(darkMode);

  // Animation effects for stats
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

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="professional-landing">
        <div className="container">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            جاري التحميل...
          </div>
        </div>
      </div>
    );
  }

  const services = [
    {
      icon: '⚖️',
      title: 'تحليل قانوني متقدم',
      description: 'تحليل شامل للقضايا القانونية باستخدام خبرة قانونية متراكمة'
    },
    {
      icon: '⚡',
      title: 'معالجة فورية',
      description: 'نتائج سريعة ودقيقة لجميع جوانب القضية القانونية'
    },
    {
      icon: '📚',
      title: 'قاعدة بيانات شاملة',
      description: 'وصول إلى قوانين وسوابق قضائية محدثة ومُنظمة'
    },
    {
      icon: '🛡️',
      title: 'حماية البيانات',
      description: 'تشفير متقدم وحماية كاملة لبياناتك القانونية'
    },
    {
      icon: '🌐',
      title: 'دعم قانوني متخصص',
      description: 'متاح في أي مكان مع دعم لأنظمة قانونية مختلفة'
    },
    {
      icon: '🎯',
      title: 'دقة عالية',
      description: 'نتائج مدعومة بقاعدة بيانات شاملة من القوانين والسوابق'
    }
  ];

  const features = [
    {
      icon: '⏱️',
      title: 'كفاءة الوقت',
      description: 'تقليل الوقت المستغرق في البحث والتحليل القانوني'
    },
    {
      icon: '🎯',
      title: 'دقة عالية',
      description: 'نتائج مدعومة بخوارزميات تحليل قانوني متقدمة'
    },
    {
      icon: '🔓',
      title: 'مجاني للاستخدام',
      description: 'جميع الميزات متاحة مجاناً بدون قيود أو اشتراكات'
    },
    {
      icon: '🛡️',
      title: 'أمان مضمون',
      description: 'حماية متقدمة للبيانات مع ضمان الخصوصية'
    }
  ];

  return (
    <div className="professional-landing" style={{
      fontFamily: "'Tajawal', 'Segoe UI', sans-serif",
      direction: 'rtl',
      lineHeight: 1.6,
      background: darkMode ? professionalColors.background : '#f8fafc',
      color: darkMode ? professionalColors.textPrimary : professionalColors.textPrimary,
      minHeight: '100vh'
    }}>
      {/* Professional Header */}
      <header style={{
        background: darkMode ? professionalColors.cardBackground : '#ffffff',
        borderBottom: `1px solid ${darkMode ? professionalColors.border : '#e2e8f0'}`,
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 1rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: professionalColors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}>
              ⚖️
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 700,
                color: darkMode ? professionalColors.textPrimary : professionalColors.primary
              }}>
                التحليل القانوني
              </h1>
              <div style={{
                fontSize: '0.75rem',
                color: darkMode ? professionalColors.textMuted : professionalColors.textSecondary
              }}>
                Legal Analysis System
              </div>
            </div>
          </div>
          
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/" style={{
              color: darkMode ? professionalColors.textPrimary : professionalColors.primary,
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.9rem'
            }}>
              الرئيسية
            </Link>
            <Link href="/about" style={{
              color: darkMode ? professionalColors.textMuted : professionalColors.textSecondary,
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.9rem'
            }}>
              عن النظام
            </Link>
            <Link href="/contact" style={{
              color: darkMode ? professionalColors.textMuted : professionalColors.textSecondary,
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.9rem'
            }}>
              اتصال
            </Link>
          </nav>
          
          {onSkip && (
            <ProfessionalLegalButton 
              variant="primary" 
              size="sm" 
              onClick={onSkip}
              darkMode={darkMode}
            >
              دخول النظام
            </ProfessionalLegalButton>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '4rem 1rem',
        background: darkMode ? professionalColors.cardBackground : '#ffffff',
        borderBottom: `1px solid ${darkMode ? professionalColors.border : '#e2e8f0'}`
      }}>
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: darkMode ? `${professionalColors.accent}20` : `${professionalColors.accent}10`,
              color: professionalColors.accent,
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '1.5rem'
            }}>
              <span>🤖</span>
              <span>مدعوم بالذكاء الاصطناعي</span>
            </div>
            
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              margin: '0 0 1.5rem 0',
              color: darkMode ? professionalColors.textPrimary : professionalColors.primary,
              lineHeight: 1.2
            }}>
              نظام التحليل القانوني المتقدم
            </h1>
            
            <p style={{
              fontSize: '1.25rem',
              color: darkMode ? professionalColors.textSecondary : professionalColors.textSecondary,
              maxWidth: '700px',
              margin: '0 auto 2rem',
              lineHeight: 1.6
            }}>
              تحليل شامل ودقيق للقضايا القانونية مدعوم بأحدث التقنيات القانونية والذكاء الاصطناعي
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '3rem'
            }}>
              <ProfessionalLegalButton
                variant="primary"
                size="lg"
                onClick={onSkip}
                darkMode={darkMode}
                icon="⚖️"
              >
                بدء التحليل الآن
              </ProfessionalLegalButton>
              <Link href="/about">
                <ProfessionalLegalButton
                  variant="outline"
                  size="lg"
                  darkMode={darkMode}
                  icon="📚"
                >
                  تعرف على النظام
                </ProfessionalLegalButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '4rem 1rem',
        background: darkMode ? professionalColors.background : '#f1f5f9'
      }}>
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <LegalStats darkMode={darkMode} stats={stats} />
        </div>
      </section>

      {/* Services Section */}
      <section style={{
        padding: '5rem 1rem',
        background: darkMode ? professionalColors.cardBackground : '#ffffff'
      }}>
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 800,
              margin: '0 0 1rem 0',
              color: darkMode ? professionalColors.textPrimary : professionalColors.primary
            }}>
              خدماتنا القانونية
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: darkMode ? professionalColors.textSecondary : professionalColors.textSecondary,
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              مجموعة شاملة من الأدوات والخدمات لتحليل وفهم القضايا القانونية
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {services.map((service, index) => (
              <ProfessionalLegalCard 
                key={index} 
                variant="default" 
                padding="lg"
                darkMode={darkMode}
                hoverable
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '3rem', 
                    marginBottom: '1.5rem',
                    color: professionalColors.accent
                  }}>
                    {service.icon}
                  </div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                    color: darkMode ? professionalColors.textPrimary : professionalColors.primary
                  }}>
                    {service.title}
                  </h3>
                  <p style={{
                    color: darkMode ? professionalColors.textSecondary : professionalColors.textSecondary,
                    lineHeight: 1.6,
                    fontSize: '1rem'
                  }}>
                    {service.description}
                  </p>
                </div>
              </ProfessionalLegalCard>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '5rem 1rem',
        background: darkMode ? professionalColors.background : '#f1f5f9'
      }}>
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 800,
              margin: '0 0 1rem 0',
              color: darkMode ? professionalColors.textPrimary : professionalColors.primary
            }}>
              لماذا نحن الخيار الأمثل؟
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: darkMode ? professionalColors.textSecondary : professionalColors.textSecondary,
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              مزايا فريدة تجعل نظامنا الرائد في التحليل القانوني
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {features.map((feature, index) => (
              <ProfessionalLegalCard 
                key={index} 
                variant="filled" 
                padding="lg"
                darkMode={darkMode}
                hoverable
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    marginBottom: '1.5rem',
                    color: professionalColors.accent
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                    color: darkMode ? professionalColors.textPrimary : professionalColors.primary
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    color: darkMode ? professionalColors.textSecondary : professionalColors.textSecondary,
                    lineHeight: 1.6,
                    fontSize: '1rem'
                  }}>
                    {feature.description}
                  </p>
                </div>
              </ProfessionalLegalCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '5rem 1rem',
        background: darkMode ? professionalColors.cardBackground : '#ffffff',
        textAlign: 'center'
      }}>
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 800,
            margin: '0 0 1.5rem 0',
            color: darkMode ? professionalColors.textPrimary : professionalColors.primary
          }}>
            جاهز لبدء التحليل القانوني؟
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: darkMode ? professionalColors.textSecondary : professionalColors.textSecondary,
            maxWidth: '700px',
            margin: '0 auto 2rem',
            lineHeight: 1.6
          }}>
            انضم إلى آلاف المحامين والمستشارين القانونيين الذين يستخدمون نظامنا لتحليل القضايا القانونية
          </p>
          <ProfessionalLegalButton
            variant="primary"
            size="lg"
            onClick={onSkip}
            icon="⚖️"
          >
            ابدأ الآن
          </ProfessionalLegalButton>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: darkMode ? professionalColors.secondary : '#1e293b',
        padding: '3rem 1rem 2rem',
        color: '#ffffff'
      }}>
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h3 style={{
                color: '#ffffff',
                margin: '0 0 0.5rem 0',
                fontSize: '1.25rem',
                fontWeight: 700
              }}>
                نظام التحليل القانوني
              </h3>
              <p style={{
                color: '#cbd5e1',
                margin: 0,
                fontSize: '0.875rem'
              }}>
                دعم قانوني متقدم مدعوم بالذكاء الاصطناعي
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/privacy" style={{
                color: '#cbd5e1',
                textDecoration: 'none',
                fontSize: '0.875rem'
              }}>
                سياسة الخصوصية
              </Link>
              <Link href="/terms" style={{
                color: '#cbd5e1',
                textDecoration: 'none',
                fontSize: '0.875rem'
              }}>
                الشروط والأحكام
              </Link>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '2rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#94a3b8'
          }}>
            <p>© 2024 نظام التحليل القانوني. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>

      <style>{`
        .professional-landing {
          font-family: 'Tajawal', 'Segoe UI', sans-serif;
          direction: rtl;
          line-height: 1.6;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        @media (max-width: 768px) {
          .professional-landing h1 {
            font-size: 2rem;
          }
          
          .professional-landing h2 {
            font-size: 1.5rem;
          }
          
          .professional-landing .container {
            padding: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfessionalLandingPage;