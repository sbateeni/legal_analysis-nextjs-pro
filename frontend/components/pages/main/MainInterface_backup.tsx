// Main interface component for the legal analysis application
// This file contains the core functionality for legal case analysis

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { mapApiErrorToMessage, extractApiError } from '@utils/errors';
import { saveApiKey, loadApiKey, addCase, getAllCases, updateCase, LegalCase } from '@utils/db';
import { isMobile } from '@utils/crypto';
import { useTheme } from '../../../contexts/ThemeContext';
import { exportResultsToPDF, exportResultsToDocx } from '@utils/export';
import { loadExportPreferences } from '@utils/exportSettings';
import { Button } from '../../UI';
import CollabPanel from '../../CollabPanel';
import stagesDef from '../../../stages';
import type { StageDetails } from '../../../types/analysis';

// BeforeInstallPromptEvent interface
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Load stages dynamically from stages definition with fixed order
const STAGES = Object.keys(stagesDef).sort((a, b) => {
  const da = (stagesDef as Record<string, StageDetails>)[a]?.order ?? 9999;
  const db = (stagesDef as Record<string, StageDetails>)[b]?.order ?? 9999;
  return da - db;
});

const FINAL_STAGE = 'المرحلة الثالثة عشرة: العريضة القانونية النهائية';
const ALL_STAGES = [...STAGES, FINAL_STAGE];

type PartyRole = 'المشتكي' | 'المشتكى عليه' | 'المدعي' | 'المدعى عليه';

