/**
 * الصفحة الرئيسية المحسنة - مقسمة إلى مكونات منفصلة
 * Enhanced Main Page - Split into Separate Components
 */

import React, { useState, useEffect } from 'react';
import { LandingPage } from '../components/pages/landing';
import HomeContent from './mainapp/HomeContent';

export default function Home() {
  const [showLandingPage, setShowLandingPage] = useState(true);
  
  useEffect(() => {
    // إظهار صفحة الترحيب دائماً عند الدخول للموقع
    // تم تعديل المنطق ليعرض صفحة الترحيب في كل مرة
    setShowLandingPage(true);
  }, []);

  const handleSkipLanding = () => {
    setShowLandingPage(false);
    try {
      localStorage.setItem('hasVisited', 'true');
      localStorage.setItem('skipLandingPage', 'true');
      localStorage.setItem('lastVisitDate', new Date().toISOString());
      localStorage.setItem('start_on_stages', '1');
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  };

  if (showLandingPage) {
    return <LandingPage onSkip={handleSkipLanding} />;
  }

  return <HomeContent onShowLandingPage={() => setShowLandingPage(true)} />;
}