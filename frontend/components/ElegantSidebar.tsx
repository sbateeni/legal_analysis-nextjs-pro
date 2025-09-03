import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  isActive?: boolean;
}

const ElegantSidebar: React.FC = () => {
  const router = useRouter();
  const { darkMode, setDarkMode } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'الرئيسية',
      icon: '🏠',
      href: '/',
    },
    {
      id: 'analytics',
      label: 'التحليلات',
      icon: '📊',
      href: '/analytics',
    },
    {
      id: 'documents',
      label: 'المستندات',
      icon: '📄',
      href: '/documents',
    },
    {
      id: 'cases',
      label: 'القضايا',
      icon: '⚖️',
      href: '/cases',
    },
    {
      id: 'chat',
      label: 'المحادثة',
      icon: '💬',
      href: '/chat',
    },
    {
      id: 'calendar',
      label: 'التقويم',
      icon: '📅',
      href: '/calendar',
    },
    {
      id: 'collaboration',
      label: 'التعاون',
      icon: '👥',
      href: '/collaboration',
    },
    {
      id: 'templates',
      label: 'القوالب',
      icon: '📋',
      href: '/templates',
    },
    {
      id: 'exports',
      label: 'التصدير',
      icon: '📤',
      href: '/exports',
    },
    {
      id: 'history',
      label: 'السجل',
      icon: '🕒',
      href: '/history',
    },
    {
      id: 'reference-checker',
      label: 'فحص المراجع',
      icon: '🔍',
      href: '/reference-checker',
    },
    {
      id: 'kb',
      label: 'قاعدة المعرفة',
      icon: '📚',
      href: '/kb',
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      icon: '⚙️',
      href: '/settings',
    },
  ];

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle touch gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && isMobileOpen) {
      setIsMobileOpen(false);
    } else if (isRightSwipe && !isMobileOpen && isMobile) {
      setIsMobileOpen(true);
    }
  };

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  }, [router.pathname, isMobile]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile) {
      if (isMobileOpen) {
        document.body.classList.add('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
    }

    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isMobileOpen, isMobile]);

  const isActiveItem = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div 
          ref={overlayRef}
          className="mobile-overlay" 
          onClick={handleOverlayClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      )}

      {/* Mobile Menu Button */}
      <div 
        className="mobile-menu-btn" 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        style={{ display: isMobile ? 'block' : 'none' }}
      >
        <span>{isMobileOpen ? '✕' : '☰'}</span>
      </div>
      
      <div 
        ref={sidebarRef}
        className={`elegant-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'open' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
      {/* Header */}
      <div className="sidebar-header">
        {!isCollapsed && (
          <div className="sidebar-logo">
            <span className="logo-icon">⚖️</span>
            <span className="logo-text">التحليل القانوني</span>
          </div>
        )}
        {isCollapsed && (
          <div className="sidebar-logo-collapsed">
            <span className="logo-icon">⚖️</span>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {/* Theme Toggle Button - Above Home */}
          <li className="nav-item theme-toggle-item">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="theme-toggle-btn"
              title={darkMode ? 'التبديل للوضع النهاري' : 'التبديل للوضع الليلي'}
            >
              <span className="nav-icon">{darkMode ? '☀️' : '🌙'}</span>
              {!isCollapsed && <span className="nav-label">التبديل</span>}
            </button>
          </li>
          
          {sidebarItems.map((item) => (
            <li key={item.id} className="nav-item">
              <Link 
                href={item.href}
                className={`nav-link ${isActiveItem(item.href) ? 'active' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'إظهار القائمة' : 'طي القائمة'}
        >
          <span className="collapse-icon">
            {isCollapsed ? '→' : '←'}
          </span>
          {!isCollapsed && <span className="collapse-text">طي القائمة</span>}
        </button>
      </div>

      <style jsx>{`
        .elegant-sidebar {
          position: relative;
          width: 300px;
          height: 100vh;
          background: linear-gradient(180deg, #0f0f23 0%, #1a1a2e 30%, #16213e 70%, #0f1419 100%);
          border-left: 1px solid rgba(99, 102, 241, 0.2);
          box-shadow: -8px 0 32px rgba(0, 0, 0, 0.4), -4px 0 16px rgba(99, 102, 241, 0.1);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(20px);
          font-family: 'Tajawal', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          flex-shrink: 0;
        }

        .elegant-sidebar.collapsed {
          width: 80px;
        }

        .sidebar-header {
          padding: 28px 24px;
          border-bottom: 1px solid rgba(99, 102, 241, 0.2);
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
          backdrop-filter: blur(10px);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #ffffff;
        }

        .sidebar-logo-collapsed {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .logo-icon {
          font-size: 32px;
          filter: drop-shadow(0 4px 8px rgba(99, 102, 241, 0.3));
          animation: pulse 3s ease-in-out infinite;
        }

        .logo-text {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 0.8px;
          background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #6366f1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .sidebar-nav {
          flex: 1;
          padding: 24px 0;
          overflow-y: auto;
        }

        .nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-item {
          margin: 0 16px 12px 16px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 16px 20px;
          color: rgba(255, 255, 255, 0.85);
          text-decoration: none;
          border-radius: 16px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          font-weight: 600;
          font-size: 16px;
          letter-spacing: 0.3px;
        }

        .nav-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
          border-radius: 16px;
        }

        .nav-link:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(-6px) scale(1.02);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .nav-link:hover::before {
          opacity: 1;
        }

        .nav-link.active {
          color: #ffffff;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4), 0 4px 12px rgba(139, 92, 246, 0.3);
          border-left: 5px solid #ffffff;
          transform: translateX(-2px);
        }

        .nav-link.active::before {
          opacity: 0;
        }

        .nav-icon {
          font-size: 22px;
          min-width: 28px;
          text-align: center;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
          transition: transform 0.3s ease;
        }

        .nav-link:hover .nav-icon {
          transform: scale(1.1);
        }

        .theme-toggle-item {
          margin-bottom: 8px;
        }

        .theme-toggle-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.9);
          cursor: pointer;
          transition: all 0.4s ease;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.3px;
          text-decoration: none;
        }

        .theme-toggle-btn:hover {
          background: rgba(99, 102, 241, 0.15);
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(99, 102, 241, 0.2);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .theme-toggle-btn:hover .nav-icon {
          transform: scale(1.1);
        }

        .nav-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 600;
        }

        .sidebar-footer {
          padding: 24px;
          border-top: 1px solid rgba(99, 102, 241, 0.2);
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.02) 100%);
          backdrop-filter: blur(10px);
        }

        .collapse-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.9);
          cursor: pointer;
          transition: all 0.4s ease;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .collapse-btn:hover {
          background: rgba(99, 102, 241, 0.15);
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(99, 102, 241, 0.2);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .collapse-icon {
          font-size: 18px;
          font-weight: bold;
          min-width: 22px;
          text-align: center;
          transition: transform 0.3s ease;
        }

        .collapse-btn:hover .collapse-icon {
          transform: scale(1.1);
        }

        .collapse-text {
          white-space: nowrap;
          font-weight: 600;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .elegant-sidebar {
            position: fixed;
            top: 0;
            right: 0;
            width: 85%;
            max-width: 320px;
            height: 100vh;
            transform: translateX(100%);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: -12px 0 40px rgba(0, 0, 0, 0.5);
            z-index: 1000;
            touch-action: pan-y;
            -webkit-overflow-scrolling: touch;
          }

          .elegant-sidebar.open {
            transform: translateX(0);
          }

          .elegant-sidebar.collapsed {
            width: 85%;
            max-width: 320px;
          }

          .nav-link {
            padding: 20px 24px;
            font-size: 17px;
            min-height: 60px;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }

          .nav-link:active {
            background: rgba(99, 102, 241, 0.2);
            transform: scale(0.98);
          }

          .nav-icon {
            font-size: 24px;
            min-width: 30px;
          }

          .sidebar-header {
            padding: 24px 20px;
            border-bottom: 2px solid rgba(99, 102, 241, 0.3);
          }

          .sidebar-footer {
            padding: 20px;
            border-top: 2px solid rgba(99, 102, 241, 0.3);
          }

          .collapse-btn {
            padding: 16px 20px;
            font-size: 16px;
            min-height: 56px;
            touch-action: manipulation;
          }

          .collapse-btn:active {
            transform: scale(0.98);
          }
        }

        @media (max-width: 480px) {
          .elegant-sidebar {
            width: 90%;
            max-width: 280px;
          }

          .sidebar-header {
            padding: 20px 16px;
          }

          .sidebar-footer {
            padding: 16px;
          }

          .nav-item {
            margin: 0 12px 8px 12px;
          }

          .nav-link {
            padding: 18px 20px;
            font-size: 16px;
            min-height: 56px;
          }

          .nav-icon {
            font-size: 22px;
            min-width: 28px;
          }

          .mobile-menu-btn {
            top: 15px;
            right: 15px;
            padding: 10px 14px;
            font-size: 16px;
          }
        }

        /* Prevent body scroll when sidebar is open on mobile */
        @media (max-width: 768px) {
          body.sidebar-open {
            overflow: hidden;
            position: fixed;
            width: 100%;
          }
        }

        /* Scrollbar Styling */
        .sidebar-nav::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: rgba(99, 102, 241, 0.1);
          border-radius: 3px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(99, 102, 241, 0.6) 0%, rgba(139, 92, 246, 0.6) 100%);
          border-radius: 3px;
          transition: background 0.3s ease;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(99, 102, 241, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%);
        }

        /* Animation for collapsed state */
        .elegant-sidebar.collapsed .nav-label,
        .elegant-sidebar.collapsed .logo-text,
        .elegant-sidebar.collapsed .collapse-text {
          opacity: 0;
          transform: translateX(15px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .elegant-sidebar:not(.collapsed) .nav-label,
        .elegant-sidebar:not(.collapsed) .logo-text,
        .elegant-sidebar:not(.collapsed) .collapse-text {
          opacity: 1;
          transform: translateX(0);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Pulse animation for logo */
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 4px 8px rgba(99, 102, 241, 0.3));
          }
          50% {
            transform: scale(1.05);
            filter: drop-shadow(0 6px 12px rgba(99, 102, 241, 0.5));
          }
        }

        /* Glow effect for active items */
        .nav-link.active::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
          border-radius: 18px;
          z-index: -1;
          opacity: 0.6;
          animation: glow 2s ease-in-out infinite alternate;
        }

        @keyframes glow {
          from {
            opacity: 0.6;
            transform: scale(1);
          }
          to {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }

        /* Mobile Overlay */
        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.3s ease-out;
        }

        /* Mobile Menu Button */
        .mobile-menu-btn {
          display: none;
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1001;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 12px 16px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
          transition: all 0.3s ease;
          font-size: 18px;
          font-weight: bold;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-menu-btn:active {
          transform: scale(0.95);
        }

        .mobile-menu-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block;
          }
        }
      `}</style>
      </div>
    </>
  );
};

export default ElegantSidebar;