const MainInterface: React.FC = () => {
  const { theme, darkMode } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [caseNameInput, setCaseNameInput] = useState('');
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'stages' | 'results'>('input');
  const [mounted, setMounted] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Stage management states
  const [mainText, setMainText] = useState('');
  const [stageResults, setStageResults] = useState<(string|null)[]>(() => Array(ALL_STAGES.length).fill(null));
  const [stageLoading, setStageLoading] = useState<boolean[]>(() => Array(ALL_STAGES.length).fill(false));
  const [stageErrors, setStageErrors] = useState<(string|null)[]>(() => Array(ALL_STAGES.length).fill(null));
  const [stageShowResult, setStageShowResult] = useState<boolean[]>(() => Array(ALL_STAGES.length).fill(false));
  const [partyRole, setPartyRole] = useState<PartyRole | ''>('');
  const [preferredModel, setPreferredModel] = useState<string>('gemini-1.5-flash');
  const [caseType, setCaseType] = useState<string>('عام');
  const [stageGating, setStageGating] = useState<boolean>(true);
  const [showDeadlines, setShowDeadlines] = useState<boolean>(true);
  const [selectedStageForCollab, setSelectedStageForCollab] = useState<string | null>(null);
  const collabRef = useRef<HTMLDivElement | null>(null);

  // Auto analysis states
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(false);
  const [currentAnalyzingStage, setCurrentAnalyzingStage] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisError, setAnalysisError] = useState('');

  // Component initialization and setup
  useEffect(() => {
    setMounted(true);
    
    // Load saved case type from localStorage
    try {
      const savedCaseType = localStorage.getItem('selected_case_type');
      if (savedCaseType) setCaseType(savedCaseType);
    } catch {}

    // Load API key from database
    loadApiKey().then(val => {
      if (val) setApiKey(val);
    });

    // Load app settings and preferences
    (async () => {
      const [{ loadAppSettings }, { dbBridge }] = await Promise.all([
        import('@utils/appSettings'),
        import('@utils/db.bridge')
      ]);
      const s = await loadAppSettings();
      setPreferredModel(s.preferredModel || 'gemini-1.5-flash');
      
      try {
        await dbBridge.init();
        const [p1,p2,p3,p4] = await Promise.all([
          dbBridge.getPreference('default_case_type'),
          dbBridge.getPreference('default_party_role'),
          dbBridge.getPreference('stage_gating_enabled'),
          dbBridge.getPreference('show_deadlines_enabled'),
        ]);
        if (p1) setCaseType(p1);
        if (p2) setPartyRole((p2 as PartyRole) || '');
        if (p3) setStageGating(p3 === '1');
        if (p4) setShowDeadlines(p4 === '1');
      } catch {}
    })();

    // Handle PWA installation
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false);
    }

    // Screen size monitoring
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Additional setup effects
  useEffect(() => {
    try {
      const start = localStorage.getItem('start_on_stages');
      if (start === '1') {
        setActiveTab('stages');
        localStorage.removeItem('start_on_stages');
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('selected_case_type', caseType); } catch {}
  }, [caseType]);

  useEffect(() => {
    if (apiKey) saveApiKey(apiKey);
  }, [apiKey]);

  // Install app handler
  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
      }
    }
  };

  // New case handler
  const handleNewCase = () => {
    setMainText('');
    setCaseNameInput('');
    setStageResults(Array(ALL_STAGES.length).fill(null));
    setStageLoading(Array(ALL_STAGES.length).fill(false));
    setStageErrors(Array(ALL_STAGES.length).fill(null));
    setStageShowResult(Array(ALL_STAGES.length).fill(false));
    setPartyRole('');
    setActiveTab('input');
  };

  // Core analysis functions and UI rendering would continue here...
  // This is a simplified version for easier maintenance

  if (!mounted) {
    return null;
  }

  return (
    <div style={{
      fontFamily: 'Tajawal, Arial, sans-serif',
      direction: 'rtl',
      minHeight: '100vh',
      background: theme.background,
      color: theme.text,
      padding: 0,
      margin: 0,
      transition: 'all 0.3s ease',
    }}>
      <main style={{
        maxWidth: 800,
        width: '100%',
        margin: '0 auto',
        padding: isMobile() ? '1rem 0.5rem' : '2rem 1rem',
      }}>
        {/* API Key warning */}
        {!apiKey && (
          <div style={{
            background: '#fffbe6',
            color: '#b7791f',
            border: '1px solid #f6ad55',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 16,
            boxShadow: '0 1px 6px #b7791f22',
            fontWeight: 700,
            textAlign: 'center'
          }}>
            لم يتم إعداد مفتاح Gemini API بعد. انتقل إلى <Link href="/settings" style={{color: theme.accent, textDecoration:'underline'}}>الإعدادات</Link> لإعداده.
          </div>
        )}

        {/* Welcome message */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          border: '1px solid #667eea',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 16,
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          <div style={{fontSize: '18px', marginBottom: '8px'}}>
            🎉 مرحباً بك في منصة التحليل القانوني الذكية!
          </div>
          <div style={{fontSize: '14px', opacity: 0.9}}>
            منصة مجانية للتحليل القانوني المدعوم بالذكاء الاصطناعي
          </div>
        </div>

        {/* Action buttons */}
        <div style={{display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', marginBottom:16}}>
          <button onClick={handleNewCase} style={{
            background: 'rgba(99, 102, 241, 0.1)', 
            color: theme.accent2, 
            border: `1px solid ${theme.accent2}`, 
            borderRadius: 8,
            padding: isSmallScreen ? '8px 16px' : '6px 14px', 
            fontWeight: 700, 
            fontSize: isSmallScreen ? 14 : 16,
            cursor: 'pointer', 
            boxShadow: `0 1px 4px ${theme.shadow}`, 
            letterSpacing: 1, 
            transition: 'all 0.2s',
          }}>
            🆕 قضية جديدة
          </button>
          
          <Link href="/chat" style={{
            background: 'transparent', 
            color: theme.accent2, 
            border: `1px solid ${theme.accent2}`, 
            borderRadius: 8,
            padding: isSmallScreen ? '8px 16px' : '6px 14px', 
            fontWeight: 700, 
            fontSize: isSmallScreen ? 14 : 16,
            textDecoration: 'none', 
            boxShadow: `0 1px 4px ${theme.shadow}`, 
            letterSpacing: 1, 
            transition: 'all 0.2s',
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 6
          }}>
            💬 المحادثة
          </Link>

          <Link href="/cases" style={{
            background: 'rgba(212, 175, 55, 0.1)', 
            color: '#D4AF37', 
            border: '1px solid #D4AF37', 
            borderRadius: 8,
            padding: isSmallScreen ? '8px 16px' : '6px 14px', 
            fontWeight: 700, 
            fontSize: isSmallScreen ? 14 : 16,
            textDecoration: 'none', 
            boxShadow: '0 1px 4px rgba(212, 175, 55, 0.2)', 
            letterSpacing: 1, 
            transition: 'all 0.2s',
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 6
          }}>
            ⚖️ مراحل التحليل
          </Link>

          {showInstallPrompt && (
            <button onClick={handleInstallApp} style={{
              background: 'rgba(16, 185, 129, 0.1)', 
              color: '#0f766e', 
              border: '1px solid #99f6e4', 
              borderRadius: 8,
              padding: isSmallScreen ? '8px 16px' : '6px 14px', 
              fontWeight: 700, 
              fontSize: isSmallScreen ? 14 : 16,
              cursor: 'pointer', 
              boxShadow: '0 1px 4px #0002', 
              letterSpacing: 1, 
              transition: 'all 0.2s',
            }}>
              📱 تثبيت التطبيق
            </button>
          )}
        </div>

        {/* Case type selection */}
        <div style={{
          background: theme.card,
          borderRadius: 12,
          boxShadow: `0 2px 10px ${theme.shadow}`,
          padding: 12,
          marginBottom: 16,
          border: `1px solid ${theme.border}`
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{fontWeight:700, color: theme.accent2}}>نوع القضية:</span>
            {['عام','ميراث','أحوال شخصية','تجاري','جنائي','عمل','عقاري','إداري','إيجارات'].map(t => (
              <button key={t}
                onClick={() => setCaseType(t)}
                style={{
                  background: caseType === t ? theme.accent : 'transparent',
                  color: caseType === t ? '#fff' : theme.text,
                  border: `1.5px solid ${theme.input}`,
                  borderRadius: 10,
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >{t}</button>
            ))}
          </div>
        </div>

        {/* Tab system would be implemented here */}
        <div style={{
          background: theme.card,
          borderRadius: 16,
          boxShadow: `0 4px 20px ${theme.shadow}`,
          marginBottom: 24,
          border: `1.5px solid ${theme.border}`,
          overflow: 'hidden'
        }}>
          {/* Header with Palestinian Legal styling */}
          <div style={{
            background: 'linear-gradient(90deg, #CE1126 0%, #007A3D 50%, #D4AF37 100%)',
            padding: '16px 24px',
            color: '#fff',
            textAlign: 'center'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 900,
              fontFamily: "'Amiri', 'Times New Roman', serif",
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              ⚖️ منصة التحليل القانوني الفلسطينية
            </h2>
            <p style={{
              margin: '8px 0 0 0',
              fontSize: '14px',
              opacity: 0.9
            }}>
              نظام ذكي متقدم لتحليل القضايا القانونية باستخدام الذكاء الاصطناعي
            </p>
          </div>

          {/* Content */}
          <div style={{
            padding: '2rem',
            textAlign: 'center'
          }}>
            {/* Feature Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                background: 'rgba(212, 175, 55, 0.1)',
                border: '2px solid #D4AF37',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
                <h4 style={{ color: '#D4AF37', margin: '0 0 8px 0', fontWeight: 700 }}>تحليل 12 مرحلة</h4>
                <p style={{ fontSize: '13px', color: theme.text, margin: 0 }}>
                  تحليل شامل للقضية عبر 12 مرحلة مترابطة
                </p>
              </div>
              
              <div style={{
                background: 'rgba(0, 122, 61, 0.1)',
                border: '2px solid #007A3D',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤖</div>
                <h4 style={{ color: '#007A3D', margin: '0 0 8px 0', fontWeight: 700 }}>ذكاء اصطناعي</h4>
                <p style={{ fontSize: '13px', color: theme.text, margin: 0 }}>
                  مدعوم بـ Google Gemini للحصول على نتائج دقيقة
                </p>
              </div>
              
              <div style={{
                background: 'rgba(206, 17, 38, 0.1)',
                border: '2px solid #CE1126',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🇵🇸</div>
                <h4 style={{ color: '#CE1126', margin: '0 0 8px 0', fontWeight: 700 }}>قانون فلسطيني</h4>
                <p style={{ fontSize: '13px', color: theme.text, margin: 0 }}>
                  مخصص للنظام القانوني الفلسطيني بشكل كامل
                </p>
              </div>
            </div>

            <h3 style={{
              color: theme.accent,
              marginBottom: '16px',
              fontFamily: "'Amiri', serif"
            }}>
              الوصول إلى مراحل التحليل:
            </h3>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '16px'
            }}>
              <Link href="/cases" style={{
                background: '#D4AF37',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                transition: 'all 0.2s'
              }}>
                ⚖️ عرض جميع القضايا
              </Link>
              
              <button 
                onClick={() => window.location.href = '/cases'}
                style={{
                  background: '#007A3D',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 122, 61, 0.3)',
                  transition: 'all 0.2s'
                }}
              >
                📁 إنشاء قضية جديدة
              </button>
            </div>
            
            <p style={{
              color: theme.textSecondary || '#6b7280',
              fontSize: '14px',
              lineHeight: 1.6
            }}>
              اضغط على "عرض جميع القضايا" للوصول إلى مراحل التحليل المتقدمة
              <br />
              أو ابدأ قضية جديدة لتحليلها عبر 12 مرحلة ذكية
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainInterface;