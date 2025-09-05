import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '../contexts/ThemeContext';

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

  // الحصول على الألوان المخصصة للعناصر
  const getElementColors = () => {
    if (darkMode) {
      return {
        gradient1: `linear-gradient(135deg, ${theme.card} 0%, ${theme.border} 100%)`,
        gradient2: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent2} 100%)`,
        gradient3: `linear-gradient(135deg, ${theme.card} 0%, ${theme.input} 100%)`,
        accentGradient: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent2} 100%)`
      };
    } else {
      return {
        gradient1: `linear-gradient(135deg, ${theme.card} 0%, ${theme.border} 100%)`,
        gradient2: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent2} 100%)`,
        gradient3: `linear-gradient(135deg, ${theme.card} 0%, ${theme.input} 100%)`,
        accentGradient: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent2} 100%)`
      };
    }
  };

  const elementColors = getElementColors();

  // Animate stats on component mount
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

  const services = [
    {
      icon: '📊',
      title: 'تحليل القضايا',
      description: 'تحليل شامل للقضايا القانونية باستخدام الذكاء الاصطناعي مع مراحل متدرجة ومفصلة'
    },
    {
      icon: '📝',
      title: 'إعداد المذكرات',
      description: 'توليد مذكرات قانونية احترافية ومذكرات الدفاع مع مراعاة الأنظمة المحلية'
    },
    {
      icon: '⚖️',
      title: 'مراجعة العقود',
      description: 'مراجعة وتحليل العقود والاتفاقيات مع تحديد النقاط القانونية المهمة'
    },
    {
      icon: '🔍',
      title: 'فحص المراجع القانونية',
      description: 'فحص ومراجعة المراجع القانونية والتأكد من صحتها وحداثتها'
    },
    {
      icon: '📚',
      title: 'قاعدة المعرفة',
      description: 'قاعدة معرفة شاملة بالقوانين والأنظمة مع إمكانية البحث والاستعلام'
    },
    {
      icon: '💬',
      title: 'الاستشارات الذكية',
      description: 'استشارات قانونية فورية مدعومة بالذكاء الاصطناعي مع إجابات دقيقة'
    }
  ];

  const features = [
    {
      icon: '🚀',
      title: 'سرعة فائقة',
      description: 'تحليل سريع للقضايا في دقائق بدلاً من ساعات'
    },
    {
      icon: '🎯',
      title: 'دقة عالية',
      description: 'نتائج دقيقة ومفصلة مدعومة بأحدث تقنيات الذكاء الاصطناعي'
    },
    {
      icon: '💰',
      title: 'مجاني بالكامل',
      description: 'جميع الخدمات متاحة مجاناً بدون أي رسوم أو اشتراكات'
    },
    {
      icon: '🔒',
      title: 'أمان وخصوصية',
      description: 'حماية كاملة لبياناتك مع تشفير متقدم وخصوصية مضمونة'
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
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <span className="logo-icon">⚖️</span>
              <span className="logo-text">التحليل القانوني</span>
            </div>
            <nav className="header-nav">
              <Link href="/" className="nav-link">الرئيسية</Link>
              <Link href="/about" className="nav-link">عن المنصة</Link>
              <Link href="/contact" className="nav-link">تواصل</Link>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  toggleTheme();
                }} 
                className="theme-toggle" 
                title={darkMode ? 'التبديل للوضع النهاري' : 'التبديل للوضع الليلي'}
                type="button"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              {onSkip && (
                <button onClick={onSkip} className="skip-btn">
                  تخطي إلى التطبيق
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg" aria-hidden="true">
          <Image
            src="/DeWatermark.ai_1756309976798.jpeg"
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover', opacity: 0.22, filter: `saturate(1.05) contrast(1.05) brightness(${darkMode ? 0.6 : 0.85})` }}
          />
          <div className="hero-overlay" />
        </div>
        <div className="container">
          <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              منصة التحليل القانوني الذكي
            </h1>
            <div className="hero-badges">
              <span className="badge ai">مدعوم بالذكاء الاصطناعي</span>
              <span className="badge ps">مختص بالقضاء الفلسطيني</span>
            </div>
            <p className="hero-subtitle">
              منصة مجانية للتحليل القانوني المدعوم بالذكاء الاصطناعي
              <br />
              نحن نقدم حلولاً قانونية متطورة لتحليل القضايا وإعداد المذكرات
            </p>
            <div className="hero-buttons">
              <button
                className="skip-btn btn-primary-solid"
                onClick={onSkip}
                type="button"
              >
                <span className="btn-content"><span className="btn-icon">🚀</span><span>ابدأ التحليل الآن</span></span>
              </button>
              <Link href="/about" className="skip-btn btn-primary-solid">
                <span className="btn-content"><span className="btn-icon">🚀</span><span>تعرف علينا أكثر</span></span>
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-graphic">
              <div className="legal-icon">⚖️</div>
              <div className="floating-elements">
                <div className="floating-item">🤖</div>
                <div className="floating-item">⚖️</div>
                <div className="floating-item">📊</div>
                <div className="floating-item">📝</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{stats.casesAnalyzed.toLocaleString()}</div>
              <div className="stat-label">قضية محللة</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.users.toLocaleString()}</div>
              <div className="stat-label">مستخدم نشط</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.stagesCompleted.toLocaleString()}</div>
              <div className="stat-label">مرحلة مكتملة</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.satisfactionRate}%</div>
              <div className="stat-label">معدل الرضا</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">خدماتنا</h2>
            <p className="section-subtitle">
              نقدم مجموعة شاملة من الخدمات القانونية المدعومة بالذكاء الاصطناعي
            </p>
          </div>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">لماذا منصتنا؟</h2>
            <p className="section-subtitle">
              نتميز بتقديم حلول قانونية متطورة وسهلة الاستخدام
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">جاهز للبدء؟</h2>
            <p className="cta-subtitle">
              انضم إلى آلاف المحامين والمستشارين القانونيين الذين يثقون بمنصتنا
            </p>
            <button
              type="button"
              className="btn-primary btn-large"
              onClick={onSkip}
            >
              ابدأ التحليل الآن مجاناً
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">تواصل معنا</h2>
            <p className="section-subtitle">
              نحن هنا لمساعدتك في جميع استفساراتك القانونية
            </p>
          </div>
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">📧</div>
                <div className="contact-details">
                  <h4>البريد الإلكتروني</h4>
                  <p>info@legal-analysis.com</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">💬</div>
                <div className="contact-details">
                  <h4>الدعم الفني</h4>
                  <p>متاح 24/7</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">🌐</div>
                <div className="contact-details">
                  <h4>الموقع</h4>
                  <p>متاح في جميع أنحاء العالم</p>
                </div>
              </div>
            </div>
            <div className="contact-form">
              <form>
                <div className="form-group">
                  <input type="text" placeholder="الاسم" required />
                </div>
                <div className="form-group">
                  <input type="email" placeholder="البريد الإلكتروني" required />
                </div>
                <div className="form-group">
                  <textarea placeholder="رسالتك" rows={5} required></textarea>
                </div>
                <button type="submit" className="btn-primary">
                  إرسال الرسالة
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .landing-page {
          font-family: 'Tajawal', 'Inter', Arial, sans-serif;
          direction: rtl;
          line-height: 1.6;
          background: ${theme.background};
          color: ${theme.text};
        }

        /* Header */
        .landing-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: ${elementColors.accentGradient};
          backdrop-filter: blur(20px);
          z-index: 1000;
          border-bottom: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 8px 24px ${theme.shadow};
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
        }

        .landing-header .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          color: white;
        }

        .landing-header .logo-icon {
          font-size: 2.25rem;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
        }

        .landing-header .logo-text {
          font-size: 2.25rem; /* تكبير بمقدار 50% تقريباً */
          font-weight: 800;
          letter-spacing: 0.5px;
          color: ${theme.text};
          -webkit-text-fill-color: currentColor;
        }

        .landing-header .header-nav {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .landing-header .nav-link {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-weight: 700;
          transition: color 0.3s ease, transform 0.2s ease;
        }

        .landing-header .nav-link:hover {
          color: #ffffff;
          transform: translateY(-1px);
        }

        .skip-btn {
          background: ${elementColors.accentGradient};
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .skip-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px ${theme.shadow};
        }

        .theme-toggle {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
          outline: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .theme-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          transform: scale(1.1);
        }

        .theme-toggle:active {
          transform: scale(0.95);
        }

        .theme-toggle:focus {
          outline: 2px solid rgba(99, 102, 241, 0.5);
          outline-offset: 2px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Hero Section */
        .hero-section {
          background: ${elementColors.gradient3};
          min-height: 100vh;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
          padding-top: 80px;
          width: 100vw;
          margin-left: calc(-50vw + 50%);
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.12) 100%);
          pointer-events: none;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .hero-text {
          color: #000000;
        }

        .hero-badges {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .badge {
          padding: 6px 12px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 0.9rem;
          color: #000000;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.15);
        }

        .badge.ai {
          background: #e0f2fe;
          color: #000000;
          border-color: #7dd3fc;
        }

        .badge.ps {
          background: #dcfce7;
          color: #000000;
          border-color: #86efac;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 24px;
          color: #000000;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #000000;
          margin-bottom: 40px;
          line-height: 1.8;
        }

        .hero-buttons {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .btn-primary, .btn-secondary {
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.1rem;
          text-decoration: none;
          transition: all 0.3s ease;
          display: inline-block;
          text-align: center;
        }

        /* تطبيق نمط زر التخطي على أزرار الهيرو بحجم كبير وملفت */
        .hero-buttons .skip-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 1.15rem;
          letter-spacing: 0.2px;
          text-decoration: none;
          box-shadow: 0 8px 24px ${theme.shadow};
          background: #000000;
          color: #ffffff;
          border: 1px solid rgba(255,255,255,0.15);
        }
        /* Global selectors to ensure Link <a> receives identical styling */
        :global(.hero-buttons .skip-btn) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 1.15rem;
          letter-spacing: 0.2px;
          text-decoration: none;
          box-shadow: 0 8px 24px ${theme.shadow};
        }
        :global(.btn-primary-solid) {
          background: #000000;
          color: #ffffff !important;
          border: 1px solid rgba(255,255,255,0.15);
        }
        :global(.btn-outline) {
          background: transparent;
          color: #000000;
          border: 2px solid #000000;
          box-shadow: none;
        }

        .btn-content { display:inline-flex; align-items:center; gap:8px; }
        .btn-icon { display:inline-block; }

        .btn-primary-solid { background: #000; color: #fff; border-color: rgba(255,255,255,0.15); }
        .btn-outline { background: transparent; color: #000; border: 2px solid #000; box-shadow: none; }

        .hero-buttons .skip-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px ${theme.shadow};
          background: #111111;
        }

        .btn-primary {
          background: ${elementColors.accentGradient};
          color: white;
          border: none;
          box-shadow: 0 8px 24px ${theme.shadow};
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px ${theme.shadow};
        }

        .btn-secondary {
          background: transparent;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .btn-large {
          padding: 20px 40px;
          font-size: 1.2rem;
        }

        .hero-image {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-graphic {
          position: relative;
          width: 300px;
          height: 300px;
        }

        .legal-icon {
          font-size: 8rem;
          text-align: center;
          animation: float 3s ease-in-out infinite;
        }

        .floating-elements {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .floating-item {
          position: absolute;
          font-size: 2rem;
          animation: float 2s ease-in-out infinite;
        }

        .floating-item:nth-child(1) {
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .floating-item:nth-child(2) {
          top: 20%;
          right: 10%;
          animation-delay: 0.5s;
        }

        .floating-item:nth-child(3) {
          bottom: 20%;
          left: 20%;
          animation-delay: 1s;
        }

        .floating-item:nth-child(4) {
          bottom: 10%;
          right: 20%;
          animation-delay: 1.5s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        /* Stats Section */
        .stats-section {
          background: ${elementColors.gradient1};
          padding: 80px 0;
          color: ${theme.text};
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
        }

        .stat-item {
          text-align: center;
          padding: 40px 20px;
          background: ${theme.card};
          border-radius: 16px;
          box-shadow: 0 8px 24px ${theme.shadow};
          transition: transform 0.3s ease;
          color: ${theme.text};
        }

        .stat-item:hover {
          transform: translateY(-8px);
        }

        .stat-number {
          font-size: 3rem;
          font-weight: 800;
          color: ${darkMode ? 'white' : 'black'};
          margin-bottom: 12px;
        }

        .stat-label {
          font-size: 1.1rem;
          color: ${theme.text};
          opacity: 0.8;
          font-weight: 600;
        }

        /* Services Section */
        .services-section {
          padding: 100px 0;
          background: ${theme.background};
          color: ${theme.text};
        }

        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: ${theme.text};
          margin-bottom: 16px;
        }

        .section-subtitle {
          font-size: 1.2rem;
          color: ${theme.text};
          opacity: 0.8;
          max-width: 600px;
          margin: 0 auto;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
        }

        .service-card {
          background: ${theme.card};
          padding: 40px 30px;
          border-radius: 16px;
          box-shadow: 0 4px 20px ${theme.shadow};
          border: 1px solid ${theme.border};
          transition: all 0.3s ease;
          text-align: center;
          color: ${theme.text};
        }

        .service-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
          border-color: ${theme.accent};
        }

        .service-icon {
          font-size: 3rem;
          margin-bottom: 24px;
        }

        .service-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: ${theme.text};
          margin-bottom: 16px;
        }

        .service-description {
          color: ${theme.text};
          opacity: 0.8;
          line-height: 1.7;
        }

        /* Features Section */
        .features-section {
          padding: 100px 0;
          background: ${elementColors.gradient1};
          color: ${theme.text};
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
        }

        .feature-card {
          background: ${theme.card};
          padding: 40px 30px;
          border-radius: 16px;
          box-shadow: 0 4px 20px ${theme.shadow};
          transition: all 0.3s ease;
          text-align: center;
          color: ${theme.text};
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 24px;
        }

        .feature-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: ${theme.text};
          margin-bottom: 16px;
        }

        .feature-description {
          color: ${theme.text};
          opacity: 0.8;
          line-height: 1.7;
        }

        /* CTA Section */
        .cta-section {
          padding: 100px 0;
          background: ${elementColors.accentGradient};
          text-align: center;
        }

        .cta-content {
          color: white;
        }

        .cta-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 16px;
        }

        .cta-subtitle {
          font-size: 1.2rem;
          margin-bottom: 40px;
          opacity: 0.9;
        }

        /* Contact Section */
        .contact-section {
          padding: 100px 0;
          background: ${theme.background};
          color: ${theme.text};
        }

        .contact-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: start;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .contact-icon {
          font-size: 2rem;
          width: 60px;
          height: 60px;
          background: ${elementColors.accentGradient};
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .contact-details h4 {
          font-size: 1.2rem;
          font-weight: 700;
          color: ${theme.text};
          margin-bottom: 8px;
        }

        .contact-details p {
          color: ${theme.text};
          opacity: 0.8;
        }

        .contact-form {
          background: ${theme.card};
          padding: 40px;
          border-radius: 16px;
          color: ${theme.text};
          border: 1px solid ${theme.border};
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 16px;
          border: 2px solid ${theme.border};
          border-radius: 12px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
          font-family: 'Tajawal', Arial, sans-serif;
          background: ${theme.input};
          color: ${theme.text};
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: ${theme.accent};
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 16px;
            padding: 12px 0;
          }

          .header-nav {
            gap: 16px;
            flex-wrap: wrap;
            justify-content: center;
          }

          .theme-toggle {
            min-width: 36px;
            height: 36px;
            font-size: 1rem;
          }

          .hero-content {
            grid-template-columns: 1fr;
            gap: 40px;
            text-align: center;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-buttons {
            justify-content: center;
          }

          .contact-content {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .services-grid,
          .features-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .btn-primary,
          .btn-secondary {
            padding: 14px 24px;
            font-size: 1rem;
          }

          .theme-toggle {
            min-width: 32px;
            height: 32px;
            font-size: 0.9rem;
          }

          .header-nav {
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
